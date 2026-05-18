import type { Metadata } from "next";

const BASE_URL = "https://kbeautybuyersguide.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}): Promise<Metadata> {
  const { locale, token } = await params;
  return {
    title: "Korea Medical Trip Itinerary — KBBG",
    description:
      "View this personalized 4-day Korea medical tourism itinerary created with KBBG Trip Planner.",
    alternates: {
      canonical: `${BASE_URL}/${locale}/planner/${token}`,
    },
    openGraph: {
      title: "Korea Medical Trip Itinerary — KBBG",
      description: "A personalized 4-day Korea medical tourism itinerary.",
      url: `${BASE_URL}/${locale}/planner/${token}`,
      siteName: "KBBG",
      type: "website",
    },
    robots: { index: false, follow: false },
  };
}

export default function SharedPlanLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
