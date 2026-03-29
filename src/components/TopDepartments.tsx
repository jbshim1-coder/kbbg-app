"use client";

import Link from "next/link";

const DEPARTMENTS = [
  { id: 1, code: "08", icon: "✨", nameKo: "성형외과", nameEn: "Plastic Surgery", descKo: "쌍꺼풀·코성형·안면윤곽", descEn: "Eyelid · Nose · Face Contouring", color: "from-emerald-400 to-emerald-500" },
  { id: 2, code: "14", icon: "💎", nameKo: "피부과", nameEn: "Dermatology", descKo: "레이저·보톡스·필러", descEn: "Laser · Botox · Filler", color: "from-purple-400 to-violet-400" },
  { id: 3, code: "01", icon: "🩺", nameKo: "내과", nameEn: "Internal Medicine", descKo: "건강검진", descEn: "Health Checkup", color: "from-blue-400 to-cyan-400" },
  { id: 4, code: "49", icon: "🦷", nameKo: "치과", nameEn: "Dental", descKo: "임플란트·라미네이트", descEn: "Implant · Laminate", color: "from-sky-400 to-blue-400" },
  { id: 5, code: "12", icon: "👁️", nameKo: "안과", nameEn: "Ophthalmology", descKo: "라식·라섹", descEn: "LASIK · LASEK", color: "from-slate-400 to-emerald-400" },
  { id: 6, code: "10", icon: "👶", nameKo: "산부인과", nameEn: "OB/GYN", descKo: "산전검사·난임치료", descEn: "Prenatal · Fertility", color: "from-rose-400 to-pink-400" },
  { id: 7, code: "05", icon: "🦴", nameKo: "정형외과", nameEn: "Orthopedics", descKo: "관절·척추", descEn: "Joint · Spine", color: "from-amber-400 to-orange-400" },
  { id: 8, code: "korean_medicine", icon: "🌿", nameKo: "한의원", nameEn: "Korean Medicine", descKo: "한방치료", descEn: "Traditional Treatment", color: "from-green-400 to-emerald-400", isType: true },
  { id: 9, code: "15", icon: "🔬", nameKo: "비뇨기과", nameEn: "Urology", descKo: "비뇨기 질환", descEn: "Urological Care", color: "from-indigo-400 to-blue-400" },
  { id: 10, code: "13", icon: "👃", nameKo: "이비인후과", nameEn: "ENT", descKo: "코골이·축농증", descEn: "Snoring · Sinusitis", color: "from-orange-400 to-amber-400" },
];

export default function TopDepartments({ locale }: { locale: string }) {
  const isKo = locale === "ko";

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <span className="text-2xl">🏥</span>
        <h2 className="text-xl font-bold text-gray-900">
          {isKo ? "외국인 환자 인기 진료과 TOP 10" : "TOP 10 Departments for International Patients"}
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {DEPARTMENTS.map((dept) => (
          <Link
            key={dept.id}
            href={`/${locale}/hospitals?${"isType" in dept && dept.isType ? `type=${dept.code}` : `dept=${dept.code}`}`}
            className="group relative bg-white rounded-2xl shadow-sm p-4 text-center transition-all hover:shadow-md hover:-translate-y-1"
          >
            <span className="absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">
              {dept.id}
            </span>
            <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${dept.color} text-2xl`}>
              {dept.icon}
            </div>
            <p className="text-sm font-semibold text-gray-800 group-hover:text-slate-700 transition-colors">
              {isKo ? dept.nameKo : dept.nameEn}
            </p>
            <p className="mt-0.5 text-[11px] text-gray-400 line-clamp-1">
              {isKo ? dept.descKo : dept.descEn}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
