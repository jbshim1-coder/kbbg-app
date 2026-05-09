"use client";

import { useState } from "react";

const LABELS = {
  en: {
    heading: "Get Weekly K-Beauty Tips",
    sub: "New clinic deals, procedure guides & trends — delivered free.",
    placeholder: "your@email.com",
    button: "Subscribe",
    loading: "Subscribing...",
    success: "You're in! Check your inbox.",
    duplicate: "Already subscribed!",
    error: "Something went wrong. Try again.",
  },
  ko: {
    heading: "K-뷰티 주간 뉴스레터",
    sub: "클리닉 이벤트, 시술 가이드, 최신 트렌드를 무료로 받아보세요.",
    placeholder: "이메일 주소",
    button: "구독하기",
    loading: "구독 중...",
    success: "구독 완료! 이메일을 확인해 주세요.",
    duplicate: "이미 구독 중입니다!",
    error: "오류가 발생했습니다. 다시 시도해 주세요.",
  },
} as const;

type Locale = keyof typeof LABELS;

export default function NewsletterSignup({ locale = "en" }: { locale?: string }) {
  const l = (LABELS[locale as Locale] ?? LABELS.en);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === "loading") return;
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      const data = await res.json();
      if (data.duplicate) setStatus("duplicate");
      else if (res.ok) { setStatus("success"); setEmail(""); }
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
      <h2 className="text-base font-bold mb-1">{l.heading}</h2>
      <p className="text-xs text-slate-300 mb-4">{l.sub}</p>

      {status === "success" || status === "duplicate" ? (
        <p className="text-sm font-medium text-emerald-400">
          {status === "success" ? l.success : l.duplicate}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={l.placeholder}
            required
            className="flex-1 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-white/30"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="shrink-0 rounded-xl bg-white text-slate-800 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 disabled:opacity-60 transition-colors"
          >
            {status === "loading" ? l.loading : l.button}
          </button>
        </form>
      )}

      {status === "error" && (
        <p className="mt-2 text-xs text-red-400">{l.error}</p>
      )}
    </div>
  );
}
