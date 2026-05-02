// 관리자 회원 목록 API — Supabase auth.users 조회 (service role key 필요)
// GET /api/admin/users — 관리자 인증 후 전체 회원 목록 반환
// PATCH /api/admin/users — 사용자 정지/차단/해제
// DELETE /api/admin/users?userId=xxx — 사용자 삭제

import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { verifyAdminFromRequest } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  // 관리자 인증 체크
  const adminEmail = await verifyAdminFromRequest();
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServiceRoleClient();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "50")));

    // auth.users는 admin API를 통해서만 접근 가능
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: limit,
    });

    if (error) {
      console.error("[admin/users]", error.message);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    // 클라이언트에 필요한 필드만 추출하여 반환
    const users = (data?.users || []).map((u) => ({
      id: u.id,
      email: u.email || "",
      name: (u.user_metadata?.full_name as string) || (u.email?.split("@")[0] ?? ""),
      provider: u.app_metadata?.provider || "email",
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at || null,
      banned: u.banned_until ? new Date(u.banned_until) > new Date() : false,
    }));

    return NextResponse.json({ users, page, limit });
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
    const { userId, action, duration } = await request.json();

    if (!userId || !action) {
      return NextResponse.json({ error: "userId and action required" }, { status: 400 });
    }

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_RE.test(userId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    if (action === "unban") {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: "none",
      });
      if (error) {
        console.error("[admin/users PATCH unban]", error.message);
        return NextResponse.json({ error: "Failed to unban user" }, { status: 500 });
      }
    } else if (action === "suspend" || action === "ban") {
      // suspend: 지정 기간, ban: 영구 차단 (~100년)
      const banDuration = action === "suspend" ? (duration || "24h") : "876000h";
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: banDuration,
      });
      if (error) {
        console.error("[admin/users PATCH ban]", error.message);
        return NextResponse.json({ error: "Failed to ban user" }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const adminEmail = await verifyAdminFromRequest();
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_RE.test(userId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.error("[admin/users DELETE]", error.message);
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
