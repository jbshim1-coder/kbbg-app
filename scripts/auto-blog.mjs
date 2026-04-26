// 자동 블로그 포스팅 스크립트
// cron으로 매일 실행: Claude API로 글 생성 → Pixabay 이미지 → Supabase 저장
// 사용법: node scripts/auto-blog.mjs

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

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

// ─── 주제 데이터베이스 ───────────────────────────────────────────────
const TOPICS = [
  // 시술 가이드 (월)
  { category: "guide", keyword: "rhinoplasty in Korea", ko: "한국 코성형 완벽 가이드" },
  { category: "guide", keyword: "double eyelid surgery Korea", ko: "한국 쌍꺼풀 수술 안내" },
  { category: "guide", keyword: "laser toning Korea", ko: "한국 레이저 토닝 가이드" },
  { category: "guide", keyword: "dental implant Korea cost", ko: "한국 임플란트 비용 가이드" },
  { category: "guide", keyword: "LASIK surgery Korea", ko: "한국 라식 수술 가이드" },
  { category: "guide", keyword: "facial contouring Korea", ko: "한국 윤곽 수술 가이드" },
  { category: "guide", keyword: "hair transplant Korea", ko: "한국 모발이식 가이드" },
  { category: "guide", keyword: "botox filler Korea", ko: "한국 보톡스 필러 가이드" },
  { category: "guide", keyword: "ultherapy Korea", ko: "한국 울쎄라 가이드" },
  { category: "guide", keyword: "liposuction Korea", ko: "한국 지방흡입 가이드" },
  { category: "guide", keyword: "acne treatment Korea dermatology", ko: "한국 여드름 치료 가이드" },
  { category: "guide", keyword: "teeth whitening Korea", ko: "한국 치아미백 가이드" },
  // 화장품 순위 (화)
  { category: "cosmetics", keyword: "best Korean sunscreen", ko: "한국 선크림 TOP 10" },
  { category: "cosmetics", keyword: "best Korean moisturizer", ko: "한국 수분크림 추천 순위" },
  { category: "cosmetics", keyword: "best Korean serum", ko: "한국 세럼 추천 TOP 10" },
  { category: "cosmetics", keyword: "best Korean cleanser", ko: "한국 클렌저 추천 순위" },
  { category: "cosmetics", keyword: "best Korean toner", ko: "한국 토너 추천 TOP 10" },
  { category: "cosmetics", keyword: "best Korean eye cream", ko: "한국 아이크림 추천 순위" },
  { category: "cosmetics", keyword: "best Korean sheet mask", ko: "한국 시트 마스크 TOP 10" },
  { category: "cosmetics", keyword: "best Korean lip product", ko: "한국 립 제품 추천 순위" },
  { category: "cosmetics", keyword: "best Korean retinol product", ko: "한국 레티놀 제품 TOP 10" },
  { category: "cosmetics", keyword: "Korean skincare for oily skin", ko: "지성피부 한국 화장품 추천" },
  { category: "cosmetics", keyword: "Korean skincare for dry skin", ko: "건성피부 한국 화장품 추천" },
  { category: "cosmetics", keyword: "Korean anti-aging skincare", ko: "한국 안티에이징 화장품 순위" },
  // FAQ (수)
  { category: "faq", keyword: "is plastic surgery safe in Korea for foreigners", ko: "외국인 한국 성형, 안전한가요?" },
  { category: "faq", keyword: "how to choose clinic in Korea", ko: "한국 클리닉 선택하는 법" },
  { category: "faq", keyword: "Korean dermatology vs Western", ko: "한국 피부과 vs 서양 피부과 차이" },
  { category: "faq", keyword: "recovery time Korean plastic surgery", ko: "한국 성형 회복기간 총정리" },
  { category: "faq", keyword: "do Korean clinics speak English", ko: "한국 병원 영어 가능한가요?" },
  { category: "faq", keyword: "Korean clinic consultation process", ko: "한국 클리닉 상담 과정 안내" },
  // 비용 비교 (금) — 병원명 노출 없이 평균 가격대만
  { category: "compare", keyword: "Korea vs Thailand plastic surgery cost", ko: "한국 vs 태국 성형 비용 비교" },
  { category: "compare", keyword: "Korea vs Turkey rhinoplasty cost", ko: "한국 vs 터키 코성형 비용 비교" },
  { category: "compare", keyword: "Korea vs Japan dermatology cost", ko: "한국 vs 일본 피부과 비용 비교" },
  { category: "compare", keyword: "Korea vs USA plastic surgery cost", ko: "한국 vs 미국 성형 비용 비교" },
  { category: "compare", keyword: "Korea dental treatment cost guide", ko: "한국 치과 치료 비용 가이드" },
  // 성분 분석 (토)
  { category: "ingredient", keyword: "niacinamide Korean skincare benefits", ko: "나이아신아마이드, 한국 화장품에 많은 이유" },
  { category: "ingredient", keyword: "snail mucin Korean skincare science", ko: "달팽이 점액 성분 과학적 효과" },
  { category: "ingredient", keyword: "centella asiatica Korean skincare", ko: "센텔라아시아티카 효능 분석" },
  { category: "ingredient", keyword: "hyaluronic acid Korean products", ko: "히알루론산 한국 제품 효과" },
  { category: "ingredient", keyword: "retinol Korean skincare guide", ko: "레티놀 한국 화장품 가이드" },
  // 의료관광 팁 (일)
  { category: "tips", keyword: "Korea medical tourism visa guide", ko: "한국 의료관광 비자 가이드" },
  { category: "tips", keyword: "Gangnam clinic area guide foreigners", ko: "강남 클리닉 지역 가이드" },
  { category: "tips", keyword: "Seoul medical tourism budget plan", ko: "서울 의료관광 예산 계획" },
  { category: "tips", keyword: "Korea clinic first visit checklist", ko: "한국 클리닉 첫 방문 체크리스트" },
  { category: "tips", keyword: "Korea medical tourism insurance guide", ko: "한국 의료관광 보험 가이드" },
  { category: "tips", keyword: "best time visit Korea beauty treatment", ko: "한국 뷰티 시술 최적 방문 시기" },
];

// ─── Pixabay 이미지 가져오기 ───────────────────────────────────────
async function fetchPixabayImage(keyword) {
  if (!PIXABAY_API_KEY) {
    console.log("Pixabay API 키 없음 — 이미지 없이 진행");
    return { url: null, alt: null };
  }
  try {
    const q = encodeURIComponent(keyword.split(" ").slice(0, 3).join(" "));
    const res = await fetch(
      `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${q}&image_type=photo&orientation=horizontal&per_page=5&safesearch=true`
    );
    const data = await res.json();
    if (data.hits && data.hits.length > 0) {
      const img = data.hits[Math.floor(Math.random() * Math.min(data.hits.length, 3))];
      return { url: img.webformatURL, alt: keyword };
    }
  } catch (e) {
    console.log("Pixabay error:", e.message);
  }
  return { url: null, alt: null };
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

  // 4. Pixabay 이미지
  console.log("4/4 이미지 검색 중...");
  const image = await fetchPixabayImage(availableTopic.keyword);

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
    content_en: article.content_en,
    content_ko: "", // 한국어 포스팅 금지 — 외국인 전용
    ...translations,
    excerpt_en: article.excerpt_en,
    excerpt_ko: article.excerpt_ko,
    image_url: image.url,
    image_alt: image.alt,
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
