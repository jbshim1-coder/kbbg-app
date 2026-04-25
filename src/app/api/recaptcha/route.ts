import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const checkLimit = rateLimit("recaptcha", 20);

export async function POST(req: Request) {
  try {
    const ip = (req as import("next/server").NextRequest).headers.get("x-forwarded-for") ?? "unknown";
    if (!checkLimit(ip)) {
      return NextResponse.json({ success: false }, { status: 429 });
    }

    const { token, action } = await req.json();
    if (!token) return NextResponse.json({ success: false }, { status: 400 });

    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ success: false, error: "Server configuration error" }, { status: 500 });
    }

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
  } catch {
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}
