"use client";

// FAQ 페이지 — 클라이언트 컴포넌트 (카테고리 필터 + 아코디언 상태 관리)
// locale에 따라 해당 언어의 FAQ 데이터를 사용

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { seedFaqs, type FaqCategory } from "@/data/seed-faqs";
import { faqKo } from "@/data/faq-ko";
import { faqZh } from "@/data/faq-zh";
import { faqJa } from "@/data/faq-ja";
import { faqRu } from "@/data/faq-ru";
import { faqVi } from "@/data/faq-vi";
import { faqTh } from "@/data/faq-th";
import { faqMn } from "@/data/faq-mn";

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


export default function FaqPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  // 선택된 카테고리 — 기본값 전체
  const [activeCategory, setActiveCategory] = useState<FaqCategory | "all">("all");
  // 열린 FAQ 항목 ID 집합
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  // locale에 따라 데이터 소스 선택
  const faqData =
    locale === "ko" ? faqKo :
    locale === "zh" ? faqZh :
    locale === "ja" ? faqJa :
    locale === "ru" ? faqRu :
    locale === "vi" ? faqVi :
    locale === "th" ? faqTh :
    locale === "mn" ? faqMn :
    seedFaqs; // en 기본값

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
      <section className="bg-gradient-to-br from-blue-50 to-pink-50 px-4 py-8 sm:py-12 lg:py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-700">
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
      <section className="sticky top-0 z-10 bg-white border-b border-stone-100 px-4 py-3">
        <div className="mx-auto max-w-3xl flex gap-2 overflow-x-auto pb-1">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-slate-800 text-white"
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
                className="rounded-2xl border border-stone-100 overflow-hidden"
              >
                {/* 질문 헤더 — 클릭으로 토글 */}
                <button
                  onClick={() => toggleOpen(faq.id)}
                  className="w-full flex items-start justify-between gap-4 px-6 py-4 text-left hover:bg-stone-50 transition-colors"
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
