// 안전 정보 페이지 — 서버 컴포넌트, 의료관광 안전 수칙
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Safety Information — KBBG",
  description: "Essential safety guidelines for medical tourists visiting South Korea for cosmetic and medical procedures.",
};

export default async function SafetyPage() {
  const t = await getTranslations();

  // 안전 수칙 데이터 — 번역 키 사용
  const SAFETY_TIPS = [
    { icon: "🔍", titleKey: "safety.tip1_title" as const, descKey: "safety.tip1_desc" as const },
    { icon: "📄", titleKey: "safety.tip2_title" as const, descKey: "safety.tip2_desc" as const },
    { icon: "🏥", titleKey: "safety.tip3_title" as const, descKey: "safety.tip3_desc" as const },
    { icon: "✈️", titleKey: "safety.tip4_title" as const, descKey: "safety.tip4_desc" as const },
    { icon: "🛡️", titleKey: "safety.tip5_title" as const, descKey: "safety.tip5_desc" as const },
    { icon: "🚫", titleKey: "safety.tip6_title" as const, descKey: "safety.tip6_desc" as const },
    { icon: "💊", titleKey: "safety.tip7_title" as const, descKey: "safety.tip7_desc" as const },
    { icon: "📞", titleKey: "safety.tip8_title" as const, descKey: "safety.tip8_desc" as const },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-blue-50 to-pink-50 px-4 py-8 sm:py-12 lg:py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-700">
            {t("safety.label")}
          </p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            {t("safety.title")}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            {t("safety.subtitle")}
          </p>
        </div>
      </section>

      {/* 안전 수칙 그리드 */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-6">
          {SAFETY_TIPS.map((tip) => (
            <div key={tip.titleKey} className="rounded-2xl border border-stone-100 p-6">
              <p className="text-2xl">{tip.icon}</p>
              <h2 className="mt-3 font-semibold text-gray-900">{t(tip.titleKey)}</h2>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{t(tip.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 긴급 연락처 안내 */}
      <section className="border-t border-stone-100 bg-stone-50 px-4 py-12 text-center">
        <h2 className="font-bold text-gray-900">{t("safety.emergency_title")}</h2>
        <div className="mt-4 flex flex-col sm:flex-row justify-center gap-6 text-sm text-gray-600">
          <span>{t("safety.emergency_line")}</span>
          <span>{t("safety.police_line")}</span>
          <span>{t("safety.tourist_line")}</span>
          <span>{t("safety.dispute_line")}</span>
        </div>
      </section>
    </main>
  );
}
