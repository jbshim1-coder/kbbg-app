import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";

// SEO 메타데이터 — E-E-A-T 강화를 위해 구체적 설명 작성
export const metadata: Metadata = {
  title: "About Us — KBBG by 2bStory",
  description: "2008년부터 500여개 병원과 함께한 한국 뷰티 마케팅 전문기업 투비스토리를 소개합니다.",
};

// 서비스 핵심 지표 — 신뢰 배지용 숫자 데이터 (labelKey는 about 네임스페이스 내 키)
const STATS = [
  { value: "2008", labelKey: "founded" },
  { value: "500+", labelKey: "partners" },
  { value: "7", labelKey: "languages_stat" },
  { value: "15+", labelKey: "experience_stat" },
];

// About 페이지 — 서버 컴포넌트 (인터랙션 없음)
// E-E-A-T(경험·전문성·권위·신뢰) 4가지 항목을 섹션별로 명시
export default async function AboutPage() {
  const t = await getTranslations("about");
  const locale = await getLocale();

  return (
    <main className="min-h-screen bg-white">
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-blue-50 to-pink-50 px-4 py-8 sm:py-12 lg:py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-700">{t("badge")}</p>
          <h1 className="mt-2 text-4xl font-bold text-gray-900">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            {t("experience")}
          </p>
        </div>
      </section>

      {/* 핵심 지표 배지 — 숫자로 신뢰도 표현 */}
      <section className="border-y border-gray-100 px-4 py-8">
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.labelKey} className="text-center">
              <p className="text-3xl font-black text-slate-700">{s.value}</p>
              <p className="mt-1 text-sm text-gray-500">{t(s.labelKey as Parameters<typeof t>[0])}</p>
            </div>
          ))}
        </div>
      </section>

      {/* E-E-A-T 섹션 — 검색 엔진 신뢰도 강화 */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-3xl space-y-8">
          {/* 미션 */}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t("mission_title")}</h2>
            <p className="mt-3 leading-relaxed text-gray-600">
              {t("mission_desc")}
            </p>
          </div>

          {/* 전문성 (Expertise) */}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t("expertise_title")}</h2>
            <p className="mt-3 leading-relaxed text-gray-600">
              {t("expertise_desc")}
            </p>
          </div>

          {/* 신뢰성 (Trustworthiness) */}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t("trust_title")}</h2>
            <p className="mt-3 leading-relaxed text-gray-600">
              {t("trust_desc")}
            </p>
          </div>
        </div>
      </section>

      {/* 파트너십 CTA */}
      <section className="px-4 py-14 text-center">
        <h2 className="text-xl font-bold text-gray-900">{t("partnership_title")}</h2>
        <p className="mt-2 text-gray-500">{t("partnership_desc")}</p>
        <Link
          href={`/${locale}/contact`}
          className="mt-6 inline-block rounded-xl bg-slate-800 px-8 py-3 font-semibold text-white hover:bg-slate-900"
        >
          {t("contact_btn")}
        </Link>
      </section>
    </main>
  );
}
