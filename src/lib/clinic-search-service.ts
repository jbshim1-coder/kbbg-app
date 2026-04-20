// AI 검색 서비스 레이어
// parseIntent → searchClinics → composeNarrative 3단계 오케스트레이션
// /api/ai-search와 /api/clinics/search에서 공통으로 사용

import { createServiceRoleClient } from "@/lib/supabase";

// ─── 타입 정의 ───

export interface SearchIntent {
  region_city: string | null;
  region_district: string | null;
  subject_code: string | null;
  clinic_type: string | null;
  keyword: string;
  confidence: number;
  reason: string;
  // 하위호환: 기존 API 응답용
  region: string | null;
}

export interface ClinicResult {
  ykiho: string;
  name: string;
  cl_cd_nm: string;
  dgsbjt_cd_nm: string;
  address: string;
  phone: string;
  website: string;
  dr_tot_cnt: number;
  sdr_cnt: number;
  sido_cd_nm: string;
  sggu_cd_nm: string;
  google_rating: number | null;
  google_review_count: number | null;
  relevance_score: number | null;
  anesthesia_sdr_count: number;
  safe_anesthesia_badge: boolean;
  naver_blog_mentions: number;
  naver_positive_ratio: number | null;
  naver_reputation_score: number | null;
}

// ─── 1단계: 자연어 → 검색조건 추출 (GPT-4o-mini) ───

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const INTENT_SYSTEM_PROMPT = `당신은 병원 추천 검색 파라미터 추출기입니다.
사용자의 자연어 질문에서 병원 검색 조건을 JSON으로 추출하세요.

규칙:
- region_city: 시/도 단위 지역명. 정규화하여 반환. 없으면 null
  예: "서울", "부산", "대구", "인천", "광주", "대전", "울산", "경기", "제주", "세종"
  "강남 성형외과" → region_city: "서울" (강남은 서울에 속함)
  "해운대 피부과" → region_city: "부산"
  "서면 성형외과" → region_city: "부산"
  "분당 안과" → region_city: "경기"
  "수원 피부과" → region_city: "경기"
  "명동 피부과" → region_city: "서울"
  "홍대 치과" → region_city: "서울"
- region_district: 구/군/동/비공식지명. 없으면 null
  예: "강남구", "서초구", "해운대구", "역삼동", "명동", "홍대", "서면", "분당", "수원"
  "서울 강남 성형외과" → region_district: "강남구"
  "역삼동 피부과" → region_district: "역삼동"
  "분당 안과" → region_district: "분당"
- subject_code: 진료과 코드만 반환. 모르면 null
  - 쌍꺼풀/코성형/윤곽/보톡스/필러/리프팅(얼굴)/성형 → "08" (성형외과)
  - 여드름/기미/피부/레이저/모공/피부과 → "14" (피부과)
  - 치아/임플란트/교정/미백/치과 → "49" (치과)
  - 눈/시력/라식/라섹/안과 → "12" (안과)
  - 다이어트/비만/지방흡입/체형 → "08" (성형외과)
  - 통증/허리/어깨/관절/정형 → "05" (정형외과)
  - 탈모/모발이식 → "14" (피부과)
  - 주름/안티에이징 → "14" (피부과)
  - plastic surgery/cosmetic → "08"
  - dermatology/skin → "14"
  - dentist/dental → "49"
  - ophthalmology/eye → "12"
- clinic_type: "clinic"(의원), "hospital"(병원), "korean_medicine"(한의원). 모르면 null
- keyword: 시술명/고민 등 핵심 키워드. 지역명·진료과명 제외. 없으면 빈 문자열 ""

  ★★★ 최우선 규칙: 시술명/장비명은 절대 임의 변환 금지 ★★★
  사용자가 특정 시술명이나 장비명을 입력하면 원문 그대로 keyword에 넣으세요.
  아는 시술이든 모르는 시술이든 상관없이 원문을 보존합니다.
  예: "덴서티" → keyword: "덴서티" (여드름으로 변환 금지!)
  "울쎄라" → keyword: "울쎄라"
  "쥬베룩" → keyword: "쥬베룩"
  "리쥬란" → keyword: "리쥬란"
  "인모드" → keyword: "인모드"
  "포텐자" → keyword: "포텐자"
  "슈링크" → keyword: "슈링크"
  "올리지오" → keyword: "올리지오"
  "피코토닝" → keyword: "피코토닝"
  "써마지" → keyword: "써마지"
  "프락셀" → keyword: "프락셀"
  "젠틀맥스" → keyword: "젠틀맥스"

  알려진 시술 카테고리 참고:
  - 리프팅: 덴서티, 울쎄라, 써마지, 인모드, 슈링크, 올리지오
  - 스킨부스터: 리쥬란, 쥬베룩, 엑소좀
  - 레이저: 피코토닝, 프락셀, 젠틀맥스, 브이빔
  - 쁘띠: 보톡스, 필러, 윤곽주사

  일반적인 고민/증상은 짧은 키워드로 변환:
  "눈성형/쌍꺼풀/눈매교정" → keyword: "눈"
  "코성형/코수술" → keyword: "코"
  "치아교정/교정" → keyword: "교정"
  "임플란트" → keyword: "임플란트"
  "여드름/피부" → keyword: "여드름"

  ★ 나이/성별/고민 맥락이 있으면 관련 시술로 변환:
  "40대 여성 성형" → subject_code: "08", keyword: "리프팅" (40대=안티에이징)
  "50대 눈밑 처짐" → subject_code: "08", keyword: "눈"
  "20대 여자 피부 관리" → subject_code: "14", keyword: ""
  "30대 남자 탈모" → subject_code: "14", keyword: "모발"
  "60대 임플란트" → subject_code: "49", keyword: "임플란트"
  "주름 없애고 싶어" → subject_code: "14", keyword: "리프팅"
  "얼굴 처짐" → subject_code: "08", keyword: "리프팅"
  "여드름 흉터" → subject_code: "14", keyword: "여드름"
  "탈모/모발이식" → keyword: "모발"
  "강남 성형외과" → keyword: "" (지역+진료과만이므로)
- confidence: 추출 확신도 0~1
- reason: 추출 근거 (한국어)

반드시 JSON만 반환하세요.`;

