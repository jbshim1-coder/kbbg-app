// Trip Plan 저장 API — Supabase trip_plans 테이블에 insert 후 share_token 반환
// 테이블 미존재 등 graceful error 처리

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase";

interface SaveRequest {
  procedures: string[];
  arrivalDate: string;
  itinerary: unknown;
  preferences: Record<string, unknown>;
  locale?: string;
}

export async function POST(req: NextRequest) {
  try {
    const authSupabase = await createServerSupabaseClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to save your trip plan", shareToken: null }, { status: 401 });
    }

    const body = (await req.json()) as SaveRequest;
    const { procedures, arrivalDate, itinerary, preferences, locale } = body || ({} as SaveRequest);

    if (!procedures || !arrivalDate || !itinerary) {
      return NextResponse.json(
        { error: "procedures, arrivalDate, itinerary required", shareToken: null },
        { status: 400 }
      );
    }

    // 도착일 + 3박 = 출발일 (Fri → Mon)
    const arrival = new Date(arrivalDate);
    const departure = new Date(arrival.getTime() + 3 * 24 * 60 * 60 * 1000);
    const departureDate = departure.toISOString().slice(0, 10);

    const supabase = createServiceRoleClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("trip_plans")
      .insert({
        user_id: user.id,
        procedures,
        arrival_date: arrivalDate,
        departure_date: departureDate,
        itinerary,
        preferences: preferences || {},
        locale: locale || "en",
        is_public: true,
      })
      .select("share_token")
      .single();

    if (error || !data) {
      // 테이블 없음 등 — graceful 응답
      console.warn("[planner/save] Insert failed:", error?.message);
      return NextResponse.json({ error: "Save unavailable", shareToken: null });
    }

    return NextResponse.json({ shareToken: data.share_token as string });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[planner/save] Error:", message);
    return NextResponse.json({ error: "Save unavailable", shareToken: null });
  }
}
