"use client";

// 병원 검색 결과 페이지 — 심평원 API 직접 호출 + 광고
import { useState, useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { HiraClinic } from "@/lib/hira-api";
import { SIDO_CODES, SUBJECT_CODES } from "@/lib/hira-api";
import type { Ad } from "@/app/api/admin/ads/route";
import { safeUrl } from "@/lib/safe-url";

function HospitalsContent() {
  const t = useTranslations();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = pathname.split("/")[1] || "en";

  // URL 파라미터에서 조건 읽기
  const subject = searchParams.get("dept") || searchParams.get("subject") || "";
  const region = searchParams.get("region") || "";
  const sggu = searchParams.get("sggu") || "";
  const type = searchParams.get("type") || "";
  const keyword = searchParams.get("keyword") || "";

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
      if (sggu) params.set("sggu", sggu);
      if (subject) params.set("subject", subject);
      if (type) params.set("type", type);
      if (keyword) params.set("keyword", keyword);
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
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                {t("hospitals.search_results")}
              </h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {regionName && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full whitespace-nowrap">{regionName}</span>
                )}
                {subjectName && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full whitespace-nowrap">{subjectName}</span>
                )}
                {!regionName && !subjectName && (
                  <span className="text-xs text-gray-400">{t("hospitals.all_results")}</span>
                )}
              </div>
            </div>
            <Link
              href={`/${locale}`}
              className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-4 py-2 rounded-lg shrink-0 min-h-[44px] flex items-center"
            >
              {t("hospitals.change_filters")}
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* 로딩 */}
        {loading && (
          <div className="text-center py-20">
            <p className="text-sm text-gray-400 animate-pulse">
              {t("hospitals.searching")}
            </p>
          </div>
        )}

        {!loading && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {t("hospitals.total_count", { count: totalCount.toLocaleString() })}
            </p>

            {/* 광고 */}
            {topAd && (
              <div className="mb-4 bg-stone-50 border border-stone-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-white bg-slate-600 px-2 py-0.5 rounded">광고</span>
                  <span className="text-xs text-gray-500">{topAd.hospital_name}</span>
                </div>
                <p className="font-semibold text-gray-800">{topAd.title}</p>
                {topAd.description && <p className="text-sm text-gray-600 mt-1">{topAd.description}</p>}
                {topAd.link_url && (
                  <a href={safeUrl(topAd.link_url)} target="_blank" rel="noopener noreferrer sponsored"
                    className="inline-block mt-2 text-xs text-gray-500 hover:underline">
                    {t("hospitals.learn_more")}
                  </a>
                )}
              </div>
            )}

            {/* 검색 결과 */}
            {clinics.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                {t("hospitals.no_results")}
              </div>
            ) : (
              <div className="space-y-3">
                {clinics.map((clinic, idx) => (
                  <div key={clinic.ykiho || idx} className="bg-white rounded-lg border border-gray-100 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-800 break-words">{locale !== "ko" && (clinic as any).nameEn ? (clinic as any).nameEn : clinic.yadmNm}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{clinic.clCdNm} · {clinic.dgsbjtCdNm}</p>
                      </div>
                      {clinic.hospUrl && (
                        <a href={safeUrl(clinic.hospUrl.startsWith("http") ? clinic.hospUrl : `http://${clinic.hospUrl}`)}
                          target="_blank" rel="noopener noreferrer"
                          className="text-xs text-gray-500 hover:underline shrink-0 min-h-[44px] flex items-start pt-1">
                          {t("hospitals.website")}
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{clinic.addr}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      {clinic.telno && <span>📞 {clinic.telno}</span>}
                      {clinic.drTotCnt > 0 && <span>{t("hospitals.doctors_count", { count: clinic.drTotCnt })}</span>}
                      {clinic.sdrCnt > 0 && <span>{t("hospitals.specialists_count", { count: clinic.sdrCnt })}</span>}
                      {clinic.googleRating && (
                        <span>⭐ {clinic.googleRating} · {t("hospitals.reviews")} {clinic.googleReviewCount || 0}</span>
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
                  className="min-w-[44px] min-h-[44px] px-4 text-sm border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 flex items-center justify-center">←</button>
                <span className="min-h-[44px] px-4 text-sm text-gray-600 flex items-center">{page} / {totalPages}</span>
                <button onClick={() => handleSearch(page + 1)} disabled={page >= totalPages}
                  className="min-w-[44px] min-h-[44px] px-4 text-sm border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 flex items-center justify-center">→</button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function HospitalsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-sm text-gray-400">Loading...</p></div>}>
      <HospitalsContent />
    </Suspense>
  );
}
