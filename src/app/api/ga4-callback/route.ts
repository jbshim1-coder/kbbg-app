// GA4 OAuth 콜백 — 인증 코드를 화면에 표시
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return new NextResponse("No code received", { status: 400 });
  }
  // 코드를 화면에 표시 (사용자가 복사)
  return new NextResponse(
    `<html><body style="font-family:sans-serif;max-width:600px;margin:60px auto;text-align:center">
      <h2>✅ 인증 성공!</h2>
      <p>아래 코드를 Claude에게 알려주세요:</p>
      <div style="background:#f0f0f0;padding:16px;border-radius:8px;word-break:break-all;font-family:monospace;font-size:14px;margin:20px 0">${code.replace(/[<>&"']/g, (c: string) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c] || c))}</div>
      <p style="color:#666;font-size:13px">이 창을 닫아도 됩니다.</p>
    </body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
