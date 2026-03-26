// 관리자 회원 목록 API — Supabase auth.users 조회 (service role key 필요)
// GET /api/admin/users — 전체 회원 목록 반환

import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServiceRoleClient();

    // auth.users는 admin API를 통해서만 접근 가능
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 클라이언트에 필요한 필드만 추출하여 반환
    const users = (data?.users || []).map((u) => ({
      id: u.id,
      email: u.email || "",
      name: (u.user_metadata?.full_name as string) || (u.email?.split("@")[0] ?? ""),
      provider: u.app_metadata?.provider || "email",
      createdAt: u.created_at,
    }));

    return NextResponse.json({ users });
  } catch (err) {
    // SUPABASE_SERVICE_ROLE_KEY 미설정 등의 경우
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
