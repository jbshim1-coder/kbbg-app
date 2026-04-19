import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kbeautybuyersguide.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "K-Beauty Cosmetics Rankings",
    description:
      "Weekly top 20 Korean cosmetics rankings from Olive Young, Glowpick, Hwahae, and Naver Shopping. Discover trending K-beauty skincare, makeup, suncare, and cleansing products.",
    alternates: { canonical: `${siteUrl}/${locale}/cosmetics` },
  };
}

export default async function CosmeticsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <>{children}</>;
}
