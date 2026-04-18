"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

const DEPARTMENTS = [
  { id: 1, code: "08", nameKo: "성형외과", nameEn: "Plastic Surgery", descKo: "쌍꺼풀·코성형·안면윤곽", descEn: "Eyelid · Nose · Face Contouring", isType: false },
  { id: 2, code: "14", nameKo: "피부과", nameEn: "Dermatology", descKo: "레이저·보톡스·필러", descEn: "Laser · Botox · Filler", isType: false },
  { id: 3, code: "01", nameKo: "내과", nameEn: "Internal Medicine", descKo: "건강검진", descEn: "Health Checkup", isType: false },
  { id: 4, code: "49", nameKo: "치과", nameEn: "Dental", descKo: "임플란트·라미네이트", descEn: "Implant · Laminate", isType: false },
  { id: 5, code: "12", nameKo: "안과", nameEn: "Ophthalmology", descKo: "라식·라섹", descEn: "LASIK · LASEK", isType: false },
  { id: 6, code: "10", nameKo: "산부인과", nameEn: "OB/GYN", descKo: "산전검사·난임치료", descEn: "Prenatal · Fertility", isType: false },
  { id: 7, code: "05", nameKo: "정형외과", nameEn: "Orthopedics", descKo: "관절·척추", descEn: "Joint · Spine", isType: false },
  { id: 8, code: "korean_medicine", nameKo: "한의원", nameEn: "Korean Medicine", descKo: "한방치료", descEn: "Traditional Treatment", isType: true },
  { id: 9, code: "15", nameKo: "비뇨기과", nameEn: "Urology", descKo: "비뇨기 질환", descEn: "Urological Care", isType: false },
  { id: 10, code: "13", nameKo: "이비인후과", nameEn: "ENT", descKo: "코골이·축농증", descEn: "Snoring · Sinusitis", isType: false },
];

export default function TopDepartments({ locale }: { locale: string }) {
  const isKo = locale === "ko";
  const t = useTranslations("ui");

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        {t("top_dept_title")}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-0 border border-gray-200 rounded-lg overflow-hidden">
        {DEPARTMENTS.map((dept) => (
          <Link
            key={dept.id}
            href={`/${locale}/hospitals?${dept.isType ? `type=${dept.code}` : `dept=${dept.code}`}`}
            className="group flex items-center gap-3 px-4 py-3 border-b border-r border-gray-100 bg-white hover:bg-gray-50 transition-colors"
          >
            <span className="text-xs font-bold text-gray-300 w-4">{dept.id}</span>
            <div>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">
                {isKo ? dept.nameKo : dept.nameEn}
              </p>
              <p className="text-[11px] text-gray-400 leading-tight">
                {isKo ? dept.descKo : dept.descEn}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
