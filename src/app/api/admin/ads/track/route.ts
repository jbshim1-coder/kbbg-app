// 광고 노출/클릭 추적 API — POST로 impressions/clicks 카운트 증가
import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { adId, type } = await req.json(); // type: "impression" | "click"
    if (!adId || !type) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    const field = type === "click" ? "clicks" : "impressions";

    // ads 테이블에서 현재 값을 읽고 +1 증가
    const { data: ad } = await (supabase as any)
      .from("ads")
      .select(field)
      .eq("id", adId)
      .single();

    if (ad) {
      await (supabase as any)
        .from("ads")
        .update({ [field]: (ad[field] || 0) + 1 })
        .eq("id", adId);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}
