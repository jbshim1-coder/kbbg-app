"use client";

// 병원 데이터 관리 페이지 — Supabase clinics 테이블 연동 (non-locale 버전)
// [locale]/admin/clinics/page.tsx와 동일한 구현

import { useEffect, useState, useCallback } from "react";

interface ClinicRow {
  id: number;
  name: string;
  name_en: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  is_verified: boolean;
  is_active: boolean;
  rating_avg: number | null;
  review_count: number | null;
  cl_cd_nm: string | null;
  sido_cd_nm: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminClinicsPage() {
  const [clinics, setClinics] = useState<ClinicRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [acting, setActing] = useState<number | null>(null);
  const limit = 20;

  const fetchClinics = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/clinics?${params}`);
    if (res.ok) {
      const data = await res.json();
      setClinics(data.clinics || []);
      setTotal(data.total || 0);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchClinics(); }, [fetchClinics]);

  async function handleAction(clinicId: number, action: string) {
    setActing(clinicId);
    const res = await fetch("/api/admin/clinics", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clinicId, action }),
    });
    if (res.ok) await fetchClinics();
    setActing(null);
  }

  function handleSearch() { setPage(1); setSearch(searchInput); }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">병원 데이터 관리</h2>
        <span className="text-sm text-gray-500">총 {total}개</span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="병원명 검색..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-56 focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
        <button onClick={handleSearch} className="text-sm px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors">검색</button>
      </div>

      {loading && <p className="text-sm text-gray-400">불러오는 중...</p>}

      {!loading && clinics.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">등록된 병원이 없습니다.</div>
      )}

      <div className="grid gap-4">
        {clinics.map((clinic) => (
          <div key={clinic.id} className={`bg-white rounded-xl shadow-sm border p-5 ${!clinic.is_active ? "border-red-200 bg-red-50/20" : "border-gray-100"}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{clinic.name}</h3>
                  {clinic.is_verified ? (
                    <span className="text-xs bg-blue-100 text-slate-700 px-2 py-0.5 rounded-full">인증됨</span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">미인증</span>
                  )}
                  {!clinic.is_active && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">비활성</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {[clinic.sido_cd_nm, clinic.cl_cd_nm, clinic.phone].filter(Boolean).join(" · ") || "-"}
                </p>
                {clinic.address && <p className="text-xs text-gray-400 mt-1">{clinic.address}</p>}
                <div className="flex gap-3 mt-2 text-xs text-gray-400">
                  {clinic.rating_avg != null && <span>평점: {clinic.rating_avg.toFixed(1)}</span>}
                  {clinic.review_count != null && <span>리뷰: {clinic.review_count}건</span>}
                  <span>최종 수정: {new Date(clinic.updated_at).toLocaleDateString("ko-KR")}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4 shrink-0">
                <button onClick={() => handleAction(clinic.id, clinic.is_verified ? "unverify" : "verify")} disabled={acting === clinic.id} className="text-sm px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50">{clinic.is_verified ? "인증해제" : "인증"}</button>
                <button onClick={() => handleAction(clinic.id, clinic.is_active ? "deactivate" : "activate")} disabled={acting === clinic.id} className={`text-sm px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${clinic.is_active ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}>{clinic.is_active ? "비활성" : "활성화"}</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="text-sm px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors">이전</button>
          <span className="text-sm text-gray-500 px-3 py-1.5">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="text-sm px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors">다음</button>
        </div>
      )}
    </div>
  );
}
