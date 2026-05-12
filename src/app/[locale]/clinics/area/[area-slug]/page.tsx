// 프로그래매틱 SEO: 지역별 클리닉 목록 페이지
// 189개 지역 × 8개 언어 = 1,512 페이지
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CLINIC_AREAS, getAreaBySlug, getAllAreaSlugs } from "@/data/clinic-areas";
import { createServiceRoleClient } from "@/lib/supabase";
import { safeUrl } from "@/lib/safe-url";
import type { Clinic } from "@/types/database";

const LOCALES = ["en", "ko", "zh", "ja", "ru", "vi", "th", "mn"];
const BASE_URL = "https://kbeautybuyersguide.com";

// 언어별 UI 텍스트
const T = {
  en: {
    title: (area: string, province: string) => `Best Clinics in ${area}, ${province}, Korea`,
    desc:  (area: string, n: number) => `Find ${n} verified medical & beauty clinics in ${area}, Korea. Compare by ratings, doctors & specialties.`,
    breadClinics: "Find a Clinic",
    breadArea: (area: string, province: string) => `${area}, ${province}`,
    subtitle: (n: number) => `${n} verified clinics`,
    doctors: (n: number) => `${n} doctors`,
    specialists: (n: number) => `${n} specialists`,
    website: "Website →",
    noClinic: "No clinic data yet for this area.",
    ctaTitle: (area: string) => `Find Your Clinic in ${area}`,
    ctaDesc: "Get personalized AI recommendations",
    ctaBtn: "Get AI Recommendation",
    otherAreas: "Other Areas",
    anesthesia: "Anesthesiologist On-site",
  },
  ko: {
    title: (area: string, province: string) => `${province} ${area} 클리닉 추천`,
    desc:  (area: string, n: number) => `${area} 검증된 병원·클리닉 ${n}곳. 평점, 전문의 수, 진료과목별 비교.`,
    breadClinics: "클리닉 찾기",
    breadArea: (area: string, province: string) => `${province} ${area}`,
    subtitle: (n: number) => `검증 클리닉 ${n}곳`,
    doctors: (n: number) => `의사 ${n}명`,
    specialists: (n: number) => `전문의 ${n}명`,
    website: "웹사이트 →",
    noClinic: "이 지역 데이터를 로딩 중입니다.",
    ctaTitle: (area: string) => `${area}에서 나에게 맞는 클리닉 찾기`,
    ctaDesc: "AI가 조건에 맞는 클리닉을 추천해드립니다",
    ctaBtn: "AI 추천 받기",
    otherAreas: "다른 지역",
    anesthesia: "마취 전문의 상주",
  },
  zh: {
    title: (area: string, province: string) => `韩国${province}${area}最佳诊所`,
    desc:  (area: string, n: number) => `韩国${area}共找到${n}家经验证的医疗美容诊所。`,
    breadClinics: "寻找诊所",
    breadArea: (area: string, province: string) => `${province} ${area}`,
    subtitle: (n: number) => `${n}家认证诊所`,
    doctors: (n: number) => `${n}名医生`,
    specialists: (n: number) => `${n}名专科医生`,
    website: "官网 →",
    noClinic: "暂无该地区诊所数据。",
    ctaTitle: (area: string) => `在${area}找到适合您的诊所`,
    ctaDesc: "AI为您个性化推荐",
    ctaBtn: "获取AI推荐",
    otherAreas: "其他地区",
    anesthesia: "麻醉专科医生常驻",
  },
  ja: {
    title: (area: string, province: string) => `韓国${province}${area}のおすすめクリニック`,
    desc:  (area: string, n: number) => `韓国${area}の認定クリニック${n}件。評価・専門医数・診療科で比較。`,
    breadClinics: "クリニックを探す",
    breadArea: (area: string, province: string) => `${province} ${area}`,
    subtitle: (n: number) => `認定クリニック ${n}件`,
    doctors: (n: number) => `医師 ${n}名`,
    specialists: (n: number) => `専門医 ${n}名`,
    website: "ウェブサイト →",
    noClinic: "このエリアのデータはまだありません。",
    ctaTitle: (area: string) => `${area}で最適なクリニックを見つける`,
    ctaDesc: "AIがあなたに合ったクリニックをご提案",
    ctaBtn: "AIに相談する",
    otherAreas: "他のエリア",
    anesthesia: "麻酔科医常駐",
  },
  ru: {
    title: (area: string, province: string) => `Лучшие клиники в ${area}, ${province}, Корея`,
    desc:  (area: string, n: number) => `${n} проверенных клиник в ${area}, Корея. Сравнивайте по рейтингам и специальностям.`,
    breadClinics: "Найти клинику",
    breadArea: (area: string, province: string) => `${area}, ${province}`,
    subtitle: (n: number) => `${n} проверенных клиник`,
    doctors: (n: number) => `${n} врачей`,
    specialists: (n: number) => `${n} специалистов`,
    website: "Сайт →",
    noClinic: "Данные по этому региону загружаются.",
    ctaTitle: (area: string) => `Найдите клинику в ${area}`,
    ctaDesc: "Персональные рекомендации от ИИ",
    ctaBtn: "Получить рекомендацию",
    otherAreas: "Другие регионы",
    anesthesia: "Анестезиолог в штате",
  },
  vi: {
    title: (area: string, province: string) => `Phòng khám tốt nhất tại ${area}, ${province}, Hàn Quốc`,
    desc:  (area: string, n: number) => `${n} phòng khám uy tín tại ${area}, Hàn Quốc.`,
    breadClinics: "Tìm phòng khám",
    breadArea: (area: string, province: string) => `${area}, ${province}`,
    subtitle: (n: number) => `${n} phòng khám`,
    doctors: (n: number) => `${n} bác sĩ`,
    specialists: (n: number) => `${n} chuyên gia`,
    website: "Website →",
    noClinic: "Chưa có dữ liệu cho khu vực này.",
    ctaTitle: (area: string) => `Tìm phòng khám tại ${area}`,
    ctaDesc: "AI gợi ý phòng khám phù hợp cho bạn",
    ctaBtn: "Nhận gợi ý AI",
    otherAreas: "Khu vực khác",
    anesthesia: "Bác sĩ gây mê thường trực",
  },
  th: {
    title: (area: string, province: string) => `คลินิกที่ดีที่สุดใน ${area} ${province} เกาหลี`,
    desc:  (area: string, n: number) => `พบ ${n} คลินิกที่ผ่านการรับรองใน ${area} เกาหลี`,
    breadClinics: "ค้นหาคลินิก",
    breadArea: (area: string, province: string) => `${area}, ${province}`,
    subtitle: (n: number) => `${n} คลินิกที่ผ่านการรับรอง`,
    doctors: (n: number) => `${n} แพทย์`,
    specialists: (n: number) => `${n} ผู้เชี่ยวชาญ`,
    website: "เว็บไซต์ →",
    noClinic: "ยังไม่มีข้อมูลสำหรับพื้นที่นี้",
    ctaTitle: (area: string) => `ค้นหาคลินิกใน ${area}`,
    ctaDesc: "รับคำแนะนำจาก AI สำหรับคุณ",
    ctaBtn: "รับคำแนะนำ AI",
    otherAreas: "พื้นที่อื่น",
    anesthesia: "วิสัญญีแพทย์ประจำ",
  },
  mn: {
    title: (area: string, province: string) => `Солонгосын ${province} ${area} дахь шилдэг эмнэлгүүд`,
    desc:  (area: string, n: number) => `${area}-д ${n} баталгаажсан эмнэлэг олдлоо.`,
    breadClinics: "Эмнэлэг хайх",
    breadArea: (area: string, province: string) => `${area}, ${province}`,
    subtitle: (n: number) => `${n} баталгаажсан эмнэлэг`,
    doctors: (n: number) => `${n} эмч`,
    specialists: (n: number) => `${n} мэргэжилтэн`,
    website: "Вэбсайт →",
    noClinic: "Энэ бүс нутгийн мэдээлэл байхгүй байна.",
    ctaTitle: (area: string) => `${area}-д тохирох эмнэлэг олох`,
    ctaDesc: "AI танд тохирох эмнэлэг санал болгоно",
    ctaBtn: "AI зөвлөгөө авах",
    otherAreas: "Бусад бүс нутаг",
    anesthesia: "Мэдээгүйжүүлэгч мэргэжилтэн",
  },
} as const;

