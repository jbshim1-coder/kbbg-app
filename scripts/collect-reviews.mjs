#!/usr/bin/env node
// 병원 리뷰 수집 + 시술 키워드 분석 스크립트
// 사용법: node scripts/collect-reviews.mjs [--limit 50]
// 환경변수: GOOGLE_PLACES_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "@supabase/supabase-js";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!GOOGLE_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing env: GOOGLE_PLACES_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 시술 키워드 사전
const PROCEDURE_KEYWORDS = {
  eye_surgery: ["쌍수", "쌍꺼풀", "트임", "눈매교정", "눈밑", "눈성형", "앞트임", "뒤트임", "eye surgery", "double eyelid"],
  nose_surgery: ["코끝", "콧대", "비중격", "코수술", "코성형", "매부리", "nose job", "rhinoplasty"],
  facial_contour: ["윤곽", "양악", "사각턱", "광대", "턱끝", "v라인", "jaw", "contouring"],
  lifting: ["리프팅", "울쎄라", "써마지", "실리프팅", "lifting", "ulthera", "thermage"],
  skin: ["레이저", "보톡스", "필러", "여드름", "기미", "토닝", "botox", "filler", "laser"],
  dental: ["임플란트", "교정", "라미네이트", "충치", "치아", "implant", "braces", "dental"],
  eye_correction: ["라식", "라섹", "렌즈삽입", "시력교정", "lasik", "lasek"],
  body: ["지방흡입", "다이어트", "체형", "liposuction", "body"],
  hair: ["탈모", "모발이식", "헤어라인", "hair transplant"],
};

async function findPlaceId(name, address) {
  const input = address ? `${name} ${address}` : `${name} 한국`;
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(input)}&inputtype=textquery&fields=place_id&language=ko&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.candidates?.[0]?.place_id || null;
}

async function fetchReviews(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&language=ko&reviews_sort=newest&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.result?.reviews || [];
}

function analyzeReviews(reviews) {
  const scores = {};
  for (const [proc, keywords] of Object.entries(PROCEDURE_KEYWORDS)) {
    let mentions = 0;
    let positive = 0;
    for (const r of reviews) {
      const text = (r.text || "").toLowerCase();
      if (keywords.some((kw) => text.includes(kw.toLowerCase()))) {
        mentions++;
        if (r.rating >= 4) positive++;
      }
    }
    if (mentions > 0) {
      scores[proc] = { mentions, positive_rate: Math.round((positive / mentions) * 100) };
    }
  }
  return scores;
}

async function main() {
  const limitArg = process.argv.indexOf("--limit");
  const limit = limitArg > -1 ? parseInt(process.argv[limitArg + 1]) : 50;

  console.log(`\n=== 병원 리뷰 수집 시작 (최대 ${limit}개) ===\n`);

  // google_place_id가 있는 병원 우선, 없으면 성형외과/피부과 병원 조회
  const { data: clinics, error } = await supabase
    .from("clinics")
    .select("ykiho, name, address, google_place_id, google_rating")
    .not("is_closed", "eq", true)
    .in("dgsbjt_cd", ["08", "14", "49", "12"])
    .order("google_review_count", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error || !clinics) {
    console.error("DB 조회 실패:", error);
    return;
  }

  console.log(`조회된 병원: ${clinics.length}개\n`);

  let processed = 0;
  let updated = 0;

  for (const clinic of clinics) {
    processed++;
    const label = `[${processed}/${clinics.length}] ${clinic.name}`;

    try {
      // place_id 찾기
      let placeId = clinic.google_place_id;
      if (!placeId) {
        placeId = await findPlaceId(clinic.name, clinic.address);
        if (!placeId) {
          console.log(`${label} — place_id 못 찾음, 스킵`);
          continue;
        }
        // place_id 저장
        await supabase.from("clinics").update({ google_place_id: placeId }).eq("ykiho", clinic.ykiho);
      }

      // 리뷰 수집
      const reviews = await fetchReviews(placeId);
      if (!reviews.length) {
        console.log(`${label} — 리뷰 없음`);
        continue;
      }

      // 키워드 분석
      const scores = analyzeReviews(reviews);
      const scoreKeys = Object.keys(scores);

      if (scoreKeys.length > 0) {
        // DB에 저장 (procedure_scores JSON 컬럼)
        await supabase
          .from("clinics")
          .update({
            google_place_id: placeId,
            procedure_scores: scores,
            review_analyzed_at: new Date().toISOString(),
          })
          .eq("ykiho", clinic.ykiho);

        console.log(`${label} — ${reviews.length}개 리뷰, 시술 매칭: ${scoreKeys.join(", ")}`);
        updated++;
      } else {
        console.log(`${label} — ${reviews.length}개 리뷰, 시술 키워드 매칭 없음`);
      }

      // API rate limit (200ms 간격)
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      console.error(`${label} — 에러:`, err.message);
    }
  }

  console.log(`\n=== 완료: ${processed}개 처리, ${updated}개 시술점수 업데이트 ===\n`);
}

main().catch(console.error);
