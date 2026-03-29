// locale별 홈페이지 — 3대 서비스 중심 레이아웃
// 1. AI 추천  2. AI 얼굴 분석  3. 병원 찾기
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ClinicFilter from "@/components/ClinicFilter";
import TrendingSidebar from "@/components/TrendingSidebar";
import HeroSlider from "@/components/HeroSlider";
import BeautyBanner from "@/components/BeautyBanner";
import BeautyMoodBanner from "@/components/BeautyMoodBanner";
import DailyCheckIn from "@/components/DailyCheckIn";
import FaceAnalysis from "@/components/FaceAnalysis";
import TopDepartments from "@/components/TopDepartments";
import ConsultationForm from "@/components/ConsultationForm";

// 최신 커뮤니티 글 더미 데이터 — 번역 키 사용
const RECENT_POSTS = [
  { id: 1, titleKey: "community_preview.post1_title", categoryKey: "community_preview.post1_category", author: "user_kr", comments: 24, upvotes: 87 },
  { id: 2, titleKey: "community_preview.post2_title", categoryKey: "community_preview.post2_category", author: "sarah_jp", comments: 15, upvotes: 42 },
  { id: 3, titleKey: "community_preview.post3_title", categoryKey: "community_preview.post3_category", author: "mike_us", comments: 31, upvotes: 63 },
  { id: 4, titleKey: "community_preview.post4_title", categoryKey: "community_preview.post4_category", author: "tom_vn", comments: 27, upvotes: 54 },
  { id: 5, titleKey: "community_preview.post5_title", categoryKey: "community_preview.post5_category", author: "lisa_th", comments: 19, upvotes: 48 },
  { id: 6, titleKey: "community_preview.post6_title", categoryKey: "community_preview.post6_category", author: "chen_cn", comments: 12, upvotes: 35 },
  { id: 7, titleKey: "community_preview.post7_title", categoryKey: "community_preview.post7_category", author: "kim_kr", comments: 22, upvotes: 61 },
  { id: 8, titleKey: "community_preview.post8_title", categoryKey: "community_preview.post8_category", author: "yuki_jp", comments: 8, upvotes: 29 },
  { id: 9, titleKey: "community_preview.post9_title", categoryKey: "community_preview.post9_category", author: "david_uk", comments: 33, upvotes: 72 },
  { id: 10, titleKey: "community_preview.post10_title", categoryKey: "community_preview.post10_category", author: "mai_vn", comments: 11, upvotes: 38 },
];


