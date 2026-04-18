"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function ConsultationForm({ locale }: { locale: string }) {
  const t = useTranslations();
  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    region: "",
    nationality: "",
    gender: "",
    procedure: "",
    message: "",
    website_url: "", // 허니팟 필드 — 봇이 채우면 서버에서 거부
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setLoading(true);
    try {
      await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch { /* 실패해도 UI 표시 */ }
    finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <div className="text-center py-6">
        <span className="text-3xl">✅</span>
        <p className="mt-2 text-lg font-bold text-gray-800">
          {t("ui.consult_success")}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {t("ui.consult_reply")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 허니팟: 봇 방지용 숨김 필드. 사람은 이 필드를 보거나 채우지 않음 */}
      <div style={{ display: "none" }} aria-hidden="true">
        <input
          name="website_url"
          value={form.website_url}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {t("ui.consult_name")}
          </label>
          <input name="name" value={form.name} onChange={handleChange} required
            className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-[44px]"
            placeholder="Your name" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {t("ui.consult_email")}
          </label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required
            className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-[44px]"
            placeholder="email@example.com" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {t("ui.consult_age")}
          </label>
          <input name="age" type="number" inputMode="numeric" value={form.age} onChange={handleChange}
            className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-[44px]"
            placeholder="30" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {t("ui.consult_region")}
          </label>
          <input name="region" value={form.region} onChange={handleChange}
            className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-[44px]"
            placeholder="Seoul Gangnam" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {t("ui.consult_nationality")}
          </label>
          <input name="nationality" value={form.nationality} onChange={handleChange}
            className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-[44px]"
            placeholder="USA" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {t("ui.consult_gender")}
          </label>
          <select name="gender" value={form.gender} onChange={handleChange}
            className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-[44px]">
            <option value="">{t("ui.consult_select")}</option>
            <option value="male">{t("ui.consult_male")}</option>
            <option value="female">{t("ui.consult_female")}</option>
            <option value="other">{t("ui.consult_other")}</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          {t("ui.consult_treatment")}
        </label>
        <input name="procedure" value={form.procedure} onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          placeholder="e.g. Rhinoplasty, Laser, Orthodontics" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          {t("ui.consult_message")}
        </label>
        <textarea name="message" value={form.message} onChange={handleChange} rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
          placeholder="Feel free to ask anything" />
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-3 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-900 disabled:bg-slate-400 transition">
        {loading ? t("ui.consult_submitting") : t("ui.consult_submit")}
      </button>
    </form>
  );
}
