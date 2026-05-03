// 블로그 상세 페이지 — SEO 최적화 (구조화 데이터 포함)
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import sanitize from "sanitize-html";
import { ShareButtons, FloatingShareButton } from "@/components/ShareButtons";

const LOCALES = ["en", "ko", "zh", "ja", "ru", "vi", "th", "mn"];
const BASE_URL = "https://kbeautybuyersguide.com";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

function sanitizeHtml(html: string): string {
  return sanitize(html, {
    allowedTags: ["h2","h3","h4","p","ul","ol","li","strong","em","a","br","hr","img","div","span","table","tr","td","th","thead","tbody"],
    allowedAttributes: { a: ["href","target","rel"], img: ["src","alt","style","loading"], div: ["style","class"], span: ["class","style"], "*": ["class"] },
  });
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

async function getPost(slug: string) {
  const { data } = await getSupabase()
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .eq("site", "kbbg")
    .single();
  return data;
}

interface RelatedPost {
  slug: string;
  title_ko: string;
  title_en: string;
  category: string;
  published_at: string;
  [key: string]: string;
}

// h3 태그(질문 포함) + 다음 p 태그(답변)를 파싱하여 FAQPage 스키마 항목 생성
function parseFaqItems(html: string): { question: string; answer: string }[] {
  const items: { question: string; answer: string }[] = [];
  const pattern = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    const question = match[1].replace(/<[^>]+>/g, "").trim();
    const answer = match[2].replace(/<[^>]+>/g, "").trim();
    // "?" 포함된 h3만 FAQ로 간주
    if (question.includes("?") && answer.length > 0) {
      items.push({ question, answer });
    }
  }
  return items;
}

async function getRelatedPosts(category: string, currentSlug: string): Promise<RelatedPost[]> {
  const { data } = await getSupabase()
    .from("blog_posts")
    .select("slug, title_ko, title_en, category, published_at")
    .eq("is_published", true)
    .eq("site", "kbbg")
    .eq("category", category)
    .neq("slug", currentSlug)
    .order("published_at", { ascending: false })
    .limit(4);
  return (data || []) as RelatedPost[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const isKo = locale === "ko";
  const title = (post[`title_${locale}`] || post.title_en) + " — KBBG Blog";
  const description = isKo
    ? post.excerpt_ko || post.title_ko
    : post.excerpt_en || post.title_en;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/blog/${slug}`,
      siteName: "KBBG",
      type: "article",
      ...(post.image_url ? { images: [{ url: post.image_url, width: 1200, height: 630, alt: title }] } : {}),
      publishedTime: post.published_at,
      section: post.category,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(post.image_url ? { images: [post.image_url] } : {}),
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog/${slug}`,
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, `${BASE_URL}/${l}/blog/${slug}`])),
        "x-default": `${BASE_URL}/en/blog/${slug}`,
      },
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const isKo = locale === "ko";
  const title = post[`title_${locale}`] || post.title_en;
  const rawContent = post[`content_${locale}`] || post.content_en || "<p>Content not available.</p>";
  const content = sanitizeHtml(rawContent);
  const catLabel = CATEGORY_LABELS[post.category]?.[isKo ? "ko" : "en"] || post.category;
  const relatedPosts = await getRelatedPosts(post.category, slug);

  const faqItems = parseFaqItems(rawContent);
  const faqSchema = faqItems.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      }
    : null;

  // Article JSON-LD
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: post.excerpt_en || post.title_en,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { "@type": "Organization", name: "KBBG", url: BASE_URL },
    publisher: { "@type": "Organization", name: "KBBG - K-Beauty Buyers Guide", url: BASE_URL },
    ...(post.image_url ? { image: post.image_url } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <main className="min-h-screen bg-stone-50">
        {/* 헤더 */}
        <section className="bg-white border-b border-stone-100 px-4 py-10">
          <div className="mx-auto max-w-2xl">
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
              <Link href={`/${locale}`} className="hover:text-gray-600">Home</Link>
              <span>/</span>
              <Link href={`/${locale}/blog`} className="hover:text-gray-600">Blog</Link>
              <span>/</span>
              <span className="text-gray-600">{catLabel}</span>
            </nav>

            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full mb-3">
              {catLabel}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-xs text-gray-400">
              {new Date(post.published_at).toLocaleDateString(locale, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
          {/* 대표 이미지 */}
          {post.image_url && (
            <div className="rounded-2xl overflow-hidden bg-stone-100">
              <img
                src={post.image_url}
                alt={post.image_alt || title}
                className="w-full h-auto max-h-[400px] object-cover"
              />
            </div>
          )}

          {/* 본문 */}
          <article className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
            <div
              className="prose prose-sm prose-stone max-w-none
                prose-headings:text-gray-900 prose-headings:font-bold
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-li:text-gray-700
                prose-strong:text-gray-900
                prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </article>

          {/* 해시태그 */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.hashtags.map((tag: string) => (
                <span key={tag} className="text-xs text-blue-500">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Share buttons */}
          <div className="bg-white rounded-2xl px-6 py-5 shadow-sm border border-stone-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Share this article
            </p>
            <ShareButtons
              title={title}
              url={`${BASE_URL}/${locale}/blog/${slug}`}
            />
          </div>

          {/* AI 추천 CTA */}
          <div className="bg-[#1d1d1f] rounded-2xl p-6 text-white text-center">
            <h2 className="text-lg font-bold mb-2">
              {isKo ? "나에게 맞는 클리닉 찾기" : "Find Your Perfect Clinic"}
            </h2>
            <p className="text-xs text-slate-300 mb-4">
              {isKo
                ? "AI가 검증된 데이터를 기반으로 맞춤 추천해드립니다"
                : "Get personalized AI recommendations based on verified data"}
            </p>
            <Link
              href={`/${locale}/ai-search`}
              className="inline-block px-6 py-3 bg-white text-slate-800 text-sm font-semibold rounded-full hover:bg-slate-100 transition-colors"
            >
              {isKo ? "AI 추천 받기" : "Get AI Recommendation"}
            </Link>
          </div>

          {/* 관련 글 */}
          {relatedPosts.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <h2 className="text-base font-bold text-gray-900 mb-4">
                {isKo ? "관련 글" : "Related Articles"}
              </h2>
              <div className="grid gap-2">
                {relatedPosts.map((rp) => (
                  <Link
                    key={rp.slug}
                    href={`/${locale}/blog/${rp.slug}`}
                    className="flex items-center gap-2 px-3 py-2.5 bg-stone-50 hover:bg-stone-100 rounded-xl text-sm text-gray-700 transition-colors"
                  >
                    <span className="text-blue-500">&#8250;</span>
                    {rp[`title_${locale}`] || rp.title_en}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* AI 활용 제작 표시 (한국 법 준수) */}
          <p className="text-center text-xs text-gray-300 pt-4">
            {isKo
              ? "이 콘텐츠는 AI를 활용하여 제작되었습니다."
              : "This content was created with the assistance of AI."}
          </p>
        </div>

        {/* Floating mobile share button */}
        <FloatingShareButton
          title={title}
          url={`${BASE_URL}/${locale}/blog/${slug}`}
        />
      </main>
    </>
  );
}
