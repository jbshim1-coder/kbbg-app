// next-intl 플러그인 적용 - i18n 요청 설정 파일 경로 지정
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// next-intl 플러그인 초기화 - request.ts 경로를 명시적으로 지정
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co https://shopping-phinf.pstatic.net https://i.ytimg.com https://lh3.googleusercontent.com; connect-src 'self' https://*.supabase.co https://api.openai.com https://api.anthropic.com https://www.google.com https://openapi.naver.com; frame-src https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com; font-src 'self' data:;" },
      ],
    }];
  },
  // 환경 변수 공개 설정 - NEXT_PUBLIC_ 접두사 없이 클라이언트에 노출할 값
  env: {
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME ?? "K-Beauty Buyers Guide",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kbeautybuyersguide.com",
    NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "help@kbeautybuyersguide.com",
  },
  // 외부 이미지 도메인 허용 설정
  images: {
    remotePatterns: [
      {
        // Supabase Storage 이미지 허용
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // 네이버 쇼핑 제품 이미지 허용
        protocol: "https",
        hostname: "shopping-phinf.pstatic.net",
      },
      {
        // YouTube 썸네일 이미지 허용
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
