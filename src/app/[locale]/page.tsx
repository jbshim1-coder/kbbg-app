// locale별 홈페이지 - 서버 컴포넌트에서 getTranslations 사용
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";

// 인기 시술 더미 데이터
const TOP_PROCEDURES = [
  { id: 1, name: "쌍꺼풀 수술", category: "성형", price: "50~150만원", clinics: 120 },
  { id: 2, name: "보톡스", category: "피부", price: "10~30만원", clinics: 280 },
  { id: 3, name: "라식/라섹", category: "안과", price: "100~200만원", clinics: 85 },
  { id: 4, name: "치아 미백", category: "치과", price: "20~80만원", clinics: 150 },
  { id: 5, name: "필러", category: "피부", price: "20~60만원", clinics: 210 },
];

// 최신 커뮤니티 글 더미 데이터
const RECENT_POSTS = [
  { id: 1, title: "강남 쌍꺼풀 후기 — 3개월 경과", category: "성형", author: "user_kr", comments: 24, upvotes: 87 },
  { id: 2, title: "외국인도 보험 없이 피부과 갈 수 있나요?", category: "피부", author: "sarah_jp", comments: 15, upvotes: 42 },
  { id: 3, title: "치아 교정 가격 비교 (강남 vs 홍대)", category: "치과", author: "mike_us", comments: 31, upvotes: 63 },
];

// 신뢰 배지 데이터
const TRUST_BADGES = [
  { stat: "500+", labelKey: "trust.clinics" },
  { stat: "7", labelKey: "trust.languages" },
  { stat: "AI", labelKey: "trust.ai" },
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

      {/* 신뢰 배지 */}
      <section className="border-y border-gray-100 bg-white px-4 py-6">
        <div className="mx-auto flex max-w-3xl justify-around">
          {TRUST_BADGES.map((badge) => (
            <div key={badge.labelKey} className="text-center">
              <p className="text-2xl font-bold text-pink-500">{badge.stat}</p>
              <p className="text-sm text-gray-500">{t(badge.labelKey as Parameters<typeof t>[0])}</p>
            </div>
          ))}
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
                    {proc.category}
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-gray-900">{proc.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{proc.price}</p>
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
                    {post.category}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{post.title}</span>
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
