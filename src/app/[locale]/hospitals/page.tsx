"use client";

// 병원 검색 결과 페이지 — 심평원 API 직접 호출 + 광고
import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { HiraClinic } from "@/lib/hira-api";
import { SIDO_CODES, SUBJECT_CODES } from "@/lib/hira-api";
import type { Ad } from "@/app/api/admin/ads/route";

export default function HospitalsPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = pathname.split("/")[1] || "en";
  const isKo = locale === "ko";

  // URL 파라미터에서 조건 읽기
  const subject = searchParams.get("dept") || searchParams.get("subject") || "";
  const region = searchParams.get("region") || "";
  const type = searchParams.get("type") || "";

  const subjectName = subject ? (SUBJECT_CODES[subject] || subject) : "";
  const regionName = region ? (SIDO_CODES[region] || region) : "";

  const [clinics, setClinics] = useState<HiraClinic[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [topAd, setTopAd] = useState<Ad | null>(null);

  // 광고 로드
  useEffect(() => {
    fetch("/api/admin/ads").then(r => r.json()).then(d => {
      setTopAd((d.ads || [])[0] ?? null);
    }).catch(() => {});
  }, []);

  // 검색 실행
  const handleSearch = async (newPage = 1) => {
    setLoading(true);
    setPage(newPage);
    try {
      const params = new URLSearchParams();
      if (region) params.set("region", region);
      if (subject) params.set("subject", subject);
      if (type) params.set("type", type);
      params.set("page", String(newPage));

      const res = await fetch(`/api/hira?${params.toString()}`);
      const data = await res.json();

      setClinics(data.clinics || []);
      setTotalCount(data.totalCount || 0);
    } catch {
      setClinics([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // 마운트 시 자동 검색
  useEffect(() => {
    handleSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.ceil(totalCount / 10);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 선택 조건 표시 */}
      <div className="bg-white border-b border-gray-100 px-4 py-5">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {isKo ? "병원 검색 결과" : "Search Results"}
              </h1>
              <div className="flex gap-2 mt-2">
                {regionName && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{regionName}</span>
                )}
                {subjectName && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{subjectName}</span>
                )}
                {!regionName && !subjectName && (
                  <span className="text-xs text-gray-400">{isKo ? "전체 검색" : "All"}</span>
                )}
              </div>
            </div>
            <Link
              href={`/${locale}`}
              className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-4 py-2 rounded-lg"
            >
              {isKo ? "조건 변경" : "Change Filters"}
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* 로딩 */}
        {loading && (
          <div className="text-center py-20">
            <p className="text-sm text-gray-400 animate-pulse">
              {isKo ? "검색 중..." : "Searching..."}
            </p>
          </div>
        )}

        {!loading && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {isKo ? `총 ${totalCount.toLocaleString()}개 병원` : `${totalCount.toLocaleString()} clinics found`}
            </p>

            {/* 광고 */}
            {topAd && (
              <div className="mb-4 bg-stone-50 border border-stone-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-white bg-slate-600 px-2 py-0.5 rounded">광고</span>
                  <span className="text-xs text-gray-500">{topAd.hospitalName}</span>
                </div>
                <p className="font-semibold text-gray-800">{topAd.title}</p>
                {topAd.description && <p className="text-sm text-gray-600 mt-1">{topAd.description}</p>}
                {topAd.linkUrl && (
                  <a href={topAd.linkUrl} target="_blank" rel="noopener noreferrer sponsored"
                    className="inline-block mt-2 text-xs text-gray-500 hover:underline">
                    {isKo ? "자세히 보기 →" : "Learn more →"}
                  </a>
                )}
              </div>
            )}

            {/* 검색 결과 */}
            {clinics.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                {isKo ? "검색 결과가 없습니다" : "No results found"}
              </div>
            ) : (
              <div className="space-y-3">
                {clinics.map((clinic, idx) => (
                  <div key={clinic.ykiho || idx} className="bg-white rounded-lg border border-gray-100 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{clinic.yadmNm}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{clinic.clCdNm} · {clinic.dgsbjtCdNm}</p>
                      </div>
                      {clinic.hospUrl && (
                        <a href={clinic.hospUrl.startsWith("http") ? clinic.hospUrl : `http://${clinic.hospUrl}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-xs text-gray-500 hover:underline shrink-0 ml-3">
                          {isKo ? "홈페이지" : "Website"}
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{clinic.addr}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      {clinic.telno && <span>📞 {clinic.telno}</span>}
                      {clinic.drTotCnt > 0 && <span>{isKo ? `의사 ${clinic.drTotCnt}명` : `${clinic.drTotCnt} doctors`}</span>}
                      {clinic.sdrCnt > 0 && <span>{isKo ? `전문의 ${clinic.sdrCnt}명` : `${clinic.sdrCnt} specialists`}</span>}
                      {clinic.googleRating && (
                        <span>⭐ {clinic.googleRating} · {isKo ? "리뷰" : "Reviews"} {clinic.googleReviewCount || 0}{isKo ? "건" : ""}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 페이지네이션 */}
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
      </div>
    </main>
  );
}
