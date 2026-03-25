"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase";

// 회원가입 페이지 — 이메일 + Google 소셜 가입
export default function SignupPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // 회원가입 핸들러 (TODO: Supabase Auth 연동)
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("signup:", email, name);
  };

  // Google OAuth 가입 — Supabase가 Google 인증 페이지로 리다이렉트
  const handleGoogleSignup = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900">{t("auth.signup")}</h1>
        <p className="mt-2 text-center text-sm text-gray-500">{t("auth.join")}</p>

        {/* 소셜 가입 버튼 */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <span>🔵</span> {t("auth.google")}
          </button>
        </div>

        {/* 구분선 */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">{t("auth.or")}</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* 이메일 가입 폼 */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.name")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("auth.name_placeholder")}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.email_placeholder")}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.password_placeholder")}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={8}
            />
          </div>

          {/* 약관 동의 */}
          <p className="text-xs text-gray-400">
            {t("auth.agree_terms")}{" "}
            <Link href={`/${locale}/terms`} className="text-blue-500 hover:underline">{t("auth.terms")}</Link>{" "}
            {t("auth.and")}{" "}
            <Link href={`/${locale}/privacy`} className="text-blue-500 hover:underline">{t("auth.privacy")}</Link>.
          </p>

          <button
            type="submit"
            className="w-full py-2.5 bg-pink-500 text-white rounded-xl text-sm font-semibold hover:bg-pink-600 transition"
          >
            {t("auth.signup_btn")}
          </button>
        </form>

        {/* 로그인 링크 */}
        <p className="mt-6 text-center text-sm text-gray-500">
          {t("auth.has_account")}{" "}
          <Link href={`/${locale}/login`} className="text-blue-600 font-medium hover:underline">
            {t("auth.login")}
          </Link>
        </p>
      </div>
    </main>
  );
}