type LocaleKey = keyof typeof T;

function t(locale: string): typeof T[LocaleKey] {
  return T[(locale as LocaleKey)] ?? T.en;
}

export function generateStaticParams() {
  const params: { locale: string; "area-slug": string }[] = [];
  for (const locale of LOCALES) {
    for (const slug of getAllAreaSlugs()) {
      params.push({ locale, "area-slug": slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; "area-slug": string }>;
}): Promise<Metadata> {
  const { locale, "area-slug": areaSlug } = await params;
  const area = getAreaBySlug(areaSlug);
  if (!area) return {};

  const tx = t(locale);
  const isKo = locale === "ko";
  const displayArea = isKo ? area.ko : area.nameEn;
  const displayProvince = isKo ? area.province : area.provinceEn;

  const sb = createServiceRoleClient();
  const { count } = await sb
    .from("clinics")
    .select("*", { count: "exact", head: true })
    .eq("sggu_cd_nm", area.ko)
    .eq("is_active", true);

  const n = count ?? 0;
  const title = `${tx.title(displayArea, displayProvince)} — KBBG`;
  const description = tx.desc(displayArea, n);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/clinics/area/${areaSlug}`,
      siteName: "KBBG",
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `${BASE_URL}/${l}/clinics/area/${areaSlug}`])
      ),
    },
  };
}

async function fetchAreaClinics(areaKo: string): Promise<Clinic[]> {
  const sb = createServiceRoleClient();
  const { data } = await sb
    .from("clinics")
    .select("*")
    .eq("sggu_cd_nm", areaKo)
    .eq("is_active", true)
    .order("google_rating", { ascending: false, nullsFirst: false })
    .limit(30);
  return (data ?? []) as unknown as Clinic[];
}

export default async function AreaClinicPage({
  params,
}: {
  params: Promise<{ locale: string; "area-slug": string }>;
}) {
  const { locale, "area-slug": areaSlug } = await params;
  const area = getAreaBySlug(areaSlug);
  if (!area) notFound();

  const clinics = await fetchAreaClinics(area.ko);
  const tx = t(locale);
  const isKo = locale === "ko";
  const displayArea = isKo ? area.ko : area.nameEn;
  const displayProvince = isKo ? area.province : area.provinceEn;

  // 같은 시도의 다른 지역 (최대 8개)
  const nearbyAreas = CLINIC_AREAS
    .filter((a) => a.province === area.province && a.slug !== areaSlug)
    .slice(0, 8);

  // JSON-LD
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: tx.title(displayArea, displayProvince),
    numberOfItems: clinics.length,
    itemListElement: clinics.slice(0, 10).map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "MedicalClinic",
        name: isKo ? c.name : (c.name_en || c.name),
        address: {
          "@type": "PostalAddress",
          streetAddress: c.address || undefined,
          addressLocality: c.sggu_cd_nm,
          addressRegion: c.sido_cd_nm,
          addressCountry: "KR",
        },
        telephone: c.phone || undefined,
        ...(c.google_rating
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: c.google_rating,
                reviewCount: c.google_review_count ?? 1,
              },
            }
          : {}),
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main className="min-h-screen bg-stone-50">
        {/* 히어로 */}
        <section className="bg-white border-b border-stone-100 px-4 py-12">
          <div className="mx-auto max-w-2xl">
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6 flex-wrap">
              <Link href={`/${locale}`} className="hover:text-gray-600">
                Home
              </Link>
              <span>/</span>
              <Link href={`/${locale}/clinics`} className="hover:text-gray-600">
                {tx.breadClinics}
              </Link>
              <span>/</span>
              <span className="text-gray-600">
                {tx.breadArea(displayArea, displayProvince)}
              </span>
            </nav>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {tx.title(displayArea, displayProvince)}
            </h1>
            <p className="text-sm text-gray-500">
              {tx.subtitle(clinics.length)}
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-2xl px-4 py-8 space-y-4">
          {/* 클리닉 목록 */}
          {clinics.length > 0 ? (
            clinics.map((clinic, idx) => {
              const displayName = isKo ? clinic.name : (clinic.name_en || clinic.name);
              return (
                <div
                  key={clinic.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-400 font-medium">
                          {idx + 1}.
                        </span>
                        <h2 className="text-sm font-semibold text-gray-900">
                          {displayName}
                        </h2>
                        {clinic.cl_cd_nm && (
                          <span className="text-xs text-gray-400">
                            {clinic.cl_cd_nm}
                          </span>
                        )}
                      </div>

                      {clinic.dgsbjt_cd_nm && (
                        <p className="text-xs text-gray-500 mt-1">
                          {clinic.dgsbjt_cd_nm}
                        </p>
                      )}

                      {clinic.address && (
                        <p className="text-xs text-gray-400 mt-1 break-words">
                          {clinic.address}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                        {clinic.phone && <span>📞 {clinic.phone}</span>}
                        {clinic.dr_tot_cnt > 0 && (
                          <span>👨‍⚕️ {tx.doctors(clinic.dr_tot_cnt)}</span>
                        )}
                        {(clinic.sdr_cnt ?? 0) > 0 && (
                          <span>🏅 {tx.specialists(clinic.sdr_cnt!)}</span>
                        )}
                        {clinic.google_rating && clinic.google_rating > 0 && (
                          <span className="text-yellow-600 font-medium">
                            ⭐ {clinic.google_rating.toFixed(1)}
                            {clinic.google_review_count
                              ? ` (${clinic.google_review_count.toLocaleString()})`
                              : ""}
                          </span>
                        )}
                      </div>

                      {clinic.website && (
                        <a
                          href={safeUrl(
                            clinic.website.startsWith("http")
                              ? clinic.website
                              : `http://${clinic.website}`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-xs text-slate-600 hover:underline"
                        >
                          {tx.website}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <p className="text-sm text-gray-400">{tx.noClinic}</p>
            </div>
          )}

          {/* AI 추천 CTA */}
          <div className="bg-[#1d1d1f] rounded-2xl p-6 text-white text-center">
            <h2 className="text-lg font-bold mb-2">
              {tx.ctaTitle(displayArea)}
            </h2>
            <p className="text-xs text-slate-300 mb-4">{tx.ctaDesc}</p>
            <Link
              href={`/${locale}/ai-search?q=${encodeURIComponent(displayArea)}`}
              className="inline-block px-6 py-3 bg-white text-slate-800 text-sm font-semibold rounded-full hover:bg-slate-100 transition-colors"
            >
              {tx.ctaBtn}
            </Link>
          </div>

          {/* 같은 시도 내 다른 지역 */}
          {nearbyAreas.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <h2 className="text-base font-bold text-gray-900 mb-3">
                {tx.otherAreas} — {displayProvince}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {nearbyAreas.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/${locale}/clinics/area/${a.slug}`}
                    className="flex items-center gap-2 px-3 py-2.5 bg-stone-50 hover:bg-stone-100 rounded-xl text-xs text-gray-700 transition-colors"
                  >
                    <span className="text-blue-500">›</span>
                    {isKo ? a.ko : a.nameEn}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
