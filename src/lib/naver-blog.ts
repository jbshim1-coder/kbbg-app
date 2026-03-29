// 네이버 블로그 검색 API — 병원 화제성(블로그 리뷰 수) 조회
// "OO병원 후기"로 검색 → total = 블로그 게시물 수 = 화제성 지표

const NAVER_BLOG_URL = "https://openapi.naver.com/v1/search/blog.json";

export interface BlogPopularity {
  total: number;     // 블로그 검색 결과 수 (화제성)
  query: string;     // 검색어
}

// 병원명으로 네이버 블로그 화제성 조회
export async function fetchBlogPopularity(clinicName: string): Promise<BlogPopularity | null> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  try {
    const query = `${clinicName} 후기`;
    const url = `${NAVER_BLOG_URL}?query=${encodeURIComponent(query)}&display=1`;

    const res = await fetch(url, {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return {
      total: data.total || 0,
      query,
    };
  } catch {
    return null;
  }
}

// 여러 병원의 블로그 화제성 일괄 조회
export async function fetchBulkBlogPopularity(
  clinicNames: string[]
): Promise<Map<string, number>> {
  const results = new Map<string, number>();

  for (const name of clinicNames) {
    const pop = await fetchBlogPopularity(name);
    if (pop) results.set(name, pop.total);
    // API rate limit 방지 (100ms 간격)
    await new Promise((r) => setTimeout(r, 100));
  }

  return results;
}
