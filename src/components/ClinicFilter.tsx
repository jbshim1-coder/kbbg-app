"use client";

// 메인 페이지 병원 조건 검색 — 심평원 전체 옵션 + /hospitals 이동
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SGGU_CODES } from "@/data/sggu-codes";
import { createClient } from "@/lib/supabase";

// 진료과목 (다국어)
const SPECIALTIES = [
  { value: "", ko: "진료과 선택", en: "Select Specialty", d: false },
  { value: "08", ko: "성형외과", en: "Plastic Surgery", d: false },
  { value: "14", ko: "피부과", en: "Dermatology", d: false },
  { value: "49", ko: "치과", en: "Dentistry", d: false },
  { value: "12", ko: "안과", en: "Ophthalmology", d: false },
  { value: "01", ko: "내과", en: "Internal Medicine", d: false },
  { value: "02", ko: "신경과", en: "Neurology", d: false },
  { value: "03", ko: "정신건강의학과", en: "Psychiatry", d: false },
  { value: "04", ko: "외과", en: "General Surgery", d: false },
  { value: "05", ko: "정형외과", en: "Orthopedics", d: false },
  { value: "06", ko: "신경외과", en: "Neurosurgery", d: false },
  { value: "09", ko: "마취통증의학과", en: "Anesthesiology", d: false },
  { value: "10", ko: "산부인과", en: "OB/GYN", d: false },
  { value: "13", ko: "이비인후과", en: "ENT", d: false },
  { value: "15", ko: "비뇨의학과", en: "Urology", d: false },
  { value: "21", ko: "재활의학과", en: "Rehabilitation", d: false },
  { value: "_sep1", ko: "── 한방 ──", en: "── Korean Medicine ──", d: true },
  { value: "80", ko: "한방내과", en: "Korean Internal Med.", d: false },
  { value: "81", ko: "한방부인과", en: "Korean OB/GYN", d: false },
  { value: "82", ko: "한방소아과", en: "Korean Pediatrics", d: false },
  { value: "83", ko: "한방안이비인후피부과", en: "Korean ENT/Derma", d: false },
  { value: "84", ko: "한방신경정신과", en: "Korean Neuropsych.", d: false },
  { value: "85", ko: "한방재활의학과", en: "Korean Rehab.", d: false },
  { value: "86", ko: "사상체질과", en: "Sasang Medicine", d: false },
  { value: "87", ko: "침구과", en: "Acupuncture", d: false },
];

// 시도 (심평원 실제 코드, 다국어)
const REGIONS = [
  { value: "", ko: "시/도 선택", en: "Select Region" },
  { value: "110000", ko: "서울", en: "Seoul" },
  { value: "210000", ko: "부산", en: "Busan" },
  { value: "220000", ko: "대구", en: "Daegu" },
  { value: "230000", ko: "인천", en: "Incheon" },
  { value: "240000", ko: "광주", en: "Gwangju" },
  { value: "250000", ko: "대전", en: "Daejeon" },
  { value: "260000", ko: "울산", en: "Ulsan" },
  { value: "310000", ko: "경기", en: "Gyeonggi" },
  { value: "320000", ko: "강원", en: "Gangwon" },
  { value: "330000", ko: "충북", en: "Chungbuk" },
  { value: "340000", ko: "충남", en: "Chungnam" },
  { value: "350000", ko: "전북", en: "Jeonbuk" },
  { value: "360000", ko: "전남", en: "Jeonnam" },
  { value: "370000", ko: "경북", en: "Gyeongbuk" },
  { value: "380000", ko: "경남", en: "Gyeongnam" },
  { value: "390000", ko: "제주", en: "Jeju" },
  { value: "410000", ko: "세종", en: "Sejong" },
];

// 병원 유형 (다국어)
const CLINIC_TYPES = [
  { value: "", ko: "병원 유형 (모두)", en: "Hospital Type (All)" },
  { value: "01", ko: "상급종합병원", en: "Tertiary Hospital" },
  { value: "11", ko: "종합병원", en: "General Hospital" },
  { value: "21", ko: "병원", en: "Hospital" },
  { value: "28", ko: "요양병원", en: "Long-term Care" },
  { value: "31", ko: "의원", en: "Clinic" },
];

// 전문의/일반의 (다국어)
const DOCTOR_TYPE = [
  { value: "", ko: "전문의/일반의 (모두)", en: "Specialist/General (All)" },
  { value: "specialist", ko: "전문의", en: "Specialist" },
  { value: "general", ko: "일반의", en: "General" },
];

// 의사 수 (다국어)
const DOCTOR_COUNT = [
  { value: "", ko: "의사 수 (모두)", en: "Doctors (All)" },
  { value: "1", ko: "1명", en: "1" },
  { value: "2", ko: "2~3명", en: "2~3" },
  { value: "5", ko: "5명 이상", en: "5+" },
  { value: "10", ko: "10명 이상", en: "10+" },
];

// 구글 평점 (다국어)
const RATING = [
  { value: "", ko: "구글 평점 (모두)", en: "Google Rating (All)" },
  { value: "4.5", ko: "4.5점 이상", en: "4.5+" },
  { value: "4", ko: "4점 이상", en: "4.0+" },
  { value: "3.5", ko: "3.5점 이상", en: "3.5+" },
  { value: "3", ko: "3점 이상", en: "3.0+" },
];

