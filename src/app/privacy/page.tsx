// 개인정보처리방침 페이지 — 수집 목적, 항목, 제3자 제공, 쿠키, 이용자 권리 안내
import type { Metadata } from "next";

// 페이지 메타데이터 — SEO 및 브라우저 탭 제목 설정
export const metadata: Metadata = {
  title: "개인정보처리방침 — KBBG",
  description: "KBBG 개인정보 수집 및 처리 방침",
};

// PrivacyPage: 개인정보처리방침 전문을 정적으로 렌더링하는 서버 컴포넌트
export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">개인정보처리방침</h1>
        {/* 최종 업데이트 날짜 — 방침 버전 관리용 */}
        <p className="mt-2 text-sm text-gray-400">최종 업데이트: 2025년 1월 1일</p>

        {/* 방침 본문 — 각 항목을 section으로 구분 */}
        <div className="mt-10 space-y-8 text-gray-700 leading-relaxed">

          {/* 1조: 개인정보 수집 및 이용 목적 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">1. 개인정보의 수집 및 이용 목적</h2>
            <p className="mt-3">
              투비스토리(이하 &quot;회사&quot;)는 다음 목적으로 개인정보를 수집·이용합니다:
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li>AI 맞춤 병원 추천 서비스 제공</li>
              <li>커뮤니티 서비스 운영</li>
              <li>문의 및 고객 지원</li>
              <li>서비스 개선을 위한 통계 분석</li>
            </ul>
          </section>

          {/* 2조: 수집 항목과 보유 기간을 테이블로 명시 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">2. 수집하는 개인정보 항목</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left">구분</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">항목</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">보유 기간</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 문의 접수 시 수집 항목 */}
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">문의 접수</td>
                    <td className="border border-gray-200 px-4 py-2">이름, 이메일</td>
                    <td className="border border-gray-200 px-4 py-2">3년</td>
                  </tr>
                  {/* 서비스 이용 시 자동 수집 항목 */}
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">서비스 이용</td>
                    <td className="border border-gray-200 px-4 py-2">IP 주소, 쿠키, 접속 로그</td>
                    <td className="border border-gray-200 px-4 py-2">1년</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 3조: 제3자 제공 원칙 및 예외 사항 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">3. 개인정보의 제3자 제공</h2>
            <p className="mt-3">
              회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
              다만, 법령에 의하거나 수사 목적으로 관계 기관의 요청이 있는 경우는 예외로 합니다.
            </p>
          </section>

          {/* 4조: 쿠키 사용 목적 및 거부 방법 안내 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">4. 쿠키 사용</h2>
            <p className="mt-3">
              서비스는 서비스 개선과 이용자 경험 향상을 위해 쿠키를 사용합니다.
              브라우저 설정을 통해 쿠키 사용을 거부할 수 있으나, 일부 서비스 이용이 제한될 수 있습니다.
            </p>
          </section>

          {/* 5조: 이용자가 행사할 수 있는 권리 목록 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">5. 이용자의 권리</h2>
            <p className="mt-3">이용자는 언제든지 다음 권리를 행사할 수 있습니다:</p>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li>개인정보 열람 요청</li>
              <li>개인정보 수정·삭제 요청</li>
              <li>개인정보 처리 정지 요청</li>
            </ul>
            {/* 권리 행사 연락처 */}
            <p className="mt-3">
              권리 행사는{" "}
              <a href="mailto:help@2bstory.com" className="text-pink-500 hover:underline">
                help@2bstory.com
              </a>
              으로 연락해 주시기 바랍니다.
            </p>
          </section>

          {/* 6조: 개인정보 보호책임자 연락처 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">6. 개인정보 보호책임자</h2>
            <div className="mt-3 rounded-xl bg-gray-50 p-4 text-sm">
              <p>성명: 김민준</p>
              <p>직위: 개인정보 보호책임자</p>
              <p>이메일: privacy@2bstory.com</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
