// 자동 사이트맵 생성 — Next.js MetadataRoute.Sitemap 활용
// 정적 페이지 + locale별 동적 URL + 프로그래매틱 SEO 페이지 포함
import type { MetadataRoute } from "next";
import { procedureGuides } from "@/data/procedure-guides";
import { seoCombinations } from "@/data/seo-combinations";
import { getAllAreaSlugs } from "@/data/clinic-areas";
import { createClient } from "@supabase/supabase-js";

// 프로덕션 도메인
const BASE_URL = "https://kbeautybuyersguide.com";

// 사이트맵 대상 locale — ko는 noindex 설정이라 제외 (크롤 예산 낭비 방지)
const LOCALES = ["en", "zh", "ja", "ru", "vi", "th", "mn"] as const;

// locale prefix가 붙는 정적 페이지 경로
const LOCALE_PAGES = [
  { path: "", priority: 1.0, changeFrequency: "daily" as const },
  { path: "/recommend", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/community", priority: 0.8, changeFrequency: "daily" as const },
  { path: "/hospitals", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/guide", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/guides", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/blog", priority: 0.7, changeFrequency: "daily" as const },
  { path: "/safety", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/procedures", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/cosmetics", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/guidelines", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/events", priority: 0.6, changeFrequency: "weekly" as const },
  { path: "/live", priority: 0.6, changeFrequency: "daily" as const },
  { path: "/influencer", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/ai-search", priority: 0.5, changeFrequency: "weekly" as const },
  { path: "/search", priority: 0.5, changeFrequency: "weekly" as const },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/login", priority: 0.3, changeFrequency: "monthly" as const },
  { path: "/signup", priority: 0.3, changeFrequency: "monthly" as const },
  { path: "/bug-report", priority: 0.3, changeFrequency: "monthly" as const },
];

// 정책 페이지 — locale prefix 필요 (실제 라우트가 /[locale]/terms)
const POLICY_PAGES = [
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/disclaimer", priority: 0.3, changeFrequency: "yearly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 블로그 글 slug 조회
  let blogSlugs: string[] = [];
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data } = await supabase
      .from("blog_posts")
      .select("slug")
      .eq("is_published", true)
      .eq("site", "kbbg")
      .order("published_at", { ascending: false });
    blogSlugs = (data || []).map((p: { slug: string }) => p.slug);
  } catch {
    // Supabase 연결 실패 시 빈 배열로 진행
  }
  // locale별 페이지 URL 생성 (hreflang alternates 포함)
  const localeEntries = LOCALES.flatMap((locale) =>
    LOCALE_PAGES.map((page) => ({
      url: `${BASE_URL}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${BASE_URL}/${l}${page.path}`])
        ),
      },
    }))
  );

  // 정책 페이지도 locale별 생성
  const policyEntries = LOCALES.flatMap((locale) =>
    POLICY_PAGES.map((page) => ({
      url: `${BASE_URL}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }))
  );

  // 시술별 개별 페이지 (39개 × 8개 언어 = 312 URL)
  const procedureEntries = LOCALES.flatMap((locale) =>
    procedureGuides.map((guide) => ({
      url: `${BASE_URL}/${locale}/procedures/${guide.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${BASE_URL}/${l}/procedures/${guide.slug}`])
        ),
      },
    }))
  );

  // 시술×지역 조합 페이지 (190개 × 8개 언어 = 1,520 URL)
  const comboEntries = LOCALES.flatMap((locale) =>
    seoCombinations.map((combo) => ({
      url: `${BASE_URL}/${locale}/clinics/${combo.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${BASE_URL}/${l}/clinics/${combo.slug}`])
        ),
      },
    }))
  );

  // 블로그 글 페이지
  const blogEntries = LOCALES.flatMap((locale) =>
    blogSlugs.map((slug) => ({
      url: `${BASE_URL}/${locale}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${BASE_URL}/${l}/blog/${slug}`])
        ),
      },
    }))
  );

  // 지역별 클리닉 페이지 (189개 지역 × 8개 언어 = 1,512 URL)
  const areaEntries = LOCALES.flatMap((locale) =>
    getAllAreaSlugs().map((slug) => ({
      url: `${BASE_URL}/${locale}/clinics/area/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${BASE_URL}/${l}/clinics/area/${slug}`])
        ),
      },
    }))
  );

  return [...localeEntries, ...policyEntries, ...procedureEntries, ...comboEntries, ...areaEntries, ...blogEntries];
}
