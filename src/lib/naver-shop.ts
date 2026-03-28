// 네이버 쇼핑 API 클라이언트 — 화장품 랭킹 검색
// 일일 25,000건 제한 — 카테고리 5개 × 매일 = 5건으로 여유 충분

export interface NaverShopItem {
  title: string;      // 제품명 (HTML 태그 제거 필요)
  link: string;       // 네이버 쇼핑 링크
  image: string;      // 제품 이미지 URL
  lprice: string;     // 최저가
  hprice: string;     // 최고가
  mallName: string;   // 판매 쇼핑몰명
  productId: string;  // 네이버 상품 ID
  brand: string;      // 브랜드명
}

interface NaverShopResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverShopItem[];
}

// HTML 태그 제거 — title 필드에 <b> 태그가 포함되어 있음
function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

export async function fetchNaverShopRanking(
  query: string,
  display: number = 20,
  sort: "sim" | "date" | "asc" | "dsc" = "sim"
): Promise<NaverShopItem[]> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("NAVER_CLIENT_ID or NAVER_CLIENT_SECRET is not set");
  }

  const url = `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(query)}&display=${display}&sort=${sort}`;

  const res = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
  });

  if (!res.ok) {
    throw new Error(`Naver API error: ${res.status} ${res.statusText}`);
  }

  const data: NaverShopResponse = await res.json();

  return data.items.map((item) => ({
    ...item,
    title: stripHtml(item.title),
    brand: stripHtml(item.brand),
  }));
}
