// DB 기반 병원 검색 API — Supabase에서 정렬+필터+페이지네이션
// 구글 별점순 > 전문의수순 기본 정렬

import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { fetchGoogleRating } from "@/lib/google-places";
import { SUBJECT_CODES } from "@/lib/hira-api";

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

    // 키워드 검색 (병원명 또는 주소)
    if (keyword) {
      query = query.or(`name.ilike.%${keyword}%,address.ilike.%${keyword}%`);
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

    // 넉넉히 가져온 후 관련성 재정렬 (진료과 키워드 매칭)
    const fetchLimit = subject ? 50 : limit;
    query = query
      .order("google_rating", { ascending: false, nullsFirst: false })
      .order("sdr_cnt", { ascending: false })
      .order("dr_tot_cnt", { ascending: false })
      .range(0, fetchLimit - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    // 진료과 관련성 재정렬 — 병원명에 진료과 키워드 포함 시 우선
    if (data && subject && SUBJECT_CODES[subject]) {
      const subjectName = SUBJECT_CODES[subject]; // 예: "피부과", "성형외과"
      const shortName = subjectName.replace("과", "").replace("의학", ""); // "피부", "성형외"
      data.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
        const aName = (a.name as string) || "";
        const bName = (b.name as string) || "";
        const aMatch = aName.includes(shortName) || aName.includes(subjectName) ? 1 : 0;
        const bMatch = bName.includes(shortName) || bName.includes(subjectName) ? 1 : 0;
        if (aMatch !== bMatch) return bMatch - aMatch;
        // 동일 관련성이면 별점 > 전문의수 순
        const aRating = (a.google_rating as number) || 0;
        const bRating = (b.google_rating as number) || 0;
        if (aRating !== bRating) return bRating - aRating;
        return ((b.sdr_cnt as number) || 0) - ((a.sdr_cnt as number) || 0);
      });
    }

    // 관련성 정렬 후 페이지 슬라이스
    if (data && subject) {
      const sliced = data.slice(offset, offset + limit);
      data.length = 0;
      sliced.forEach((item: Record<string, unknown>) => data.push(item));
    }

    // 별점 없는 상위 5개 병원 구글 별점 조회+캐싱
    if (process.env.GOOGLE_PLACES_API_KEY && data) {
      const noRating = data.filter((c: Record<string, unknown>) => !c.google_rating).slice(0, 5);
      for (const c of noRating) {
        try {
          const rating = await fetchGoogleRating(c.name as string, c.address as string);
          if (rating) {
            c.google_rating = rating.rating;
            c.google_review_count = rating.reviewCount;
            // DB에 캐싱 (비동기, 응답 안 기다림)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (supabase as any).from("clinics").update({
              google_rating: rating.rating,
              google_review_count: rating.reviewCount,
            }).eq("ykiho", c.ykiho).then(() => {});
          }
        } catch { /* 개별 실패 무시 */ }
      }
    }

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
