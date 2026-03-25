// 이용 가이드 페이지 — 서버 컴포넌트, 사이트 사용법 안내
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Use KBBG — User Guide",
  description: "Step-by-step guide to planning your medical trip to South Korea using K-Beauty Buyers Guide.",
};

// 이용 단계 데이터
const STEPS = [
  {
    step: "01",
    title: "Get AI Recommendations",
    desc: "Answer a few questions about your goals and budget. Our AI matches you with the right procedures and clinics.",
  },
  {
    step: "02",
    title: "Browse Clinics & Procedures",
    desc: "Explore our verified directory of Korean clinics. Filter by procedure type, location, and price range.",
  },
  {
    step: "03",
    title: "Read Community Reviews",
    desc: "See real experiences from other medical tourists. Ask questions and get honest answers from the community.",
  },
  {
    step: "04",
    title: "Contact the Clinic",
    desc: "Reach out directly to English-speaking clinic coordinators to schedule consultations and get quotes.",
  },
  {
    step: "05",
    title: "Plan Your Trip",
    desc: "Use our resources on visas, accommodation, and recovery to plan a safe and comfortable stay.",
  },
];

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-blue-50 to-pink-50 px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-pink-500">
            User Guide
          </p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            How to Use KBBG
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to plan a safe, well-informed medical trip to South Korea.
          </p>
        </div>
      </section>

      {/* 단계별 가이드 */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-2xl space-y-8">
          {STEPS.map((item) => (
            <div key={item.step} className="flex gap-5">
              {/* 단계 번호 배지 */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                <span className="text-sm font-bold text-pink-600">{item.step}</span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{item.title}</h2>
                <p className="mt-1 text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 추가 도움말 링크 */}
      <section className="border-t border-gray-100 px-4 py-12 text-center">
        <p className="text-gray-500">
          Still have questions?{" "}
          <a href="../faq" className="text-pink-500 hover:underline font-medium">
            Browse our FAQ
          </a>{" "}
          or{" "}
          <a href="../contact" className="text-pink-500 hover:underline font-medium">
            contact us
          </a>.
        </p>
      </section>
    </main>
  );
}
