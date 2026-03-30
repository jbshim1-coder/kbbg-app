import { getTranslations } from "next-intl/server";

// 의료 면책 배너 — 모든 페이지 Footer 바로 위 고정 표시
export default async function MedicalDisclaimer({ locale }: { locale: string }) {
  const t = await getTranslations({ locale });

  return (
    <div className="bg-gray-100 border-t border-gray-200 py-2 px-4 text-center">
      <p className="text-xs text-gray-500">
        {t("medical_disclaimer.text")}
      </p>
    </div>
  );
}
