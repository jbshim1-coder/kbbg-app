// 이용 가이드 페이지 — 서버 컴포넌트, 사이트 사용법 안내
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "How to Use KBBG — User Guide",
  description: "Step-by-step guide to planning your medical trip to South Korea using K-Beauty Buyers Guide.",
};

export default async function GuidePage() {
  const t = await getTranslations();

  // 이용 단계 데이터 — 번역 키 사용
  const STEPS = [
    { step: "01", titleKey: "guide.step1_title" as const, descKey: "guide.step1_desc" as const },
    { step: "02", titleKey: "guide.step2_title" as const, descKey: "guide.step2_desc" as const },
    { step: "03", titleKey: "guide.step3_title" as const, descKey: "guide.step3_desc" as const },
    { step: "04", titleKey: "guide.step4_title" as const, descKey: "guide.step4_desc" as const },
    { step: "05", titleKey: "guide.step5_title" as const, descKey: "guide.step5_desc" as const },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-blue-50 to-pink-50 px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
            {t("guide.label")}
          </p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            {t("guide.title")}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            {t("guide.subtitle")}
          </p>
        </div>
      </section>

      {/* 단계별 가이드 */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-2xl space-y-8">
          {STEPS.map((item) => (
            <div key={item.step} className="flex gap-5">
              {/* 단계 번호 배지 */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                <span className="text-sm font-bold text-teal-700">{item.step}</span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{t(item.titleKey)}</h2>
                <p className="mt-1 text-sm text-gray-500 leading-relaxed">{t(item.descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 추가 도움말 링크 */}
      <section className="border-t border-gray-100 px-4 py-12 text-center">
        <p className="text-gray-500">
          {t("guide.help_text")}{" "}
          <a href="../faq" className="text-teal-600 hover:underline font-medium">
            {t("guide.faq_link")}
          </a>{" "}
          {t("guide.or")}{" "}
          <a href="../contact" className="text-teal-600 hover:underline font-medium">
            {t("guide.contact_link")}
          </a>.
        </p>
      </section>
    </main>
  );
}
