// 프로그래매틱 SEO: 시술별 개별 페이지 (39개 × 8개 언어 = 312 페이지)
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { procedureGuides, getGuideBySlug } from "@/data/procedure-guides";
import { seoCombinations } from "@/data/seo-combinations";

const LOCALES = ["en", "ko", "zh", "ja", "ru", "vi", "th", "mn"];
const BASE_URL = "https://kbeautybuyersguide.com";

// 카테고리 → 영문/한국어 매핑
const CATEGORY_LABELS: Record<string, { en: string; ko: string }> = {
  "plastic-surgery": { en: "Plastic Surgery", ko: "성형외과" },
  dermatology: { en: "Dermatology", ko: "피부과" },
  dental: { en: "Dental", ko: "치과" },
  ophthalmology: { en: "Ophthalmology", ko: "안과" },
  "internal-medicine": { en: "Internal Medicine", ko: "내과" },
  obgyn: { en: "OB/GYN", ko: "산부인과" },
  orthopedics: { en: "Orthopedics", ko: "정형외과" },
  "korean-medicine": { en: "Korean Medicine", ko: "한의학" },
  urology: { en: "Urology", ko: "비뇨기과" },
  ent: { en: "ENT", ko: "이비인후과" },
};

// 정적 경로 생성
export function generateStaticParams() {
  return procedureGuides.map((g) => ({ slug: g.slug }));
}

// 동적 메타데이터
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};

  const isKo = locale === "ko";
  const title = isKo
    ? `${guide.title} | 한국 ${CATEGORY_LABELS[guide.category]?.ko} 가이드 — KBBG`
    : `${guide.titleEn} in Korea | ${CATEGORY_LABELS[guide.category]?.en} Guide — KBBG`;
  const description = isKo ? guide.description : guide.descriptionEn;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/procedures/${slug}`,
      siteName: "KBBG - K-Beauty Buyers Guide",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `${BASE_URL}/${l}/procedures/${slug}`])
      ),
    },
  };
}

export default async function ProcedureDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const isKo = locale === "ko";
  const cat = CATEGORY_LABELS[guide.category] || { en: guide.category, ko: guide.category };

  // 이 시술과 관련된 지역 조합 페이지 링크
  const relatedCombos = seoCombinations.filter((c) => c.procedureSlug === slug).slice(0, 10);

  // 같은 카테고리의 다른 시술
  const relatedProcedures = procedureGuides
    .filter((g) => g.category === guide.category && g.slug !== slug)
    .slice(0, 6);

  // FAQ JSON-LD (구조화 데이터)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  // Medical procedure JSON-LD
  const medicalSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: isKo ? guide.title : guide.titleEn,
    description: isKo ? guide.description : guide.descriptionEn,
    procedureType: "https://schema.org/NoninvasiveProcedure",
    howPerformed: isKo ? guide.description : guide.descriptionEn,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalSchema) }}
      />

      <main className="min-h-screen bg-stone-50">
        {/* 히어로 */}
        <section className="bg-white border-b border-stone-100 px-4 py-12">
          <div className="mx-auto max-w-2xl">
            {/* 브레드크럼 */}
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
              <Link href={`/${locale}`} className="hover:text-gray-600">Home</Link>
              <span>/</span>
              <Link href={`/${locale}/procedures`} className="hover:text-gray-600">
                {isKo ? "시술 정보" : "Procedures"}
              </Link>
              <span>/</span>
              <span className="text-gray-600">{isKo ? cat.ko : cat.en}</span>
            </nav>

            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full mb-3">
              {isKo ? cat.ko : cat.en}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isKo ? guide.title : guide.titleEn}
            </h1>
            <p className="text-sm text-gray-500">
              {isKo
                ? `한국에서의 ${guide.title} — 비용, 회복기간, 주요 클리닉 안내`
                : `${guide.titleEn} in Korea — Cost, Recovery & Top Clinics`}
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
          {/* 핵심 정보 카드 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-xs text-green-600 font-medium mb-1">
                  {isKo ? "예상 비용" : "Estimated Cost"}
                </p>
                <p className="text-lg font-bold text-green-800">{guide.priceRange}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <p className="text-xs text-purple-600 font-medium mb-1">
                  {isKo ? "회복 기간" : "Recovery Period"}
                </p>
                <p className="text-lg font-bold text-purple-800">
                  {guide.recoveryDays === 0
                    ? (isKo ? "다운타임 없음" : "No Downtime")
                    : (isKo ? `약 ${guide.recoveryDays}일` : `~${guide.recoveryDays} days`)}
                </p>
              </div>
            </div>
          </div>

          {/* 상세 설명 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              {isKo ? "시술 개요" : "Overview"}
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {isKo ? guide.description : guide.descriptionEn}
            </p>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {isKo ? "자주 묻는 질문" : "Frequently Asked Questions"}
            </h2>
            <div className="space-y-4">
              {guide.faq.map((f, i) => (
                <div key={i} className="border-b border-stone-100 pb-4 last:border-0 last:pb-0">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">{f.question}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{f.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 지역별 클리닉 찾기 */}
          {relatedCombos.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {isKo
                  ? `지역별 ${guide.title} 클리닉 찾기`
                  : `Find ${guide.titleEn} Clinics by Region`}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {relatedCombos.map((combo) => (
                  <Link
                    key={combo.slug}
                    href={`/${locale}/clinics/${combo.slug}`}
                    className="flex items-center gap-2 px-3 py-2.5 bg-stone-50 hover:bg-stone-100 rounded-xl text-sm text-gray-700 transition-colors"
                  >
                    <span className="text-blue-500">&#8250;</span>
                    {isKo ? combo.titleKo : combo.titleEn.replace("Best ", "").replace(" Clinics in ", " — ")}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 같은 카테고리 다른 시술 */}
          {relatedProcedures.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {isKo ? `다른 ${cat.ko} 시술` : `Other ${cat.en} Procedures`}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {relatedProcedures.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/${locale}/procedures/${p.slug}`}
                    className="flex items-center justify-between px-3 py-2.5 bg-stone-50 hover:bg-stone-100 rounded-xl text-sm transition-colors"
                  >
                    <span className="text-gray-700">{isKo ? p.title : p.titleEn}</span>
                    <span className="text-xs text-gray-400">{p.priceRange}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* AI 추천 CTA */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white text-center">
            <h2 className="text-lg font-bold mb-2">
              {isKo
                ? `나에게 맞는 ${guide.title} 클리닉 찾기`
                : `Find the Best ${guide.titleEn} Clinic for You`}
            </h2>
            <p className="text-xs text-slate-300 mb-4">
              {isKo
                ? "AI가 검증된 데이터를 기반으로 맞춤 추천해드립니다"
                : "Get personalized AI recommendations based on verified data"}
            </p>
            <Link
              href={`/${locale}/ai-search?q=${encodeURIComponent(isKo ? guide.title : guide.titleEn)}`}
              className="inline-block px-6 py-3 bg-white text-slate-800 text-sm font-semibold rounded-full hover:bg-slate-100 transition-colors"
            >
              {isKo ? "AI 추천 받기" : "Get AI Recommendation"}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
