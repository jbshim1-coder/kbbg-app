"use client";

// AI 검색 박스 — 비로그인 시 회원가입 유도
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase";

export default function AiSearchBox({ locale }: { locale: string }) {
  const t = useTranslations();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
  }, []);

  const handleSubmit = () => {
    if (!query.trim()) return;
    if (!loggedIn) {
      setShowPopup(true);
      return;
    }
    router.push(`/${locale}/ai-search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
        {t("hero.ai_question" as Parameters<typeof t>[0])}
      </h1>

      <div className="mt-6 mx-auto max-w-2xl">
        <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow px-5 min-h-[52px]">
          <span className="text-gray-300 mr-3">+</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("filter.ai_placeholder" as Parameters<typeof t>[0])}
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent focus:ring-0 py-3"
          />
          <span className="ml-3 text-gray-400 text-xs font-medium flex items-center gap-1">
            <span aria-hidden="true">✦</span> <span className="sr-only">AI</span>AI
          </span>
        </div>

        <button
          onClick={handleSubmit}
          className="mt-4 px-8 py-3 min-h-[44px] bg-[#0071e3] hover:bg-[#0077ED] text-white text-sm font-medium rounded-full transition-colors"
        >
          {t("ai_start.button" as Parameters<typeof t>[0])}
        </button>
      </div>

      {/* 비로그인 팝업 */}
      {showPopup && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
            <p className="text-4xl mb-4">🔒</p>
            <h3 className="text-lg font-bold text-gray-900">
              {t("ui.members_only")}
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              {t("ui.ai_search_members_only")}
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPopup(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                {t("ui.close")}
              </button>
              <button
                onClick={() => router.push(`/${locale}/signup`)}
                className="flex-1 py-2.5 bg-[#0071e3] text-white rounded-lg text-sm font-semibold hover:bg-[#0077ED]"
              >
                {t("ui.signup_free")}
              </button>
            </div>
            <button
              onClick={() => router.push(`/${locale}/login`)}
              className="mt-3 text-xs text-gray-400 hover:text-gray-600"
            >
              {t("ui.already_member")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
