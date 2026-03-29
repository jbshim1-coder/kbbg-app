"use client";

// 메인 페이지 병원 조건 검색 — 심평원 실데이터만 사용
import { useState } from "react";
import type { HiraClinic } from "@/lib/hira-api";

// 진료과목
const SPECIALTIES = [
  { value: "", label: "진료과 선택", labelEn: "Select Specialty" },
  { value: "08", label: "성형외과", labelEn: "Plastic Surgery" },
  { value: "14", label: "피부과", labelEn: "Dermatology" },
  { value: "49", label: "치과", labelEn: "Dental" },
  { value: "12", label: "안과", labelEn: "Ophthalmology" },
  { value: "01", label: "내과", labelEn: "Internal Medicine" },
  { value: "10", label: "산부인과", labelEn: "OB/GYN" },
  { value: "05", label: "정형외과", labelEn: "Orthopedics" },
  { value: "13", label: "이비인후과", labelEn: "ENT" },
  { value: "15", label: "비뇨의학과", labelEn: "Urology" },
  { value: "21", label: "재활의학과", labelEn: "Rehabilitation" },
];

// 시도 (심평원 실제 코드)
const REGIONS = [
  { value: "", label: "지역 선택", labelEn: "Select Region" },
  { value: "110000", label: "서울", labelEn: "Seoul" },
  { value: "210000", label: "부산", labelEn: "Busan" },
  { value: "220000", label: "대구", labelEn: "Daegu" },
  { value: "230000", label: "인천", labelEn: "Incheon" },
  { value: "240000", label: "광주", labelEn: "Gwangju" },
  { value: "250000", label: "대전", labelEn: "Daejeon" },
  { value: "260000", label: "울산", labelEn: "Ulsan" },
  { value: "310000", label: "경기", labelEn: "Gyeonggi" },
  { value: "320000", label: "강원", labelEn: "Gangwon" },
  { value: "330000", label: "충북", labelEn: "Chungbuk" },
  { value: "340000", label: "충남", labelEn: "Chungnam" },
  { value: "350000", label: "전북", labelEn: "Jeonbuk" },
  { value: "360000", label: "전남", labelEn: "Jeonnam" },
  { value: "370000", label: "경북", labelEn: "Gyeongbuk" },
  { value: "380000", label: "경남", labelEn: "Gyeongnam" },
  { value: "390000", label: "제주", labelEn: "Jeju" },
  { value: "410000", label: "세종", labelEn: "Sejong" },
];

export default function ClinicFilter({ locale }: { locale: string }) {
  const isKo = locale === "ko";

  const [specialty, setSpecialty] = useState("");
  const [region, setRegion] = useState("");
  const [clinics, setClinics] = useState<HiraClinic[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);

  const handleSearch = async (newPage = 1) => {
    setLoading(true);
    setPage(newPage);
    try {
      const params = new URLSearchParams();
      if (region) params.set("region", region);
      if (specialty) params.set("subject", specialty);
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
    setSpecialty("");
    setRegion("");
    setClinics([]);
    setTotalCount(0);
    setSearched(false);
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / 10);

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-stone-800">
            {isKo ? "병원 찾기" : "Find Clinics"}
          </h3>
        </div>
        {searched && (
          <button onClick={handleReset} className="text-xs text-stone-400 hover:text-stone-600">
            {isKo ? "초기화" : "Reset"}
          </button>
        )}
      </div>

      {/* 필터: 진료과 + 지역 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="px-3 py-2.5 border border-stone-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
        >
          {SPECIALTIES.map((s) => (
            <option key={s.value} value={s.value}>{isKo ? s.label : s.labelEn}</option>
          ))}
        </select>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="px-3 py-2.5 border border-stone-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
        >
          {REGIONS.map((r) => (
            <option key={r.value} value={r.value}>{isKo ? r.label : r.labelEn}</option>
          ))}
        </select>
      </div>

      {/* 검색 버튼 */}
      <button
        onClick={() => handleSearch(1)}
        disabled={loading}
        className="w-full py-2.5 bg-rose-400 text-white text-sm font-semibold rounded-lg hover:bg-rose-500 disabled:bg-rose-300 transition"
      >
        {loading ? (isKo ? "검색 중..." : "Searching...") : (isKo ? "병원 검색" : "Search")}
      </button>

      {/* 검색 결과 */}
      {searched && (
        <div className="mt-5">
          <p className="text-xs text-stone-400 mb-3">
            {isKo ? `총 ${totalCount.toLocaleString()}개 병원` : `${totalCount.toLocaleString()} clinics found`}
          </p>

          {clinics.length === 0 ? (
            <p className="text-center text-sm text-stone-400 py-8">
              {isKo ? "검색 결과가 없습니다" : "No results found"}
            </p>
          ) : (
            <div className="space-y-3">
              {clinics.map((c, idx) => (
                <div key={c.ykiho || idx} className="bg-stone-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-stone-800 text-sm">{c.yadmNm}</h4>
                      <p className="text-xs text-stone-400 mt-0.5">{c.clCdNm} · {c.dgsbjtCdNm}</p>
                    </div>
                    {c.hospUrl && (
                      <a
                        href={c.hospUrl.startsWith("http") ? c.hospUrl : `http://${c.hospUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-rose-500 hover:underline shrink-0 ml-2"
                      >
                        {isKo ? "홈페이지" : "Website"}
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mt-1.5">{c.addr}</p>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-stone-400">
                    {c.telno && <span>📞 {c.telno}</span>}
                    {c.drTotCnt > 0 && <span>{isKo ? `의사 ${c.drTotCnt}명` : `${c.drTotCnt} doctors`}</span>}
                    {(c.sdrCnt > 0 || c.mdeptSdrCnt > 0) && <span>{isKo ? `전문의 ${c.sdrCnt || c.mdeptSdrCnt}명` : `${c.sdrCnt || c.mdeptSdrCnt} specialists`}</span>}
                    {c.googleRating && <span>⭐ {c.googleRating} · {isKo ? "리뷰" : "Reviews"} {c.googleReviewCount || 0}{isKo ? "건" : ""}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button onClick={() => handleSearch(page - 1)} disabled={page <= 1}
                className="px-3 py-1.5 text-xs border border-stone-200 rounded-lg disabled:opacity-30 hover:bg-stone-50">←</button>
              <span className="px-3 py-1.5 text-xs text-stone-500">{page} / {totalPages}</span>
              <button onClick={() => handleSearch(page + 1)} disabled={page >= totalPages}
                className="px-3 py-1.5 text-xs border border-stone-200 rounded-lg disabled:opacity-30 hover:bg-stone-50">→</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
