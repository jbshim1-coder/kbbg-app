// 외부 블로그 3개 자동 포스팅 스크립트
// 사용법: node scripts/auto-blog-external.mjs [사이트ID]
// 예시: node scripts/auto-blog-external.mjs kskindaily
// cron으로 매일 실행: 사이트별로 다른 시간대에 실행

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";
import { pingSitemaps, notifyGoogleIndexing } from "./google-index-notify.mjs";
import { insertInternalLinks } from "./lib/internal-links.mjs";

// 사이트별 주제 동적 import
const siteId = process.argv[2];
if (!siteId) {
  console.error("Usage: node auto-blog-external.mjs <siteId>");
  console.error("  siteId: kskindaily | dailyhallyuwave | koreatravel365");
  process.exit(1);
}

// 환경변수
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY || "";

if (!ANTHROPIC_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing env vars");
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 사이트별 설정
const SITE_CONFIG = {
  kskindaily: {
    name: "K Skin Daily",
    domain: "https://kskindaily.com",
    topicsFile: "./topics-kskindaily.mjs",
    context: "You are a K-beauty and Korean skincare expert blogger for K Skin Daily.",
    cta: "Discover the best Korean beauty clinics with AI-powered recommendations at KBBG (kbeautybuyersguide.com).",
    imageCategory: "health",
  },
  dailyhallyuwave: {
    name: "Daily Hallyu Wave",
    domain: "https://dailyhallyuwave.com",
    topicsFile: "./topics-dailyhallyuwave.mjs",
    context: "You are a Korean culture expert blogger for Daily Hallyu Wave, covering K-pop, K-drama, K-food, and Korean lifestyle.",
    cta: "Planning a trip to Korea? Find the best beauty clinics with AI at KBBG (kbeautybuyersguide.com).",
    imageCategory: "people",
  },
  koreatravel365: {
    name: "Korea Travel 365",
    domain: "https://koreatravel365.com",
    topicsFile: "./topics-koreatravel365.mjs",
    context: "You are a Korea travel and medical tourism expert blogger for Korea Travel 365.",
    cta: "Looking for trusted Korean clinics? Get AI-powered recommendations at KBBG (kbeautybuyersguide.com).",
    imageCategory: "travel",
  },
};

const config = SITE_CONFIG[siteId];
if (!config) {
  console.error(`Unknown site: ${siteId}`);
  process.exit(1);
}

// 사이트별 기본 해시태그 (AI 파싱 실패 시 fallback)
function getFallbackHashtags(site) {
  const map = {
    kskindaily: ["#KSkinDaily", "#KBeauty", "#KoreanSkincareRoutine", "#KBeautyGuide", "#KoreanSkincare2026", "#SkincareKorea"],
    dailyhallyuwave: ["#DailyHallyuWave", "#KPop", "#HallyuCulture", "#KoreanEntertainment", "#KPopNews2026", "#KDrama"],
    koreatravel365: ["#KoreaTravel365", "#SeoulGuide", "#KoreaTravelTips", "#VisitKorea2026", "#SeoulTravel", "#KoreaTrip"],
  };
  return map[site] || ["#KBeauty", "#Korea", "#KoreanCulture", "#VisitKorea2026"];
}

function getBrandTag(site) {
  const map = { kskindaily: "#KSkinDaily", dailyhallyuwave: "#DailyHallyuWave", koreatravel365: "#KoreaTravel365" };
  return map[site] || "#KBeauty";
}

// 주제 로드
const { TOPICS } = await import(config.topicsFile);

// AI 브리핑이 오늘 생성한 사이트별 주제 로드
let AI_TOPICS_TODAY = [];
const AI_BRIEF_FILE = new URL("./ai-brief-topics.json", import.meta.url).pathname;
if (existsSync(AI_BRIEF_FILE)) {
  try {
    const brief = JSON.parse(readFileSync(AI_BRIEF_FILE, "utf-8"));
    const today = new Date().toISOString().slice(0, 10);
    if (brief.date === today && Array.isArray(brief[siteId])) {
      AI_TOPICS_TODAY = brief[siteId];
      console.log(`AI 브리핑 주제 로드 (${siteId}): ${AI_TOPICS_TODAY.length}개`);
    }
  } catch {
    // 파싱 실패 무시
  }
}

// ─── Pixabay → Supabase Storage 업로드 ──────────────────────────────
async function fetchAndUploadImages(keyword, slug) {
  if (!PIXABAY_API_KEY) return [];
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
        `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${q}&image_type=photo&orientation=horizontal&per_page=20&safesearch=true&category=${config.imageCategory || "health"}`
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
      const imgRes = await fetch(img.webformatURL);
      const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
      const fileName = `blog/${siteId}/${slug}-${i + 1}.jpg`;

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

// ─── Claude API 글 생성 ─────────────────────────────────────────────
async function generateArticle(topic) {
  const prompt = `${config.context}
Write a blog article about: "${topic.keyword}"

RULES:
- Write in HTML format (use <h2>, <h3>, <p>, <ul>, <li>, <strong> tags)
- Length: 1500+ words, comprehensive and informative
- Include 3 FAQ sections with <h3> questions and <p> answers
- NEVER mention specific hospital/clinic names in price comparisons
- Use average price RANGES only (e.g., "$800-$1,500")
- Include practical tips and actionable advice
- Natural, helpful tone — not salesy
- At the end, naturally mention: "${config.cta}"
- Do NOT include any images or image tags

FORMATTING (very important for readability):
- Add <br/> between paragraphs for spacing
- Keep paragraphs SHORT (2-3 sentences max per <p>)
- Use <h2> for major sections, <h3> for subsections
- Add a blank line (empty <p>&nbsp;</p>) between major sections
- Use <ul> bullet lists to break up dense text
- Use <strong> to highlight key numbers and important terms
- Add a <hr/> divider before the FAQ section
- Mark 3 places in the content with <!--IMAGE--> where images should be inserted

Respond with ONLY a JSON object (no markdown wrapping):
{
  "title_en": "Curiosity-driven, click-worthy English title (under 60 chars, see TITLE RULES below)",
  "content_en": "<h2>...</h2><p>...</p>...",
  "excerpt_en": "2-sentence summary in English",
  "hashtags": ["#SiteBrandTag", "...1 brand tag", "#TopicLocation", "...3-4 mid-competition tags", "#NicheLongTail2026", "...2-3 long-tail tags"],
  "tags": ["skincare", "korea", "...3-5 tags"]
}

TITLE RULES (CRITICAL for click-through rate):
- NEVER use boring "Complete Guide" or "Ultimate Guide" patterns
- Use ONE of these curiosity-triggering formulas (rotate randomly):
  1. Number + Unexpected: "5 K-Pop Skincare Secrets That Actually Work (Backed by Dermatologists)"
  2. VS/Comparison: "Korean Sunscreen vs Japanese: The Difference Nobody Talks About"
  3. Story hook: "I Tried the 10-Step Korean Routine for 30 Days — Here's What Happened"
  4. Secret/Reveal: "Why Korean Skin Looks Glass-Like (It's Not Just Genetics)"
  5. Myth-busting: "The Korean Skincare Myth That's Ruining Your Skin"
  6. Controversial: "Is the Korean 10-Step Routine Actually Necessary?"
  7. Trending: "The 2026 K-Beauty Ingredient That's Replacing Retinol"
  8. FOMO: "3 Korean Products Selling Out Worldwide Right Now"
- Title MUST create an information gap — reader needs to click to learn more
- Include the main keyword naturally but make it irresistible

HASHTAG RULES (VERY IMPORTANT):
- The FIRST hashtag MUST be the site brand tag: ${getBrandTag(siteId)}
- Total 8-10 hashtags for maximum search visibility
- Mix competition levels: 1 brand + 3-4 medium + 3-4 niche/long-tail
- Medium tags: combine topic + location or category (e.g. #KoreanSkincareRoutine, #SeoulFoodGuide, #KPopConcert2026)
- Niche tags: specific, searchable, include year or detail (e.g. #TWICEWorldTour2026, #HongdaeCafeHopping, #KBeautyForDrySkin)
- NEVER use only generic tags — every tag must be something a real person would search
- Include at least 2 trending or timely tags relevant to current events`;

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
    // JSON 파싱 실패 시 content_en에서 HTML만 추출
    const titleMatch = jsonStr.match(/"title_en"\s*:\s*"([^"]+)"/);
    const contentMatch = jsonStr.match(/"content_en"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"excerpt|"\s*})/);
    return {
      title_en: titleMatch ? titleMatch[1] : topic.keyword,
      content_en: contentMatch ? contentMatch[1].replace(/\\"/g, '"').replace(/\\n/g, "\n") : `<h2>${topic.keyword}</h2><p>Guide coming soon.</p>`,
      excerpt_en: `A comprehensive guide to ${topic.keyword}.`,
      hashtags: getFallbackHashtags(siteId),
      tags: ["korea", "beauty", "guide"],
    };
  }
}

