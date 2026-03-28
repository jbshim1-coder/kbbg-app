// Claude API 클라이언트 — native fetch 사용 (@anthropic-ai/sdk 없이)
import type { HiraClinic } from "@/lib/hira-api";

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

// 병원 데이터를 간결한 텍스트로 변환 (토큰 절약)
function formatClinicsForPrompt(clinics: HiraClinic[]): string {
  return clinics
    .map((c, i) => {
      const parts = [
        `${i + 1}. ${c.yadmNm}`,
        [c.sidoCdNm, c.sgguCdNm].filter(Boolean).join(" "),
        c.addr,
        c.drTotCnt > 0 ? `의사 ${c.drTotCnt}명` : null,
        (c.mdeptSdrCnt || c.sdrCnt) > 0 ? `전문의 ${c.mdeptSdrCnt || c.sdrCnt}명` : null,
        c.dgsbjtCdNm || null,
      ].filter(Boolean);
      return parts.join(", ");
    })
    .join("\n");
}

export async function generateAiRecommendation(
  query: string,
  clinics: HiraClinic[],
  totalCount: number,
  locale: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const top5 = clinics.slice(0, 5);
  const clinicText = formatClinicsForPrompt(top5);
  const isKorean = locale === "ko";

  const systemPrompt = isKorean
    ? `당신은 K-Beauty Buyers Guide의 AI 추천 큐레이터입니다. 심평원 공공데이터와 구글 별점을 기반으로 병원을 추천합니다.

규칙:
- 검색 결과 병원들을 긍정적으로 소개하세요. 절대 부정하거나 의심하지 마세요.
- 각 병원의 장점(전문의 수, 구글 별점, 위치 등)을 강조하세요.
- 노출 순서에 대한 추천 이유를 설명하세요 (전문의가 많다, 별점이 높다 등).
- "제한이 있을 수 있습니다", "확인이 필요합니다" 같은 부정적 표현을 사용하지 마세요.
- 친절하고 확신 있는 톤으로 작성하세요.`
    : `You are the AI recommendation curator for K-Beauty Buyers Guide. You recommend hospitals based on HIRA public data and Google ratings.

Rules:
- Present search results positively. Never discredit or question them.
- Highlight each hospital's strengths (specialist count, Google rating, location, etc.).
- Explain why hospitals are ranked in this order.
- Never use negative or uncertain expressions like "may have limitations" or "needs verification".
- Write in a confident, friendly tone.`;

  const langInstruction = isKorean ? "반드시 한국어로 답변하세요." : "Answer in English.";

  const userMessage = clinics.length === 0
    ? `사용자 질문: "${query}"\n\n검색 결과가 없습니다. 검색 조건을 다르게 해보라고 안내해주세요. ${langInstruction}`
    : `사용자 질문: "${query}"\n\n심평원 데이터 기준 총 ${totalCount.toLocaleString()}개 병원이 검색되었습니다. 상위 ${top5.length}개 병원 정보:\n${clinicText}\n\n위 병원들의 장점을 강조하며 왜 이 순서로 추천하는지 설명하세요. 긍정적이고 확신 있는 톤으로 3~5문장 작성하세요. ${langInstruction}`;

  const response = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data.content?.[0];
  if (!content || content.type !== "text") throw new Error("Unexpected Claude response structure");
  return content.text as string;
}
