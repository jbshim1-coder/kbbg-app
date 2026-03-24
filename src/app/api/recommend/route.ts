// AI 병원 추천 API — 퀴즈 답변을 기반으로 적합한 병원 목록을 반환
// 실제 구현 시 이 더미 로직을 AI 매칭 모델로 교체

import { NextRequest } from "next/server";

// 퀴즈 답변 요청 바디 타입
interface QuizAnswers {
  procedure: string;        // 원하는 시술 종류 (예: "쌍꺼풀", "코 성형")
  budget: string;           // 예산 범위 (예: "100~200만원")
  visitDate: string;        // 방문 예정일 (ISO 날짜 문자열)
  concerns: string[];       // 우려 사항 목록 (예: ["회복 기간", "부작용"])
  preferredDistrict?: string; // 선호 지역 — 선택 항목
}

// 추천 결과에 포함되는 병원 타입
interface RecommendedClinic {
  id: number;
  name: string;
  district: string;
  matchScore: number;    // AI 매칭 점수 (0~100) — 높을수록 적합
  specialties: string[];
  priceRange: string;
  reviewCount: number;
  rating: number;
  reason: string;        // 해당 병원을 추천하는 구체적인 이유
}

// 더미 병원 풀 — 실제 구현 시 DB에서 후보군을 불러와 AI 모델로 점수 산출
const DUMMY_CLINICS: RecommendedClinic[] = [
  {
    id: 1,
    name: "강남뷰티성형외과",
    district: "강남구",
    matchScore: 95,
    specialties: ["쌍꺼풀", "코 성형", "지방흡입"],
    priceRange: "100~300만원",
    reviewCount: 412,
    rating: 4.8,
    reason: "요청하신 시술의 전문 클리닉으로 외국인 환자 통역 서비스 제공",
  },
  {
    id: 2,
    name: "압구정 라인클리닉",
    district: "강남구",
    matchScore: 87,
    specialties: ["보톡스", "필러", "피부 레이저"],
    priceRange: "50~150만원",
    reviewCount: 289,
    rating: 4.6,
    reason: "예산 범위 내 최적 옵션, 일본어 상담 가능",
  },
  {
    id: 3,
    name: "홍대 스킨케어의원",
    district: "마포구",
    matchScore: 72,
    specialties: ["여드름", "색소", "피부관리"],
    priceRange: "30~100만원",
    reviewCount: 178,
    rating: 4.4,
    reason: "예산 효율 우수, 접근성 좋음",
  },
];

// POST /api/recommend — 퀴즈 답변을 받아 병원 추천 목록 반환
export async function POST(request: NextRequest) {
  try {
    // 요청 바디를 QuizAnswers 타입으로 파싱
    const body: QuizAnswers = await request.json();

    // 필수 필드(시술명, 예산) 누락 여부 검증
    if (!body.procedure || !body.budget) {
      return Response.json(
        { error: "procedure and budget are required" },
        { status: 400 }
      );
    }

    // 더미 매칭 로직 — 시술명 부분 일치로 후보 필터링 후 matchScore 내림차순 정렬
    // 실제 구현 시 AI 임베딩 유사도 또는 규칙 기반 점수 산출 로직으로 교체
    const recommendations = DUMMY_CLINICS
      .filter((clinic) =>
        clinic.specialties.some((s) =>
          s.includes(body.procedure) || body.procedure.includes(s)
        ) || true // 더미이므로 모든 병원 반환
      )
      .sort((a, b) => b.matchScore - a.matchScore) // 매칭 점수 높은 순 정렬
      .slice(0, 3); // 상위 3개만 반환

    // 추천 결과와 요청 쿼리 정보를 함께 반환
    return Response.json({
      success: true,
      query: {
        procedure: body.procedure,
        budget: body.budget,
        visitDate: body.visitDate,
      },
      recommendations,
      generatedAt: new Date().toISOString(), // 추천 생성 시각 기록
    });
  } catch {
    // JSON 파싱 실패 등 예외 처리
    return Response.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
