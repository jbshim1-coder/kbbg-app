"use client";

// 기능오류 신고 페이지 — PC 전용, 로그인 회원만 사용 가능
// 신고 내용을 contact_inquiries(category: "bug_report")에 저장 + 이메일 알림

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function BugReportPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const isKo = locale === "ko";

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
      setError(
        isKo
          ? "제출 중 오류가 발생했습니다. 다시 시도해주세요."
          : "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // 로딩 중
  if (authLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">{isKo ? "로딩 중..." : "Loading..."}</p>
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
            {isKo ? "PC에서만 이용 가능합니다" : "Available on PC Only"}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {isKo
              ? "이 기능은 PC에서만 이용 가능합니다. PC 브라우저에서 접속해주세요."
              : "This feature is only available on PC. Please access via a desktop browser."}
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
            {isKo ? "로그인이 필요합니다" : "Login Required"}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {isKo
              ? "기능오류 신고는 회원만 가능합니다. 로그인 또는 회원가입 후 이용해주세요."
              : "Bug reports are available to members only. Please log in or sign up."}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => router.push(`/${locale}/login`)}
              className="w-full rounded-xl bg-teal-600 py-3 font-semibold text-white hover:bg-teal-700 transition-colors"
            >
              {isKo ? "로그인" : "Log In"}
            </button>
            <button
              onClick={() => router.push(`/${locale}/signup`)}
              className="w-full rounded-xl border border-gray-200 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {isKo ? "회원가입" : "Sign Up"}
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
            {isKo ? "신고가 접수되었습니다" : "Report Submitted"}
          </h2>
          <p className="mt-3 text-gray-500 text-sm leading-relaxed">
            {isKo
              ? "관리자 확인 후 100P가 지급됩니다."
              : "After admin review, 100 points will be credited to your account."}
          </p>
          <button
            onClick={() => router.push(`/${locale}/`)}
            className="mt-6 w-full rounded-xl bg-teal-600 py-3 font-semibold text-white hover:bg-teal-700 transition-colors"
          >
            {isKo ? "홈으로" : "Go Home"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-14">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold text-gray-900">
          {isKo ? "기능오류 신고" : "Report a Bug"}
        </h1>
        <p className="mt-2 text-gray-500 text-sm">
          {isKo
            ? "사이트 이용 중 발견한 오류나 불편한 점을 알려주세요. 확인 후 100P를 지급해드립니다."
            : "Let us know about any bugs or issues you've encountered. We'll reward you with 100 points after review."}
        </p>

        {/* 포인트 안내 배너 */}
        <div className="mt-4 rounded-xl bg-teal-50 border border-teal-100 px-4 py-3 text-sm text-teal-700">
          🎁 {isKo ? "신고 채택 시 100P 지급" : "Earn 100P for accepted bug reports"}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          {/* 신고 내용 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {isKo ? "신고 내용" : "Description"}{" "}
              <span className="text-teal-600">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isKo
                  ? "어떤 오류가 발생했는지 구체적으로 설명해주세요. (어떤 페이지에서, 어떤 행동을 했을 때, 어떤 문제가 발생했는지)"
                  : "Please describe the bug in detail. (Which page, what action, what happened)"
              }
              rows={7}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-400 resize-none"
            />
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={!isValid || loading}
            className="w-full rounded-xl bg-teal-600 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-teal-300 hover:bg-teal-700 transition-colors"
          >
            {loading
              ? isKo ? "제출 중..." : "Submitting..."
              : isKo ? "신고 제출" : "Submit Report"}
          </button>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
        </form>
      </div>
    </main>
  );
}
