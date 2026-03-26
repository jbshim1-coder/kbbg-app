// 병원 검색 API — 심평원 hospInfoServicev2/getHospBasisList 직접 호출
import { NextRequest, NextResponse } from "next/server";
import { fetchHiraClinics } from "@/lib/hira-api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") || "";
  const region = searchParams.get("region") || "";
  const subject = searchParams.get("subject") || "";
  const type = searchParams.get("type") || "";
  const page = parseInt(searchParams.get("page") || "1");

  try {
    const result = await fetchHiraClinics({
      yadmNm: keyword || undefined,
      sidoCd: region || undefined,
      dgsbjtCd: subject || undefined,
      clCd: type || undefined,
      numOfRows: 10,
      pageNo: page,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("HIRA API error:", error);
    return NextResponse.json({ clinics: [], totalCount: 0, pageNo: page });
  }
}
