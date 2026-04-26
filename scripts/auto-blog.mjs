// 자동 블로그 포스팅 스크립트
// cron으로 매일 실행: Claude API로 글 생성 → Pixabay 이미지 → Supabase 저장
// 사용법: node scripts/auto-blog.mjs

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { TOPICS } from "./blog-topics.mjs";

// 환경변수
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY || ""; // https://pixabay.com/api/docs/ 에서 무료 발급

if (!ANTHROPIC_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing env vars: ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 주제는 blog-topics.mjs에서 import (365개, 1년치)

// ─── Pixabay 이미지 3개 가져와서 Supabase Storage에 업로드 ────────────
async function fetchAndUploadImages(keyword, slug) {
  if (!PIXABAY_API_KEY) {
    console.log("Pixabay API 키 없음 — 이미지 없이 진행");
    return [];
  }
  try {
    const q = encodeURIComponent(keyword.split(" ").slice(0, 3).join(" "));
    const res = await fetch(
      `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${q}&image_type=photo&orientation=horizontal&per_page=10&safesearch=true`
    );
    const data = await res.json();
    if (!data.hits || data.hits.length === 0) return [];

    // 상위 6개 중 랜덤 3개 선택
    const shuffled = data.hits.slice(0, 6).sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);
    const urls = [];

    for (let i = 0; i < selected.length; i++) {
      const img = selected[i];
      // 이미지 다운로드
      const imgRes = await fetch(img.webformatURL);
      const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
      const fileName = `blog/${slug}-${i + 1}.jpg`;

      // Supabase Storage에 업로드
      const { error } = await supabase.storage
        .from("image-hub")
        .upload(fileName, imgBuffer, { contentType: "image/jpeg", upsert: true });

      if (!error) {
        const { data: urlData } = supabase.storage.from("image-hub").getPublicUrl(fileName);
        urls.push({ url: urlData.publicUrl, alt: `${keyword} - image ${i + 1}` });
      }
    }
    return urls;
  } catch (e) {
    console.log("Image error:", e.message);
  }
  return [];
}

// ─── Claude API로 글 생성 ───────────────────────────────────────────
async function generateArticle(topic) {
  const prompt = `You are a K-beauty and Korean medical tourism expert blogger.
Write a blog article about: "${topic.keyword}"

RULES:
- Write in HTML format (use <h2>, <h3>, <p>, <ul>, <li>, <strong> tags)
- Length: 1500+ words, comprehensive and informative
- Include 3 FAQ sections with <h3> questions and <p> answers
- NEVER mention specific hospital/clinic names in price comparisons
- Use average price RANGES only (e.g., "$800-$1,500")
- Include practical tips and actionable advice
- Natural, helpful tone — not salesy
- At the end, mention "For personalized clinic recommendations, try KBBG's AI search tool"
- Do NOT include any images or image tags

FORMATTING (very important for readability):
- Add <br/> between paragraphs for spacing
- Keep paragraphs SHORT (2-3 sentences max per <p>)
- Use <h2> for major sections, <h3> for subsections
- Add a blank line (empty <p>&nbsp;</p>) between major sections
- Use <ul> bullet lists to break up dense text
- Use <strong> to highlight key numbers and important terms
- Add a <hr/> divider before the FAQ section
- Mark 3 places in the content with <!--IMAGE--> where images should be inserted (after intro, middle, before FAQ)

Respond with ONLY a JSON object (no markdown wrapping):
{
  "title_en": "English title (SEO optimized, under 60 chars)",
  "title_ko": "한국어 제목",
  "title_zh": "中文标题",
  "title_ja": "日本語タイトル",
  "title_vi": "Tiêu đề tiếng Việt",
  "title_th": "หัวข้อภาษาไทย",
  "title_ru": "Заголовок на русском",
  "title_mn": "Монгол гарчиг",
  "content_en": "<h2>...</h2><p>...</p>...",
  "excerpt_en": "2-sentence summary in English",
  "excerpt_ko": "한국어 2문장 요약",
  "hashtags": ["#KBeauty", "#KoreanSkincare", "...5-8 hashtags total"],
  "tags": ["skincare", "korea", "...3-5 tags"]
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].text.trim();
  // JSON 파싱 (```json 래핑 제거)
  const jsonStr = text.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(jsonStr);
}

// ─── 다국어 콘텐츠 번역 ───────────────────────────────────────────
async function translateContent(contentEn, locale) {
  const langNames = {
    zh: "Simplified Chinese", ja: "Japanese", vi: "Vietnamese",
    th: "Thai", ru: "Russian", mn: "Mongolian",
  };
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [{
      role: "user",
      content: `Translate this HTML blog content to ${langNames[locale]}.
Keep all HTML tags intact. Localize naturally — don't just translate literally.
For ${locale === "ja" ? "Japanese" : langNames[locale]} audience, add locally relevant context where appropriate (e.g., currency, visa info).
Respond with ONLY the translated HTML, no explanation.

${contentEn}`,
    }],
  });
  return response.content[0].text.trim();
}

