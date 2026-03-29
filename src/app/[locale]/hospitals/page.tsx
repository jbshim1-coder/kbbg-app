"use client";

// 병원 검색 페이지 — 심평원 API 연동 + 검색 결과 상단 광고 노출
import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { HiraClinic } from "@/lib/hira-api";
import { SIDO_CODES, SUBJECT_CODES } from "@/lib/hira-api";

// 코드→이름 역매핑
const SIDO_NAMES = Object.fromEntries(Object.entries(SIDO_CODES).map(([k, v]) => [k, v]));
const SUBJECT_NAMES = Object.fromEntries(Object.entries(SUBJECT_CODES).map(([k, v]) => [k, v]));
import type { Ad } from "@/app/api/admin/ads/route";

export default function HospitalsPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = pathname.split("/")[1] || "en";

  // URL의 dept 또는 subject 파라미터로 초기 진료과 세팅
  const initialSubject = searchParams.get("dept") || searchParams.get("subject") || "";
  // 한의원/한방병원은 type 파라미터로 처리
  const initialType = searchParams.get("type") || "";

  // 검색 상태
  const [keyword, setKeyword] = useState("");
  const [region, setRegion] = useState("");
  const [subject, setSubject] = useState(initialSubject);
  const [clinicType, setClinicType] = useState(initialType);
  const [page, setPage] = useState(1);

  // 결과 상태
  const [clinics, setClinics] = useState<HiraClinic[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // AI 분석 상태
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // 검색 결과 상단에 노출할 광고 1개
  const [topAd, setTopAd] = useState<Ad | null>(null);

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

  // 검색 실행 — DB 우선, 없으면 HIRA API 폴백
  const handleSearch = async (newPage = 1) => {
    setLoading(true);
    setPage(newPage);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set("keyword", keyword);
      if (region) params.set("region", region);
      if (subject) params.set("subject", subject);
      if (clinicType) params.set("type", clinicType);
      params.set("page", String(newPage));

      // 1) DB 기반 검색 시도 (구글별점순 + 전문의수순)
      const dbRes = await fetch(`/api/clinics/search?${params.toString()}`);
      const dbData = await dbRes.json();

      if (dbData.clinics && dbData.clinics.length > 0) {
        setClinics(dbData.clinics);
        setTotalCount(dbData.totalCount || 0);
        setSearched(true);
        // AI 분석 자동 요청 (첫 페이지만)
        if (newPage === 1) {
          const regionName = region ? SIDO_NAMES[region] || "" : "";
          const subjectName = subject ? SUBJECT_NAMES[subject] || "" : "";
          const aiQuery = [regionName, subjectName, keyword].filter(Boolean).join(" ") || "병원 추천";
          fetchAiAnalysis(aiQuery);
        }
        return;
      }

      // 2) DB에 데이터 없으면 HIRA API 직접 호출 (의원만)
      params.set("sort", "rating");
      if (subject && subject !== "01") params.set("type", "31");
      const res = await fetch(`/api/hira?${params.toString()}`);
      const data = await res.json();

      setClinics(data.clinics || []);
      setTotalCount(data.totalCount || 0);
      setSearched(true);
      // AI 분석 자동 요청 (첫 페이지만)
      if (newPage === 1 && (data.clinics || []).length > 0) {
        const regionName = region ? SIDO_NAMES[region] || "" : "";
        const subjectName = subject ? SUBJECT_NAMES[subject] || "" : "";
        const aiQuery = [regionName, subjectName, keyword].filter(Boolean).join(" ") || "병원 추천";
        fetchAiAnalysis(aiQuery);
      }
    } catch {
      setClinics([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // AI 분석 요청 — 검색 결과 상위 병원을 Claude가 분석
  const fetchAiAnalysis = async (query: string) => {
    setAiLoading(true);
    setAiAnalysis("");
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, locale }),
      });
      const data = await res.json();
      if (data.narrative) setAiAnalysis(data.narrative);
    } catch { /* AI 분석 실패해도 검색 결과는 유지 */ }
    finally { setAiLoading(false); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(1);
  };

  // URL에 dept 또는 type 파라미터가 있으면 마운트 시 자동 검색
  useEffect(() => {
    if (initialSubject || initialType) {
      handleSearch(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.ceil(totalCount / 10);
  const isKo = locale === "ko";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isKo ? "병원 찾기" : "Find Clinics"}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {isKo ? "건강보험심사평가원 데이터 기반 병원 검색" : "Search clinics based on HIRA data"}
        </p>

        {/* 검색 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{isKo ? "지역" : "Region"}</label>
              <select value={region} onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">{isKo ? "전체 지역" : "All Regions"}</option>
                {Object.entries(SIDO_CODES).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{isKo ? "진료과" : "Specialty"}</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">{isKo ? "전체 진료과" : "All Specialties"}</option>
                {Object.entries(SUBJECT_CODES).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="mt-4 w-full sm:w-auto px-8 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 disabled:bg-emerald-300 transition">
            {loading ? (isKo ? "검색 중..." : "Searching...") : (isKo ? "검색" : "Search")}
          </button>
        </form>

        {/* 검색 결과 */}
        {searched && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {isKo ? `총 ${totalCount.toLocaleString()}개 병원` : `${totalCount.toLocaleString()} clinics found`}
            </p>

            {/* 광고 카드 — 검색 결과 최상단에 "광고" 라벨과 함께 표시 */}
            {topAd && (
              <div className="mb-4 bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  {/* 광고임을 명시하는 라벨 */}
                  <span className="text-xs font-semibold text-slate-700 bg-gray-200 px-2 py-0.5 rounded-full">
                    광고
                  </span>
                  <span className="text-xs text-gray-500">{topAd.hospitalName}</span>
                </div>
                <p className="font-semibold text-gray-800">{topAd.title}</p>
                {topAd.description && (
                  <p className="text-sm text-gray-600 mt-1">{topAd.description}</p>
                )}
                {topAd.linkUrl && (
                  <a
                    href={topAd.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="inline-block mt-2 text-xs text-emerald-600 hover:underline"
                  >
                    {isKo ? "자세히 보기 →" : "Learn more →"}
                  </a>
                )}
              </div>
            )}

            {/* AI 분석 카드 */}
            {(aiLoading || aiAnalysis) && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🤖</span>
                  <span className="text-sm font-bold text-emerald-700">
                    {isKo ? "AI 추천 분석" : "AI Recommendation"}
                  </span>
                </div>
                {aiLoading ? (
                  <p className="text-sm text-emerald-500 animate-pulse">
                    {isKo ? "AI가 병원을 분석하고 있습니다..." : "AI is analyzing hospitals..."}
                  </p>
                ) : (
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{aiAnalysis}</p>
                )}
              </div>
            )}

            {clinics.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                {isKo ? "검색 결과가 없습니다" : "No results found"}
              </div>
            ) : (
              <div className="space-y-3">
                {clinics.map((clinic, idx) => (
                  <div key={clinic.ykiho || idx} className="bg-white rounded-2xl shadow-md p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{clinic.yadmNm}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{clinic.clCdNm} · {clinic.dgsbjtCdNm}</p>
                      </div>
                      {clinic.hospUrl && (
                        <a href={clinic.hospUrl.startsWith("http") ? clinic.hospUrl : `http://${clinic.hospUrl}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-xs text-emerald-600 hover:underline shrink-0 ml-3">
                          {isKo ? "홈페이지" : "Website"}
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{clinic.addr}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      {clinic.telno && <span>📞 {clinic.telno}</span>}
                      {clinic.drTotCnt > 0 && <span>👨‍⚕️ {isKo ? `의사 ${clinic.drTotCnt}명` : `${clinic.drTotCnt} doctors`}</span>}
                      {clinic.sdrCnt > 0 && <span>🏅 {isKo ? `전문의 ${clinic.sdrCnt}명` : `${clinic.sdrCnt} specialists`}</span>}
                      {clinic.googleRating && (
                        <span>⭐ {clinic.googleRating} {isKo ? "구글별점" : "Google"} · {isKo ? "리뷰" : "Reviews"} {clinic.googleReviewCount || 0}{isKo ? "건" : ""}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button onClick={() => handleSearch(page - 1)} disabled={page <= 1}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50">←</button>
                <span className="px-3 py-1.5 text-sm text-gray-600">{page} / {totalPages}</span>
                <button onClick={() => handleSearch(page + 1)} disabled={page >= totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50">→</button>
              </div>
            )}
          </>
        )}

        {!searched && (
          <div className="text-center py-20 text-gray-400">
            {isKo ? "병원명, 지역, 진료과를 선택하여 검색하세요" : "Search by clinic name, region, or specialty"}
          </div>
        )}
      </div>
    </main>
  );
}
