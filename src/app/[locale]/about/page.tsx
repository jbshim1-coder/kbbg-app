import Link from "next/link";
import type { Metadata } from "next";

// SEO 메타데이터 — E-E-A-T 강화를 위해 구체적 설명 작성
export const metadata: Metadata = {
  title: "About Us — KBBG by 2bStory",
  description: "2008년부터 500여개 병원과 함께한 한국 뷰티 마케팅 전문기업 투비스토리를 소개합니다.",
};

// 서비스 핵심 지표 — 신뢰 배지용 숫자 데이터
const STATS = [
  { value: "2008", label: "설립년도" },
  { value: "500+", label: "파트너 병원" },
  { value: "7개국", label: "언어 서비스" },
  { value: "15년+", label: "업계 경험" },
];


// About 페이지 — 서버 컴포넌트 (인터랙션 없음)
// E-E-A-T(경험·전문성·권위·신뢰) 4가지 항목을 섹션별로 명시
export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-blue-50 to-pink-50 px-4 py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-pink-500">About Us</p>
          <h1 className="mt-2 text-4xl font-bold text-gray-900">
            한국 뷰티 의료의 신뢰할 수 있는 파트너
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            투비스토리(2bStory)는 2008년부터 한국의 우수한 의료기관과 전 세계 고객을 연결해 온
            의료관광 전문 기업입니다.
          </p>
        </div>
      </section>

      {/* 핵심 지표 배지 — 숫자로 신뢰도 표현 */}
      <section className="border-y border-gray-100 px-4 py-8">
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black text-pink-500">{s.value}</p>
              <p className="mt-1 text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* E-E-A-T 섹션 — 검색 엔진 신뢰도 강화 */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-3xl space-y-8">
          {/* 미션 */}
          <div>
            <h2 className="text-xl font-bold text-gray-900">우리의 미션</h2>
            <p className="mt-3 leading-relaxed text-gray-600">
              KBBG(Korean Beauty &amp; Clinic Guide)는 외국인 환자가 한국에서 안전하고 만족스러운
              의료·미용 서비스를 받을 수 있도록 검증된 정보와 AI 기반 맞춤 추천을 제공합니다.
              언어 장벽과 정보 비대칭을 해소하는 것이 우리의 핵심 가치입니다.
            </p>
          </div>

          {/* 전문성 (Expertise) */}
          <div>
            <h2 className="text-xl font-bold text-gray-900">전문성 (Expertise)</h2>
            <p className="mt-3 leading-relaxed text-gray-600">
              투비스토리는 2008년부터 500여개 병원의 마케팅을 대행하며 한국 의료 시장을 깊이
              이해하고 있습니다. 의학 전문 콘텐츠 팀이 모든 정보를 검수하며, 실제 시술 경험자의
              리뷰와 의료 전문가의 의견을 반영합니다.
            </p>
          </div>

          {/* 권위성 (Authoritativeness) */}
          <div>
            <h2 className="text-xl font-bold text-gray-900">권위성 (Authoritativeness)</h2>
            <p className="mt-3 leading-relaxed text-gray-600">
              한국관광공사 의료관광 인증 파트너이며, 주요 병원협회와 MOU를 체결하여
              신뢰할 수 있는 정보를 제공합니다. 7개국 언어로 운영되며 연간 10만명 이상의
              외국인 환자를 지원합니다.
            </p>
          </div>

          {/* 신뢰성 (Trustworthiness) */}
          <div>
            <h2 className="text-xl font-bold text-gray-900">신뢰성 (Trustworthiness)</h2>
            <p className="mt-3 leading-relaxed text-gray-600">
              광고 표시를 명확히 하고, 후원 콘텐츠와 편집 콘텐츠를 구분합니다.
              병원 정보는 최소 분기 1회 업데이트하며, 사용자 리뷰의 진위를 직접 확인합니다.
              개인정보는 GDPR 및 한국 개인정보보호법을 준수하여 처리합니다.
            </p>
          </div>
        </div>
      </section>

      {/* 파트너십 CTA */}
      <section className="px-4 py-14 text-center">
        <h2 className="text-xl font-bold text-gray-900">병원 파트너십 문의</h2>
        <p className="mt-2 text-gray-500">병원 등록 및 마케팅 협력에 관심 있으신가요?</p>
        <Link
          href="/contact"
          className="mt-6 inline-block rounded-xl bg-pink-500 px-8 py-3 font-semibold text-white hover:bg-pink-600"
        >
          문의하기
        </Link>
      </section>
    </main>
  );
}
