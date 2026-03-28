// DB 기반 병원 검색 API — Supabase에서 정렬+필터+페이지네이션
// 구글 별점순 > 전문의수순 기본 정렬

import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") || "";
  const region = searchParams.get("region") || "";
  const subject = searchParams.get("subject") || "";
  const type = searchParams.get("type") || ""; // 한의원/한방병원용 (korean_medicine)
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    const supabase = createServiceRoleClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("clinics")
      .select("*", { count: "exact" })
      .eq("is_active", true);

    // 키워드 검색 (병원명)
    if (keyword) {
      query = query.ilike("name", `%${keyword}%`);
    }

    // 지역 필터
    if (region) {
      query = query.eq("sido_cd", region);
    }

    // 진료과 필터
    if (subject) {
      query = query.eq("dgsbjt_cd", subject);
    }

    // 한의원/한방병원 필터 (종별코드 기반)
    if (type === "korean_medicine") {
      query = query.in("cl_cd", ["91", "92"]);
    }

    // 정렬: 구글별점 > 전문의수 > 의사수
    query = query
      .order("google_rating", { ascending: false, nullsFirst: false })
      .order("sdr_cnt", { ascending: false })
      .order("dr_tot_cnt", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    // HIRA API 응답 형식과 호환되도록 매핑
    const clinics = (data || []).map((c: Record<string, unknown>) => ({
      yadmNm: c.name,
      clCdNm: c.cl_cd_nm || "",
      dgsbjtCdNm: c.dgsbjt_cd_nm || "",
      addr: c.address || "",
      telno: c.phone || "",
      hospUrl: c.website || "",
      drTotCnt: c.dr_tot_cnt || 0,
      sdrCnt: c.sdr_cnt || 0,
      mdeptSdrCnt: c.sdr_cnt || 0,
      sidoCdNm: c.sido_cd_nm || "",
      sgguCdNm: c.sggu_cd_nm || "",
      ykiho: c.ykiho || "",
      googleRating: c.google_rating || null,
      googleReviewCount: c.google_review_count || null,
    }));

    return NextResponse.json({
      clinics,
      totalCount: count || 0,
      pageNo: page,
      source: "db",
    });
  } catch (error) {
    console.error("[clinics/search] DB search failed:", error);
    return NextResponse.json({
      clinics: [],
      totalCount: 0,
      pageNo: page,
      source: "db",
      error: "Search failed",
    });
  }
}
