"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import eventsData from "@/data/events-data.json";

const EVENTS = eventsData.events;

type FilterType = "all" | "피부과" | "성형외과" | "안과";

const FILTER_LABELS: Record<FilterType, string> = {
  all: "ui.all",
  "피부과": "ui.filter_derma",
  "성형외과": "ui.filter_plastic",
  "안과": "ui.filter_eye",
};

export default function EventsPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const isKo = locale === "ko";
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = filter === "all" ? EVENTS : EVENTS.filter(e => e.category === filter);

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-100 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("ui.events_title")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("ui.events_description")}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {t("ui.last_updated", { date: eventsData.updatedAt ?? "" })}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* 필터 */}
        {/* 필터 버튼 — 최소 44px 터치 타겟 보장 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all", "피부과", "성형외과", "안과"] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-rose-400 text-white"
                  : "bg-white border border-stone-200 text-gray-600 hover:bg-stone-50"
              }`}
            >
              {t(FILTER_LABELS[f] as Parameters<typeof t>[0])}
            </button>
          ))}
        </div>

        {/* 이벤트 목록 */}
        <div className="space-y-4">
          {filtered.map(event => (
            <div key={event.id} className="bg-white rounded-lg border border-stone-200 p-5">
              <div className="flex items-start justify-between mb-3 gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-white bg-rose-400 px-2 py-0.5 rounded whitespace-nowrap">
                      {event.category}
                    </span>
                    <span className="text-xs text-gray-400">{event.area}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 break-words">{event.clinic}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">{event.title}</p>
                </div>
                {event.url && (
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-stone-600 hover:underline shrink-0 min-h-[44px] flex items-start pt-1"
                  >
                    {t("ui.website")}
                  </a>
                )}
              </div>

              {/* 시술 가격 */}
              <div className="space-y-2">
                {event.items.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between py-2 border-t border-gray-50 gap-3">
                    <span className="text-sm text-gray-700 flex-1 min-w-0">{item.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400 line-through whitespace-nowrap">{item.original}원</span>
                      <span className="text-sm font-bold text-red-600 whitespace-nowrap">{item.price}원</span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400 mt-3">{t("ui.period")}: {event.period}</p>
            </div>
          ))}
        </div>

        {/* 안내 */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>{t("ui.events_disclaimer")}</p>
          <p className="mt-1">{t("ui.events_ad_inquiry")}</p>
        </div>
      </div>
    </main>
  );
}
