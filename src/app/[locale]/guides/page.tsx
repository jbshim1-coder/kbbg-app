import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { procedureGuides, type ProcedureGuideCategory, type ProcedureGuide } from "@/data/procedure-guides";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kbeautybuyersguide.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Korea Medical Procedure Guides — KBBG",
    description:
      "Authoritative guides to 20 popular cosmetic and medical procedures in South Korea — including costs, recovery times, and expert FAQs.",
    alternates: { canonical: `${siteUrl}/${locale}/guides` },
  };
}

const CATEGORY_ORDER: ProcedureGuideCategory[] = [
  "plastic-surgery",
  "dermatology",
  "dental",
  "ophthalmology",
  "internal-medicine",
  "obgyn",
  "orthopedics",
  "korean-medicine",
  "urology",
  "ent",
];

function buildFaqJsonLd(guides: ProcedureGuide[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guides.flatMap((guide) =>
      guide.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      }))
    ),
  };
}

function buildProcedureListJsonLd(guides: ProcedureGuide[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Korea Medical Procedure Guides",
    numberOfItems: guides.length,
    itemListElement: guides.map((guide, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "MedicalProcedure",
        name: guide.titleEn,
        alternateName: guide.title,
        description: guide.descriptionEn,
        url: `${siteUrl}/en/procedures/${guide.slug}`,
      },
    })),
  };
}

export default async function GuidesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guides_page");

  const isKo = locale === "ko";

  const CATEGORY_META: Record<
    ProcedureGuideCategory,
    { labelKey: string; color: string; bgColor: string; borderColor: string }
  > = {
    "plastic-surgery": {
      labelKey: "cat_plastic",
      color: "text-pink-700",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-300",
    },
    dermatology: {
      labelKey: "cat_dermatology",
      color: "text-purple-700",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    dental: {
      labelKey: "cat_dental",
      color: "text-slate-700",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-300",
    },
    ophthalmology: {
      labelKey: "cat_ophthalmology",
      color: "text-slate-700",
      bgColor: "bg-slate-50",
      borderColor: "border-teal-200",
    },
    "internal-medicine": {
      labelKey: "cat_internal_medicine",
      color: "text-green-700",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    obgyn: {
      labelKey: "cat_obgyn",
      color: "text-rose-700",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
    },
    orthopedics: {
      labelKey: "cat_orthopedics",
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    },
    "korean-medicine": {
      labelKey: "cat_korean_medicine",
      color: "text-stone-800",
      bgColor: "bg-rose-50",
      borderColor: "border-stone-200",
    },
    urology: {
      labelKey: "cat_urology",
      color: "text-indigo-700",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
    },
    ent: {
      labelKey: "cat_ent",
      color: "text-orange-700",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
  };

  const faqJsonLd = buildFaqJsonLd(procedureGuides);
  const procedureListJsonLd = buildProcedureListJsonLd(procedureGuides);

  return (
    <main className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(procedureListJsonLd) }} />

      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-blue-50 to-pink-50 px-4 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-700">
            {t("subtitle")}
          </p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            {t("description")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            {[
              { value: "38", label: t("stat_procedures") },
              { value: "76+", label: t("stat_faqs") },
              { value: "10", label: t("stat_categories") },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-black text-slate-700">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 카테고리 네비게이션 */}
      <nav className="sticky top-0 z-10 bg-white border-b border-stone-100 px-4 py-3">
        <div className="mx-auto max-w-5xl flex gap-2 overflow-x-auto pb-1">
          {CATEGORY_ORDER.map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <a
                key={cat}
                href={`#${cat}`}
                className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${meta.bgColor} ${meta.color} hover:opacity-80`}
              >
                {t(meta.labelKey as Parameters<typeof t>[0])}
              </a>
            );
          })}
        </div>
      </nav>

      {/* 가이드 목록 */}
      <div className="mx-auto max-w-5xl px-4 py-14">
        {CATEGORY_ORDER.map((category) => {
          const meta = CATEGORY_META[category];
          const filtered = procedureGuides.filter((g) => g.category === category);
          if (filtered.length === 0) return null;

          return (
            <section key={category} id={category} className="mb-14">
              <div className="flex items-center gap-3 mb-6">
                <h2 className={`text-xl font-bold ${meta.color}`}>
                  {t(meta.labelKey as Parameters<typeof t>[0])}
                </h2>
                <span className="ml-auto text-xs text-gray-400">
                  {t("procedures_count", { count: filtered.length })}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((guide) => (
                  <Link
                    key={guide.id}
                    href={`/${locale}/procedures/${guide.slug}`}
                    className={`group block rounded-2xl border ${meta.borderColor} ${meta.bgColor} p-5 transition-all hover:shadow-sm hover:-translate-y-0.5`}
                  >
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.color} bg-white/70 mb-3`}>
                      {t(meta.labelKey as Parameters<typeof t>[0])}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-slate-700 transition-colors">
                      {isKo ? guide.title : guide.titleEn}
                    </h3>
                    {!isKo && (
                      <p className="text-sm text-gray-500 mb-3">{guide.title}</p>
                    )}
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                      {isKo ? guide.description : guide.descriptionEn}
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="font-medium text-gray-700">{guide.priceRange}</span>
                        <span>{t("price_unit")}</span>
                      </span>
                      <span className="text-gray-300">·</span>
                      <span>
                        {t("recovery")}:{" "}
                        <span className="font-medium text-gray-700">
                          {guide.recoveryDays === 0
                            ? t("recovery_none")
                            : t("recovery_days", { days: guide.recoveryDays })}
                        </span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

    </main>
  );
}
