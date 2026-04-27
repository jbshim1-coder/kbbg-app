// locale별 레이아웃 - next-intl Provider 및 html lang 속성 설정
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import AdBanner from "@/components/AdBanner";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CookieConsent from "@/components/CookieConsent";
import WhatsAppButton from "@/components/WhatsAppButton";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic", "vietnamese"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kbeautybuyersguide.com";

// 언어별 메타데이터
const META: Record<string, { title: string; description: string; ogDesc: string; twitterDesc: string }> = {
  en: {
    title: "KBBG - Korea Beauty Buyers Guide",
    description: "Compare Korean plastic surgery, dermatology & dental clinics. Get AI-powered recommendations and verified reviews for medical tourism in Seoul Gangnam.",
    ogDesc: "Compare Korean beauty clinics with AI-powered recommendations. Trusted reviews for plastic surgery, dermatology, dental, and LASIK.",
    twitterDesc: "Find your perfect Korean beauty clinic — AI recommendations for plastic surgery, dermatology, and more.",
  },
  ko: {
    title: "KBBG - 한국 뷰티 의료관광 가이드",
    description: "한국 성형외과, 피부과, 치과 정보를 비교하고 AI 추천을 받으세요. 검증된 병원 정보와 실제 후기를 제공합니다.",
    ogDesc: "한국 성형외과, 피부과, 치과 병원을 AI로 비교 추천. 검증된 후기와 비용 가이드.",
    twitterDesc: "한국 뷰티 의료관광 가이드 — AI 추천으로 나에게 맞는 병원을 찾으세요.",
  },
  zh: {
    title: "KBBG - 韩国美容医疗指南",
    description: "比较韩国整形外科、皮肤科和牙科诊所。获取AI智能推荐和经过验证的评价，了解首尔江南医疗旅游信息。",
    ogDesc: "AI智能推荐韩国美容诊所。整形、皮肤科、牙科的可信评价与费用指南。",
    twitterDesc: "韩国美容医疗指南 — 用AI找到最适合您的诊所。",
  },
  ja: {
    title: "KBBG - 韓国ビューティー医療ガイド",
    description: "韓国の整形外科、皮膚科、歯科クリニックを比較。AIによるおすすめと信頼できるレビューで、ソウル江南の医療観光情報をご案内します。",
    ogDesc: "AIで韓国ビューティークリニックを比較推薦。整形、皮膚科、歯科の信頼できるレビューと費用ガイド。",
    twitterDesc: "韓国ビューティー医療ガイド — AIであなたにぴったりのクリニックを。",
  },
  vi: {
    title: "KBBG - Hướng Dẫn Làm Đẹp Hàn Quốc",
    description: "So sánh các phòng khám phẫu thuật thẩm mỹ, da liễu và nha khoa Hàn Quốc. Nhận đề xuất AI và đánh giá đã xác minh cho du lịch y tế tại Seoul Gangnam.",
    ogDesc: "So sánh phòng khám làm đẹp Hàn Quốc với AI. Đánh giá đáng tin cậy về phẫu thuật thẩm mỹ, da liễu, nha khoa.",
    twitterDesc: "Hướng dẫn làm đẹp y tế Hàn Quốc — Tìm phòng khám phù hợp nhất với bạn.",
  },
  th: {
    title: "KBBG - คู่มือความงามเกาหลี",
    description: "เปรียบเทียบคลินิกศัลยกรรม ผิวหนัง และทันตกรรมเกาหลี รับคำแนะนำจาก AI และรีวิวที่ผ่านการตรวจสอบสำหรับการท่องเที่ยวเชิงการแพทย์ในโซล กังนัม",
    ogDesc: "เปรียบเทียบคลินิกความงามเกาหลีด้วย AI รีวิวที่เชื่อถือได้สำหรับศัลยกรรม ผิวหนัง ทันตกรรม",
    twitterDesc: "คู่มือความงามเชิงการแพทย์เกาหลี — ค้นหาคลินิกที่เหมาะกับคุณด้วย AI",
  },
  ru: {
    title: "KBBG - Гид по Красоте Кореи",
    description: "Сравнивайте клиники пластической хирургии, дерматологии и стоматологии Кореи. Получите AI-рекомендации и проверенные отзывы о медицинском туризме в Сеуле Каннам.",
    ogDesc: "Сравнивайте корейские клиники красоты с AI. Проверенные отзывы о пластической хирургии, дерматологии, стоматологии.",
    twitterDesc: "Гид по медицинской красоте Кореи — найдите идеальную клинику с помощью AI.",
  },
  mn: {
    title: "KBBG - Солонгосын Гоо Сайхны Гарын Авлага",
    description: "Солонгосын мэс заслын, арьс судлалын болон шүдний эмнэлгүүдийг харьцуулна уу. AI зөвлөмж болон баталгаажсан сэтгэгдлүүдийг аваарай.",
    ogDesc: "AI-аар Солонгосын гоо сайхны эмнэлгүүдийг харьцуулна. Мэс засал, арьс судлал, шүдний найдвартай сэтгэгдэл.",
    twitterDesc: "Солонгосын гоо сайхны эмнэлгийн гарын авлага — AI-аар таны эмнэлгийг олно.",
  },
};

// locale별 동적 메타데이터 생성
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const meta = META[locale] || META.en;
  const isKo = locale === "ko";

  return {
    title: { default: meta.title, template: `%s | ${meta.title}` },
    description: meta.description,
    keywords: [
      "Korean beauty clinic", "K-Beauty", "Korea plastic surgery", "Korea dermatology",
      "Gangnam clinic", "medical tourism Korea", "Korean cosmetic surgery",
      "Korea LASIK", "Korea dental", "beauty guide", "AI clinic recommendation",
    ],
    openGraph: {
      type: "website",
      url: `${siteUrl}/${locale}`,
      siteName: "KBBG",
      title: meta.title,
      description: meta.ogDesc,
      locale: locale,
      images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: meta.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.twitterDesc,
      images: [`${siteUrl}/og-image.png`],
    },
    robots: isKo ? { index: false, follow: false } : { index: true, follow: true },
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${siteUrl}/${l}`])
      ),
    },
    icons: {
      icon: "/favicon.png",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.json",
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
      : {}),
  };
}

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

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "KBBG - Korean Beauty Buyers Guide",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: "AI-powered Korean beauty and medical tourism guide supporting 8 languages. Find the best plastic surgery, dermatology, dental clinics in Seoul, Gangnam.",
    contactPoint: {
      "@type": "ContactPoint",
      email: "jbshim1@gmail.com",
      contactType: "customer support",
      availableLanguage: ["English", "Korean", "Japanese", "Chinese", "Vietnamese", "Thai", "Russian", "Mongolian"],
    },
    sameAs: [],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "KBBG - Korean Beauty Buyers Guide",
    url: siteUrl,
    description: "AI-powered Korean beauty clinic recommendation and medical tourism guide.",
    inLanguage: ["en", "ko", "ja", "zh", "vi", "th", "ru", "mn"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/${locale}/hospitals?keyword={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang={locale}
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <NextIntlClientProvider messages={messages}>
          <div className="mx-auto bg-[var(--background)] min-h-screen">
            <Header />
            <AdBanner />
            <main className="flex-1">{children}</main>
            <CookieConsent locale={locale} />
            <MedicalDisclaimer locale={locale} />
            <Footer locale={locale} />
          </div>
          <WhatsAppButton />
          <StickyMobileCTA />
        </NextIntlClientProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
