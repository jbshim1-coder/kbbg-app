// next-intl 플러그인 적용 - i18n 요청 설정 파일 경로 지정
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// next-intl 플러그인 초기화 - request.ts 경로를 명시적으로 지정
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // 환경 변수 공개 설정 - NEXT_PUBLIC_ 접두사 없이 클라이언트에 노출할 값
  env: {
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME ?? "K-Beauty Buyers Guide",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kbeautybuyersguide.com",
    NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "help@2bstory.com",
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
    ],
  },
};

export default withNextIntl(nextConfig);
