// 통합 검색 API — 게시글, 병원, 댓글을 한 번에 검색하여 관련도 순으로 반환

import { NextRequest } from "next/server";

// 검색 결과 항목의 유형 — 게시글/병원/댓글
type SearchResultType = "post" | "clinic" | "comment";

// 통합 검색 결과 항목 타입
interface SearchResult {
  type: SearchResultType;  // 결과 항목의 종류
  id: number;
  title: string;           // 게시글 제목 또는 병원명
  excerpt: string;         // 내용 미리보기 (검색어 주변 문맥)
  url: string;             // 해당 항목의 상세 페이지 경로
  relevanceScore: number;  // 검색어와의 관련도 점수 (0~100) — 높을수록 상단 노출
  createdAt: string;       // 항목 생성/등록일
}

// 더미 검색 결과 풀 — 실제 구현 시 전문 검색 엔진(Elasticsearch 등) 또는 DB 전문 검색으로 교체
const DUMMY_RESULTS: SearchResult[] = [
  {
    type: "post",
    id: 1,
    title: "강남 성형외과 후기 공유합니다",
    excerpt: "쌍꺼풀 수술 후 6개월 경과 후기입니다. 자연스럽고 만족스럽습니다.",
    url: "/community/1",
    relevanceScore: 92,
    createdAt: "2026-03-24",
  },
  {
    type: "clinic",
    id: 1,
    title: "강남뷰티성형외과",
    excerpt: "강남구 소재 성형외과. 쌍꺼풀, 코 성형 전문. 외국인 통역 가능.",
    url: "/clinics/1",
    relevanceScore: 88,
    createdAt: "2026-01-15",
  },
  {
    type: "post",
    id: 2,
    title: "코수술 전후 사진 (6개월 경과)",
    excerpt: "코 수술 전후 비교 사진을 공유합니다. 만족도 높습니다.",
    url: "/community/2",
    relevanceScore: 75,
    createdAt: "2026-03-24",
  },
  {
    type: "clinic",
    id: 2,
    title: "압구정 라인클리닉",
    excerpt: "강남구 압구정 소재 피부과. 보톡스, 필러 전문. 일본어 상담 가능.",
    url: "/clinics/2",
    relevanceScore: 70,
    createdAt: "2026-02-01",
  },
];

// GET /api/search?q=검색어 — 통합 검색 실행
// 쿼리 파라미터: q(필수), type(선택), page(기본 1), limit(기본 10)
export async function GET(request: NextRequest) {
  // URL에서 검색 파라미터 추출
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const type = searchParams.get("type") as SearchResultType | null; // 결과 유형 필터
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);

  // 검색어 누락 검증
  if (!query || query.trim().length === 0) {
    return Response.json(
      { error: "q query param is required" },
      { status: 400 }
    );
  }

  // 최소 2글자 이상 입력 강제 — 너무 짧은 검색어는 과도한 결과를 반환하므로 차단
  if (query.trim().length < 2) {
    return Response.json(
      { error: "Search query must be at least 2 characters" },
      { status: 400 }
    );
  }

  // 더미 검색 — 제목과 미리보기 텍스트에서 검색어 포함 여부로 필터링
  // 실제 구현 시 전문 검색 엔진의 형태소 분석 및 역색인 활용
  let results = DUMMY_RESULTS.filter(
    (r) =>
      r.title.includes(query) ||
      r.excerpt.includes(query)
  );

  // 결과 유형 필터 — type 파라미터가 있을 때만 적용 (예: type=clinic)
  if (type) {
    results = results.filter((r) => r.type === type);
  }

  // 관련도 점수 내림차순 정렬 — 가장 관련성 높은 결과를 상단에 노출
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // 페이지네이션 — start 인덱스부터 limit 개수만큼 슬라이싱
  const start = (page - 1) * limit;
  const paginated = results.slice(start, start + limit);

  // 검색어, 결과 목록, 페이지네이션 메타 정보를 함께 반환
  return Response.json({
    success: true,
    query,
    data: paginated,
    pagination: {
      page,
      limit,
      total: results.length,
      totalPages: Math.ceil(results.length / limit),
    },
  });
}
