// 심평원 데이터 프록시 API — API 키를 서버에서 숨기고 프론트에서 호출
import { NextRequest, NextResponse } from "next/server";
import { fetchHiraClinics } from "@/lib/hira-api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const keyword = searchParams.get("keyword") || "";
  const region = searchParams.get("region") || "";
  const subject = searchParams.get("subject") || "";
  const page = parseInt(searchParams.get("page") || "1");

  try {
    const result = await fetchHiraClinics({
      yadmNm: keyword || undefined,
      sidoCd: region || undefined,
      dgsbjtCd: subject || undefined,
      numOfRows: 10,
      pageNo: page,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("HIRA API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch clinic data" },
      { status: 500 }
    );
  }
}
