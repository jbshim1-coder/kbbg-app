"use client";

// 병원 검색 페이지 — 심평원 API 연동 + 검색 결과 상단 광고 노출
import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { HiraClinic } from "@/lib/hira-api";
import { SIDO_CODES, SUBJECT_CODES } from "@/lib/hira-api";
import type { Ad } from "@/app/api/admin/ads/route";

export default function HospitalsPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = pathname.split("/")[1] || "en";

  // URL의 dept 또는 subject 파라미터로 초기 진료과 세팅
  const initialSubject = searchParams.get("dept") || searchParams.get("subject") || "";

  // 검색 상태
  const [keyword, setKeyword] = useState("");
  const [region, setRegion] = useState("");
  const [subject, setSubject] = useState(initialSubject);
  const [page, setPage] = useState(1);

  // 결과 상태
  const [clinics, setClinics] = useState<HiraClinic[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

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

  // 검색 실행
  const handleSearch = async (newPage = 1) => {
    setLoading(true);
    setPage(newPage);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set("keyword", keyword);
      if (region) params.set("region", region);
      if (subject) params.set("subject", subject);
      params.set("page", String(newPage));

      const res = await fetch(`/api/hira?${params.toString()}`);
      const data = await res.json();

      setClinics(data.clinics || []);
      setTotalCount(data.totalCount || 0);
      setSearched(true);
    } catch {
      setClinics([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(1);
  };

  // URL에 dept 파라미터가 있으면 마운트 시 자동 검색
  useEffect(() => {
    if (initialSubject) {
      handleSearch(1);
    }
    // initialSubject는 URL에서 파생된 고정값 — 마운트 시 1회만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.ceil(totalCount / 10);
  const isKo = locale === "ko";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {isKo ? "병원 찾기" : "Find Clinics"}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {isKo ? "건강보험심사평가원 데이터 기반 병원 검색" : "Search clinics based on HIRA data"}
        </p>

        {/* 검색 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{isKo ? "지역" : "Region"}</label>
              <select value={region} onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">{isKo ? "전체 지역" : "All Regions"}</option>
                {Object.entries(SIDO_CODES).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{isKo ? "진료과" : "Specialty"}</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">{isKo ? "전체 진료과" : "All Specialties"}</option>
                {Object.entries(SUBJECT_CODES).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="mt-4 w-full sm:w-auto px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition">
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
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  {/* 광고임을 명시하는 라벨 */}
                  <span className="text-xs font-semibold text-yellow-700 bg-yellow-200 px-2 py-0.5 rounded-full">
                    광고
                  </span>
                  <span className="text-xs text-yellow-600">{topAd.hospitalName}</span>
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
                    className="inline-block mt-2 text-xs text-blue-500 hover:underline"
                  >
                    {isKo ? "자세히 보기 →" : "Learn more →"}
                  </a>
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
                  <div key={clinic.ykiho || idx} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{clinic.yadmNm}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{clinic.clCdNm} · {clinic.dgsbjtCdNm}</p>
                      </div>
                      {clinic.hospUrl && (
                        <a href={clinic.hospUrl.startsWith("http") ? clinic.hospUrl : `http://${clinic.hospUrl}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline shrink-0 ml-3">
                          {isKo ? "홈페이지" : "Website"}
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{clinic.addr}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      {clinic.telno && <span>📞 {clinic.telno}</span>}
                      {clinic.drTotCnt > 0 && <span>👨‍⚕️ {isKo ? `의사 ${clinic.drTotCnt}명` : `${clinic.drTotCnt} doctors`}</span>}
                      {clinic.sdrCnt > 0 && <span>🏅 {isKo ? `전문의 ${clinic.sdrCnt}명` : `${clinic.sdrCnt} specialists`}</span>}
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
