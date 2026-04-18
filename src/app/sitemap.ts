// 자동 사이트맵 생성 — Next.js MetadataRoute.Sitemap 활용
// 정적 페이지 + locale별 동적 URL을 포함
import type { MetadataRoute } from "next";

// 프로덕션 도메인
const BASE_URL = "https://kbeautybuyersguide.com";

// 지원 locale 목록 (routing.ts와 동기화)
const LOCALES = ["en", "zh", "ja", "ru", "vi", "th", "mn"] as const;

// locale prefix가 붙는 정적 페이지 경로
const LOCALE_PAGES = [
  { path: "", priority: 1.0, changeFrequency: "daily" as const },
  { path: "/recommend", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/community", priority: 0.8, changeFrequency: "daily" as const },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" as const },
];

// locale prefix 없이 제공되는 공통 정책 페이지
const COMMON_PAGES = [
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/disclaimer", priority: 0.3, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  // locale별 페이지 URL 생성
  const localeEntries = LOCALES.flatMap((locale) =>
    LOCALE_PAGES.map((page) => ({
      url: `${BASE_URL}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }))
  );

  // 공통 정책 페이지 URL 생성
  const commonEntries = COMMON_PAGES.map((page) => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  return [...localeEntries, ...commonEntries];
}
