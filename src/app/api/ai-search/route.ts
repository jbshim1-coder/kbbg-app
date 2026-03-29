// AI 검색 API — Claude API 직접 검색
// DB/RPC/HIRA 로직 없음. Claude가 직접 답변.
import { NextRequest, NextResponse } from "next/server";

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query: string = body.query || "";
    const locale: string = body.locale || "ko";

    if (!query.trim()) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        narrative: locale === "ko"
          ? "AI 검색 서비스가 현재 점검 중입니다. 잠시 후 다시 시도해 주세요."
          : "AI search is currently under maintenance. Please try again later.",
        clinics: [],
        totalCount: 0,
      });
    }

    const isKorean = locale === "ko";

    const systemPrompt = isKorean
      ? `당신은 K-Beauty Buyers Guide의 AI 병원 추천 큐레이터입니다.
사용자의 질문에 맞는 한국 병원/클리닉을 추천해주세요.

규칙:
- 실제 존재하는 병원만 추천하세요.
- 각 병원에 대해: 병원명, 위치, 전문 분야, 추천 이유를 포함하세요.
- 3~5개 병원을 추천하세요.
- 긍정적이고 확신 있는 톤으로 작성하세요.
- 의원/클리닉을 우선 추천하세요 (종합병원/대학병원보다).
- 상호에 해당 진료과명이 포함된 전문 병원을 우선 추천하세요.
- 마크다운 볼드(**병원명**)를 사용하세요.
- 한국어로 답변하세요.`
      : `You are the AI hospital recommendation curator for K-Beauty Buyers Guide.
Recommend Korean hospitals/clinics based on the user's query.

Rules:
- Only recommend real existing hospitals.
- Include: hospital name, location, specialty, reason for recommendation.
- Recommend 3-5 hospitals.
- Write in a confident, positive tone.
- Prioritize clinics over general/university hospitals.
- Prioritize hospitals whose name includes the relevant specialty.
- Use markdown bold (**hospital name**).
- Answer in English.`;

    const response = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: query }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const narrative = data.content?.[0]?.text || (isKorean ? "검색 결과를 불러오지 못했습니다." : "Failed to load results.");

    return NextResponse.json({
      narrative,
      clinics: [],
      totalCount: 0,
    });
  } catch (error) {
    console.error("AI search error:", error);
    return NextResponse.json({
      narrative: "AI 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      clinics: [],
      totalCount: 0,
    });
  }
}
