"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

// 이벤트 데이터 — 매주 갱신 (강남/서초 피부과·성형외과)
const EVENTS = [
  // 피부과
  {
    id: 1,
    clinic: "청담 에스피부과의원",
    area: "강남",
    category: "피부과",
    title: "봄맞이 레이저 토닝 이벤트",
    items: [
      { name: "레이저 토닝 10회", price: "990,000", original: "1,500,000" },
      { name: "보톡스 100단위", price: "89,000", original: "150,000" },
    ],
    period: "2026.03.24 ~ 04.30",
    url: "https://example-clinic1.com",
    updatedAt: "2026-03-29",
  },
  {
    id: 2,
    clinic: "강남역 리안피부과의원",
    area: "강남",
    category: "피부과",
    title: "피부관리 시즌 패키지",
    items: [
      { name: "필러 1cc (쥬비덤)", price: "250,000", original: "400,000" },
      { name: "울쎄라 300샷", price: "690,000", original: "1,200,000" },
    ],
    period: "2026.04.01 ~ 04.30",
    url: "https://example-clinic2.com",
    updatedAt: "2026-03-29",
  },
  {
    id: 3,
    clinic: "서초 미소피부과의원",
    area: "서초",
    category: "피부과",
    title: "여드름 흉터 패키지 할인",
    items: [
      { name: "프랙셀 레이저 5회", price: "790,000", original: "1,250,000" },
      { name: "스킨보톡스 전체", price: "120,000", original: "200,000" },
    ],
    period: "2026.03.20 ~ 04.20",
    url: "https://example-clinic3.com",
    updatedAt: "2026-03-29",
  },
  {
    id: 4,
    clinic: "압구정 더마클리닉",
    area: "강남",
    category: "피부과",
    title: "신규 고객 첫 방문 특가",
    items: [
      { name: "피코토닝 1회", price: "49,000", original: "100,000" },
      { name: "수분 물광주사 1회", price: "59,000", original: "120,000" },
    ],
    period: "2026.04.01 ~ 04.15",
    url: "https://example-clinic4.com",
    updatedAt: "2026-03-29",
  },
  // 성형외과
  {
    id: 5,
    clinic: "강남 라인성형외과의원",
    area: "강남",
    category: "성형외과",
    title: "코성형 봄 이벤트",
    items: [
      { name: "코끝 성형", price: "1,900,000", original: "2,800,000" },
      { name: "매부리코 교정", price: "2,500,000", original: "3,500,000" },
    ],
    period: "2026.03.15 ~ 04.30",
    url: "https://example-clinic5.com",
    updatedAt: "2026-03-29",
  },
  {
    id: 6,
    clinic: "서초 드림성형외과의원",
    area: "서초",
    category: "성형외과",
    title: "쌍꺼풀 + 눈매교정 패키지",
    items: [
      { name: "쌍꺼풀 (매몰법)", price: "590,000", original: "900,000" },
      { name: "쌍꺼풀 + 눈매교정", price: "990,000", original: "1,500,000" },
    ],
    period: "2026.04.01 ~ 04.30",
    url: "https://example-clinic6.com",
    updatedAt: "2026-03-29",
  },
  {
    id: 7,
    clinic: "역삼 뷰티성형외과의원",
    area: "강남",
    category: "성형외과",
    title: "지방흡입 할인 이벤트",
    items: [
      { name: "복부 지방흡입", price: "1,500,000", original: "2,500,000" },
      { name: "팔뚝 지방흡입", price: "990,000", original: "1,800,000" },
    ],
    period: "2026.03.25 ~ 04.25",
    url: "https://example-clinic7.com",
    updatedAt: "2026-03-29",
  },
  {
    id: 8,
    clinic: "강남역 아름다운성형외과의원",
    area: "강남",
    category: "성형외과",
    title: "안면윤곽 상담 이벤트",
    items: [
      { name: "사각턱 축소", price: "3,500,000", original: "5,000,000" },
      { name: "광대 축소", price: "3,000,000", original: "4,500,000" },
    ],
    period: "2026.04.01 ~ 05.31",
    url: "https://example-clinic8.com",
    updatedAt: "2026-03-29",
  },
];

type FilterType = "all" | "피부과" | "성형외과";

export default function EventsPage() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const isKo = locale === "ko";
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = filter === "all" ? EVENTS : EVENTS.filter(e => e.category === filter);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-gray-900">
            {isKo ? "이벤트 · 시술 특가" : "Events & Special Offers"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isKo
              ? "강남·서초 피부과·성형외과 이벤트 단가 (매주 갱신)"
              : "Gangnam & Seocho dermatology & plastic surgery promotions (updated weekly)"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {isKo ? `최종 업데이트: ${EVENTS[0]?.updatedAt}` : `Last updated: ${EVENTS[0]?.updatedAt}`}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* 필터 */}
        <div className="flex gap-2 mb-6">
          {(["all", "피부과", "성형외과"] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-slate-800 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f === "all" ? (isKo ? "전체" : "All") : f}
            </button>
          ))}
        </div>

        {/* 이벤트 목록 */}
        <div className="space-y-4">
          {filtered.map(event => (
            <div key={event.id} className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-white bg-slate-700 px-2 py-0.5 rounded">
                      {event.category}
                    </span>
                    <span className="text-xs text-gray-400">{event.area}</span>
                  </div>
                  <h3 className="font-bold text-gray-900">{event.clinic}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">{event.title}</p>
                </div>
                {event.url && (
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-600 hover:underline shrink-0 ml-3"
                  >
                    {isKo ? "홈페이지 →" : "Website →"}
                  </a>
                )}
              </div>

              {/* 시술 가격 */}
              <div className="space-y-2">
                {event.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-t border-gray-50">
                    <span className="text-sm text-gray-700">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 line-through">{item.original}원</span>
                      <span className="text-sm font-bold text-red-600">{item.price}원</span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400 mt-3">{isKo ? "기간" : "Period"}: {event.period}</p>
            </div>
          ))}
        </div>

        {/* 안내 */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>{isKo
            ? "※ 본 정보는 각 병원 홈페이지 공지 기준이며, 실제 가격은 병원에 직접 문의해 주세요."
            : "※ Prices are based on clinic website listings. Please contact clinics directly for confirmation."}</p>
          <p className="mt-1">{isKo
            ? "광고 게재 문의: help@2bstory.com"
            : "For advertising inquiries: help@2bstory.com"}</p>
        </div>
      </div>
    </main>
  );
}
