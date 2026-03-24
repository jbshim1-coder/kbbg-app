import Link from "next/link";
import type { Metadata } from "next";

// 404 페이지 메타데이터 — 검색 엔진이 이 페이지를 인덱싱하지 않도록 noindex 설정
export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다 — KBBG",
};

// not-found.tsx — Next.js 앱 라우터의 글로벌 404 페이지
// notFound() 함수 호출 시 또는 존재하지 않는 URL 접근 시 렌더링됨
export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="max-w-md">
        {/* 404 시각적 표시 */}
        <p className="text-8xl font-black text-pink-100">404</p>

        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="mt-3 text-gray-500">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
          <br />
          URL을 다시 확인하거나 아래 링크를 이용해 주세요.
        </p>

        {/* 유용한 링크 목록 */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-xl bg-pink-500 px-6 py-3 font-semibold text-white hover:bg-pink-600"
          >
            홈으로 이동
          </Link>
          <Link
            href="/recommend"
            className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            AI 추천 받기
          </Link>
          <Link
            href="/community"
            className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            커뮤니티
          </Link>
        </div>

        {/* 추가 도움말 */}
        <p className="mt-8 text-sm text-gray-400">
          문제가 계속된다면{" "}
          <Link href="/contact" className="text-pink-500 hover:underline">
            문의하기
          </Link>
          를 이용해 주세요.
        </p>
      </div>
    </main>
  );
}
