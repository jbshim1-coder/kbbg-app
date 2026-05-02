// 관리자 병원 관리 API — Supabase clinics 테이블 조회/상태변경
// GET: 병원 목록 (페이지네이션 + 이름 검색)
// PATCH: 병원 활성/비활성, 인증/미인증 토글

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
    const search = searchParams.get("search") || "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("clinics")
      .select("*", { count: "exact" });

    if (search) {
      const escapedSearch = search.replace(/[%_\\]/g, '\\$&');
      query = query.ilike("name", `%${escapedSearch}%`);
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error("[admin/clinics GET]", error.message);
      return NextResponse.json({ error: "Failed to fetch clinics" }, { status: 500 });
    }

    return NextResponse.json({ clinics: data || [], total: count || 0, page, limit });
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
    const { clinicId, action } = await request.json();

    if (!clinicId || !action) {
      return NextResponse.json({ error: "clinicId and action required" }, { status: 400 });
    }

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_RE.test(clinicId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    let update: Record<string, boolean> = {};

    if (action === "activate") update = { is_active: true };
    else if (action === "deactivate") update = { is_active: false };
    else if (action === "verify") update = { is_verified: true };
    else if (action === "unverify") update = { is_verified: false };
    else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("clinics")
      .update(update)
      .eq("id", clinicId);

    if (error) {
      console.error("[admin/clinics PATCH]", error.message);
      return NextResponse.json({ error: "Failed to update clinic" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
