"use client";

import { useState } from "react";

export default function ConsultationForm({ locale }: { locale: string }) {
  const isKo = locale === "ko";
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
          {isKo ? "상담 신청이 완료되었습니다!" : "Consultation request submitted!"}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {isKo ? "24시간 이내에 이메일로 답변드리겠습니다." : "We will reply via email within 24 hours."}
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
            {isKo ? "성명 *" : "Name *"}
          </label>
          <input name="name" value={form.name} onChange={handleChange} required
            className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-[44px]"
            placeholder={isKo ? "홍길동" : "Your name"} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {isKo ? "이메일 *" : "Email *"}
          </label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required
            className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-[44px]"
            placeholder="email@example.com" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {isKo ? "나이" : "Age"}
          </label>
          <input name="age" type="number" inputMode="numeric" value={form.age} onChange={handleChange}
            className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-[44px]"
            placeholder={isKo ? "30" : "30"} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {isKo ? "한국에서 지역" : "Region in Korea"}
          </label>
          <input name="region" value={form.region} onChange={handleChange}
            className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-[44px]"
            placeholder={isKo ? "서울 강남" : "Seoul Gangnam"} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {isKo ? "국적" : "Nationality"}
          </label>
          <input name="nationality" value={form.nationality} onChange={handleChange}
            className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-[44px]"
            placeholder={isKo ? "대한민국" : "USA"} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {isKo ? "성별" : "Gender"}
          </label>
          <select name="gender" value={form.gender} onChange={handleChange}
            className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-[44px]">
            <option value="">{isKo ? "선택" : "Select"}</option>
            <option value="male">{isKo ? "남성" : "Male"}</option>
            <option value="female">{isKo ? "여성" : "Female"}</option>
            <option value="other">{isKo ? "기타" : "Other"}</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          {isKo ? "원하는 진료" : "Desired Treatment"}
        </label>
        <input name="procedure" value={form.procedure} onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          placeholder={isKo ? "예: 코성형, 피부 레이저, 치아교정" : "e.g. Rhinoplasty, Laser, Orthodontics"} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          {isKo ? "문의사항" : "Message"}
        </label>
        <textarea name="message" value={form.message} onChange={handleChange} rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
          placeholder={isKo ? "궁금한 점을 자유롭게 작성해 주세요" : "Feel free to ask anything"} />
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-3 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-900 disabled:bg-slate-400 transition">
        {loading
          ? (isKo ? "접수 중..." : "Submitting...")
          : (isKo ? "무료 상담 신청 (24시간 이내 답변)" : "Request Free Consultation (Reply within 24h)")}
      </button>
    </form>
  );
}
