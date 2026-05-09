import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function POST(req: NextRequest) {
  const { email, locale } = await req.json();

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const supabase = getSupabase();

  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email: email.toLowerCase().trim(), locale: locale || "en" });

  if (error) {
    // 중복 이메일 (unique constraint)
    if (error.code === "23505") {
      return NextResponse.json({ duplicate: true }, { status: 200 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 웰컴 이메일 발송 (Resend)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const isKo = locale === "ko";
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify({
        from: "KBBG <help@2bstory.com>",
        to: email,
        subject: isKo ? "KBBG 뉴스레터 구독을 환영합니다!" : "Welcome to KBBG Newsletter!",
        html: isKo
          ? `<p>안녕하세요! KBBG 뉴스레터를 구독해주셔서 감사합니다.<br>매주 K-뷰티 최신 정보를 보내드릴게요.</p><p><a href="https://kbeautybuyersguide.com/ko">KBBG 바로가기</a></p>`
          : `<p>Welcome to KBBG! Thanks for subscribing.<br>We'll send you the latest K-beauty tips & clinic deals every week.</p><p><a href="https://kbeautybuyersguide.com/en">Visit KBBG</a></p>`,
      }),
    }).catch(() => {}); // 이메일 실패해도 구독은 성공으로 처리
  }

  return NextResponse.json({ success: true });
}
