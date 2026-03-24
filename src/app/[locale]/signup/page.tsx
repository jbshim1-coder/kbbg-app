"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// 회원가입 페이지 — 이메일 + 소셜 가입
export default function SignupPage() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // 회원가입 핸들러 (TODO: Supabase Auth 연동)
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("회원가입:", email, name);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900">Sign Up</h1>
        <p className="mt-2 text-center text-sm text-gray-500">Join K-Beauty Buyers Guide</p>

        {/* 소셜 가입 버튼 */}
        <div className="mt-6 space-y-3">
          <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
            <span>🔵</span> Continue with Google
          </button>
          <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
            <span>⚫</span> Continue with GitHub
          </button>
        </div>

        {/* 구분선 */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* 이메일 가입 폼 */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8+ characters"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={8}
            />
          </div>

          {/* 약관 동의 */}
          <p className="text-xs text-gray-400">
            By signing up, you agree to our{" "}
            <Link href={`/${locale}/terms`} className="text-blue-500 hover:underline">Terms</Link>{" "}
            and{" "}
            <Link href={`/${locale}/privacy`} className="text-blue-500 hover:underline">Privacy Policy</Link>.
          </p>

          <button
            type="submit"
            className="w-full py-2.5 bg-pink-500 text-white rounded-xl text-sm font-semibold hover:bg-pink-600 transition"
          >
            Create Account
          </button>
        </form>

        {/* 로그인 링크 */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href={`/${locale}/login`} className="text-blue-600 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
