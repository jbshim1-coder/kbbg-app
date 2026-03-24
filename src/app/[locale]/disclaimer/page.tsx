import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "면책조항 — KBBG",
  description: "KBBG 서비스 면책조항",
};

// 면책조항 페이지 — 의료 정보 제공의 한계와 법적 책임 범위를 명시
export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">면책조항</h1>
        <p className="mt-2 text-sm text-gray-400">최종 업데이트: 2025년 1월 1일</p>

        {/* 중요 경고 배너 */}
        <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm font-semibold text-yellow-800">
            ⚠️ 중요: 이 서비스의 정보는 의학적 조언을 대체하지 않습니다.
            모든 의료 시술 결정은 반드시 자격을 갖춘 의료 전문가와 상담 후 진행하시기 바랍니다.
          </p>
        </div>

        <div className="mt-10 space-y-8 text-gray-700 leading-relaxed">
          {/* 정보 제공 목적 한계 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">1. 정보 제공 목적</h2>
            <p className="mt-3">
              KBBG에서 제공하는 모든 콘텐츠(병원 정보, AI 추천, 커뮤니티 게시글 포함)는
              일반적인 참고 목적으로만 제공됩니다. 이 서비스는 전문적인 의학적 진단, 치료 또는
              조언을 제공하지 않습니다.
            </p>
          </section>

          {/* 의료 정보 정확성 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">2. 의료 정보의 정확성</h2>
            <p className="mt-3">
              회사는 게시된 병원 정보, 시술 가격, 후기 등의 정확성을 유지하기 위해 노력하나,
              이를 보증하지는 않습니다. 의료 분야의 특성상 정보는 빠르게 변경될 수 있으므로,
              방문 전 반드시 해당 병원에 직접 확인하시기 바랍니다.
            </p>
          </section>

          {/* AI 추천 한계 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">3. AI 추천 서비스의 한계</h2>
            <p className="mt-3">
              AI 추천 결과는 이용자가 입력한 제한된 정보를 기반으로 생성됩니다.
              추천 결과는 참고용이며, 개인의 건강 상태, 병력, 알레르기 등 의료적 요소를
              고려하지 않습니다. 최종 병원 선택 및 시술 결정은 의료 전문가와 충분히
              상담한 후 진행하시기 바랍니다.
            </p>
          </section>

          {/* 광고 및 후원 콘텐츠 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">4. 광고 및 후원 콘텐츠</h2>
            <p className="mt-3">
              일부 콘텐츠 및 병원 추천은 광고 또는 유료 파트너십을 통해 제공될 수 있습니다.
              광고성 콘텐츠는 명확하게 &quot;광고&quot; 라벨로 표시됩니다.
              광고 표시 여부와 관계없이 모든 병원 정보는 동일한 기준으로 검증됩니다.
            </p>
          </section>

          {/* 외부 링크 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">5. 외부 링크 및 제3자 서비스</h2>
            <p className="mt-3">
              서비스 내 외부 링크는 편의 제공 목적이며, 회사는 연결된 외부 사이트의 내용에
              대해 책임을 지지 않습니다.
            </p>
          </section>

          {/* 법적 책임 제한 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">6. 책임 제한</h2>
            <p className="mt-3">
              회사는 서비스 이용으로 인한 직접적, 간접적, 우발적 손해에 대해
              관계 법령이 허용하는 최대 범위 내에서 책임을 지지 않습니다.
              단, 회사의 고의 또는 중과실로 인한 손해는 예외로 합니다.
            </p>
          </section>

          {/* 문의처 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">7. 문의</h2>
            <p className="mt-3">
              면책조항에 관한 문의사항은{" "}
              <a href="mailto:help@2bstory.com" className="text-pink-500 hover:underline">
                help@2bstory.com
              </a>
              으로 연락해 주시기 바랍니다.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
