import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

// 404 페이지 메타데이터 — 검색 엔진이 이 페이지를 인덱싱하지 않도록 noindex 설정
export const metadata: Metadata = {
  title: "Page Not Found — KBBG",
};

// not-found.tsx — Next.js 앱 라우터의 글로벌 404 페이지
// notFound() 함수 호출 시 또는 존재하지 않는 URL 접근 시 렌더링됨
export default async function NotFoundPage() {
  // 글로벌 not-found는 locale 컨텍스트가 없을 수 있으므로 try/catch로 폴백
  let t: Awaited<ReturnType<typeof getTranslations<"not_found">>> | null = null;
  try {
    t = await getTranslations("not_found");
  } catch {
    // locale 컨텍스트 없는 환경에서는 하드코딩 텍스트 사용
  }

  const title = t ? t("title") : "Page Not Found";
  const description = t ? t("description") : "The page you are looking for does not exist or has been moved. Please check the URL or use the links below.";
  const homeLabel = t ? t("home") : "Go to Home";
  const recommendLabel = t ? t("recommend") : "Get AI Recommendation";
  const communityLabel = t ? t("community") : "Community";
  const contactHint = t ? t("contact_hint") : "If the problem persists, please";
  const contactLink = t ? t("contact_link") : "contact us";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="max-w-md">
        {/* 404 시각적 표시 */}
        <p className="text-8xl font-black text-pink-100">404</p>

        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          {title}
        </h1>
        <p className="mt-3 text-gray-500">
          {description}
        </p>

        {/* 유용한 링크 목록 */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/en"
            className="rounded-xl bg-pink-500 px-6 py-3 font-semibold text-white hover:bg-pink-600"
          >
            {homeLabel}
          </Link>
          <Link
            href="/en/recommend"
            className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            {recommendLabel}
          </Link>
          <Link
            href="/en/community"
            className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            {communityLabel}
          </Link>
        </div>

        {/* 추가 도움말 */}
        <p className="mt-8 text-sm text-gray-400">
          {contactHint}{" "}
          <Link href="/en/contact" className="text-pink-500 hover:underline">
            {contactLink}
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
