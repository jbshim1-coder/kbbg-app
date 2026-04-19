"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

// 여러 곳에 삽입 가능한 뷰티 분위기 배너 — 번역 키 기반 다국어 지원
export default function BeautyMoodBanner({
  image = "/hero/skincare.jpg",
  titleKey,
  subKey,
  height = "h-[300px] sm:h-[320px]",
}: {
  image?: string;
  titleKey: string;
  subKey: string;
  height?: string;
}) {
  const t = useTranslations();

  return (
    <section className={`relative w-full ${height} overflow-hidden`}>
      <Image src={image} alt="K-Beauty" fill className="object-cover object-center" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/20" />
      <div className="relative z-10 flex flex-col justify-center h-full px-5 sm:px-16">
        <p className="text-lg sm:text-2xl font-bold text-white leading-snug">{t(titleKey as Parameters<typeof t>[0])}</p>
        <p className="mt-1 text-xs sm:text-sm text-white/70 leading-relaxed">{t(subKey as Parameters<typeof t>[0])}</p>
      </div>
    </section>
  );
}