export async function parseIntent(query: string): Promise<SearchIntent> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      region_city: null, region_district: null, region: null,
      subject_code: null, clinic_type: null, keyword: query,
      confidence: 0, reason: "API key missing",
    };
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 400,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: INTENT_SYSTEM_PROMPT },
        { role: "user", content: query },
      ],
    }),
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty OpenAI response");

  const parsed = JSON.parse(content);

  // 하위호환: region 필드 합성
  const city = parsed.region_city || null;
  const district = parsed.region_district || null;
  const region = district ? (city ? `${city} ${district}` : district) : city;

  return {
    region_city: city,
    region_district: district,
    region,
    subject_code: parsed.subject_code || null,
    clinic_type: parsed.clinic_type || null,
    keyword: parsed.keyword ?? "",
    confidence: parsed.confidence ?? 0.5,
    reason: parsed.reason || "",
  };
}

// ─── 지역명 → 심평원 시도코드 매핑 ───

// 시도 코드 매핑
const REGION_NAME_TO_CODE: Record<string, string> = {
  "서울": "110000", "seoul": "110000",
  "부산": "210000", "busan": "210000",
  "대구": "220000", "daegu": "220000",
  "인천": "230000", "incheon": "230000",
  "광주": "240000", "gwangju": "240000",
  "대전": "250000", "daejeon": "250000",
  "울산": "260000", "ulsan": "260000",
  "경기": "310000", "gyeonggi": "310000",
  "강원": "320000", "gangwon": "320000",
  "충북": "330000", "chungbuk": "330000", "충청북도": "330000",
  "충남": "340000", "chungnam": "340000", "충청남도": "340000",
  "전북": "350000", "jeonbuk": "350000", "전라북도": "350000",
  "전남": "360000", "jeonnam": "360000", "전라남도": "360000",
  "경북": "370000", "gyeongbuk": "370000", "경상북도": "370000",
  "경남": "380000", "gyeongnam": "380000", "경상남도": "380000",
  "제주": "390000", "jeju": "390000",
  "세종": "410000", "sejong": "410000",
};

