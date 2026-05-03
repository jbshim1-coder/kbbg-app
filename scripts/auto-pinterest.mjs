// Pinterest 자동 핀 생성 스크립트
// 블로그 글(Supabase blog_posts) → Pinterest 핀 자동 생성
// 핀 완료 추적: scripts/.pinned.json (로컬 파일)
// cron으로 매일 실행: node scripts/auto-pinterest.mjs
// 특정 사이트만: node scripts/auto-pinterest.mjs kbbg
// 기존 전체 밀어넣기: node scripts/auto-pinterest.mjs --all

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PINNED_FILE = join(__dirname, ".pinned.json");

// ─── 환경변수 ─────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const PINTEREST_ACCESS_TOKEN = process.env.PINTEREST_ACCESS_TOKEN;
const PINTEREST_REFRESH_TOKEN = process.env.PINTEREST_REFRESH_TOKEN;
const PINTEREST_APP_ID = process.env.PINTEREST_APP_ID;
const PINTEREST_APP_SECRET = process.env.PINTEREST_APP_SECRET;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!PINTEREST_ACCESS_TOKEN) {
  console.error("Missing: PINTEREST_ACCESS_TOKEN (run setup first)");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const PINTEREST_API = "https://api.pinterest.com/v5";

// ─── 보드 매핑 (사이트별 Pinterest 보드 ID) ──────────────────
const BOARD_MAP = {
  kbbg: process.env.PINTEREST_BOARD_KBBG || "",
  kskindaily: process.env.PINTEREST_BOARD_KSKINDAILY || "",
  dailyhallyuwave: process.env.PINTEREST_BOARD_DAILYHALLYUWAVE || "",
  koreatravel365: process.env.PINTEREST_BOARD_KOREATRAVEL365 || "",
};

// 사이트별 URL
const SITE_URL = {
  kbbg: "https://kbeautybuyersguide.com",
  kskindaily: "https://kskindaily.com",
  dailyhallyuwave: "https://dailyhallyuwave.com",
  koreatravel365: "https://koreatravel365.com",
};

// ─── 핀 완료 추적 (로컬 JSON) ────────────────────────────
function loadPinned() {
  if (!existsSync(PINNED_FILE)) return {};
  try {
    return JSON.parse(readFileSync(PINNED_FILE, "utf8"));
  } catch {
    return {};
  }
}

function savePinned(data) {
  writeFileSync(PINNED_FILE, JSON.stringify(data, null, 2));
}

function isPinned(slug) {
  const data = loadPinned();
  return !!data[slug];
}

function markPinned(slug, pinId) {
  const data = loadPinned();
  data[slug] = { pinId, pinnedAt: new Date().toISOString() };
  savePinned(data);
}

// ─── 토큰 자동 갱신 ──────────────────────────────────────
let accessToken = PINTEREST_ACCESS_TOKEN;

async function refreshAccessToken() {
  if (!PINTEREST_REFRESH_TOKEN || !PINTEREST_APP_ID || !PINTEREST_APP_SECRET) {
    console.log("Refresh token info missing — using existing access token");
    return false;
  }
  try {
    const credentials = Buffer.from(`${PINTEREST_APP_ID}:${PINTEREST_APP_SECRET}`).toString("base64");
    const res = await fetch(`${PINTEREST_API}/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: PINTEREST_REFRESH_TOKEN,
        scope: "pins:write,boards:read",
      }),
    });
    const data = await res.json();
    if (data.access_token) {
      accessToken = data.access_token;
      console.log("Access token refreshed successfully");
      // .env.local에 새 토큰 반영 (선택)
      return true;
    }
    console.error("Token refresh failed:", data);
    return false;
  } catch (err) {
    console.error("Token refresh error:", err.message);
    return false;
  }
}

// ─── Pinterest 핀 생성 ───────────────────────────────────
async function createPin({ boardId, title, description, link, imageUrl, altText }) {
  const body = {
    board_id: boardId,
    title: title.slice(0, 100),
    description: description.slice(0, 800),
    link,
    alt_text: (altText || title).slice(0, 500),
    media_source: {
      source_type: "image_url",
      url: imageUrl,
    },
  };

  const res = await fetch(`${PINTEREST_API}/pins`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  // 토큰 만료 시 자동 갱신 후 재시도
  if (res.status === 401) {
    console.log("Token expired — attempting refresh...");
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const retry = await fetch(`${PINTEREST_API}/pins`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      return retry.json();
    }
  }

  return res.json();
}

// ─── Supabase에서 블로그 글 가져오기 ─────────────────────
async function getPosts(site, allMode) {
  const query = supabase
    .from("blog_posts")
    .select("slug, title_en, excerpt_en, image_url, tags, hashtags, published_at")
    .eq("site", site)
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  // --all 모드가 아니면 최근 2일치만
  if (!allMode) {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    query.gte("published_at", twoDaysAgo);
  }

  const { data, error } = await query.limit(allMode ? 500 : 5);
  if (error) {
    console.error(`Query failed for ${site}:`, error.message);
    return [];
  }
  // 이미 핀된 것 제외
  return (data || []).filter((p) => !isPinned(p.slug));
}

// ─── Pinterest 최적화 설명 생성 ─────────────────────────
// Pinterest는 해시태그보다 자연어 키워드가 SEO에 더 효과적
// 설명 앞부분에 핵심 검색 키워드 배치 + 뒤에 해시태그 5개
function buildDescription(excerpt, hashtags, tags, site) {
  // 검색 키워드를 설명 앞에 자연스럽게 배치
  let desc = excerpt || "";

  // 사이트별 Pinterest 최적화 키워드 접두사
  const siteKeywords = {
    kbbg: "Korean plastic surgery guide | Medical tourism Korea | ",
    kskindaily: "Korean skincare routine | K-beauty products | ",
    koreatravel365: "Korea travel guide | Seoul tips | ",
    dailyhallyuwave: "K-pop news | Korean culture | ",
  };
  const prefix = siteKeywords[site] || "";
  desc = prefix + desc;

  // 해시태그: 최대 5개 (Pinterest는 5개가 최적)
  const pinterestTags = [];
  const brandTags = { kbbg: "#KBBG", kskindaily: "#KSkinDaily", koreatravel365: "#KoreaTravel365", dailyhallyuwave: "#DailyHallyuWave" };
  pinterestTags.push(brandTags[site] || "#KBeauty");

  if (hashtags && hashtags.length > 0) {
    // 롱테일 태그 우선 선택 (글자 수 긴 것 = 더 구체적)
    const sorted = [...hashtags].sort((a, b) => b.length - a.length);
    pinterestTags.push(...sorted.slice(0, 3));
  } else if (tags && tags.length > 0) {
    pinterestTags.push(...tags.slice(0, 3).map((t) => `#${t.replace(/\s+/g, "")}`));
  }
  pinterestTags.push("#Korea2026");

  const uniqueTags = [...new Set(pinterestTags)].slice(0, 5);
  desc += "\n\n" + uniqueTags.join(" ");
  return desc.trim().slice(0, 800);
}

// ─── 메인 실행 ───────────────────────────────────────────
async function main() {
  console.log(`\n=== Pinterest Auto Pin — ${new Date().toISOString()} ===`);

  const args = process.argv.slice(2);
  const allMode = args.includes("--all");
  const targetSite = args.find((a) => !a.startsWith("--"));
  const sites = targetSite ? [targetSite] : Object.keys(BOARD_MAP);

  let totalPinned = 0;

  for (const site of sites) {
    const boardId = BOARD_MAP[site];
    if (!boardId) {
      console.log(`[${site}] Board ID not set — skipping`);
      continue;
    }

    const siteUrl = SITE_URL[site] || "";
    console.log(`\n[${site}] Checking for new posts... (mode: ${allMode ? "ALL" : "recent"})`);

    const posts = await getPosts(site, allMode);
    if (posts.length === 0) {
      console.log(`[${site}] No new posts to pin`);
      continue;
    }

    console.log(`[${site}] Found ${posts.length} posts to pin`);

    for (const post of posts) {
      const link = `${siteUrl}/en/blog/${post.slug}`;
      const imageUrl = post.image_url;

      if (!imageUrl) {
        console.log(`[${site}] ${post.slug} — no image, skipping`);
        continue;
      }

      const description = buildDescription(post.excerpt_en, post.hashtags, post.tags, site);

      console.log(`[${site}] Pinning: ${post.title_en}`);
      try {
        const result = await createPin({
          boardId,
          title: post.title_en,
          description,
          link,
          imageUrl,
          altText: post.title_en,
        });

        if (result.id) {
          console.log(`  -> Pin created: ${result.id}`);
          markPinned(post.slug, result.id);
          totalPinned++;
        } else {
          console.error(`  -> Failed:`, JSON.stringify(result));
        }
      } catch (err) {
        console.error(`  -> Error: ${err.message}`);
      }

      // Pinterest rate limit 방지 (2초 대기)
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log(`\n=== Done. ${totalPinned} pins created. ===\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
