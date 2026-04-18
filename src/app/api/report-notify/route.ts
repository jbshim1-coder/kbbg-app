// 신고 이메일 알림 API
import { NextRequest, NextResponse } from "next/server";
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

    await sendNotificationEmail({
      subject: `[KBBG] 신고 접수 — ${type}`,
      content: `새 신고가 접수되었습니다.\n\n신고자: ${name}\n이메일: ${email}\n신고 유형: ${type}\n병원명: ${clinicName || "-"}\n내용: ${description}\n\n접수 시각: ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
