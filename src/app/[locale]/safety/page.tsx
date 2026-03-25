// 안전 정보 페이지 — 서버 컴포넌트, 의료관광 안전 수칙
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Safety Information — KBBG",
  description: "Essential safety guidelines for medical tourists visiting South Korea for cosmetic and medical procedures.",
};

// 안전 수칙 데이터
const SAFETY_TIPS = [
  {
    icon: "🔍",
    title: "Verify Your Surgeon",
    desc: "Always confirm your surgeon's license through the Korean Medical Association (kma.org) before booking. Check board certification and years of specialized experience.",
  },
  {
    icon: "📄",
    title: "Get Everything in Writing",
    desc: "Request a written treatment plan, itemized cost breakdown, and post-op care instructions in English. Never proceed based on verbal agreements alone.",
  },
  {
    icon: "🏥",
    title: "Choose Accredited Facilities",
    desc: "Prioritize clinics with JCI accreditation or Korea Institute for Healthcare Accreditation (KOIHA) certification. These meet international safety standards.",
  },
  {
    icon: "✈️",
    title: "Plan Your Flight Home Carefully",
    desc: "Do not fly too soon after surgery. Long flights increase the risk of DVT and swelling. Always get written clearance from your surgeon before boarding.",
  },
  {
    icon: "🛡️",
    title: "Get Medical Travel Insurance",
    desc: "Purchase travel insurance that specifically covers medical tourism complications. Standard travel insurance often excludes elective procedures.",
  },
  {
    icon: "🚫",
    title: "Avoid Package Deal Pressure",
    desc: "Be cautious of deals that pressure you to book immediately or bundle multiple procedures at unusually low prices. Quality care is never rushed.",
  },
  {
    icon: "💊",
    title: "Disclose All Medications",
    desc: "Always tell your surgeon about all medications, supplements, and medical conditions. Drug interactions and underlying conditions can affect surgery safety.",
  },
  {
    icon: "📞",
    title: "Have Emergency Contacts Ready",
    desc: "Save your clinic's 24-hour emergency number, the nearest hospital address, and your country's embassy contact before your procedure.",
  },
];

export default function SafetyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-blue-50 to-pink-50 px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-pink-500">
            Safety First
          </p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            Medical Tourism Safety
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Know the risks, ask the right questions, and protect yourself before, during,
            and after your procedure.
          </p>
        </div>
      </section>

      {/* 안전 수칙 그리드 */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-6">
          {SAFETY_TIPS.map((tip) => (
            <div key={tip.title} className="rounded-2xl border border-gray-100 p-6">
              <p className="text-2xl">{tip.icon}</p>
              <h2 className="mt-3 font-semibold text-gray-900">{tip.title}</h2>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 긴급 연락처 안내 */}
      <section className="border-t border-gray-100 bg-gray-50 px-4 py-12 text-center">
        <h2 className="font-bold text-gray-900">Emergency Resources in Korea</h2>
        <div className="mt-4 flex flex-col sm:flex-row justify-center gap-6 text-sm text-gray-600">
          <span>Emergency: <strong>119</strong></span>
          <span>Police: <strong>112</strong></span>
          <span>Tourist Helpline: <strong>1330</strong></span>
          <span>Medical Dispute Mediation: <strong>1670-2545</strong></span>
        </div>
      </section>
    </main>
  );
}
