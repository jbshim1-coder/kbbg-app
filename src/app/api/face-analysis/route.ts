import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const { image, locale } = await req.json();
    if (!image) return NextResponse.json({ error: "No image" }, { status: 400 });

    const isKo = locale === "ko";

    const prompt = isKo
      ? `당신은 한국 미용의료 전문 컨설턴트입니다. 업로드된 셀카를 분석하고 아래 형식으로 답변하세요.

**주의: 의료 진단이 아닌 일반적인 미용 상담 참고 정보입니다.**

1. **얼굴 분석** (2~3문장): 얼굴형, 이목구비 특징을 객관적으로 설명
2. **추천 시술 TOP 3**: 각 시술에 대해
   - 시술명
   - 추천 이유 (1문장)
   - 예상 비용 (USD 기준)
   - 회복 기간
3. **종합 조언** (1~2문장): 전체적인 미용 방향 제안

친절하고 긍정적인 톤으로 작성하세요. 현재 모습의 장점을 먼저 언급한 후 개선 가능한 부분을 제안하세요.`
      : `You are a Korean beauty medical consultant. Analyze the uploaded selfie and respond in the following format.

**Note: This is general beauty consultation reference, not medical diagnosis.**

1. **Face Analysis** (2-3 sentences): Objectively describe face shape and facial features
2. **Recommended Procedures TOP 3**: For each procedure:
   - Procedure name
   - Reason for recommendation (1 sentence)
   - Estimated cost (USD)
   - Recovery period
3. **Overall Advice** (1-2 sentences): Suggest overall beauty direction

Write in a friendly and positive tone. Mention the strengths of the current appearance first, then suggest areas for improvement.`;

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
                media_type: "image/jpeg",
                data: image.split(",")[1] || image,
              },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ success: true, analysis: text });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
