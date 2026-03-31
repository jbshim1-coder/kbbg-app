// AI 검색 서비스 레이어
// parseIntent → searchClinics → composeNarrative 3단계 오케스트레이션
// /api/ai-search와 /api/clinics/search에서 공통으로 사용

import { createServiceRoleClient } from "@/lib/supabase";

// ─── 타입 정의 ───

export interface SearchIntent {
  region: string | null;
  subject_code: string | null;
  clinic_type: string | null;
  keyword: string;
  confidence: number;
  reason: string;
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
  naver_blog_count: number | null;
  relevance_score: number | null;
  anesthesia_sdr_count: number;
  safe_anesthesia_badge: boolean;
}

// ─── 1단계: 자연어 → 검색조건 추출 (GPT-4o-mini) ───

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const INTENT_SYSTEM_PROMPT = `당신은 병원 추천 검색 파라미터 추출기입니다.
사용자의 자연어 질문에서 병원 검색 조건을 JSON으로 추출하세요.

규칙:
- region: 지역명. "강남"→"강남구", "부산"→"부산" 등 정규화. 없으면 null
- subject_code: 진료과 코드만 반환. 모르면 null
  - 쌍꺼풀/코성형/윤곽/보톡스/필러/리프팅(얼굴) → "08" (성형외과)
  - 여드름/기미/피부/레이저/모공 → "14" (피부과)
  - 치아/임플란트/교정/미백 → "49" (치과)
  - 눈/시력/라식/라섹 → "12" (안과)
  - 다이어트/비만/지방흡입/체형 → "08" (성형외과)
  - 통증/허리/어깨/관절 → "05" (정형외과)
  - 탈모/모발이식 → "14" (피부과)
- clinic_type: "clinic"(의원), "hospital"(병원), "korean_medicine"(한의원). 모르면 null
- keyword: 핵심 검색 키워드 (한국어)
- confidence: 추출 확신도 0~1
- reason: 추출 근거 (한국어)

반드시 JSON만 반환하세요.`;

export async function parseIntent(query: string): Promise<SearchIntent> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { region: null, subject_code: null, clinic_type: null, keyword: query, confidence: 0, reason: "API key missing" };
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 300,
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
  return {
    region: parsed.region || null,
    subject_code: parsed.subject_code || null,
    clinic_type: parsed.clinic_type || null,
    keyword: parsed.keyword || query,
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

// 구/군 → 시도코드 매핑 (주요 지역)
const DISTRICT_TO_SIDO: Record<string, string> = {
  // 서울
  "강남구": "110000", "강남": "110000", "gangnam": "110000",
  "서초구": "110000", "서초": "110000", "seocho": "110000",
  "송파구": "110000", "송파": "110000",
  "강동구": "110000", "강서구": "110000", "관악구": "110000",
  "광진구": "110000", "구로구": "110000", "금천구": "110000",
  "노원구": "110000", "도봉구": "110000", "동대문구": "110000",
  "동작구": "110000", "마포구": "110000", "서대문구": "110000",
  "성동구": "110000", "성북구": "110000", "양천구": "110000",
  "영등포구": "110000", "용산구": "110000", "은평구": "110000",
  "종로구": "110000", "중구": "110000", "중랑구": "110000",
  "명동": "110000", "홍대": "110000", "신촌": "110000", "압구정": "110000",
  // 부산
  "해운대구": "210000", "해운대": "210000", "haeundae": "210000",
  "수영구": "210000", "부산진구": "210000", "동래구": "210000",
  "남구": "210000", "연제구": "210000", "사하구": "210000",
  "북구": "210000", "사상구": "210000", "금정구": "210000",
  "서면": "210000",
  // 대구
  "수성구": "220000", "달서구": "220000", "동구": "220000",
  // 인천
  "연수구": "230000", "남동구": "230000", "부평구": "230000", "계양구": "230000",
  "송도": "230000",
};

// 지역명 → { sido_cd, district } 변환
function resolveRegion(regionText: string | null): { code: string; district: string } {
  if (!regionText) return { code: "", district: "" };
  const trimmed = regionText.trim();

  // 이미 6자리 숫자 코드면 바로 반환
  if (/^\d{6}$/.test(trimmed)) return { code: trimmed, district: "" };

  // 시도 이름 직접 매칭
  const normalized = trimmed.toLowerCase().replace(/시$|도$|특별시$|광역시$|특별자치시$|특별자치도$/, "");
  const directMatch = REGION_NAME_TO_CODE[normalized] || REGION_NAME_TO_CODE[trimmed] || REGION_NAME_TO_CODE[trimmed.toLowerCase()];
  if (directMatch) return { code: directMatch, district: "" };

  // 구/군 매칭 → 시도코드 + 구이름을 키워드로
  const districtMatch = DISTRICT_TO_SIDO[trimmed] || DISTRICT_TO_SIDO[trimmed.replace(/구$|군$/, "")] || DISTRICT_TO_SIDO[trimmed.toLowerCase()];
  if (districtMatch) return { code: districtMatch, district: trimmed.replace(/구$/, "") };

  // "서울 서초" 같이 공백으로 구분된 경우
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    const cityCode = REGION_NAME_TO_CODE[parts[0]] || REGION_NAME_TO_CODE[parts[0].toLowerCase()];
    if (cityCode) return { code: cityCode, district: parts.slice(1).join(" ").replace(/구$/, "") };
  }

  return { code: "", district: "" };
}

