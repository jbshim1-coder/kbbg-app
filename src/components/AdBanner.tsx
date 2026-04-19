"use client";

// 메인 광고 배너 — Supabase ads 테이블에서 활성 광고를 fetch하여 표시
// 광고가 없으면 기존 "광고주를 찾고 있습니다" 폴백 표시
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface Ad {
  id: string;
  title: string;
  hospital_name: string;
  description: string;
  link_url: string;
  image_url: string;
  active: boolean;
}

export default function AdBanner() {
  const t = useTranslations();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/admin/ads")
      .then((res) => res.json())
      .then((data) => {
        const ads: Ad[] = data.ads || [];
        if (ads.length > 0) {
          // 여러 광고가 있으면 랜덤 1개 선택
          const randomAd = ads[Math.floor(Math.random() * ads.length)];
          setAd(randomAd);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // 로딩 중에는 아무것도 표시하지 않음 (레이아웃 깜빡임 방지)
  if (!loaded) {
    return (
      <div className="w-full bg-white border-b border-gray-100 py-2 px-4">
        <div className="mx-auto max-w-6xl bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 sm:py-5 h-16" />
      </div>
    );
  }

  // 활성 광고가 있으면 광고 표시
  if (ad) {
    return (
      <div className="w-full bg-white border-b border-gray-100 py-2 px-4">
        <a
          href={ad.link_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="block mx-auto max-w-6xl bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 sm:py-5 hover:bg-gray-100 transition-colors"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white bg-slate-700 px-3 py-1 rounded shrink-0">AD</span>
              {ad.image_url && (
                <img
                  src={ad.image_url}
                  alt={ad.title}
                  className="w-10 h-10 rounded object-cover shrink-0"
                />
              )}
              <div>
                <p className="text-base sm:text-lg font-bold text-gray-900">{ad.title}</p>
                <p className="text-xs text-gray-500">{ad.hospital_name}</p>
              </div>
            </div>
            {ad.description && (
              <p className="text-sm sm:text-base text-gray-600 text-center flex-1">{ad.description}</p>
            )}
            <span className="px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg shrink-0">
              {t("ad.contact" as Parameters<typeof t>[0])}
            </span>
          </div>
        </a>
      </div>
    );
  }

  // 폴백: 광고가 없으면 기존 "광고주를 찾고 있습니다" 표시
  return (
    <div className="w-full bg-white border-b border-gray-100 py-2 px-4">
      <div className="mx-auto max-w-6xl bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-white bg-slate-700 px-3 py-1 rounded shrink-0">AD</span>
          <p className="text-base sm:text-lg font-bold text-gray-900">
            {t("ad.looking_for_advertiser" as Parameters<typeof t>[0])}
          </p>
        </div>
        <p className="text-sm sm:text-base text-gray-600 text-center">
          {t("ad.ad_description" as Parameters<typeof t>[0])}
        </p>
        <div className="flex items-center gap-3 text-sm text-gray-600 shrink-0">
          <span>010-8718-5000</span>
          <span className="hidden sm:inline text-gray-300">|</span>
          <span className="hidden sm:inline">help@kbeautybuyersguide.com</span>
          <a href="mailto:help@kbeautybuyersguide.com" className="px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-900 transition">
            {t("ad.contact" as Parameters<typeof t>[0])}
          </a>
        </div>
      </div>
    </div>
  );
}
