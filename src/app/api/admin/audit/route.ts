// 감사 로그 API — GET: 최근 로그 조회, POST: 로그 기록
// admin_audit_log 테이블 사용 (테이블 미존재 시 빈 배열 반환)
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
    const { data, error } = await (supabase as any)
      .from("admin_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      // 테이블이 없을 수 있으므로 빈 배열 반환
      return NextResponse.json({ logs: [] });
    }

    return NextResponse.json({ logs: data || [] });
  } catch {
    return NextResponse.json({ logs: [] });
  }
}

export async function POST(req: NextRequest) {
  // 관리자 인증 필수 — 위조 방지
  const adminEmail = await verifyAdminFromRequest();
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action, target_type, target_id, details } = await req.json();
    const admin_email = adminEmail; // 세션에서 추출 (요청 body가 아닌)
    if (!action) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    const { error } = await (supabase as any)
      .from("admin_audit_log")
      .insert({
        admin_email,
        action,
        target_type: target_type || null,
        target_id: target_id || null,
        details: details || null,
      });

    if (error) {
      // 테이블 미존재 등 — 로그 실패는 무시
      return NextResponse.json({ success: false });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}
