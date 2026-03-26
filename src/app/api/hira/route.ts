// 병원 검색 API — 심평원 hospInfoServicev2/getHospBasisList 직접 호출
import { NextRequest, NextResponse } from "next/server";
import { fetchHiraClinics } from "@/lib/hira-api";
import { fetchGoogleRating } from "@/lib/google-places";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") || "";
  const region = searchParams.get("region") || "";
  const subject = searchParams.get("subject") || "";
  const type = searchParams.get("type") || "";
  const page = parseInt(searchParams.get("page") || "1");

  try {
    const result = await fetchHiraClinics({
      yadmNm: keyword || undefined,
      sidoCd: region || undefined,
      dgsbjtCd: subject || undefined,
      clCd: type || undefined,
      numOfRows: 10,
      pageNo: page,
    });

    // 상위 10개 병원에 대해 Google 별점 병렬 조회 (실패 시 null)
    const clinicsWithRating = await Promise.all(
      result.clinics.map(async (clinic) => {
        const googleData = await fetchGoogleRating(clinic.yadmNm, clinic.addr);
        return {
          ...clinic,
          googleRating: googleData?.rating ?? null,
          googleReviewCount: googleData?.reviewCount ?? null,
        };
      })
    );

    // 구글 별점순 정렬 (별점 높은 순, 없으면 맨 뒤)
    const sort = searchParams.get("sort");
    if (sort === "rating") {
      clinicsWithRating.sort((a, b) => (b.googleRating ?? 0) - (a.googleRating ?? 0));
    }

    return NextResponse.json({ ...result, clinics: clinicsWithRating });
  } catch (error) {
    console.error("HIRA API error:", error);
    return NextResponse.json({ clinics: [], totalCount: 0, pageNo: page });
  }
}
