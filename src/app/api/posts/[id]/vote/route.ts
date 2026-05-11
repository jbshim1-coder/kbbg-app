// 게시글 투표 API — Supabase post_votes 테이블 연동

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

// POST /api/posts/[id]/vote — 투표 등록/변경
export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/posts/[id]/vote">
) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: postId } = await ctx.params;
  const body = await request.json();
  const voteType = body.type;

  if (!voteType || !["up", "down"].includes(voteType)) {
    return NextResponse.json({ error: "type must be 'up' or 'down'" }, { status: 400 });
  }

  // RPC로 원자적 투표 처리 — toggle_post_vote가 advisory lock으로 race condition 방지
  const { data: rpcResult, error: rpcErr } = await supabase.rpc("toggle_post_vote" as never, {
    p_post_id: postId,
    p_user_id: user.id,
    p_vote_type: voteType,
  } as never) as { data: { upvotes: number; downvotes: number; user_vote: string | null } | null; error: unknown };

  if (!rpcErr && rpcResult) {
    return NextResponse.json({
      success: true,
      data: { postId, upvotes: rpcResult.upvotes, downvotes: rpcResult.downvotes, userVote: rpcResult.user_vote },
    });
  }

  // RPC 미생성 시 폴백 (마이그레이션 전 호환성)
  const { data: existing } = await supabase
    .from("post_votes" as never)
    .select("id, vote_type")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .single() as { data: { id: string; vote_type: string } | null };

  if (existing) {
    if (existing.vote_type === voteType) {
      const { error: delErr } = await supabase.from("post_votes" as never).delete().eq("id", existing.id);
      if (delErr) return NextResponse.json({ error: "Failed to remove vote" }, { status: 500 });
    } else {
      const { error: updErr } = await supabase.from("post_votes" as never).update({ vote_type: voteType } as never).eq("id", existing.id);
      if (updErr) return NextResponse.json({ error: "Failed to update vote" }, { status: 500 });
    }
  } else {
    const { error: insErr } = await supabase.from("post_votes" as never).insert({ post_id: postId, user_id: user.id, vote_type: voteType } as never);
    if (insErr) return NextResponse.json({ error: "Failed to cast vote" }, { status: 500 });
  }

  const { count: upCount } = await supabase.from("post_votes" as never).select("*", { count: "exact", head: true }).eq("post_id", postId).eq("vote_type", "up");
  const { count: downCount } = await supabase.from("post_votes" as never).select("*", { count: "exact", head: true }).eq("post_id", postId).eq("vote_type", "down");
  await supabase.from("posts").update({ upvotes: upCount || 0, downvotes: downCount || 0 } as never).eq("id", postId);
  const { data: userVote } = await supabase.from("post_votes" as never).select("vote_type").eq("post_id", postId).eq("user_id", user.id).single() as { data: { vote_type: string } | null };

  return NextResponse.json({
    success: true,
    data: { postId, upvotes: upCount || 0, downvotes: downCount || 0, userVote: userVote?.vote_type || null },
  });
}

// DELETE /api/posts/[id]/vote — 투표 취소
export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/posts/[id]/vote">
) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: postId } = await ctx.params;

  const { error: delErr } = await supabase.from("post_votes" as never).delete().eq("post_id", postId).eq("user_id", user.id);
  if (delErr) return NextResponse.json({ error: "Failed to cancel vote" }, { status: 500 });

  const { count: upCount } = await supabase.from("post_votes" as never).select("*", { count: "exact", head: true }).eq("post_id", postId).eq("vote_type", "up");
  const { count: downCount } = await supabase.from("post_votes" as never).select("*", { count: "exact", head: true }).eq("post_id", postId).eq("vote_type", "down");

  await supabase.from("posts").update({ upvotes: upCount || 0, downvotes: downCount || 0 } as never).eq("id", postId);

  return NextResponse.json({
    success: true,
    data: { postId, upvotes: upCount || 0, downvotes: downCount || 0, userVote: null },
  });
}
