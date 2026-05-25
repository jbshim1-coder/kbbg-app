// Resend 웹훅 — 이메일 오픈/클릭/반송 추적
// Resend Dashboard > Webhooks에서 이 URL 등록 필요:
// https://kbeautybuyersguide.com/api/webhooks/resend-outreach
import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body as { type: string; data: { email_id?: string } };
    if (!data?.email_id) return NextResponse.json({ ok: true });

    const supabase = createServiceRoleClient();
    const now = new Date().toISOString();

    if (type === "email.opened") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("influencer_outreach")
        .update({ status: "opened", opened_at: now })
        .eq("resend_email_id", data.email_id)
        .eq("status", "emailed");
    } else if (type === "email.clicked") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("influencer_outreach")
        .update({ status: "clicked", clicked_at: now })
        .eq("resend_email_id", data.email_id);
    } else if (type === "email.bounced" || type === "email.complained") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("influencer_outreach")
        .update({ status: "bounced" })
        .eq("resend_email_id", data.email_id);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[resend-outreach webhook]", err);
    return NextResponse.json({ ok: true }); // 항상 200 반환 (Resend 재시도 방지)
  }
}
