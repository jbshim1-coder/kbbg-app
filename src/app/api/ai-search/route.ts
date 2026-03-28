// AI 검색 API — 자연어 질문을 심평원 데이터 + Claude AI 서술형 답변으로 처리
import { NextRequest, NextResponse } from "next/server";
import { fetchHiraClinics } from "@/lib/hira-api";
import { generateAiRecommendation } from "@/lib/claude-api";
import { fetchGoogleRating } from "@/lib/google-places";

// 자연어에서 지역/진료과 코드 파싱
function parseQuery(q: string): { sidoCd?: string; dgsbjtCd?: string; keyword?: string } {
  const regionMap: Record<string, string> = {
    // 시도
    서울: "110000", 부산: "210000", 대구: "220000", 인천: "230000",
    광주: "240000", 대전: "250000", 울산: "260000", 경기: "310000",
    강원: "320000", 충북: "330000", 충남: "340000", 전북: "350000",
    전남: "360000", 경북: "370000", 경남: "380000", 제주: "390000",
    세종: "410000",
    // 주요 도시 → 시도 매핑
    강남: "110000", 서초: "110000", 잠실: "110000", 홍대: "110000",
    수원: "310000", 성남: "310000", 분당: "310000", 용인: "310000",
    고양: "310000", 일산: "310000", 안양: "310000", 평택: "310000",
    해운대: "210000", 서면: "210000",
    동성로: "220000",
    송도: "230000", 부평: "230000",
    전주: "350000", 군산: "350000",
    천안: "340000", 아산: "340000",
    청주: "330000",
    포항: "370000", 구미: "370000",
    창원: "380000", 김해: "380000",
  };
  const subjectMap: Record<string, string> = {
    성형: "08", 피부: "14", 치과: "49", 안과: "12", 내과: "01",
    외과: "04", 정형: "05", 신경외과: "06", 이비인후: "13",
    비뇨: "15", 재활: "21",
  };

  let sidoCd: string | undefined;
  let dgsbjtCd: string | undefined;
  let keyword: string | undefined;

  for (const [name, code] of Object.entries(regionMap)) {
    if (q.includes(name)) {
      sidoCd = code;
      keyword = name; // 도시명을 키워드로 저장 (시군구 필터용)
      break;
    }
  }
  for (const [name, code] of Object.entries(subjectMap)) {
    if (q.includes(name)) { dgsbjtCd = code; break; }
  }

  return { sidoCd, dgsbjtCd, keyword };
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
    const { sidoCd, dgsbjtCd, keyword } = parseQuery(query);

    // 2단계: DB 기반 검색 시도 (구글별점순 + 전문의수순)
    let hiraResult: { clinics: HiraClinic[]; totalCount: number } = { clinics: [], totalCount: 0 };

    try {
      const dbParams = new URLSearchParams();
      if (sidoCd) dbParams.set("region", sidoCd);
      if (dgsbjtCd) dbParams.set("subject", dgsbjtCd);
      if (keyword) dbParams.set("keyword", keyword);
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const dbRes = await fetch(`${baseUrl}/api/clinics/search?${dbParams.toString()}`);
      const dbData = await dbRes.json();
      if (dbData.clinics && dbData.clinics.length > 0) {
        // DB 결과를 HiraClinic 형식으로 변환
        hiraResult = {
          clinics: dbData.clinics.map((c: Record<string, unknown>) => ({
            yadmNm: c.yadmNm, clCdNm: c.clCdNm, dgsbjtCdNm: c.dgsbjtCdNm,
            addr: c.addr, telno: c.telno, hospUrl: c.hospUrl,
            drTotCnt: c.drTotCnt, sdrCnt: c.sdrCnt, mdeptSdrCnt: c.sdrCnt,
            sidoCdNm: c.sidoCdNm, sgguCdNm: c.sgguCdNm, ykiho: c.ykiho,
            googleRating: c.googleRating, googleReviewCount: c.googleReviewCount,
            XPos: "", YPos: "",
          })) as HiraClinic[],
          totalCount: dbData.totalCount || 0,
        };
      }
    } catch { /* DB 실패 시 HIRA API 폴백 */ }

    // DB에 없으면 HIRA API 직접 호출
    if (hiraResult.clinics.length === 0) {
      const apiResult = await fetchHiraClinics({
        sidoCd,
        dgsbjtCd,
        numOfRows: 5,
        pageNo: 1,
      });
      // 상위 3개 구글 별점 조회
      const clinicsWithRating = await Promise.all(
        apiResult.clinics.map(async (c, i) => {
          if (i < 3) {
            try {
              const r = await fetchGoogleRating(c.yadmNm, c.addr);
              return { ...c, googleRating: r?.rating ?? null, googleReviewCount: r?.reviewCount ?? null };
            } catch { return { ...c, googleRating: null, googleReviewCount: null }; }
          }
          return { ...c, googleRating: null, googleReviewCount: null };
        })
      );
      hiraResult = { clinics: clinicsWithRating as HiraClinic[], totalCount: apiResult.totalCount };
    }

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
