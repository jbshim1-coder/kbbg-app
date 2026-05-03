// 자동 블로그 포스팅 스크립트
// cron으로 매일 실행: Claude API로 글 생성 → Pixabay 이미지 → Supabase 저장
// 사용법: node scripts/auto-blog.mjs

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { existsSync } from "fs";
import { TOPICS } from "./blog-topics.mjs";
import { pingSitemaps, notifyGoogleIndexing } from "./google-index-notify.mjs";
import { insertInternalLinks } from "./lib/internal-links.mjs";

// PAA 주제 파일이 있으면 동적으로 로드 (없으면 무시)
// blog-topics-paa.mjs가 생성된 경우에만 활성화됨
let PAA_TOPICS = [];
const PAA_FILE = new URL("./blog-topics-paa.mjs", import.meta.url).pathname;
if (existsSync(PAA_FILE)) {
  try {
    const { PAA_TOPICS: loaded } = await import("./blog-topics-paa.mjs");
    PAA_TOPICS = loaded || [];
    console.log(`PAA 주제 로드: ${PAA_TOPICS.length}개`);
  } catch {
    // PAA 파일 로드 실패 시 기본 주제만 사용
  }
}

// 주제 풀 구성: PAA가 있으면 30% 확률로 PAA 주제 선택
function buildTopicPool(usedSlugs) {
  const available = TOPICS.filter(t => {
    const slug = t.keyword.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    return !usedSlugs.has(slug);
  });

  if (PAA_TOPICS.length === 0) return available;

  const availablePaa = PAA_TOPICS.filter(t => {
    const slug = t.keyword.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    return !usedSlugs.has(slug);
  });

  // PAA 주제가 있으면 30% 확률로 PAA 풀에서 선택
  const usePaa = availablePaa.length > 0 && Math.random() < 0.3;
  return usePaa ? availablePaa : available;
}

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
    // 3개 서로 다른 검색어로 각각 다른 이미지 풀에서 가져오기
    const words = keyword.split(" ").filter((w) => w.length > 2);
    const queries = [
      words.slice(0, 2).join(" ") + " beauty",
      words.slice(1, 3).join(" ") + " Korea",
      words.slice(0, 1).join(" ") + " skincare clinic",
    ];

    const BLOCK_TAGS = ["animal", "animals", "cat", "dog", "bird", "insect", "fly", "bug", "pet", "wildlife", "spider", "snake", "horse", "cow", "pig", "rabbit", "fish", "deer", "bear", "monkey", "lion", "tiger", "elephant", "mouse", "rat", "frog", "lizard", "turtle", "whale", "dolphin", "zoo", "farm", "surgery", "blood", "wound", "operation", "scalpel", "needle", "injection", "syringe", "hospital bed", "autopsy", "gore", "anatomy", "dissection", "corpse"];

    const usedIds = new Set();
    const selected = [];

    for (const searchQ of queries) {
      if (selected.length >= 3) break;
      const q = encodeURIComponent(searchQ);
      const res = await fetch(
        `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${q}&image_type=photo&orientation=horizontal&per_page=20&safesearch=true&category=health`
      );
      const data = await res.json();
      if (!data.hits) continue;

      const filtered = data.hits.filter((img) => {
        const tags = img.tags.toLowerCase();
        return !BLOCK_TAGS.some((t) => tags.includes(t)) && !usedIds.has(img.id);
      });

      if (filtered.length > 0) {
        const pick = filtered[Math.floor(Math.random() * Math.min(filtered.length, 5))];
        usedIds.add(pick.id);
        selected.push(pick);
      }
    }
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
  "hashtags": ["#KBBG", "...1 brand tag (always #KBBG)", "#ProcedureNameKorea", "...3-4 mid-competition tags (10K-500K posts, combine procedure+location)", "#SpecificLongTail2026", "...2-3 niche/long-tail tags (include year, specific detail, or question format)"],
  "tags": ["skincare", "korea", "...3-5 tags"]
}

