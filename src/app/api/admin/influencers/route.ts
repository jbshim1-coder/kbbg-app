import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  const supabase = createServiceRoleClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("influencer_applications")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== "all") query = query.eq("status", status);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ applications: data || [], total: count || 0 });
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, action } = await request.json();
    if (!id || !action) return NextResponse.json({ error: "id and action required" }, { status: 400 });

    const statusMap: Record<string, string> = { approve: "approved", reject: "rejected", pending: "pending" };
    const newStatus = statusMap[action];
    if (!newStatus) return NextResponse.json({ error: "invalid action" }, { status: 400 });

    const supabase = createServiceRoleClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("influencer_applications")
      .update({ status: newStatus, reviewed_at: new Date().toISOString() })
      .eq("id", id)
      .select("name, email")
      .single();

    if (error) throw error;

    // 승인/거절 시 신청자에게 결과 이메일
    if (action === "approve") {
      await sendEmail({
        to: data.email,
        subject: "🎉 Your KBBG Influencer Application Has Been Approved!",
        text: `Hi ${data.name},\n\nGreat news! Your application to the KBBG Influencer Partnership Program has been approved.\n\nOur team will reach out to you shortly with the next steps.\n\nWelcome to the KBBG family!\n\nBest regards,\nKBBG Team\nhttps://kbeautybuyersguide.com`,
      });
    } else if (action === "reject") {
      await sendEmail({
        to: data.email,
        subject: "KBBG Influencer Application Update",
        text: `Hi ${data.name},\n\nThank you for your interest in the KBBG Influencer Partnership Program.\n\nAfter careful review, we are unable to move forward with your application at this time. We encourage you to apply again in the future as our program grows.\n\nBest regards,\nKBBG Team\nhttps://kbeautybuyersguide.com`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/influencers] PATCH error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
