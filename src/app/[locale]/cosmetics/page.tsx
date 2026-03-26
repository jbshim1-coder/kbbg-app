"use client";

import { useParams } from "next/navigation";

// 올리브영 베스트 TOP 20 (매주 수동 업데이트 — 향후 자동화 예정)
// 최종 업데이트: 2026-03-27
const OLIVEYOUNG_TOP20 = [
  { rank: 1, brand: "라네즈", name: "워터뱅크 블루 히알루로닉 크림", nameEn: "Water Bank Blue Hyaluronic Cream", category: "스킨케어", price: "32,000원" },
  { rank: 2, brand: "코스알엑스", name: "어드밴스드 스네일 96 뮤신 파워 에센스", nameEn: "Advanced Snail 96 Mucin Power Essence", category: "스킨케어", price: "25,000원" },
  { rank: 3, brand: "이니스프리", name: "레티놀 시카 리페어 세럼", nameEn: "Retinol Cica Repair Serum", category: "스킨케어", price: "28,000원" },
  { rank: 4, brand: "설화수", name: "윤조에센스", nameEn: "First Care Activating Serum", category: "스킨케어", price: "93,000원" },
  { rank: 5, brand: "클리오", name: "킬커버 파운웨어 쿠션 XP", nameEn: "Kill Cover Founwear Cushion XP", category: "메이크업", price: "28,000원" },
  { rank: 6, brand: "미샤", name: "타임 레볼루션 더 퍼스트 에센스", nameEn: "Time Revolution The First Essence", category: "스킨케어", price: "32,000원" },
  { rank: 7, brand: "에뛰드", name: "플레이 컬러 아이즈 팔레트", nameEn: "Play Color Eyes Palette", category: "메이크업", price: "24,000원" },
  { rank: 8, brand: "토니모리", name: "원더 세라마이드 모찌 토너", nameEn: "Wonder Ceramide Mochi Toner", category: "스킨케어", price: "18,000원" },
  { rank: 9, brand: "롬앤", name: "쥬시 래스팅 틴트", nameEn: "Juicy Lasting Tint", category: "메이크업", price: "14,000원" },
  { rank: 10, brand: "아누아", name: "어성초 77% 수딩 토너", nameEn: "Heartleaf 77% Soothing Toner", category: "스킨케어", price: "19,500원" },
  { rank: 11, brand: "스킨푸드", name: "로열허니 프로폴리스 인리치드 에센스", nameEn: "Royal Honey Propolis Enrich Essence", category: "스킨케어", price: "26,000원" },
  { rank: 12, brand: "비오템", name: "라이프 플랑크톤 엘릭서", nameEn: "Life Plankton Elixir", category: "스킨케어", price: "89,000원" },
  { rank: 13, brand: "달바", name: "워터풀 에센스 선크림", nameEn: "Waterfull Essence Sun Cream", category: "스킨케어", price: "27,000원" },
  { rank: 14, brand: "마녀공장", name: "퓨어 클렌징 오일", nameEn: "Pure Cleansing Oil", category: "스킨케어", price: "19,000원" },
  { rank: 15, brand: "헤라", name: "블랙 쿠션", nameEn: "Black Cushion", category: "메이크업", price: "55,000원" },
  { rank: 16, brand: "닥터지", name: "레드 블레미쉬 클리어 수딩 크림", nameEn: "Red Blemish Clear Soothing Cream", category: "스킨케어", price: "25,000원" },
  { rank: 17, brand: "VT", name: "리들샷 100 에센스", nameEn: "Reedle Shot 100 Essence", category: "스킨케어", price: "36,000원" },
  { rank: 18, brand: "더페이스샵", name: "라이스워터 브라이트 클렌징 폼", nameEn: "Rice Water Bright Cleansing Foam", category: "스킨케어", price: "9,000원" },
  { rank: 19, brand: "바닐라코", name: "클린 잇 제로 클렌징 밤", nameEn: "Clean It Zero Cleansing Balm", category: "스킨케어", price: "21,000원" },
  { rank: 20, brand: "네이처리퍼블릭", name: "수딩 앤 모이스처 알로에베라 92% 젤", nameEn: "Soothing & Moisture Aloe Vera 92% Gel", category: "스킨케어", price: "7,900원" },
];

export default function CosmeticsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "ko";
  const isKo = locale === "ko";

  return (
    <main className="min-h-screen bg-white">
      {/* 히어로 */}
      <section className="bg-gradient-to-br from-pink-50 to-orange-50 px-4 py-12 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-pink-500">
            {isKo ? "올리브영 베스트" : "Oliveyoung Best"}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {isKo ? "이번 주 올리브영 TOP 20" : "This Week's Oliveyoung TOP 20"}
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            {isKo ? "한국에서 가장 인기 있는 화장품 랭킹" : "Most popular cosmetics ranking in Korea"}
          </p>
        </div>
      </section>

      {/* 랭킹 목록 */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-3">
          {OLIVEYOUNG_TOP20.map((item) => (
            <div key={item.rank}
              className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition">
              {/* 순위 */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                item.rank <= 3 ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-600"
              }`}>
                {item.rank}
              </div>
              {/* 제품 정보 */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">
                  {isKo ? item.name : item.nameEn}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.brand} · {item.category}
                </p>
              </div>
              {/* 가격 */}
              <div className="text-sm font-semibold text-pink-500 shrink-0">
                {item.price}
              </div>
            </div>
          ))}

          <p className="mt-8 text-center text-xs text-gray-400">
            {isKo ? "출처: 올리브영 베스트 랭킹 | 매주 업데이트" : "Source: Oliveyoung Best Ranking | Updated weekly"}
          </p>
        </div>
      </section>
    </main>
  );
}
