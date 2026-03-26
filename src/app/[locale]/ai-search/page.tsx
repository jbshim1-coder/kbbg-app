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

// 서술형 인트로 텍스트 생성
function buildNarrativeIntro(query: string, results: HiraClinic[], totalCount: number): string {
  if (results.length === 0) {
    return `"${query}"에 대한 병원을 찾지 못했습니다.\n\n아래 조건 검색을 이용해 보세요.`;
  }

  const topCount = Math.min(results.length, 3);
  return `"${query}"(으)로 검색한 결과입니다.\n\n총 ${totalCount.toLocaleString()}개의 병원이 있으며, 상위 ${topCount}곳을 보여드립니다:`;
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

  // URL에서 q 파라미터 직접 추출 (useSearchParams 대신 — Suspense 호환)
  const [rawQuery, setRawQuery] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRawQuery(params.get("q") || "");
  }, []);
  const [inputValue, setInputValue] = useState(rawQuery);
  const [isThinking, setIsThinking] = useState(true);
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
    setIsThinking(true);
    setResults([]);
    setNarrative("");
    setInputValue(rawQuery);

    if (!rawQuery) {
      setIsThinking(false);
      return;
    }

    // AI "분석 중" 시뮬레이션 후 실제 API 호출
    timerRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        params.set("page", "1");

        // 자연어에서 지역/진료과 키워드 파싱
        const q = rawQuery;
        const regionMap: Record<string, string> = { "서울":"110000", "강남":"110000", "부산":"210000", "대구":"220000", "인천":"230000", "광주":"240000", "대전":"250000", "울산":"260000", "세종":"290000", "경기":"310000", "강원":"320000", "충북":"340000", "충남":"360000", "전북":"370000", "전남":"410000", "경북":"430000", "경남":"460000", "제주":"500000" };
        const subjectMap: Record<string, string> = { "성형":"08", "피부":"14", "치과":"49", "안과":"12", "내과":"01", "외과":"04", "정형":"05", "신경":"06", "이비인후":"13", "비뇨":"15", "재활":"21" };

        // 지역 추출
        for (const [name, code] of Object.entries(regionMap)) {
          if (q.includes(name)) { params.set("region", code); break; }
        }
        // 진료과 추출
        for (const [name, code] of Object.entries(subjectMap)) {
          if (q.includes(name)) { params.set("subject", code); break; }
        }
        // 종별: 기본 의원
        params.set("type", "31");
        // 별점 조회 스킵 (속도 우선)
        params.set("rating", "skip");

        const url = `/api/hira?${params.toString()}`;
        console.log("AI Search API URL:", url);
        const res = await fetch(url);
        const data = await res.json();
        console.log("AI Search API response:", { totalCount: data.totalCount, clinics: data.clinics?.length });

        const top3: HiraClinic[] = (data.clinics || []).slice(0, 3);
        const count: number = data.totalCount || 0;
        setResults(top3);
        setTotalCount(count);
        setNarrative(buildNarrativeIntro(rawQuery, top3, count));
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
  }, [rawQuery]);

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

        {/* AI 분석 중 */}
        {isThinking && (
          <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-3">
            <span className="animate-pulse text-pink-400 text-lg">✦</span>
            <p className="text-sm text-gray-500">
              {t("ai_search.thinking" as Parameters<typeof t>[0])}
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
