// 커뮤니티 가이드라인 페이지 — 서버 컴포넌트
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Community Guidelines",
  description: "K-Beauty Buyers Guide community guidelines and rules.",
};

export default async function GuidelinesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (locale === "ko") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">커뮤니티 가이드라인</h1>
        <p className="text-sm text-gray-400 mb-10">최종 업데이트: 2025년 1월</p>

        <Section title="1. 기본 규칙">
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>모든 국적, 성별, 나이의 사용자를 존중합니다.</li>
            <li>한국어, 영어 및 모든 언어로 게시 가능합니다.</li>
            <li>욕설, 혐오 표현, 차별적 발언은 즉시 삭제됩니다.</li>
          </ul>
        </Section>

        <Section title="2. 의료 정보 규칙">
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>게시글의 모든 정보는 개인 경험이며, 전문 의료 조언이 아닙니다.</li>
            <li>시술 효과를 &ldquo;보장&rdquo;하는 표현은 금지합니다.</li>
            <li>부작용 정보를 의도적으로 누락하지 마세요.</li>
            <li>약물/의약품 거래, 처방전 공유는 금지합니다.</li>
          </ul>
        </Section>

        <Section title="3. Before/After 사진 규칙">
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>동일 조건(조명, 각도)에서 촬영된 사진만 게시하세요.</li>
            <li>경과 시간(수술 후 며칠)을 반드시 명시하세요.</li>
            <li>타인의 사진을 무단으로 사용하지 마세요.</li>
            <li>과도한 노출이 포함된 사진은 모자이크 처리하세요.</li>
          </ul>
        </Section>

        <Section title="4. 금지 사항">
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>병원/의사 비방 목적의 허위 게시글</li>
            <li>브로커 활동 (병원 알선 대가로 금전 요구)</li>
            <li>개인 연락처(전화, 카카오톡, WhatsApp 등) 공유</li>
            <li>동일 병원 반복 홍보 (광고성 게시물)</li>
            <li>미성년자 대상 미용 시술 권유</li>
          </ul>
        </Section>

        <Section title="5. 제재 기준">
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>1차 위반: 경고</li>
            <li>2차 위반: 7일 글쓰기 정지</li>
            <li>3차 위반: 30일 정지</li>
            <li>즉시 영구 차단: 브로커 활동, 혐오 발언, 불법 행위</li>
          </ul>
        </Section>

        <Section title="6. 광고/협찬 공개">
          <p className="text-gray-600">
            병원으로부터 무상 시술, 할인, 금전을 받고 작성한 후기는 반드시{" "}
            <strong>[광고]</strong> 또는 <strong>[협찬]</strong>을 표기하세요.
          </p>
        </Section>

        <Section title="7. 분쟁 처리">
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>플랫폼은 병원과 환자 간 의료 분쟁에 중재하지 않습니다.</li>
            <li>
              한국의료분쟁조정중재원:{" "}
              <a href="tel:16702545" className="text-slate-700 underline">
                1670-2545
              </a>
            </li>
            <li>
              문의:{" "}
              <a href="mailto:jbshim1@gmail.com" className="text-slate-700 underline">
                jbshim1@gmail.com
              </a>
            </li>
          </ul>
        </Section>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Guidelines</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: January 2025</p>

      <Section title="1. Basic Rules">
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>Respect all users regardless of nationality, gender, or age.</li>
          <li>Posts may be written in Korean, English, or any other language.</li>
          <li>Profanity, hate speech, and discriminatory language will be removed immediately.</li>
        </ul>
      </Section>

      <Section title="2. Medical Information Rules">
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>All information in posts reflects personal experience and is not professional medical advice.</li>
          <li>Language that &ldquo;guarantees&rdquo; procedure outcomes is prohibited.</li>
          <li>Do not intentionally omit information about side effects.</li>
          <li>Trading drugs/medications or sharing prescriptions is strictly prohibited.</li>
        </ul>
      </Section>

      <Section title="3. Before/After Photo Rules">
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>Only post photos taken under consistent conditions (same lighting and angle).</li>
          <li>Always specify the time elapsed since the procedure (e.g., days post-surgery).</li>
          <li>Do not use other people&apos;s photos without permission.</li>
          <li>Photos with excessive exposure must be censored or blurred.</li>
        </ul>
      </Section>

      <Section title="4. Prohibited Activities">
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>False posts intended to defame hospitals or doctors</li>
          <li>Broker activity (soliciting money to refer patients to clinics)</li>
          <li>Sharing personal contact information (phone, KakaoTalk, WhatsApp, etc.)</li>
          <li>Repeated promotion of the same hospital (advertising posts)</li>
          <li>Recommending cosmetic procedures to minors</li>
        </ul>
      </Section>

      <Section title="5. Sanctions">
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>1st violation: Warning</li>
          <li>2nd violation: 7-day posting suspension</li>
          <li>3rd violation: 30-day suspension</li>
          <li>Immediate permanent ban: broker activity, hate speech, illegal conduct</li>
        </ul>
      </Section>

      <Section title="6. Advertising & Sponsorship Disclosure">
        <p className="text-gray-600">
          If you received a free procedure, discount, or payment from a clinic in exchange for a review,
          you must clearly label it{" "}
          <strong>[AD]</strong> or <strong>[Sponsored]</strong>.
        </p>
      </Section>

      <Section title="7. Dispute Resolution">
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>This platform does not mediate medical disputes between patients and clinics.</li>
          <li>
            Korea Medical Dispute Mediation &amp; Arbitration Agency:{" "}
            <a href="tel:16702545" className="text-slate-700 underline">
              1670-2545
            </a>
          </li>
          <li>
            Contact us:{" "}
            <a href="mailto:jbshim1@gmail.com" className="text-slate-700 underline">
              jbshim1@gmail.com
            </a>
          </li>
        </ul>
      </Section>
    </div>
  );
}

// 섹션 레이아웃 헬퍼 — 제목 + 내용 구성
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">
        {title}
      </h2>
      {children}
    </section>
  );
}
