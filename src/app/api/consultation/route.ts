// 운영자 추천 상담 API — Supabase 저장 + 운영자 이메일 알림
import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { sendNotificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, age, region, nationality, gender, procedure, message } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "name and email are required" }, { status: 400 });
    }

    // 1) Supabase contact_inquiries 테이블에 저장
    const supabase = createServiceRoleClient();
    const inquiryData = {
      name,
      email,
      phone: null,
      country_code: nationality || null,
      category: "consultation",
      subject: procedure || "운영자 추천 상담",
      message: [
        age ? `나이: ${age}` : null,
        region ? `지역: ${region}` : null,
        nationality ? `국적: ${nationality}` : null,
        gender ? `성별: ${gender === "male" ? "남성" : gender === "female" ? "여성" : "기타"}` : null,
        procedure ? `원하는 진료: ${procedure}` : null,
        message ? `문의사항: ${message}` : null,
      ].filter(Boolean).join("\n"),
      status: "open",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (supabase as any)
      .from("contact_inquiries")
      .insert(inquiryData);

    if (dbError) {
      console.error("[consultation] DB save failed:", dbError);
    }

    // 2) 운영자에게 이메일 알림
    const genderText = gender === "male" ? "남성" : gender === "female" ? "여성" : gender === "other" ? "기타" : "-";
    await sendNotificationEmail({
      subject: `[KBBG] 새 상담 신청 — ${name}`,
      content: `새 상담 신청이 접수되었습니다.\n\n성명: ${name}\n이메일: ${email}\n나이: ${age || "-"}\n지역: ${region || "-"}\n국적: ${nationality || "-"}\n성별: ${genderText}\n원하는 진료: ${procedure || "-"}\n문의사항: ${message || "-"}\n\n접수 시각: ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`,
    });

    return NextResponse.json({
      success: true,
      message: "Consultation request submitted",
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
