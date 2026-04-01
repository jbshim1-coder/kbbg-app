// AI 검색 API — DB 기반 실데이터 + AI 설명 (재설계)
// 흐름: 자연어 → GPT-4o-mini 조건추출 → DB 검색 → Claude 설명생성
import { NextRequest, NextResponse } from "next/server";
import { parseIntent, searchClinics, composeNarrative } from "@/lib/clinic-search-service";
import type { SearchIntent, ClinicResult } from "@/lib/clinic-search-service";

// IP별 요청 횟수 추적 (메모리 기반)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

// 진료과 코드 → 한국어 이름 매핑
function subjectCodeToName(code: string | null): string {
  if (!code) return "";
  const map: Record<string, string> = {
    "01": "내과", "02": "신경과", "03": "정신건강의학과",
    "04": "외과", "05": "정형외과", "06": "신경외과",
    "08": "성형외과", "09": "마취통증의학과", "10": "산부인과",
    "12": "안과", "13": "이비인후과", "14": "피부과",
    "15": "비뇨의학과", "21": "재활의학과", "49": "치과", "80": "한방내과",
  };
  return map[code] || "";
}

// ClinicResult → 프론트엔드 HiraClinic 형식으로 변환
function toHiraFormat(c: ClinicResult) {
  return {
    yadmNm: c.name,
    clCdNm: c.cl_cd_nm,
    dgsbjtCdNm: c.dgsbjt_cd_nm,
    addr: c.address,
    telno: c.phone,
    hospUrl: c.website,
    drTotCnt: c.dr_tot_cnt,
    sdrCnt: c.sdr_cnt,
    mdeptSdrCnt: c.sdr_cnt,
    sidoCdNm: c.sido_cd_nm,
    sgguCdNm: c.sggu_cd_nm,
    ykiho: c.ykiho,
    googleRating: c.google_rating,
    googleReviewCount: c.google_review_count,
    blogReviewCount: null,
    relevanceScore: c.relevance_score,
    anesthesiaSdrCount: c.anesthesia_sdr_count,
    safeAnesthesiaBadge: c.safe_anesthesia_badge,
  };
}

// 검색 기준 설명 생성 — "이렇게 검색했고, 이런 기준으로 추천합니다"
function buildSearchBasis(
  intent: SearchIntent,
  subjectName: string,
  totalCount: number,
  locale: string
): string {
  const isKo = locale === "ko";
  const parts: string[] = [];

  // 검색 조건
  const region = intent.region || (isKo ? "전국" : "All regions");
  const subject = subjectName || (isKo ? "전체 진료과" : "All departments");
  const keyword = intent.keyword || "";

  if (isKo) {
    parts.push(`📋 검색 조건: ${region} / ${subject}${keyword ? ` / "${keyword}"` : ""}`);
    parts.push(`📊 추천 기준: 심평원 공공데이터(전문의 수, 진료과) + 구글 평점/리뷰${keyword ? ` + "${keyword}" 관련도` : ""}`);
    parts.push(`🔍 검색 결과: 총 ${totalCount.toLocaleString()}개 병원`);
  } else {
    parts.push(`📋 Search: ${region} / ${subject}${keyword ? ` / "${keyword}"` : ""}`);
    parts.push(`📊 Criteria: HIRA data (specialists, dept) + Google rating/reviews${keyword ? ` + "${keyword}" relevance` : ""}`);
    parts.push(`🔍 Results: ${totalCount.toLocaleString()} clinics found`);
  }

  return parts.join("\n");
}

export async function POST(request: NextRequest) {
  let locale = "ko";

  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in 1 minute.", errorKo: "요청이 너무 많습니다. 1분 후 다시 시도해 주세요." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const query: string = body.query || "";
    locale = body.locale || "ko";

    if (!query.trim()) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    // ── 1단계: 자연어 → 검색조건 추출 ──
    let intent: SearchIntent;
    try {
      intent = await parseIntent(query);
    } catch {
      intent = {
        region_city: null, region_district: null, region: null,
        subject_code: null, clinic_type: null, keyword: query,
        confidence: 0, reason: "fallback",
      };
    }

    // 지역 없는 질문 처리: needsRegion 플래그
    const needsRegion = !intent.region_city && !intent.region_district;

    // ── 2단계: DB 검색 ──
    const { clinics, totalCount } = await searchClinics(intent, 1, 10);

    // ── 3단계: AI 설명 생성 (Claude) ──
    let narrative: string;
    try {
      narrative = await composeNarrative(query, clinics, totalCount, locale);
    } catch {
      narrative = locale === "ko"
        ? `심평원 공공데이터 기준 ${totalCount.toLocaleString()}개 병원이 검색되었습니다.`
        : `Found ${totalCount.toLocaleString()} clinics based on verified HIRA data.`;
    }

    // 추출된 조건 정보 (프론트엔드에서 칩/필터 연계용)
    const subjectName = subjectCodeToName(intent.subject_code);
    const extractedFilters = {
      region: intent.region,
      subject_code: intent.subject_code,
      subject_name: subjectName,
      clinic_type: intent.clinic_type,
      keyword: intent.keyword,
      confidence: intent.confidence,
    };

    // 검색 기준 설명 생성 (사용자에게 투명하게 표시)
    const searchBasis = buildSearchBasis(intent, subjectName, totalCount, locale);

    return NextResponse.json({
      searchBasis,
      narrative,
      clinics: clinics.map(toHiraFormat),
      totalCount,
      extractedFilters,
      needsRegion,
    });
  } catch (error) {
    console.error("AI search error:", error);
    return NextResponse.json({
      narrative: locale === "ko"
        ? "AI 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
        : "An error occurred during AI search. Please try again later.",
      clinics: [],
      totalCount: 0,
      extractedFilters: null,
      needsRegion: false,
    });
  }
}