// 구/군/동/비공식지명 → { sido코드, keyword로 사용할 구/동 이름 }
const DISTRICT_TO_REGION: Record<string, { sido: string; keyword: string }> = {
  // ── 서울 25개구 ──
  "강남구": { sido: "110000", keyword: "강남" }, "강남": { sido: "110000", keyword: "강남" }, "gangnam": { sido: "110000", keyword: "강남" },
  "강동구": { sido: "110000", keyword: "강동" }, "강동": { sido: "110000", keyword: "강동" },
  "강북구": { sido: "110000", keyword: "강북" }, "강북": { sido: "110000", keyword: "강북" },
  "강서구": { sido: "110000", keyword: "강서" },
  "관악구": { sido: "110000", keyword: "관악" }, "관악": { sido: "110000", keyword: "관악" },
  "광진구": { sido: "110000", keyword: "광진" }, "광진": { sido: "110000", keyword: "광진" },
  "구로구": { sido: "110000", keyword: "구로" }, "구로": { sido: "110000", keyword: "구로" },
  "금천구": { sido: "110000", keyword: "금천" }, "금천": { sido: "110000", keyword: "금천" },
  "노원구": { sido: "110000", keyword: "노원" }, "노원": { sido: "110000", keyword: "노원" },
  "도봉구": { sido: "110000", keyword: "도봉" }, "도봉": { sido: "110000", keyword: "도봉" },
  "동대문구": { sido: "110000", keyword: "동대문" }, "동대문": { sido: "110000", keyword: "동대문" },
  "동작구": { sido: "110000", keyword: "동작" }, "동작": { sido: "110000", keyword: "동작" },
  "마포구": { sido: "110000", keyword: "마포" }, "마포": { sido: "110000", keyword: "마포" },
  "서대문구": { sido: "110000", keyword: "서대문" }, "서대문": { sido: "110000", keyword: "서대문" },
  "서초구": { sido: "110000", keyword: "서초" }, "서초": { sido: "110000", keyword: "서초" }, "seocho": { sido: "110000", keyword: "서초" },
  "성동구": { sido: "110000", keyword: "성동" }, "성동": { sido: "110000", keyword: "성동" },
  "성북구": { sido: "110000", keyword: "성북" },
  "송파구": { sido: "110000", keyword: "송파" }, "송파": { sido: "110000", keyword: "송파" },
  "양천구": { sido: "110000", keyword: "양천" }, "양천": { sido: "110000", keyword: "양천" },
  "영등포구": { sido: "110000", keyword: "영등포" }, "영등포": { sido: "110000", keyword: "영등포" },
  "용산구": { sido: "110000", keyword: "용산" }, "용산": { sido: "110000", keyword: "용산" },
  "은평구": { sido: "110000", keyword: "은평" }, "은평": { sido: "110000", keyword: "은평" },
  "종로구": { sido: "110000", keyword: "종로" }, "종로": { sido: "110000", keyword: "종로" },
  "중구": { sido: "110000", keyword: "중구" },
  "중랑구": { sido: "110000", keyword: "중랑" }, "중랑": { sido: "110000", keyword: "중랑" },
  // 서울 비공식지명/동
  "명동": { sido: "110000", keyword: "명동" }, "myeongdong": { sido: "110000", keyword: "명동" },
  "홍대": { sido: "110000", keyword: "홍대" }, "hongdae": { sido: "110000", keyword: "홍대" },
  "신촌": { sido: "110000", keyword: "신촌" },
  "압구정": { sido: "110000", keyword: "압구정" }, "apgujeong": { sido: "110000", keyword: "압구정" },
  "잠실": { sido: "110000", keyword: "잠실" },
  "이태원": { sido: "110000", keyword: "이태원" }, "itaewon": { sido: "110000", keyword: "이태원" },
  "청담": { sido: "110000", keyword: "청담" }, "cheongdam": { sido: "110000", keyword: "청담" },
  "신사": { sido: "110000", keyword: "신사" },
  "역삼": { sido: "110000", keyword: "역삼" },
  "논현": { sido: "110000", keyword: "논현" },
  "삼성": { sido: "110000", keyword: "삼성" },
  "대치": { sido: "110000", keyword: "대치" },

  // ── 부산 주요구 ──
  "해운대구": { sido: "210000", keyword: "해운대" }, "해운대": { sido: "210000", keyword: "해운대" }, "haeundae": { sido: "210000", keyword: "해운대" },
  "수영구": { sido: "210000", keyword: "수영" }, "수영": { sido: "210000", keyword: "수영" },
  "부산진구": { sido: "210000", keyword: "부산진" }, "부산진": { sido: "210000", keyword: "부산진" },
  "동래구": { sido: "210000", keyword: "동래" }, "동래": { sido: "210000", keyword: "동래" },
  "연제구": { sido: "210000", keyword: "연제" }, "연제": { sido: "210000", keyword: "연제" },
  "사하구": { sido: "210000", keyword: "사하" }, "사하": { sido: "210000", keyword: "사하" },
  "사상구": { sido: "210000", keyword: "사상" }, "사상": { sido: "210000", keyword: "사상" },
  "금정구": { sido: "210000", keyword: "금정" }, "금정": { sido: "210000", keyword: "금정" },
  "기장군": { sido: "210000", keyword: "기장" }, "기장": { sido: "210000", keyword: "기장" },
  "영도구": { sido: "210000", keyword: "영도" }, "영도": { sido: "210000", keyword: "영도" },
  "부산남구": { sido: "210000", keyword: "남구" },
  "부산북구": { sido: "210000", keyword: "북구" },
  "부산중구": { sido: "210000", keyword: "중구" },
  "부산동구": { sido: "210000", keyword: "동구" },
  "부산서구": { sido: "210000", keyword: "서구" },
  "서면": { sido: "210000", keyword: "서면" }, "seomyeon": { sido: "210000", keyword: "서면" },
  "광안리": { sido: "210000", keyword: "광안" },
  "남포동": { sido: "210000", keyword: "남포" },
  "센텀": { sido: "210000", keyword: "센텀" },

  // ── 대구 주요구 ──
  "수성구": { sido: "220000", keyword: "수성" }, "수성": { sido: "220000", keyword: "수성" },
  "달서구": { sido: "220000", keyword: "달서" }, "달서": { sido: "220000", keyword: "달서" },
  "달성군": { sido: "220000", keyword: "달성" }, "달성": { sido: "220000", keyword: "달성" },
  "대구중구": { sido: "220000", keyword: "중구" },
  "대구동구": { sido: "220000", keyword: "동구" },
  "대구서구": { sido: "220000", keyword: "서구" },
  "대구남구": { sido: "220000", keyword: "남구" },
  "대구북구": { sido: "220000", keyword: "북구" },

  // ── 인천 주요구 ──
  "연수구": { sido: "230000", keyword: "연수" }, "연수": { sido: "230000", keyword: "연수" },
  "남동구": { sido: "230000", keyword: "남동" }, "남동": { sido: "230000", keyword: "남동" },
  "부평구": { sido: "230000", keyword: "부평" }, "부평": { sido: "230000", keyword: "부평" },
  "계양구": { sido: "230000", keyword: "계양" }, "계양": { sido: "230000", keyword: "계양" },
  "미추홀구": { sido: "230000", keyword: "미추홀" }, "미추홀": { sido: "230000", keyword: "미추홀" },
  "서구": { sido: "230000", keyword: "서구" },
  "인천중구": { sido: "230000", keyword: "중구" },
  "인천동구": { sido: "230000", keyword: "동구" },
  "송도": { sido: "230000", keyword: "송도" }, "songdo": { sido: "230000", keyword: "송도" },

  // ── 광주 주요구 ──
  "광산구": { sido: "240000", keyword: "광산" }, "광산": { sido: "240000", keyword: "광산" },
  "광주서구": { sido: "240000", keyword: "서구" },
  "광주남구": { sido: "240000", keyword: "남구" },
  "광주북구": { sido: "240000", keyword: "북구" },
  "광주동구": { sido: "240000", keyword: "동구" },

  // ── 대전 주요구 ──
  "유성구": { sido: "250000", keyword: "유성" }, "유성": { sido: "250000", keyword: "유성" },
  "대전서구": { sido: "250000", keyword: "서구" },
  "대전중구": { sido: "250000", keyword: "중구" },
  "대전동구": { sido: "250000", keyword: "동구" },
  "대덕구": { sido: "250000", keyword: "대덕" }, "대덕": { sido: "250000", keyword: "대덕" },
  "둔산": { sido: "250000", keyword: "둔산" },

  // ── 울산 주요구 ──
  "울주군": { sido: "260000", keyword: "울주" }, "울주": { sido: "260000", keyword: "울주" },
  "울산남구": { sido: "260000", keyword: "남구" },
  "울산중구": { sido: "260000", keyword: "중구" },
  "울산동구": { sido: "260000", keyword: "동구" },
  "울산북구": { sido: "260000", keyword: "북구" },

  // ── 경기도 주요 시 ──
  "수원": { sido: "310000", keyword: "수원" }, "suwon": { sido: "310000", keyword: "수원" },
  "수원시": { sido: "310000", keyword: "수원" },
  "성남": { sido: "310000", keyword: "성남" }, "성남시": { sido: "310000", keyword: "성남" },
  "분당": { sido: "310000", keyword: "분당" }, "분당구": { sido: "310000", keyword: "분당" }, "bundang": { sido: "310000", keyword: "분당" },
  "용인": { sido: "310000", keyword: "용인" }, "용인시": { sido: "310000", keyword: "용인" },
  "고양": { sido: "310000", keyword: "고양" }, "고양시": { sido: "310000", keyword: "고양" },
  "일산": { sido: "310000", keyword: "일산" }, "ilsan": { sido: "310000", keyword: "일산" },
  "화성": { sido: "310000", keyword: "화성" }, "화성시": { sido: "310000", keyword: "화성" },
  "안양": { sido: "310000", keyword: "안양" }, "안양시": { sido: "310000", keyword: "안양" },
  "안산": { sido: "310000", keyword: "안산" }, "안산시": { sido: "310000", keyword: "안산" },
  "평택": { sido: "310000", keyword: "평택" }, "평택시": { sido: "310000", keyword: "평택" },
  "시흥": { sido: "310000", keyword: "시흥" }, "시흥시": { sido: "310000", keyword: "시흥" },
  "파주": { sido: "310000", keyword: "파주" }, "파주시": { sido: "310000", keyword: "파주" },
  "김포": { sido: "310000", keyword: "김포" }, "김포시": { sido: "310000", keyword: "김포" },
  "광명": { sido: "310000", keyword: "광명" }, "광명시": { sido: "310000", keyword: "광명" },
  "군포": { sido: "310000", keyword: "군포" }, "군포시": { sido: "310000", keyword: "군포" },
  "하남": { sido: "310000", keyword: "하남" }, "하남시": { sido: "310000", keyword: "하남" },
  "오산": { sido: "310000", keyword: "오산" }, "오산시": { sido: "310000", keyword: "오산" },
  "이천": { sido: "310000", keyword: "이천" }, "이천시": { sido: "310000", keyword: "이천" },
  "의정부": { sido: "310000", keyword: "의정부" }, "의정부시": { sido: "310000", keyword: "의정부" },
  "남양주": { sido: "310000", keyword: "남양주" }, "남양주시": { sido: "310000", keyword: "남양주" },
  "구리": { sido: "310000", keyword: "구리" }, "구리시": { sido: "310000", keyword: "구리" },
  "양주": { sido: "310000", keyword: "양주" }, "양주시": { sido: "310000", keyword: "양주" },
  "동탄": { sido: "310000", keyword: "동탄" },
  "판교": { sido: "310000", keyword: "판교" },
  "광교": { sido: "310000", keyword: "광교" },
};

