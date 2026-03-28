"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import type { CosmeticsRankingItem } from "@/app/api/cosmetics/route";

const CATEGORIES = ["전체", "스킨케어", "메이크업", "선케어", "클렌징"] as const;
type Category = (typeof CATEGORIES)[number];

// 가격 포맷 — lprice는 문자열 숫자 (예: "15000")
function formatPrice(lprice: string): string {
  if (!lprice) return "-";
  return Number(lprice).toLocaleString("ko-KR") + "원~";
}

export default function CosmeticsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "ko";
  const isKo = locale === "ko";

  const [category, setCategory] = useState<Category>("전체");
  const [items, setItems] = useState<CosmeticsRankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/cosmetics?category=${encodeURIComponent(category)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error(data.error ?? "Unknown error");
        setItems(data.data);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <main className="min-h-screen bg-white">
      {/* 히어로 */}
      <section className="bg-gradient-to-br from-pink-50 to-orange-50 px-4 py-12 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-pink-500">
            {isKo ? "네이버 쇼핑 베스트" : "Naver Shopping Best"}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {isKo ? "실시간 화장품 TOP 20" : "Real-time Cosmetics TOP 20"}
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            {isKo
              ? "네이버 쇼핑 기준 인기 화장품 랭킹"
              : "Popular cosmetics ranking based on Naver Shopping"}
          </p>
        </div>
      </section>

      {/* 카테고리 탭 */}
      <section className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-3xl flex overflow-x-auto px-4 py-3 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                category === cat
                  ? "bg-pink-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 랭킹 목록 */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-3">
          {loading && (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
            </div>
          )}

          {error && (
            <p className="py-10 text-center text-sm text-red-500">{error}</p>
          )}

          {!loading && !error && items.map((item) => (
            <a
              key={item.productId || item.rank}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              {/* 순위 */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  item.rank <= 3
                    ? "bg-pink-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {item.rank}
              </div>

              {/* 이미지 */}
              {item.image && (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="56px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}

              {/* 제품 정보 */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-800">
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {item.brand ? `${item.brand} · ` : ""}{item.mallName}
                </p>
              </div>

              {/* 가격 */}
              <div className="shrink-0 text-sm font-semibold text-pink-500">
                {formatPrice(item.lprice)}
              </div>
            </a>
          ))}

          {!loading && !error && items.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">
              {isKo ? "결과가 없습니다." : "No results found."}
            </p>
          )}

          {!loading && !error && items.length > 0 && (
            <p className="mt-8 text-center text-xs text-gray-400">
              {isKo
                ? "출처: 네이버 쇼핑 | 매일 업데이트"
                : "Source: Naver Shopping | Updated daily"}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
