"use client";

// 메인 페이지 병원 조건 검색 — 심평원 실데이터 바로 표시
import { useState } from "react";
import { useTranslations } from "next-intl";
import type { HiraClinic } from "@/lib/hira-api";

// 진료과목
const SPECIALTIES = [
  { value: "", label: "진료과 선택" },
  { value: "08", label: "성형외과" }, { value: "14", label: "피부과" },
  { value: "49", label: "치과" }, { value: "12", label: "안과" },
  { value: "01", label: "내과" }, { value: "02", label: "신경과" },
  { value: "03", label: "정신건강의학과" }, { value: "04", label: "외과" },
  { value: "05", label: "정형외과" }, { value: "06", label: "신경외과" },
  { value: "09", label: "마취통증의학과" }, { value: "13", label: "이비인후과" },
  { value: "15", label: "비뇨의학과" }, { value: "21", label: "재활의학과" },
];

// 시도
const REGIONS = [
  { value: "", label: "지역 선택" },
  { value: "110000", label: "서울" }, { value: "210000", label: "부산" },
  { value: "220000", label: "대구" }, { value: "230000", label: "인천" },
  { value: "240000", label: "광주" }, { value: "250000", label: "대전" },
  { value: "260000", label: "울산" }, { value: "290000", label: "세종" },
  { value: "310000", label: "경기" }, { value: "320000", label: "강원" },
  { value: "340000", label: "충북" }, { value: "360000", label: "충남" },
  { value: "370000", label: "전북" }, { value: "410000", label: "전남" },
  { value: "430000", label: "경북" }, { value: "460000", label: "경남" },
  { value: "500000", label: "제주" },
];

// 병원 유형
const CLINIC_TYPES = [
  { value: "", label: "병원 유형" },
  { value: "01", label: "상급종합병원" }, { value: "11", label: "종합병원" },
  { value: "21", label: "병원" }, { value: "28", label: "요양병원" },
  { value: "31", label: "의원" }, { value: "specialized", label: "전문병원" },
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
  { value: "2", label: "2점 이상" },
];

// 홈페이지
const WEBSITE = [
  { value: "", label: "홈페이지" },
  { value: "yes", label: "있음" }, { value: "no", label: "없음" },
];

export default function ClinicFilter({ locale }: { locale: string }) {
  const t = useTranslations();
  const isKo = locale === "ko";

  const [specialty, setSpecialty] = useState("");
  const [region, setRegion] = useState("");
  const [clinicType, setClinicType] = useState("");
  const [specialist, setSpecialist] = useState("");
  const [doctorCount, setDoctorCount] = useState("");
  const [rating, setRating] = useState("");
  const [website, setWebsite] = useState("");

  // 검색 결과 상태
  const [clinics, setClinics] = useState<HiraClinic[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);

  // 심평원 API 호출 — 메인에서 바로 결과 표시
  const handleSearch = async (newPage = 1) => {
    setLoading(true);
    setPage(newPage);
    try {
      const params = new URLSearchParams();
      if (region) params.set("region", region);
      if (specialty) params.set("subject", specialty);
      if (clinicType && clinicType !== "specialized") params.set("type", clinicType);
      params.set("page", String(newPage));

      const res = await fetch(`/api/hira?${params.toString()}`);
      const data = await res.json();

      setClinics(data.clinics || []);
      setTotalCount(data.totalCount || 0);
      setSearched(true);
    } catch {
      setClinics([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSpecialty(""); setRegion(""); setClinicType("");
    setSpecialist(""); setDoctorCount(""); setRating(""); setWebsite("");
    setClinics([]); setTotalCount(0); setSearched(false);
  };

  const totalPages = Math.ceil(totalCount / 10);
  const selectClass = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 appearance-none";

  return (
    <div>
      {/* 필터 카드 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {t("filter.title" as Parameters<typeof t>[0])}
          </h2>
          <button onClick={handleReset} className="text-xs text-gray-400 hover:text-gray-600 transition">
            {isKo ? "초기화" : "Reset"}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={selectClass}>
            {SPECIALTIES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={region} onChange={(e) => setRegion(e.target.value)} className={selectClass}>
            {REGIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={clinicType} onChange={(e) => setClinicType(e.target.value)} className={selectClass}>
            {CLINIC_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={specialist} onChange={(e) => setSpecialist(e.target.value)} className={selectClass}>
            {SPECIALIST.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={doctorCount} onChange={(e) => setDoctorCount(e.target.value)} className={selectClass}>
            {DOCTOR_COUNTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={rating} onChange={(e) => setRating(e.target.value)} className={selectClass}>
            {RATINGS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={website} onChange={(e) => setWebsite(e.target.value)} className={selectClass}>
            {WEBSITE.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="mt-5">
          <button
            onClick={() => handleSearch(1)}
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300 transition"
          >
            {loading ? (isKo ? "검색 중..." : "Searching...") : t("filter.search_btn" as Parameters<typeof t>[0])}
          </button>
        </div>
      </div>

      {/* 검색 결과 — 메인에서 바로 표시 */}
      {searched && (
        <div className="mt-6">
          <p className="text-sm text-gray-500 mb-4">
            {isKo ? `총 ${totalCount.toLocaleString()}개 병원` : `${totalCount.toLocaleString()} clinics found`}
          </p>

          {clinics.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {isKo ? "검색 결과가 없습니다" : "No results found"}
            </div>
          ) : (
            <div className="space-y-3">
              {clinics.map((clinic, idx) => (
                <div key={clinic.ykiho || idx} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{clinic.yadmNm}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{clinic.clCdNm} · {clinic.dgsbjtCdNm}</p>
                    </div>
                    {clinic.hospUrl && (
                      <a
                        href={clinic.hospUrl.startsWith("http") ? clinic.hospUrl : `http://${clinic.hospUrl}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline shrink-0 ml-3"
                      >
                        {isKo ? "홈페이지" : "Website"}
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{clinic.addr}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                    {clinic.telno && <span>📞 {clinic.telno}</span>}
                    {clinic.drTotCnt > 0 && <span>👨‍⚕️ {isKo ? `의사 ${clinic.drTotCnt}명` : `${clinic.drTotCnt} doctors`}</span>}
                    {(clinic.mdeptSdrCnt || clinic.sdrCnt) > 0 && (
                      <span>🏅 {isKo ? `전문의 ${clinic.mdeptSdrCnt || clinic.sdrCnt}명` : `${clinic.mdeptSdrCnt || clinic.sdrCnt} specialists`}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button onClick={() => handleSearch(page - 1)} disabled={page <= 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50">←</button>
              <span className="px-3 py-1.5 text-sm text-gray-600">{page} / {totalPages}</span>
              <button onClick={() => handleSearch(page + 1)} disabled={page >= totalPages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50">→</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