// 지역명 → { sido_cd, districtKeyword } 변환
// city: GPT가 추출한 시/도, district: GPT가 추출한 구/군/동
function resolveRegion(
  city: string | null,
  district: string | null
): { code: string; districtKeyword: string } {
  // city + district 모두 있는 경우
  if (city && district) {
    const cityNorm = city.trim().toLowerCase().replace(/특별자치도$|특별자치시$|광역시$|특별시$|도$|시$/, "");
    const cityCode = REGION_NAME_TO_CODE[cityNorm] || REGION_NAME_TO_CODE[city.trim()] || REGION_NAME_TO_CODE[city.trim().toLowerCase()] || "";

    // district에서 구/동 이름 추출 (keyword로 사용)
    const distTrimmed = district.trim();
    // city+district 복합키로 먼저 조회 (예: "부산"+"남구" → "부산남구")
    const compositeKey = `${cityNorm}${distTrimmed}`;
    const distEntry = DISTRICT_TO_REGION[compositeKey] || DISTRICT_TO_REGION[distTrimmed] || DISTRICT_TO_REGION[distTrimmed.replace(/구$|군$|시$/, "")];
    const kw = distEntry ? distEntry.keyword : distTrimmed.replace(/구$|군$/, "");

    return { code: cityCode || (distEntry ? distEntry.sido : ""), districtKeyword: kw };
  }

  // district만 있는 경우
  if (district) {
    const distTrimmed = district.trim();
    const distEntry = DISTRICT_TO_REGION[distTrimmed] || DISTRICT_TO_REGION[distTrimmed.replace(/구$|군$|시$/, "")] || DISTRICT_TO_REGION[distTrimmed.toLowerCase()];
    if (distEntry) return { code: distEntry.sido, districtKeyword: distEntry.keyword };

    // 동 단위 (역삼동, 논현동 등) — 시도코드 모르면 keyword만 사용
    const dongKw = distTrimmed.replace(/동$/, "");
    return { code: "", districtKeyword: dongKw || distTrimmed };
  }

  // city만 있는 경우
  if (city) {
    const trimmed = city.trim();
    if (/^\d{6}$/.test(trimmed)) return { code: trimmed, districtKeyword: "" };

    const normalized = trimmed.toLowerCase().replace(/특별자치도$|특별자치시$|광역시$|특별시$|도$|시$/, "");
    const directMatch = REGION_NAME_TO_CODE[normalized] || REGION_NAME_TO_CODE[trimmed] || REGION_NAME_TO_CODE[trimmed.toLowerCase()];
    if (directMatch) return { code: directMatch, districtKeyword: "" };

    // city가 실제로는 구/동 이름인 경우 (GPT가 잘못 분류)
    const distEntry = DISTRICT_TO_REGION[trimmed] || DISTRICT_TO_REGION[trimmed.replace(/구$|군$|시$/, "")] || DISTRICT_TO_REGION[trimmed.toLowerCase()];
    if (distEntry) return { code: distEntry.sido, districtKeyword: distEntry.keyword };

    return { code: "", districtKeyword: "" };
  }

  return { code: "", districtKeyword: "" };
}

