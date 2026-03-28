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

      {/* ━━━ 3대 서비스 허브 ━━━
          배너 바로 아래, 흰 배경 위에 카드 트리오.
          데스크탑: 좌(AI추천, 세로 1/3) + 우(얼굴분석·병원찾기 스택, 2/3)
          태블릿 이하: 단일 컬럼 스택                                   */}
      <section className="bg-white px-4 py-10 border-b border-gray-100">
        <div className="mx-auto max-w-6xl">

          {/* 섹션 레이블 */}
          <div className="flex items-center gap-2 mb-6">
            <span className="block h-0.5 w-6 bg-pink-400 rounded-full" />
            <span className="text-xs font-semibold tracking-widest text-pink-500 uppercase">
              Core Services
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* ── 서비스 1: AI 추천 (데스크탑 2/5) ── */}
            <div className="lg:col-span-2 flex flex-col">
              <div className="flex-1 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 p-6 sm:p-8 flex flex-col justify-between shadow-sm">
                {/* 상단: 라벨 + 설명 */}
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white mb-4">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    SERVICE 01
                  </span>
                  <h2 className="text-2xl font-bold text-white leading-snug mb-2">
                    AI 맞춤 추천
                  </h2>
                  <p className="text-sm text-white/80 leading-relaxed">
                    자연어로 증상·시술을 입력하면
                    <br />AI가 최적 병원을 즉시 추천합니다
                  </p>
                </div>
                {/* 하단: 검색 위젯 */}
                <div className="mt-6 bg-white rounded-xl p-4 shadow-inner">
                  <AiSearchBox locale={locale} />
                </div>
              </div>
            </div>

            {/* ── 서비스 2 + 3 세로 스택 (데스크탑 3/5) ── */}
            <div className="lg:col-span-3 flex flex-col gap-5">

              {/* 서비스 2: AI 얼굴 분석 */}
              <div className="relative rounded-2xl overflow-hidden shadow-sm">
                {/* 서비스 번호 배지 */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    SERVICE 02
                  </span>
                </div>
                <FaceAnalysis locale={locale} />
              </div>

              {/* 서비스 3: 병원 찾기 */}
              <div className="relative rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    SERVICE 03
                  </span>
                </div>
                <div className="pt-12 p-5">
                  <ClinicFilter locale={locale} />
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ━━━ 인기 진료과 + 사이드바 ━━━ */}
      <section className="px-4 py-10 bg-gray-50">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 왼쪽: 인기 진료과 + 커뮤니티 */}
          <div className="lg:col-span-2 space-y-8">

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <TopDepartments locale={locale} />
            </div>

            {/* 최신 커뮤니티 글 */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{t("community_preview.title")}</h2>
                <Link href={`/${locale}/community`} className="text-sm text-pink-500 hover:underline">
                  {t("community_preview.view_all")}
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                {RECENT_POSTS.map((post) => (
                  <Link
                    key={post.id}
                    href={`/${locale}/community/${post.id}`}
                    className="flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-sm border border-gray-100 transition hover:shadow-md"
                  >
                    <div>
                      <span className="mr-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                        {t(post.categoryKey as Parameters<typeof t>[0])}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{t(post.titleKey as Parameters<typeof t>[0])}</span>
                      <p className="mt-0.5 text-xs text-gray-400">by {post.author}</p>
                    </div>
                    <div className="ml-4 flex shrink-0 gap-3 text-xs text-gray-400">
                      <span>↑ {post.upvotes}</span>
                      <span>💬 {post.comments}</span>
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
      <section className="bg-gray-950 px-4 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </span>
              <h2 className="text-2xl font-bold text-white">{t("live.title")}</h2>
            </div>
            <Link href={`/${locale}/live`} className="text-sm text-pink-400 hover:underline">
              {t("live.view_more")}
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { id:"hangang", videoId:"zpCZ9OFjb3U", emoji:"🌉" },
              { id:"banpo", videoId:"-JhoMGoAfFc", emoji:"🌈" },
              { id:"lotte", videoId:"vZtdRVDlPQA", emoji:"🏢" },
              { id:"gangnam", videoId:"gCNeDWCI0vo", emoji:"🏙️" },
              { id:"busan", videoId:"G40EYtfNCTg", emoji:"🌇" },
            ].map((ch) => (
              <Link
                key={ch.id}
                href={`/${locale}/live`}
                className="group relative overflow-hidden rounded-xl border-2 border-gray-700 hover:border-gray-500 transition-all"
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
                <div className="bg-gray-900 px-2 py-1.5 text-center">
                  <span className="mr-1">{ch.emoji}</span>
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
