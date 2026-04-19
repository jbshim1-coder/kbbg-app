"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

// 한국 거리 라이브캠 5개 — 검증된 24시간 유튜브 라이브
// 영상이 종료되면 videoId만 교체하면 됨
// 검증된 24시간 라이브캠만 유지 — 안 되는 채널은 제거
// 새 라이브캠을 찾으면 여기에 추가하면 됨
const LIVE_CHANNELS = [
  { id: "hangang", nameKey: "live.ch_hangang", location: "Seoul", videoId: "zpCZ9OFjb3U", emoji: "🌉" },
  { id: "banpo", nameKey: "live.ch_banpo", location: "Seoul", videoId: "-JhoMGoAfFc", emoji: "🌈" },
  { id: "lotte", nameKey: "live.ch_lotte", location: "Seoul", videoId: "vZtdRVDlPQA", emoji: "🏢" },
  { id: "gangnam", nameKey: "live.ch_gangnam", location: "Seoul", videoId: "gCNeDWCI0vo", emoji: "🏙️" },
  { id: "busan", nameKey: "live.ch_busan", location: "Busan", videoId: "G40EYtfNCTg", emoji: "🌇" },
];

export default function LivePage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  // 선택된 채널 (null이면 그리드 보기)
  const [activeChannel, setActiveChannel] = useState<typeof LIVE_CHANNELS[0] | null>(null);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* 헤더 */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
            <Link href={`/${locale}`} className="text-xs text-gray-400 hover:text-gray-200 transition-colors">
              ← {t("nav.home")}
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-white">{t("live.title")}</h1>
          <p className="mt-1 text-sm text-gray-400">{t("live.subtitle")}</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* 선택된 채널 — 큰 영상 */}
        {activeChannel && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeChannel.emoji}</span>
                <h2 className="font-semibold text-white">
                  {t(activeChannel.nameKey as Parameters<typeof t>[0])}
                </h2>
              </div>
              <button
                onClick={() => setActiveChannel(null)}
                className="text-xs text-gray-400 hover:text-white px-3 py-1 border border-gray-700 rounded-lg"
              >
                ✕ {t("ui.close")}
              </button>
            </div>
            <div className="relative w-full overflow-hidden rounded-2xl bg-black shadow-2xl" style={{ paddingBottom: "56.25%" }}>
              <iframe
                key={activeChannel.videoId}
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube.com/embed/${activeChannel.videoId}?autoplay=1&mute=1&rel=0&modestbranding=1`}
                title={activeChannel.id}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* 5개 바둑판 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {LIVE_CHANNELS.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch)}
              className={[
                "group relative overflow-hidden rounded-xl border-2 transition-all duration-200 text-left",
                activeChannel?.id === ch.id
                  ? "border-red-500 ring-2 ring-red-500/30"
                  : "border-gray-700 hover:border-gray-500",
              ].join(" ")}
            >
              {/* 썸네일 */}
              <div className="relative aspect-video bg-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://img.youtube.com/vi/${ch.videoId}/mqdefault.jpg`}
                  alt={ch.id}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {/* LIVE 뱃지 */}
                <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold">
                  <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
                  LIVE
                </span>
                {/* 지역 뱃지 */}
                <span className="absolute right-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-gray-200">
                  {ch.location}
                </span>
              </div>
              {/* 채널명 */}
              <div className="bg-gray-900 px-3 py-2">
                <span className="mr-1.5">{ch.emoji}</span>
                <span className="text-xs font-medium text-gray-200">
                  {t(ch.nameKey as Parameters<typeof t>[0])}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* 안내 문구 */}
        <p className="mt-6 text-center text-xs text-gray-600">
          {t("live.disclaimer")}
        </p>
      </div>
    </main>
  );
}
