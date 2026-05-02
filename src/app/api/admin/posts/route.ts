// 관리자 게시글 관리 API — Supabase posts 테이블 조회/상태변경
// GET: 게시글 목록 (페이지네이션 + 상태 필터 + 제목 검색)
// PATCH: 게시글 상태 변경 (숨김/고정/삭제 처리)

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
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "20")));
    const status = searchParams.get("status"); // all | active | deleted | pinned
    const search = searchParams.get("search") || "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("posts")
      .select("*", { count: "exact" });

    if (status === "deleted") query = query.eq("is_deleted", true);
    else if (status === "pinned") query = query.eq("is_pinned", true);
    else if (status === "active") query = query.eq("is_deleted", false);

    if (search) {
      const escapedSearch = search.replace(/[%_\\]/g, '\\$&');
      query = query.ilike("title", `%${escapedSearch}%`);
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error("[admin/posts GET]", error.message);
      return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }

    return NextResponse.json({ posts: data || [], total: count || 0, page, limit });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const adminEmail = await verifyAdminFromRequest();
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { postId, action } = await request.json();

    if (!postId || !action) {
      return NextResponse.json({ error: "postId and action required" }, { status: 400 });
    }

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_RE.test(postId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    // action: "hide" | "unhide" | "pin" | "unpin" | "delete"
    let update: Record<string, boolean> = {};
    if (action === "hide") update = { is_deleted: true };
    else if (action === "unhide") update = { is_deleted: false };
    else if (action === "pin") update = { is_pinned: true };
    else if (action === "unpin") update = { is_pinned: false };
    else if (action === "delete") update = { is_deleted: true };
    else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("posts")
      .update(update)
      .eq("id", postId);

    if (error) {
      console.error("[admin/posts PATCH]", error.message);
      return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
