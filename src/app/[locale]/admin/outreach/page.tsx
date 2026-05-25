"use client";

// 인플루언서 아웃리치 관리 페이지
import { useEffect, useState, useCallback } from "react";

interface Prospect {
  id: string;
  name: string;
  email: string;
  platform: string;
  country_code: string;
  language: string;
  status: string;
  email_subject: string | null;
  source_url: string | null;
  email_sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  found:        { label: "발견됨",    color: "bg-gray-100 text-gray-700" },
  emailed:      { label: "발송됨",    color: "bg-blue-100 text-blue-700" },
  opened:       { label: "열어봄",    color: "bg-yellow-100 text-yellow-700" },
  clicked:      { label: "클릭함",    color: "bg-orange-100 text-orange-700" },
  replied:      { label: "답장함",    color: "bg-green-100 text-green-700" },
  bounced:      { label: "반송됨",    color: "bg-red-100 text-red-700" },
  unsubscribed: { label: "수신거부",  color: "bg-purple-100 text-purple-700" },
};

const FLAG: Record<string, string> = {
  JP:"🇯🇵", TH:"🇹🇭", VN:"🇻🇳", CN:"🇨🇳", US:"🇺🇸", GB:"🇬🇧",
  AU:"🇦🇺", PH:"🇵🇭", ID:"🇮🇩", MY:"🇲🇾", SG:"🇸🇬", FR:"🇫🇷",
  DE:"🇩🇪", BR:"🇧🇷", MX:"🇲🇽", RU:"🇷🇺",
};

export default function OutreachPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [countries, setCountries] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCountry, setFilterCountry] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (filterStatus !== "all") params.set("status", filterStatus);
    if (filterCountry) params.set("country", filterCountry);

    const res = await fetch(`/api/admin/outreach?${params}`);
    const json = await res.json();
    setProspects(json.prospects || []);
    setTotal(json.total || 0);
    setStats(json.stats || {});
    setCountries(json.countries || []);
    setLoading(false);
  }, [filterStatus, filterCountry, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleDelete(id: string, email: string) {
    if (!confirm(`${email} 삭제하시겠습니까?`)) return;
    await fetch(`/api/admin/outreach?id=${id}`, { method: "DELETE" });
    fetchData();
  }

  const totalFound = stats.found || 0;
  const totalEmailed = (stats.emailed || 0) + (stats.opened || 0) + (stats.clicked || 0) + (stats.replied || 0);
  const openRate = totalEmailed > 0
    ? Math.round(((stats.opened || 0) + (stats.clicked || 0) + (stats.replied || 0)) / totalEmailed * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">인플루언서 아웃리치</h1>
        <p className="text-sm text-gray-500 mt-1">전 세계 뷰티 인플루언서에게 무료시술 협업 제안 이메일 발송</p>
      </div>

      {/* 사용 안내 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 space-y-1">
        <p className="font-semibold">사용 방법 (서버에서 실행)</p>
        <p>① 이메일 수집: <code className="bg-blue-100 px-1 rounded">node scripts/find-influencers.mjs [JP/TH/US...]</code></p>
        <p>② 이메일 발송: <code className="bg-blue-100 px-1 rounded">node scripts/send-outreach.mjs [최대발송수]</code></p>
        <p className="text-blue-600">※ 실행 전 .env.local에 GOOGLE_SEARCH_API_KEY, GOOGLE_SEARCH_CX 추가 필요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { key: "found",    label: "발견됨",   value: stats.found || 0,    color: "text-gray-700" },
          { key: "emailed",  label: "발송됨",   value: totalEmailed,         color: "text-blue-700" },
          { key: "opened",   label: "열어봄",   value: stats.opened || 0,   color: "text-yellow-700" },
          { key: "clicked",  label: "클릭함",   value: stats.clicked || 0,  color: "text-orange-700" },
          { key: "replied",  label: "답장함",   value: stats.replied || 0,  color: "text-green-700" },
        ].map(s => (
          <div key={s.key} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {openRate > 0 && (
        <p className="text-sm text-gray-500">
          오픈율 <span className="font-semibold text-gray-700">{openRate}%</span>
          &nbsp;· 전체 <span className="font-semibold">{Object.values(stats).reduce((a, b) => a + b, 0)}</span>명
          &nbsp;· 반송 <span className="font-semibold text-red-600">{stats.bounced || 0}</span>건
        </p>
      )}

      {/* 필터 */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">전체 상태</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        <select
          value={filterCountry}
          onChange={e => { setFilterCountry(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">전체 국가</option>
          {countries.map(c => (
            <option key={c} value={c}>{FLAG[c] || ""} {c}</option>
          ))}
        </select>

        <button
          onClick={fetchData}
          className="ml-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded-lg transition-colors"
        >
          새로고침
        </button>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">총 {total}명</p>
          {loading && <span className="text-xs text-gray-400">로딩 중...</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 text-left">이름/이메일</th>
                <th className="px-4 py-3 text-left">국가</th>
                <th className="px-4 py-3 text-left">플랫폼</th>
                <th className="px-4 py-3 text-left">상태</th>
                <th className="px-4 py-3 text-left">발송일</th>
                <th className="px-4 py-3 text-left">제목</th>
                <th className="px-4 py-3 text-left">출처</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {prospects.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    {loading ? "로딩 중..." : "데이터 없음 — 서버에서 find-influencers.mjs 실행 후 확인하세요"}
                  </td>
                </tr>
              )}
              {prospects.map(p => {
                const s = STATUS_LABELS[p.status] || { label: p.status, color: "bg-gray-100 text-gray-600" };
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 truncate max-w-[160px]">{p.name || "—"}</p>
                      <p className="text-gray-500 text-xs truncate max-w-[160px]">{p.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span>{FLAG[p.country_code] || ""} {p.country_code || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{p.platform || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
                        {s.label}
                      </span>
                      {p.opened_at && (
                        <p className="text-xs text-gray-400 mt-0.5">열람: {new Date(p.opened_at).toLocaleDateString("ko")}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {p.email_sent_at ? new Date(p.email_sent_at).toLocaleDateString("ko") : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                      <p className="truncate text-xs">{p.email_subject || "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      {p.source_url ? (
                        <a
                          href={p.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline text-xs"
                        >
                          링크
                        </a>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(p.id, p.email)}
                        className="text-red-400 hover:text-red-600 text-xs transition-colors"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {total > 50 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40"
            >
              이전
            </button>
            <span className="text-sm text-gray-500">{page} / {Math.ceil(total / 50)}</span>
            <button
              disabled={page >= Math.ceil(total / 50)}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
