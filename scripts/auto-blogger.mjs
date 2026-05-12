// Blogger 자동 교차 포스팅 — 새 포스트를 Blogger에 동시 게시
// cron에서 auto-blog.mjs 실행 후 자동 호출됨
// 단독 실행: node scripts/auto-blogger.mjs [siteId]
//   siteId: kbbg | kskindaily | dailyhallyuwave | koreatravel365 (미지정 시 전체)

import { OAuth2Client } from "google-auth-library";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const CLIENT_ID = process.env.BLOGGER_CLIENT_ID;
const CLIENT_SECRET = process.env.BLOGGER_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.BLOGGER_REFRESH_TOKEN;

// 사이트별 Blogger Blog ID 매핑
const BLOG_IDS = {
  kbbg:             process.env.BLOGGER_ID_KBBG,
  kskindaily:       process.env.BLOGGER_ID_KSKINDAILY,
  dailyhallyuwave:  process.env.BLOGGER_ID_HALLYU,
  koreatravel365:   process.env.BLOGGER_ID_KOREATRAVEL,
};

// 사이트별 원문 도메인
const SITE_DOMAINS = {
  kbbg:             "https://kbeautybuyersguide.com",
  kskindaily:       "https://kskindaily.com",
  dailyhallyuwave:  "https://dailyhallyuwave.com",
  koreatravel365:   "https://koreatravel365.com",
};

// OAuth2 액세스 토큰 발급
async function getAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) return null;
  const oauth2 = new OAuth2Client(CLIENT_ID, CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: REFRESH_TOKEN });
  const { token } = await oauth2.getAccessToken();
  return token;
}

// HTML에서 첫 500자 텍스트 추출 (요약용)
function extractExcerpt(html, maxLen = 500) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen) + "...";
}

// Blogger에 포스트 게시
async function postToBlogger(accessToken, blogId, post, siteId) {
  const domain = SITE_DOMAINS[siteId] || "";
  const postUrl = siteId === "kbbg"
    ? `${domain}/en/blog/${post.slug}`
    : `${domain}/en/${post.slug}`;

  const contentEn = post.content_en || "";
  const excerpt = post.excerpt_en || extractExcerpt(contentEn);

  // Blogger 본문: 요약 + 원문 링크
  const bloggerContent = `
<p>${excerpt}</p>
<hr/>
<p><strong>📖 원문 보기:</strong> <a href="${postUrl}" target="_blank" rel="noopener">${postUrl}</a></p>
<p><em>이 콘텐츠는 AI를 활용하여 제작되었습니다.</em></p>
`.trim();

  const res = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: post.title_en,
      content: bloggerContent,
      labels: [post.category, "K-Beauty", "Korea"].filter(Boolean),
    }),
  });

  const data = await res.json();
  if (res.ok) {
    console.log(`✅ Blogger 게시: ${post.slug} → ${data.url}`);
    return data.url;
  } else {
    console.log(`⚠️  Blogger 오류 (${post.slug}): ${data.error?.message}`);
    return null;
  }
}

// Supabase에 blogger_url 업데이트
async function markAsPosted(postId, bloggerUrl) {
  await sb.from("blog_posts").update({
    blogger_url: bloggerUrl,
    blogger_posted_at: new Date().toISOString(),
  }).eq("id", postId);
}

// 특정 사이트의 미게시 포스트 처리
async function processSite(siteId, accessToken) {
  const blogId = BLOG_IDS[siteId];
  if (!blogId) {
    console.log(`⏭  ${siteId}: BLOGGER_ID 미설정, 스킵`);
    return;
  }

  // blogger_url이 없는 최근 포스트 (최대 5개)
  const { data: posts } = await sb
    .from("blog_posts")
    .select("id, slug, title_en, content_en, excerpt_en, category")
    .eq("site", siteId)
    .eq("is_published", true)
    .is("blogger_url", null)
    .order("published_at", { ascending: false })
    .limit(5);

  if (!posts?.length) {
    console.log(`${siteId}: 새 포스트 없음`);
    return;
  }

  console.log(`${siteId}: ${posts.length}개 포스트 Blogger에 게시 중...`);
  for (const post of posts) {
    const url = await postToBlogger(accessToken, blogId, post, siteId);
    if (url) await markAsPosted(post.id, url);
    await new Promise(r => setTimeout(r, 1000)); // API rate limit 방지
  }
}

async function main() {
  if (!REFRESH_TOKEN) {
    console.log("Blogger 미설정 (BLOGGER_REFRESH_TOKEN 없음) — 스킵");
    return;
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.log("Blogger 토큰 발급 실패 — 스킵");
    return;
  }

  const targetSite = process.argv[2];
  const sites = targetSite
    ? [targetSite]
    : ["kbbg", "kskindaily", "dailyhallyuwave", "koreatravel365"];

  for (const siteId of sites) {
    await processSite(siteId, accessToken);
  }
}

main().catch(e => console.error("Blogger 오류:", e.message));