// 하위호환: region 단일 문자열에서도 city/district 분리
function parseRegionString(regionText: string | null): { city: string | null; district: string | null } {
  if (!regionText) return { city: null, district: null };
  const trimmed = regionText.trim();

  // "서울 강남구" → city=서울, district=강남구
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    const maybeCity = parts[0];
    if (REGION_NAME_TO_CODE[maybeCity] || REGION_NAME_TO_CODE[maybeCity.toLowerCase().replace(/시$|도$|특별시$|광역시$/, "")]) {
      return { city: maybeCity, district: parts.slice(1).join(" ") };
    }
  }

  // 단일 단어 — 시도인지 구/동인지 판별
  const norm = trimmed.toLowerCase().replace(/시$|도$|특별시$|광역시$|특별자치시$|특별자치도$/, "");
  if (REGION_NAME_TO_CODE[norm] || REGION_NAME_TO_CODE[trimmed] || REGION_NAME_TO_CODE[trimmed.toLowerCase()]) {
    return { city: trimmed, district: null };
  }

  // 구/동이면 district로
  return { city: null, district: trimmed };
}

// ─── 2단계: DB 검색 (Supabase RPC) ───

// 최소 보장 결과 수 — 어떤 검색이든 이 수 이상 노출
const MIN_RESULTS = 10;

