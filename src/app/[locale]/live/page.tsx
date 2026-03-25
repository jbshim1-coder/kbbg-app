"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

// 한국 거리 라이브캠 채널 목록
// 실제 유튜브 라이브 영상 ID 또는 채널 ID를 사용
const LIVE_CHANNELS = [
  {
    id: "myeongdong",
    nameKey: "live.ch_myeongdong",
    location: "서울 명동",
    // 명동 거리 라이브캠 (Korea Travel / 한국관광공사 계열 라이브)
    videoId: "Nu9MT2tFAOc",
    thumbnail: "https://img.youtube.com/vi/Nu9MT2tFAOc/mqdefault.jpg",
    emoji: "🛍️",
  },
  {
    id: "gangnam",
    nameKey: "live.ch_gangnam",
    location: "서울 강남역",
    // 강남 거리 라이브캠
    videoId: "86YLFOog4GM",
    thumbnail: "https://img.youtube.com/vi/86YLFOog4GM/mqdefault.jpg",
    emoji: "🏙️",
  },
  {
    id: "hongdae",
    nameKey: "live.ch_hongdae",
    location: "서울 홍대",
    // 홍대 거리 라이브캠
    videoId: "8kXFSaXQGVU",
    thumbnail: "https://img.youtube.com/vi/8kXFSaXQGVU/mqdefault.jpg",
    emoji: "🎨",
  },
  {
    id: "haeundae",
    nameKey: "live.ch_haeundae",
    location: "부산 해운대",
    // 해운대 해변 라이브캠
    videoId: "fCpgowFzBsA",
    thumbnail: "https://img.youtube.com/vi/fCpgowFzBsA/mqdefault.jpg",
    emoji: "🏖️",
  },
  {
    id: "gyeongbokgung",
    nameKey: "live.ch_gyeongbokgung",
    location: "서울 경복궁",
    // 경복궁 라이브캠
    videoId: "FNjCBBNFpCQ",
    thumbnail: "https://img.youtube.com/vi/FNjCBBNFpCQ/mqdefault.jpg",
    emoji: "🏯",
  },
];

export default function LivePage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const [activeChannel, setActiveChannel] = useState(LIVE_CHANNELS[0]);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* 헤더 */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
            <Link
              href={`/${locale}`}
              className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              ← {t("nav.home")}
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {t("live.title")}
          </h1>
          <p className="mt-1 text-sm text-gray-400">{t("live.subtitle")}</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* 메인 영상 */}
        <div className="relative w-full overflow-hidden rounded-2xl bg-black shadow-2xl"
          style={{ paddingBottom: "56.25%" }}>
          <iframe
            key={activeChannel.videoId}
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${activeChannel.videoId}?autoplay=1&mute=1&rel=0&modestbranding=1`}
            title={activeChannel.id}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* 현재 채널 정보 */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-2xl">{activeChannel.emoji}</span>
          <div>
            <h2 className="font-semibold text-white">
              {t(activeChannel.nameKey as Parameters<typeof t>[0])}
            </h2>
            <p className="text-sm text-gray-400">{activeChannel.location}</p>
          </div>
        </div>

        {/* 채널 선택 섹션 */}
        <div className="mt-8">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
            {t("live.select_camera")}
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {LIVE_CHANNELS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch)}
                className={[
                  "group relative overflow-hidden rounded-xl border-2 transition-all duration-200",
                  activeChannel.id === ch.id
                    ? "border-red-500 ring-2 ring-red-500/30"
                    : "border-gray-700 hover:border-gray-500",
                ].join(" ")}
              >
                {/* 썸네일 */}
                <div className="relative aspect-video bg-gray-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ch.thumbnail}
                    alt={ch.id}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {/* 라이브 뱃지 */}
                  <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold">
                    <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
                    LIVE
                  </span>
                  {/* 활성 오버레이 */}
                  {activeChannel.id === ch.id && (
                    <div className="absolute inset-0 bg-red-500/20" />
                  )}
                </div>
                {/* 채널명 */}
                <div className="bg-gray-900 px-2 py-1.5 text-center">
                  <span className="mr-1">{ch.emoji}</span>
                  <span className="text-xs font-medium text-gray-200">
                    {t(ch.nameKey as Parameters<typeof t>[0])}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 안내 문구 */}
        <p className="mt-6 text-center text-xs text-gray-600">
          {t("live.disclaimer")}
        </p>
      </div>
    </main>
  );
}
