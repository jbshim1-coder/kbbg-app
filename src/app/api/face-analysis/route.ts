import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Claude 거부 감지 키워드
const REFUSAL_KEYWORDS = [
  "죄송합니다만", "제공할 수 없", "서비스를 제공할 수 없",
  "의료적 책임", "분석하는 것은", "적절하지 않",
  "I cannot", "I'm not able", "I can't provide", "I apologize",
  "not appropriate", "cannot analyze", "decline",
];

function isRefusal(text: string): boolean {
  return REFUSAL_KEYWORDS.some((kw) => text.includes(kw));
}

// 프롬프트 생성
function getPrompt(isKo: boolean): string {
  return isKo
    ? `당신은 한국 뷰티 트렌드 에디터입니다. 이 사진 속 인물의 얼굴형과 이목구비 특징을 관찰하고, 한국에서 인기 있는 미용 트렌드 정보를 교육적으로 안내하세요.

이것은 의료 진단이 아닌 한국 뷰티 트렌드 참고 자료입니다.

아래 형식으로 답변하세요:

**얼굴형 관찰**
사진 속 얼굴형(타원형, 둥근형, 각진형 등)과 이목구비의 조화로운 특징을 2~3문장으로 설명하세요. 매력적인 포인트를 먼저 언급하세요.

**한국 인기 뷰티 시술 TOP 3**
이 얼굴형에 한국에서 많이 선택하는 인기 시술 3가지를 소개하세요. 각각:
- 시술명
- 한국에서 인기인 이유 (1문장)
- 한국 현지 평균 비용 (USD 기준)
- 일반적인 회복 기간

**뷰티 팁**
한국 뷰티 전문가들이 이 얼굴형에 추천하는 스킨케어나 메이크업 팁을 1~2문장으로 제안하세요.

따뜻하고 긍정적인 톤으로 작성하세요.`
    : `You are a Korean beauty trend editor. Observe the face shape and features in this photo, then provide educational information about popular Korean beauty trends.

This is Korean beauty trend reference material, not a medical diagnosis.

Please respond in the following format:

**Face Shape Observation**
Describe the face shape (oval, round, square, etc.) and harmonious facial features in 2-3 sentences. Highlight attractive points first.

**Popular Korean Beauty Procedures TOP 3**
Introduce 3 popular procedures in Korea that people with this face shape commonly choose. For each:
- Procedure name
- Why it's popular in Korea (1 sentence)
- Average cost in Korea (USD)
- Typical recovery period

**Beauty Tips**
Suggest 1-2 skincare or makeup tips that Korean beauty experts recommend for this face shape.

Write in a warm and positive tone.`;
}

// Claude API 호출
async function tryClaude(base64Data: string, mediaType: string, prompt: string): Promise<string | null> {
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: base64Data,
              },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    });
    const text = response.content[0].type === "text" ? response.content[0].text : "";
    if (isRefusal(text)) return null; // 거부 → fallback
    return text;
  } catch {
    return null;
  }
}

// OpenAI GPT-4o fallback
async function tryOpenAI(base64Data: string, mediaType: string, prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${mediaType};base64,${base64Data}` },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    if (!text || isRefusal(text)) return null;
    return text;
  } catch {
    return null;
  }
}

// 진료과 코드 추출
function extractSubjectCodes(text: string): string[] {
  const codes: string[] = [];
  const lower = text.toLowerCase();
  if (/성형|rhinoplast|blepharop|facelift|jaw|chin|nose|eyelid|plastic/i.test(lower)) codes.push("08");
  if (/피부|skin|derma|laser|botox|filler|peel|whitening|acne|wrinkle/i.test(lower)) codes.push("14");
  if (/치과|dental|teeth|veneers|orthodont/i.test(lower)) codes.push("49");
  if (/안과|eye surgery|lasik|lasek|ophthalm/i.test(lower)) codes.push("12");
  if (codes.length === 0) codes.push("08");
  return codes;
}

export async function POST(req: Request) {
  try {
    const { image, locale } = await req.json();
    if (!image) return NextResponse.json({ error: "No image" }, { status: 400 });

    const isKo = locale === "ko";
    const prompt = getPrompt(isKo);

    // data URL에서 미디어 타입 추출
    const mediaTypeMatch = image.match(/^data:(image\/\w+);base64,/);
    const mediaType = mediaTypeMatch?.[1] || "image/jpeg";
    const base64Data = image.split(",")[1] || image;

    // 1차: Claude 시도
    let text = await tryClaude(base64Data, mediaType, prompt);
    let provider = "claude";

    // 2차: Claude 거부 시 OpenAI fallback
    if (!text) {
      text = await tryOpenAI(base64Data, mediaType, prompt);
      provider = "openai";
    }

    // 모든 AI 실패
    if (!text) {
      return NextResponse.json({
        success: false,
        error: isKo
          ? "현재 AI 분석 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요."
          : "AI analysis is temporarily unavailable. Please try again later.",
      }, { status: 503 });
    }

    const subjectCodes = extractSubjectCodes(text);
    return NextResponse.json({ success: true, analysis: text, subjectCodes, provider });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
