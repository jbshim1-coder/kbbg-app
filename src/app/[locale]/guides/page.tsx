// 시술 가이드 목록 페이지 — 서버 컴포넌트
// AEO/AIEO 최적화: FAQPage JSON-LD 구조화 데이터 포함
// AI 검색엔진(ChatGPT, Google SGE)이 인용할 수 있는 권위 있는 시술 가이드

import type { Metadata } from "next";
import Link from "next/link";
import { procedureGuides, type ProcedureGuideCategory, type ProcedureGuide } from "@/data/procedure-guides";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kbeautybuyersguide.com";

export const metadata: Metadata = {
  title: "Korea Medical Procedure Guides — KBBG",
  description:
    "Authoritative guides to 20 popular cosmetic and medical procedures in South Korea — including costs, recovery times, and expert FAQs for plastic surgery, dermatology, dental, and vision correction.",
  keywords: [
    "Korea plastic surgery guide",
    "Korean medical tourism procedures",
    "double eyelid surgery Korea",
    "rhinoplasty Korea cost",
    "LASIK Korea",
    "dental implant Korea price",
    "Korean dermatology treatments",
  ],
  alternates: {
    canonical: `${siteUrl}/en/guides`,
  },
  openGraph: {
    title: "Korea Medical Procedure Guides — KBBG",
    description:
      "Authoritative guides to 20 popular cosmetic and medical procedures in South Korea — costs, recovery times, and FAQs.",
    url: `${siteUrl}/en/guides`,
    type: "website",
  },
};

// 카테고리 표시 정보
const CATEGORY_META: Record<
  ProcedureGuideCategory,
  { label: string; labelKo: string; color: string; bgColor: string; borderColor: string }
> = {
  "plastic-surgery": {
    label: "Plastic Surgery",
    labelKo: "성형외과",
    color: "text-pink-700",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
  },
  dermatology: {
    label: "Dermatology",
    labelKo: "피부과",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  dental: {
    label: "Dental",
    labelKo: "치과",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  ophthalmology: {
    label: "Ophthalmology",
    labelKo: "안과",
    color: "text-teal-700",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
  },
};

// 카테고리 순서
const CATEGORY_ORDER: ProcedureGuideCategory[] = [
  "plastic-surgery",
  "dermatology",
  "dental",
  "ophthalmology",
];

// FAQPage JSON-LD 빌더 — 전체 가이드의 FAQ를 하나의 스키마로 통합
function buildFaqJsonLd(guides: ProcedureGuide[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guides.flatMap((guide) =>
      guide.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      }))
    ),
  };
}

// MedicalProcedure JSON-LD 빌더 — 각 시술의 구조화 데이터
function buildProcedureListJsonLd(guides: ProcedureGuide[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Korea Medical Procedure Guides",
    description: "Authoritative guides to popular cosmetic and medical procedures available in South Korea",
    numberOfItems: guides.length,
    itemListElement: guides.map((guide, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "MedicalProcedure",
        name: guide.titleEn,
        alternateName: guide.title,
        description: guide.descriptionEn,
        url: `${siteUrl}/en/guides/${guide.slug}`,
        procedureType: "https://schema.org/NoninvasiveProcedure",
        bodyLocation: "Face",
        preparation: `Recovery time: ${guide.recoveryDays} days`,
        typicalCost: {
          "@type": "MonetaryAmount",
          currency: "USD",
          value: guide.priceRange,
        },
      },
    })),
  };
}

