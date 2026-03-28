"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase";

// 랜덤 캡차 숫자 생성 (1~9)
function generateCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b };
}

// 회원가입 페이지 — 이메일 + Google 소셜 가입
export default function SignupPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const isKo = locale === "ko";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [captcha] = useState(generateCaptcha);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [errors, setErrors] = useState<{ confirmPassword?: string; captcha?: string }>({});

  // 유효성 검사 후 가입 처리
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    if (password !== confirmPassword) {
      newErrors.confirmPassword = t("auth.password_mismatch");
    }

    if (parseInt(captchaAnswer, 10) !== captcha.a + captcha.b) {
      newErrors.captcha = t("auth.captcha_error");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
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
            className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            {t("auth.google")}
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

          {/* 비밀번호 확인 필드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.confirm_password")}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              placeholder={t("auth.confirm_password_placeholder")}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? "border-red-400" : "border-gray-200"
              }`}
              required
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          {/* 수학 캡차 — 봇 방지 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("auth.captcha_label")}: {captcha.a} + {captcha.b} = ?
            </label>
            <input
              type="number"
              value={captchaAnswer}
              onChange={(e) => {
                setCaptchaAnswer(e.target.value);
                if (errors.captcha) setErrors((prev) => ({ ...prev, captcha: undefined }));
              }}
              placeholder={t("auth.captcha_placeholder")}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.captcha ? "border-red-400" : "border-gray-200"
              }`}
              required
            />
            {errors.captcha && (
              <p className="mt-1 text-xs text-red-500">{errors.captcha}</p>
            )}
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
