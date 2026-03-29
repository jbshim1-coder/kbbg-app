"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

// 제휴 혜택 목록
const BENEFITS = [
  { emoji: "💰", titleKey: "influencer.benefit1_title", descKey: "influencer.benefit1_desc" },
  { emoji: "🏥", titleKey: "influencer.benefit2_title", descKey: "influencer.benefit2_desc" },
  { emoji: "📊", titleKey: "influencer.benefit3_title", descKey: "influencer.benefit3_desc" },
  { emoji: "🌍", titleKey: "influencer.benefit4_title", descKey: "influencer.benefit4_desc" },
];

export default function InfluencerPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params?.locale as string) || "ko";
  const isKo = locale === "ko";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sns, setSns] = useState("");
  const [followers, setFollowers] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Supabase에 저장
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-4xl">🎉</p>
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            {isKo ? "신청이 접수되었습니다!" : "Application Received!"}
          </h2>
          <p className="mt-2 text-gray-500">
            {isKo ? "검토 후 이메일로 연락드리겠습니다." : "We will contact you via email after review."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* 히어로 */}
      <section className="bg-gradient-to-br from-teal-50 to-cyan-50 px-4 py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
            {isKo ? "인플루언서 제휴" : "Influencer Partnership"}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
            {isKo ? "K-Beauty Buyers Guide와 함께하세요" : "Partner with K-Beauty Buyers Guide"}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            {isKo
              ? "뷰티·의료 분야 인플루언서를 모집합니다. 함께 성장하고, 글로벌 팬들에게 한국의 뷰티를 알려주세요."
              : "We are recruiting beauty & medical influencers. Grow together and introduce Korean beauty to global fans."}
          </p>
        </div>
      </section>

      {/* 제휴 혜택 */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {isKo ? "제휴 혜택" : "Partnership Benefits"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BENEFITS.map((b) => (
              <div key={b.titleKey} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
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
      <section className="bg-gray-50 px-4 py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isKo ? "지원 자격" : "Who Can Apply"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <p className="text-2xl mb-2">📱</p>
              <p className="font-semibold text-gray-800">{isKo ? "SNS 팔로워 1,000명 이상" : "1,000+ SNS Followers"}</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <p className="text-2xl mb-2">💄</p>
              <p className="font-semibold text-gray-800">{isKo ? "뷰티·의료 관련 콘텐츠" : "Beauty/Medical Content"}</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <p className="text-2xl mb-2">🌐</p>
              <p className="font-semibold text-gray-800">{isKo ? "한국어 또는 외국어 가능" : "Korean or Other Languages"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 신청 폼 */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-xl">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {isKo ? "제휴 신청" : "Apply Now"}
          </h2>
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isKo ? "이름 / 활동명" : "Name"}</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isKo ? "이메일" : "Email"}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isKo ? "SNS 채널 URL" : "SNS Channel URL"}</label>
              <input type="url" value={sns} onChange={(e) => setSns(e.target.value)} placeholder="https://instagram.com/..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isKo ? "팔로워 수" : "Followers"}</label>
              <input type="text" value={followers} onChange={(e) => setFollowers(e.target.value)} placeholder="e.g. 50,000"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isKo ? "하고 싶은 말" : "Message"}</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
            </div>
            <button type="submit"
              className="w-full py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition">
              {isKo ? "제휴 신청하기" : "Submit Application"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
