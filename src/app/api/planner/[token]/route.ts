// Trip Plan 공유 조회 API — share_token으로 단건 조회

import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token) {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }

  try {
    const supabase = createServiceRoleClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("trip_plans")
      .select("procedures, arrival_date, departure_date, itinerary, preferences, locale, created_at")
      .eq("share_token", token)
      .eq("is_public", true)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ plan: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[planner/[token]] Error:", message);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