// 홈페이지 (다국어)
const WEBSITE = [
  { value: "", ko: "홈페이지 (모두)", en: "Website (All)" },
  { value: "yes", ko: "홈페이지 있음", en: "Has Website" },
  { value: "no", ko: "홈페이지 없음", en: "No Website" },
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
  const [doctorType, setDoctorType] = useState("");
  const [doctorCount, setDoctorCount] = useState("");
  const [rating, setRating] = useState("");
  const [website, setWebsite] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
  }, []);

  const handleRegionChange = (val: string) => {
    setRegion(val);
    setSggu("");
  };

  const sgguOptions = region && SGGU_CODES[region] ? SGGU_CODES[region] : [];

  const handleSearch = () => {
    if (!loggedIn) { setShowPopup(true); return; }
    const params = new URLSearchParams();
    if (specialty && !specialty.startsWith("_")) params.set("dept", specialty);
    if (region) params.set("region", region);
    if (sggu) params.set("sggu", sggu);
    if (clinicType) params.set("type", clinicType);
    if (doctorType) params.set("doctorType", doctorType);
    if (doctorCount) params.set("doctorCount", doctorCount);
    if (rating) params.set("rating", rating);
    if (website) params.set("website", website);
    if (keyword) params.set("keyword", keyword);
    router.push(`/${currentLocale}/hospitals?${params.toString()}`);
  };

  const handleReset = () => {
    setSpecialty(""); setRegion(""); setSggu(""); setClinicType("");
    setDoctorType(""); setDoctorCount(""); setRating(""); setWebsite(""); setKeyword("");
  };

  // 모바일 터치 타겟 44px 최소 높이 보장
  const sc = "px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 min-h-[44px]";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900">
          {t("ui.find_clinics")}
        </h3>
        <button onClick={handleReset} className="min-h-[44px] px-3 text-xs text-gray-400 hover:text-gray-600">
          {isKo ? "초기화" : "Reset"}
        </button>
      </div>

      {/* 병원명/동 검색 */}
      <div className="mb-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={isKo ? "병원명 또는 동 이름 (예: 역삼동)" : "Hospital name or dong (e.g. Yeoksam)"}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 min-h-[44px]"
        />
      </div>

      {/* 필터 그리드 */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={sc}>
          {SPECIALTIES.map((s, i) => <option key={s.value || `s${i}`} value={s.value} disabled={s.d}>{isKo ? s.ko : s.en}</option>)}
        </select>
        <select value={region} onChange={(e) => handleRegionChange(e.target.value)} className={sc}>
          {REGIONS.map((r) => <option key={r.value} value={r.value}>{isKo ? r.ko : r.en}</option>)}
        </select>
      </div>
      {sgguOptions.length > 0 && (
        <div className="mb-2">
          <select value={sggu} onChange={(e) => setSggu(e.target.value)} className={`w-full ${sc}`}>
            {sgguOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <select value={clinicType} onChange={(e) => setClinicType(e.target.value)} className={sc}>
          {CLINIC_TYPES.map((t) => <option key={t.value} value={t.value}>{isKo ? t.ko : t.en}</option>)}
        </select>
        <select value={doctorType} onChange={(e) => setDoctorType(e.target.value)} className={sc}>
          {DOCTOR_TYPE.map((d) => <option key={d.value} value={d.value}>{isKo ? d.ko : d.en}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        <select value={doctorCount} onChange={(e) => setDoctorCount(e.target.value)} className={sc}>
          {DOCTOR_COUNT.map((d) => <option key={d.value} value={d.value}>{isKo ? d.ko : d.en}</option>)}
        </select>
        <select value={rating} onChange={(e) => setRating(e.target.value)} className={sc}>
          {RATING.map((r) => <option key={r.value} value={r.value}>{isKo ? r.ko : r.en}</option>)}
        </select>
        <select value={website} onChange={(e) => setWebsite(e.target.value)} className={sc}>
          {WEBSITE.map((w) => <option key={w.value} value={w.value}>{isKo ? w.ko : w.en}</option>)}
        </select>
      </div>

      <button
        onClick={handleSearch}
        className="w-full py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-900 transition"
      >
        {isKo ? "병원 검색" : "Search Clinics"}
      </button>

      {/* 비로그인 팝업 */}
      {showPopup && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
            <p className="text-4xl mb-4">🔒</p>
            <h3 className="text-lg font-bold text-gray-900">
              {isKo ? "회원 전용 서비스" : "Members Only"}
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              {isKo ? "병원 검색은 회원만 이용할 수 있습니다.\n무료로 가입하고 이용해보세요!" : "Search is available for members only.\nSign up for free!"}
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPopup(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                {isKo ? "닫기" : "Close"}
              </button>
              <button onClick={() => router.push(`/${currentLocale}/signup`)}
                className="flex-1 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-900">
                {isKo ? "무료 회원가입" : "Sign Up Free"}
              </button>
            </div>
            <button onClick={() => router.push(`/${currentLocale}/login`)}
              className="mt-3 text-xs text-gray-400 hover:text-gray-600">
              {isKo ? "이미 회원이신가요? 로그인" : "Already a member? Login"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
