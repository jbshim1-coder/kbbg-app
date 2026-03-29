"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const BANNERS = [
  { titleKo: "AI가 추천하는 나만의 병원 찾기", titleEn: "Find Your Perfect Clinic with AI", subKo: "심평원·구글·네이버 등 다양한 평판 데이터를 AI가 종합 분석하여 추천드립니다.", subEn: "Combining data from HIRA and Google to find the best recommendations for you.", href: "/ai-search", bg: "from-teal-500 to-teal-500", cta: { ko: "AI 추천 시작", en: "Start AI Search" } },
  { titleKo: "이번 주 인기 화장품 TOP 20", titleEn: "This Week's TOP 20 Cosmetics", subKo: "네이버·올리브영·글로우픽·화해 실시간 랭킹", subEn: "Real-time ranking from Naver, Oliveyoung & more", href: "/cosmetics", bg: "from-orange-400 to-amber-400", cta: { ko: "랭킹 보기", en: "View Ranking" } },
  { titleKo: "한국 의료관광 시술 가이드", titleEn: "Korea Medical Tourism Guide", subKo: "20가지 시술 비용·회복기간·FAQ 총정리", subEn: "20 procedures — cost, recovery & FAQ", href: "/guides", bg: "from-blue-500 to-cyan-400", cta: { ko: "가이드 보기", en: "View Guide" } },
  { titleKo: "실제 후기를 커뮤니티에서 확인하세요", titleEn: "Check Real Reviews in Community", subKo: "K-Pop, K-Food, K-Drama까지 다양한 토픽", subEn: "K-Pop, K-Food, K-Drama & more topics", href: "/community", bg: "from-emerald-500 to-teal-400", cta: { ko: "커뮤니티 가기", en: "Go to Community" } },
];

export default function SlideBanner({ locale }: { locale: string }) {
  const [current, setCurrent] = useState(0);
  const isKo = locale === "ko";

  // 5초 간격 자동 전환
  useEffect(() => {
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % BANNERS.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const banner = BANNERS[current];

  return (
    <div className="relative w-full overflow-hidden">
      <div className={`bg-gradient-to-r ${banner.bg} px-4 py-10 sm:py-14 text-center text-white transition-all duration-500`}>
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold">{isKo ? banner.titleKo : banner.titleEn}</h2>
          <p className="mt-2 text-sm opacity-90">{isKo ? banner.subKo : banner.subEn}</p>
          <Link href={`/${locale}${banner.href}`}
            className="mt-5 inline-block rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-100 transition">
            {isKo ? banner.cta.ko : banner.cta.en}
          </Link>
        </div>
      </div>
      {/* 좌우 화살표 */}
      <button onClick={() => setCurrent((prev) => (prev - 1 + BANNERS.length) % BANNERS.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full w-8 h-8 flex items-center justify-center text-white text-lg">←</button>
      <button onClick={() => setCurrent((prev) => (prev + 1) % BANNERS.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full w-8 h-8 flex items-center justify-center text-white text-lg">→</button>
      {/* 도트 인디케이터 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {BANNERS.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition ${i === current ? "bg-white" : "bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}