// ─── 한국어 콘텐츠 생성 ───────────────────────────────────────────
async function translateToKorean(contentEn) {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [{
      role: "user",
      content: `Translate this HTML blog content to Korean (한국어).
Keep all HTML tags intact. Write naturally for Korean readers.
Respond with ONLY the translated HTML.

${contentEn}`,
    }],
  });
  return response.content[0].text.trim();
}

// ─── 메인 실행 ───────────────────────────────────────────────────
async function main() {
  console.log(`[${new Date().toISOString()}] 자동 블로그 포스팅 시작`);

  // 이미 오늘 게시한 글이 있는지 확인
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("slug")
    .gte("published_at", `${today}T00:00:00`)
    .lte("published_at", `${today}T23:59:59`);

  if (existing && existing.length > 0) {
    console.log("오늘 이미 게시된 글이 있습니다:", existing[0].slug);
    return;
  }

  // 이미 사용된 주제 확인
  const { data: usedPosts } = await supabase
    .from("blog_posts")
    .select("slug");
  const usedSlugs = new Set((usedPosts || []).map((p) => p.slug));

  // 사용 안 된 주제 선택
  const availableTopic = TOPICS.find((t) => {
    const slug = t.keyword.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    return !usedSlugs.has(slug);
  });

  if (!availableTopic) {
    console.log("모든 주제가 사용되었습니다. 주제 DB를 추가해주세요.");
    return;
  }

  const slug = availableTopic.keyword.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  console.log(`주제 선택: ${availableTopic.keyword} (${slug})`);

  // 1. Claude API로 글 생성
  console.log("1/4 글 생성 중...");
  const article = await generateArticle(availableTopic);

  // 2. 한국어 제외 — 외국인 전용 블로그 (한국어 포스팅 금지)
  console.log("2/4 한국어 건너뜀 (외국인 전용)");

  // 3. 나머지 언어 번역 (병렬)
  console.log("3/4 다국어 번역 중...");
  const translations = {};
  const langCodes = ["zh", "ja", "vi", "th", "ru", "mn"];
  const translationResults = await Promise.all(
    langCodes.map((lang) => translateContent(article.content_en, lang))
  );
  langCodes.forEach((lang, i) => {
    translations[`content_${lang}`] = translationResults[i];
  });

  // 4. Pixabay 이미지 3개 → Supabase Storage 업로드
  console.log("4/4 이미지 3개 업로드 중...");
  const images = await fetchAndUploadImages(availableTopic.keyword, slug);

  // 본문에 이미지 삽입 (<!--IMAGE--> 마커를 실제 img 태그로 교체)
  let contentWithImages = article.content_en;
  let imgIdx = 0;
  contentWithImages = contentWithImages.replace(/<!--IMAGE-->/g, () => {
    if (imgIdx < images.length) {
      const img = images[imgIdx++];
      return `<div style="margin:24px 0"><img src="${img.url}" alt="${img.alt}" style="width:100%;border-radius:12px;max-height:400px;object-fit:cover" loading="lazy"/></div>`;
    }
    return "";
  });
  // IMAGE 마커가 없으면 본문 앞에 대표 이미지 삽입
  if (imgIdx === 0 && images.length > 0) {
    const heroImg = images[0];
    contentWithImages = `<div style="margin:0 0 24px"><img src="${heroImg.url}" alt="${heroImg.alt}" style="width:100%;border-radius:12px;max-height:400px;object-fit:cover" loading="lazy"/></div>` + contentWithImages;
  }

  // Supabase에 저장
  const postData = {
    slug,
    category: availableTopic.category,
    title_en: article.title_en,
    title_ko: "", // 한국어 포스팅 금지
    title_zh: article.title_zh,
    title_ja: article.title_ja,
    title_vi: article.title_vi,
    title_th: article.title_th,
    title_ru: article.title_ru,
    title_mn: article.title_mn,
    content_en: contentWithImages,
    content_ko: "", // 한국어 포스팅 금지 — 외국인 전용
    ...translations,
    excerpt_en: article.excerpt_en,
    excerpt_ko: article.excerpt_ko,
    image_url: images.length > 0 ? images[0].url : null,
    image_alt: images.length > 0 ? images[0].alt : null,
    tags: article.tags || [],
    hashtags: article.hashtags || [],
    is_published: true,
    published_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("blog_posts").insert(postData);
  if (error) {
    console.error("저장 실패:", error.message);
    process.exit(1);
  }

  console.log(`✅ 게시 완료: "${article.title_en}" (${slug})`);
  console.log(`   URL: https://kbeautybuyersguide.com/en/blog/${slug}`);
}

main().catch((err) => {
  console.error("에러:", err.message);
  process.exit(1);
});
