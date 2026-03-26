"use client";

// 회원관리 페이지 — Supabase auth.users 목록 조회 및 차단/정지 처리
import { useEffect, useState } from "react";

// 관리자 화면에서 사용하는 회원 데이터 구조
interface AdminUser {
  id: string;
  email: string;
  name: string;        // user_metadata.full_name 또는 이메일 앞부분
  provider: string;    // 로그인 방식 (google, email 등)
  createdAt: string;   // 가입일
}

// 회원 상태 배지 색상
const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  suspended: "bg-yellow-100 text-yellow-700",
  banned: "bg-red-100 text-red-600",
} as const;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Supabase auth.users는 service role key가 필요하므로 API 라우트를 통해 조회
  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setUsers(data.users || []);
        }
      })
      .catch(() => setError("사용자 목록을 불러오는 중 오류가 발생했습니다."))
      .finally(() => setLoading(false));
  }, []);

  // 차단/정지 버튼 — 현재는 UI만 구현 (Supabase ban API 연동 가능)
  const handleAction = (userId: string, action: "suspend" | "ban") => {
    const label = action === "suspend" ? "정지" : "차단";
    alert(`사용자 ${userId}를 ${label} 처리합니다. (Supabase 연동 후 실제 적용)`);
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">회원관리</h2>
        {!loading && (
          <span className="text-sm text-gray-500">총 {users.length}명</span>
        )}
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-sm text-gray-400">회원 목록을 불러오는 중...</p>
        </div>
      )}

      {/* 오류 상태 */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-5">
          <p className="text-sm text-red-600">{error}</p>
          <p className="text-xs text-red-400 mt-1">
            SUPABASE_SERVICE_ROLE_KEY 환경변수 설정 여부를 확인하세요.
          </p>
        </div>
      )}

      {/* 회원 목록 테이블 */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {users.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-400">
              등록된 회원이 없습니다.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">이메일</th>
                  <th className="px-6 py-3 font-medium">이름</th>
                  <th className="px-6 py-3 font-medium">가입일</th>
                  <th className="px-6 py-3 font-medium">로그인 방식</th>
                  <th className="px-6 py-3 font-medium">액션</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-800">{user.email}</td>
                    <td className="px-6 py-3 text-gray-600">{user.name || "-"}</td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-6 py-3">
                      {/* 로그인 방식 배지 */}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        user.provider === "google"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {user.provider === "google" ? "Google" : "이메일"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {/* 회원 제재 액션 버튼 */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(user.id, "suspend")}
                          className="text-xs px-2 py-1 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition-colors"
                        >
                          정지
                        </button>
                        <button
                          onClick={() => handleAction(user.id, "ban")}
                          className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                        >
                          차단
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
