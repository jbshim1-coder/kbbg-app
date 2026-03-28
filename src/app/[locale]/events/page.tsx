import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isKo = locale === "ko";

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="px-4 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {isKo ? "이벤트" : "Events"}
          </h1>
          <p className="text-gray-500 mb-8">
            {isKo
              ? "다양한 이벤트와 프로모션이 곧 준비됩니다."
              : "Exciting events and promotions coming soon."}
          </p>
          <div className="bg-white rounded-xl border border-gray-200 p-10">
            <p className="text-lg text-gray-400">
              {isKo ? "준비 중입니다" : "Coming Soon"}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
