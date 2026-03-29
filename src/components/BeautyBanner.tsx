"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BeautyBanner() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const isKo = locale === "ko";

  return (
    <section className="relative w-full h-[360px] sm:h-[420px] overflow-hidden">
      {/* 배경 이미지 */}
      <Image
        src="/hero/model1.jpg"
        alt="K-Beauty"
        fill
        className="object-cover object-top"
        sizes="100vw"
      />

      {/* 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />

      {/* 콘텐츠 */}
      <div className="relative z-10 flex flex-col justify-center h-full px-8 sm:px-16 max-w-2xl">
        <p className="text-sm font-medium text-white/70 tracking-widest uppercase">
          K-Beauty
        </p>
        <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-white leading-snug">
          {isKo
            ? "세계가 인정한\n한국의 아름다움"
            : "Korea's Beauty,\nRecognized Worldwide"}
        </h2>
        <p className="mt-3 text-sm text-white/70 max-w-md">
          {isKo
            ? "피부과·성형외과·안과 전문 의원의 시술 이벤트를 확인하세요"
            : "Check special offers from top dermatology, plastic surgery & eye clinics"}
        </p>
        <div className="mt-5 flex gap-3">
          <Link
            href={`/${locale}/guides`}
            className="px-5 py-2.5 bg-white text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            {isKo ? "시술 가이드" : "Procedure Guide"}
          </Link>
          <Link
            href={`/${locale}/events`}
            className="px-5 py-2.5 border border-white/50 text-white text-sm font-semibold rounded-lg hover:bg-white/10 transition"
          >
            {isKo ? "이벤트 특가" : "Special Offers"}
          </Link>
        </div>
      </div>
    </section>
  );
}
