"use client";

// 메인 페이지 병원 필터 검색 컴포넌트
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

// 진료과 옵션
const SPECIALTIES = [
  { value: "", labelKey: "filter.all_specialty" },
  { value: "08", labelKey: "filter.plastic" },
  { value: "14", labelKey: "filter.derma" },
  { value: "49", labelKey: "filter.dental" },
  { value: "12", labelKey: "filter.eye" },
  { value: "04", labelKey: "filter.surgery" },
];

// 지역 옵션
const REGIONS = [
  { value: "", labelKey: "filter.all_region" },
  { value: "서울", labelKey: "filter.seoul" },
  { value: "강남", labelKey: "filter.gangnam" },
  { value: "부산", labelKey: "filter.busan" },
  { value: "대구", labelKey: "filter.daegu" },
  { value: "인천", labelKey: "filter.incheon" },
  { value: "제주", labelKey: "filter.jeju" },
];

// 원장 수 옵션
const DOCTOR_COUNTS = [
  { value: "", labelKey: "filter.all_doctors" },
  { value: "1", labelKey: "filter.doctor_1" },
  { value: "2", labelKey: "filter.doctor_2" },
  { value: "3", labelKey: "filter.doctor_3plus" },
];

// 기관 유형
const CLINIC_TYPES = [
  { value: "", labelKey: "filter.all_type" },
  { value: "hospital", labelKey: "filter.hospital" },
  { value: "clinic", labelKey: "filter.clinic_type" },
];

// 구글 평점
const RATINGS = [
  { value: "", labelKey: "filter.all_rating" },
  { value: "4", labelKey: "filter.rating_4" },
  { value: "3", labelKey: "filter.rating_3" },
  { value: "2", labelKey: "filter.rating_2" },
];

// 전문의 여부
const SPECIALIST_OPTIONS = [
  { value: "", labelKey: "filter.all_specialist" },
  { value: "yes", labelKey: "filter.has_specialist" },
];

export default function ClinicFilter({ locale }: { locale: string }) {
  const t = useTranslations();
  const router = useRouter();

  const [specialty, setSpecialty] = useState("");
  const [region, setRegion] = useState("");
  const [doctorCount, setDoctorCount] = useState("");
  const [clinicType, setClinicType] = useState("");
  const [rating, setRating] = useState("");
  const [specialist, setSpecialist] = useState("");

  // 병원 검색 실행
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (specialty) params.set("specialty", specialty);
    if (region) params.set("region", region);
    if (doctorCount) params.set("doctors", doctorCount);
    if (clinicType) params.set("type", clinicType);
    if (rating) params.set("rating", rating);
    if (specialist) params.set("specialist", specialist);
    router.push(`/${locale}/hospitals?${params.toString()}`);
  };

  // 셀렉트 공통 스타일
  const selectClass = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {t("filter.title" as Parameters<typeof t>[0])}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* 진료과 */}
        <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={selectClass}>
          {SPECIALTIES.map((opt) => (
            <option key={opt.value} value={opt.value}>{t(opt.labelKey as Parameters<typeof t>[0])}</option>
          ))}
        </select>

        {/* 지역 */}
        <select value={region} onChange={(e) => setRegion(e.target.value)} className={selectClass}>
          {REGIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{t(opt.labelKey as Parameters<typeof t>[0])}</option>
          ))}
        </select>

        {/* 전문의 여부 */}
        <select value={specialist} onChange={(e) => setSpecialist(e.target.value)} className={selectClass}>
          {SPECIALIST_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{t(opt.labelKey as Parameters<typeof t>[0])}</option>
          ))}
        </select>

        {/* 원장 수 */}
        <select value={doctorCount} onChange={(e) => setDoctorCount(e.target.value)} className={selectClass}>
          {DOCTOR_COUNTS.map((opt) => (
            <option key={opt.value} value={opt.value}>{t(opt.labelKey as Parameters<typeof t>[0])}</option>
          ))}
        </select>

        {/* 기관 유형 */}
        <select value={clinicType} onChange={(e) => setClinicType(e.target.value)} className={selectClass}>
          {CLINIC_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>{t(opt.labelKey as Parameters<typeof t>[0])}</option>
          ))}
        </select>

        {/* 구글 평점 */}
        <select value={rating} onChange={(e) => setRating(e.target.value)} className={selectClass}>
          {RATINGS.map((opt) => (
            <option key={opt.value} value={opt.value}>{t(opt.labelKey as Parameters<typeof t>[0])}</option>
          ))}
        </select>
      </div>

      {/* 버튼 영역 */}
      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleSearch}
          className="flex-1 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          {t("filter.search_btn" as Parameters<typeof t>[0])}
        </button>
        <button
          onClick={() => router.push(`/${locale}/recommend`)}
          className="flex-1 rounded-xl bg-pink-500 px-6 py-3 text-sm font-semibold text-white hover:bg-pink-600 transition"
        >
          {t("hero.cta_recommend" as Parameters<typeof t>[0])}
        </button>
      </div>
    </div>
  );
}
