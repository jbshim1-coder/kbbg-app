// 관리자 버그 리포트 API — contact_inquiries 테이블에서 bug_report 카테고리 관리
// GET: 버그 ���포트 목록 조회
// PATCH: 상태 변경 (resolved)

import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { verifyAdminFromRequest } from "@/lib/admin-auth";

export async function GET() {
  const adminEmail = await verifyAdminFromRequest();
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServiceRoleClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("contact_inquiries")
      .select("id, name, email, message, status, created_at")
      .eq("category", "bug_report")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[admin/bug-reports GET]", error.message);
      return NextResponse.json({ error: "Failed to fetch bug reports" }, { status: 500 });
    }

    return NextResponse.json({ reports: data || [] });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const adminEmail = await verifyAdminFromRequest();
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("contact_inquiries")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[admin/bug-reports PATCH]", error.message);
      return NextResponse.json({ error: "Failed to update bug report" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
