import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kbeautybuyersguide.com";

const COPY: Record<
  string,
  {
    title: string;
    description: string;
    eyebrow: string;
    heroTitle: string;
    heroSubtitle: string;
    cta: string;
  }
> = {
  en: {
    title: "K-Beauty Guide | KBBG",
    description: "K-culture inspired beauty guide: K-pop beauty secrets, K-food skin health, and Korea travel beauty experiences.",
    eyebrow: "For K-Culture Beauty Travelers",
    heroTitle: "K-Beauty Starts With Culture, Not Just Clinics",
    heroSubtitle: "Discover K-pop beauty routines, skin-friendly Korean food, and travel experiences that connect style with real care.",
    cta: "Explore Clinics Softly",
  },
  zh: {
    title: "韩流美妆指南 | KBBG",
    description: "面向广告流量的韩流美妆落地页：K-pop、韩食护肤、韩国旅行+美容体验。",
    eyebrow: "为韩流美丽旅行者准备",
    heroTitle: "韩系美丽从文化开始",
    heroSubtitle: "从K-pop妆容灵感、韩食护肤到韩国旅行美容体验，一站式了解。",
    cta: "查看适合的诊所",
  },
  ja: {
    title: "K-Beautyガイド | KBBG",
    description: "K-pop美容、韓国フードの美肌習慣、韓国旅行ビューティー体験をまとめたガイド。",
    eyebrow: "Kカルチャー美容トラベラー向け",
    heroTitle: "K-Beautyはカルチャーから始まる",
    heroSubtitle: "K-popの美容習慣、韓国フード、美容旅行体験を一つにまとめました。",
    cta: "クリニックを見てみる",
  },
  ru: {
    title: "Гид по K-Beauty | KBBG",
    description: "Лендинг для Meta-трафика: секреты K-pop, питание для кожи, путешествия по Корее и бьюти-опыт.",
    eyebrow: "Для путешественников в стиле K-culture",
    heroTitle: "K-Beauty начинается с культуры",
    heroSubtitle: "Секреты K-pop, корейская еда для кожи и бьюти-опыт в поездке по Корее.",
    cta: "Мягко перейти к клиникам",
  },
  vi: {
    title: "Cẩm Nang K-Beauty | KBBG",
    description: "Trang đích K-culture cho traffic Meta: bí quyết K-pop, dinh dưỡng da từ K-food, trải nghiệm du lịch + làm đẹp.",
    eyebrow: "Dành cho tín đồ làm đẹp K-culture",
    heroTitle: "K-Beauty bắt đầu từ văn hóa",
    heroSubtitle: "Từ bí quyết làm đẹp K-pop đến K-food tốt cho da và trải nghiệm làm đẹp tại Hàn Quốc.",
    cta: "Khám phá phòng khám",
  },
  th: {
    title: "คู่มือ K-Beauty | KBBG",
    description: "หน้า Landing สำหรับ Meta Ads: เคล็ดลับความงาม K-pop, อาหารเกาหลีเพื่อผิว, และท่องเที่ยวเกาหลีแบบบิวตี้",
    eyebrow: "สำหรับสายบิวตี้ K-culture",
    heroTitle: "K-Beauty เริ่มจากวัฒนธรรม",
    heroSubtitle: "รวมเคล็ดลับ K-pop, อาหารเกาหลีเพื่อสุขภาพผิว และประสบการณ์ท่องเที่ยว+ความงาม",
    cta: "ดูคลินิกแบบไม่กดดัน",
  },
  mn: {
    title: "K-Beauty Гайд | KBBG",
    description: "Meta зарын урсгалд зориулсан K-culture хуудас: K-pop, арьсанд тустай K-food, аялал + гоо сайхны туршлага.",
    eyebrow: "K-culture сонирхогчдод",
    heroTitle: "K-Beauty нь соёлоос эхэлдэг",
    heroSubtitle: "K-pop гоо сайхны зөвлөмж, арьсанд тустай хоол, Солонгос дахь гоо аяллыг нэг дор.",
    cta: "Эмнэлгүүдийг зөөлөн үзэх",
  },
  ko: {
    title: "K-뷰티 가이드 | KBBG",
    description: "메타 광고 유입을 위한 K-컬처 랜딩 페이지: K-pop 뷰티 시크릿, K-푸드 피부 건강, 한국 여행+뷰티 경험.",
    eyebrow: "K-컬처 뷰티 트래블러를 위한 가이드",
    heroTitle: "K-뷰티는 문화에서 시작됩니다",
    heroSubtitle: "K-pop 뷰티 루틴, 피부를 위한 K-푸드, 한국 여행 뷰티 경험을 한 번에 확인하세요.",
    cta: "부담 없이 병원 둘러보기",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = COPY[locale] ?? COPY.en;
  const canonical = `${siteUrl}/${locale}/k-beauty-guide`;

  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: canonical,
      type: "article",
      images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: copy.title }],
    },
  };
}

export default async function KBeautyGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const copy = COPY[locale] ?? COPY.en;

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-pink-50 to-amber-50 px-4 py-14 sm:py-20">
        <div className="mx-auto grid max-w-[1080px] gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">{copy.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">{copy.heroTitle}</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-700 sm:text-lg">{copy.heroSubtitle}</p>
            <Link
              href={`/${locale}/hospitals`}
              className="mt-8 inline-flex items-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              {copy.cta}
            </Link>
          </div>
          <div className="relative">
            <div className="absolute -left-6 -top-6 h-32 w-32 rounded-full bg-pink-200/50 blur-2xl" />
            <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-cyan-200/60 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/70 p-2 shadow-xl backdrop-blur">
              <Image
                src="/hero/beauty-model.jpg"
                alt="K-beauty traveler guide"
                width={900}
                height={640}
                priority
                className="h-auto w-full rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14">
        <div className="mx-auto grid max-w-[1080px] gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-pink-600">K-Pop Beauty Secrets</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Stage-to-Street Routine</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Learn how Korean idols layer hydration, sun care, and camera-ready makeup with minimal skin stress.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">K-Food Skin Health</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Eat for a Clear Glow</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Build a beauty-friendly food plan with fermented dishes, antioxidant side plates, and hydration habits.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">Korea Travel + Beauty</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Experience-Based Care</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Pair your itinerary with skin consults, recovery-friendly activities, and practical aftercare planning.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
