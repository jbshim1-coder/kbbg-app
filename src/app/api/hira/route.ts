// 병원 검색 API — 심평원 실데이터 + 구글 별점
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
  const sort = searchParams.get("sort") || "";
  const withRating = searchParams.get("rating") !== "skip"; // rating=skip이면 별점 조회 안함

  try {
    const result = await fetchHiraClinics({
      yadmNm: keyword || undefined,
      sidoCd: region || undefined,
      dgsbjtCd: subject || undefined,
      clCd: type || undefined,
      numOfRows: 10,
      pageNo: page,
    });

    // 구글 별점 조회 (옵션 — 타임아웃 방지를 위해 3개만)
    let clinicsWithRating = result.clinics.map((c) => ({
      ...c,
      googleRating: null as number | null,
      googleReviewCount: null as number | null,
    }));

    if (withRating && result.clinics.length > 0) {
      try {
        // 상위 3개만 별점 조회 (Vercel 10초 제한 대응)
        const top3 = result.clinics.slice(0, 3);
        const ratings = await Promise.all(
          top3.map((c) => fetchGoogleRating(c.yadmNm, c.addr).catch(() => null))
        );
        ratings.forEach((r, i) => {
          if (r) {
            clinicsWithRating[i].googleRating = r.rating;
            clinicsWithRating[i].googleReviewCount = r.reviewCount;
          }
        });
      } catch {
        // 별점 조회 실패해도 결과는 반환
      }
    }

    // 구글 별점순 정렬
    if (sort === "rating") {
      clinicsWithRating.sort((a, b) => (b.googleRating ?? 0) - (a.googleRating ?? 0));
    }

    return NextResponse.json({ ...result, clinics: clinicsWithRating });
  } catch (error) {
    console.error("HIRA API error:", error);
    return NextResponse.json({ clinics: [], totalCount: 0, pageNo: page });
  }
}
