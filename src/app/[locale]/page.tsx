// locale별 홈페이지 - 서버 컴포넌트에서 getTranslations 사용
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ClinicFilter from "@/components/ClinicFilter";
import AiSearchBox from "@/components/AiSearchBox";

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
  // 정적 렌더링 활성화
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <main className="min-h-screen">
      {/* AI 검색 섹션 */}
      <section className="bg-white px-4 pt-16 pb-8">
        <div className="mx-auto max-w-3xl">
          <AiSearchBox locale={locale} />
        </div>
      </section>

      {/* 병원 필터 검색 + AI 추천 */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-4xl">
          <ClinicFilter locale={locale} />
        </div>
      </section>

      {/* 최신 커뮤니티 글 */}
      <section className="bg-gray-50 px-4 py-14">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{t("community_preview.title")}</h2>
            <Link href={`/${locale}/community`} className="text-sm text-pink-500 hover:underline">
              {t("community_preview.view_all")}
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {RECENT_POSTS.map((post) => (
              <Link
                key={post.id}
                href={`/${locale}/community/${post.id}`}
                className="flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-sm transition hover:shadow-md"
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
      </section>

      {/* 한국의 거리 라이브 — 12개 바둑판 그리드 */}
      <section className="bg-gray-950 px-4 py-14">
        <div className="mx-auto max-w-5xl">
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
