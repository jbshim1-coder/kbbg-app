"use client";

// 메인 광고 배너 — 모든 페이지에서 보이도록 레이아웃에 배치

export default function AdBanner() {
  return (
    <div className="w-full border-y-2 border-pink-200 bg-gradient-to-r from-pink-50 to-blue-50">
      <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <span className="text-xs font-semibold text-pink-500 bg-pink-100 px-2 py-0.5 rounded-full">AD</span>
        <p className="text-sm text-gray-600 text-center">
          🎯 <span className="font-medium text-gray-800">광고주를 찾습니다</span> — 이 자리에 병원/브랜드 광고를 게재하세요
        </p>
        <p className="text-xs text-gray-500">
          📞 010-8718-5000 | ✉ help@2bstory.com
        </p>
      </div>
    </div>
  );
}
