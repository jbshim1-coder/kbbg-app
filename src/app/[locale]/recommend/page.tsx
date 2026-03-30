"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

// 퀴즈 단계 정의 — 번역 키를 사용하는 구조로 변경
const STEPS = [
  {
    step: 1,
    titleKey: "recommend.step1_title",
    optionKeys: [
      "recommend.step1_plastic",
      "recommend.step1_derma",
      "recommend.step1_dental",
      "recommend.step1_eye",
      "recommend.step1_other",
    ],
  },
  {
    step: 2,
    titleKey: "recommend.step2_title",
    optionKeys: [
      "recommend.step2_low",
      "recommend.step2_mid",
      "recommend.step2_high",
      "recommend.step2_premium",
    ],
  },
  {
    step: 3,
    titleKey: "recommend.step3_title",
    optionKeys: [
      "recommend.step3_gangnam",
      "recommend.step3_seoul",
      "recommend.step3_busan",
      "recommend.step3_daegu",
      "recommend.step3_other",
    ],
  },
  {
    step: 4,
    titleKey: "recommend.step4_title",
    optionKeys: [
      "recommend.step4_en",
      "recommend.step4_ja",
      "recommend.step4_zh",
      "recommend.step4_no",
    ],
  },
];

// 추천 결과 더미 데이터 — 실제 AI 추천 API 연동 전 UI 확인용
const RESULTS = [
  {
    id: 1,
    rank: 1,
    nameKey: "recommend.result1_name",
    locationKey: "recommend.result1_location",
    specialtyKeys: ["recommend.specialty_plastic", "recommend.specialty_derma"],
    reasonKey: "recommend.result1_reason",
    score: 97,
    isAd: false,
  },
  {
    id: 2,
    rank: 2,
    nameKey: "recommend.result2_name",
    locationKey: "recommend.result2_location",
    specialtyKeys: ["recommend.specialty_plastic"],
    reasonKey: "recommend.result2_reason",
    score: 94,
    isAd: false,
  },
  {
    id: 3,
    rank: 3,
    nameKey: "recommend.result3_name",
    locationKey: "recommend.result3_location",
    specialtyKeys: ["recommend.specialty_derma"],
    reasonKey: "recommend.result3_reason",
    score: 91,
    isAd: false,
  },
];

// 광고 병원 더미 데이터 — 결과 목록에 삽입되는 광고 슬롯
const AD_CLINIC = {
  id: 99,
  nameKey: "recommend.ad_name",
  locationKey: "recommend.ad_location",
  specialtyKeys: ["recommend.specialty_plastic", "recommend.specialty_derma"],
  reasonKey: "recommend.ad_reason",
  score: null,
  isAd: true,
};

// AI 추천 페이지 — 4단계 퀴즈 후 TOP 3 + 광고 1개 결과 표시
export default function RecommendPage() {
  // currentStep: 0=시작화면, 1~4=퀴즈단계, 5=결과화면
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  // 다음 단계로 진행 — 선택한 답변을 누적 저장
  function handleNext() {
    if (!selected) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setSelected(null);
    setCurrentStep((prev) => prev + 1);
  }

  // 퀴즈 초기화 — 처음부터 다시 시작
  function handleReset() {
    setCurrentStep(0);
    setAnswers([]);
    setSelected(null);
  }

  // 시작 화면
  if (currentStep === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm text-center">
          <p className="text-4xl">🤖</p>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">{t("recommend.title")}</h1>
          <p className="mt-2 text-gray-500">{t("recommend.subtitle")}</p>
          <button
            onClick={() => setCurrentStep(1)}
            className="mt-8 w-full rounded-xl bg-slate-800 py-3 font-semibold text-white hover:bg-slate-900"
          >
            {t("recommend.start")}
          </button>
          <Link href={`/${locale}`} className="mt-3 block text-sm text-gray-400 hover:underline">
            {t("recommend.back_home")}
          </Link>
        </div>
      </main>
    );
  }

  // 결과 화면 — 추천 병원 3개 + 광고 1개 노출
  if (currentStep > STEPS.length) {
    // 광고를 두 번째 위치에 삽입
    const allClinics = [RESULTS[0], AD_CLINIC, RESULTS[1], RESULTS[2]];
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900">{t("recommend.results_title")}</h1>
          <p className="mt-1 text-gray-500">{t("recommend.results_subtitle", { conditions: answers.join(" · ") })}</p>

          <div className="mt-6 flex flex-col gap-4">
            {allClinics.map((clinic) => (
              <div
                key={clinic.id}
                className={`rounded-2xl bg-white p-6 shadow-sm ${
                  clinic.isAd ? "border border-yellow-200" : ""
                }`}
              >
                {/* 광고 레이블 — 투명성을 위해 명확하게 표시 */}
                {clinic.isAd && (
                  <span className="mb-2 inline-block rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                    {t("recommend.ad_label")}
                  </span>
                )}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {t(clinic.nameKey as Parameters<typeof t>[0])}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {t(clinic.locationKey as Parameters<typeof t>[0])}
                    </p>
                  </div>
                  {/* 추천 점수 — 광고 병원에는 표시하지 않음 */}
                  {clinic.score && (
                    <span className="rounded-full bg-slate-50 px-3 py-1 text-sm font-bold text-slate-700">
                      {t("recommend.score_label", { score: clinic.score })}
                    </span>
                  )}
                </div>
                {/* 전문 분야 태그 */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {clinic.specialtyKeys.map((key) => (
                    <span
                      key={key}
                      className="rounded-full bg-slate-50 px-2 py-0.5 text-xs text-slate-700"
                    >
                      {t(key as Parameters<typeof t>[0])}
                    </span>
                  ))}
                </div>
                {/* 추천 이유 */}
                <p className="mt-3 text-sm text-gray-600">
                  {t(clinic.reasonKey as Parameters<typeof t>[0])}
                </p>
              </div>
            ))}
          </div>

          {/* 재추천 버튼 */}
          <button
            onClick={handleReset}
            className="mt-8 w-full rounded-xl border border-stone-300 py-3 font-semibold text-gray-700 hover:bg-stone-50"
          >
            {t("recommend.try_again")}
          </button>
        </div>
      </main>
    );
  }

  // 퀴즈 단계 화면
  const step = STEPS[currentStep - 1];
  // 진행률 계산 (0~100%)
  const progress = (currentStep / STEPS.length) * 100;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        {/* 진행 표시바 */}
        <div className="mb-6">
          <div className="mb-2 flex justify-between text-xs text-gray-400">
            <span>Step {currentStep} / {STEPS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-slate-800 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">{t(step.titleKey as Parameters<typeof t>[0])}</h2>

          {/* 선택지 버튼 목록 — 선택된 항목은 핑크 강조 */}
          <div className="mt-6 flex flex-col gap-3">
            {step.optionKeys.map((optionKey) => {
              const label = t(optionKey as Parameters<typeof t>[0]);
              return (
                <button
                  key={optionKey}
                  onClick={() => setSelected(label)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                    selected === label
                      ? "border-pink-500 bg-slate-50 text-pink-700"
                      : "border-gray-200 text-gray-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* 다음 단계 버튼 — 선택 전 비활성화 */}
          <button
            onClick={handleNext}
            disabled={!selected}
            className="mt-8 w-full rounded-xl bg-slate-800 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 hover:bg-slate-900"
          >
            {currentStep === STEPS.length ? t("recommend.get_results") : t("recommend.next")}
          </button>
        </div>
      </div>
    </main>
  );
}
