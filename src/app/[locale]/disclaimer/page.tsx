import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Disclaimer — KBBG",
  description: "KBBG Service Disclaimer",
};

// 면책조항 페이지 — 의료 정보 제공의 한계와 법적 책임 범위를 명시
export default async function DisclaimerPage() {
  const t = await getTranslations("disclaimer");

  return (
    <main className="min-h-screen bg-white px-4 py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
        <p className="mt-2 text-sm text-gray-400">{t("last_updated")}</p>

        {/* 중요 경고 배너 */}
        <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm font-semibold text-yellow-800">
            {t("warning")}
          </p>
        </div>

        <div className="mt-10 space-y-8 text-gray-700 leading-relaxed">
          {/* 정보 제공 목적 한계 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">{t("s1_title")}</h2>
            <p className="mt-3">{t("s1_body")}</p>
          </section>

          {/* 의료 정보 정확성 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">{t("s2_title")}</h2>
            <p className="mt-3">{t("s2_body")}</p>
          </section>

          {/* AI 추천 한계 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">{t("s3_title")}</h2>
            <p className="mt-3">{t("s3_body")}</p>
          </section>

          {/* 광고 및 후원 콘텐츠 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">{t("s4_title")}</h2>
            <p className="mt-3">{t("s4_body")}</p>
          </section>

          {/* 외부 링크 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">{t("s5_title")}</h2>
            <p className="mt-3">{t("s5_body")}</p>
          </section>

          {/* 법적 책임 제한 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">{t("s6_title")}</h2>
            <p className="mt-3">{t("s6_body")}</p>
          </section>

          {/* 문의처 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">{t("s7_title")}</h2>
            <p className="mt-3">
              {t("s7_contact_prefix")}{" "}
              <a href="mailto:help@2bstory.com" className="text-slate-700 hover:underline">
                help@2bstory.com
              </a>
              {t("s7_contact_suffix")}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
