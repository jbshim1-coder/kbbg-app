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
    title: "Community Forum",
    description:
      "Join the KBBG multilingual community forum. Share experiences, ask questions, and read reviews about Korean plastic surgery, dermatology, dental clinics, K-beauty, K-pop, and medical tourism.",
    alternates: { canonical: `${siteUrl}/${locale}/community` },
  };
}

export default async function CommunityLayout({
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
