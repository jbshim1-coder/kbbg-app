"use client";

// 메인 페이지 병원 조건 검색 — 심평원 전체 옵션 + /hospitals 이동
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SGGU_CODES } from "@/data/sggu-codes";
import { createClient } from "@/lib/supabase";

// 진료과목
const SPECIALTIES = [
  { value: "", key: "select_specialty", d: false },
  { value: "08", key: "plastic_surgery", d: false },
  { value: "14", key: "dermatology", d: false },
  { value: "20", key: "internal_med", d: false },
  { value: "49", key: "dental", d: false },
  { value: "12", key: "ophthalmology", d: false },
  { value: "11", key: "obgyn", d: false },
  { value: "21", key: "orthopedics", d: false },
  { value: "80", key: "oriental", d: false },
  { value: "44", key: "urology", d: false },
  { value: "13", key: "ent", d: false },
];

// 시도 (심평원 실제 코드)
const REGIONS = [
  { value: "", key: "select_region" },
  { value: "110000", key: "seoul" },
  { value: "210000", key: "busan" },
];

// 병원 유형
const CLINIC_TYPES = [
  { value: "", key: "hospital_type_all" },
  { value: "01", key: "tertiary" },
  { value: "11", key: "general" },
  { value: "21", key: "hospital" },
  { value: "31", key: "clinic" },
];

// 전문의/일반의
const DOCTOR_TYPE = [
  { value: "", key: "spec_gen_all" },
  { value: "specialist", key: "specialist" },
  { value: "general", key: "general_doc" },
];

// 의사 수
const DOCTOR_COUNT = [
  { value: "", key: "doctors_all" },
  { value: "1", key: "doc_1" },
  { value: "2", key: "doc_2_3" },
  { value: "4", key: "doc_4_plus" },
];

// 구글 평점
const RATING = [
  { value: "", key: "rating_all" },
  { value: "4.5", key: "rating_45" },
  { value: "4", key: "rating_40" },
  { value: "3.5", key: "rating_35" },
];

// 홈페이지
const WEBSITE = [
  { value: "", key: "website_all" },
  { value: "yes", key: "has_website" },
  { value: "no", key: "no_website" },
];

export default function ClinicFilter({ locale: _locale }: { locale: string }) {
  const t = useTranslations();
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
          {t("ui.reset")}
        </button>
      </div>

      {/* 병원명/동 검색 */}
      <div className="mb-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={t("cf.search_hospital_placeholder")}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 min-h-[44px]"
        />
      </div>

      {/* 필터 그리드 */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={sc}>
          {SPECIALTIES.map((s, i) => <option key={s.value || `s${i}`} value={s.value} disabled={s.d}>{t(`cf.${s.key}`)}</option>)}
        </select>
        <select value={region} onChange={(e) => handleRegionChange(e.target.value)} className={sc}>
          {REGIONS.map((r) => <option key={r.value} value={r.value}>{t(`cf.${r.key}`)}</option>)}
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
          {CLINIC_TYPES.map((ct) => <option key={ct.value} value={ct.value}>{t(`cf.${ct.key}`)}</option>)}
        </select>
        <select value={doctorType} onChange={(e) => setDoctorType(e.target.value)} className={sc}>
          {DOCTOR_TYPE.map((dt) => <option key={dt.value} value={dt.value}>{t(`cf.${dt.key}`)}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        <select value={doctorCount} onChange={(e) => setDoctorCount(e.target.value)} className={sc}>
          {DOCTOR_COUNT.map((dc) => <option key={dc.value} value={dc.value}>{t(`cf.${dc.key}`)}</option>)}
        </select>
        <select value={rating} onChange={(e) => setRating(e.target.value)} className={sc}>
          {RATING.map((r) => <option key={r.value} value={r.value}>{t(`cf.${r.key}`)}</option>)}
        </select>
        <select value={website} onChange={(e) => setWebsite(e.target.value)} className={sc}>
          {WEBSITE.map((w) => <option key={w.value} value={w.value}>{t(`cf.${w.key}`)}</option>)}
        </select>
      </div>

      <button
        onClick={handleSearch}
        className="w-full py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-900 transition"
      >
        {t("ui.search_clinics")}
      </button>

      {/* 비로그인 팝업 */}
      {showPopup && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
            <p className="text-4xl mb-4">🔒</p>
            <h3 className="text-lg font-bold text-gray-900">
              {t("ui.members_only")}
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              {t("cf.clinic_search_members_only")}
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPopup(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                {t("ui.close")}
              </button>
              <button onClick={() => router.push(`/${currentLocale}/signup`)}
                className="flex-1 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-900">
                {t("ui.signup_free")}
              </button>
            </div>
            <button onClick={() => router.push(`/${currentLocale}/login`)}
              className="mt-3 text-xs text-gray-400 hover:text-gray-600">
              {t("ui.already_member")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
