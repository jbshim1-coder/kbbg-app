// locale별 홈페이지 — 3대 서비스 중심 레이아웃
// 1. AI 추천  2. AI 얼굴 분석  3. 병원 찾기
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ClinicFilter from "@/components/ClinicFilter";
import AiSearchBox from "@/components/AiSearchBox";
import TrendingSidebar from "@/components/TrendingSidebar";
import SlideBanner from "@/components/SlideBanner";
import DailyCheckIn from "@/components/DailyCheckIn";
import FaceAnalysis from "@/components/FaceAnalysis";
import TopDepartments from "@/components/TopDepartments";

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
    <main className="min-h-screen bg-gray-50">

      {/* ━━━ 히어로: 슬라이드 배너 ━━━ */}
      <SlideBanner locale={locale} />

      {/* ━━━ AI 맞춤 추천 — 전체 너비 ━━━ */}
      <section className="bg-gray-900 px-4 py-10 border-b border-gray-800">
        <div className="mx-auto max-w-6xl">
          <div className="bg-white rounded-lg p-4">
            <AiSearchBox locale={locale} />
          </div>
        </div>
      </section>

      {/* ━━━ AI 얼굴 분석 + 병원 찾기 — 2분할 ━━━ */}
      <section className="bg-white px-4 py-10 border-b border-gray-100">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 서비스 2: AI 얼굴 분석 */}
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <FaceAnalysis locale={locale} />
          </div>

          {/* 서비스 3: 병원 찾기 */}
          <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
            <div className="px-5 pt-5 pb-1 flex items-center gap-3 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">조건별 병원검색</h2>
                <p className="text-xs text-gray-400">진료과·지역·유형으로 실시간 검색</p>
              </div>
            </div>
            <div className="p-5 pt-4">
              <ClinicFilter locale={locale} />
            </div>
          </div>

        </div>
      </section>

      {/* ━━━ 인기 진료과 + 사이드바 ━━━ */}
      <section className="px-4 py-10 bg-gray-50">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 왼쪽: 인기 진료과 + 커뮤니티 */}
          <div className="lg:col-span-2 space-y-8">

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <TopDepartments locale={locale} />
            </div>

            {/* 최신 커뮤니티 글 */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{t("community_preview.title")}</h2>
                <Link href={`/${locale}/community`} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  {t("community_preview.view_all")}
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                {RECENT_POSTS.map((post) => (
                  <Link
                    key={post.id}
                    href={`/${locale}/community/${post.id}`}
                    className="flex items-center justify-between rounded-lg bg-white px-5 py-4 border border-gray-200 transition-colors hover:bg-gray-50"
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

      {/* 한국의 거리 라이브 — 5개 그리드 */}
      <section className="bg-gray-900 px-4 py-14">
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
                className="group relative overflow-hidden rounded-lg border border-gray-700 hover:border-gray-500 transition-colors"
              >
                <div className="relative aspect-video bg-gray-800">
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
                <div className="bg-gray-800 px-2 py-1.5 text-center">
                  <span className="text-xs font-medium text-gray-200">
                    {t(`live.ch_${ch.id}` as Parameters<typeof t>[0])}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-gray-100 px-4 py-8 text-center text-xs text-gray-400">
        <div className="flex justify-center gap-4">
          <Link href={`/${locale}/about`} className="hover:text-gray-600">{t("nav.about")}</Link>
          <Link href={`/${locale}/contact`} className="hover:text-gray-600">{t("nav.contact")}</Link>
          <Link href={`/${locale}/terms`} className="hover:text-gray-600">{t("footer.terms")}</Link>
          <Link href={`/${locale}/privacy`} className="hover:text-gray-600">{t("footer.privacy")}</Link>
          <Link href={`/${locale}/disclaimer`} className="hover:text-gray-600">{t("footer.disclaimer")}</Link>
        </div>
        <p className="mt-4">{t("footer.copyright", { year: new Date().getFullYear() })}</p>
      </footer>
    </main>
  );
}
