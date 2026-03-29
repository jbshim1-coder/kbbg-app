// 개인정보처리방침 페이지 — 수집 목적, 항목, 제3자 제공, 쿠키, 이용자 권리 안내
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

// 페이지 메타데이터 — SEO 및 브라우저 탭 제목 설정
export const metadata: Metadata = {
  title: "Privacy Policy — KBBG",
  description: "KBBG Privacy Policy",
};

// PrivacyPage: 개인정보처리방침 전문을 정적으로 렌더링하는 서버 컴포넌트
export default async function PrivacyPage() {
  const t = await getTranslations("privacy");

  return (
    <main className="min-h-screen bg-white px-4 py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
        {/* 최종 업데이트 날짜 — 방침 버전 관리용 */}
        <p className="mt-2 text-sm text-gray-400">{t("last_updated")}</p>

        {/* 방침 본문 — 각 항목을 section으로 구분 */}
        <div className="mt-10 space-y-8 text-gray-700 leading-relaxed">

          {/* 1조: 개인정보 수집 및 이용 목적 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">{t("s1_title")}</h2>
            <p className="mt-3">{t("s1_intro")}</p>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li>{t("s1_item1")}</li>
              <li>{t("s1_item2")}</li>
              <li>{t("s1_item3")}</li>
              <li>{t("s1_item4")}</li>
            </ul>
          </section>

          {/* 2조: 수집 항목과 보유 기간을 테이블로 명시 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">{t("s2_title")}</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left">{t("s2_col_category")}</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">{t("s2_col_items")}</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">{t("s2_col_retention")}</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 문의 접수 시 수집 항목 */}
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">{t("s2_row1_category")}</td>
                    <td className="border border-gray-200 px-4 py-2">{t("s2_row1_items")}</td>
                    <td className="border border-gray-200 px-4 py-2">{t("s2_row1_retention")}</td>
                  </tr>
                  {/* 서비스 이용 시 자동 수집 항목 */}
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">{t("s2_row2_category")}</td>
                    <td className="border border-gray-200 px-4 py-2">{t("s2_row2_items")}</td>
                    <td className="border border-gray-200 px-4 py-2">{t("s2_row2_retention")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 3조: 제3자 제공 원칙 및 예외 사항 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">{t("s3_title")}</h2>
            <p className="mt-3">{t("s3_body")}</p>
          </section>

          {/* 4조: 쿠키 사용 목적 및 거부 방법 안내 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">{t("s4_title")}</h2>
            <p className="mt-3">{t("s4_body")}</p>
          </section>

          {/* 5조: 이용자가 행사할 수 있는 권리 목록 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">{t("s5_title")}</h2>
            <p className="mt-3">{t("s5_intro")}</p>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li>{t("s5_item1")}</li>
              <li>{t("s5_item2")}</li>
              <li>{t("s5_item3")}</li>
            </ul>
            {/* 권리 행사 연락처 */}
            <p className="mt-3">
              {t("s5_contact_prefix")}{" "}
              <a href="mailto:help@2bstory.com" className="text-teal-600 hover:underline">
                help@2bstory.com
              </a>
              {t("s5_contact_suffix")}
            </p>
          </section>

          {/* 6조: 개인정보 보호책임자 연락처 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900">{t("s6_title")}</h2>
            <div className="mt-3 rounded-xl bg-gray-50 p-4 text-sm">
              <p>{t("s6_name")}</p>
              <p>{t("s6_role")}</p>
              <p>{t("s6_email")}</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
