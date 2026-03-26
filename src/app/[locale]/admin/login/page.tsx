"use client";

// 관리자 로그인 페이지 — ID/PW 입력 후 localStorage 토큰 발급
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { loginAdmin } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "ko";

  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 로그인 폼 제출 핸들러 — 자격증명 검증 후 대시보드로 이동
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const success = loginAdmin(id, pw);
    if (success) {
      // 로그인 성공 → 관리자 대시보드로 이동
      router.push(`/${locale}/admin`);
    } else {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* 헤더 — 서비스명과 로그인 안내 */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-gray-900">KBBG 관리자</h1>
          <p className="text-sm text-gray-500 mt-1">관리자 계정으로 로그인하세요</p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              관리자 ID
            </label>
            <input
              type="email"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="admin@2bstory.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoComplete="current-password"
            />
          </div>

          {/* 오류 메시지 — 자격증명 불일치 시 표시 */}
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:bg-gray-400 transition"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </main>
  );
}
