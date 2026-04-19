// 관리자 문의 관리 API — Supabase contact_inquiries 테이블 조회/상태변경
// GET: 문의 목록 (consultation 카테고리, 페이지네이션)
// PATCH: 문의 상태 변경 (답변완료/종료)

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
    const status = searchParams.get("status"); // all | open | resolved

    // consultation 카테고리 문의만 조회 (bug_report는 별도 페이지에서 관리)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("contact_inquiries")
      .select("*", { count: "exact" })
      .eq("category", "consultation");

    if (status === "open") query = query.eq("status", "open");
    else if (status === "resolved") query = query.eq("status", "resolved");

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error("[admin/inquiries GET]", error.message);
      return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
    }

    return NextResponse.json({ inquiries: data || [], total: count || 0, page, limit });
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
    const { inquiryId, action } = await request.json();

    if (!inquiryId || !action) {
      return NextResponse.json({ error: "inquiryId and action required" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let update: Record<string, any> = {};

    if (action === "resolve") {
      update = { status: "resolved", resolved_at: new Date().toISOString() };
    } else if (action === "close") {
      update = { status: "resolved", resolved_at: new Date().toISOString() };
    } else if (action === "reopen") {
      update = { status: "open", resolved_at: null };
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("contact_inquiries")
      .update(update)
      .eq("id", inquiryId);

    if (error) {
      console.error("[admin/inquiries PATCH]", error.message);
      return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
