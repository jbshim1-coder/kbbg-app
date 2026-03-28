// 심평원 병원정보서비스 API 클라이언트
// https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList

const HIRA_BASE_URL = "https://apis.data.go.kr/B551182/hospInfoServicev2";

// 심평원 API 응답 타입
export interface HiraClinic {
  yadmNm: string;       // 요양기관명
  clCdNm: string;       // 종별명 (의원, 병원 등)
  sidoCdNm: string;     // 시도명
  sgguCdNm: string;     // 시군구명
  addr: string;         // 주소
  telno: string;        // 전화번호
  hospUrl: string;      // 홈페이지 URL
  drTotCnt: number;     // 의사 총수
  sdrCnt: number;       // 전문의 수 (구 필드, 호환용)
  mdeptSdrCnt: number;  // 전문의 수 (getHospBasisList 응답 필드)
  dgsbjtCdNm: string;   // 진료과목
  XPos: string;         // 경도
  YPos: string;         // 위도
  ykiho: string;        // 요양기관기호 (고유 ID)
  googleRating: number | null;      // 구글 별점 (API 응답 후 추가)
  googleReviewCount: number | null; // 구글 리뷰 수 (API 응답 후 추가)
}

// API 응답 구조
interface HiraResponse {
  response: {
    header: { resultCode: string; resultMsg: string };
    body: {
      items: { item: HiraClinic | HiraClinic[] };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

// 검색 파라미터
export interface HiraSearchParams {
  yadmNm?: string;    // 병원명 검색
  clCd?: string;      // 종별코드 (01:상급종합, 11:종합, 21:병원, 31:의원)
  sidoCd?: string;    // 시도코드
  sgguCd?: string;    // 시군구코드
  dgsbjtCd?: string;  // 진료과목코드
  numOfRows?: number; // 한 페이지 결과 수
  pageNo?: number;    // 페이지 번호
}

// 시도 코드 매핑
export const SIDO_CODES: Record<string, string> = {
  "110000": "서울",
  "210000": "부산",
  "220000": "대구",
  "230000": "인천",
  "240000": "광주",
  "250000": "대전",
  "260000": "울산",
  "290000": "세종",
  "310000": "경기",
  "320000": "강원",
  "340000": "충북",
  "360000": "충남",
  "370000": "전북",
  "410000": "전남",
  "430000": "경북",
  "460000": "경남",
  "500000": "제주",
};

// 진료과목 코드 매핑 (미용/의료관광 관련)
export const SUBJECT_CODES: Record<string, string> = {
  "01": "내과",
  "02": "신경과",
  "03": "정신건강의학과",
  "04": "외과",
  "05": "정형외과",
  "06": "신경외과",
  "08": "성형외과",
  "09": "마취통증의학과",
  "10": "산부인과",
  "12": "안과",
  "13": "이비인후과",
  "14": "피부과",
  "15": "비뇨의학과",
  "21": "재활의학과",
  "49": "치과",
  "80": "한방내과",
  "81": "한방부인과",
  "82": "한방소아과",
  "83": "한방안이비인후피부과",
  "84": "한방신경정신과",
  "85": "한방재활의학과",
  "86": "사상체질과",
  "87": "침구과",
};

// 심평원 API 호출 함수
export async function fetchHiraClinics(params: HiraSearchParams): Promise<{
  clinics: HiraClinic[];
  totalCount: number;
  pageNo: number;
}> {
  const apiKey = process.env.HIRA_API_KEY;
  if (!apiKey) throw new Error("HIRA_API_KEY is not set");

  // 쿼리 파라미터 구성
  const queryParams = new URLSearchParams({
    serviceKey: apiKey,
    numOfRows: String(params.numOfRows || 10),
    pageNo: String(params.pageNo || 1),
    _type: "json",
  });

  if (params.yadmNm) queryParams.set("yadmNm", params.yadmNm);
  if (params.clCd) queryParams.set("clCd", params.clCd);
  if (params.sidoCd) queryParams.set("sidoCd", params.sidoCd);
  if (params.sgguCd) queryParams.set("sgguCd", params.sgguCd);
  if (params.dgsbjtCd) queryParams.set("dgsbjtCd", params.dgsbjtCd);

  const url = `${HIRA_BASE_URL}/getHospBasisList?${queryParams.toString()}`;

  const res = await fetch(url, { next: { revalidate: 86400 } }); // 24시간 캐시

  if (!res.ok) {
    throw new Error(`HIRA API error: ${res.status} ${res.statusText}`);
  }

  const data: HiraResponse = await res.json();

  // 결과가 없으면 빈 배열 반환
  if (!data.response?.body?.items?.item) {
    return { clinics: [], totalCount: 0, pageNo: params.pageNo || 1 };
  }

  // 단일 결과일 때 배열로 변환
  const items = Array.isArray(data.response.body.items.item)
    ? data.response.body.items.item
    : [data.response.body.items.item];

  return {
    clinics: items,
    totalCount: data.response.body.totalCount,
    pageNo: data.response.body.pageNo,
  };
}
