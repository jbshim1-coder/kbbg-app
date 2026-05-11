// 관리자 전용 리뷰 조회 API
import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { verifyAdminFromRequest } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const adminEmail = await verifyAdminFromRequest();
  if (!adminEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = req.nextUrl.searchParams.get("status");

  try {
    const supabase = createServiceRoleClient();
    let query = (supabase as any)
      .from("clinic_reviews")
      .select("id, entity_id, entity_name, author_name, rating, content, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ reviews: [] });
    return NextResponse.json({ reviews: data || [] });
  } catch {
    return NextResponse.json({ reviews: [] });
  }
}
