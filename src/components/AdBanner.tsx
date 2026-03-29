"use client";

// 메인 광고 배너 — 모든 페이지에서 보이도록 레이아웃에 배치

export default function AdBanner() {
  return (
    <div className="w-full bg-white border-b border-gray-100 py-2 px-4">
      <div className="mx-auto max-w-6xl bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-white bg-slate-700 px-3 py-1 rounded shrink-0">AD</span>
          <p className="text-base sm:text-lg font-bold text-gray-900">
            광고주를 찾습니다
          </p>
        </div>
        <p className="text-sm sm:text-base text-gray-600 text-center">
          이 자리에 병원/브랜드 광고를 게재하세요 — 월 100만+ 외국인 환자에게 노출
        </p>
        <div className="flex items-center gap-3 text-sm text-gray-600 shrink-0">
          <span>010-8718-5000</span>
          <span className="hidden sm:inline text-gray-300">|</span>
          <span className="hidden sm:inline">help@2bstory.com</span>
          <a href="mailto:help@2bstory.com" className="px-4 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 transition">
            문의하기
          </a>
        </div>
      </div>
    </div>
  );
}
