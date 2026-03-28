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

      {/* ━━━ 3대 서비스 허브 ━━━ */}
      <section className="bg-[#fafafa] px-4 py-10 border-b border-gray-100">
        <div className="mx-auto max-w-6xl">

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">

            {/* ── 서비스 1: AI 맞춤 추천 (데스크탑 2/5) ── */}
            <div className="lg:col-span-2 flex flex-col">
              <div className="relative rounded-2xl overflow-hidden shadow-sm">
                {/* 배경: 진한 로즈 그라디언트 + 패턴 */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-pink-600 to-rose-500" />
                {/* 장식용 원형 빛 번짐 */}
                <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-8 w-64 h-64 rounded-full bg-pink-400/20 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col p-6 sm:p-8">
                  {/* 서비스 아이콘 */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl shrink-0">
                      ✦
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white/60 tracking-widest uppercase">AI Recommendation</p>
                      <h2 className="text-lg font-bold text-white leading-tight">AI 맞춤 추천</h2>
                    </div>
                  </div>

                  {/* 설명 */}
                  <p className="text-sm text-white/75 leading-relaxed mb-6">
                    증상이나 원하는 시술을 자연어로 입력하면
                    AI가 최적의 병원을 즉시 추천해드립니다.
                  </p>

                  {/* 검색 위젯 — 흰 배경 카드로 강조 */}
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg ring-1 ring-white/20">
                    <AiSearchBox locale={locale} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── 서비스 2 + 3 세로 스택 (데스크탑 3/5) ── */}
            <div className="lg:col-span-3 flex flex-col gap-5">

              {/* 서비스 2: AI 얼굴 분석 — 컴포넌트 자체가 완결적 카드 */}
              <div className="rounded-2xl overflow-hidden shadow-sm ring-1 ring-gray-100">
                <FaceAnalysis locale={locale} />
              </div>

              {/* 서비스 3: 병원 찾기 — 헤더 영역 추가 후 컴포넌트 연결 */}
              <div className="rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm overflow-hidden">
                {/* 카드 상단 액센트 바 */}
                <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <div className="px-5 pt-5 pb-1 flex items-center gap-3 border-b border-gray-50">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-base shrink-0">
                    🏥
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">병원 찾기</h2>
                    <p className="text-xs text-gray-400">진료과·지역·유형으로 실시간 검색</p>
                  </div>
                </div>
                <div className="p-5 pt-4">
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
