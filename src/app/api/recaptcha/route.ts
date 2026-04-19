import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token, action } = await req.json();
  if (!token) return NextResponse.json({ success: false }, { status: 400 });

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${secret}&response=${token}`,
  });
  const data = await res.json();

  // score 0.7 이상 + action 일치 시 통과 (Google 권장 기준)
  const isValid = data.success && data.score >= 0.7 && (!action || data.action === action);

  return NextResponse.json({
    success: isValid,
    score: data.score,
  });
}
