"use client";

import { useEffect, useState, useCallback } from "react";

interface Application {
  id: string;
  name: string;
  email: string;
  sns_url: string | null;
  followers: string | null;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at: string | null;
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "대기중",
  approved: "승인",
  rejected: "거절",
};

export default function AdminInfluencersPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const limit = 20;

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filter !== "all") params.set("status", filter);
    const res = await fetch(`/api/admin/influencers?${params}`);
    if (res.ok) {
      const data = await res.json();
      setApplications(data.applications || []);
      setTotal(data.total || 0);
    }
    setLoading(false);
  }, [page, filter]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  async function handleAction(id: string, action: "approve" | "reject" | "pending") {
    setActing(id);
    const res = await fetch("/api/admin/influencers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    if (res.ok) await fetchApplications();
    setActing(null);
  }

  const pendingCount = applications.filter((a) => a.status === "pending").length;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">인플루언서 제휴 신청</h2>
        <span className="text-sm text-gray-500">총 {total}건</span>
      </div>

      <div className="flex gap-1.5">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              filter === f ? "bg-slate-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f === "all" ? "전체" : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      {pendingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-5 py-3 text-sm text-yellow-700">
          검토 대기 중인 신청 {pendingCount}건이 있습니다.
        </div>
      )}

      {loading && <p className="text-sm text-gray-400">불러오는 중...</p>}

      {!loading && applications.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">
          신청 내역이 없습니다.
        </div>
      )}

      <div className="grid gap-4">
        {applications.map((app) => (
          <div
            key={app.id}
            className={`bg-white rounded-xl shadow-sm border p-5 ${
              app.status === "pending" ? "border-yellow-200" : "border-gray-100"
            }`}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="font-semibold text-gray-900">{app.name}</span>
                  <span className="text-xs text-gray-400">{app.email}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[app.status]}`}>
                    {STATUS_LABEL[app.status]}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(app.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm mb-2">
                  {app.sns_url && (
                    <div>
                      <span className="text-gray-400 text-xs">SNS </span>
                      <a href={app.sns_url} target="_blank" rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-xs truncate">
                        {app.sns_url}
                      </a>
                    </div>
                  )}
                  {app.followers && (
                    <div>
                      <span className="text-gray-400 text-xs">팔로워 </span>
                      <span className="text-gray-700 text-xs">{app.followers}</span>
                    </div>
                  )}
                </div>

                {app.message && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 whitespace-pre-wrap">
                    {app.message}
                  </p>
                )}

                {app.reviewed_at && (
                  <p className="text-xs text-gray-400 mt-2">
                    처리: {new Date(app.reviewed_at).toLocaleString("ko-KR")}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                {app.status === "pending" ? (
                  <>
                    <button
                      onClick={() => handleAction(app.id, "approve")}
                      disabled={acting === app.id}
                      className="text-sm px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      승인
                    </button>
                    <button
                      onClick={() => handleAction(app.id, "reject")}
                      disabled={acting === app.id}
                      className="text-sm px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                      거절
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleAction(app.id, "pending")}
                    disabled={acting === app.id}
                    className="text-sm px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 disabled:opacity-50 transition-colors"
                  >
                    재검토
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
            className="text-sm px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50">
            이전
          </button>
          <span className="text-sm text-gray-500 px-3 py-1.5">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="text-sm px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50">
            다음
          </button>
        </div>
      )}
    </div>
  );
}
