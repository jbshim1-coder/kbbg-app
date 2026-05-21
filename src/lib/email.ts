// 이메일 발송 유틸리티 — Resend API 사용 (무료 100건/일)
// 모든 문의/상담 폼 제출 시 운영자에게 이메일 알림

const ADMIN_EMAIL = process.env.ADMIN_EMAILS?.split(",")[0]?.trim() || "admin@kbeautybuyersguide.com";
const FROM_EMAIL = "KBBG <onboarding@resend.dev>"; // Resend 무료 플랜 기본 발신자

async function resendSend(to: string[], subject: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("[email] RESEND_API_KEY not set — email skipped:", subject);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, text }),
    });
    if (!res.ok) console.error("[email] Send failed:", await res.text());
    else console.log(`[email] Sent to ${to.join(",")}: ${subject}`);
  } catch (err) {
    console.error("[email] Send error:", err);
  }
}

export async function sendNotificationEmail({ subject, content }: { subject: string; content: string }) {
  await resendSend([ADMIN_EMAIL], subject, content);
}

export async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  await resendSend([to], subject, text);
}
