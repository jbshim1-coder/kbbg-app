"use client";

// FAQ 페이지 — 클라이언트 컴포넌트 (카테고리 필터 + 아코디언 상태 관리)
// seed-faqs.ts 데이터를 사용하여 실제 FAQ 표시

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { seedFaqs, type FaqCategory } from "@/data/seed-faqs";

// 카테고리 키 목록
const ALL_CATEGORIES = ["all", "general", "visa", "cost", "procedure", "recovery", "language"] as const;
type CategoryKey = (typeof ALL_CATEGORIES)[number];

// 카테고리 → 번역 키 매핑
const CATEGORY_TRANSLATION_KEYS: Record<CategoryKey, string> = {
  all: "faq.cat_all",
  general: "faq.cat_general",
  visa: "faq.cat_visa",
  cost: "faq.cat_cost",
  procedure: "faq.cat_procedure",
  recovery: "faq.cat_recovery",
  language: "faq.cat_language",
};

// 한국어 FAQ 데이터
const koFaqs = [
  { id:"ko-1", category:"cost" as FaqCategory, question:"한국에서 성형수술 비용은 얼마인가요?", answer:"시술에 따라 다릅니다. 쌍꺼풀 수술은 50~150만원, 코성형은 200~500만원, 안면윤곽은 500~1000만원 정도입니다. 미국이나 유럽 대비 30~50% 저렴합니다.", tags:["비용","가격"] },
  { id:"ko-2", category:"general" as FaqCategory, question:"외국인도 한국 병원에서 치료받을 수 있나요?", answer:"네, 외국인도 자유롭게 한국 병원을 이용할 수 있습니다. 많은 병원이 영어, 중국어, 일본어 등 외국어 상담을 제공합니다.", tags:["외국인","병원"] },
  { id:"ko-3", category:"visa" as FaqCategory, question:"의료관광 비자는 어떻게 받나요?", answer:"C-3-3(의료관광) 비자를 신청할 수 있습니다. 병원의 진료예약 확인서와 여권, 비자신청서를 한국 대사관에 제출하면 됩니다.", tags:["비자","입국"] },
  { id:"ko-4", category:"recovery" as FaqCategory, question:"수술 후 회복 기간은 얼마나 걸리나요?", answer:"시술에 따라 다릅니다. 보톡스/필러는 당일, 쌍꺼풀은 1~2주, 코성형은 2~3주, 안면윤곽은 4~6주 정도의 회복 기간이 필요합니다.", tags:["회복","기간"] },
  { id:"ko-5", category:"language" as FaqCategory, question:"한국어를 못해도 괜찮나요?", answer:"네, 대부분의 의료관광 전문 병원에서 영어, 중국어, 일본어 통역 서비스를 제공합니다. AI 번역 서비스도 활용할 수 있습니다.", tags:["언어","통역"] },
  { id:"ko-6", category:"general" as FaqCategory, question:"어떤 병원을 선택해야 하나요?", answer:"AI 추천 서비스를 이용하시면 전문의 수, 시설, 환자 후기 등을 기반으로 맞춤 병원 3곳을 추천받을 수 있습니다.", tags:["병원선택","추천"] },
  { id:"ko-7", category:"procedure" as FaqCategory, question:"피부과 시술도 외국인이 받을 수 있나요?", answer:"네, 레이저 시술, 보톡스, 필러 등 비수술 피부 시술도 외국인 환자에게 인기가 많습니다. 대부분 당일 시술이 가능합니다.", tags:["피부과","레이저"] },
  { id:"ko-8", category:"cost" as FaqCategory, question:"시술비를 할부로 낼 수 있나요?", answer:"외국인의 경우 현금 또는 신용카드 일시불이 일반적입니다. 일부 병원에서는 외국인 환자 대상 분할 결제를 지원하기도 합니다.", tags:["결제","할부"] },
  { id:"ko-9", category:"general" as FaqCategory, question:"숙소는 어떻게 구하나요?", answer:"강남, 신사, 압구정 일대에 의료관광 전문 게스트하우스와 서비스 아파트가 많습니다. 병원에서 제휴 숙소를 안내받을 수도 있습니다.", tags:["숙소","게스트하우스"] },
  { id:"ko-10", category:"procedure" as FaqCategory, question:"시술 전 상담은 무료인가요?", answer:"대부분의 병원에서 초진 상담은 무료로 제공합니다. 온라인 사전 상담도 가능한 병원이 많습니다.", tags:["상담","무료"] },
];

export default function FaqPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  // 선택된 카테고리 — 기본값 전체
  const [activeCategory, setActiveCategory] = useState<FaqCategory | "all">("all");
  // 열린 FAQ 항목 ID 집합
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  // locale에 따라 데이터 소스 선택 — 한국어면 한국어 FAQ, 나머지는 영어
  const faqData = locale === "ko" ? koFaqs : seedFaqs;

  // 카테고리 필터 적용
  const filtered = activeCategory === "all"
    ? faqData
    : faqData.filter((faq) => faq.category === activeCategory);

  // 아코디언 토글
  function toggleOpen(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <main className="min-h-screen bg-white">
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-blue-50 to-pink-50 px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-pink-500">
            {t("faq.label")}
          </p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            {t("faq.title")}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            {t("faq.subtitle")}
          </p>
        </div>
      </section>

      {/* 카테고리 필터 탭 */}
      <section className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
        <div className="mx-auto max-w-3xl flex gap-2 overflow-x-auto pb-1">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-pink-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t(CATEGORY_TRANSLATION_KEYS[cat] as Parameters<typeof t>[0])}
            </button>
          ))}
        </div>
      </section>

      {/* FAQ 아코디언 목록 */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-3">
          {filtered.map((faq) => {
            const isOpen = openIds.has(faq.id);
            return (
              <div
                key={faq.id}
                className="rounded-2xl border border-gray-100 overflow-hidden"
              >
                {/* 질문 헤더 — 클릭으로 토글 */}
                <button
                  onClick={() => toggleOpen(faq.id)}
                  className="w-full flex items-start justify-between gap-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-gray-900 text-sm leading-relaxed">
                    {faq.question}
                  </span>
                  {/* 열림/닫힘 아이콘 */}
                  <span className="flex-shrink-0 mt-0.5 text-gray-400 text-lg leading-none">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {/* 답변 — 아코디언 펼침 */}
                {isOpen && (
                  <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50">
                    <p className="mt-4">{faq.answer}</p>
                    {/* 태그 */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {faq.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* 결과 없음 */}
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-10">{t("faq.no_questions")}</p>
          )}
        </div>
      </section>
    </main>
  );
}
