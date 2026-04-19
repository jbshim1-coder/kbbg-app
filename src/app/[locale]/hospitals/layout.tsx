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
    title: "Clinic Search",
    description:
      "Search and compare Korean medical clinics by specialty, location, and type. Find verified plastic surgery, dermatology, dental, and ophthalmology clinics in Seoul, Gangnam, and across South Korea.",
    alternates: { canonical: `${siteUrl}/${locale}/hospitals` },
  };
}

export default async function HospitalsLayout({
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
