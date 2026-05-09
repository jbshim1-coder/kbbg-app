// Medium 자동 교차게시 스크립트
// 새 블로그 글 → Medium에 자동 발행 (canonical URL로 SEO 보호)
// 사용법: node scripts/auto-medium.mjs
// cron: 매일 1회 auto-blog 실행 후 30분 뒤

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTED_FILE = join(__dirname, ".medium-posted.json");

const MEDIUM_TOKEN = process.env.MEDIUM_ACCESS_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!MEDIUM_TOKEN) {
  console.error("Missing: MEDIUM_ACCESS_TOKEN");
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const MEDIUM_API = "https://api.medium.com/v1";

const SITE_CONFIG = {
  kbbg: {
    domain: "https://kbeautybuyersguide.com",
    tags: ["KBeauty", "KoreanBeauty", "MedicalTourism", "Korea", "PlasticSurgery"],
  },
  kskindaily: {
    domain: "https://kskindaily.com",
    tags: ["KBeauty", "KoreanSkincare", "Skincare", "GlassSkin", "KPopBeauty"],
  },
  dailyhallyuwave: {
    domain: "https://dailyhallyuwave.com",
    tags: ["KPop", "KDrama", "Hallyu", "BTS", "Korea"],
  },
  koreatravel365: {
    domain: "https://koreatravel365.com",
    tags: ["KoreaTravel", "Seoul", "KFood", "TravelKorea", "MedicalTourism"],
  },
};

// 게시 완료 추적
function loadPosted() {
  if (!existsSync(POSTED_FILE)) return {};
  try { return JSON.parse(readFileSync(POSTED_FILE, "utf8")); }
  catch { return {}; }
}

function markPosted(slug, mediumUrl) {
  const data = loadPosted();
  data[slug] = { mediumUrl, postedAt: new Date().toISOString() };
  writeFileSync(POSTED_FILE, JSON.stringify(data, null, 2));
}

// Medium 사용자 ID 조회
async function getMediumUserId() {
  const res = await fetch(`${MEDIUM_API}/me`, {
    headers: { Authorization: `Bearer ${MEDIUM_TOKEN}`, "Content-Type": "application/json" },
  });
  const { data } = await res.json();
  if (!data?.id) throw new Error("Medium 사용자 정보를 가져올 수 없습니다");
  return data.id;
}

// Medium 게시
async function postToMedium(userId, { title, content, canonicalUrl, tags }) {
  const res = await fetch(`${MEDIUM_API}/users/${userId}/posts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${MEDIUM_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      contentFormat: "html",
      content,
      canonicalUrl,
      publishStatus: "public",
      tags: tags.slice(0, 5),
    }),
  });
  return res.json();
}

// HTML 마지막에 원본 링크 CTA 추가
function buildMediumContent(post, canonicalUrl) {
  const cta = `
<hr>
<p><em>Originally published at <a href="${canonicalUrl}">${canonicalUrl}</a></em></p>
<p>🇰🇷 <strong>Planning a Korea beauty trip?</strong> Get AI-powered clinic recommendations at
<a href="https://kbeautybuyersguide.com">K-Beauty Buyers Guide (KBBG)</a>.</p>
`;
  return (post.content_en || "") + cta;
}

async function main() {
  console.log(`\n=== Medium Auto Post — ${new Date().toISOString()} ===`);

  const posted = loadPosted();
  let userId;
  try {
    userId = await getMediumUserId();
    console.log(`Medium 사용자 ID: ${userId}`);
  } catch (err) {
    console.error("Medium 인증 실패:", err.message);
    process.exit(1);
  }

  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
  let totalPosted = 0;

  for (const [site, config] of Object.entries(SITE_CONFIG)) {
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, title_en, excerpt_en, content_en, tags, hashtags, image_url")
      .eq("site", site)
      .eq("is_published", true)
      .gte("published_at", twoDaysAgo)
      .order("published_at", { ascending: false })
      .limit(3);

    const newPosts = (posts || []).filter((p) => !posted[p.slug]);
    if (newPosts.length === 0) {
      console.log(`[${site}] 새 글 없음`);
      continue;
    }

    console.log(`[${site}] ${newPosts.length}개 게시 예정`);

    for (const post of newPosts) {
      const canonicalUrl = `${config.domain}/en/blog/${post.slug}`;
      const content = buildMediumContent(post, canonicalUrl);

      // 태그: 사이트 기본 태그 + 글 태그 혼합 (최대 5개)
      const postTags = (post.hashtags || post.tags || [])
        .map((t) => t.replace(/^#/, "").replace(/\s+/g, ""))
        .slice(0, 2);
      const tags = [...new Set([...config.tags, ...postTags])].slice(0, 5);

      console.log(`[${site}] 게시 중: ${post.title_en}`);
      try {
        const result = await postToMedium(userId, {
          title: post.title_en,
          content,
          canonicalUrl,
          tags,
        });

        if (result.data?.url) {
          console.log(`  -> Medium URL: ${result.data.url}`);
          markPosted(post.slug, result.data.url);
          totalPosted++;
        } else {
          console.error(`  -> 실패:`, JSON.stringify(result));
        }
      } catch (err) {
        console.error(`  -> 오류: ${err.message}`);
      }

      // Rate limit 방지
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log(`\n=== 완료. ${totalPosted}개 Medium 게시됨 ===\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
