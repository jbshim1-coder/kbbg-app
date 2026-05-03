// 트렌딩 키워드 수집 스크립트
// 매일 블로그 생성 전 cron으로 실행: node scripts/trending-keywords.mjs
// Google Trends RSS + Google Suggest를 조합해 한국 뷰티/의료관광 관련 트렌드 키워드 수집

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_FILE = join(__dirname, "trending-cache.json");

// Google Trends RSS 수집 대상 국가 (API 키 불필요)
const TRENDS_GEOS = ["US", "GB", "SG"];

// Google Suggest 검색어 목록
const SUGGEST_QUERIES = [
  "korean beauty 2026",
  "korean plastic surgery",
  "kpop 2026",
  "korea travel 2026",
  "korean skincare 2026",
  "k-beauty trends",
  "seoul medical tourism",
  "korean cosmetic surgery cost",
  "korea hair transplant",
  "korean anti aging treatment",
];

// 한국/K-뷰티/K-팝 관련 키워드 필터 패턴
const KOREA_PATTERNS = [
  /\bkorea\b/i, /\bkorean\b/i, /\bk-beauty\b/i, /\bkbeauty\b/i,
  /\bkpop\b/i, /\bk-pop\b/i, /\bseoul\b/i, /\bbusan\b/i,
  /\bk-drama\b/i, /\bkdrama\b/i, /\bskincare\b/i, /\bbbcream\b/i,
  /\bhydrogel\b/i, /\bsnail\b.*cream/i, /\brhinoplasty\b/i,
  /\bdouble eyelid\b/i, /\bv-line\b/i, /\bjawline\b/i, /\bfiller\b/i,
  /\bbotox\b/i, /\bskin clinic\b/i, /\bmedical tourism\b/i,
  /\bplastic surgery\b/i, /\bhair transplant\b/i,
];

// XML에서 텍스트 태그 값 추출 (간단한 파서)
function extractTags(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  const results = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    // CDATA 제거 후 HTML 엔티티 디코딩
    const text = match[1]
      .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();
    if (text) results.push(text);
  }
  return results;
}

// Google Trends RSS에서 트렌딩 항목 수집
async function fetchTrendsRss(geo) {
  const url = `https://trends.google.com/trending/rss?geo=${geo}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TrendBot/1.0)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();

    const titles = extractTags(xml, "title").slice(1); // 첫 번째는 피드 제목이므로 제외
    return titles.filter(Boolean);
  } catch (err) {
    console.log(`  Trends RSS (${geo}) 실패: ${err.message}`);
    return [];
  }
}

// Google Suggest API에서 자동완성 키워드 수집
async function fetchGoogleSuggest(query) {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TrendBot/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    // 응답 형식: [query, [suggestion1, suggestion2, ...]]
    return Array.isArray(json[1]) ? json[1] : [];
  } catch (err) {
    console.log(`  Suggest ("${query}") 실패: ${err.message}`);
    return [];
  }
}

// 키워드가 한국/K-뷰티 관련인지 확인
function isKoreaRelated(keyword) {
  return KOREA_PATTERNS.some((pattern) => pattern.test(keyword));
}

// 중복 제거 및 정규화
function deduplicateKeywords(keywords) {
  const seen = new Set();
  return keywords.filter((kw) => {
    const normalized = kw.toLowerCase().trim();
    if (seen.has(normalized) || normalized.length < 3) return false;
    seen.add(normalized);
    return true;
  });
}

async function main() {
  console.log(`[${new Date().toISOString()}] 트렌딩 키워드 수집 시작`);

  const allKeywords = [];

  // 1. Google Trends RSS 수집 (US, GB, SG 3개국 병렬 요청)
  console.log("1/2 Google Trends RSS 수집 중...");
  const trendResults = await Promise.all(
    TRENDS_GEOS.map(async (geo) => {
      const items = await fetchTrendsRss(geo);
      const filtered = items.filter(isKoreaRelated);
      console.log(`  ${geo}: ${items.length}개 중 한국 관련 ${filtered.length}개`);
      return filtered;
    })
  );
  trendResults.forEach((items) => allKeywords.push(...items));

  // 2. Google Suggest 수집 (순차 요청으로 rate limit 방지)
  console.log("2/2 Google Suggest 수집 중...");
  for (const query of SUGGEST_QUERIES) {
    const suggestions = await fetchGoogleSuggest(query);
    console.log(`  "${query}": ${suggestions.length}개 제안`);
    allKeywords.push(...suggestions);
    // 요청 간 짧은 딜레이 (rate limit 방지)
    await new Promise((r) => setTimeout(r, 300));
  }

  // 3. 중복 제거 및 정규화
  const unique = deduplicateKeywords(allKeywords);
  console.log(`\n총 ${allKeywords.length}개 수집 → 중복 제거 후 ${unique.length}개`);

  // 4. 캐시 파일에 저장
  const cache = {
    updatedAt: new Date().toISOString(),
    keywords: unique,
    count: unique.length,
  };

  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
  console.log(`\n캐시 저장 완료: ${CACHE_FILE}`);
  console.log("상위 10개 키워드 미리보기:");
  unique.slice(0, 10).forEach((kw, i) => console.log(`  ${i + 1}. ${kw}`));
}

main().catch((err) => {
  console.error("에러:", err.message);
  process.exit(1);
});
