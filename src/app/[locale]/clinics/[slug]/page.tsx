// 프로그래매틱 SEO: 시술×지역 조합 페이지 (190개 × 8개 언어 = 1,520 페이지)
// "Best Rhinoplasty Clinics in Gangnam, Korea" 형태의 롱테일 SEO 타깃
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { seoCombinations, getCombinationBySlug, getAllCombinationSlugs } from "@/data/seo-combinations";
import { getGuideBySlug } from "@/data/procedure-guides";
import { fetchHiraClinics } from "@/lib/hira-api";
import type { HiraClinic } from "@/lib/hira-api";
import { safeUrl } from "@/lib/safe-url";

const LOCALES = ["en", "ko", "zh", "ja", "ru", "vi", "th", "mn"];
const BASE_URL = "https://kbeautybuyersguide.com";

export function generateStaticParams() {
  return getAllCombinationSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const combo = getCombinationBySlug(slug);
  if (!combo) return {};

  const isKo = locale === "ko";
  const title = isKo ? `${combo.titleKo} — KBBG` : `${combo.titleEn} — KBBG`;
  const guide = getGuideBySlug(combo.procedureSlug);
  const description = isKo
    ? `${combo.region}에서 검증된 ${guide?.title || combo.titleKo} 클리닉을 찾아보세요. 정부 공인 데이터 기반 비교, 전문의 수, 구글 평점 정보를 제공합니다.`
    : `Find verified ${guide?.titleEn || combo.titleEn} clinics in ${combo.regionEn}, Korea. Compare government-certified clinics by specialists, ratings & reviews.`;

  return {
    title,
    description,
    openGraph: { title, description, url: `${BASE_URL}/${locale}/clinics/${slug}`, siteName: "KBBG", type: "website" },
    twitter: { card: "summary_large_image", title, description },
    alternates: {
      languages: Object.fromEntries(LOCALES.map((l) => [l, `${BASE_URL}/${l}/clinics/${slug}`])),
    },
  };
}

// HIRA API에서 실시간 클리닉 데이터 조회
async function fetchClinics(combo: NonNullable<ReturnType<typeof getCombinationBySlug>>): Promise<HiraClinic[]> {
  try {
    const result = await fetchHiraClinics({
      sidoCd: combo.sidoCd,
      sgguCd: combo.sgguCd,
      dgsbjtCd: combo.dgsbjtCd,
      numOfRows: 20,
      pageNo: 1,
    });
    return result.clinics;
  } catch {
    return [];
  }
}

