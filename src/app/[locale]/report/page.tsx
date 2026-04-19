"use client";

// 신고하기 페이지 — 클라이언트 컴포넌트 (폼 상태 관리)
// contact 페이지와 유사한 구조, 신고 특화 필드 포함

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase";
import { useRecaptcha } from "@/lib/useRecaptcha";

// 신고 유형 번역 키 목록
const REPORT_TYPE_KEYS = [
  "report.type1",
  "report.type2",
  "report.type3",
  "report.type4",
  "report.type5",
  "report.type6",
  "report.type7",
] as const;

export default function ReportPage() {
  const t = useTranslations();

  // 폼 필드 상태
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [clinicName, setClinicName] = useState("");

  // 제출 상태
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const { verifyRecaptcha } = useRecaptcha();

  // 필수 필드 유효성 검사
  const isValid = email.trim() && type && description.trim();

  // 폼 제출 — Supabase contact_inquiries 테이블 재사용 (category: "report")
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setError("");

    const isHuman = await verifyRecaptcha("report");
    if (!isHuman) {
      setError("Security verification failed. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await (supabase as any).from("contact_inquiries").insert({
        name: name || "Anonymous",
        email,
        category: "report",
        subject: type,
        message: clinicName ? `[Clinic: ${clinicName}]\n\n${description}` : description,
        status: "open",
      });

      if (dbError) throw dbError;

      // 운영자에게 이메일 알림
      fetch("/api/report-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "Anonymous", email, type, clinicName, description }),
      }).catch(() => {});

      setSubmitted(true);
    } catch {
      setError(t("report.error"));
    } finally {
      setLoading(false);
    }
  }

  // 제출 완료 화면
  if (submitted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">✅</p>
          <h2 className="mt-4 text-xl font-bold text-gray-900">{t("report.success_title")}</h2>
          <p className="mt-2 text-gray-500">
            {t("report.success_desc")}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-14">
      <div className="mx-auto max-w-xl">
        {/* 헤더 */}
        <h1 className="text-3xl font-bold text-gray-900">{t("report.title")}</h1>
        <p className="mt-2 text-gray-500">
          {t("report.subtitle")}
          <br />
          {t("report.email_hint")}{" "}
          <a href="mailto:jbshim1@gmail.com" className="text-slate-700 hover:underline">
            jbshim1@gmail.com
          </a>
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          {/* 신고 유형 선택 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {t("report.type_required")}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-400"
            >
              <option value="">{t("report.type_placeholder")}</option>
              {REPORT_TYPE_KEYS.map((key) => (
                <option key={key} value={t(key as Parameters<typeof t>[0])}>
                  {t(key as Parameters<typeof t>[0])}
                </option>
              ))}
            </select>
          </div>

          {/* 관련 클리닉명 (선택) */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {t("report.clinic_label")}{" "}
              <span className="text-gray-400 font-normal">({t("report.optional")})</span>
            </label>
            <input
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              placeholder={t("report.clinic_placeholder")}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-400"
            />
          </div>

          {/* 상세 설명 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {t("report.desc_required")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("report.desc_placeholder")}
              rows={6}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-400"
            />
          </div>

          {/* 이름 (선택) */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {t("report.name_label")}{" "}
              <span className="text-gray-400 font-normal">({t("report.name_optional")})</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("report.name_placeholder")}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-400"
            />
          </div>

          {/* 이메일 (필수 — 후속 연락용) */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {t("report.email_required")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-400"
            />
            <p className="mt-1 text-xs text-gray-400">
              {t("report.email_note")}
            </p>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={!isValid || loading}
            className="w-full rounded-xl bg-slate-800 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 hover:bg-slate-900 transition-colors"
          >
            {loading ? t("report.submitting") : t("report.submit_btn")}
          </button>

          {/* 에러 메시지 */}
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </form>
      </div>
    </main>
  );
}
