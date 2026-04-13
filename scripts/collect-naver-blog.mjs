#!/usr/bin/env node
// 네이버 블로그 평판 수집 — 병원별 블로그 언급 수 + 감성 분석
// 실행: node scripts/collect-naver-blog.mjs [--limit 100]
// cron: 0 4 */14 * * cd /home/jbshi/kbbg-app && node scripts/collect-naver-blog.mjs

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NAVER_ID = process.env.NAVER_CLIENT_ID;
const NAVER_SECRET = process.env.NAVER_CLIENT_SECRET;

if (!SUPABASE_URL || !SUPABASE_KEY || !NAVER_ID || !NAVER_SECRET) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const NAVER_API = "https://openapi.naver.com/v1/search/blog.json";

// 긍정/부정 키워드 사전
const POSITIVE_KEYWORDS = [
  "만족", "추천", "친절", "꼼꼼", "자연스러", "깔끔", "좋았", "최고", "감사",
  "편안", "안심", "전문", "믿음", "결과 좋", "재방문", "성공", "대만족",
  "satisfied", "recommend", "great", "excellent", "professional", "natural",
];

const NEGATIVE_KEYWORDS = [
  "불만", "후회", "비추", "불친절", "부작용", "실패", "아프", "별로",
  "실망", "과잉", "불안", "재수술", "사기", "위험", "돈 아까",
  "regret", "bad", "painful", "scam", "disappointed", "avoid",
];

// --limit 파라미터 파싱
const limitArg = process.argv.find((a) => a.startsWith("--limit"));
const LIMIT = limitArg ? parseInt(process.argv[process.argv.indexOf(limitArg) + 1]) || 500 : 500;

// HTML 태그 제거
function stripHtml(str) {
  return str?.replace(/<[^>]*>/g, "") || "";
}

// 키워드 감성 분석
function analyzeSentiment(texts) {
  let positive = 0;
  let negative = 0;
  let total = texts.length;

  for (const text of texts) {
    const lower = text.toLowerCase();
    const hasPositive = POSITIVE_KEYWORDS.some((k) => lower.includes(k));
    const hasNegative = NEGATIVE_KEYWORDS.some((k) => lower.includes(k));

    if (hasPositive && !hasNegative) positive++;
    else if (hasNegative && !hasPositive) negative++;
    // 둘 다 있거나 둘 다 없으면 중립
  }

  return {
    positiveRatio: total > 0 ? Math.round((positive / total) * 100) : null,
    negativeRatio: total > 0 ? Math.round((negative / total) * 100) : null,
  };
}

// 네이버 블로그 검색 (광고 필터링 포함)
async function searchBlog(clinicName) {
  const query = `${clinicName} 후기 -협찬 -원고료 -지원받아 -체험단`;
  const url = `${NAVER_API}?query=${encodeURIComponent(query)}&display=10&sort=sim`;

  const res = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": NAVER_ID,
      "X-Naver-Client-Secret": NAVER_SECRET,
    },
  });

  if (!res.ok) return null;

  const data = await res.json();
  const items = data.items || [];
  const texts = items.map((item) =>
    stripHtml(item.title) + " " + stripHtml(item.description)
  );

  const sentiment = analyzeSentiment(texts);

  return {
    total: data.total || 0,
    positiveRatio: sentiment.positiveRatio,
    negativeRatio: sentiment.negativeRatio,
    query,
  };
}

async function main() {
  console.log(`\n=== 네이버 블로그 평판 수집 시작 (최대 ${LIMIT}개) ===\n`);

  // 활성 병원 조회 (분석 안 된 순 또는 14일 경과) — 페이징으로 전체 조회
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  let clinics = [];
  let offset = 0;
  const PAGE = 1000;
  while (clinics.length < LIMIT) {
    const { data } = await supabase
      .from("clinics")
      .select("id, name")
      .eq("is_active", true)
      .or(`naver_analyzed_at.is.null,naver_analyzed_at.lt.${twoWeeksAgo}`)
      .range(offset, offset + PAGE - 1);
    if (!data || data.length === 0) break;
    clinics.push(...data);
    offset += PAGE;
    if (data.length < PAGE) break;
  }
  clinics = clinics.slice(0, LIMIT);

  if (clinics.length === 0) {
    console.log("분석 대상 병원 없음");
    return;
  }
  console.log(`대상 병원: ${clinics.length}개\n`);

  let processed = 0;
  let errors = 0;

  for (const clinic of clinics) {
    try {
      const result = await searchBlog(clinic.name);
      if (!result) {
        errors++;
        continue;
      }

      // 평판 점수 계산: 언급 수(로그) × 긍정 비율
      const mentionScore = result.total > 0 ? Math.log10(result.total + 1) * 20 : 0;
      const sentimentBonus = result.positiveRatio ? (result.positiveRatio - 50) * 0.5 : 0;
      const reputationScore = Math.round((mentionScore + sentimentBonus) * 100) / 100;

      const { error } = await supabase
        .from("clinics")
        .update({
          naver_blog_mentions: result.total,
          naver_positive_ratio: result.positiveRatio,
          naver_reputation_score: Math.max(0, reputationScore),
          naver_analyzed_at: new Date().toISOString(),
          naver_query: result.query,
        })
        .eq("id", clinic.id);

      if (error) {
        console.error(`  실패 [${clinic.name}]: ${error.message}`);
        errors++;
      } else {
        processed++;
        if (processed % 50 === 0 || processed <= 10) {
          console.log(`  ✓ [${processed}] ${clinic.name}: ${result.total}건, 긍정 ${result.positiveRatio}%, 점수 ${reputationScore}`);
        }
      }

      // API rate limit (120ms — 일 25,000회 한도 고려)
      await new Promise((r) => setTimeout(r, 120));
    } catch (err) {
      console.error(`  에러 [${clinic.name}]: ${err.message}`);
      errors++;
    }
  }

  console.log(`\n=== 완료: ${processed}개 처리, ${errors}개 에러 ===\n`);
}

main().catch(console.error);
