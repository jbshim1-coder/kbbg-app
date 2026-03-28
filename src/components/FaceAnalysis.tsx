"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export default function FaceAnalysis({ locale }: { locale: string }) {
  const isKo = locale === "ko";
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
    if (fileRef.current) fileRef.current.value = "";
  };

  // 간단한 마크다운 볼드 처리
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

  return (
    <div className="bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl border border-violet-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🪞</span>
        <h3 className="text-lg font-bold text-gray-900">
          {isKo ? "AI 얼굴 분석" : "AI Face Analysis"}
        </h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        {isKo
          ? "셀카를 업로드하면 AI가 맞춤 시술을 추천해드립니다"
          : "Upload a selfie and AI will recommend procedures for you"}
      </p>

      {!image ? (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full py-8 border-2 border-dashed border-violet-200 rounded-xl hover:border-violet-400 hover:bg-violet-50/50 transition flex flex-col items-center gap-2"
        >
          <span className="text-3xl">📸</span>
          <span className="text-sm font-medium text-violet-600">
            {isKo ? "셀카 업로드 (클릭)" : "Upload Selfie (Click)"}
          </span>
          <span className="text-xs text-gray-400">JPG, PNG · 5MB {isKo ? "이하" : "max"}</span>
        </button>
      ) : !analysis ? (
        <div className="space-y-3">
          <div className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="selfie" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 py-2 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
            >
              {isKo ? "다시 선택" : "Re-select"}
            </button>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="flex-1 py-2 text-sm rounded-xl bg-violet-500 text-white font-semibold hover:bg-violet-600 transition disabled:opacity-50"
            >
              {loading
                ? (isKo ? "AI 분석 중..." : "Analyzing...")
                : (isKo ? "AI 분석 시작" : "Start Analysis")}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 text-sm text-gray-700 leading-relaxed max-h-80 overflow-y-auto">
            {renderText(analysis)}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
            >
              {isKo ? "다시 분석" : "Analyze Again"}
            </button>
            <Link
              href={`/${locale}/recommend`}
              className="flex-1 py-2.5 text-sm text-center rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600 transition"
            >
              {isKo ? "맞춤 병원 추천" : "Get Clinic Recommendations"}
            </Link>
          </div>
          <p className="text-[10px] text-gray-400 text-center">
            {isKo
              ? "※ 이 분석은 AI 참고 정보이며 의료 진단이 아닙니다"
              : "※ This analysis is AI reference information, not medical diagnosis"}
          </p>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-500 text-center">{error}</p>}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
