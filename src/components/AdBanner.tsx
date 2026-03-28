"use client";

// 메인 광고 배너 — 모든 페이지에서 보이도록 레이아웃에 배치

export default function AdBanner() {
  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-white bg-rose-500 px-3 py-1 rounded">AD</span>
          <div>
            <p className="text-base sm:text-lg font-bold text-gray-900">
              광고주를 찾습니다
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              이 자리에 병원/브랜드 광고를 게재하세요
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>010-8718-5000</span>
          <span className="hidden sm:inline text-gray-300">|</span>
          <span>help@2bstory.com</span>
          <a href="mailto:help@2bstory.com" className="px-4 py-2 bg-rose-500 text-white text-sm font-semibold rounded-lg hover:bg-rose-600 transition">
            문의하기
          </a>
        </div>
      </div>
    </div>
  );
}
