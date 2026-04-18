// robots.ts — 검색엔진 크롤링 규칙 자동 생성
// /robots.txt 경로로 자동 서빙됨
import type { MetadataRoute } from "next";

const BASE_URL = "https://kbeautybuyersguide.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // 모든 크롤러에게 공개 페이지 허용
        userAgent: "*",
        allow: "/",
        // 관리자 및 API 경로는 크롤링 차단
        disallow: ["/admin/", "/api/", "/ko/"],
      },
    ],
    // 사이트맵 위치 명시
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
