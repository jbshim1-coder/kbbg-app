// 댓글 CRUD API — 게시글별 댓글 목록 조회(GET), 댓글 작성(POST), 댓글 삭제(DELETE)

import { NextRequest } from "next/server";

// 댓글 데이터 구조
interface Comment {
  id: number;
  postId: number;    // 댓글이 달린 게시글 ID
  author: string;    // 댓글 작성자 사용자명
  country: string;   // 작성자 국적
  content: string;   // 댓글 본문
  voteUp: number;    // 댓글 추천 수
  createdAt: string; // 작성 시각 (ISO 8601)
}

// 더미 댓글 데이터 — 실제 구현 시 DB에서 postId 기준으로 fetch
const DUMMY_COMMENTS: Comment[] = [
  {
    id: 1,
    postId: 1, // 게시글 1번에 달린 댓글
    author: "user_cn_010",
    country: "중국",
    content: "정말 도움이 되는 후기네요! 저도 같은 병원 고민 중입니다.",
    voteUp: 12,
    createdAt: "2026-03-24T10:00:00Z",
  },
  {
    id: 2,
    postId: 1, // 게시글 1번에 달린 댓글
    author: "user_th_003",
    country: "태국",
    content: "수술 후 붓기는 얼마나 걸렸나요?",
    voteUp: 5,
    createdAt: "2026-03-24T11:30:00Z",
  },
  {
    id: 3,
    postId: 2, // 게시글 2번에 달린 댓글
    author: "user_sg_021",
    country: "싱가포르",
    content: "비교 사진 공유 감사합니다. 자연스러워 보여요.",
    voteUp: 8,
    createdAt: "2026-03-24T12:00:00Z",
  },
];

// GET /api/comments?postId=N — 특정 게시글의 댓글 목록 조회
// postId 쿼리 파라미터 필수
export async function GET(request: NextRequest) {
  // URL에서 postId 쿼리 파라미터 추출
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");

  // postId 누락 시 400 반환
  if (!postId) {
    return Response.json(
      { error: "postId query param is required" },
      { status: 400 }
    );
  }

  // 해당 게시글에 속하는 댓글만 필터링
  const comments = DUMMY_COMMENTS.filter(
    (c) => c.postId === parseInt(postId, 10)
  );

  // 댓글 목록과 총 건수 반환
  return Response.json({
    success: true,
    data: comments,
    total: comments.length,
  });
}

// POST /api/comments — 새 댓글 작성
// 요청 바디: { postId, author, content, country? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 필수 필드(게시글 ID, 작성자, 본문) 누락 여부 검증
    if (!body.postId || !body.author || !body.content) {
      return Response.json(
        { error: "postId, author, content are required" },
        { status: 400 }
      );
    }

    // 새 댓글 객체 생성 — 실제 구현 시 DB INSERT 후 생성된 ID 반환
    const newComment: Comment = {
      id: DUMMY_COMMENTS.length + 1, // 더미: 배열 길이 + 1을 임시 ID로 사용
      postId: body.postId,
      author: body.author,
      country: body.country ?? "unknown", // 국적 미제공 시 "unknown"으로 저장
      content: body.content,
      voteUp: 0, // 신규 댓글은 추천 0에서 시작
      createdAt: new Date().toISOString(), // 현재 시각을 작성 시각으로 기록
    };

    // 201 Created와 함께 생성된 댓글 반환
    return Response.json({ success: true, data: newComment }, { status: 201 });
  } catch {
    // JSON 파싱 실패 등 예외 처리
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// DELETE /api/comments?id=N — 댓글 삭제
// id 쿼리 파라미터로 삭제할 댓글 ID 전달
export async function DELETE(request: NextRequest) {
  // URL에서 댓글 ID 추출
  const { searchParams } = new URL(request.url);
  const commentId = searchParams.get("id");

  // id 누락 시 400 반환
  if (!commentId) {
    return Response.json(
      { error: "id query param is required" },
      { status: 400 }
    );
  }

  // 더미 삭제 응답 — 실제 구현 시 DB에서 해당 댓글 레코드 삭제 후 204 반환 고려
  return Response.json({
    success: true,
    message: `Comment ${commentId} deleted`,
  });
}
