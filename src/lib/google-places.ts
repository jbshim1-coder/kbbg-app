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