// RPC 호출 헬퍼
async function rpcSearch(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  params: { subject: string; keyword: string; region: string; type: string; page: number; limit: number },
): Promise<Record<string, unknown>[]> {
  const { data, error } = await supabase.rpc("search_clinics_ranked", {
    p_subject: params.subject,
    p_keyword: params.keyword,
    p_region: params.region,
    p_type: params.type,
    p_page: params.page,
    p_limit: params.limit,
  });
  if (error || !data) return [];
  return data;
}

// 중복 제거하며 결과 병합 (ykiho 기준)
function mergeResults(
  existing: Record<string, unknown>[],
  additional: Record<string, unknown>[],
  limit: number,
): Record<string, unknown>[] {
  const seen = new Set(existing.map((c) => c.ykiho as string));
  const merged = [...existing];
  for (const c of additional) {
    if (merged.length >= limit) break;
    if (!seen.has(c.ykiho as string)) {
      seen.add(c.ykiho as string);
      merged.push(c);
    }
  }
  return merged;
}

export async function searchClinics(
  intent: SearchIntent,
  page: number = 1,
  limit: number = 10
): Promise<{ clinics: ClinicResult[]; totalCount: number }> {
  const supabase = createServiceRoleClient();

  // city/district 분리 — GPT 응답에 region_city가 있으면 직접 사용, 없으면 region 파싱
  let city = intent.region_city;
  let district = intent.region_district;
  if (!city && !district && intent.region) {
    const parsed = parseRegionString(intent.region);
    city = parsed.city;
    district = parsed.district;
  }

  const { code: regionCode, districtKeyword } = resolveRegion(city, district);
  const subject = intent.subject_code || "";
  const type = intent.clinic_type === "korean_medicine" ? "korean_medicine" : "";

  const procedureKw = intent.keyword?.trim() || "";
  const combinedKeyword = [districtKeyword, procedureKw].filter(Boolean).join(" ");
  const minRequired = Math.max(MIN_RESULTS, limit);

  // 점진적 조건 완화 검색 전략
  // 조건이 좁은 순서대로 시도하고, 결과가 부족하면 다음 단계 결과를 합침
  const searchSteps: { keyword: string; region: string; subject: string; label: string }[] = [];

  // 1차: 구/동 + 시술 키워드 (가장 정밀)
  const kw1 = combinedKeyword || districtKeyword;
  if (kw1) searchSteps.push({ keyword: kw1, region: regionCode, subject, label: "district+procedure" });

  // 2차: 구/동만
  if (districtKeyword && districtKeyword !== kw1) {
    searchSteps.push({ keyword: districtKeyword, region: regionCode, subject, label: "district-only" });
  }

  // 3차: 시술 키워드만 (지역 내)
  if (procedureKw && regionCode) {
    searchSteps.push({ keyword: procedureKw, region: regionCode, subject, label: "procedure+region" });
  }

  // 4차: 키워드 없이 (지역+진료과)
  if (regionCode || subject) {
    searchSteps.push({ keyword: "", region: regionCode, subject, label: "region+subject" });
  }

  // 5차: 진료과만 (지역 제한 해제)
  if (subject && regionCode) {
    searchSteps.push({ keyword: "", region: "", subject, label: "subject-only" });
  }

  // 6차: 전체 (최후 보장 — 인기순)
  searchSteps.push({ keyword: "", region: "", subject: "", label: "all" });

  try {
    let accumulated: Record<string, unknown>[] = [];
    let bestTotalCount = 0;

    for (const step of searchSteps) {
      if (accumulated.length >= minRequired) break;

      const data = await rpcSearch(supabase, {
        subject: step.subject,
        keyword: step.keyword,
        region: step.region,
        type,
        page,
        limit: minRequired,
      });

      if (data.length > 0) {
        const stepTotal = Number(data[0]?.total_count) || data.length;
        if (stepTotal > bestTotalCount) bestTotalCount = stepTotal;

        accumulated = mergeResults(accumulated, data, minRequired);
      }
    }

    return {
      clinics: mapClinicData(accumulated),
      totalCount: Math.max(bestTotalCount, accumulated.length),
    };
  } catch {
    return { clinics: [], totalCount: 0 };
  }
}

