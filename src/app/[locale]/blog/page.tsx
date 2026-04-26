// 블로그 목록 페이지 — SEO 전용 (메뉴에 노출 안 함)
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const LOCALES = ["en", "ko", "zh", "ja", "ru", "vi", "th", "mn"];
const BASE_URL = "https://kbeautybuyersguide.com";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  guide: { en: "Procedure Guide", ko: "시술 가이드" },
  cosmetics: { en: "K-Beauty Rankings", ko: "화장품 순위" },
  event: { en: "Clinic Events", ko: "병원 이벤트" },
  faq: { en: "FAQ", ko: "자주 묻는 질문" },
  compare: { en: "Cost Comparison", ko: "비용 비교" },
  ingredient: { en: "Ingredient Analysis", ko: "성분 분석" },
  tips: { en: "Medical Tourism Tips", ko: "의료관광 팁" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === "ko";
  const title = isKo
    ? "K-뷰티 블로그 — 한국 뷰티 의료관광 가이드 | KBBG"
    : "K-Beauty Blog — Korean Beauty & Medical Tourism Guide | KBBG";
  const description = isKo
    ? "한국 성형, 피부과, 치과 시술 가이드와 K-뷰티 화장품 순위, 의료관광 팁을 제공합니다."
    : "Korean plastic surgery, dermatology guides, K-beauty cosmetics rankings, and medical tourism tips.";

  return {
    title,
    description,
    openGraph: { title, description, url: `${BASE_URL}/${locale}/blog`, siteName: "KBBG" },
    alternates: {
      languages: Object.fromEntries(LOCALES.map((l) => [l, `${BASE_URL}/${l}/blog`])),
    },
  };
}

interface BlogPost {
  slug: string;
  category: string;
  title_ko: string;
  title_en: string;
  excerpt_ko: string | null;
  excerpt_en: string | null;
  image_url: string | null;
  published_at: string;
  tags: string[];
  [key: string]: string | string[] | null;
}

export default async function BlogListPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { locale } = await params;
  const { category, page } = await searchParams;
  const isKo = locale === "ko";
  const currentPage = parseInt(page || "1");
  const perPage = 12;

  let query = getSupabase()
    .from("blog_posts")
    .select("slug, category, title_ko, title_en, excerpt_ko, excerpt_en, image_url, published_at, tags")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .range((currentPage - 1) * perPage, currentPage * perPage - 1);

  if (category) query = query.eq("category", category);

  const { data: posts } = await query;
  const blogPosts: BlogPost[] = posts || [];

  // 제목 가져오기 (locale 기반)
  const getTitle = (post: BlogPost) => {
    const key = `title_${locale}` as keyof BlogPost;
    return (post[key] as string) || post.title_en;
  };

  const getExcerpt = (post: BlogPost) => {
    if (isKo) return post.excerpt_ko || post.excerpt_en || "";
    return post.excerpt_en || post.excerpt_ko || "";
  };

  return (
    <main className="min-h-screen bg-stone-50">
      {/* 헤더 */}
      <section className="bg-white border-b border-stone-100 px-4 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isKo ? "K-뷰티 블로그" : "K-Beauty Blog"}
          </h1>
          <p className="text-sm text-gray-500">
            {isKo
              ? "한국 뷰티 시술, 화장품, 의료관광에 대한 최신 정보"
              : "Latest guides on Korean beauty procedures, cosmetics & medical tourism"}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* 카테고리 필터 */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href={`/${locale}/blog`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !category ? "bg-slate-800 text-white" : "bg-white text-gray-600 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            {isKo ? "전체" : "All"}
          </Link>
          {Object.entries(CATEGORY_LABELS).map(([key, labels]) => (
            <Link
              key={key}
              href={`/${locale}/blog?category=${key}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                category === key ? "bg-slate-800 text-white" : "bg-white text-gray-600 border border-stone-200 hover:bg-stone-50"
              }`}
            >
              {isKo ? labels.ko : labels.en}
            </Link>
          ))}
        </div>

        {/* 글 목록 */}
        {blogPosts.length > 0 ? (
          <div className="grid gap-4">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/${locale}/blog/${post.slug}`}
                className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 hover:shadow-md transition-shadow flex gap-4"
              >
                {post.image_url && (
                  <div className="shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-stone-100">
                    <img
                      src={post.image_url}
                      alt={getTitle(post)}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                      {CATEGORY_LABELS[post.category]?.[isKo ? "ko" : "en"] || post.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(post.published_at).toLocaleDateString(locale)}
                    </span>
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                    {getTitle(post)}
                  </h2>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {getExcerpt(post)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
            <p className="text-sm text-gray-400">
              {isKo ? "아직 게시된 글이 없습니다." : "No posts yet."}
            </p>
          </div>
        )}

        {/* 페이지네이션 */}
        {blogPosts.length >= perPage && (
          <div className="flex justify-center gap-2 mt-8">
            {currentPage > 1 && (
              <Link
                href={`/${locale}/blog?page=${currentPage - 1}${category ? `&category=${category}` : ""}`}
                className="px-4 py-2 bg-white border border-stone-200 rounded-full text-xs text-gray-600 hover:bg-stone-50"
              >
                {isKo ? "이전" : "Prev"}
              </Link>
            )}
            <Link
              href={`/${locale}/blog?page=${currentPage + 1}${category ? `&category=${category}` : ""}`}
              className="px-4 py-2 bg-slate-800 text-white rounded-full text-xs hover:bg-slate-900"
            >
              {isKo ? "다음" : "Next"}
            </Link>
          </div>
        )}
      </div>

      {/* AI 활용 제작 표시 (한국 법 준수) */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-300">
          {isKo
            ? "이 콘텐츠는 AI를 활용하여 제작되었습니다."
            : "This content was created with the assistance of AI."}
        </p>
      </div>
    </main>
  );
}
