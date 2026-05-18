import type { Metadata } from "next";

const BASE_URL = "https://kbeautybuyersguide.com";
const LOCALES = ["en", "ko", "zh", "ja", "th", "vi", "ru", "mn"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Korea Medical Trip Planner — KBBG",
    description:
      "Plan your personalized 4-day Korea medical tourism itinerary. AI-powered clinic recommendations, hotels, dining, and activities tailored to your procedure.",
    alternates: {
      canonical: `${BASE_URL}/${locale}/planner`,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `${BASE_URL}/${l}/planner`])),
    },
    openGraph: {
      title: "Korea Medical Trip Planner — KBBG",
      description: "Plan your personalized 4-day Korea medical tourism trip with AI.",
      url: `${BASE_URL}/${locale}/planner`,
      siteName: "KBBG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Korea Medical Trip Planner — KBBG",
      description: "Plan your personalized 4-day Korea medical tourism trip with AI.",
    },
  };
}

export default function PlannerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
