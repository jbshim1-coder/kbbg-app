// 병원 찾기 페이지 — 서버 컴포넌트, 곧 오픈 예정 안내
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Hospitals — KBBG",
  description: "Browse verified Korean medical clinics and hospitals for cosmetic and medical procedures.",
};

export default function HospitalsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-blue-50 to-pink-50 px-4 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-pink-500">
            Coming Soon
          </p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            Find Hospitals &amp; Clinics
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            We are building a verified directory of top Korean medical clinics and hospitals.
            Check back soon.
          </p>
        </div>
      </section>

      {/* 예정 기능 미리보기 */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">
            What to expect
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: "🏥", title: "Verified Clinics", desc: "All clinics manually verified for licensing and quality standards." },
              { icon: "⭐", title: "Real Reviews", desc: "Authentic patient reviews from international visitors." },
              { icon: "💬", title: "Direct Contact", desc: "Connect directly with English-speaking clinic coordinators." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-gray-100 p-6 text-center">
                <p className="text-3xl">{item.icon}</p>
                <h3 className="mt-3 font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
