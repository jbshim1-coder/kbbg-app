"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { HiraClinic } from "@/lib/hira-api";
import { SIDO_CODES } from "@/lib/hira-api";
import type { Ad } from "@/app/api/admin/ads/route";
import { safeUrl } from "@/lib/safe-url";

// "서울" → "110000" 역방향 매핑
const SIDO_NAME_TO_CODE = Object.fromEntries(
  Object.entries(SIDO_CODES).map(([code, name]) => [name, code])
);

function useLocale() {
  if (typeof window !== "undefined") {
    const parts = window.location.pathname.split("/");
    return parts[1] || "ko";
  }
  return "ko";
}

interface ExtractedFilters {
  region: string | null;
  subject_code: string | null;
  subject_name: string;
  clinic_type: string | null;
  keyword: string;
  confidence: number;
}

// 주요 지역 칩 (외국인 대상)
const REGION_CHIPS = [
  { label: "서울 강남", region: "강남구" },
  { label: "서울 서초", region: "서초구" },
  { label: "서울 명동", region: "중구" },
  { label: "부산", region: "부산" },
  { label: "제주", region: "제주" },
];

// 로딩 단계별 키 (i18n)
const LOADING_STEP_KEYS = [
  "ui.loading_step_0",
  "ui.loading_step_1",
  "ui.loading_step_2",
] as const;

export default function AiSearchPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <AiSearchContent />
    </Suspense>
  );
}

