"use client";

// 메인 광고 배너 — 모든 페이지에서 보이도록 레이아웃에 배치
// 관리자가 광고를 등록하면 실제 광고 표시, 없으면 "광고주 구함" 표시

export default function AdBanner() {
  return (
    <div className="w-full bg-gradient-to-r from-pink-50 to-blue-50 border-b border-gray-100">
      <div className="mx-auto max-w-6xl px-4 py-2.5 flex items-center justify-center gap-3">
        <span className="text-xs font-semibold text-pink-500 bg-pink-100 px-2 py-0.5 rounded-full">AD</span>
        <p className="text-sm text-gray-600">
          🎯 <span className="font-medium text-gray-800">광고주를 찾습니다</span> — 이 자리에 병원/브랜드 광고를 게재하세요
        </p>
        <a
          href="mailto:help@2bstory.com"
          className="text-xs text-pink-500 font-medium hover:underline shrink-0"
        >
          문의하기 →
        </a>
      </div>
    </div>
  );
}
