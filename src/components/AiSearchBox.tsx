"use client";

// AI 검색 박스 — 자연어 입력으로 AI 추천 시작
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function AiSearchBox({ locale }: { locale: string }) {
  const t = useTranslations();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = () => {
    if (!query.trim()) return;
    router.push(`/${locale}/ai-search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="text-center">
      {/* 타이틀 */}
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
        {t("hero.ai_question" as Parameters<typeof t>[0])}
      </h1>

      {/* AI 검색창 */}
      <div className="mt-6 mx-auto max-w-2xl">
        <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-shadow px-5 py-3">
          <span className="text-gray-300 mr-3">+</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("filter.ai_placeholder" as Parameters<typeof t>[0])}
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent focus:ring-0"
          />
          <span className="ml-3 text-gray-400 text-xs font-medium flex items-center gap-1">
            ✦ AI
          </span>
        </div>

        {/* AI 추천 시작 버튼 */}
        <button
          onClick={handleSubmit}
          className="mt-4 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-full transition-colors"
        >
          AI 추천 시작
        </button>
      </div>
    </div>
  );
}
