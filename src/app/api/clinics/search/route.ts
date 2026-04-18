// DB 기반 병원 검색 API — RPC 관련성 점수 우선, 폴백 지원
// 구글 별점 자동 캐싱 + 네이버 블로그 화제성 조회

import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { fetchGoogleRating } from "@/lib/google-places";
import { fetchBlogPopularity } from "@/lib/naver-blog";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") || "";
  const region = searchParams.get("region") || "";
  const subject = searchParams.get("subject") || "";
  const type = searchParams.get("type") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;

  try {
    const supabase = createServiceRoleClient();
    let clinicRows: Record<string, unknown>[] = [];
    let totalCount = 0;
    let usedRpc = false;

    // 1) RPC 함수로 관련성 점수 기반 검색 시도
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc("search_clinics_ranked", {
        p_subject: subject,
        p_keyword: keyword,
        p_region: region,
        p_type: type,
        p_page: page,
        p_limit: limit,
      });

      if (!error && data && data.length > 0) {
        clinicRows = data;
        totalCount = data[0]?.total_count || data.length;
        usedRpc = true;
      }
    } catch { /* RPC 없으면 폴백 */ }

    // 2) RPC 실패 시 기존 쿼리 폴백
    if (!usedRpc) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from("clinics")
        .select("*", { count: "exact" })
        .eq("is_active", true);

      if (keyword) {
        const sanitized = keyword.replace(/[%_\\]/g, '\\$&');
        query = query.or(`name.ilike.%${sanitized}%,address.ilike.%${sanitized}%`);
      }
      if (region) query = query.eq("sido_cd", region);
      if (subject) query = query.eq("dgsbjt_cd", subject);
      if (type === "korean_medicine") query = query.in("cl_cd", ["91", "92"]);
      // 의원만 노출 (내과/건강검진은 허용)
      if (subject && subject !== "01") query = query.in("cl_cd", ["31", "91", "92"]);

      query = query
        .order("google_rating", { ascending: false, nullsFirst: false })
        .order("sdr_cnt", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      const { data, count, error } = await query;
      if (error) throw error;
      clinicRows = data || [];
      totalCount = count || 0;
    }

    // 3) 구글 별점 없는 상위 3개 자동 조회+캐싱
    if (process.env.GOOGLE_PLACES_API_KEY) {
      const noRating = clinicRows.filter(c => !c.google_rating).slice(0, 3);
      for (const c of noRating) {
        try {
          const r = await fetchGoogleRating(c.name as string, c.address as string);
          if (r) {
            c.google_rating = r.rating;
            c.google_review_count = r.reviewCount;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (supabase as any).from("clinics").update({
              google_rating: r.rating, google_review_count: r.reviewCount,
            }).eq("ykiho", c.ykiho).then(() => {});
          }
        } catch { /* 개별 실패 무시 */ }
      }
    }

    // 4) 네이버 블로그 화제성 조회 (상위 3개, 폴백 안전)
    const blogMap = new Map<string, number>();
    if (process.env.NAVER_CLIENT_ID) {
      for (const c of clinicRows.slice(0, 3)) {
        try {
          const pop = await fetchBlogPopularity(c.name as string);
          if (pop) blogMap.set(c.name as string, pop.total);
        } catch { /* 실패 무시 */ }
      }
    }

    // 5) 응답 매핑
    const clinics = clinicRows.map((c) => ({
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
      relevanceScore: c.relevance_score || null,
      blogReviewCount: blogMap.get(c.name as string) || null,
    }));

    return NextResponse.json({
      clinics,
      totalCount,
      pageNo: page,
      source: usedRpc ? "rpc" : "db",
    });
  } catch (error) {
    console.error("[clinics/search] Search failed:", error);
    return NextResponse.json({
      clinics: [], totalCount: 0, pageNo: page, source: "error",
    });
  }
}
