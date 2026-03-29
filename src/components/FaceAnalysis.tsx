"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SIDO_CODES, SUBJECT_CODES } from "@/lib/hira-api";
import type { HiraClinic } from "@/lib/hira-api";

export default function FaceAnalysis({ locale }: { locale: string }) {
  const isKo = locale === "ko";
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [subjectCodes, setSubjectCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // 병원 추천 상태
  const [showHospitals, setShowHospitals] = useState(false);
  const [region, setRegion] = useState("110000"); // 서울 기본
  const [selectedSubject, setSelectedSubject] = useState("");
  const [hospType, setHospType] = useState("31"); // 의원 기본 (AI 추천 맥락)
  const [clinics, setClinics] = useState<HiraClinic[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hospLoading, setHospLoading] = useState(false);
  const [hospPage, setHospPage] = useState(1);

  // ESC 키로 전체화면 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    if (fullscreen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [fullscreen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError(isKo ? "파일 크기는 5MB 이하만 가능합니다" : "File size must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setAnalysis(null);
      setError(null);
      setShowHospitals(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/face-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, locale }),
      });
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
        setSubjectCodes(data.subjectCodes || ["08"]);
        setSelectedSubject(data.subjectCodes?.[0] || "08");
        setFullscreen(true); // 분석 완료 시 전체 화면으로
      } else {
        setError(data.error || (isKo ? "분석에 실패했습니다" : "Analysis failed"));
      }
    } catch {
      setError(isKo ? "서버 연결에 실패했습니다" : "Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setAnalysis(null);
    setError(null);
    setShowHospitals(false);
    setFullscreen(false);
    setClinics([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  // 병원 검색
  const fetchHospitals = useCallback(async (pageNo = 1) => {
    setHospLoading(true);
    setHospPage(pageNo);
    try {
      const params = new URLSearchParams();
      if (region) params.set("region", region);
      if (selectedSubject) params.set("subject", selectedSubject);
      if (hospType) params.set("type", hospType);
      params.set("page", String(pageNo));
      const res = await fetch(`/api/hira?${params.toString()}`);
      const data = await res.json();
      setClinics(data.clinics || []);
      setTotalCount(data.totalCount || 0);
    } catch {
      setClinics([]);
      setTotalCount(0);
    } finally {
      setHospLoading(false);
    }
  }, [region, selectedSubject, hospType]);

  // 맞춤 병원 추천 클릭
  const handleRecommendClick = () => {
    setShowHospitals(true);
    fetchHospitals(1);
  };

  // 필터 변경 시 재검색
  const handleFilterChange = () => {
    fetchHospitals(1);
  };

  // 마크다운 볼드 처리
  const renderText = (text: string) => {
    return text.split("\n").map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={j} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
        }
        return <span key={j}>{part}</span>;
      });
      return <p key={i} className="mb-1.5">{parts}</p>;
    });
  };

  const totalPages = Math.ceil(totalCount / 10);

  // 메인 섹션용 가로형 카드
  const mainCard = (
    <div className="bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl border border-violet-100 p-6 sm:p-8">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <span className="text-4xl">🪞</span>
        <h2 className="text-2xl font-bold text-gray-900 mt-2">
          {isKo ? "AI 얼굴 분석" : "AI Face Analysis"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isKo
            ? "셀카를 업로드하면 AI가 맞춤 시술을 추천하고 병원까지 연결해드립니다"
            : "Upload a selfie — AI recommends procedures and connects you to the right hospital"}
        </p>
      </div>

      {!image ? (
        /* 업로드 영역 */
        <button
          onClick={() => fileRef.current?.click()}
          className="mx-auto block w-full max-w-md py-12 border-2 border-dashed border-violet-200 rounded-2xl hover:border-violet-400 hover:bg-violet-50/50 transition"
        >
          <div className="flex flex-col items-center gap-3">
            <span className="text-5xl">📸</span>
            <span className="text-base font-medium text-violet-600">
              {isKo ? "셀카 업로드 (클릭)" : "Upload Selfie (Click)"}
            </span>
            <span className="text-xs text-gray-400">JPG, PNG · 5MB {isKo ? "이하" : "max"}</span>
          </div>
        </button>
      ) : !analysis ? (
        /* 미리보기 + 분석 시작 */
        <div className="flex flex-col items-center gap-4">
          <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-violet-200 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="selfie" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
            >
              {isKo ? "다시 선택" : "Re-select"}
            </button>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-8 py-2.5 text-sm rounded-xl bg-violet-500 text-white font-semibold hover:bg-violet-600 transition disabled:opacity-50"
            >
              {loading
                ? (isKo ? "AI 분석 중..." : "Analyzing...")
                : (isKo ? "AI 분석 시작" : "Start Analysis")}
            </button>
          </div>
          {loading && (
            <div className="mt-6 flex flex-col items-center gap-3">
              <div className="relative w-16 h-16">
                <span className="absolute inset-0 flex items-center justify-center text-3xl animate-spin" style={{ animationDuration: "2s" }}>⏳</span>
              </div>
              <p className="text-sm text-violet-600 font-medium animate-pulse">
                {isKo ? "AI가 분석하고 있습니다. 잠시만 기다려주세요..." : "AI is analyzing your photo. Please wait..."}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* 분석 완료 → 결과 보기 유도 */
        <div className="flex flex-col items-center gap-4">
          <p className="text-base text-green-600 font-semibold">
            {isKo ? "✅ 분석 완료! 결과를 확인하세요" : "✅ Done! Check your results"}
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
            >
              {isKo ? "다시 분석" : "Analyze Again"}
            </button>
            <button
              onClick={() => setFullscreen(true)}
              className="px-8 py-3 text-sm rounded-xl bg-gradient-to-r from-teal-500 to-rose-500 text-white font-bold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {isKo ? "🪞 분석 결과 & 맞춤 병원 보기" : "🪞 View Results & Hospital Match"}
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-xs text-red-500 text-center">{error}</p>}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );

  // 전체 화면 모달
  const fullscreenModal = fullscreen && analysis && (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto">
      <div className="w-full max-w-4xl mx-4 my-8 bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* 모달 헤더 */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-violet-600 to-pink-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🪞</span>
            <h2 className="text-lg font-bold text-white">
              {isKo ? "AI 얼굴 분석 결과" : "AI Face Analysis Results"}
            </h2>
          </div>
          <button
            onClick={() => setFullscreen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white text-xl transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {/* 분석 결과 섹션 */}
          <div className="flex flex-col sm:flex-row gap-6 mb-8">
            {/* 업로드된 이미지 */}
            <div className="shrink-0 mx-auto sm:mx-0">
              <div className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-violet-100 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image!} alt="selfie" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* 분석 텍스트 */}
            <div className="flex-1 bg-gray-50 rounded-2xl p-5 text-sm text-gray-700 leading-relaxed max-h-[400px] overflow-y-auto">
              {renderText(analysis)}
            </div>
          </div>

          {/* 면책 조항 */}
          <p className="text-[11px] text-gray-400 text-center mb-6">
            {isKo
              ? "※ 이 분석은 AI 참고 정보이며 의료 진단이 아닙니다. 실제 상담은 전문의와 진행하세요."
              : "※ This is AI reference information, not medical diagnosis. Please consult a specialist."}
          </p>

          {/* 맞춤 병원 추천 버튼 */}
          {!showHospitals ? (
            <div className="text-center">
              <button
                onClick={handleRecommendClick}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-rose-500 text-white text-base font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span className="text-xl">🏥</span>
                {isKo ? "분석 결과 기반 맞춤 병원 추천받기" : "Get Hospital Recommendations"}
              </button>
              <p className="text-xs text-gray-400 mt-2">
                {isKo
                  ? "서울 지역 기준으로 추천하며, 이후 지역 변경이 가능합니다"
                  : "Defaults to Seoul area. You can change the region after."}
              </p>
            </div>
          ) : (
            <div>
              {/* 병원 추천 헤더 */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🏥</span>
                <h3 className="text-lg font-bold text-gray-900">
                  {isKo ? "맞춤 병원 추천" : "Recommended Hospitals"}
                </h3>
              </div>

              {/* 필터 */}
              <div className="flex flex-wrap gap-3 mb-5 bg-gray-50 rounded-xl p-4">
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {isKo ? "지역" : "Region"}
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                  >
                    {Object.entries(SIDO_CODES).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {isKo ? "진료과" : "Specialty"}
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                  >
                    {/* AI가 추천한 진료과를 상단에 표시 */}
                    {subjectCodes.map((code) => (
                      <option key={`ai-${code}`} value={code}>
                        ⭐ {SUBJECT_CODES[code] || code} {isKo ? "(AI 추천)" : "(AI pick)"}
                      </option>
                    ))}
                    <option disabled>──────────</option>
                    {Object.entries(SUBJECT_CODES)
                      .filter(([code]) => !subjectCodes.includes(code))
                      .map(([code, name]) => (
                        <option key={code} value={code}>{name}</option>
                      ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {isKo ? "병원 유형" : "Type"}
                  </label>
                  <select
                    value={hospType}
                    onChange={(e) => setHospType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                  >
                    <option value="">{isKo ? "전체" : "All"}</option>
                    <option value="31">{isKo ? "의원 (전문클리닉)" : "Clinic"}</option>
                    <option value="21">{isKo ? "병원" : "Hospital"}</option>
                    <option value="11">{isKo ? "종합병원" : "General Hospital"}</option>
                    <option value="01">{isKo ? "상급종합" : "Tertiary Hospital"}</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleFilterChange}
                    disabled={hospLoading}
                    className="px-6 py-2 bg-violet-500 text-white text-sm font-semibold rounded-xl hover:bg-violet-600 disabled:opacity-50 transition"
                  >
                    {hospLoading
                      ? (isKo ? "검색 중..." : "Searching...")
                      : (isKo ? "재검색" : "Search")}
                  </button>
                </div>
              </div>

              {/* 검색 결과 수 */}
              {totalCount > 0 && (
                <p className="text-sm text-gray-500 mb-3">
                  {isKo
                    ? `${SIDO_CODES[region] || ""} ${SUBJECT_CODES[selectedSubject] || ""} — 총 ${totalCount.toLocaleString()}개 병원`
                    : `${totalCount.toLocaleString()} clinics found`}
                </p>
              )}

              {/* 병원 목록 */}
              {hospLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-3 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
                  <p className="text-sm text-gray-400 mt-3">
                    {isKo ? "맞춤 병원을 찾고 있습니다..." : "Finding matching hospitals..."}
                  </p>
                </div>
              ) : clinics.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  {isKo ? "검색 결과가 없습니다. 다른 조건을 선택해보세요." : "No results. Try different filters."}
                </div>
              ) : (
                <div className="space-y-3">
                  {clinics.map((clinic, idx) => (
                    <div
                      key={clinic.ykiho || idx}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-800">{clinic.yadmNm}</h4>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {clinic.clCdNm} · {clinic.dgsbjtCdNm}
                          </p>
                        </div>
                        {clinic.hospUrl && (
                          <a
                            href={clinic.hospUrl.startsWith("http") ? clinic.hospUrl : `http://${clinic.hospUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-teal-500 hover:underline shrink-0 ml-3"
                          >
                            {isKo ? "홈페이지" : "Website"}
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{clinic.addr}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                        {clinic.telno && <span>📞 {clinic.telno}</span>}
                        {clinic.drTotCnt > 0 && (
                          <span>👨‍⚕️ {isKo ? `의사 ${clinic.drTotCnt}명` : `${clinic.drTotCnt} doctors`}</span>
                        )}
                        {(clinic.sdrCnt > 0 || clinic.mdeptSdrCnt > 0) && (
                          <span>🏅 {isKo ? `전문의 ${clinic.sdrCnt || clinic.mdeptSdrCnt}명` : `${clinic.sdrCnt || clinic.mdeptSdrCnt} specialists`}</span>
                        )}
                        {clinic.googleRating && (
                          <span>⭐ {clinic.googleRating} ({clinic.googleReviewCount})</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button
                    onClick={() => fetchHospitals(hospPage - 1)}
                    disabled={hospPage <= 1 || hospLoading}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50"
                  >
                    ←
                  </button>
                  <span className="px-3 py-1.5 text-sm text-gray-600">
                    {hospPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => fetchHospitals(hospPage + 1)}
                    disabled={hospPage >= totalPages || hospLoading}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 하단 버튼 */}
          <div className="flex justify-center gap-3 mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
            >
              {isKo ? "새로 분석하기" : "New Analysis"}
            </button>
            <button
              onClick={() => setFullscreen(false)}
              className="px-6 py-2.5 text-sm rounded-xl bg-gray-800 text-white font-semibold hover:bg-gray-900 transition"
            >
              {isKo ? "닫기" : "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mainCard}
      {fullscreenModal}
    </>
  );
}
