"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useTranslations } from "next-intl";

// 문의 유형 키 목록
const INQUIRY_TYPE_KEYS = [
  "contact.type_clinic",
  "contact.type_partnership",
  "contact.type_bug",
  "contact.type_privacy",
  "contact.type_other",
];

// 문의 폼 페이지 — 클라이언트 컴포넌트 (폼 상태 관리 필요)
export default function ContactPage() {
  const t = useTranslations();

  // 폼 필드 상태
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  // 제출 완료 여부 — true 시 감사 메시지 표시
  const [submitted, setSubmitted] = useState(false);

  // 필수 필드 모두 입력된 경우에만 제출 버튼 활성화
  const isValid = name.trim() && email.trim() && type && message.trim();

  // 제출 중 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 폼 제출 처리 — Supabase contact_inquiries 테이블에 저장
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await (supabase as any).from("contact_inquiries").insert({
        name,
        email,
        category: type,
        subject: type,
        message,
        status: "open",
      });

      if (dbError) throw dbError;
      setSubmitted(true);
    } catch {
      setError(t("contact.error"));
    } finally {
      setLoading(false);
    }
  }

  // 제출 완료 후 감사 메시지 화면
  if (submitted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">✅</p>
          <h2 className="mt-4 text-xl font-bold text-gray-900">{t("contact.success_title")}</h2>
          <p className="mt-2 text-gray-500">
            {t("contact.success_desc")}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-14">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold text-gray-900">{t("contact.title")}</h1>
        <p className="mt-2 text-gray-500">
          {t("contact.subtitle")}
          <br />
          {t("contact.email_label")}{" "}
          <a href="mailto:help@2bstory.com" className="text-pink-500 hover:underline">
            help@2bstory.com
          </a>
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          {/* 이름 입력 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {t("contact.name")} <span className="text-pink-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("contact.name_placeholder")}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-400"
            />
          </div>

          {/* 이메일 입력 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {t("contact.email")} <span className="text-pink-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("contact.email_placeholder")}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-400"
            />
          </div>

          {/* 문의 유형 선택 드롭다운 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {t("contact.type")} <span className="text-pink-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-400"
            >
              <option value="">{t("contact.type_placeholder")}</option>
              {INQUIRY_TYPE_KEYS.map((key) => (
                <option key={key} value={t(key as Parameters<typeof t>[0])}>
                  {t(key as Parameters<typeof t>[0])}
                </option>
              ))}
            </select>
          </div>

          {/* 메시지 본문 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {t("contact.message")} <span className="text-pink-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("contact.message_placeholder")}
              rows={6}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-400"
            />
          </div>

          {/* 제출 버튼 — 유효성 검사 통과 전 비활성화 */}
          <button
            type="submit"
            disabled={!isValid}
            className="w-full rounded-xl bg-pink-500 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-pink-200 hover:bg-pink-600"
          >
            {loading ? t("contact.sending") : t("contact.submit")}
          </button>
          {/* 에러 메시지 표시 */}
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </form>
      </div>
    </main>
  );
}
