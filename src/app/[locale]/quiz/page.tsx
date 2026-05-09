import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import KpopQuiz from "@/components/KpopQuiz";

export const metadata: Metadata = {
  title: "Which K-Pop Idol Are You? | KBBG Quiz 2026",
  description: "Take this personality quiz to find your K-pop idol match! BTS, BLACKPINK, IVE, aespa, NewJeans, ITZY, EXO and more. 10 questions, 20 idols. Share your result!",
  keywords: ["which kpop idol are you", "kpop quiz", "kpop personality quiz", "bts quiz", "blackpink quiz", "which idol am i 2026"],
  openGraph: {
    title: "Which K-Pop Idol Are You? | KBBG Quiz",
    description: "Find your K-pop idol match! 10 questions, 20 idols. Share your result!",
    type: "website",
    url: "https://kbeautybuyersguide.com/en/quiz",
  },
  twitter: {
    card: "summary_large_image",
    title: "Which K-Pop Idol Are You? | KBBG Quiz",
    description: "Find your K-pop idol match! 10 questions, 20 idols. Share your result!",
  },
};

export default async function QuizPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <KpopQuiz />;
}
