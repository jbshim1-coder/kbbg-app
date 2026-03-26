"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { seedClinics, Clinic } from "@/data/seed-clinics";

// locale을 URL 경로에서 추출하기 위한 훅
function useLocale() {
  const router = useRouter();
  // pathname에서 locale 추출 — next-intl의 useLocale 대신 pathname 파싱
  if (typeof window !== "undefined") {
    const parts = window.location.pathname.split("/");
    return parts[1] || "ko";
  }
  return "ko";
}

// 지역 키워드 → region 매핑
const REGION_MAP: Record<string, Clinic["region"]> = {
  강남: "서울강남",
  gangnam: "서울강남",
  서울: "서울기타",
  seoul: "서울기타",
  부산: "부산",
  busan: "부산",
  대구: "대구",
  daegu: "대구",
  인천: "인천",
  incheon: "인천",
  제주: "제주",
  jeju: "제주",
};

// 진료과 키워드 → specialty 매핑
const SPECIALTY_MAP: Record<string, Clinic["specialty"]> = {
  성형: "성형",
  plastic: "성형",
  피부: "피부",
  derma: "피부",
  dermatology: "피부",
  치과: "치과",
  dental: "치과",
  안과: "안과",
  eye: "안과",
  ophthalmology: "안과",
};

// 언어 코드 → 표시명
const LANG_NAMES: Record<string, string> = {
  en: "영어",
  zh: "중국어",
  ja: "일본어",
  th: "태국어",
  vi: "베트남어",
  ru: "러시아어",
  mn: "몽골어",
};

function parseQuery(query: string): {
  regions: Clinic["region"][];
  specialties: Clinic["specialty"][];
  keywords: string[];
} {
  const lower = query.toLowerCase();
  const words = lower.split(/\s+/);

  const regions: Clinic["region"][] = [];
  const specialties: Clinic["specialty"][] = [];

  for (const word of words) {
    if (REGION_MAP[word]) {
      const r = REGION_MAP[word];
      if (!regions.includes(r)) regions.push(r);
    }
    if (SPECIALTY_MAP[word]) {
      const s = SPECIALTY_MAP[word];
      if (!specialties.includes(s)) specialties.push(s);
    }
  }

  // 원본 쿼리에서도 한국어 키워드 매칭
  for (const [key, val] of Object.entries(REGION_MAP)) {
    if (query.includes(key) && !regions.includes(val)) regions.push(val);
  }
  for (const [key, val] of Object.entries(SPECIALTY_MAP)) {
    if (query.includes(key) && !specialties.includes(val)) specialties.push(val);
  }

  return { regions, specialties, keywords: words };
}

function searchClinics(query: string): Clinic[] {
  const { regions, specialties, keywords } = parseQuery(query);
  const lower = query.toLowerCase();

  return seedClinics.filter((clinic) => {
    // 지역 필터
    if (regions.length > 0 && !regions.includes(clinic.region)) return false;
    // 진료과 필터
    if (specialties.length > 0 && !specialties.includes(clinic.specialty)) return false;

    // 지역/진료과 둘 다 없으면 텍스트 검색
    if (regions.length === 0 && specialties.length === 0) {
      return (
        clinic.name.toLowerCase().includes(lower) ||
        clinic.nameEn.toLowerCase().includes(lower) ||
        clinic.description.toLowerCase().includes(lower) ||
        keywords.some(
          (k) =>
            clinic.name.includes(k) ||
            clinic.nameEn.toLowerCase().includes(k) ||
            clinic.description.toLowerCase().includes(k)
        )
      );
    }

    return true;
  });
}

function regionLabel(region: Clinic["region"]): string {
  const map: Record<Clinic["region"], string> = {
    서울강남: "서울 강남구",
    서울기타: "서울",
    부산: "부산",
    대구: "대구",
    인천: "인천",
    제주: "제주",
  };
  return map[region];
}

function specialtyLabel(specialty: Clinic["specialty"]): string {
  const map: Record<Clinic["specialty"], string> = {
    성형: "성형외과",
    피부: "피부과",
    치과: "치과",
    안과: "안과",
  };
  return map[specialty];
}

// 서술형 인트로 텍스트 생성
function buildNarrativeIntro(query: string, results: Clinic[]): string {
  const { regions, specialties } = parseQuery(query);

  const regionText = regions.length > 0 ? `${regionLabel(regions[0])} 지역에서 ` : "";
  const specialtyText = specialties.length > 0 ? `${specialtyLabel(specialties[0])}을(를) ` : `"${query}"을(를) `;

  if (results.length === 0) {
    return `${regionText}${specialtyText}검색하셨군요.\n\n조건에 맞는 병원을 찾지 못했습니다. 아래 조건 검색을 이용해 보세요.`;
  }

  const total = seedClinics.filter((c) => {
    if (regions.length > 0 && !regions.includes(c.region)) return false;
    if (specialties.length > 0 && !specialties.includes(c.specialty)) return false;
    return true;
  }).length;

  const topCount = Math.min(results.length, 3);
  return `${regionText}${specialtyText}찾으시는군요!\n\n현재 ${total}개의 병원이 등록되어 있습니다.\n그 중 추천드리는 병원 ${topCount}곳입니다:`;
}

export default function AiSearchPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();

  const rawQuery = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(rawQuery);
  const [isThinking, setIsThinking] = useState(true);
  const [results, setResults] = useState<Clinic[]>([]);
  const [narrative, setNarrative] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsThinking(true);
    setResults([]);
    setNarrative("");
    setInputValue(rawQuery);

    // AI "분석 중" 시뮬레이션
    timerRef.current = setTimeout(() => {
      const found = searchClinics(rawQuery);
      const top3 = found.slice(0, 3);
      setResults(top3);
      setNarrative(buildNarrativeIntro(rawQuery, top3));
      setIsThinking(false);
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

  const EMOJI_MAP: Record<Clinic["specialty"], string> = {
    성형: "🏥",
    피부: "✨",
    치과: "🦷",
    안과: "👁️",
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
                key={clinic.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{EMOJI_MAP[clinic.specialty]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400 font-medium">
                        {idx + 1}.
                      </span>
                      <h2 className="text-sm font-semibold text-gray-900">
                        {clinic.name}
                      </h2>
                      <span className="text-xs text-gray-400">
                        {clinic.nameEn}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {regionLabel(clinic.region)} · {specialtyLabel(clinic.specialty)} ·{" "}
                      {t("ai_search.specialist_count" as Parameters<typeof t>[0], {
                        count: clinic.specialistCount,
                      })}
                    </p>
                    {clinic.foreignLanguages.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        {t("ai_search.languages" as Parameters<typeof t>[0])}:{" "}
                        {clinic.foreignLanguages
                          .map((l) => LANG_NAMES[l] || l)
                          .join(", ")}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-yellow-400 text-xs">★</span>
                      <span className="text-xs text-gray-600">{clinic.rating}</span>
                      <span className="text-xs text-gray-400">
                        ({clinic.reviewCount.toLocaleString()} 리뷰)
                      </span>
                    </div>
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
