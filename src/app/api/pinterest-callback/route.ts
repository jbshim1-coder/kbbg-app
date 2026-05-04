// Pinterest OAuth callback - 인증 코드를 화면에 표시
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  if (!code) {
    return new NextResponse("No code received", { status: 400 });
  }

  return new NextResponse(
    `<!DOCTYPE html>
<html><head><title>Pinterest Connected</title></head>
<body style="font-family:sans-serif;max-width:600px;margin:60px auto;text-align:center">
<h1>Pinterest Connected!</h1>
<p>Copy this code and send it to the admin:</p>
<div style="background:#f0f0f0;padding:20px;border-radius:8px;font-family:monospace;font-size:18px;word-break:break-all">${code}</div>
<p style="color:#888;margin-top:20px">State: ${state || "none"}</p>
</body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