export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <main className="min-h-screen bg-stone-50">

      {/* ━━━ 히어로: 한국 명소 롤링 + AI 검색 ━━━ */}
      <HeroSlider locale={locale} />

      {/* ━━━ AI 얼굴 분석 + 병원 찾기 — 2분할 ━━━ */}
      <section className="bg-white px-4 py-12 border-b border-stone-100">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 서비스 2: AI 얼굴 분석 */}
          <div className="rounded-2xl overflow-hidden shadow-sm">
            <FaceAnalysis locale={locale} />
          </div>

          {/* 서비스 3: 병원 찾기 */}
          <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-2 flex items-center gap-3 border-b border-stone-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">조건별 병원검색</h2>
                <p className="text-xs text-gray-400">진료과·지역·유형으로 실시간 검색</p>
              </div>
            </div>
            <div className="p-6 pt-4">
              <ClinicFilter locale={locale} />
            </div>
          </div>

        </div>
      </section>

      {/* ━━━ 뷰티 무드 배너 1 ━━━ */}
      <BeautyMoodBanner
        image="/hero/model2.jpg"
        titleKo="피부가 달라지는 경험"
        titleEn="Experience the Difference"
        subKo="한국 피부과 전문의가 추천하는 맞춤 시술"
        subEn="Personalized treatments by Korean dermatologists"
      />

      {/* ━━━ 운영자에게 병원 추천 받기 ━━━ */}
      <section className="px-4 py-10 bg-stone-50 border-b border-stone-100">
        <div className="mx-auto max-w-6xl">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl">💬</span>
              <h2 className="text-lg font-bold text-gray-900">
                {locale === "ko" ? "운영자에게 병원 추천 받기" : "Get Expert Recommendation"}
              </h2>
            </div>
            <ConsultationForm locale={locale} />
          </div>
        </div>
      </section>

      {/* ━━━ 인기 진료과 + 사이드바 ━━━ */}
      <section className="px-4 py-12 bg-stone-50">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 왼쪽: 인기 진료과 + 커뮤니티 */}
          <div className="lg:col-span-2 space-y-8">

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <TopDepartments locale={locale} />
            </div>

            {/* 최신 커뮤니티 글 */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{t("community_preview.title")}</h2>
                <Link href={`/${locale}/community`} className="text-sm text-rose-500 hover:text-rose-500 transition-colors">
                  {t("community_preview.view_all")}
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                {RECENT_POSTS.map((post) => (
                  <Link
                    key={post.id}
                    href={`/${locale}/community/${post.id}`}
                    className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div>
                      <span className="mr-2 rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {t(post.categoryKey as Parameters<typeof t>[0])}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{t(post.titleKey as Parameters<typeof t>[0])}</span>
                      <p className="mt-0.5 text-xs text-gray-400">by {post.author}</p>
                    </div>
                    <div className="ml-4 flex shrink-0 gap-3 text-xs text-gray-400">
                      <span>{post.upvotes}</span>
                      <span>{post.comments}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽 사이드바 */}
          <div className="lg:col-span-1 space-y-4">
            <DailyCheckIn locale={locale} />
            <TrendingSidebar />
          </div>
        </div>
      </section>

      {/* ━━━ 뷰티 무드 배너 2 ━━━ */}
      <BeautyMoodBanner
        image="/hero/model3.jpg"
        titleKo="강남·명동, 세계가 찾는 뷰티 성지"
        titleEn="Gangnam & Myeongdong — The World's Beauty Capital"
        subKo="성형·피부·치과·안과 최고의 전문의를 만나보세요"
        subEn="Meet the best specialists in plastic surgery, dermatology, dental & ophthalmology"
      />

      {/* ━━━ 뷰티 배너 — 여성 모델 + CTA ━━━ */}
      <BeautyBanner />

      {/* 한국의 거리 라이브 — 5개 그리드 */}
      <section className="bg-slate-900 px-4 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </span>
              <h2 className="text-2xl font-bold text-white">{t("live.title")}</h2>
            </div>
            <Link href={`/${locale}/live`} className="text-sm text-gray-400 hover:text-white transition-colors">
              {t("live.view_more")}
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { id:"hangang", videoId:"zpCZ9OFjb3U" },
              { id:"banpo", videoId:"-JhoMGoAfFc" },
              { id:"lotte", videoId:"vZtdRVDlPQA" },
              { id:"gangnam", videoId:"gCNeDWCI0vo" },
              { id:"busan", videoId:"G40EYtfNCTg" },
            ].map((ch) => (
              <Link
                key={ch.id}
                href={`/${locale}/live`}
                className="group relative overflow-hidden rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="relative aspect-video bg-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${ch.videoId}/mqdefault.jpg`}
                    alt={ch.id}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
                    LIVE
                  </span>
                </div>
                <div className="bg-slate-800 px-2 py-1.5 text-center">
                  <span className="text-xs font-medium text-gray-200">
                    {t(`live.ch_${ch.id}` as Parameters<typeof t>[0])}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 뷰티 무드 배너 3 ━━━ */}
      <BeautyMoodBanner
        image="/hero/model4.jpg"
        titleKo="아름다움을 위한 첫걸음"
        titleEn="Your First Step to Beauty"
        subKo="AI가 분석하고 전문의가 상담하는 맞춤 의료관광"
        subEn="AI analysis & specialist consultation for your medical tourism"
      />

    </main>
  );
}