HASHTAG RULES (VERY IMPORTANT):
- ALWAYS include #KBBG as the first hashtag (brand tag)
- Total 8-10 hashtags for maximum reach
- Mix competition levels: 1 brand + 3-4 medium + 3-4 niche/long-tail
- Medium tags: combine topic + "Korea" or "Seoul" (e.g. #RhinoplastyKorea, #KoreanSkinClinic)
- Niche tags: add year, specific detail, or format as question (e.g. #NoseJobKorea2026, #CheapPlasticSurgerySeoul)
- NEVER use only generic tags like #KBeauty #Korea alone
- Include at least 2 tags that someone would actually SEARCH for (think Google/Instagram search intent)`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonStr = text.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  try {
    return JSON.parse(jsonStr);
  } catch {
    const titleMatch = jsonStr.match(/"title_en"\s*:\s*"([^"]+)"/);
    const contentMatch = jsonStr.match(/"content_en"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"excerpt|"\s*})/);
    return {
      title_en: titleMatch ? titleMatch[1] : topic.keyword,
      content_en: contentMatch ? contentMatch[1].replace(/\\"/g, '"').replace(/\\n/g, "\n") : `<h2>${topic.keyword}</h2><p>Guide coming soon.</p>`,
      excerpt_en: `A comprehensive guide to ${topic.keyword}.`,
      hashtags: ["#KBBG", "#KBeauty", "#KoreanMedicalTourism", "#KoreaClinicGuide", "#PlasticSurgeryKorea", "#KBeautyGuide2026"],
      tags: ["korea", "beauty", "medical tourism"],
      _fallback: true,
    };
  }
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

// ─── 제목 번역 (Haiku로 빠르게) ──────────────────────────────────────
async function translateTitle(titleEn, locale) {
  const langNames = {
    ko: "Korean", zh: "Simplified Chinese", ja: "Japanese", vi: "Vietnamese",
    th: "Thai", ru: "Russian", mn: "Mongolian",
  };
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [{
      role: "user",
      content: `Translate this blog title to ${langNames[locale]}. Respond with ONLY the translated title, nothing else.\n\n${titleEn}`,
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
    .eq("site", "kbbg")
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

  // 사용 안 된 주제 선택 (PAA 있으면 30% 확률로 PAA 주제 사용)
  const pool = buildTopicPool(usedSlugs);
  const availableTopic = pool[0];

  if (!availableTopic) {
    console.log("모든 주제가 사용되었습니다. 주제 DB를 추가해주세요.");
    return;
  }

  const slug = availableTopic.keyword.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  console.log(`주제 선택: ${availableTopic.keyword} (${slug})`);

  // 1. Claude API로 글 생성
  console.log("1/4 글 생성 중...");
  const article = await generateArticle(availableTopic);

  // 2. 다국어 번역 (제목 + 본문, 한국어 포함 7개 언어 병렬, 부분 실패 허용)
  console.log("2/4 다국어 번역 중...");
  const langCodes = ["ko", "zh", "ja", "vi", "th", "ru", "mn"];
  const [titleSettled, contentSettled] = await Promise.all([
    Promise.allSettled(langCodes.map((l) => translateTitle(article.title_en, l))),
    Promise.allSettled(langCodes.map((l) => l === "ko" ? translateToKorean(article.content_en) : translateContent(article.content_en, l))),
  ]);

  const titles = {};
  const translations = {};
  langCodes.forEach((lang, i) => {
    titles[`title_${lang}`] = titleSettled[i].status === "fulfilled" ? titleSettled[i].value : "";
    translations[`content_${lang}`] = contentSettled[i].status === "fulfilled" ? contentSettled[i].value : "";
    if (titleSettled[i].status === "rejected") console.log(`⚠️ title_${lang} 번역 실패:`, titleSettled[i].reason?.message);
    if (contentSettled[i].status === "rejected") console.log(`⚠️ content_${lang} 번역 실패:`, contentSettled[i].reason?.message);
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

  // 내부 링크 삽입 (Supabase 저장 전)
  console.log("내부 링크 삽입 중...");
  contentWithImages = await insertInternalLinks(contentWithImages, slug, "kbbg", supabase);

  // Supabase에 저장
  const postData = {
    slug,
    site: "kbbg",
    category: availableTopic.category,
    title_en: article.title_en,
    ...titles,
    content_en: contentWithImages,
    // 번역 콘텐츠에도 이미지 삽입 (영어 본문과 동일한 이미지 태그를 h2 뒤에 삽입)
    ...Object.fromEntries(Object.entries(translations).map(([key, val]) => {
      let c = val;
      // <!--IMAGE--> 마커가 남아있으면 교체
      let ii = 0;
      c = c.replace(/<!--IMAGE-->/g, () => {
        if (ii < images.length) {
          const img = images[ii++];
          return `<div style="margin:24px 0"><img src="${img.url}" alt="${img.alt}" style="width:100%;border-radius:12px;max-height:400px;object-fit:cover" loading="lazy"/></div>`;
        }
        return "";
      });
      // 마커가 없었으면 첫 번째 h2 뒤에 대표 이미지 삽입
      if (ii === 0 && images.length > 0) {
        const heroImg = images[0];
        const heroTag = `<div style="margin:24px 0"><img src="${heroImg.url}" alt="${heroImg.alt}" style="width:100%;border-radius:12px;max-height:400px;object-fit:cover" loading="lazy"/></div>`;
        c = c.replace(/<\/h2>/, `</h2>${heroTag}`);
      }
      return [key, c];
    })),
    excerpt_en: article.excerpt_en,
    excerpt_ko: article.excerpt_ko || (titles.title_ko ? `${titles.title_ko}에 대한 가이드입니다.` : ""),
    image_url: images.length > 0 ? images[0].url : null,
    image_alt: images.length > 0 ? images[0].alt : null,
    tags: article.tags || [],
    hashtags: article.hashtags || [],
    is_published: !article._fallback,
    published_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("blog_posts").insert(postData);
  if (error) {
    console.error("저장 실패:", error.message);
    process.exit(1);
  }

  console.log(`✅ 게시 완료: "${article.title_en}" (${slug})`);
  console.log(`   URL: https://kbeautybuyersguide.com/en/blog/${slug}`);

  // Google에 새 URL 알림 (사이트맵 ping + Indexing API)
  const postUrl = `https://kbeautybuyersguide.com/en/blog/${slug}`;
  await pingSitemaps("kbbg");
  await notifyGoogleIndexing(postUrl);
}

main().catch((err) => {
  console.error("에러:", err.message);
  process.exit(1);
});
