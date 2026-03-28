// AI 검색 API — 자연어 질문을 심평원 데이터 + Claude AI 서술형 답변으로 처리
import { NextRequest, NextResponse } from "next/server";
import { fetchHiraClinics } from "@/lib/hira-api";
import { generateAiRecommendation } from "@/lib/claude-api";
import { fetchGoogleRating } from "@/lib/google-places";

// 자연어에서 지역/진료과 코드 파싱
function parseQuery(q: string): { sidoCd?: string; dgsbjtCd?: string } {
  const regionMap: Record<string, string> = {
    서울: "110000", 강남: "110000", 부산: "210000", 대구: "220000",
    인천: "230000", 광주: "240000", 대전: "250000", 울산: "260000",
    세종: "290000", 경기: "310000", 강원: "320000", 충북: "340000",
    충남: "360000", 전북: "370000", 전남: "410000", 경북: "430000",
    경남: "460000", 제주: "500000",
  };
  const subjectMap: Record<string, string> = {
    성형: "08", 피부: "14", 치과: "49", 안과: "12", 내과: "01",
    외과: "04", 정형: "05", 신경외과: "06", 이비인후: "13",
    비뇨: "15", 재활: "21",
  };

  let sidoCd: string | undefined;
  let dgsbjtCd: string | undefined;

  for (const [name, code] of Object.entries(regionMap)) {
    if (q.includes(name)) { sidoCd = code; break; }
  }
  for (const [name, code] of Object.entries(subjectMap)) {
    if (q.includes(name)) { dgsbjtCd = code; break; }
  }

  return { sidoCd, dgsbjtCd };
}

// POST /api/ai-search — { query, locale } → { narrative, clinics, totalCount }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query: string = body.query || "";
    const locale: string = body.locale || "ko";

    if (!query.trim()) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    // 1단계: 자연어에서 파라미터 파싱
    const { sidoCd, dgsbjtCd } = parseQuery(query);

    // 2단계: 심평원 API 호출 (상위 5개, 별점 조회 스킵)
    const hiraResult = await fetchHiraClinics({
      sidoCd,
      dgsbjtCd,
      clCd: "31", // 의원
      numOfRows: 5,
      pageNo: 1,
    });

    // 2.5단계: 상위 3개 병원 구글 별점 조회
    const clinicsWithRating = await Promise.all(
      hiraResult.clinics.map(async (c, i) => {
        if (i < 3) {
          try {
            const r = await fetchGoogleRating(c.yadmNm, c.addr);
            return { ...c, googleRating: r?.rating ?? null, googleReviewCount: r?.reviewCount ?? null };
          } catch { return { ...c, googleRating: null, googleReviewCount: null }; }
        }
        return { ...c, googleRating: null, googleReviewCount: null };
      })
    );
    hiraResult.clinics = clinicsWithRating as typeof hiraResult.clinics;

    // 3단계: Claude API로 서술형 답변 생성, 실패 시 템플릿 폴백
    let narrative: string;
    try {
      narrative = await generateAiRecommendation(
        query,
        hiraResult.clinics,
        hiraResult.totalCount,
        locale
      );
    } catch (claudeError) {
      console.error("Claude API error, falling back to template:", claudeError);
      // 폴백: 기존 템플릿 방식
      if (hiraResult.clinics.length === 0) {
        narrative = locale === "ko"
          ? `"${query}"에 대한 병원을 찾지 못했습니다.\n\n아래 조건 검색을 이용해 보세요.`
          : `No hospitals found for "${query}". Please try the filter search below.`;
      } else {
        const topCount = Math.min(hiraResult.clinics.length, 3);
        narrative = locale === "ko"
          ? `"${query}"(으)로 검색한 결과입니다.\n\n총 ${hiraResult.totalCount.toLocaleString()}개의 병원이 있으며, 상위 ${topCount}곳을 보여드립니다.`
          : `Found ${hiraResult.totalCount.toLocaleString()} hospitals for "${query}". Showing top ${topCount} results.`;
      }
    }

    return NextResponse.json({
      narrative,
      clinics: hiraResult.clinics.slice(0, 3),
      totalCount: hiraResult.totalCount,
    });
  } catch (error) {
    console.error("AI search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
