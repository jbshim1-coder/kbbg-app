"use client";

// FAQ 페이지 — 클라이언트 컴포넌트 (카테고리 필터 + 아코디언 상태 관리)
// seed-faqs.ts 데이터를 사용하여 실제 FAQ 표시

import { useState } from "react";
import { seedFaqs, type FaqCategory } from "@/data/seed-faqs";

// 카테고리 레이블 매핑
const CATEGORY_LABELS: Record<FaqCategory | "all", string> = {
  all: "All",
  general: "General",
  visa: "Visa",
  cost: "Cost",
  procedure: "Procedure",
  recovery: "Recovery",
  language: "Language",
};

const ALL_CATEGORIES = ["all", "general", "visa", "cost", "procedure", "recovery", "language"] as const;

export default function FaqPage() {
  // 선택된 카테고리 — 기본값 전체
  const [activeCategory, setActiveCategory] = useState<FaqCategory | "all">("all");
  // 열린 FAQ 항목 ID 집합
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  // 카테고리 필터 적용
  const filtered = activeCategory === "all"
    ? seedFaqs
    : seedFaqs.filter((faq) => faq.category === activeCategory);

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
            FAQ
          </p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to know about medical tourism in South Korea.
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
              {CATEGORY_LABELS[cat]}
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
            <p className="text-center text-gray-400 py-10">No questions found.</p>
          )}
        </div>
      </section>
    </main>
  );
}
