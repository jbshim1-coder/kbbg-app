// AI 검색 추가 결과 — 같은 DB에서 나머지 결과만 반환 (AI 설명 생략)
import { NextRequest, NextResponse } from "next/server";
import { searchClinics } from "@/lib/clinic-search-service";
import type { SearchIntent } from "@/lib/clinic-search-service";

// IP별 요청 횟수 추적 (메모리 기반)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
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

export async function POST(request: NextRequest) {
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

  try {
    const body = await request.json();
    const { intent, page = 2, limit = 50 } = body as {
      intent: SearchIntent;
      page?: number;
      limit?: number;
    };

    if (!intent) {
      return NextResponse.json({ error: "intent is required" }, { status: 400 });
    }

    const { clinics, totalCount } = await searchClinics(intent, page, limit);

    // ClinicResult → HiraClinic 형식 변환
    const formatted = clinics.map((c) => ({
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
    }));

    return NextResponse.json({ clinics: formatted, totalCount });
  } catch (error) {
    console.error("AI search more error:", error);
    return NextResponse.json({ clinics: [], totalCount: 0 }, { status: 500 });
  }
}
