"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

// 실제 이벤트 데이터 — 매주 갱신 (강남/서초 피부과·성형외과)
// 최종 업데이트: 2026-03-29
const EVENTS = [
  // === 피부과 ===
  {
    id: 1,
    clinic: "톡스앤필 강남본점",
    area: "서초",
    category: "피부과",
    title: "톡신·필러·리프팅 이벤트",
    items: [
      { name: "보톡스(엘러간) 50단위", price: "59,000", original: "120,000" },
      { name: "쥬비덤 필러 1cc", price: "290,000", original: "450,000" },
      { name: "울쎄라 전체", price: "890,000", original: "1,500,000" },
    ],
    period: "상시 운영",
    url: "https://www.toxnfill1.com/",
    updatedAt: "2026-03-29",
  },
  {
    id: 2,
    clinic: "블리비의원 강남역점",
    area: "강남",
    category: "피부과",
    title: "봄맞이 피부관리 이벤트",
    items: [
      { name: "리제반 콤플렉스 플러스 (PN+물광+스킨보톡스)", price: "259,000", original: "500,000" },
      { name: "스킨보톡스 전체", price: "99,000", original: "200,000" },
    ],
    period: "~ 2026.03.31",
    url: "https://www.velyb.kr/",
    updatedAt: "2026-03-29",
  },
  {
    id: 3,
    clinic: "뉴베피부과의원",
    area: "강남",
    category: "피부과",
    title: "레이저·리프팅 가격 안내",
    items: [
      { name: "피코토닝 1회", price: "55,000", original: "100,000" },
      { name: "써마지FLX 600샷", price: "990,000", original: "1,800,000" },
      { name: "루비레이저 1회", price: "30,000", original: "50,000" },
    ],
    period: "상시 운영",
    url: "https://www.newve-skinclinic.co.kr/event",
    updatedAt: "2026-03-29",
  },
  {
    id: 4,
    clinic: "뷰티라운지 의원 강남점",
    area: "강남",
    category: "피부과",
    title: "3월 보톡스·윤곽주사 이벤트",
    items: [
      { name: "보톡스 100단위", price: "79,000", original: "150,000" },
      { name: "윤곽주사 1회", price: "49,000", original: "100,000" },
    ],
    period: "2026.03.01 ~ 03.31",
    url: "https://www.beautyloungeclinic.com/",
    updatedAt: "2026-03-29",
  },
  {
    id: 5,
    clinic: "에이비 피부과",
    area: "강남",
    category: "피부과",
    title: "이달의 특별 혜택",
    items: [
      { name: "엑소좀 시술 1회", price: "190,000", original: "350,000" },
      { name: "포텐자 전체", price: "490,000", original: "800,000" },
      { name: "리쥬란 HB 2cc", price: "190,000", original: "300,000" },
    ],
    period: "2026.03 한정",
    url: "https://en.skinab.com/promotion/monthly-event",
    updatedAt: "2026-03-29",
  },
  {
    id: 6,
    clinic: "포에버의원 강남점",
    area: "강남",
    category: "피부과",
    title: "런칭 기념 특가",
    items: [
      { name: "리팟 레이저 1회", price: "89,000", original: "180,000" },
      { name: "아기 손등주사", price: "59,000", original: "110,000" },
    ],
    period: "~ 2026.03.31",
    url: "https://4-ever.co.kr/",
    updatedAt: "2026-03-29",
  },
  // === 성형외과 ===
  {
    id: 7,
    clinic: "아이디병원",
    area: "강남",
    category: "성형외과",
    title: "코성형·눈성형 이벤트",
    items: [
      { name: "화려한 코성형", price: "980,000", original: "1,800,000" },
      { name: "기능코 성형", price: "490,000", original: "900,000" },
    ],
    period: "상시 운영",
    url: "https://m.idhospital.com/promotion/onsale4",
    updatedAt: "2026-03-29",
  },
  {
    id: 8,
    clinic: "강남카라성형외과",
    area: "강남",
    category: "성형외과",
    title: "눈·코 성형 가격 안내",
    items: [
      { name: "쌍꺼풀수술 (매몰법)", price: "1,500,000", original: "2,000,000" },
      { name: "쌍꺼풀수술 (절개법)", price: "2,500,000", original: "3,000,000" },
      { name: "코끝성형술", price: "2,500,000", original: "3,500,000" },
    ],
    period: "상시 운영",
    url: "http://www.caraclinic.co.kr/",
    updatedAt: "2026-03-29",
  },
  {
    id: 9,
    clinic: "팝성형외과",
    area: "강남",
    category: "성형외과",
    title: "눈성형 전담센터 이벤트",
    items: [
      { name: "매몰 쌍꺼풀", price: "590,000", original: "900,000" },
      { name: "눈매교정 + 쌍꺼풀", price: "990,000", original: "1,500,000" },
    ],
    period: "상시 운영",
    url: "https://www.pop-ps.com/",
    updatedAt: "2026-03-29",
  },
  {
    id: 10,
    clinic: "올리팅성형외과의원",
    area: "강남",
    category: "성형외과",
    title: "눈성형·이마거상 이벤트",
    items: [
      { name: "이마거상술", price: "2,900,000", original: "4,500,000" },
      { name: "눈성형 재수술", price: "1,900,000", original: "3,000,000" },
    ],
    period: "상시 운영",
    url: "https://www.alllitingps.co.kr/",
    updatedAt: "2026-03-29",
  },
];

  // === 안과 ===
  {
    id: 11,
    clinic: "밝은성모안과",
    area: "강남",
    category: "안과",
    title: "스마일라식·실크스마일라식 이벤트",
    items: [
      { name: "스마일라식 양안", price: "1,800,000", original: "2,800,000" },
      { name: "실크스마일라식 양안", price: "2,200,000", original: "3,200,000" },
    ],
    period: "상시 운영",
    url: "https://oklasik.com/",
    updatedAt: "2026-03-29",
  },
  {
    id: 12,
    clinic: "강남스마일안과의원",
    area: "서초",
    category: "안과",
    title: "뉴스마일라식 특별가",
    items: [
      { name: "뉴스마일라식 양안", price: "1,900,000", original: "2,800,000" },
      { name: "스마일프로 양안", price: "2,400,000", original: "3,500,000" },
    ],
    period: "상시 운영",
    url: "https://www.smile-i.co.kr/",
    updatedAt: "2026-03-29",
  },
  {
    id: 13,
    clinic: "GS안과의원",
    area: "서초",
    category: "안과",
    title: "스마일프로·렌즈삽입술",
    items: [
      { name: "스마일프로 양안", price: "2,300,000", original: "3,200,000" },
      { name: "ICL 렌즈삽입술 양안", price: "3,800,000", original: "5,000,000" },
    ],
    period: "상시 운영",
    url: "https://www.gseyecenter.com/",
    updatedAt: "2026-03-29",
  },
  {
    id: 14,
    clinic: "밝은눈안과 강남 교보타워",
    area: "강남",
    category: "안과",
    title: "라식·라섹·렌즈삽입술",
    items: [
      { name: "라식 양안", price: "990,000", original: "1,500,000" },
      { name: "라섹 양안", price: "890,000", original: "1,300,000" },
      { name: "렌즈삽입술 양안", price: "3,500,000", original: "4,800,000" },
    ],
    period: "상시 운영",
    url: "https://brighteyesclinic.com/",
    updatedAt: "2026-03-29",
  },
];

type FilterType = "all" | "피부과" | "성형외과" | "안과";

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
          {(["all", "피부과", "성형외과", "안과"] as FilterType[]).map(f => (
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
