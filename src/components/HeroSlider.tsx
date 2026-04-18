"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AiSearchBox from "@/components/AiSearchBox";

const SLIDES = [
  { src: "/hero/korea1.jpg", alt: "Korea 1" },
  { src: "/hero/korea2.jpg", alt: "Korea 2" },
  { src: "/hero/korea3.jpg", alt: "Korea 3" },
  { src: "/hero/korea4.jpg", alt: "Korea 4" },
];

export default function HeroSlider({ locale }: { locale: string }) {
  const [current, setCurrent] = useState(0);
  const isKo = locale === "ko";

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[380px] sm:h-[480px] lg:h-[580px] overflow-hidden bg-black">
      {/* 배경 이미지 — 크로스페이드 */}
      {SLIDES.map((slide, idx) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
            idx === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            className="object-cover"
            priority={idx === 0}
            sizes="100vw"
          />
        </div>
      ))}

      {/* 시네마틱 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* 콘텐츠 — Apple 타이포 */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center max-w-[980px] mx-auto">
        <h1 className="apple-display text-4xl sm:text-5xl lg:text-[56px] text-white">
          {isKo ? "한국에서 나만의 뷰티를 찾다" : "Find Your Beauty in Korea"}
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-white/80 max-w-2xl apple-body">
          {isKo
            ? "AI가 심평원·구글·네이버 데이터를 종합 분석하여 최적의 병원을 추천합니다"
            : "AI analyzes HIRA, Google & Naver data to recommend the best clinics for you"}
        </p>

        {/* AI 검색 바 — 글래스 효과 */}
        <div className="mt-8 w-full max-w-2xl">
          <div className="bg-white/15 backdrop-blur-md rounded-[var(--radius-lg)] p-4">
            <AiSearchBox locale={locale} />
          </div>
        </div>

        {/* 하단 지표 — Apple 캡션 스타일 */}
        <div className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 apple-caption text-white/60">
          <span>✓ {isKo ? "무료 AI 분석" : "Free AI Analysis"}</span>
          <span>✓ {isKo ? "36,000+ 병원" : "36,000+ Clinics"}</span>
          <span>✓ {isKo ? "8개국 언어" : "8 Languages"}</span>
        </div>

        {/* 슬라이드 인디케이터 — 미니멀 */}
        <div className="mt-4 flex gap-1.5">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              aria-label={`Slide ${idx + 1}`}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <span className={`block rounded-full transition-all duration-500 h-1.5 ${
                idx === current ? "bg-white w-8" : "bg-white/30 w-1.5"
              }`} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
