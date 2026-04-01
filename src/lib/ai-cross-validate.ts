// AI 교차검증 — GPT에게 특정 시술 잘하는 병원을 물어봐서 보조 지표로 활용
// 주의: 환각(hallucination) 가능, 보조 신호로만 사용

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export interface AICrossValidation {
  procedure: string;
  region: string;
  recommendedNames: string[];
  rawResponse: string;
}

// GPT에게 특정 지역+시술 병원 추천을 요청하고, 병원명 목록을 추출
export async function crossValidateWithAI(
  procedure: string,
  region: string
): Promise<AICrossValidation | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content: "한국의 병원 정보 전문가입니다. 병원명만 JSON 배열로 반환하세요.",
          },
          {
            role: "user",
            content: `${region}에서 ${procedure} 잘하는 병원 5곳의 이름을 JSON 배열로만 반환하세요. 형식: ["병원A","병원B",...]`,
          },
        ],
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";

    // JSON 배열 추출
    const match = content.match(/\[[\s\S]*?\]/);
    let names: string[] = [];
    if (match) {
      try {
        names = JSON.parse(match[0]);
      } catch {
        names = [];
      }
    }

    return {
      procedure,
      region,
      recommendedNames: names,
      rawResponse: content,
    };
  } catch {
    return null;
  }
}

// DB 검색 결과와 AI 추천을 교차검증하여 일치하는 병원에 보너스 점수 부여
export function calculateCrossValidationBonus(
  clinicNames: string[],
  aiRecommended: string[]
): Map<string, number> {
  const bonusMap = new Map<string, number>();

  for (const name of clinicNames) {
    const matched = aiRecommended.some(
      (rec) => name.includes(rec) || rec.includes(name)
    );
    if (matched) {
      bonusMap.set(name, 10); // AI도 추천한 병원에 보너스 +10
    }
  }

  return bonusMap;
}
