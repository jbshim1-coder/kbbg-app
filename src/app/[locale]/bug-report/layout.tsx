import type { Metadata } from "next";

const BASE_URL = "https://kbeautybuyersguide.com";
const LOCALES = ["en", "ko", "zh", "ja", "ru", "vi", "th", "mn"];
const PATH = "/bug-report";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = "Bug Report — KBBG";
  const description = "Report a bug or issue with the KBBG platform";
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
