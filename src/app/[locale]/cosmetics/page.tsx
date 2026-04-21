"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import type { CosmeticsRankingItem } from "@/app/api/cosmetics/route";
import { oliveyoungTop20 } from "@/data/cosmetics-oliveyoung";
import { glowpickTop20 } from "@/data/cosmetics-glowpick";
import { hwahaeTop20 } from "@/data/cosmetics-hwahae";
import type { ManualCosmeticsItem } from "@/data/cosmetics-oliveyoung";

const CATEGORIES_KO = ["전체", "스킨케어", "메이크업", "선케어", "클렌징"] as const;
const CATEGORIES_EN: Record<string, string> = {
  "전체": "All", "스킨케어": "Skincare", "메이크업": "Makeup", "선케어": "Suncare", "클렌징": "Cleansing"
};
type Category = (typeof CATEGORIES_KO)[number];

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
  { sourceKey: string; updateKey: string }
> = {
  naver: { sourceKey: "ui.source_naver", updateKey: "ui.data_daily" },
  oliveyoung: { sourceKey: "ui.source_oliveyoung", updateKey: "ui.data_weekly" },
  glowpick: { sourceKey: "ui.source_glowpick", updateKey: "ui.data_weekly" },
  hwahae: { sourceKey: "ui.source_hwahae", updateKey: "ui.data_weekly" },
};

// 가격 포맷 — lprice는 문자열 숫자 (예: "15000")
function formatPrice(lprice: string, suffix: string): string {
  if (!lprice) return "-";
  return Number(lprice).toLocaleString() + suffix;
}

export default function CosmeticsPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params?.locale as string) || "ko";
  const isKo = locale === "ko";

  const [source, setSource] = useState<SourceTab>("naver");
  const [category, setCategory] = useState<Category>("전체");
  const catLabel = (cat: string) => isKo ? cat : (CATEGORIES_EN[cat] || cat);
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
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-700">
            {t("ui.cosmetics_ranking")}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {t("ui.popular_cosmetics_top20")}
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
              <p className="mt-2 text-xs text-slate-700 font-medium">
                {t("ui.weekly_range", { year, month, week, start: fmt(monday), end: fmt(sunday) })}
              </p>
            );
          })()}
          <p className="mt-1 text-sm text-gray-500">
            {t("ui.weekly_data")}
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
                  ? "border-pink-500 text-slate-700"
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
            {CATEGORIES_KO.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  category === cat
                    ? "bg-slate-800 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {catLabel(cat)}
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
                        ? "bg-slate-800 text-white"
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

                  <div className="shrink-0 text-sm font-semibold text-slate-700">
                    {formatPrice(item.lprice, t("ui.price_suffix"))}
                  </div>
                </a>
              ))}

              {!loading && !error && items.length === 0 && (
                <p className="py-10 text-center text-sm text-gray-400">
                  {t("ui.no_results")}
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
                    ? "bg-slate-800 text-white"
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

              <div className="shrink-0 text-sm font-semibold text-slate-700">
                {item.price}
              </div>
            </div>
          ))}

          {/* 출처 표시 */}
          {(source !== "naver" || (!loading && !error && items.length > 0)) && (
            <p className="mt-8 text-center text-xs text-gray-400">
              {t(meta.sourceKey as Parameters<typeof t>[0])} | {t(meta.updateKey as Parameters<typeof t>[0])}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
