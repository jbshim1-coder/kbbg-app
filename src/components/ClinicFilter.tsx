"use client";

// 메인 페이지 병원 조건 검색 — 필터 선택 후 /hospitals 페이지로 이동
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// 진료과목
const SPECIALTIES = [
  { value: "", label: "진료과 선택" },
  { value: "08", label: "성형외과" }, { value: "14", label: "피부과" },
  { value: "49", label: "치과" }, { value: "12", label: "안과" },
  { value: "01", label: "내과" }, { value: "02", label: "신경과" },
  { value: "03", label: "정신건강의학과" }, { value: "04", label: "외과" },
  { value: "05", label: "정형외과" }, { value: "06", label: "신경외과" },
  { value: "09", label: "마취통증의학과" }, { value: "10", label: "산부인과" },
  { value: "13", label: "이비인후과" }, { value: "15", label: "비뇨의학과" },
  { value: "21", label: "재활의학과" },
];

// 시도 (심평원 실제 코드)
const REGIONS = [
  { value: "", label: "지역 선택" },
  { value: "110000", label: "서울" }, { value: "210000", label: "부산" },
  { value: "220000", label: "대구" }, { value: "230000", label: "인천" },
  { value: "240000", label: "광주" }, { value: "250000", label: "대전" },
  { value: "260000", label: "울산" }, { value: "310000", label: "경기" },
  { value: "320000", label: "강원" }, { value: "330000", label: "충북" },
  { value: "340000", label: "충남" }, { value: "350000", label: "전북" },
  { value: "360000", label: "전남" }, { value: "370000", label: "경북" },
  { value: "380000", label: "경남" }, { value: "390000", label: "제주" },
  { value: "410000", label: "세종" },
];

// 병원 유형
const CLINIC_TYPES = [
  { value: "", label: "병원 유형" },
  { value: "01", label: "상급종합병원" }, { value: "11", label: "종합병원" },
  { value: "21", label: "병원" }, { value: "28", label: "요양병원" },
  { value: "31", label: "의원" },
];

// 전문의/일반의
const SPECIALIST = [
  { value: "", label: "전문의/일반의" },
  { value: "specialist", label: "전문의" }, { value: "general", label: "일반의" },
];

// 의사 수
const DOCTOR_COUNTS = [
  { value: "", label: "의사 수" },
  { value: "1", label: "1명" }, { value: "2", label: "2명" },
  { value: "3", label: "3~5명" }, { value: "6", label: "6~10명" },
  { value: "11", label: "11명 이상" },
];

// 구글 평점
const RATINGS = [
  { value: "", label: "구글 평점" },
  { value: "4.5", label: "4.5점 이상" }, { value: "4", label: "4점 이상" },
  { value: "3.5", label: "3.5점 이상" }, { value: "3", label: "3점 이상" },
];

// 홈페이지
const WEBSITE = [
  { value: "", label: "홈페이지" },
  { value: "yes", label: "있음" }, { value: "no", label: "없음" },
];

export default function ClinicFilter({ locale }: { locale: string }) {
  const isKo = locale === "ko";
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "en";

  const [specialty, setSpecialty] = useState("");
  const [region, setRegion] = useState("");
  const [clinicType, setClinicType] = useState("");
  const [specialist, setSpecialist] = useState("");
  const [doctorCount, setDoctorCount] = useState("");
  const [rating, setRating] = useState("");
  const [website, setWebsite] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (specialty) params.set("dept", specialty);
    if (region) params.set("region", region);
    if (clinicType) params.set("type", clinicType);
    router.push(`/${currentLocale}/hospitals?${params.toString()}`);
  };

  const handleReset = () => {
    setSpecialty(""); setRegion(""); setClinicType("");
    setSpecialist(""); setDoctorCount(""); setRating(""); setWebsite("");
  };

  const selectClass = "px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900">
          {isKo ? "병원 찾기" : "Find Clinics"}
        </h3>
        <button onClick={handleReset} className="text-xs text-gray-400 hover:text-gray-600">
          {isKo ? "초기화" : "Reset"}
        </button>
      </div>

      {/* 필터 그리드 */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={selectClass}>
          {SPECIALTIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={region} onChange={(e) => setRegion(e.target.value)} className={selectClass}>
          {REGIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <select value={clinicType} onChange={(e) => setClinicType(e.target.value)} className={selectClass}>
          {CLINIC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={specialist} onChange={(e) => setSpecialist(e.target.value)} className={selectClass}>
          {SPECIALIST.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={doctorCount} onChange={(e) => setDoctorCount(e.target.value)} className={selectClass}>
          {DOCTOR_COUNTS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <select value={rating} onChange={(e) => setRating(e.target.value)} className={selectClass}>
          {RATINGS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <select value={website} onChange={(e) => setWebsite(e.target.value)} className={selectClass}>
          {WEBSITE.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
        </select>
      </div>

      <button
        onClick={handleSearch}
        className="w-full py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-900 transition"
      >
        {isKo ? "병원 검색" : "Search Clinics"}
      </button>
    </div>
  );
}
