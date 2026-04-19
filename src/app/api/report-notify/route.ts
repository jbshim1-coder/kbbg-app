// 신고 이메일 알림 API — Supabase 저장 + 이메일 알림
import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { sendNotificationEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

const checkLimit = rateLimit("report-notify", 3);

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { name, email, type, clinicName, description } = await request.json();

    // 필수 필드 검증
    if (!name || !email || !type || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 이메일 형식 기본 검증
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // 텍스트 길이 제한
    if (description.length > 3000 || name.length > 100) {
      return NextResponse.json({ error: "Input too long" }, { status: 400 });
    }

    // 1) Supabase 저장
    const supabase = createServiceRoleClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("contact_inquiries").insert({
      name,
      email,
      category: "report",
      subject: `${type}${clinicName ? ` — ${clinicName}` : ""}`,
      message: description,
      status: "open",
    });

    // 2) 이메일 알림
    await sendNotificationEmail({
      subject: `[KBBG] 신고 접수 — ${type}`,
      content: `새 신고가 접수되었습니다.\n\n신고자: ${name}\n이메일: ${email}\n신고 유형: ${type}\n병원명: ${clinicName || "-"}\n내용: ${description}\n\n접수 시각: ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
