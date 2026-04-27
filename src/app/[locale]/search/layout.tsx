import type { Metadata } from "next";

const BASE_URL = "https://kbeautybuyersguide.com";
const LOCALES = ["en", "ko", "zh", "ja", "ru", "vi", "th", "mn"];
const PATH = "/search";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = "Search — KBBG";
  const description = "Search Korean clinics, procedures, and guides";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}${PATH}`,
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}${PATH}`,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `${BASE_URL}/${l}${PATH}`])),
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
