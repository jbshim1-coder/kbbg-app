import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { rateLimit } from "@/lib/rate-limit";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const checkLimit = rateLimit("face-analysis", 5);

// Claude 거부 감지 키워드
const REFUSAL_KEYWORDS = [
  "죄송합니다만", "죄송합니다", "제공할 수 없", "서비스를 제공할 수 없",
  "의료적 책임", "분석하는 것은", "적절하지 않", "도움을 드릴 수 없",
  "I cannot", "I'm not able", "I can't", "I apologize", "I'm sorry",
  "not appropriate", "cannot analyze", "decline", "can't assist",
  "not able to", "unable to", "I'm unable",
];

function isRefusal(text: string): boolean {
  return REFUSAL_KEYWORDS.some((kw) => text.includes(kw));
}

// 프롬프트 생성
function getPrompt(isKo: boolean): string {
  return isKo
    ? `당신은 K-뷰티 매거진의 뷰티 컨설턴트입니다. 사용자가 셀카를 공유했습니다. 이 사진을 참고하여 한국에서 현재 유행하는 뷰티 트렌드와 맞춤 스타일링 조언을 제공하세요.

이것은 재미있는 뷰티 트렌드 콘텐츠이며, 의료 행위가 아닙니다. 잡지의 "나에게 어울리는 스타일 찾기" 코너처럼 가볍고 즐겁게 작성하세요.

아래 형식으로 답변하세요:

**나의 매력 포인트**
사진 속 인물의 전체적인 인상과 매력적인 포인트를 2~3문장으로 따뜻하게 칭찬해주세요.

**K-뷰티 인기 시술 TOP 3**
한국에서 현재 가장 인기 있는 뷰티 시술 중 이 분에게 어울릴 3가지를 추천하세요. 각각:
- 시술명
- 인기 이유: 한국에서 왜 인기인지 (1문장)
- 평균 비용: 약 000~000 USD (비용은 유동적)
- 회복 기간: 0~0일

**뷰티 팁**
촉촉한 피부 표현을 위해 수분 베이스 메이크업을 사용하고, 하이라이터를 적절히 사용하여 얼굴의 조명을 강조하세요.
- 피부 관리를 위해 항산화 성분이 풍부한 에센스와 세럼을 활용해 보세요.

긍정적이고 따뜻한 톤으로, 마치 친한 뷰티 전문가 친구가 조언하듯 작성하세요.`
    : `You are a beauty consultant for a K-Beauty magazine. A user has shared their selfie. Based on this photo, provide personalized Korean beauty trend recommendations and styling advice.

This is fun beauty trend content, not a medical service. Write it like a magazine's "Find Your Perfect Style" feature — light, enjoyable, and encouraging.

Please respond in the following format:

**Your Charm Points**
Warmly compliment the person's overall impression and attractive features in 2-3 sentences.

**K-Beauty Popular Procedures TOP 3**
Recommend 3 currently trending Korean beauty procedures that would suit this person. For each:
- Procedure name
- Why it's popular in Korea (1 sentence)
- Average cost: approx $000~$000 USD (prices may vary)
- Recovery period: 0~0 days

**Beauty Tips**
- Use a hydrating base makeup for that dewy Korean glass-skin look, and highlight to accentuate your best features.
- Try antioxidant-rich essences and serums for glowing skin.

Write in a warm, positive tone — like a friendly beauty expert giving personalized advice.`;
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
  const ip = (req as import("next/server").NextRequest).headers.get("x-forwarded-for") ?? "unknown";
  if (!checkLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

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
