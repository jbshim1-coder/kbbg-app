// 관리자 대시보드 통계 API — 회원, 게시글, 병원, 방문자, 신고 수 조회
import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { verifyAdminFromRequest } from "@/lib/admin-auth";

export async function GET() {
  const adminEmail = await verifyAdminFromRequest();
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  // 총 회원 수
  const { data: usersData } = await (supabase as any).auth.admin.listUsers();
  const totalUsers = usersData?.users?.length || 0;

  // 총 게시글 수
  const { count: totalPosts } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true });

  // 활성 병원 수
  const { count: totalClinics } = await supabase
    .from("clinics")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  // 오늘 방문자 수 (KST 기준)
  const today = new Date();
  today.setHours(today.getHours() + 9);
  const todayStr = today.toISOString().slice(0, 10);
  const { data: visitorData } = await supabase
    .from("daily_visitors")
    .select("count")
    .eq("date", todayStr)
    .single() as { data: { count: number } | null };

  // 미처리 신고
  const { count: pendingReports } = await supabase
    .from("contact_inquiries")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending") as { count: number | null };

  return NextResponse.json({
    totalUsers,
    totalPosts: totalPosts || 0,
    totalClinics: totalClinics || 0,
    todayVisitors: visitorData?.count || 0,
    pendingReports: pendingReports || 0,
  });
}
