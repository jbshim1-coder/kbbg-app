"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

// 제휴 혜택 목록
const BENEFITS = [
  { emoji: "💰", titleKey: "influencer.benefit1_title", descKey: "influencer.benefit1_desc" },
  { emoji: "🏥", titleKey: "influencer.benefit2_title", descKey: "influencer.benefit2_desc" },
  { emoji: "📊", titleKey: "influencer.benefit3_title", descKey: "influencer.benefit3_desc" },
  { emoji: "🌍", titleKey: "influencer.benefit4_title", descKey: "influencer.benefit4_desc" },
];

export default function InfluencerPage() {
  const t = useTranslations();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sns, setSns] = useState("");
  const [followers, setFollowers] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    setError("");

    try {
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await (supabase as any)
        .from("influencer_applications")
        .insert({
          name,
          email,
          sns_url: sns,
          followers,
          message,
          status: "pending",
        });

      if (dbError) throw dbError;
      setSubmitted(true);
    } catch {
      setError(t("influencer.error_msg"));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="max-w-md bg-white rounded-2xl shadow-sm border border-stone-100 p-8 text-center">
          <p className="text-4xl">🎉</p>
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            {t("influencer.success_title")}
          </h2>
          <p className="mt-2 text-gray-500">
            {t("influencer.success_desc")}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* 히어로 */}
      <section className="bg-gradient-to-br from-slate-50 to-gray-100 px-4 py-8 sm:py-12 lg:py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-700">
            {t("influencer.partnership_label")}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
            {t("influencer.hero_title")}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            {t("influencer.hero_desc")}
          </p>
        </div>
      </section>

      {/* 제휴 혜택 */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {t("influencer.benefits_title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BENEFITS.map((b) => (
              <div key={b.titleKey} className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                <span className="text-3xl">{b.emoji}</span>
                <h3 className="mt-3 font-semibold text-gray-800">
                  {t(b.titleKey as Parameters<typeof t>[0])}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t(b.descKey as Parameters<typeof t>[0])}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 지원 자격 */}
      <section className="bg-stone-50 px-4 py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t("influencer.who_can_apply")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="bg-white rounded-xl p-5 border border-stone-100">
              <p className="text-2xl mb-2">📱</p>
              <p className="font-semibold text-gray-800">{t("influencer.qualify1")}</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-stone-100">
              <p className="text-2xl mb-2">💄</p>
              <p className="font-semibold text-gray-800">{t("influencer.qualify2")}</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-stone-100">
              <p className="text-2xl mb-2">🌐</p>
              <p className="font-semibold text-gray-800">{t("influencer.qualify3")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 신청 폼 */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-xl">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {t("influencer.apply_title")}
          </h2>
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("influencer.form_name")}</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("influencer.form_email")}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("influencer.form_sns")}</label>
              <input type="url" value={sns} onChange={(e) => setSns(e.target.value)} placeholder="https://instagram.com/..."
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("influencer.form_followers")}</label>
              <input type="text" value={followers} onChange={(e) => setFollowers(e.target.value)} placeholder="e.g. 50,000"
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("influencer.form_message")}</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-900 disabled:bg-slate-300 transition">
              {loading ? t("influencer.submitting") : t("influencer.submit_btn")}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
