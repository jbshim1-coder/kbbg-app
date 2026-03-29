"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AiSearchBox from "@/components/AiSearchBox";

const SLIDES = [
  { src: "/hero/seoul-night.jpg", alt: "Seoul Night" },
  { src: "/hero/myeongdong.jpg", alt: "Myeongdong" },
  { src: "/hero/hangang.jpg", alt: "Han River" },
  { src: "/hero/lotte-tower.jpg", alt: "Lotte Tower" },
];

export default function HeroSlider({ locale }: { locale: string }) {
  const [current, setCurrent] = useState(0);
  const isKo = locale === "ko";

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[480px] sm:h-[520px] overflow-hidden">
      {/* 배경 이미지 롤링 */}
      {SLIDES.map((slide, idx) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-1000 ${
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

      {/* 어두운 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />

      {/* 콘텐츠 오버레이 */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
          {isKo ? "한국에서 나만의 뷰티를 찾다" : "Find Your Beauty in Korea"}
        </h1>
        <p className="mt-3 text-base sm:text-lg text-white/80 max-w-xl">
          {isKo
            ? "AI가 심평원·구글·네이버 데이터를 종합 분석하여 최적의 병원을 추천합니다"
            : "AI analyzes HIRA, Google & Naver data to recommend the best clinics for you"}
        </p>

        {/* AI 검색 바 */}
        <div className="mt-6 w-full max-w-2xl">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
            <AiSearchBox locale={locale} />
          </div>
        </div>

        {/* 하단 지표 */}
        <div className="mt-4 flex gap-6 text-sm text-white/70">
          <span>✓ {isKo ? "무료 AI 분석" : "Free AI Analysis"}</span>
          <span>✓ {isKo ? "36,000+ 병원" : "36,000+ Clinics"}</span>
          <span>✓ {isKo ? "8개국 언어" : "8 Languages"}</span>
        </div>

        {/* 슬라이드 인디케이터 */}
        <div className="mt-5 flex gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === current ? "bg-white w-6" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
