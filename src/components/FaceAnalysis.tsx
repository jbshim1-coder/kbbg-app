"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function FaceAnalysis({ locale }: { locale: string }) {
  const isKo = locale === "ko";
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "en";
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [subjectCodes, setSubjectCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // 광고 상태
  const [topAd, setTopAd] = useState<{ hospitalName: string; title: string; description?: string; linkUrl?: string } | null>(null);
  useEffect(() => {
    fetch("/api/admin/ads").then(r => r.json()).then(d => {
      const ads = d.ads || [];
      setTopAd(ads[0] ?? null);
    }).catch(() => {});
  }, []);


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
    setFullscreen(false);
    if (fileRef.current) fileRef.current.value = "";
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

  // 메인 섹션용 가로형 카드
  const mainCard = (
    <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl border border-gray-200 p-6 sm:p-8">
      {/* 헤더 — 시술 시뮬레이션 컨셉 */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isKo ? "시술하면 어떻게 달라질까?" : "What Would You Look Like After?"}
        </h2>
        <p className="text-base text-gray-600 mt-2">
          {isKo
            ? "셀카 한 장이면 AI가 맞춤 시술을 분석해드립니다"
            : "One selfie — AI analyzes the best procedures for you"}
        </p>
        <div className="flex justify-center gap-4 mt-3 text-xs text-gray-400">
          <span>✓ {isKo ? "무료" : "Free"}</span>
          <span>✓ {isKo ? "30초 분석" : "30 sec"}</span>
          <span>✓ {isKo ? "맞춤 병원 연결" : "Hospital match"}</span>
        </div>
      </div>

      {!image ? (
        /* 업로드 영역 — 호기심 자극 */

        <button
          onClick={() => fileRef.current?.click()}
          className="mx-auto block w-full max-w-md py-10 border-2 border-dashed border-gray-300 rounded-2xl hover:border-slate-400 hover:bg-slate-50/30 transition group"
        >
          <div className="flex flex-col items-center gap-3">
            <span className="text-5xl group-hover:scale-110 transition-transform">📸</span>
            <span className="text-base font-bold text-gray-800">
              {isKo ? "내 얼굴에 맞는 시술 확인하기" : "Find the Best Procedure for Your Face"}
            </span>
            <span className="text-xs text-gray-400">JPG, PNG · 5MB {isKo ? "이하" : "max"}</span>
          </div>
        </button>
      ) : !analysis ? (
        /* 미리보기 + 분석 시작 */
        <div className="flex flex-col items-center gap-4">
          <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm">
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
              className="px-8 py-2.5 text-sm rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-900 transition disabled:opacity-50"
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
              <p className="text-sm text-slate-700 font-medium animate-pulse">
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
              className="px-8 py-3 text-sm rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
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
        capture="user"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );

  // 전체 화면 모달
  const fullscreenModal = fullscreen && analysis && (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto">
      <div className="w-full max-w-4xl mx-2 sm:mx-4 my-4 sm:my-8 bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* 모달 헤더 */}
        <div className="sticky top-0 z-10 bg-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between">
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
              <div className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-gray-100 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image!} alt="selfie" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* 분석 텍스트 */}
            <div className="flex-1 bg-gray-50 rounded-2xl p-5 text-sm text-gray-700 leading-relaxed max-h-[400px] overflow-y-auto">
              {renderText(analysis)}
            </div>
          </div>

          {/* 광고 */}
          {topAd && (
            <div className="mb-6 bg-stone-50 border border-stone-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-rose-500 bg-stone-200 px-2 py-0.5 rounded-full">광고</span>
                <span className="text-xs text-gray-500">{topAd.hospitalName}</span>
              </div>
              <p className="font-semibold text-gray-800">{topAd.title}</p>
              {topAd.description && <p className="text-sm text-gray-600 mt-1">{topAd.description}</p>}
              {topAd.linkUrl && (
                <a href={topAd.linkUrl} target="_blank" rel="noopener noreferrer sponsored"
                  className="inline-block mt-2 text-xs text-gray-500 hover:underline">
                  {isKo ? "자세히 보기 →" : "Learn more →"}
                </a>
              )}
            </div>
          )}

          {/* 면책 조항 */}
          <p className="text-[11px] text-gray-400 text-center mb-6">
            {isKo
              ? "※ 이 분석은 AI 참고 정보이며 의료 진단이 아닙니다. 실제 상담은 전문의와 진행하세요."
              : "※ This is AI reference information, not medical diagnosis. Please consult a specialist."}
          </p>

          {/* 맞춤 병원 추천 — 강남/서초 피부과·성형외과 */}
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-500 mb-4">
              {isKo ? "강남·서초 지역 전문 클리닉을 추천합니다" : "Recommending clinics in Gangnam & Seocho"}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => router.push(`/${currentLocale}/hospitals?dept=14&region=110000`)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-900 transition min-h-[44px]"
              >
                🏥 {isKo ? "강남·서초 피부과 보기" : "Gangnam Dermatology"}
              </button>
              <button
                onClick={() => router.push(`/${currentLocale}/hospitals?dept=08&region=110000`)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-900 transition min-h-[44px]"
              >
                🏥 {isKo ? "강남·서초 성형외과 보기" : "Gangnam Plastic Surgery"}
              </button>
            </div>
            <button
              onClick={() => router.push(`/${currentLocale}`)}
              className="text-xs text-gray-400 hover:text-gray-600 mt-2"
            >
              {isKo ? "← 홈으로 돌아가기" : "← Back to Home"}
            </button>
          </div>

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
              className="px-6 py-2.5 text-sm rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-900 transition"
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
