"use client";

import { useState } from "react";
import Link from "next/link";

// 퀴즈 단계 정의 — 각 단계별 질문과 선택지
const STEPS = [
  {
    step: 1,
    title: "원하는 시술을 선택하세요",
    options: ["성형외과", "피부과", "치과", "안과", "한방/기타"],
  },
  {
    step: 2,
    title: "예산 범위를 선택하세요",
    options: ["50만원 미만", "50~150만원", "150~300만원", "300만원 이상"],
  },
  {
    step: 3,
    title: "선호 지역을 선택하세요",
    options: ["서울 강남", "서울 기타", "부산", "대구", "상관없음"],
  },
  {
    step: 4,
    title: "언어 지원이 필요하신가요?",
    options: ["영어", "일본어", "중국어", "필요없음"],
  },
];

// 추천 결과 더미 데이터 — 실제 AI 추천 API 연동 전 UI 확인용
const RESULTS = [
  {
    id: 1,
    rank: 1,
    name: "강남 뷰티클리닉",
    location: "서울 강남구 신사동",
    specialty: ["성형외과", "피부과"],
    reason: "10년 이상 외국인 환자 전문, 영어·중국어 통역 상시 배치",
    score: 97,
    isAd: false,
  },
  {
    id: 2,
    rank: 2,
    name: "JK 성형외과",
    location: "서울 강남구 청담동",
    specialty: ["성형외과"],
    reason: "쌍꺼풀·코 성형 전문, 사후 관리 프로그램 우수",
    score: 94,
    isAd: false,
  },
  {
    id: 3,
    rank: 3,
    name: "라온 피부과",
    location: "서울 강남구 역삼동",
    specialty: ["피부과"],
    reason: "레이저 시술 특화, 합리적 가격대",
    score: 91,
    isAd: false,
  },
];

// 광고 병원 더미 데이터 — 결과 목록에 삽입되는 광고 슬롯
const AD_CLINIC = {
  id: 99,
  name: "미르 성형외과 [광고]",
  location: "서울 강남구 논현동",
  specialty: ["성형외과", "피부과"],
  reason: "신규 오픈 특가 이벤트 진행 중 — 첫 방문 20% 할인",
  score: null,
  isAd: true,
};

// AI 추천 페이지 — 4단계 퀴즈 후 TOP 3 + 광고 1개 결과 표시
export default function RecommendPage() {
  // currentStep: 0=시작화면, 1~4=퀴즈단계, 5=결과화면
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

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
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm text-center">
          <p className="text-4xl">🤖</p>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">AI 병원 추천</h1>
          <p className="mt-2 text-gray-500">
            4가지 질문에 답하면 나에게 맞는 병원 TOP 3를 추천해 드립니다.
          </p>
          <button
            onClick={() => setCurrentStep(1)}
            className="mt-8 w-full rounded-xl bg-pink-500 py-3 font-semibold text-white hover:bg-pink-600"
          >
            시작하기
          </button>
          <Link href="/" className="mt-3 block text-sm text-gray-400 hover:underline">
            홈으로 돌아가기
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
      <main className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900">AI 추천 결과</h1>
          <p className="mt-1 text-gray-500">선택 조건: {answers.join(" · ")}</p>

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
                    광고
                  </span>
                )}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{clinic.name}</h2>
                    <p className="text-sm text-gray-500">{clinic.location}</p>
                  </div>
                  {/* 추천 점수 — 광고 병원에는 표시하지 않음 */}
                  {clinic.score && (
                    <span className="rounded-full bg-pink-50 px-3 py-1 text-sm font-bold text-pink-600">
                      {clinic.score}점
                    </span>
                  )}
                </div>
                {/* 전문 분야 태그 */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {clinic.specialty.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                {/* 추천 이유 */}
                <p className="mt-3 text-sm text-gray-600">{clinic.reason}</p>
              </div>
            ))}
          </div>

          {/* 재추천 버튼 */}
          <button
            onClick={handleReset}
            className="mt-8 w-full rounded-xl border border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            다시 추천받기
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* 진행 표시바 */}
        <div className="mb-6">
          <div className="mb-2 flex justify-between text-xs text-gray-400">
            <span>Step {currentStep} / {STEPS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-pink-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">{step.title}</h2>

          {/* 선택지 버튼 목록 — 선택된 항목은 핑크 강조 */}
          <div className="mt-6 flex flex-col gap-3">
            {step.options.map((option) => (
              <button
                key={option}
                onClick={() => setSelected(option)}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                  selected === option
                    ? "border-pink-500 bg-pink-50 text-pink-700"
                    : "border-gray-200 text-gray-700 hover:border-pink-200 hover:bg-pink-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* 다음 단계 버튼 — 선택 전 비활성화 */}
          <button
            onClick={handleNext}
            disabled={!selected}
            className="mt-8 w-full rounded-xl bg-pink-500 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-pink-200 hover:bg-pink-600"
          >
            {currentStep === STEPS.length ? "결과 보기" : "다음"}
          </button>
        </div>
      </div>
    </main>
  );
}
