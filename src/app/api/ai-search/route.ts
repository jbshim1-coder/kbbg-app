// AI 검색 API — RPC 관련성 점수 + Claude AI 서술형 답변
// 단일 검색 엔진: search_clinics_ranked RPC만 사용 (HIRA 폴백 없음)
import { NextRequest, NextResponse } from "next/server";
import type { HiraClinic } from "@/lib/hira-api";
import { SIDO_CODES, SUBJECT_CODES } from "@/lib/hira-api";
import { generateAiRecommendation } from "@/lib/claude-api";
import { createServiceRoleClient } from "@/lib/supabase";

// 지역 매핑 — SIDO_CODES와 동일한 소스 사용
const REGION_MAP: Record<string, string> = {
  // SIDO_CODES 역매핑 (이름→코드)
  ...Object.fromEntries(Object.entries(SIDO_CODES).map(([code, name]) => [name, code])),
  // 주요 도시 추가 매핑
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

// 진료과 매핑
const SUBJECT_MAP: Record<string, string> = {
  성형: "08", 피부: "14", 치과: "49", 안과: "12", 내과: "01",
  외과: "04", 정형: "05", 신경외과: "06", 이비인후: "13",
  비뇨: "15", 재활: "21", 산부인과: "10", 산부: "10",
  한방: "80", 한의: "80", 정신: "03",
};

// 자연어 파싱
function parseQuery(q: string) {
  let sidoCd: string | undefined;
  let dgsbjtCd: string | undefined;
  let keyword: string | undefined;

  for (const [name, code] of Object.entries(REGION_MAP)) {
    if (q.includes(name)) { sidoCd = code; keyword = name; break; }
  }
  for (const [name, code] of Object.entries(SUBJECT_MAP)) {
    if (q.includes(name)) { dgsbjtCd = code; break; }
  }
  return { sidoCd, dgsbjtCd, keyword };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query: string = body.query || "";
    const locale: string = body.locale || "ko";

    if (!query.trim()) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const { sidoCd, dgsbjtCd, keyword } = parseQuery(query);

    // 단일 검색: RPC 함수만 사용 (10개)
    let clinics: HiraClinic[] = [];
    let totalCount = 0;

    try {
      const supabase = createServiceRoleClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc("search_clinics_ranked", {
        p_subject: dgsbjtCd || "",
        p_keyword: keyword || "",
        p_region: sidoCd || "",
        p_type: "",
        p_page: 1,
        p_limit: 10,
      });

      if (!error && data && data.length > 0) {
        clinics = data.map((c: Record<string, unknown>) => ({
          yadmNm: c.name, clCdNm: c.cl_cd_nm || "", dgsbjtCdNm: c.dgsbjt_cd_nm || "",
          addr: c.address || "", telno: c.phone || "", hospUrl: c.website || "",
          drTotCnt: c.dr_tot_cnt || 0, sdrCnt: c.sdr_cnt || 0, mdeptSdrCnt: c.sdr_cnt || 0,
          sidoCdNm: c.sido_cd_nm || "", sgguCdNm: c.sggu_cd_nm || "", ykiho: c.ykiho || "",
          googleRating: c.google_rating || null, googleReviewCount: c.google_review_count || null,
          XPos: "", YPos: "",
        })) as HiraClinic[];
        totalCount = data[0]?.total_count || data.length;
      }
    } catch (err) {
      console.error("[ai-search] RPC failed:", err);
    }

    // Claude AI 서술형 답변 생성
    let narrative: string;
    try {
      narrative = await generateAiRecommendation(query, clinics, totalCount, locale);
    } catch {
      // AI 실패 시 템플릿
      if (clinics.length === 0) {
        narrative = locale === "ko"
          ? `"${query}"에 대한 검색 결과가 없습니다. 다른 지역이나 진료과로 검색해 보세요.`
          : `No results found for "${query}". Please try a different region or specialty.`;
      } else {
        narrative = locale === "ko"
          ? `"${query}" 검색 결과 ${totalCount}개 병원을 찾았습니다.`
          : `Found ${totalCount} clinics for "${query}".`;
      }
    }

    return NextResponse.json({
      narrative,
      clinics: clinics.slice(0, 10),
      totalCount,
    });
  } catch (error) {
    console.error("AI search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
