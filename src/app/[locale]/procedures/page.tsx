// 시술 정보 페이지 — 서버 컴포넌트, 곧 오픈 예정 안내
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Procedures — KBBG",
  description: "Explore popular medical and cosmetic procedures available in South Korea.",
};

export default async function ProceduresPage() {
  const t = await getTranslations();

  const CATEGORY_KEYS = [
    "procedures.cat_plastic",
    "procedures.cat_derma",
    "procedures.cat_dental",
    "procedures.cat_vision",
    "procedures.cat_nonsurgical",
    "procedures.cat_ortho",
  ] as const;

  return (
    <main className="min-h-screen bg-white">
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-blue-50 to-pink-50 px-4 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-pink-500">
            {t("procedures.coming_soon_label")}
          </p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            {t("procedures.page_title")}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            {t("procedures.page_subtitle")}
          </p>
        </div>
      </section>

      {/* 카테고리 예고 */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">
            {t("procedures.categories_title")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {CATEGORY_KEYS.map((key) => (
              <div
                key={key}
                className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-5 text-center text-sm font-medium text-gray-700"
              >
                {t(key)}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
