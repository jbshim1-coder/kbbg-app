// 네이버 블로그 검색 API — 병원별 시술 언급도 측정
// 환경변수: NAVER_CLIENT_ID, NAVER_CLIENT_SECRET

const NAVER_SEARCH_URL = "https://openapi.naver.com/v1/search/blog.json";

export interface BlogMentionScore {
  clinicName: string;
  procedure: string;
  totalMentions: number;
  query: string;
}

// 병원명 + 시술명으로 네이버 블로그 언급 수 조회
export async function fetchBlogMentions(
  clinicName: string,
  procedure: string
): Promise<BlogMentionScore | null> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const query = `${clinicName} ${procedure}`;

  try {
    const url = `${NAVER_SEARCH_URL}?query=${encodeURIComponent(query)}&display=1&sort=sim`;
    const res = await fetch(url, {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return {
      clinicName,
      procedure,
      totalMentions: data.total || 0,
      query,
    };
  } catch {
    return null;
  }
}

// 여러 시술에 대한 블로그 언급도 일괄 조회
export async function fetchBulkBlogMentions(
  clinicName: string,
  procedures: string[]
): Promise<Record<string, number>> {
  const scores: Record<string, number> = {};

  for (const proc of procedures) {
    const result = await fetchBlogMentions(clinicName, proc);
    if (result && result.totalMentions > 0) {
      scores[proc] = result.totalMentions;
    }
    // API rate limit (100ms)
    await new Promise((r) => setTimeout(r, 100));
  }

  return scores;
}