// DB 결과 → ClinicResult 매핑
function mapClinicData(data: Record<string, unknown>[]): ClinicResult[] {
  return data.map((c) => ({
    ykiho: (c.ykiho as string) || "",
    name: (c.name as string) || "",
    cl_cd_nm: (c.cl_cd_nm as string) || "",
    dgsbjt_cd_nm: (c.dgsbjt_cd_nm as string) || "",
    address: (c.address as string) || "",
    phone: (c.phone as string) || "",
    website: (c.website as string) || "",
    dr_tot_cnt: (c.dr_tot_cnt as number) || 0,
    sdr_cnt: (c.sdr_cnt as number) || 0,
    sido_cd_nm: (c.sido_cd_nm as string) || "",
    sggu_cd_nm: (c.sggu_cd_nm as string) || "",
    google_rating: (c.google_rating as number) || null,
    google_review_count: (c.google_review_count as number) || null,
    relevance_score: (c.relevance_score as number) || null,
    anesthesia_sdr_count: Number(c.anesthesia_sdr_count) || 0,
    safe_anesthesia_badge: Boolean(c.safe_anesthesia_badge) || false,
    naver_blog_mentions: (c.naver_blog_mentions as number) || 0,
    naver_positive_ratio: (c.naver_positive_ratio as number) || null,
    naver_reputation_score: (c.naver_reputation_score as number) || null,
  }));
}

// ─── 3단계: AI 설명 생성 (Claude Sonnet) ───

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

function formatClinicsForNarrative(clinics: ClinicResult[]): string {
  return clinics
    .map((c, i) => {
      const parts = [
        `${i + 1}. ${c.name}`,
        [c.sido_cd_nm, c.sggu_cd_nm].filter(Boolean).join(" "),
        c.address,
        c.dr_tot_cnt > 0 ? `의사 ${c.dr_tot_cnt}명` : null,
        c.sdr_cnt > 0 ? `전문의 ${c.sdr_cnt}명` : null,
        c.safe_anesthesia_badge ? `마취과 전문의 ${c.anesthesia_sdr_count}명 상주` : null,
        c.google_rating ? `구글 ${c.google_rating}점 (${c.google_review_count || 0}건 리뷰)` : null,
        c.naver_blog_mentions > 0 ? `네이버 블로그 ${c.naver_blog_mentions}건 언급${c.naver_positive_ratio ? ` (긍정 ${c.naver_positive_ratio}%)` : ""}` : null,
        c.dgsbjt_cd_nm || null,
        c.website ? `홈페이지: ${c.website}` : null,
        c.phone ? `전화: ${c.phone}` : null,
      ].filter(Boolean);
      return parts.join(", ");
    })
    .join("\n");
}

