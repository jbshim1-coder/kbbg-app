// manifest.ts — PWA 매니페스트 자동 생성
// /manifest.webmanifest 경로로 자동 서빙됨
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    // 앱 기본 정보
    name: "KBBG - Korean Beauty Buyers Guide",
    short_name: "KBBG",
    description: "AI 기반 한국 뷰티 클리닉 추천 서비스. 7개국 언어 지원.",

    // PWA 시작 URL 및 표시 모드
    start_url: "/en",
    display: "standalone",
    orientation: "portrait",

    // 브랜드 컬러 (Tailwind pink-500: #ec4899)
    background_color: "#ffffff",
    theme_color: "#ec4899",

    // 앱 아이콘 — public/icons/ 폴더에 위치
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],

    // 앱 카테고리
    categories: ["health", "lifestyle", "medical"],

    // 언어 지원 명시
    lang: "en",
    dir: "ltr",
  };
}
