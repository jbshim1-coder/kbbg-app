// 댓글 관리 API — GET: 전체 댓글 목록 (최신순, 페이지네이션), DELETE: 댓글 삭제
import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { verifyAdminFromRequest } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const adminEmail = await verifyAdminFromRequest();
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServiceRoleClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;

    const { data, count, error } = await (supabase as any)
      .from("comments")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      // 테이블 미존재 시 빈 배열 반환
      return NextResponse.json({ comments: [], total: 0, page, limit });
    }

    return NextResponse.json({ comments: data || [], total: count || 0, page, limit });
  } catch {
    return NextResponse.json({ comments: [], total: 0, page: 1, limit: 20 });
  }
}

export async function DELETE(request: NextRequest) {
  const adminEmail = await verifyAdminFromRequest();
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const commentId = searchParams.get("id");
  if (!commentId) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(commentId)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  try {
    const supabase = createServiceRoleClient();
    const { error } = await (supabase as any)
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