export default async function ClinicCombinationPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const combo = getCombinationBySlug(slug);
  if (!combo) notFound();

  const guide = getGuideBySlug(combo.procedureSlug);
  const isKo = locale === "ko";
  const clinics = await fetchClinics(combo);

  // 같은 시술의 다른 지역 조합
  const otherRegions = seoCombinations
    .filter((c) => c.procedureSlug === combo.procedureSlug && c.slug !== slug)
    .slice(0, 8);

  // 같은 지역의 다른 시술 조합
  const otherProcedures = seoCombinations
    .filter((c) => c.regionEn === combo.regionEn && c.slug !== slug)
    .slice(0, 8);

  // MedicalClinic JSON-LD
  const clinicListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: isKo ? combo.titleKo : combo.titleEn,
    numberOfItems: clinics.length,
    itemListElement: clinics.slice(0, 10).map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "MedicalClinic",
        name: c.yadmNm,
        address: { "@type": "PostalAddress", addressLocality: c.sgguCdNm, addressRegion: c.sidoCdNm, addressCountry: "KR" },
        telephone: c.telno || undefined,
        ...(c.googleRating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: c.googleRating, reviewCount: c.googleReviewCount } } : {}),
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicListSchema) }}
      />

      <main className="min-h-screen bg-stone-50">
        {/* 히어로 */}
        <section className="bg-white border-b border-stone-100 px-4 py-12">
          <div className="mx-auto max-w-2xl">
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
              <Link href={`/${locale}`} className="hover:text-gray-600">Home</Link>
              <span>/</span>
              <Link href={`/${locale}/procedures`} className="hover:text-gray-600">
                {isKo ? "시술 정보" : "Procedures"}
              </Link>
              <span>/</span>
              {guide && (
                <>
                  <Link href={`/${locale}/procedures/${guide.slug}`} className="hover:text-gray-600">
                    {isKo ? guide.title : guide.titleEn}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-gray-600">{isKo ? combo.region : combo.regionEn}</span>
            </nav>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isKo ? combo.titleKo : combo.titleEn}
            </h1>
            <p className="text-sm text-gray-500">
              {isKo
                ? `정부 공인 데이터(HIRA) 기반 ${combo.region} 지역 검증 클리닉 ${clinics.length}곳`
                : `${clinics.length} verified clinics in ${combo.regionEn} based on government data (HIRA)`}
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-2xl px-4 py-8 space-y-4">
          {/* 시술 요약 카드 */}
          {guide && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-gray-900 mb-1">
                    {isKo ? guide.title : guide.titleEn}
                  </h2>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {isKo ? guide.description : guide.descriptionEn}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-gray-400">{isKo ? "예상 비용" : "Cost"}</p>
                  <p className="text-sm font-bold text-green-700">{guide.priceRange}</p>
                </div>
              </div>
            </div>
          )}

          {/* 클리닉 목록 */}
          {clinics.length > 0 ? (
            clinics.map((clinic, idx) => (
              <div
                key={clinic.ykiho || idx}
                className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400 font-medium">{idx + 1}.</span>
                      <h3 className="text-sm font-semibold text-gray-900">{clinic.yadmNm}</h3>
                      {clinic.clCdNm && (
                        <span className="text-xs text-gray-400">{clinic.clCdNm}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {[clinic.sidoCdNm, clinic.sgguCdNm].filter(Boolean).join(" ")}
                      {clinic.dgsbjtCdNm ? ` · ${clinic.dgsbjtCdNm}` : ""}
                    </p>
                    {clinic.addr && (
                      <p className="text-xs text-gray-400 mt-1 break-words">{clinic.addr}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      {clinic.telno && <span>📞 {clinic.telno}</span>}
                      {clinic.drTotCnt > 0 && (
                        <span>👨‍⚕️ {isKo ? `의사 ${clinic.drTotCnt}명` : `${clinic.drTotCnt} doctors`}</span>
                      )}
                      {(clinic.mdeptSdrCnt || clinic.sdrCnt) > 0 && (
                        <span>🏅 {isKo ? `전문의 ${clinic.mdeptSdrCnt || clinic.sdrCnt}명` : `${clinic.mdeptSdrCnt || clinic.sdrCnt} specialists`}</span>
                      )}
                      {clinic.googleRating && clinic.googleRating > 0 && (
                        <span className="text-yellow-600 font-medium">
                          ⭐ {clinic.googleRating.toFixed(1)}
                          {clinic.googleReviewCount ? ` (${clinic.googleReviewCount.toLocaleString()})` : ""}
                        </span>
                      )}
                    </div>
                    {clinic.safeAnesthesiaBadge && (
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium">
                          🛡️ {isKo ? "마취 전문의 상주" : "Anesthesiologist On-site"}
                        </span>
                      </div>
                    )}
                    {clinic.hospUrl && (
                      <a
                        href={safeUrl(clinic.hospUrl.startsWith("http") ? clinic.hospUrl : `http://${clinic.hospUrl}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-xs text-slate-600 hover:underline"
                      >
                        {isKo ? "웹사이트 →" : "Website →"}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <p className="text-sm text-gray-400">
                {isKo
                  ? "현재 이 지역의 데이터를 로딩 중입니다. AI 검색으로 찾아보세요."
                  : "Loading clinic data for this region. Try AI search below."}
              </p>
            </div>
          )}

          {/* AI 추천 CTA */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white text-center">
            <h2 className="text-lg font-bold mb-2">
              {isKo
                ? `${combo.region}에서 나에게 맞는 클리닉 찾기`
                : `Find Your Perfect Clinic in ${combo.regionEn}`}
            </h2>
            <p className="text-xs text-slate-300 mb-4">
              {isKo
                ? "AI가 당신의 조건에 맞는 클리닉을 추천해드립니다"
                : "Get personalized AI recommendations tailored to your needs"}
            </p>
            <Link
              href={`/${locale}/ai-search?q=${encodeURIComponent(
                isKo
                  ? `${combo.region} ${guide?.title || ""}`
                  : `${combo.regionEn} ${guide?.titleEn || ""}`
              )}`}
              className="inline-block px-6 py-3 bg-white text-slate-800 text-sm font-semibold rounded-full hover:bg-slate-100 transition-colors"
            >
              {isKo ? "AI 추천 받기" : "Get AI Recommendation"}
            </Link>
          </div>

          {/* 다른 지역에서 같은 시술 */}
          {otherRegions.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <h2 className="text-base font-bold text-gray-900 mb-3">
                {isKo
                  ? `다른 지역의 ${guide?.title || ""} 클리닉`
                  : `${guide?.titleEn || ""} Clinics in Other Regions`}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {otherRegions.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/${locale}/clinics/${c.slug}`}
                    className="flex items-center gap-2 px-3 py-2.5 bg-stone-50 hover:bg-stone-100 rounded-xl text-xs text-gray-700 transition-colors"
                  >
                    <span className="text-blue-500">&#8250;</span>
                    {isKo ? c.region : c.regionEn}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 같은 지역의 다른 시술 */}
          {otherProcedures.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <h2 className="text-base font-bold text-gray-900 mb-3">
                {isKo
                  ? `${combo.region}의 다른 시술`
                  : `Other Procedures in ${combo.regionEn}`}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {otherProcedures.map((c) => {
                  const pg = getGuideBySlug(c.procedureSlug);
                  return (
                    <Link
                      key={c.slug}
                      href={`/${locale}/clinics/${c.slug}`}
                      className="flex items-center gap-2 px-3 py-2.5 bg-stone-50 hover:bg-stone-100 rounded-xl text-xs text-gray-700 transition-colors"
                    >
                      <span className="text-blue-500">&#8250;</span>
                      {isKo ? pg?.title || c.titleKo : pg?.titleEn || c.titleEn}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
