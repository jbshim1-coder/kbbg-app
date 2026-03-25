// 이용약관 페이지 — 서비스 이용 조건, 사용자 권리·의무, 면책 및 분쟁 해결 조항 안내
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

// 페이지 메타데이터 — SEO 및 브라우저 탭 제목 설정
export const metadata: Metadata = {
  title: "Terms of Service — KBBG",
  description: "KBBG Terms of Service",
};

// TermsPage: 이용약관 전문을 정적으로 렌더링하는 서버 컴포넌트
export default async function TermsPage() {
  const t = await getTranslations("terms");

  return (
    <main className="min-h-screen bg-white px-4 py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
        {/* 최종 업데이트 날짜 — 약관 버전 관리용 */}
        <p className="mt-2 text-sm text-gray-400">{t("last_updated")}</p>

        {/* 약관 본문 — 각 조항을 section으로 구분하여 가독성 확보 */}
        <div className="mt-10 space-y-8 text-gray-700 leading-relaxed">

          {/* 제1조: 약관 목적 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">{t("s1_title")}</h2>
            <p className="mt-3">{t("s1_body")}</p>
          </section>

          {/* 제2조: 주요 용어 정의 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">{t("s2_title")}</h2>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li>{t("s2_item1")}</li>
              <li>{t("s2_item2")}</li>
              <li>{t("s2_item3")}</li>
            </ul>
          </section>

          {/* 제3조: 약관 효력 및 변경 절차 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">{t("s3_title")}</h2>
            <p className="mt-3">{t("s3_body")}</p>
          </section>

          {/* 제4조: 제공 서비스 목록 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">{t("s4_title")}</h2>
            <p className="mt-3">{t("s4_intro")}</p>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li>{t("s4_item1")}</li>
              <li>{t("s4_item2")}</li>
              <li>{t("s4_item3")}</li>
              <li>{t("s4_item4")}</li>
            </ul>
          </section>

          {/* 제5조: 이용자 금지 행위 목록 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">{t("s5_title")}</h2>
            <p className="mt-3">{t("s5_intro")}</p>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li>{t("s5_item1")}</li>
              <li>{t("s5_item2")}</li>
              <li>{t("s5_item3")}</li>
              <li>{t("s5_item4")}</li>
            </ul>
          </section>

          {/* 제6조: 의료 정보 면책 — 병원 정보 정확성 보증 불가 명시 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">{t("s6_title")}</h2>
            <p className="mt-3">{t("s6_body")}</p>
          </section>

          {/* 제7조: 분쟁 해결 — 준거법 및 관할 법원 지정 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">{t("s7_title")}</h2>
            <p className="mt-3">{t("s7_body")}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
