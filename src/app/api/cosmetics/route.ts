// 화장품 랭킹 API — 네이버 쇼핑에서 카테고리별 TOP 20 반환
// 24시간 캐시 적용 (revalidate: 86400)

import { NextRequest } from "next/server";
import { fetchNaverShopRanking, NaverShopItem } from "@/lib/naver-shop";

// 24시간마다 재검증 — 일일 API 호출 5건으로 제한 유지
export const revalidate = 86400;

// 카테고리별 네이버 쇼핑 검색어 매핑
const CATEGORY_QUERIES: Record<string, string> = {
  전체: "화장품 베스트셀러",
  스킨케어: "스킨케어 베스트",
  메이크업: "메이크업 베스트",
  선케어: "선크림 베스트",
  클렌징: "클렌징 베스트",
};

export interface CosmeticsRankingItem {
  rank: number;
  title: string;
  brand: string;
  image: string;
  link: string;
  lprice: string;
  mallName: string;
  productId: string;
}

// GET /api/cosmetics?category=스킨케어 — 카테고리별 네이버 쇼핑 TOP 20 반환
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "전체";

  const query = CATEGORY_QUERIES[category];
  if (!query) {
    return Response.json(
      { error: `지원하지 않는 카테고리: ${category}` },
      { status: 400 }
    );
  }

  try {
    const items: NaverShopItem[] = await fetchNaverShopRanking(query, 20, "sim");

    const ranked: CosmeticsRankingItem[] = items.map((item, index) => ({
      rank: index + 1,
      title: item.title,
      brand: item.brand,
      image: item.image,
      link: item.link,
      lprice: item.lprice,
      mallName: item.mallName,
      productId: item.productId,
    }));

    return Response.json({
      success: true,
      category,
      data: ranked,
      total: ranked.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { error: `네이버 쇼핑 API 오류: ${message}` },
      { status: 500 }
    );
  }
}
