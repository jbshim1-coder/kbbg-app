// AMP 블로그 포스트 라우트 핸들러
// URL: /amp/blog/[slug]
// 목적: Google Discover 노출 및 모바일 빠른 로딩을 위한 AMP HTML 반환

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://kbeautybuyersguide.com";
const SITE_NAME = "K-Beauty Buyers Guide";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

// img 태그를 amp-img로 변환 (AMP 필수 규칙)
function convertImagesToAmp(html: string): string {
  return html.replace(
    /<img([^>]*?)src="([^"]*?)"([^>]*?)(?:\/)?>/gi,
    (match, before, src, after) => {
      // alt 속성 추출
      const altMatch = (before + after).match(/alt="([^"]*?)"/i);
      const alt = altMatch ? altMatch[1] : "";
      // 기본 크기 지정 (AMP는 명시적 width/height 필수)
      return `<amp-img src="${src}" alt="${alt}" width="800" height="450" layout="responsive"></amp-img>`;
    }
  );
}

// AMP에서 허용되지 않는 HTML 제거 및 변환
function sanitizeForAmp(html: string): string {
  // script 태그 제거
  let result = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  // style 태그 제거 (인라인 style 속성은 유지)
  result = result.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  // on* 이벤트 핸들러 제거
  result = result.replace(/\s+on\w+="[^"]*"/gi, "");
  // img → amp-img 변환
  result = convertImagesToAmp(result);
  // iframe 제거 (AMP는 amp-iframe 사용 필요, 복잡하므로 제거)
  result = result.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  return result;
}

