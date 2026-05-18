// 서버사이드 어드민 인증 확인 — 클라이언트가 ADMIN_EMAILS 없이 관리자 여부 확인
import { NextResponse } from "next/server";
import { verifyAdminFromRequest } from "@/lib/admin-auth";

export async function GET() {
  const adminEmail = await verifyAdminFromRequest();
  return NextResponse.json({ isAdmin: !!adminEmail, email: adminEmail || "" });
}
