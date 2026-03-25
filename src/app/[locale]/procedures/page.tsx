// 시술 정보 페이지 — 서버 컴포넌트, 곧 오픈 예정 안내
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Procedures — KBBG",
  description: "Explore popular medical and cosmetic procedures available in South Korea.",
};

export default function ProceduresPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-blue-50 to-pink-50 px-4 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-pink-500">
            Coming Soon
          </p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            Procedure Information
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Detailed guides on the most popular procedures in Korea — costs, recovery,
            and what to expect. Launching soon.
          </p>
        </div>
      </section>

      {/* 카테고리 예고 */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">
            Categories we are covering
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              "Plastic Surgery",
              "Dermatology",
              "Dental",
              "Vision Correction",
              "Non-Surgical",
              "Orthopedics",
            ].map((cat) => (
              <div
                key={cat}
                className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-5 text-center text-sm font-medium text-gray-700"
              >
                {cat}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
