// 병원 찾기 페이지 — 서버 컴포넌트, 곧 오픈 예정 안내
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Find Hospitals — KBBG",
  description: "Browse verified Korean medical clinics and hospitals for cosmetic and medical procedures.",
};

export default async function HospitalsPage() {
  const t = await getTranslations();

  const FEATURES = [
    {
      icon: "🏥",
      titleKey: "hospitals.feature_verified_title" as const,
      descKey: "hospitals.feature_verified_desc" as const,
    },
    {
      icon: "⭐",
      titleKey: "hospitals.feature_reviews_title" as const,
      descKey: "hospitals.feature_reviews_desc" as const,
    },
    {
      icon: "💬",
      titleKey: "hospitals.feature_contact_title" as const,
      descKey: "hospitals.feature_contact_desc" as const,
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-blue-50 to-pink-50 px-4 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-pink-500">
            {t("hospitals.coming_soon_label")}
          </p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            {t("hospitals.title")}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            {t("hospitals.subtitle")}
          </p>
        </div>
      </section>

      {/* 예정 기능 미리보기 */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">
            {t("hospitals.what_to_expect")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {FEATURES.map((item) => (
              <div key={item.titleKey} className="rounded-2xl border border-gray-100 p-6 text-center">
                <p className="text-3xl">{item.icon}</p>
                <h3 className="mt-3 font-semibold text-gray-900">{t(item.titleKey)}</h3>
                <p className="mt-2 text-sm text-gray-500">{t(item.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