function AiSearchContent() {
  const t = useTranslations();
  const locale = useLocale();

  const [rawQuery, setRawQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [searchTrigger, setSearchTrigger] = useState(0);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q") || "";
    setRawQuery(q);
    setInputValue(q);
    setInitialized(true);
  }, []);

  const [results, setResults] = useState<HiraClinic[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [narrative, setNarrative] = useState("");
  const [searchBasis, setSearchBasis] = useState("");
  const [filters, setFilters] = useState<ExtractedFilters | null>(null);
  const [needsRegion, setNeedsRegion] = useState(false);
  const [topAd, setTopAd] = useState<Ad | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchIntent, setSearchIntent] = useState<any>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    setSearchBasis("");
    setFilters(null);
    setNeedsRegion(false);
    setLoadingStep(0);

    if (!rawQuery) {
      setIsThinking(false);
      return;
    }

    // 이전 요청 취소용 AbortController
    const abortController = new AbortController();

    // 단계별 로딩 메시지 전환 (2초 간격)
    stepTimerRef.current = setInterval(() => {
      setLoadingStep((prev) => Math.min(prev + 1, LOADING_STEP_KEYS.length - 1));
    }, 2000);

    // AI 검색 API 호출
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/ai-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: rawQuery, locale }),
          signal: abortController.signal,
        });
        const data = await res.json();

        setResults(data.clinics || []);
        setTotalCount(data.totalCount || 0);
        setNarrative(data.narrative || `"${rawQuery}" 검색 결과입니다.`);
        setSearchBasis(data.searchBasis || "");
        setFilters(data.extractedFilters || null);
        setNeedsRegion(data.needsRegion || false);
        setSearchIntent(data.searchIntent || null);
        setAllLoaded((data.totalCount || 0) <= 10);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setResults([]);
        setTotalCount(0);
        setNarrative(t("ui.search_error").replace("{query}", rawQuery));
      } finally {
        setIsThinking(false);
        if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      }
    }, 300);

    return () => {
      abortController.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  // searchTrigger: 같은 검색어로 재검색 시에도 effect 재실행
  }, [rawQuery, initialized, locale, searchTrigger]);

  const handleSearch = () => {
    const q = inputValue.trim();
    if (!q) return;
    if (q === rawQuery) {
      // 같은 검색어 → searchTrigger 증가로 재검색
      setSearchTrigger((prev) => prev + 1);
    } else {
      setRawQuery(q);
    }
    window.history.pushState(null, "", `/${locale}/ai-search?q=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  // 지역 칩 클릭 → 지역 추가해서 재검색
  const handleRegionChip = (regionLabel: string) => {
    // 기존 검색어에서 다른 지역 칩이 이미 붙어있으면 제거하고 새로 추가
    let baseQuery = rawQuery;
    for (const chip of REGION_CHIPS) {
      baseQuery = baseQuery.replace(new RegExp(`\\s*${chip.label}\\s*`, "g"), " ").trim();
    }
    const newQuery = `${baseQuery} ${regionLabel}`.trim();
    setInputValue(newQuery);
    setRawQuery(newQuery);
    setSearchTrigger((prev) => prev + 1);
    window.history.pushState(null, "", `/${locale}/ai-search?q=${encodeURIComponent(newQuery)}`);
  };

  // 나머지 결과 더 불러오기 — 같은 DB에서 추가 결과
  const handleLoadMore = async () => {
    if (!searchIntent || loadingMore) return;
    setLoadingMore(true);
    try {
      const remaining = totalCount - results.length;
      const res = await fetch("/api/ai-search/more", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: searchIntent, page: 1, limit: remaining }),
      });
      const data = await res.json();
      if (data.clinics?.length > 0) {
        // 기존 10개의 ykiho 목록으로 중복 제거
        const existingIds = new Set(results.map((r) => r.ykiho));
        const newClinics = data.clinics.filter((c: HiraClinic) => !existingIds.has(c.ykiho));
        setResults((prev) => [...prev, ...newClinics]);
      }
      setAllLoaded(true);
    } catch {
      // 실패해도 무시
    } finally {
      setLoadingMore(false);
    }
  };

  // 조건 검색 페이지로 필터 전달 — 지역명을 시도코드로 변환, 기관유형 포함
  const buildHospitalsUrl = () => {
    if (!filters) return `/${locale}/hospitals`;
    const params = new URLSearchParams();
    if (filters.subject_code) params.set("subject", filters.subject_code);
    if (filters.region) {
      const sidoCode = SIDO_NAME_TO_CODE[filters.region];
      if (sidoCode) {
        params.set("region", sidoCode);
      } else {
        params.set("keyword", filters.region);
      }
    }
    // 기관유형: AI가 추출했으면 사용, 없으면 의원(31) 기본값
    if (filters.clinic_type) {
      params.set("type", filters.clinic_type);
    } else if (filters.subject_code) {
      params.set("type", "31");
    }
    const qs = params.toString();
    return `/${locale}/hospitals${qs ? `?${qs}` : ""}`;
  };

  return (
    <main className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="mx-auto max-w-2xl">
        {/* 상단 재검색창 */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">
            {t("ai_search.title" as Parameters<typeof t>[0])}
          </h1>
          <div className="flex items-center bg-white border border-stone-200 rounded-full shadow-sm px-4 py-2 gap-2">
            <span className="text-gray-300 shrink-0">+</span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("ui.search_placeholder")}
              className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent min-w-0"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-full transition-colors shrink-0 min-h-[44px] whitespace-nowrap"
            >
              {t("ai_start.button" as Parameters<typeof t>[0])}
            </button>
          </div>
        </div>

        {/* 로딩 — 스켈레톤 + 단계별 메시지 */}
        {isThinking && rawQuery && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-8 shadow-sm flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
              <p className="text-sm text-gray-600 animate-pulse">
                {t(LOADING_STEP_KEYS[loadingStep])}
              </p>
            </div>
            {/* 스켈레톤 카드 3개 */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* 결과 */}
        {!isThinking && (
          <div className="space-y-4">
            {/* 추출된 조건 칩 */}
            {filters && (
              <div className="flex flex-wrap gap-2 mb-2">
                {filters.subject_name && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                    {filters.subject_name}
                  </span>
                )}
                {filters.region && (
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                    {filters.region}
                  </span>
                )}
                {filters.keyword && filters.keyword !== filters.region && filters.keyword !== filters.subject_name && (
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                    {filters.keyword}
                  </span>
                )}
              </div>
            )}

            {/* 지역 없는 질문 → 지역 선택 칩 */}
            {needsRegion && results.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-xs text-amber-700 mb-2">
                  {t("ui.region_prompt")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {REGION_CHIPS.map((chip) => (
                    <button
                      key={chip.region}
                      onClick={() => handleRegionChip(chip.label)}
                      className="px-3 py-1.5 bg-white border border-amber-300 text-amber-800 text-xs font-medium rounded-full hover:bg-amber-100 transition-colors min-h-[36px]"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 광고 카드 */}
            {topAd && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-yellow-700 bg-yellow-200 px-2 py-0.5 rounded-full">
                    {t("ad.label" as Parameters<typeof t>[0])}
                  </span>
                  <span className="text-xs text-yellow-600">{topAd.hospital_name}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">{topAd.title}</p>
                {topAd.description && (
                  <p className="text-xs text-gray-600 mt-1">{topAd.description}</p>
                )}
                {topAd.link_url && (
                  <a
                    href={safeUrl(topAd.link_url)}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="inline-block mt-2 text-xs text-slate-600 hover:underline"
                  >
                    {t("ui.learn_more")}
                  </a>
                )}
              </div>
            )}

            {/* 병원 카드 목록 — 데이터 먼저 표시 */}
            {results.map((clinic, idx) => (
              <div
                key={clinic.ykiho || idx}
                className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100"
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
                      <p className="text-xs text-gray-400 mt-1 break-words">{clinic.addr}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      {clinic.telno && <span>📞 {clinic.telno}</span>}
                      {clinic.drTotCnt > 0 && <span>👨‍⚕️ {t("ui.doctors_count").replace("{count}", String(clinic.drTotCnt))}</span>}
                      {(clinic.mdeptSdrCnt || clinic.sdrCnt) > 0 && (
                        <span>🏅 {t("ui.specialists_count").replace("{count}", String(clinic.mdeptSdrCnt || clinic.sdrCnt))}</span>
                      )}
                      {clinic.googleRating && clinic.googleRating > 0 && (
                        <span className="text-yellow-600 font-medium">
                          ⭐ {clinic.googleRating.toFixed(1)}
                          {clinic.googleReviewCount ? ` · ${t("ui.reviews_count").replace("{count}", clinic.googleReviewCount.toLocaleString())}` : ""}
                        </span>
                      )}
                    </div>
                    {/* 마취과 전문의 상주 뱃지 */}
                    {clinic.safeAnesthesiaBadge && (
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium">
                          🛡️ {t("badge.safe_anesthesia" as Parameters<typeof t>[0])}
                          {clinic.anesthesiaSdrCount > 1 && "+"}
                        </span>
                      </div>
                    )}
                    {clinic.hospUrl && (
                      <a
                        href={safeUrl(clinic.hospUrl.startsWith("http") ? clinic.hospUrl : `http://${clinic.hospUrl}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-xs text-slate-600 hover:underline"
                      >
                        {t("ui.website")}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* 검색 기준 + AI 추천 */}
            {(searchBasis || narrative) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                {searchBasis && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-xs font-medium text-slate-500 mb-1">{t("ui.search_criteria")}</p>
                    <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{searchBasis}</p>
                  </div>
                )}
                {narrative && (
                  <div className="flex items-start gap-3">
                    <span className="text-slate-500 text-lg mt-0.5">✦</span>
                    <div>
                      <p className="text-xs text-gray-400 mb-2">AI {t("ui.ai_recommendation")}</p>
                      <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                        {narrative}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {results.length === 0 && !narrative && (
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <p className="text-sm text-gray-400">
                  {t("ai_search.no_results" as Parameters<typeof t>[0])}
                </p>
              </div>
            )}

            {/* 나머지 결과 더 보기 — 같은 DB에서 추가 로드 */}
            {!allLoaded && totalCount > 10 && (
              <div className="pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="block w-full text-center py-3 px-6 bg-slate-800 text-white hover:bg-slate-900 text-sm font-medium rounded-full transition-colors min-h-[44px] disabled:bg-slate-400"
                >
                  {loadingMore
                    ? (locale === "ko" ? "불러오는 중..." : "Loading...")
                    : (locale === "ko"
                        ? `나머지 ${(totalCount - results.length).toLocaleString()}개 병원 더 보기`
                        : `Show ${(totalCount - results.length).toLocaleString()} more clinics`
                      )
                  }
                </button>
              </div>
            )}

            {/* 조건 검색 보조 링크 */}
            <div className="pt-3 text-center">
              <Link
                href={buildHospitalsUrl()}
                className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
              >
                {locale === "ko" ? "조건별 병원검색에서 더 알아보기" : "Browse more in condition search"}
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