// ─── 2단계: DB 검색 (Supabase RPC) ───

export async function searchClinics(
  intent: SearchIntent,
  page: number = 1,
  limit: number = 10
): Promise<{ clinics: ClinicResult[]; totalCount: number }> {
  const supabase = createServiceRoleClient();

  const { code: region, district } = resolveRegion(intent.region);
  const subject = intent.subject_code || "";
  const keyword = district;
  const type = intent.clinic_type === "korean_medicine" ? "korean_medicine" : "";

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

    if (error || !data || data.length === 0) {
      return { clinics: [], totalCount: 0 };
    }

    const clinics: ClinicResult[] = data.map((c: Record<string, unknown>) => ({
      ykiho: c.ykiho || "",
      name: c.name || "",
      cl_cd_nm: c.cl_cd_nm || "",
      dgsbjt_cd_nm: c.dgsbjt_cd_nm || "",
      address: c.address || "",
      phone: c.phone || "",
      website: c.website || "",
      dr_tot_cnt: c.dr_tot_cnt || 0,
      sdr_cnt: c.sdr_cnt || 0,
      sido_cd_nm: c.sido_cd_nm || "",
      sggu_cd_nm: c.sggu_cd_nm || "",
      google_rating: c.google_rating || null,
      google_review_count: c.google_review_count || null,
      naver_blog_count: c.naver_blog_count || null,
      relevance_score: c.relevance_score || null,
      anesthesia_sdr_count: Number(c.anesthesia_sdr_count) || 0,
      safe_anesthesia_badge: Boolean(c.safe_anesthesia_badge) || false,
    }));

    return {
      clinics,
      totalCount: Number(data[0]?.total_count) || clinics.length,
    };
  } catch {
    return { clinics: [], totalCount: 0 };
  }
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
        c.google_rating ? `구글 ${c.google_rating}점 (${c.google_review_count || 0}건)` : null,
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
- 검색 결과 병원들을 긍정적으로 소개하세요.
- 각 병원의 장점(전문의 수, 구글 별점, 위치 등)을 강조하세요.
- 병원의 홈페이지 주소와 전화번호를 반드시 포함하세요.
- "제한이 있을 수 있습니다", "확인이 필요합니다" 같은 부정적 표현을 사용하지 마세요.
- 친절하고 확신 있는 톤으로 3~5문장 작성하세요.
- 마크다운 볼드(**병원명**)를 사용하세요.`
    : `You are the AI recommendation curator for K-Beauty Buyers Guide. You recommend hospitals based on verified HIRA public data and Google ratings.

Rules:
- Present search results positively and confidently.
- Highlight each hospital's strengths (specialist count, Google rating, location).
- Always include the hospital's website URL and phone number.
- Never use uncertain or negative expressions.
- Write 3-5 sentences in a confident, friendly tone.
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
