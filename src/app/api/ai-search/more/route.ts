// AI 검색 추가 결과 — 같은 DB에서 나머지 결과만 반환 (AI 설명 생략)
import { NextRequest, NextResponse } from "next/server";
import { searchClinics } from "@/lib/clinic-search-service";
import type { SearchIntent } from "@/lib/clinic-search-service";

export async function POST(request: NextRequest) {
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
