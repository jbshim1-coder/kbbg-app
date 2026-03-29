// locale별 레이아웃 - next-intl Provider 및 html lang 속성 설정
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdBanner from "@/components/AdBanner";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CookieConsent from "@/components/CookieConsent";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 사이트 기본 URL - 환경 변수 없을 경우 프로덕션 URL 사용
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kbbg-app.vercel.app";

export const metadata: Metadata = {
  // 기본 타이틀 및 템플릿 - 페이지별 타이틀 뒤에 사이트명 자동 추가
  title: {
    default: "K-Beauty Buyers Guide",
    template: "%s | K-Beauty Buyers Guide",
  },
  description: "Find Your Perfect Korean Beauty Clinic — trusted reviews and recommendations for K-Beauty treatments.",
  // 메타 키워드
  keywords: ["Korean beauty", "K-Beauty", "Korean clinic", "beauty guide", "피부과", "성형외과", "미용 클리닉"],
  // Open Graph 설정 - 소셜 미디어 공유 시 표시되는 정보
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "K-Beauty Buyers Guide",
    title: "K-Beauty Buyers Guide",
    description: "Find Your Perfect Korean Beauty Clinic — trusted reviews and recommendations for K-Beauty treatments.",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "K-Beauty Buyers Guide",
      },
    ],
  },
  // Twitter 카드 설정
  twitter: {
    card: "summary_large_image",
    title: "K-Beauty Buyers Guide",
    description: "Find Your Perfect Korean Beauty Clinic",
    images: [`${siteUrl}/og-image.png`],
  },
  // 검색 엔진 크롤링 설정
  robots: {
    index: true,
    follow: true,
  },
  // 정규 URL 설정
  alternates: {
    canonical: siteUrl,
  },
  // 파비콘/아이콘
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  // 매니페스트
  manifest: "/manifest.json",
  // Google Search Console 인증
  verification: {
    google: "VERIFICATION_CODE_HERE",
  },
};

// 정적 생성 시 지원 locale 목록 제공
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // 유효하지 않은 locale은 404 처리
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // 정적 렌더링 활성화를 위한 locale 캐시 설정
  setRequestLocale(locale);

  // 서버에서 메시지 로드 후 클라이언트에 전달
  const messages = await getMessages();

  // Organization 구조화 데이터 - 검색 엔진이 사이트를 조직으로 인식하도록 지원
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "K-Beauty Buyers Guide",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    contactPoint: {
      "@type": "ContactPoint",
      email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "help@2bstory.com",
      contactType: "customer support",
    },
    sameAs: [],
  };

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* JSON-LD 구조화 데이터 - 검색 엔진 최적화(SEO)용 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <NextIntlClientProvider messages={messages}>
          <div className="max-w-[1280px] mx-auto border-x border-gray-200 bg-white min-h-screen">
            <Header />
            <AdBanner />
            <main className="flex-1">{children}</main>
            <CookieConsent locale={locale} />
            <Footer locale={locale} />
          </div>
        </NextIntlClientProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
