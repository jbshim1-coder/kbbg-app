"use client";

// 기능오류 신고 관리 페이지 — category="bug_report"인 contact_inquiries 목록
// 각 신고에 "100P 지급" 버튼 → 상태를 "resolved"로 변경

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface BugReport {
  id: number;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
}

// 상태별 배지 스타일
const statusStyle: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
};

const statusLabel = (status: string, isKo: boolean) => {
  if (status === "resolved") return isKo ? "처리완료" : "Resolved";
  return isKo ? "대기중" : "Open";
};

export default function AdminBugReportsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "ko";
  const isKo = locale === "ko";

  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<number | null>(null);

  // 서버 인증 API를 통해 bug_report 목록 조회
  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/admin/bug-reports");
        if (res.ok) {
          const json = await res.json();
          setReports(json.reports || []);
        }
      } catch {
        // 네트워크 에러 무시
      }
      setLoading(false);
    }

    fetchReports();
  }, []);

  // 100P 지급 버튼 — 서버 API를 통해 상태를 "resolved"로 변경
  async function handleResolve(id: number) {
    setResolving(id);
    try {
      const res = await fetch("/api/admin/bug-reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: "resolved" } : r))
        );
      }
    } catch {
      // 네트워크 ���러 무시
    }
    setResolving(null);
  }

  const openCount = reports.filter((r) => r.status === "open").length;

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {isKo ? "기능오류 신고 관리" : "Bug Report Management"}
        </h2>
        <span className="text-sm text-gray-500">
          {isKo ? `총 ${reports.length}건` : `Total: ${reports.length}`}
        </span>
      </div>

      {/* 미처리 신고 경고 배너 */}
      {openCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-5 py-3 text-sm text-yellow-700">
          {isKo
            ? `처리 대기 중인 신고 ${openCount}건이 있습니다.`
            : `${openCount} report(s) pending review.`}
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <p className="text-sm text-gray-400">
          {isKo ? "불러오는 중..." : "Loading..."}
        </p>
      )}

      {/* 데이터 없음 */}
      {!loading && reports.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">
          {isKo ? "접수된 신고가 없습니다." : "No bug reports found."}
        </div>
      )}

      {/* 신고 목록 */}
      <div className="grid gap-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className={`bg-white rounded-xl shadow-sm border p-5 ${
              report.status === "open" ? "border-yellow-200" : "border-gray-100"
            }`}
          >
            <div className="flex justify-between items-start gap-4">
              {/* 신고 상세 정보 */}
              <div className="flex-1 min-w-0">
                {/* 메타 정보 */}
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="font-medium text-gray-900 text-sm">
                    {report.name}
                  </span>
                  <span className="text-xs text-gray-400">{report.email}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      statusStyle[report.status] ?? "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {statusLabel(report.status, isKo)}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {report.created_at
                      ? new Date(report.created_at).toLocaleDateString(
                          isKo ? "ko-KR" : "en-US"
                        )
                      : "-"}
                  </span>
                </div>

                {/* 신고 내용 */}
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 whitespace-pre-wrap">
                  {report.message}
                </p>
              </div>

              {/* 액션 버튼 */}
              <div className="shrink-0">
                {report.status === "open" ? (
                  <button
                    onClick={() => handleResolve(report.id)}
                    disabled={resolving === report.id}
                    className="text-sm px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg hover:bg-teal-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {resolving === report.id
                      ? isKo ? "처리 중..." : "Processing..."
                      : isKo ? "100P 지급" : "Grant 100P"}
                  </button>
                ) : (
                  <span className="text-xs text-gray-400 px-3 py-1.5">
                    {isKo ? "완료" : "Done"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
