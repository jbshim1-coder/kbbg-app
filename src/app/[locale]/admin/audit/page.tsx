"use client";

import { useState, useEffect } from "react";

type AuditLog = {
  id: string;
  admin_email: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/audit")
      .then((r) => r.json())
      .then(({ logs: data }) => setLogs(data || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">감사 로그</h1>
        <p className="text-sm text-gray-500 mt-1">관리자 작업 기록 (최근 50건)</p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">로딩 중...</p>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
          <p className="text-sm text-gray-400">감사 로그가 없습니다.</p>
          <p className="text-xs text-gray-300 mt-1">
            Supabase에서 admin_audit_log 테이블 마이그레이션을 실행해주세요.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">시간</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">관리자</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">액션</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">대상</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">상세</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString("ko-KR")}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{log.admin_email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {log.target_type && <span>{log.target_type}</span>}
                    {log.target_id && <span className="ml-1 text-gray-400">#{log.target_id.slice(0, 8)}</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 max-w-xs truncate">
                    {log.details ? JSON.stringify(log.details) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
