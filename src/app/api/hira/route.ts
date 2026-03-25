// 병원 검색 API — Supabase DB에서 검색 (심평원 데이터는 일일 동기화로 저장됨)
import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") || "";
  const region = searchParams.get("region") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = 10;

  try {
    const supabase = createServiceRoleClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any).from("clinics").select("*", { count: "exact" }).eq("is_active", true);

    if (keyword) query = query.ilike("name", `%${keyword}%`);
    if (region) query = query.ilike("city", `%${region}%`);

    query = query.range((page - 1) * perPage, page * perPage - 1).order("name");

    const { data, count, error } = await query;

    if (error) throw error;

    // 심평원 API 호환 형식으로 변환
    const clinics = (data || []).map((c: Record<string, unknown>) => ({
      yadmNm: c.name,
      clCdNm: "",
      sidoCdNm: c.city,
      sgguCdNm: "",
      addr: c.address,
      telno: c.phone,
      hospUrl: c.website,
      drTotCnt: 0,
      sdrCnt: 0,
      dgsbjtCdNm: c.description,
      XPos: c.longitude,
      YPos: c.latitude,
      ykiho: c.id,
    }));

    return NextResponse.json({
      clinics,
      totalCount: count || 0,
      pageNo: page,
    });
  } catch {
    // DB에 데이터가 없으면 심평원 API 직접 호출 (폴백)
    const { fetchHiraClinics } = await import("@/lib/hira-api");
    try {
      const result = await fetchHiraClinics({
        yadmNm: keyword || undefined,
        sidoCd: region || undefined,
        numOfRows: perPage,
        pageNo: page,
      });
      return NextResponse.json(result);
    } catch (apiError) {
      console.error("HIRA API fallback error:", apiError);
      return NextResponse.json({ clinics: [], totalCount: 0, pageNo: page });
    }
  }
}
