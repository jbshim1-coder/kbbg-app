// locale별 홈페이지 - 서버 컴포넌트에서 getTranslations 사용
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";

// 인기 시술 더미 데이터 — 번역 키 사용
const TOP_PROCEDURES = [
  { id: 1, nameKey: "procedures.p1_name", categoryKey: "procedures.p1_category", priceKey: "procedures.p1_price", clinics: 120 },
  { id: 2, nameKey: "procedures.p2_name", categoryKey: "procedures.p2_category", priceKey: "procedures.p2_price", clinics: 280 },
  { id: 3, nameKey: "procedures.p3_name", categoryKey: "procedures.p3_category", priceKey: "procedures.p3_price", clinics: 85 },
  { id: 4, nameKey: "procedures.p4_name", categoryKey: "procedures.p4_category", priceKey: "procedures.p4_price", clinics: 150 },
  { id: 5, nameKey: "procedures.p5_name", categoryKey: "procedures.p5_category", priceKey: "procedures.p5_price", clinics: 210 },
];

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
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-pink-50 to-blue-50 px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            {t("hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/recommend"
              className="rounded-xl bg-pink-500 px-8 py-3 text-lg font-semibold text-white transition hover:bg-pink-600 active:bg-pink-700"
            >
              {t("hero.cta_recommend")}
            </Link>
            <Link
              href="/community"
              className="rounded-xl border border-gray-300 px-8 py-3 text-lg font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              {t("hero.cta_community")}
            </Link>
          </div>
        </div>
      </section>

      {/* 인기 시술 TOP 5 */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">{t("procedures.title")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOP_PROCEDURES.map((proc, idx) => (
              <div
                key={proc.id}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl font-black text-pink-100">0{idx + 1}</span>
                  <span className="rounded-full bg-pink-50 px-2 py-0.5 text-xs font-medium text-pink-600">
                    {t(proc.categoryKey as Parameters<typeof t>[0])}
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-gray-900">{t(proc.nameKey as Parameters<typeof t>[0])}</h3>
                <p className="mt-1 text-sm text-gray-500">{t(proc.priceKey as Parameters<typeof t>[0])}</p>
                <p className="mt-1 text-xs text-gray-400">{t("procedures.related_clinics", { count: proc.clinics })}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 최신 커뮤니티 글 */}
      <section className="bg-gray-50 px-4 py-14">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{t("community_preview.title")}</h2>
            <Link href="/community" className="text-sm text-pink-500 hover:underline">
              {t("community_preview.view_all")}
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {RECENT_POSTS.map((post) => (
              <Link
                key={post.id}
                href={`/community/${post.id}`}
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

      {/* 푸터 */}
      <footer className="border-t border-gray-100 px-4 py-8 text-center text-xs text-gray-400">
        <div className="flex justify-center gap-4">
          <Link href="/about" className="hover:text-gray-600">{t("nav.about")}</Link>
          <Link href="/contact" className="hover:text-gray-600">{t("nav.contact")}</Link>
          <Link href="/terms" className="hover:text-gray-600">{t("footer.terms")}</Link>
          <Link href="/privacy" className="hover:text-gray-600">{t("footer.privacy")}</Link>
          <Link href="/disclaimer" className="hover:text-gray-600">{t("footer.disclaimer")}</Link>
        </div>
        <p className="mt-4">{t("footer.copyright", { year: new Date().getFullYear() })}</p>
      </footer>
    </main>
  );
}
