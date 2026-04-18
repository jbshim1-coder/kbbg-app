// 게시글 CRUD API — 목록 조회(GET), 새 게시글 작성(POST)

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

// 게시글 데이터 구조
interface Post {
  id: number;
  title: string;
  content: string;
  author: string;       // 작성자 사용자명
  country: string;      // 작성자 국적
  category: string;     // 게시글 카테고리 (예: "후기", "질문")
  voteUp: number;       // 추천 수
  voteDown: number;     // 비추천 수
  commentCount: number; // 댓글 수
  createdAt: string;    // 작성 시각 (ISO 8601)
}

// 더미 게시글 데이터 — 실제 구현 시 DB에서 fetch
const DUMMY_POSTS: Post[] = [
  {
    id: 1,
    title: "강남 성형외과 후기 공유합니다",
    content: "쌍꺼풀 수술 후 6개월 경과 후기입니다...",
    author: "user_jp_001",
    country: "일본",
    category: "후기",
    voteUp: 42,
    voteDown: 2,
    commentCount: 8,
    createdAt: "2026-03-24T09:00:00Z",
  },
  {
    id: 2,
    title: "코수술 전후 사진 (6개월 경과)",
    content: "코 수술 전후 비교 사진을 공유합니다...",
    author: "user_cn_042",
    country: "중국",
    category: "후기",
    voteUp: 38,
    voteDown: 5,
    commentCount: 12,
    createdAt: "2026-03-24T10:30:00Z",
  },
  {
    id: 3,
    title: "라식 수술 비용 문의",
    content: "한국 라식 수술 평균 비용이 궁금합니다...",
    author: "user_us_018",
    country: "미국",
    category: "질문",
    voteUp: 5,
    voteDown: 0,
    commentCount: 3,
    createdAt: "2026-03-23T14:00:00Z",
  },
];

// GET /api/posts — 게시글 목록 조회 (카테고리 필터, 페이지네이션 지원)
// 쿼리 파라미터: category(선택), page(기본 1), limit(기본 10)
export async function GET(request: NextRequest) {
  // URL에서 쿼리 파라미터 추출
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);

  // 원본 배열을 변형하지 않기 위해 복사
  let posts = [...DUMMY_POSTS];

  // 카테고리 필터 — category 파라미터가 있을 때만 적용
  if (category) {
    posts = posts.filter((p) => p.category === category);
  }

  // 페이지네이션 — start 인덱스부터 limit 개수만큼 슬라이싱
  const start = (page - 1) * limit;
  const paginated = posts.slice(start, start + limit);

  // 페이지네이션 메타 정보와 함께 반환
  return Response.json({
    success: true,
    data: paginated,
    pagination: {
      page,
      limit,
      total: posts.length,
      totalPages: Math.ceil(posts.length / limit),
    },
  });
}

// POST /api/posts — 새 게시글 생성
// 요청 바디: { title, content, author, country?, category? }
export async function POST(request: NextRequest) {
  // 로그인 사용자만 게시글 작성 가능
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // 필수 필드(제목, 본문, 작성자) 누락 여부 검증
    if (!body.title || !body.content || !body.author) {
      return Response.json(
        { error: "title, content, author are required" },
        { status: 400 }
      );
    }

    // 새 게시글 객체 생성 — 실제 구현 시 DB INSERT 후 생성된 ID 반환
    const newPost: Post = {
      id: DUMMY_POSTS.length + 1, // 더미: 배열 길이 + 1을 임시 ID로 사용
      title: body.title,
      content: body.content,
      author: body.author,
      country: body.country ?? "unknown",  // 국적 미제공 시 "unknown"으로 저장
      category: body.category ?? "일반",   // 카테고리 미제공 시 "일반"으로 분류
      voteUp: 0,
      voteDown: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(), // 현재 시각을 작성 시각으로 기록
    };

    // 201 Created와 함께 생성된 게시글 반환
    return Response.json({ success: true, data: newPost }, { status: 201 });
  } catch {
    // JSON 파싱 실패 등 예외 처리
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
}
