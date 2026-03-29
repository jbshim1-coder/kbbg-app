"use client";

// 메인 페이지 병원 조건 검색 — 심평원 전체 옵션 + /hospitals 이동
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SGGU_CODES } from "@/data/sggu-codes";

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
  { value: "80", label: "한방내과" }, { value: "81", label: "한방부인과" },
  { value: "85", label: "한방재활의학과" }, { value: "87", label: "침구과" },
];

// 시도 (심평원 실제 코드)
const REGIONS = [
  { value: "", label: "시/도 선택" },
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

// 홈페이지
const WEBSITE = [
  { value: "", label: "홈페이지 (모두)" },
  { value: "yes", label: "홈페이지 있음" },
  { value: "no", label: "홈페이지 없음" },
];

export default function ClinicFilter({ locale }: { locale: string }) {
  const isKo = locale === "ko";
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "en";

  const [specialty, setSpecialty] = useState("");
  const [region, setRegion] = useState("");
  const [sggu, setSggu] = useState("");
  const [clinicType, setClinicType] = useState("");
  const [website, setWebsite] = useState("");
  const [keyword, setKeyword] = useState("");

  // 시도 변경 시 시군구 초기화
  const handleRegionChange = (val: string) => {
    setRegion(val);
    setSggu("");
  };

  const sgguOptions = region && SGGU_CODES[region] ? SGGU_CODES[region] : [];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (specialty) params.set("dept", specialty);
    if (region) params.set("region", region);
    if (sggu) params.set("sggu", sggu);
    if (clinicType) params.set("type", clinicType);
    if (keyword) params.set("keyword", keyword);
    router.push(`/${currentLocale}/hospitals?${params.toString()}`);
  };

  const handleReset = () => {
    setSpecialty(""); setRegion(""); setSggu("");
    setClinicType(""); setWebsite(""); setKeyword("");
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

      {/* 병원명 검색 */}
      <div className="mb-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={isKo ? "병원명 검색 (선택)" : "Hospital name (optional)"}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      {/* 필터 그리드 */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={selectClass}>
          {SPECIALTIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={region} onChange={(e) => handleRegionChange(e.target.value)} className={selectClass}>
          {REGIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        {sgguOptions.length > 0 && (
          <select value={sggu} onChange={(e) => setSggu(e.target.value)} className={selectClass}>
            {sgguOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        )}
        <select value={clinicType} onChange={(e) => setClinicType(e.target.value)} className={selectClass}>
          {CLINIC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
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
