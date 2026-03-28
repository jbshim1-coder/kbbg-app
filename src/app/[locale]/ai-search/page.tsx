"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { HiraClinic } from "@/lib/hira-api";
import type { Ad } from "@/app/api/admin/ads/route";

// locale을 URL 경로에서 추출하기 위한 훅
function useLocale() {
  if (typeof window !== "undefined") {
    const parts = window.location.pathname.split("/");
    return parts[1] || "ko";
  }
  return "ko";
}


export default function AiSearchPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <AiSearchContent />
    </Suspense>
  );
}

function AiSearchContent() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();

  // URL에서 q 파라미터 직접 추출
  const [rawQuery, setRawQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // 마운트 시 URL에서 query 추출
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q") || "";
    setRawQuery(q);
    setInputValue(q);
    setInitialized(true);
  }, []);
  const [results, setResults] = useState<HiraClinic[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [narrative, setNarrative] = useState("");
  // 검색 결과 상단에 노출할 광고 1개
  const [topAd, setTopAd] = useState<Ad | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 활성 광고 1개 로드 — 페이지 마운트 시 1회
  useEffect(() => {
    fetch("/api/admin/ads")
      .then((r) => r.json())
      .then((d) => {
        const activeAds: Ad[] = d.ads || [];
        setTopAd(activeAds[0] ?? null);
      })
      .catch(() => setTopAd(null));
  }, []);

  useEffect(() => {
    if (!initialized) return;
    setIsThinking(true);
    setResults([]);
    setNarrative("");

    if (!rawQuery) {
      setIsThinking(false);
      return;
    }

    // AI "분석 중" 시뮬레이션 후 /api/ai-search 호출
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/ai-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: rawQuery, locale }),
        });
        const data = await res.json();

        const clinics: HiraClinic[] = data.clinics || [];
        setResults(clinics);
        setTotalCount(data.totalCount || 0);
        setNarrative(data.narrative || `"${rawQuery}" 검색 결과입니다.`);
      } catch (err) {
        console.error("AI Search error:", err);
        setResults([]);
        setTotalCount(0);
        setNarrative(`"${rawQuery}" 검색 중 오류가 발생했습니다.`);
      } finally {
        setIsThinking(false);
      }
    }, 800);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [rawQuery, initialized]);

  const handleSearch = () => {
    const q = inputValue.trim();
    if (!q) return;
    router.push(`/${locale}/ai-search?q=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-2xl">
        {/* 상단 재검색창 */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">
            {t("ai_search.title" as Parameters<typeof t>[0])}
          </h1>
          <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm px-5 py-3 gap-3">
            <span className="text-gray-300">+</span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="강남 성형외과, 피부과 등..."
              className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-1.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-medium rounded-full transition-colors"
            >
              AI 추천 시작
            </button>
          </div>
        </div>

        {/* AI 분석 중 — 스피너 + 메시지 */}
        {isThinking && rawQuery && (
          <div className="bg-white rounded-2xl p-8 shadow-sm flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
            <p className="text-sm text-gray-500 animate-pulse">
              {t("ai_search.thinking" as Parameters<typeof t>[0])}
            </p>
            <p className="text-xs text-gray-400">
              {locale === "ko" ? "건강보험심사평가원과 구글의 정보를 취합하여 추천드립니다." : "Combining data from HIRA and Google to find the best recommendations for you."}
            </p>
          </div>
        )}

        {/* 결과 */}
        {!isThinking && (
          <div className="space-y-4">
            {/* 광고 카드 — 활성 광고가 있을 때만 검색 결과 최상단에 표시 */}
            {topAd && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  {/* "광고" 라벨 — 명시적으로 광고임을 표시 */}
                  <span className="text-xs font-semibold text-yellow-700 bg-yellow-200 px-2 py-0.5 rounded-full">
                    광고
                  </span>
                  <span className="text-xs text-yellow-600">{topAd.hospitalName}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">{topAd.title}</p>
                {topAd.description && (
                  <p className="text-xs text-gray-600 mt-1">{topAd.description}</p>
                )}
                {topAd.linkUrl && (
                  <a
                    href={topAd.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="inline-block mt-2 text-xs text-blue-500 hover:underline"
                  >
                    자세히 보기 →
                  </a>
                )}
              </div>
            )}

            {/* 서술형 답변 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-pink-400 text-lg mt-0.5">✦</span>
                <div>
                  <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                    {narrative}
                  </p>
                </div>
              </div>

              {results.length === 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  {t("ai_search.no_results" as Parameters<typeof t>[0])}
                </p>
              )}
            </div>

            {/* 병원 카드 목록 */}
            {results.map((clinic, idx) => (
              <div
                key={clinic.ykiho || idx}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400 font-medium">{idx + 1}.</span>
                      <h2 className="text-sm font-semibold text-gray-900">{clinic.yadmNm}</h2>
                      {clinic.clCdNm && (
                        <span className="text-xs text-gray-400">{clinic.clCdNm}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {[clinic.sidoCdNm, clinic.sgguCdNm].filter(Boolean).join(" ")}
                      {clinic.dgsbjtCdNm ? ` · ${clinic.dgsbjtCdNm}` : ""}
                    </p>
                    {clinic.addr && (
                      <p className="text-xs text-gray-400 mt-1">{clinic.addr}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      {clinic.telno && <span>📞 {clinic.telno}</span>}
                      {clinic.drTotCnt > 0 && <span>👨‍⚕️ 의사 {clinic.drTotCnt}명</span>}
                      {(clinic.mdeptSdrCnt || clinic.sdrCnt) > 0 && (
                        <span>🏅 전문의 {clinic.mdeptSdrCnt || clinic.sdrCnt}명</span>
                      )}
                      {clinic.googleRating && clinic.googleRating > 0 && (
                        <span className="text-yellow-600 font-medium">
                          ⭐ {clinic.googleRating.toFixed(1)} 구글별점
                          {clinic.googleReviewCount ? ` · 리뷰 ${clinic.googleReviewCount.toLocaleString()}건` : ""}
                        </span>
                      )}
                    </div>
                    {clinic.hospUrl && (
                      <a
                        href={clinic.hospUrl.startsWith("http") ? clinic.hospUrl : `http://${clinic.hospUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-xs text-blue-500 hover:underline"
                      >
                        홈페이지 →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* 하단 안내 */}
            {results.length > 0 && (
              <p className="text-xs text-gray-400 text-center px-4">
                더 자세한 조건으로 검색하시려면 아래 조건 검색을 이용해주세요.
              </p>
            )}

            {/* 조건 검색 버튼 */}
            <div className="pt-2">
              <Link
                href={`/${locale}/hospitals`}
                className="block w-full text-center py-3 px-6 border border-pink-300 text-pink-600 hover:bg-pink-50 text-sm font-medium rounded-full transition-colors"
              >
                {t("ai_search.more_filter" as Parameters<typeof t>[0])}
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