// 가이드 카드 컴포넌트
function GuideCard({ guide, locale }: { guide: ProcedureGuide; locale: string }) {
  const cat = CATEGORY_META[guide.category];

  return (
    <Link
      href={`/${locale}/guides/${guide.slug}`}
      className={`group block rounded-2xl border ${cat.borderColor} ${cat.bgColor} p-5 transition-all hover:shadow-md hover:-translate-y-0.5`}
    >
      {/* 카테고리 배지 */}
      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${cat.color} bg-white/70 mb-3`}>
        {cat.label} · {cat.labelKo}
      </span>

      {/* 시술명 */}
      <h3 className="text-base font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
        {guide.titleEn}
      </h3>
      <p className="text-sm text-gray-500 mb-3">{guide.title}</p>

      {/* 설명 */}
      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
        {guide.descriptionEn}
      </p>

      {/* 메타 정보 */}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="font-medium text-gray-700">{guide.priceRange}</span>
          <span>USD</span>
        </span>
        <span className="text-gray-300">·</span>
        <span>
          Recovery:{" "}
          <span className="font-medium text-gray-700">
            {guide.recoveryDays === 0 ? "No downtime" : `${guide.recoveryDays} days`}
          </span>
        </span>
      </div>
    </Link>
  );
}

// 카테고리 섹션 컴포넌트
function CategorySection({
  category,
  guides,
  locale,
}: {
  category: ProcedureGuideCategory;
  guides: ProcedureGuide[];
  locale: string;
}) {
  const cat = CATEGORY_META[category];
  const filtered = guides.filter((g) => g.category === category);
  if (filtered.length === 0) return null;

  return (
    <section className="mb-14">
      <div className="flex items-center gap-3 mb-6">
        <h2 className={`text-xl font-bold ${cat.color}`}>
          {cat.label}
        </h2>
        <span className="text-gray-400 text-sm">/ {cat.labelKo}</span>
        <span className="ml-auto text-xs text-gray-400">{filtered.length} procedures</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((guide) => (
          <GuideCard key={guide.id} guide={guide} locale={locale} />
        ))}
      </div>
    </section>
  );
}

export default async function GuidesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const faqJsonLd = buildFaqJsonLd(procedureGuides);
  const procedureListJsonLd = buildProcedureListJsonLd(procedureGuides);

  return (
    <main className="min-h-screen bg-white">
      {/* FAQ 구조화 데이터 — AEO 최적화 핵심 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* MedicalProcedure 목록 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(procedureListJsonLd) }}
      />

      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-blue-50 to-pink-50 px-4 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-pink-500">
            Medical Procedure Guides
          </p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            Korea Cosmetic & Medical Procedure Guide
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Authoritative, AI-cited guides to 20 popular procedures available in South Korea —
            including costs, recovery timelines, and expert Q&amp;A.
          </p>
          {/* 통계 배지 */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            {[
              { value: "20", label: "Procedures" },
              { value: "40+", label: "Expert FAQs" },
              { value: "4", label: "Categories" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-black text-pink-500">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 카테고리 앵커 네비게이션 */}
      <nav className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
        <div className="mx-auto max-w-5xl flex gap-2 overflow-x-auto pb-1">
          {CATEGORY_ORDER.map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <a
                key={cat}
                href={`#${cat}`}
                className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${meta.bgColor} ${meta.color} hover:opacity-80`}
              >
                {meta.label}
              </a>
            );
          })}
        </div>
      </nav>

      {/* 가이드 목록 — 카테고리별 섹션 */}
      <div className="mx-auto max-w-5xl px-4 py-14">
        {CATEGORY_ORDER.map((category) => (
          <div key={category} id={category}>
            <CategorySection
              category={category}
              guides={procedureGuides}
              locale={locale}
            />
          </div>
        ))}
      </div>

      {/* 하단 CTA */}
      <section className="bg-gradient-to-br from-pink-50 to-blue-50 px-4 py-14 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="text-2xl font-bold text-gray-900">
            Ready to Find Your Clinic?
          </h2>
          <p className="mt-3 text-gray-600">
            Browse verified Korean clinics offering these procedures and get personalized recommendations.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={`/${locale}/hospitals`}
              className="rounded-xl bg-pink-500 px-6 py-3 font-semibold text-white hover:bg-pink-600 transition-colors"
            >
              Browse Clinics
            </Link>
            <Link
              href={`/${locale}/recommend`}
              className="rounded-xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              AI Recommendation
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