export async function composeNarrative(
  query: string,
  clinics: ClinicResult[],
  totalCount: number,
  locale: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return fallbackNarrative(clinics, locale);

  const top5 = clinics.slice(0, 5);
  const clinicText = formatClinicsForNarrative(top5);
  const isKorean = locale === "ko";

  const systemPrompt = isKorean
    ? `당신은 K-Beauty Buyers Guide의 AI 추천 큐레이터입니다. 심평원 공공데이터와 구글 별점을 기반으로 병원을 추천합니다.

규칙:
- 각 병원을 추천하는 **구체적 근거**를 반드시 명시하세요. 예시:
  · "전문의 N명이 상주하며" (심평원 데이터 기반)
  · "구글 평점 N.N점, 리뷰 N건" (구글 데이터 기반)
  · "네이버 블로그 N건 언급, 긍정률 N%" (네이버 블로그 데이터)
  · "마취과 전문의 상주로 안전성 확보" (심평원 마취과 데이터)
  · "XX구에 위치하여 접근성 우수" (위치 데이터)
- 각 병원의 홈페이지 주소와 전화번호를 반드시 포함하세요.
- 추천 근거가 없는 막연한 추천은 하지 마세요. 데이터에 기반한 사실만 언급하세요.
- "제한이 있을 수 있습니다", "확인이 필요합니다" 같은 부정적 표현을 사용하지 마세요.
- 친절하고 확신 있는 톤으로 작성하세요.
- 마크다운 볼드(**병원명**)를 사용하세요.`
    : `You are the AI recommendation curator for K-Beauty Buyers Guide. You recommend hospitals based on verified HIRA public data and Google ratings.

Rules:
- Always state **specific reasons** for recommending each hospital. Examples:
  · "With N board-certified specialists" (HIRA data)
  · "Google rating N.N with N reviews" (Google data)
  · "Mentioned in N Naver blog posts, N% positive" (Naver blog data)
  · "Anesthesiologist on staff for safety" (HIRA anesthesia data)
  · "Conveniently located in XX district" (location data)
- Always include the hospital's website URL and phone number.
- Never make vague recommendations without data-backed evidence.
- Never use uncertain or negative expressions.
- Write in a confident, friendly tone.
- Use markdown bold (**hospital name**).`;

  const langInstruction = isKorean ? "반드시 한국어로 답변하세요." : `Answer in the user's language (locale: ${locale}).`;

  const userMessage = clinics.length === 0
    ? `사용자 질문: "${query}"\n\n검색 조건에 맞는 병원이 DB에 없습니다. 다른 조건으로 검색해보라고 안내해주세요. ${langInstruction}`
    : `사용자 질문: "${query}"\n\n심평원 공공데이터 기준 총 ${totalCount.toLocaleString()}개 병원이 검색되었습니다. 상위 ${top5.length}개:\n${clinicText}\n\n위 병원들의 장점을 강조하며 추천 이유를 설명하세요. ${langInstruction}`;

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) throw new Error(`Claude error: ${response.status}`);

    const data = await response.json();
    const content = data.content?.[0];
    if (content?.type === "text") return content.text as string;
    throw new Error("Unexpected Claude response");
  } catch {
    return fallbackNarrative(clinics, locale);
  }
}

// Claude 타임아웃 시 템플릿 폴백
function fallbackNarrative(clinics: ClinicResult[], locale: string): string {
  if (clinics.length === 0) {
    return locale === "ko"
      ? "조건에 맞는 병원을 찾고 있습니다. 다른 조건으로 검색해 보세요."
      : "We're looking for matching clinics. Please try different search criteria.";
  }
  const top = clinics[0];
  const isKo = locale === "ko";
  return isKo
    ? `심평원 공공데이터 기준 **${top.name}** 등 ${clinics.length}개 병원을 찾았습니다. 전문의 수, 구글 별점 등을 종합하여 추천 순서를 결정했습니다.`
    : `We found ${clinics.length} clinics including **${top.name}** based on verified HIRA data. Rankings consider specialist count, Google ratings, and more.`;
}
