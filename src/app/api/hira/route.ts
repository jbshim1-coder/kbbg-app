// 병원 검색 API — 심평원 실데이터 + 구글 별점 + DB 영어 이름 매칭
import { NextRequest, NextResponse } from "next/server";
import { fetchHiraClinics } from "@/lib/hira-api";
import { fetchGoogleRating } from "@/lib/google-places";
import { createServiceRoleClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") || "";
  const region = searchParams.get("region") || "";
  const sggu = searchParams.get("sggu") || "";
  const subject = searchParams.get("subject") || "";
  const type = searchParams.get("type") || "";
  const page = parseInt(searchParams.get("page") || "1");

  try {
    // 심평원 API 직접 호출 — 정렬/필터 변경 없이 그대로
    const result = await fetchHiraClinics({
      yadmNm: keyword || undefined,
      sidoCd: region || undefined,
      sgguCd: sggu || undefined,
      dgsbjtCd: subject || undefined,
      clCd: type || undefined,
      numOfRows: 10,
      pageNo: page,
    });

    // 구글 별점 추가 (표시용만, 정렬/순서 변경 안 함)
    const clinicsWithRating = result.clinics.map((c) => ({
      ...c,
      googleRating: null as number | null,
      googleReviewCount: null as number | null,
    }));

    if (result.clinics.length > 0) {
      try {
        // 상위 3개만 별점 조회 (Vercel 10초 제한)
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
        // 별점 실패해도 결과는 반환
      }
    }

    // DB에서 영어 이름 매칭 (ykiho 기준)
    try {
      const ykihos = clinicsWithRating.map(c => c.ykiho).filter(Boolean);
      if (ykihos.length > 0) {
        const supabase = createServiceRoleClient();
        const { data: dbClinics } = await (supabase as any)
          .from("clinics")
          .select("ykiho, name_en")
          .in("ykiho", ykihos);
        if (dbClinics) {
          const enMap = new Map(dbClinics.map((c: { ykiho: string; name_en: string }) => [c.ykiho, c.name_en]));
          clinicsWithRating.forEach(c => {
            (c as any).nameEn = enMap.get(c.ykiho) || null;
          });
        }
      }
    } catch { /* DB 매칭 실패해도 결과는 반환 */ }

    // 심평원 순서 그대로 반환 (정렬 로직 없음)
    return NextResponse.json({ ...result, clinics: clinicsWithRating });
  } catch (error) {
    console.error("HIRA API error:", error);
    return NextResponse.json({ clinics: [], totalCount: 0, pageNo: page });
  }
}
