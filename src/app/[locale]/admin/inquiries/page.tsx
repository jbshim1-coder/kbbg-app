"use client";

// 추천 문의 관리 페이지 — Supabase contact_inquiries 테이블 연동 (category: "consultation")
// 문의 목록 조회, 상태 필터, 답변완료/종료 처리

import { useEffect, useState, useCallback } from "react";

// Supabase contact_inquiries 행 구조 (필요한 필드만)
interface InquiryRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country_code: string | null;
  category: string;
  subject: string;
  message: string;
  status: string;
  assigned_to: string | null;
  resolved_at: string | null;
  created_at: string;
}

// 문의 상태별 배지 색상 매핑
const statusStyles: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
};

const statusLabels: Record<string, string> = {
  open: "대기중",
  resolved: "답변완료",
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [acting, setActing] = useState<string | null>(null);
  const limit = 20;

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (filter !== "all") params.set("status", filter);

    const res = await fetch(`/api/admin/inquiries?${params}`);
    if (res.ok) {
      const data = await res.json();
      setInquiries(data.inquiries || []);
      setTotal(data.total || 0);
    }
    setLoading(false);
  }, [page, filter]);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  // 문의 상태 변경 (답변완료/종료/재오픈)
  async function handleAction(inquiryId: string, action: string) {
    setActing(inquiryId);
    const res = await fetch("/api/admin/inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inquiryId, action }),
    });
    if (res.ok) {
      await fetchInquiries();
    }
    setActing(null);
  }

  const pendingCount = inquiries.filter((i) => i.status === "open").length;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">추천 문의 관리</h2>
        <span className="text-sm text-gray-500">총 {total}건</span>
      </div>

      {/* 상태 필터 */}
      <div className="flex gap-1.5">
        {(["all", "open", "resolved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              filter === f
                ? "bg-slate-800 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f === "all" ? "전체" : f === "open" ? "대기중" : "답변완료"}
          </button>
        ))}
      </div>

      {/* 미답변 문의 경고 배너 */}
      {pendingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-5 py-3 text-sm text-yellow-700">
          답변 대기 중인 문의 {pendingCount}건이 있습니다.
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <p className="text-sm text-gray-400">불러오는 중...</p>
      )}

      {/* 데이터 없음 */}
      {!loading && inquiries.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">
          접수된 문의가 없습니다.
        </div>
      )}

      {/* 문의 카드 목록 */}
      <div className="grid gap-4">
        {inquiries.map((inq) => (
          <div
            key={inq.id}
            className={`bg-white rounded-xl shadow-sm border p-5 ${
              inq.status === "open" ? "border-yellow-200" : "border-gray-100"
            }`}
          >
            <div className="flex justify-between items-start">
              {/* 문의 상세 정보 영역 */}
              <div className="flex-1">
                {/* 상단 메타 정보 */}
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="font-medium text-gray-900">{inq.name}</span>
                  <span className="text-xs text-gray-400">{inq.email}</span>
                  {inq.country_code && (
                    <span className="text-xs text-gray-500">{inq.country_code}</span>
                  )}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      statusStyles[inq.status] ?? "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {statusLabels[inq.status] ?? inq.status}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(inq.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </div>

                {/* 문의 제목 */}
                <div className="text-sm text-gray-700 font-medium mb-1">
                  {inq.subject}
                </div>

                {/* 문의 본문 내용 */}
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 whitespace-pre-wrap">
                  {inq.message}
                </p>

                {/* 답변 완료 시각 */}
                {inq.resolved_at && (
                  <p className="text-xs text-gray-400 mt-2">
                    처리 완료: {new Date(inq.resolved_at).toLocaleString("ko-KR")}
                  </p>
                )}
              </div>

              {/* 문의 처리 액션 버튼 */}
              <div className="flex flex-col gap-2 ml-5 shrink-0">
                {inq.status === "open" ? (
                  <>
                    <button
                      onClick={() => handleAction(inq.id, "resolve")}
                      disabled={acting === inq.id}
                      className="text-sm px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                      답변완료
                    </button>
                    <button
                      onClick={() => handleAction(inq.id, "close")}
                      disabled={acting === inq.id}
                      className="text-sm px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      종료
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleAction(inq.id, "reopen")}
                    disabled={acting === inq.id}
                    className="text-sm px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50"
                  >
                    재오픈
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="text-sm px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            이전
          </button>
          <span className="text-sm text-gray-500 px-3 py-1.5">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="text-sm px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
