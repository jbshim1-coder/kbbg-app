"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export default function BeautyBanner() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const t = useTranslations();

  return (
    <section className="relative w-full h-[360px] sm:h-[420px] overflow-hidden">
      {/* 배경 이미지 */}
      <Image
        src="/hero/model1.jpg"
        alt="K-Beauty"
        fill
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />

      {/* 콘텐츠 */}
      <div className="relative z-10 flex flex-col justify-center h-full px-5 sm:px-16 max-w-2xl">
        <p className="text-sm font-medium text-white/70 tracking-widest uppercase">
          K-Beauty
        </p>
        <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-white leading-snug">
          {t("ui.beauty_hero")}
        </h2>
        <p className="mt-3 text-sm text-white/70 max-w-md">
          {t("ui.beauty_sub")}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={`/${locale}/guides`}
            className="px-5 py-3 bg-white text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-100 transition min-h-[44px] flex items-center"
          >
            {t("ui.procedure_guide")}
          </Link>
          <Link
            href={`/${locale}/events`}
            className="px-5 py-3 border border-white/50 text-white text-sm font-semibold rounded-lg hover:bg-white/10 transition min-h-[44px] flex items-center"
          >
            {t("ui.special_offers")}
          </Link>
        </div>
      </div>
    </section>
  );
}
