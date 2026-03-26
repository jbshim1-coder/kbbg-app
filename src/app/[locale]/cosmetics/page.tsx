"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";

// 한국 인기 화장품 더미 데이터 12개
const PRODUCTS = [
  { id: 1, brand: "이니스프리", name: "그린티 씨드 세럼", category: "skincare", price: "₩28,000~₩45,000", emoji: "🍵" },
  { id: 2, brand: "COSRX", name: "어드밴스드 스네일 96 뮤신 파워 에센스", category: "skincare", price: "₩22,000~₩35,000", emoji: "🐌" },
  { id: 3, brand: "라네즈", name: "워터 슬리핑 마스크", category: "skincare", price: "₩30,000~₩48,000", emoji: "💧" },
  { id: 4, brand: "설화수", name: "자음생 에센스", category: "skincare", price: "₩120,000~₩180,000", emoji: "🌸" },
  { id: 5, brand: "에뛰드", name: "플레이 컬러 아이즈 팔레트", category: "makeup", price: "₩18,000~₩25,000", emoji: "🎨" },
  { id: 6, brand: "클리오", name: "킬 커버 파운데이션", category: "makeup", price: "₩25,000~₩35,000", emoji: "✨" },
  { id: 7, brand: "미샤", name: "M 퍼펙트 커버 BB크림", category: "makeup", price: "₩12,000~₩18,000", emoji: "💄" },
  { id: 8, brand: "아모레퍼시픽", name: "컬러 컨트롤 쿠션 컴팩트", category: "makeup", price: "₩55,000~₩75,000", emoji: "🌺" },
  { id: 9, brand: "토니모리", name: "보타닉 팜 샴푸", category: "hair", price: "₩15,000~₩22,000", emoji: "🌿" },
  { id: 10, brand: "더페이스샵", name: "라이스 워터 브라이트 클렌징 오일", category: "body", price: "₩18,000~₩28,000", emoji: "🌾" },
  { id: 11, brand: "스킨푸드", name: "블랙 슈가 퍼펙팅 마스크 워시 오프", category: "skincare", price: "₩10,000~₩16,000", emoji: "🍯" },
  { id: 12, brand: "반클리프", name: "데일리 모이스처 선크림 SPF50+", category: "skincare", price: "₩20,000~₩30,000", emoji: "☀️" },
];

const CATEGORIES = ["all", "skincare", "makeup", "hair", "body"] as const;

export default function CosmeticsPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered = activeCategory === "all"
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === activeCategory);

  const categoryLabel = (cat: string) => {
    if (cat === "all") return t("cosmetics.all");
    return t(`cosmetics.cat_${cat}` as Parameters<typeof t>[0]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      {/* 헤더 */}
      <div className="bg-white border-b border-pink-100 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <Link href={`/${locale}`} className="text-xs text-gray-400 hover:text-pink-500 transition-colors mb-3 inline-block">
            ← {t("nav.home")}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t("cosmetics.title")}</h1>
          <p className="mt-2 text-gray-500">{t("cosmetics.subtitle")}</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* 카테고리 탭 */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={[
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                activeCategory === cat
                  ? "bg-pink-500 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-pink-300 hover:text-pink-500",
              ].join(" ")}
            >
              {categoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* 제품 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
            >
              {/* 이미지 플레이스홀더 */}
              <div className="aspect-square bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center">
                <span className="text-6xl group-hover:scale-110 transition-transform duration-200">
                  {product.emoji}
                </span>
              </div>
              {/* 제품 정보 */}
              <div className="p-4">
                <span className="inline-block text-xs font-medium text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full mb-2">
                  {categoryLabel(product.category)}
                </span>
                <p className="text-xs text-gray-400 font-medium">{product.brand}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 leading-tight">{product.name}</p>
                <p className="text-sm font-bold text-pink-600 mt-2">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