// 날짜 포맷 (YYYY년 MM월 DD일 형식)
function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// 카테고리 레이블 매핑
const CATEGORY_LABELS: Record<string, string> = {
  guide: "Procedure Guide",
  cosmetics: "K-Beauty Rankings",
  event: "Clinic Events",
  faq: "FAQ",
  compare: "Cost Comparison",
  ingredient: "Ingredient Analysis",
  tips: "Medical Tourism Tips",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Supabase에서 포스트 조회
  const { data: post } = await getSupabase()
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .eq("site", "kbbg")
    .single();

  if (!post) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const title = post.title_en || "";
  const description = post.excerpt_en || title;
  const rawContent = post.content_en || "<p>Content not available.</p>";
  const ampContent = sanitizeForAmp(rawContent);
  const catLabel = CATEGORY_LABELS[post.category] || post.category;
  const publishedDate = formatDate(post.published_at);
  const canonicalUrl = `${BASE_URL}/en/blog/${slug}`;
  const ampUrl = `${BASE_URL}/amp/blog/${slug}`;
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

  // Article 구조화 데이터 (JSON-LD)
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: { "@type": "Organization", name: "KBBG", url: BASE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
        width: 200,
        height: 60,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": ampUrl },
    ...(post.image_url
      ? {
          image: {
            "@type": "ImageObject",
            url: post.image_url,
            width: 1200,
            height: 630,
          },
        }
      : {}),
  };

  // amp-analytics 블록 (GA4 — GA ID가 있을 때만 포함)
  const analyticsBlock = gaId
    ? `
  <amp-analytics type="gtag" data-credentials="include">
    <script type="application/json">
    {
      "vars": {
        "gtag_id": "${gaId}",
        "config": {
          "${gaId}": { "groups": "default" }
        }
      }
    }
    </script>
  </amp-analytics>`
    : "";

  // 대표 이미지 블록
  const heroImageBlock = post.image_url
    ? `<div class="hero-image">
    <amp-img
      src="${post.image_url}"
      alt="${post.image_alt || title}"
      width="1200"
      height="630"
      layout="responsive"
    ></amp-img>
  </div>`
    : "";

  // 해시태그 블록
  const hashtagsBlock =
    post.hashtags && post.hashtags.length > 0
      ? `<div class="hashtags">
    ${post.hashtags.map((tag: string) => `<span class="tag">${tag}</span>`).join("")}
  </div>`
      : "";

  // AMP HTML 전체 문서 생성
  const ampHtml = `<!doctype html>
<html amp lang="en">
<head>
  <meta charset="utf-8">
  <title>${title} — KBBG Blog</title>
  <link rel="canonical" href="${canonicalUrl}">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <meta name="description" content="${description.replace(/"/g, "&quot;")}">

  <!-- AMP 필수 보일러플레이트 -->
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
  <noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>

  <script async src="https://cdn.ampproject.org/v0.js"></script>
  ${gaId ? '<script async custom-element="amp-analytics" src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"></script>' : ""}

  <!-- 구조화 데이터 (Article 스키마) -->
  <script type="application/ld+json">${JSON.stringify(articleSchema)}</script>

  <!-- AMP 커스텀 스타일 (외부 CSS 불허용 — 최대 75KB) -->
  <style amp-custom>
    /* 기본 리셋 및 타이포그래피 */
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 16px;
      line-height: 1.7;
      color: #374151;
      background: #fafaf9;
    }

    /* 헤더 */
    .site-header {
      background: #ffffff;
      border-bottom: 1px solid #e7e5e4;
      padding: 12px 16px;
    }

    .site-header a {
      text-decoration: none;
      color: #1d1d1f;
      font-weight: 700;
      font-size: 15px;
      letter-spacing: -0.02em;
    }

    .site-header .tagline {
      font-size: 11px;
      color: #9ca3af;
      font-weight: 400;
      margin-left: 6px;
    }

    /* 포스트 헤더 */
    .post-header {
      background: #ffffff;
      border-bottom: 1px solid #e7e5e4;
      padding: 24px 16px;
    }

    .breadcrumb {
      font-size: 12px;
      color: #9ca3af;
      margin-bottom: 12px;
    }

    .breadcrumb a { color: #9ca3af; text-decoration: none; }
    .breadcrumb span { margin: 0 4px; }

    .category-badge {
      display: inline-block;
      padding: 3px 10px;
      background: #eff6ff;
      color: #1d4ed8;
      font-size: 11px;
      font-weight: 500;
      border-radius: 9999px;
      margin-bottom: 10px;
    }

    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #111827;
      line-height: 1.35;
      margin-bottom: 8px;
    }

    .post-meta {
      font-size: 12px;
      color: #9ca3af;
    }

    /* 본문 영역 */
    .content-wrapper {
      max-width: 680px;
      margin: 0 auto;
      padding: 16px;
    }

    /* 대표 이미지 */
    .hero-image {
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 16px;
      background: #e7e5e4;
    }

    /* 본문 카드 */
    .post-body {
      background: #ffffff;
      border-radius: 16px;
      padding: 20px 16px;
      margin-bottom: 16px;
      border: 1px solid #e7e5e4;
    }

    /* 본문 타이포그래피 */
    .post-body h2 {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin: 20px 0 10px;
    }

    .post-body h3 {
      font-size: 15px;
      font-weight: 600;
      color: #1f2937;
      margin: 16px 0 8px;
    }

    .post-body h4 {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin: 12px 0 6px;
    }

    .post-body p {
      margin-bottom: 14px;
      color: #374151;
      line-height: 1.75;
    }

    .post-body ul, .post-body ol {
      padding-left: 20px;
      margin-bottom: 14px;
    }

    .post-body li {
      margin-bottom: 6px;
      color: #374151;
    }

    .post-body a {
      color: #2563eb;
      text-decoration: none;
    }

    .post-body strong { color: #111827; }
    .post-body em { font-style: italic; }

    .post-body hr {
      border: none;
      border-top: 1px solid #e7e5e4;
      margin: 20px 0;
    }

    .post-body amp-img {
      border-radius: 10px;
      margin: 12px 0;
    }

    .post-body table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      margin-bottom: 14px;
    }

    .post-body th, .post-body td {
      border: 1px solid #e7e5e4;
      padding: 8px 10px;
      text-align: left;
    }

    .post-body th {
      background: #f9fafb;
      font-weight: 600;
    }

    /* 해시태그 */
    .hashtags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }

    .tag {
      font-size: 12px;
      color: #3b82f6;
    }

    /* CTA 섹션 */
    .cta-block {
      background: #1d1d1f;
      border-radius: 16px;
      padding: 24px 16px;
      text-align: center;
      margin-bottom: 16px;
    }

    .cta-block h2 {
      font-size: 17px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 8px;
    }

    .cta-block p {
      font-size: 12px;
      color: #94a3b8;
      margin-bottom: 16px;
    }

    .cta-button {
      display: inline-block;
      padding: 12px 24px;
      background: #ffffff;
      color: #1d1d1f;
      font-size: 13px;
      font-weight: 600;
      border-radius: 9999px;
      text-decoration: none;
    }

    /* 정식 버전 링크 */
    .full-version {
      background: #ffffff;
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 16px;
      border: 1px solid #e7e5e4;
      text-align: center;
    }

    .full-version p {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 8px;
    }

    .full-version a {
      color: #2563eb;
      font-size: 13px;
      text-decoration: none;
      font-weight: 500;
    }

    /* AI 생성 표시 */
    .ai-notice {
      text-align: center;
      font-size: 11px;
      color: #d1d5db;
      padding: 8px 0 24px;
    }

    /* 푸터 */
    .site-footer {
      background: #1d1d1f;
      padding: 20px 16px;
      text-align: center;
    }

    .site-footer p {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .site-footer a {
      color: #9ca3af;
      text-decoration: none;
    }
  </style>
</head>
<body>
  ${analyticsBlock}

  <!-- 사이트 헤더 -->
  <header class="site-header">
    <a href="${BASE_URL}/en">KBBG<span class="tagline">K-Beauty Buyers Guide</span></a>
  </header>

  <!-- 포스트 헤더 -->
  <section class="post-header">
    <div class="breadcrumb">
      <a href="${BASE_URL}/en">Home</a>
      <span>/</span>
      <a href="${BASE_URL}/en/blog">Blog</a>
      <span>/</span>
      <span>${catLabel}</span>
    </div>
    <div class="category-badge">${catLabel}</div>
    <h1>${title}</h1>
    <p class="post-meta">${publishedDate} · KBBG Editorial Team</p>
  </section>

  <!-- 본문 -->
  <div class="content-wrapper">
    ${heroImageBlock}

    <article class="post-body">
      ${ampContent}
    </article>

    ${hashtagsBlock}

    <!-- CTA: AI 추천 -->
    <div class="cta-block">
      <h2>Find Your Perfect Clinic</h2>
      <p>Get personalized AI recommendations based on verified data</p>
      <a href="${BASE_URL}/en/ai-search" class="cta-button">Get AI Recommendation</a>
    </div>

    <!-- 정식 버전으로 이동 링크 -->
    <div class="full-version">
      <p>Reading the AMP version. For the full experience:</p>
      <a href="${canonicalUrl}">View Full Article →</a>
    </div>

    <p class="ai-notice">This content was created with the assistance of AI.</p>
  </div>

  <!-- 사이트 푸터 -->
  <footer class="site-footer">
    <p><a href="${BASE_URL}">${SITE_NAME}</a></p>
    <p>© ${new Date().getFullYear()} KBBG. All rights reserved.</p>
  </footer>
</body>
</html>`;

  return new NextResponse(ampHtml, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // AMP 페이지 캐싱 허용 (Google AMP Cache)
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
