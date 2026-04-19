"use client";

// 회원관리 페이지 — Supabase auth.users 목록 조회 및 차단/정지/삭제 처리
import { useEffect, useState } from "react";

// 관리자 화면에서 사용하는 회원 데이터 구조
interface AdminUser {
  id: string;
  email: string;
  name: string;        // user_metadata.full_name 또는 이메일 앞부분
  provider: string;    // 로그인 방식 (google, email 등)
  createdAt: string;   // 가입일
  lastSignInAt: string | null; // 마지막 로그인
  banned: boolean;     // 현재 차단 상태
}

// 정지 기간 옵션
const SUSPEND_OPTIONS = [
  { label: "1일", value: "24h" },
  { label: "7일", value: "168h" },
  { label: "30일", value: "720h" },
  { label: "영구", value: "permanent" },
] as const;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  // 정지 기간 선택 드롭다운이 열린 사용자 ID
  const [suspendMenuOpen, setSuspendMenuOpen] = useState<string | null>(null);

  // 검색/필터 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">("all");
  const [providerFilter, setProviderFilter] = useState<"all" | "google" | "email">("all");

  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setUsers(data.users || []);
          setError("");
        }
      })
      .catch(() => setError("사용자 목록을 불러오는 중 오류가 발생했습니다."))
      .finally(() => setLoading(false));
  };

  // Supabase auth.users는 service role key가 필요하므로 API 라우트를 통해 조회
  useEffect(() => {
    fetchUsers();
  }, []);

  // 정지/차단 처리 — Supabase ban API 연동
  const handleAction = async (userId: string, action: "suspend" | "ban" | "unban", duration?: string) => {
    const labels: Record<string, string> = { suspend: "정지", ban: "차단", unban: "해제" };
    const label = labels[action];

    if (action === "ban" && !window.confirm(`이 사용자를 영구 차단하시겠습니까?`)) return;
    if (action === "unban" && !window.confirm(`이 사용자의 차단을 해제하시겠습니까?`)) return;

    setActionLoading(userId);
    setSuspendMenuOpen(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, duration }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        alert(`${label} 처리 실패: ${data.error || "알 수 없는 오류"}`);
      } else {
        // 목록 새로고침
        fetchUsers();
      }
    } catch {
      alert(`${label} 처리 중 오류가 발생했습니다.`);
    } finally {
      setActionLoading(null);
    }
  };

  // 회원 삭제 핸들러 — Supabase auth.admin.deleteUser 연동
  const handleDelete = async (userId: string, email: string) => {
    if (!window.confirm(`정말 ${email} 사용자를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;

    setActionLoading(userId);

    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        alert(`삭제 실패: ${data.error || "알 수 없는 오류"}`);
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch {
      alert("삭제 처리 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(null);
    }
  };

  // 클라이언트 사이드 필터 적용
  const filteredUsers = users.filter((user) => {
    // 이메일/이름 검색
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!user.email.toLowerCase().includes(q) && !user.name.toLowerCase().includes(q)) {
        return false;
      }
    }
    // 상태 필터
    if (statusFilter === "active" && user.banned) return false;
    if (statusFilter === "banned" && !user.banned) return false;
    // 로그인 방식 필터
    if (providerFilter !== "all" && user.provider !== providerFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">회원관리</h2>
        {!loading && (
          <span className="text-sm text-gray-500">
            {filteredUsers.length !== users.length
              ? `${filteredUsers.length} / ${users.length}명`
              : `총 ${users.length}명`}
          </span>
        )}
      </div>

      {/* 검색/필터 영역 */}
      {!loading && !error && (
        <div className="flex gap-3 items-center flex-wrap">
          <input
            type="text"
            placeholder="이메일 또는 이름 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-56 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
          <div className="flex gap-1.5">
            {(["all", "active", "banned"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${statusFilter === f ? "bg-slate-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {f === "all" ? "전체" : f === "active" ? "활성" : "차단됨"}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {(["all", "google", "email"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setProviderFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${providerFilter === f ? "bg-slate-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {f === "all" ? "전체" : f === "google" ? "Google" : "이메일"}
              </button>
            ))}
          </div>
        </div>
      )}

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
          {filteredUsers.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-400">
              {users.length === 0 ? "등록된 회원이 없습니다." : "검색 결과가 없습니다."}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">이메일</th>
                  <th className="px-6 py-3 font-medium">이름</th>
                  <th className="px-6 py-3 font-medium">가입일</th>
                  <th className="px-6 py-3 font-medium">최근 로그인</th>
                  <th className="px-6 py-3 font-medium">로그인 방식</th>
                  <th className="px-6 py-3 font-medium">상태</th>
                  <th className="px-6 py-3 font-medium">액션</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-800">{user.email}</td>
                    <td className="px-6 py-3 text-gray-600">{user.name || "-"}</td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {user.lastSignInAt
                        ? new Date(user.lastSignInAt).toLocaleDateString("ko-KR")
                        : "-"}
                    </td>
                    <td className="px-6 py-3">
                      {/* 로그인 방식 배지 */}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        user.provider === "google"
                          ? "bg-blue-100 text-slate-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {user.provider === "google" ? "Google" : "이메일"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {user.banned ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                          차단됨
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600">
                          정상
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {/* 회원 제재 및 삭제 액션 버튼 */}
                      <div className="flex gap-2 relative">
                        {user.banned ? (
                          <button
                            onClick={() => handleAction(user.id, "unban")}
                            disabled={actionLoading === user.id}
                            className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors disabled:opacity-50"
                          >
                            해제
                          </button>
                        ) : (
                          <>
                            {/* 정지 버튼 + 기간 선택 드롭다운 */}
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setSuspendMenuOpen(
                                    suspendMenuOpen === user.id ? null : user.id
                                  )
                                }
                                disabled={actionLoading === user.id}
                                className="text-xs px-2 py-1 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition-colors disabled:opacity-50"
                              >
                                정지
                              </button>
                              {suspendMenuOpen === user.id && (
                                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[100px]">
                                  {SUSPEND_OPTIONS.map((opt) => (
                                    <button
                                      key={opt.value}
                                      onClick={() => {
                                        const action = opt.value === "permanent" ? "ban" : "suspend";
                                        const duration = opt.value === "permanent" ? undefined : opt.value;
                                        handleAction(user.id, action, duration);
                                      }}
                                      className="block w-full text-left text-xs px-3 py-2 hover:bg-gray-50 text-gray-700 first:rounded-t-lg last:rounded-b-lg"
                                    >
                                      {opt.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleAction(user.id, "ban")}
                              disabled={actionLoading === user.id}
                              className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              차단
                            </button>
                          </>
                        )}
                        {/* 마스터 전용 회원 삭제 버튼 */}
                        <button
                          onClick={() => handleDelete(user.id, user.email)}
                          disabled={actionLoading === user.id}
                          className="text-xs px-2 py-1 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors disabled:opacity-50"
                        >
                          삭제
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
