"use client";

// 기능오류 신고 페이지 — PC 전용, 로그인 회원만 사용 가능
// 신고 내용을 contact_inquiries(category: "bug_report")에 저장 + 이메일 알림

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useTranslations } from "next-intl";
import type { User } from "@supabase/supabase-js";

export default function BugReportPage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // 모바일 감지 (lg 기준 1024px)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 로그인 상태 확인
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setAuthLoading(false);
    });
  }, []);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const isValid = message.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || !user) return;
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await (supabase as any)
        .from("contact_inquiries")
        .insert({
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Unknown",
          email: user.email,
          category: "bug_report",
          subject: "Bug Report",
          message,
          status: "open",
        });

      if (dbError) throw dbError;

      // 운영자 이메일 알림
      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: user.user_metadata?.full_name || user.email?.split("@")[0] || "Unknown",
          email: user.email,
          country: "",
          procedure: "Bug Report",
          budget: "",
          visitDate: "",
          message,
        }),
      }).catch(() => {});

      setSubmitted(true);
    } catch {
      setError(t("bug_report.error_msg"));
    } finally {
      setLoading(false);
    }
  }

  // 로딩 중
  if (authLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">{t("ui.loading")}</p>
      </main>
    );
  }

  // 모바일 차단
  if (isMobile) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl mb-4">💻</p>
          <h2 className="text-lg font-bold text-gray-900">
            {t("bug_report.pc_only_title")}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {t("bug_report.pc_only_desc")}
          </p>
        </div>
      </main>
    );
  }

  // 비로그인 → 회원가입 유도
  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl mb-4">🔒</p>
          <h2 className="text-lg font-bold text-gray-900">
            {t("bug_report.login_title")}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {t("bug_report.login_desc")}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => router.push(`/${locale}/login`)}
              className="w-full rounded-xl bg-slate-800 py-3 font-semibold text-white hover:bg-slate-900 transition-colors"
            >
              {t("auth.login")}
            </button>
            <button
              onClick={() => router.push(`/${locale}/signup`)}
              className="w-full rounded-xl border border-gray-200 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t("auth.signup")}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // 제출 완료 화면
  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl mb-4">✅</p>
          <h2 className="text-xl font-bold text-gray-900">
            {t("bug_report.success_title")}
          </h2>
          <p className="mt-3 text-gray-500 text-sm leading-relaxed">
            {t("bug_report.success_desc")}
          </p>
          <button
            onClick={() => router.push(`/${locale}/`)}
            className="mt-6 w-full rounded-xl bg-slate-800 py-3 font-semibold text-white hover:bg-slate-900 transition-colors"
          >
            {t("bug_report.go_home")}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-14">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold text-gray-900">
          {t("bug_report.title")}
        </h1>
        <p className="mt-2 text-gray-500 text-sm">
          {t("bug_report.subtitle")}
        </p>

        {/* 포인트 안내 배너 */}
        <div className="mt-4 rounded-xl bg-slate-50 border border-teal-100 px-4 py-3 text-sm text-slate-700">
          🎁 {t("bug_report.points_banner")}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          {/* 신고 내용 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {t("bug_report.desc_label")}{" "}
              <span className="text-slate-700">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("bug_report.desc_placeholder")}
              rows={7}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-400 resize-none"
            />
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={!isValid || loading}
            className="w-full rounded-xl bg-slate-800 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 hover:bg-slate-900 transition-colors"
          >
            {loading ? t("bug_report.submitting") : t("bug_report.submit_btn")}
          </button>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
        </form>
      </div>
    </main>
  );
}