// ─── 다국어 번역 ─────────────────────────────────────────────────────
async function translateContent(contentEn, locale) {
  const langNames = {
    zh: "Simplified Chinese", ja: "Japanese", vi: "Vietnamese",
    th: "Thai", ru: "Russian", mn: "Mongolian",
  };
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    messages: [{
      role: "user",
      content: `Translate this HTML blog content to ${langNames[locale]}.
Keep all HTML tags intact. Localize naturally — don't just translate literally.
Add locally relevant context where appropriate.
Respond with ONLY the translated HTML.

${contentEn}`,
    }],
  });
  return response.content[0].text.trim();
}

async function translateTitle(titleEn, locale) {
  const langNames = {
    zh: "Simplified Chinese", ja: "Japanese", vi: "Vietnamese",
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

// ─── 메인 실행 ──────────────────────────────────────────────────────
async function main() {
  console.log(`[${new Date().toISOString()}] ${config.name} 자동 포스팅 시작`);

  // 오늘 이미 게시한 글 확인
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("site", siteId)
    .gte("published_at", `${today}T00:00:00`)
    .lte("published_at", `${today}T23:59:59`);

  if (existing && existing.length > 0) {
    console.log("오늘 이미 게시됨:", existing[0].slug);
    return;
  }

  // 사용된 주제 확인
  const { data: usedPosts } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("site", siteId);
  const usedSlugs = new Set((usedPosts || []).map((p) => p.slug));

  const toSlug = kw => `${siteId}-${kw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")}`;

  // AI 주제(오늘) 70% 우선, 나머지는 기존 주제 풀
  const availableAi = AI_TOPICS_TODAY.filter(t => !usedSlugs.has(toSlug(t.keyword)));
  const useAi = availableAi.length > 0 && Math.random() < 0.7;
  const candidatePool = useAi ? availableAi : TOPICS;

  const availableTopic = candidatePool.find((t) => !usedSlugs.has(toSlug(t.keyword)));

  if (!availableTopic) {
    console.log("모든 주제 소진됨");
    return;
  }

  const slug = toSlug(availableTopic.keyword);
  console.log(`주제: ${availableTopic.keyword} (${slug})`);

  // 1. 글 생성
  console.log("1/4 글 생성 중...");
  const article = await generateArticle(availableTopic);

  // 2. 다국어 번역 (병렬, 부분 실패 허용)
  console.log("2/4 다국어 번역 중...");
  const langCodes = ["zh", "ja", "vi", "th", "ru", "mn"];
  const [titleSettled, contentSettled] = await Promise.all([
    Promise.allSettled(langCodes.map((l) => translateTitle(article.title_en, l))),
    Promise.allSettled(langCodes.map((l) => translateContent(article.content_en, l))),
  ]);

  const titles = {};
  const contents = {};
  langCodes.forEach((lang, i) => {
    titles[`title_${lang}`] = titleSettled[i].status === "fulfilled" ? titleSettled[i].value : "";
    contents[`content_${lang}`] = contentSettled[i].status === "fulfilled" ? contentSettled[i].value : "";
    if (titleSettled[i].status === "rejected") console.log(`⚠️ title_${lang} 번역 실패:`, titleSettled[i].reason?.message);
    if (contentSettled[i].status === "rejected") console.log(`⚠️ content_${lang} 번역 실패:`, contentSettled[i].reason?.message);
  });

  // 3. 이미지
  console.log("3/4 이미지 업로드 중...");
  const images = await fetchAndUploadImages(availableTopic.keyword, slug);

  // 본문에 이미지 삽입
  let contentWithImages = article.content_en;
  let imgIdx = 0;
  contentWithImages = contentWithImages.replace(/<!--IMAGE-->/g, () => {
    if (imgIdx < images.length) {
      const img = images[imgIdx++];
      return `<div style="margin:24px 0"><img src="${img.url}" alt="${img.alt}" style="width:100%;border-radius:12px;max-height:400px;object-fit:cover" loading="lazy"/></div>`;
    }
    return "";
  });
  if (imgIdx === 0 && images.length > 0) {
    contentWithImages = `<div style="margin:0 0 24px"><img src="${images[0].url}" alt="${images[0].alt}" style="width:100%;border-radius:12px;max-height:400px;object-fit:cover" loading="lazy"/></div>` + contentWithImages;
  }

  // 내부 링크 삽입 (Supabase 저장 전)
  console.log("내부 링크 삽입 중...");
  contentWithImages = await insertInternalLinks(contentWithImages, slug, siteId, supabase);

  // 퀴즈 CTA 삽입
  contentWithImages += `\n<div style="margin:48px 0 24px;padding:28px 24px;background:#0a0a1a;border:1px solid #1d3a5f;border-radius:16px;text-align:center">
  <p style="color:#6ea8fe;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px">K-POP QUIZ</p>
  <p style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 8px">✨ Which K-Pop Idol Are You?</p>
  <p style="color:#8a8a9a;font-size:14px;margin:0 0 20px">10 questions · 20 idols · BTS, BLACKPINK, IVE & more</p>
  <a href="https://kbeautybuyersguide.com/en/quiz" style="display:inline-block;background:#0071e3;color:#ffffff;padding:13px 30px;border-radius:50px;font-weight:600;text-decoration:none;font-size:15px">Find Your Idol Match →</a>
</div>`;

  // 4. 저장
  console.log("4/4 저장 중...");
  const postData = {
    slug,
    site: siteId,
    category: availableTopic.category,
    title_en: article.title_en,
    title_ko: "",
    ...titles,
    content_en: contentWithImages,
    content_ko: "",
    // 번역 콘텐츠에도 이미지 삽입 (마커 교체 + fallback으로 h2 뒤 삽입)
    ...Object.fromEntries(Object.entries(contents).map(([key, val]) => {
      let c = val;
      let ii = 0;
      c = c.replace(/<!--IMAGE-->/g, () => {
        if (ii < images.length) {
          const img = images[ii++];
          return `<div style="margin:24px 0"><img src="${img.url}" alt="${img.alt}" style="width:100%;border-radius:12px;max-height:400px;object-fit:cover" loading="lazy"/></div>`;
        }
        return "";
      });
      if (ii === 0 && images.length > 0) {
        const heroImg = images[0];
        const heroTag = `<div style="margin:24px 0"><img src="${heroImg.url}" alt="${heroImg.alt}" style="width:100%;border-radius:12px;max-height:400px;object-fit:cover" loading="lazy"/></div>`;
        c = c.replace(/<\/h2>/, `</h2>${heroTag}`);
      }
      c += `\n<div style="margin:48px 0 24px;padding:28px 24px;background:#0a0a1a;border:1px solid #1d3a5f;border-radius:16px;text-align:center"><p style="color:#6ea8fe;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px">K-POP QUIZ</p><p style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 8px">✨ Which K-Pop Idol Are You?</p><p style="color:#8a8a9a;font-size:14px;margin:0 0 20px">10 questions · 20 idols · BTS, BLACKPINK, IVE &amp; more</p><a href="https://kbeautybuyersguide.com/en/quiz" style="display:inline-block;background:#0071e3;color:#ffffff;padding:13px 30px;border-radius:50px;font-weight:600;text-decoration:none;font-size:15px">Find Your Idol Match →</a></div>`;
      return [key, c];
    })),
    excerpt_en: article.excerpt_en,
    excerpt_ko: "",
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

  console.log(`✅ ${config.name} 게시 완료: "${article.title_en}"`);
  console.log(`   URL: ${config.domain}/${slug}`);

  // Google에 새 URL 알림 (사이트맵 ping + Indexing API)
  const postUrl = `${config.domain}/${slug}`;
  await pingSitemaps(siteId);
  await notifyGoogleIndexing(postUrl);
}

main().catch((err) => {
  console.error("에러:", err.message);
  process.exit(1);
});
