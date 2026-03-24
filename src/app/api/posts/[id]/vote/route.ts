// 게시글 투표 API — 추천(up)/비추천(down) 등록(POST), 투표 취소(DELETE)

import type { NextRequest } from "next/server";

// 투표 방향 유형 — "up"(추천) 또는 "down"(비추천)
type VoteType = "up" | "down";

// 투표 요청 바디 타입
interface VoteRequest {
  type: VoteType;  // 투표 방향
  userId: string;  // 투표한 사용자 ID — 중복 투표 방지에 사용
}

// POST /api/posts/[id]/vote — 게시글에 투표 등록
// 동일 사용자가 같은 방향으로 재투표 시 실제 구현에서는 오류 또는 취소 처리 필요
export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/posts/[id]/vote">
) {
  try {
    // 동적 라우트 파라미터에서 게시글 ID 추출 (Next.js App Router: params는 Promise)
    const { id } = await ctx.params;
    const postId = parseInt(id, 10);

    // 숫자가 아닌 ID 요청 방어
    if (isNaN(postId)) {
      return Response.json({ error: "Invalid post id" }, { status: 400 });
    }

    // 요청 바디 파싱
    const body: VoteRequest = await request.json();

    // 투표 방향 유효성 검증 — "up" 또는 "down"만 허용
    if (!body.type || !["up", "down"].includes(body.type)) {
      return Response.json(
        { error: "type must be 'up' or 'down'" },
        { status: 400 }
      );
    }

    // 사용자 ID 누락 검증
    if (!body.userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    // 더미 투표 반영 결과 — 실제 구현 시 DB 트랜잭션으로 투표 수 원자적 업데이트
    const updatedVotes = {
      postId,
      voteUp: body.type === "up" ? 43 : 42,   // 추천 시 +1
      voteDown: body.type === "down" ? 3 : 2,  // 비추천 시 +1
      userVote: body.type, // 해당 사용자의 현재 투표 방향 반환
    };

    return Response.json({ success: true, data: updatedVotes });
  } catch {
    // JSON 파싱 실패 등 예외 처리
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// DELETE /api/posts/[id]/vote — 게시글 투표 취소
// 사용자가 이미 투표한 항목을 클릭하면 투표를 철회하는 토글 동작
export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/posts/[id]/vote">
) {
  // 동적 라우트 파라미터에서 게시글 ID 추출
  const { id } = await ctx.params;
  const postId = parseInt(id, 10);

  // 숫자가 아닌 ID 요청 방어
  if (isNaN(postId)) {
    return Response.json({ error: "Invalid post id" }, { status: 400 });
  }

  // 더미 취소 결과 — userVote: null로 투표 없음 상태 표현
  // 실제 구현 시 해당 사용자의 투표 레코드를 DB에서 삭제
  return Response.json({
    success: true,
    data: { postId, voteUp: 42, voteDown: 2, userVote: null },
  });
}
