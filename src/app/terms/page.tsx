// 이용약관 페이지 — 서비스 이용 조건, 사용자 권리·의무, 면책 및 분쟁 해결 조항 안내
import type { Metadata } from "next";

// 페이지 메타데이터 — SEO 및 브라우저 탭 제목 설정
export const metadata: Metadata = {
  title: "이용약관 — KBBG",
  description: "KBBG 서비스 이용약관",
};

// TermsPage: 이용약관 전문을 정적으로 렌더링하는 서버 컴포넌트
export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">이용약관</h1>
        {/* 최종 업데이트 날짜 — 약관 버전 관리용 */}
        <p className="mt-2 text-sm text-gray-400">최종 업데이트: 2025년 1월 1일</p>

        {/* 약관 본문 — 각 조항을 section으로 구분하여 가독성 확보 */}
        <div className="mt-10 space-y-8 text-gray-700 leading-relaxed">

          {/* 제1조: 약관 목적 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">제1조 (목적)</h2>
            <p className="mt-3">
              이 약관은 투비스토리(이하 &quot;회사&quot;)가 운영하는 KBBG 서비스(이하 &quot;서비스&quot;)의
              이용 조건 및 절차, 회사와 이용자의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          {/* 제2조: 주요 용어 정의 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">제2조 (정의)</h2>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li>&quot;서비스&quot;란 회사가 제공하는 한국 뷰티 클리닉 정보 제공 및 AI 추천 서비스를 의미합니다.</li>
              <li>&quot;이용자&quot;란 이 약관에 따라 회사가 제공하는 서비스를 이용하는 모든 자를 의미합니다.</li>
              <li>&quot;콘텐츠&quot;란 이용자가 서비스 내에 게시한 게시물, 댓글, 이미지 등 모든 정보를 의미합니다.</li>
            </ul>
          </section>

          {/* 제3조: 약관 효력 및 변경 절차 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">제3조 (약관의 효력 및 변경)</h2>
            <p className="mt-3">
              이 약관은 서비스 초기 화면에 게시하여 효력을 발생합니다. 회사는 합리적인 사유가 있는 경우
              약관을 변경할 수 있으며, 변경된 약관은 7일 전에 공지합니다.
            </p>
          </section>

          {/* 제4조: 제공 서비스 목록 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">제4조 (서비스의 제공 및 변경)</h2>
            <p className="mt-3">
              회사는 다음과 같은 서비스를 제공합니다:
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li>한국 뷰티 클리닉 정보 제공</li>
              <li>AI 기반 병원 맞춤 추천</li>
              <li>커뮤니티 서비스 (게시글, 댓글)</li>
              <li>기타 회사가 정하는 서비스</li>
            </ul>
          </section>

          {/* 제5조: 이용자 금지 행위 목록 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">제5조 (이용자의 의무)</h2>
            <p className="mt-3">이용자는 다음 행위를 하여서는 안 됩니다:</p>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li>타인의 개인정보를 무단으로 수집하거나 이용하는 행위</li>
              <li>서비스의 안정적 운영을 방해하는 행위</li>
              <li>허위 정보를 게시하거나 타인을 기만하는 행위</li>
              <li>저작권 등 지식재산권을 침해하는 행위</li>
            </ul>
          </section>

          {/* 제6조: 의료 정보 면책 — 병원 정보 정확성 보증 불가 명시 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">제6조 (면책조항)</h2>
            <p className="mt-3">
              회사는 서비스에 게시된 병원 정보의 정확성을 위해 노력하나, 이를 보증하지는 않습니다.
              의료 시술 결정은 반드시 전문의와 상담 후 결정하시기 바랍니다.
            </p>
          </section>

          {/* 제7조: 분쟁 해결 — 준거법 및 관할 법원 지정 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">제7조 (분쟁 해결)</h2>
            <p className="mt-3">
              서비스 이용과 관련하여 발생한 분쟁은 대한민국 법령에 따르며,
              관할 법원은 서울중앙지방법원으로 합니다.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
