import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { sendNotificationEmail, sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, sns_url, followers, message } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "name and email are required" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (supabase as any)
      .from("influencer_applications")
      .insert({ name, email, sns_url: sns_url || null, followers: followers || null, message: message || null, status: "pending" });

    if (dbError) throw dbError;

    // 신청자에게 확인 이메일
    await sendEmail({
      to: email,
      subject: "Your KBBG Influencer Application Has Been Received",
      text: `Hi ${name},\n\nThank you for applying to the KBBG Influencer Partnership Program!\n\nWe have received your application and will review it within 3–5 business days. We'll contact you at this email address with our decision.\n\nBest regards,\nKBBG Team\nhttps://kbeautybuyersguide.com`,
    });

    // 관리자에게 알림
    await sendNotificationEmail({
      subject: `[KBBG] 새 인플루언서 제휴 신청 — ${name}`,
      content: `새 인플루언서 제휴 신청이 접수되었습니다.\n\n이름: ${name}\n이메일: ${email}\nSNS URL: ${sns_url || "-"}\n팔로워: ${followers || "-"}\n메시지: ${message || "-"}\n\n접수 시각: ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}\n\n관리자에서 확인: https://kbeautybuyersguide.com/ko/admin/influencers`,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[influencer] Error:", err);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
