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
    title: "AI Clinic Recommendation",
    description:
      "Get personalized Korean clinic recommendations powered by AI. Answer a few questions about your desired procedure, budget, and preferences to find the best clinic in Seoul.",
    alternates: { canonical: `${siteUrl}/${locale}/recommend` },
  };
}

export default async function RecommendLayout({
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
