// Google Places API 클라이언트 — 병원의 구글 별점과 리뷰 수 조회
// 사용법: fetchGoogleRating("아름다운성형외과 강남")

export interface GoogleRating {
  rating: number;       // 구글 별점 (1.0 ~ 5.0)
  reviewCount: number;  // 구글 리뷰 수
  placeId: string;      // Google Place ID
}

// 병원명으로 구글 별점 조회
export async function fetchGoogleRating(clinicName: string, address?: string): Promise<GoogleRating | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  try {
    // 1단계: 병원명으로 Place 검색
    const query = address ? `${clinicName} ${address}` : `${clinicName} 한국`;
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,rating,user_ratings_total&key=${apiKey}`;

    const res = await fetch(searchUrl);
    const data = await res.json();

    if (data.candidates && data.candidates.length > 0) {
      const place = data.candidates[0];
      return {
        rating: place.rating || 0,
        reviewCount: place.user_ratings_total || 0,
        placeId: place.place_id || "",
      };
    }

    return null;
  } catch {
    return null;
  }
}

// ─── 시술 키워드 사전 ───
// 시술 카테고리별 관련 키워드 (리뷰에서 매칭)
export const PROCEDURE_KEYWORDS: Record<string, string[]> = {
  눈성형: ["쌍수", "쌍꺼풀", "트임", "눈매교정", "눈밑", "눈성형", "눈수술", "앞트임", "뒤트임", "눈재수술", "eye surgery", "double eyelid", "blepharoplasty"],
  코성형: ["코끝", "콧대", "비중격", "코수술", "코성형", "코재수술", "매부리", "nose job", "rhinoplasty"],
  윤곽: ["윤곽", "양악", "사각턱", "광대", "턱끝", "v라인", "안면윤곽", "jaw", "facial contouring"],
  리프팅: ["리프팅", "울쎄라", "써마지", "실리프팅", "올림술", "lifting", "ulthera", "thermage"],
  피부: ["레이저", "보톡스", "필러", "여드름", "기미", "모공", "피부", "토닝", "피코", "skin", "botox", "filler", "laser"],
  치과: ["임플란트", "교정", "라미네이트", "미백", "충치", "치아", "스케일링", "dental", "implant", "braces"],
  눈시력: ["라식", "라섹", "렌즈삽입", "시력교정", "안과", "lasik", "lasek", "eye correction"],
  체형: ["지방흡입", "다이어트", "체형", "복부", "허벅지", "liposuction", "body contouring"],
  모발: ["탈모", "모발이식", "헤어라인", "hair transplant", "hair loss"],
};

// 리뷰 텍스트에서 시술 키워드 분석
export interface ReviewAnalysis {
  placeId: string;
  totalReviews: number;
  procedureScores: Record<string, { mentions: number; positiveRate: number }>;
  reviews: { text: string; rating: number; time: string }[];
}

// Place Details API로 리뷰 텍스트 수집
export async function fetchGoogleReviews(placeId: string): Promise<ReviewAnalysis | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&language=ko&reviews_sort=newest&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK" || !data.result?.reviews) return null;

    const reviews = data.result.reviews.map((r: { text: string; rating: number; relative_time_description?: string }) => ({
      text: r.text || "",
      rating: r.rating || 0,
      time: r.relative_time_description || "",
    }));

    // 시술별 키워드 매칭 + 긍정률 계산
    const procedureScores: Record<string, { mentions: number; positiveRate: number }> = {};

    for (const [procedure, keywords] of Object.entries(PROCEDURE_KEYWORDS)) {
      let mentions = 0;
      let positiveCount = 0;

      for (const review of reviews) {
        const text = review.text.toLowerCase();
        const matched = keywords.some((kw) => text.includes(kw.toLowerCase()));
        if (matched) {
          mentions++;
          if (review.rating >= 4) positiveCount++;
        }
      }

      if (mentions > 0) {
        procedureScores[procedure] = {
          mentions,
          positiveRate: Math.round((positiveCount / mentions) * 100),
        };
      }
    }

    return { placeId, totalReviews: reviews.length, procedureScores, reviews };
  } catch {
    return null;
  }
}

// 병원명+주소로 place_id 찾기 + 리뷰 분석 한번에
export async function analyzeClinicReviews(clinicName: string, address?: string): Promise<ReviewAnalysis | null> {
  const rating = await fetchGoogleRating(clinicName, address);
  if (!rating?.placeId) return null;
  return fetchGoogleReviews(rating.placeId);
}

// 여러 병원의 구글 별점 일괄 조회 (일일 동기화용)
export async function fetchBulkGoogleRatings(
  clinics: { name: string; address?: string }[]
): Promise<Map<string, GoogleRating>> {
  const results = new Map<string, GoogleRating>();

  for (const clinic of clinics) {
    const rating = await fetchGoogleRating(clinic.name, clinic.address);
    if (rating) {
      results.set(clinic.name, rating);
    }
    // API rate limit 방지 (100ms 간격)
    await new Promise((r) => setTimeout(r, 100));
  }

  return results;
}
