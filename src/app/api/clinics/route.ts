// 병원 검색/필터 API — 지역·시술·언어·인증 여부로 필터링, 평점/리뷰수 정렬 지원

import { NextRequest } from "next/server";

// 병원 데이터 구조
interface Clinic {
  id: number;
  name: string;           // 병원명
  district: string;       // 소재 구 (예: 강남구)
  specialties: string[];  // 전문 시술 목록
  phone: string;          // 대표 전화번호
  website: string;        // 공식 웹사이트
  verified: boolean;      // 관리자 인증 여부 — 인증된 병원만 추천 노출
  priceRange: string;     // 시술 가격대 안내
  rating: number;         // 평균 평점 (1.0~5.0)
  reviewCount: number;    // 누적 리뷰 수
  languages: string[];    // 상담 가능 언어 목록 — 외국인 환자 편의를 위한 핵심 정보
  updatedAt: string;      // 병원 정보 최종 수정일
}

// 더미 병원 데이터 — 실제 구현 시 DB에서 fetch
const DUMMY_CLINICS: Clinic[] = [
  {
    id: 1,
    name: "강남뷰티성형외과",
    district: "강남구",
    specialties: ["쌍꺼풀", "코 성형", "지방흡입"],
    phone: "02-1234-5678",
    website: "www.example-clinic1.com",
    verified: true,
    priceRange: "100~300만원",
    rating: 4.8,
    reviewCount: 412,
    languages: ["한국어", "일본어", "영어"],
    updatedAt: "2026-03-10",
  },
  {
    id: 2,
    name: "압구정 라인클리닉",
    district: "강남구",
    specialties: ["보톡스", "필러", "피부 레이저"],
    phone: "02-9876-5432",
    website: "www.example-clinic2.com",
    verified: true,
    priceRange: "50~150만원",
    rating: 4.6,
    reviewCount: 289,
    languages: ["한국어", "일본어", "중국어"],
    updatedAt: "2026-02-28",
  },
  {
    id: 3,
    name: "신촌 아이디어치과",
    district: "서대문구",
    specialties: ["치아교정", "임플란트", "미백"],
    phone: "02-5555-1234",
    website: "www.example-clinic3.com",
    verified: false, // 미인증 병원 — 검수 후 인증 처리 필요
    priceRange: "200~500만원",
    rating: 4.3,
    reviewCount: 156,
    languages: ["한국어", "영어"],
    updatedAt: "2026-01-15",
  },
  {
    id: 4,
    name: "홍대 스킨케어의원",
    district: "마포구",
    specialties: ["여드름", "색소", "피부관리"],
    phone: "02-3333-7890",
    website: "www.example-clinic4.com",
    verified: true,
    priceRange: "30~100만원",
    rating: 4.4,
    reviewCount: 178,
    languages: ["한국어", "영어", "중국어"],
    updatedAt: "2026-03-20",
  },
];

// GET /api/clinics — 병원 목록 조회 (다중 필터 + 정렬 + 페이지네이션)
// 쿼리 파라미터:
//   district   — 지역 필터 (예: "강남구")
//   specialty  — 시술 전문 필터 (예: "코 성형") — 부분 일치
//   language   — 상담 언어 필터 (예: "일본어") — 완전 일치
//   verified   — "true"이면 인증 병원만 반환
//   sortBy     — "rating"(기본) 또는 "reviewCount"
//   page, limit — 페이지네이션
export async function GET(request: NextRequest) {
  // URL에서 필터/정렬/페이지 파라미터 추출
  const { searchParams } = new URL(request.url);
  const district = searchParams.get("district");
  const specialty = searchParams.get("specialty");
  const language = searchParams.get("language");
  const verifiedOnly = searchParams.get("verified") === "true"; // 문자열 "true"를 boolean으로 변환
  const sortBy = searchParams.get("sortBy") ?? "rating"; // 기본 정렬 기준: 평점
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);

  // 원본 배열을 변형하지 않기 위해 복사
  let clinics = [...DUMMY_CLINICS];

  // 지역 필터 — district 파라미터가 있을 때만 적용
  if (district) {
    clinics = clinics.filter((c) => c.district === district);
  }

  // 시술 전문 필터 — specialties 배열에서 부분 일치 검색
  if (specialty) {
    clinics = clinics.filter((c) =>
      c.specialties.some((s) => s.includes(specialty))
    );
  }

  // 상담 언어 필터 — languages 배열에서 완전 일치 검색
  if (language) {
    clinics = clinics.filter((c) => c.languages.includes(language));
  }

  // 인증 병원 전용 필터 — verified=true 파라미터일 때만 적용
  if (verifiedOnly) {
    clinics = clinics.filter((c) => c.verified);
  }

  // 정렬 — reviewCount 지정 시 리뷰 수 기준, 그 외 기본값은 평점 기준 내림차순
  if (sortBy === "reviewCount") {
    clinics.sort((a, b) => b.reviewCount - a.reviewCount);
  } else {
    clinics.sort((a, b) => b.rating - a.rating);
  }

  // 페이지네이션 — start 인덱스부터 limit 개수만큼 슬라이싱
  const start = (page - 1) * limit;
  const paginated = clinics.slice(start, start + limit);

  // 결과 목록, 페이지네이션 메타, 적용된 필터 조건을 함께 반환
  return Response.json({
    success: true,
    data: paginated,
    pagination: {
      page,
      limit,
      total: clinics.length,
      totalPages: Math.ceil(clinics.length / limit),
    },
    filters: { district, specialty, language, verifiedOnly, sortBy },
  });
}
