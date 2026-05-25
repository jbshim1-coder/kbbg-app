// 인플루언서 아웃리치 관리 API
// GET: 목록 + 통계, DELETE: 단건 삭제
import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { verifyAdminFromRequest, logAudit } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const adminEmail = await verifyAdminFromRequest();
  if (!adminEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceRoleClient();
  const status = req.nextUrl.searchParams.get("status");
  const country = req.nextUrl.searchParams.get("country");
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") || "1"));
  const limit = 50;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("influencer_outreach")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status && status !== "all") query = query.eq("status", status);
  if (country) query = query.eq("country_code", country);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ prospects: [], total: 0, stats: {} });

  // 상태별 통계
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allRows } = await (supabase as any)
    .from("influencer_outreach")
    .select("status, country_code");

  const stats = (allRows || []).reduce(
    (acc: Record<string, number>, row: { status: string }) => {
      acc[row.status] = (acc[row.status] || 0) + 1;
      return acc;
    },
    {}
  );

  const countries: string[] = [
    ...new Set(
      (allRows || [])
        .map((r: { country_code: string }) => r.country_code)
        .filter(Boolean)
    ),
  ].sort() as string[];

  return NextResponse.json({ prospects: data || [], total: count || 0, page, limit, stats, countries });
}

export async function DELETE(req: NextRequest) {
  const adminEmail = await verifyAdminFromRequest();
  if (!adminEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const supabase = createServiceRoleClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("influencer_outreach").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAudit(adminEmail, "outreach_delete", "influencer_outreach", id);
  return NextResponse.json({ success: true });
}
