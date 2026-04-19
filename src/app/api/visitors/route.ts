// 방문자 카운터 API
// GET: 어제 방문자 수 반환
// POST: 오늘 방문자 수 +1 증가
import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

// KST 기준 오늘/어제 날짜
function getKSTDate(offset = 0): string {
  const d = new Date();
  d.setHours(d.getHours() + 9); // UTC → KST
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

// GET: 어제 방문자 수
export async function GET() {
  try {
    const supabase = createServiceRoleClient();
    const yesterday = getKSTDate(-1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("daily_visitors")
      .select("count")
      .eq("date", yesterday)
      .single();

    return NextResponse.json({ date: yesterday, count: data?.count || 0 });
  } catch {
    return NextResponse.json({ date: "", count: 0 });
  }
}

// POST: 오늘 방문자 +1
export async function POST(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowed = new Set(["https://kbeautybuyersguide.com", "https://kbbg-app.vercel.app", "http://localhost:3000"]);
  if (!allowed.has(origin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const supabase = createServiceRoleClient();
    const today = getKSTDate(0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from("daily_visitors")
      .select("count")
      .eq("date", today)
      .single();

    if (existing) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("daily_visitors")
        .update({ count: existing.count + 1 })
        .eq("date", today);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("daily_visitors")
        .insert({ date: today, count: 1 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}
