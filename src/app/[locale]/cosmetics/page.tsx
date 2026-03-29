"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import type { CosmeticsRankingItem } from "@/app/api/cosmetics/route";
import { oliveyoungTop20 } from "@/data/cosmetics-oliveyoung";
import { glowpickTop20 } from "@/data/cosmetics-glowpick";
import { hwahaeTop20 } from "@/data/cosmetics-hwahae";
import type { ManualCosmeticsItem } from "@/data/cosmetics-oliveyoung";

const CATEGORIES = ["전체", "스킨케어", "메이크업", "선케어", "클렌징"] as const;
type Category = (typeof CATEGORIES)[number];

type SourceTab = "naver" | "oliveyoung" | "glowpick" | "hwahae";

const SOURCE_TABS: { id: SourceTab; labelKo: string; labelEn: string }[] = [
  { id: "naver", labelKo: "네이버 쇼핑", labelEn: "Naver Shopping" },
  { id: "oliveyoung", labelKo: "올리브영", labelEn: "Olive Young" },
  { id: "glowpick", labelKo: "글로우픽", labelEn: "Glowpick" },
  { id: "hwahae", labelKo: "화해", labelEn: "Hwahae" },
];

const MANUAL_DATA: Record<Exclude<SourceTab, "naver">, ManualCosmeticsItem[]> = {
  oliveyoung: oliveyoungTop20,
  glowpick: glowpickTop20,
  hwahae: hwahaeTop20,
};

const SOURCE_META: Record<
  SourceTab,
  { sourceKo: string; sourceEn: string; updateKo: string; updateEn: string }
> = {
  naver: {
    sourceKo: "출처: 네이버 쇼핑",
    sourceEn: "Source: Naver Shopping",
    updateKo: "매일 업데이트",
    updateEn: "Updated daily",
  },
  oliveyoung: {
    sourceKo: "출처: 올리브영",
    sourceEn: "Source: Olive Young",
    updateKo: "매주 월요일 기준 1주일 데이터",
    updateEn: "Weekly data based on Monday",
  },
  glowpick: {
    sourceKo: "출처: 글로우픽",
    sourceEn: "Source: Glowpick",
    updateKo: "매주 월요일 기준 1주일 데이터",
    updateEn: "Weekly data based on Monday",
  },
  hwahae: {
    sourceKo: "출처: 화해",
    sourceEn: "Source: Hwahae",
    updateKo: "매주 월요일 기준 1주일 데이터",
    updateEn: "Weekly data based on Monday",
  },
};

// 가격 포맷 — lprice는 문자열 숫자 (예: "15000")
function formatPrice(lprice: string): string {
  if (!lprice) return "-";
  return Number(lprice).toLocaleString("ko-KR") + "원~";
}

export default function CosmeticsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "ko";
  const isKo = locale === "ko";

  const [source, setSource] = useState<SourceTab>("naver");
  const [category, setCategory] = useState<Category>("전체");
  const [items, setItems] = useState<CosmeticsRankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 네이버 탭일 때만 API 호출
  useEffect(() => {
    if (source !== "naver") return;

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
  }, [source, category]);

  const meta = SOURCE_META[source];
  const manualItems = source !== "naver" ? MANUAL_DATA[source] : null;

  return (
    <main className="min-h-screen bg-white">
      {/* 히어로 */}
      <section className="bg-gradient-to-br from-slate-50 to-orange-50 px-4 py-12 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
            {isKo ? "화장품 랭킹" : "Cosmetics Ranking"}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {isKo ? "인기 화장품 TOP 20" : "Popular Cosmetics TOP 20"}
          </h1>
          {/* 기준일 표시 — 매주 월요일 기준 1주일 */}
          {(() => {
            const now = new Date();
            const day = now.getDay();
            const monday = new Date(now);
            monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            const year = monday.getFullYear();
            const month = monday.getMonth() + 1;
            const week = Math.ceil(monday.getDate() / 7);
            const fmt = (d: Date) => `${d.getMonth()+1}.${d.getDate()}`;
            return (
              <p className="mt-2 text-xs text-teal-600 font-medium">
                {isKo
                  ? `📅 ${year}년 ${month}월 ${week}주차 기준 (${fmt(monday)} ~ ${fmt(sunday)})`
                  : `📅 ${year} Week ${week} of ${month} (${fmt(monday)} ~ ${fmt(sunday)})`}
              </p>
            );
          })()}
          <p className="mt-1 text-sm text-gray-500">
            {isKo
              ? "매주 월요일 기준 1주일 데이터 집계"
              : "Weekly data aggregated every Monday"}
          </p>
        </div>
      </section>

      {/* 소스 탭 + 카테고리 탭 */}
      <section className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        {/* 소스 탭 */}
        <div className="mx-auto max-w-3xl flex overflow-x-auto px-4 pt-3 gap-2 border-b border-gray-100">
          {SOURCE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSource(tab.id)}
              className={`shrink-0 px-4 py-2 text-sm font-semibold border-b-2 transition ${
                source === tab.id
                  ? "border-pink-500 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {isKo ? tab.labelKo : tab.labelEn}
            </button>
          ))}
        </div>

        {/* 카테고리 탭 — 네이버 탭일 때만 표시 */}
        {source === "naver" && (
          <div className="mx-auto max-w-3xl flex overflow-x-auto px-4 py-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  category === cat
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 랭킹 목록 */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-3">
          {/* 네이버: API 데이터 */}
          {source === "naver" && (
            <>
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
                  className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-sm"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      item.rank <= 3
                        ? "bg-teal-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.rank}
                  </div>

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

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-800">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {item.brand ? `${item.brand} · ` : ""}{item.mallName}
                    </p>
                  </div>

                  <div className="shrink-0 text-sm font-semibold text-teal-600">
                    {formatPrice(item.lprice)}
                  </div>
                </a>
              ))}

              {!loading && !error && items.length === 0 && (
                <p className="py-10 text-center text-sm text-gray-400">
                  {isKo ? "결과가 없습니다." : "No results found."}
                </p>
              )}
            </>
          )}

          {/* 올리브영 / 글로우픽 / 화해: 로컬 데이터 */}
          {source !== "naver" && manualItems && manualItems.map((item) => (
            <div
              key={item.rank}
              className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  item.rank <= 3
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {item.rank}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-800">
                  {isKo ? item.name : item.nameEn}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {item.brand} · {item.category}
                </p>
              </div>

              <div className="shrink-0 text-sm font-semibold text-teal-600">
                {item.price}
              </div>
            </div>
          ))}

          {/* 출처 표시 */}
          {(source !== "naver" || (!loading && !error && items.length > 0)) && (
            <p className="mt-8 text-center text-xs text-gray-400">
              {isKo
                ? `${meta.sourceKo} | ${meta.updateKo}`
                : `${meta.sourceEn} | ${meta.updateEn}`}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
