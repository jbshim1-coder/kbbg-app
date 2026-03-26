"use client";

// 메인 페이지 병원 필터 검색 컴포넌트 — 모든 가능한 필터 제공
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

// 진료과목 전체 (심평원 SUBJECT_CODES)
const SPECIALTIES = [
  { value: "", label: "진료과 선택" },
  { value: "08", label: "성형외과" },
  { value: "14", label: "피부과" },
  { value: "49", label: "치과" },
  { value: "12", label: "안과" },
  { value: "01", label: "내과" },
  { value: "02", label: "신경과" },
  { value: "03", label: "정신건강의학과" },
  { value: "04", label: "외과" },
  { value: "05", label: "정형외과" },
  { value: "06", label: "신경외과" },
  { value: "09", label: "마취통증의학과" },
  { value: "13", label: "이비인후과" },
  { value: "15", label: "비뇨의학과" },
  { value: "21", label: "재활의학과" },
];

// 시도 전체 (심평원 SIDO_CODES)
const REGIONS = [
  { value: "", label: "지역 선택" },
  { value: "110000", label: "서울" },
  { value: "210000", label: "부산" },
  { value: "220000", label: "대구" },
  { value: "230000", label: "인천" },
  { value: "240000", label: "광주" },
  { value: "250000", label: "대전" },
  { value: "260000", label: "울산" },
  { value: "290000", label: "세종" },
  { value: "310000", label: "경기" },
  { value: "320000", label: "강원" },
  { value: "340000", label: "충북" },
  { value: "360000", label: "충남" },
  { value: "370000", label: "전북" },
  { value: "410000", label: "전남" },
  { value: "430000", label: "경북" },
  { value: "460000", label: "경남" },
  { value: "500000", label: "제주" },
];

// 종별코드 (기관 유형)
const CLINIC_TYPES = [
  { value: "", label: "병원 유형" },
  { value: "01", label: "상급종합병원" },
  { value: "11", label: "종합병원" },
  { value: "21", label: "병원" },
  { value: "28", label: "요양병원" },
  { value: "31", label: "의원" },
  { value: "specialized", label: "전문병원" },
];

// 전문의 / 일반의
const SPECIALIST = [
  { value: "", label: "전문의/일반의" },
  { value: "specialist", label: "전문의" },
  { value: "general", label: "일반의" },
];

// 의사 수 (원장 수)
const DOCTOR_COUNTS = [
  { value: "", label: "의사 수" },
  { value: "1", label: "1명" },
  { value: "2", label: "2명" },
  { value: "3", label: "3~5명" },
  { value: "6", label: "6~10명" },
  { value: "11", label: "11명 이상" },
];

// 홈페이지 여부
const WEBSITE = [
  { value: "", label: "홈페이지" },
  { value: "yes", label: "있음" },
  { value: "no", label: "없음" },
];

// 구글 평점
const RATINGS = [
  { value: "", label: "구글 평점" },
  { value: "4.5", label: "4.5점 이상" },
  { value: "4", label: "4점 이상" },
  { value: "3.5", label: "3.5점 이상" },
  { value: "3", label: "3점 이상" },
  { value: "2", label: "2점 이상" },
];


export default function ClinicFilter({ locale }: { locale: string }) {
  const t = useTranslations();
  const router = useRouter();

  const [keyword, setKeyword] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [region, setRegion] = useState("");
  const [clinicType, setClinicType] = useState("");
  const [specialist, setSpecialist] = useState("");
  const [doctorCount, setDoctorCount] = useState("");
  const [rating, setRating] = useState("");
  const [website, setWebsite] = useState("");

  // 병원 검색 실행
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (specialty) params.set("specialty", specialty);
    if (region) params.set("region", region);
    if (clinicType) params.set("type", clinicType);
    if (specialist) params.set("specialist", specialist);
    if (doctorCount) params.set("doctors", doctorCount);
    if (rating) params.set("rating", rating);
    if (website) params.set("website", website);
    router.push(`/${locale}/hospitals?${params.toString()}`);
  };

  // 초기화
  const handleReset = () => {
    setKeyword(""); setSpecialty(""); setRegion(""); setClinicType("");
    setSpecialist(""); setDoctorCount(""); setRating(""); setWebsite("");
  };

  const selectClass = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 appearance-none";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          {t("filter.title" as Parameters<typeof t>[0])}
        </h2>
        <button onClick={handleReset} className="text-xs text-gray-400 hover:text-gray-600 transition">
          {locale === "ko" ? "초기화" : "Reset"}
        </button>
      </div>

      {/* 필터 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* 진료과 */}
        <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={selectClass}>
          {SPECIALTIES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* 지역 */}
        <select value={region} onChange={(e) => setRegion(e.target.value)} className={selectClass}>
          {REGIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* 기관 유형 */}
        <select value={clinicType} onChange={(e) => setClinicType(e.target.value)} className={selectClass}>
          {CLINIC_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* 전문의 여부 */}
        <select value={specialist} onChange={(e) => setSpecialist(e.target.value)} className={selectClass}>
          {SPECIALIST.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* 의사 수 */}
        <select value={doctorCount} onChange={(e) => setDoctorCount(e.target.value)} className={selectClass}>
          {DOCTOR_COUNTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* 구글 평점 */}
        <select value={rating} onChange={(e) => setRating(e.target.value)} className={selectClass}>
          {RATINGS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* 홈페이지 */}
        <select value={website} onChange={(e) => setWebsite(e.target.value)} className={selectClass}>
          {WEBSITE.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* 버튼 */}
      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        <button onClick={handleSearch}
          className="flex-1 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition">
          {t("filter.search_btn" as Parameters<typeof t>[0])}
        </button>
        <button onClick={() => router.push(`/${locale}/recommend`)}
          className="flex-1 rounded-xl bg-pink-500 px-6 py-3 text-sm font-semibold text-white hover:bg-pink-600 transition">
          {t("hero.cta_recommend" as Parameters<typeof t>[0])}
        </button>
      </div>
    </div>
  );
}
