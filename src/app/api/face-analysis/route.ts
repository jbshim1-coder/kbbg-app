import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const { image, locale } = await req.json();
    if (!image) return NextResponse.json({ error: "No image" }, { status: 400 });

    const isKo = locale === "ko";

    const prompt = isKo
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

    // data URL에서 실제 미디어 타입 추출 (image/jpeg, image/png 등)
    const mediaTypeMatch = image.match(/^data:(image\/\w+);base64,/);
    const mediaType = (mediaTypeMatch?.[1] || "image/jpeg") as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    const base64Data = image.split(",")[1] || image;

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
                media_type: mediaType,
                data: base64Data,
              },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // 분석 결과에서 추천 진료과 코드 추출 (병원 추천 연동용)
    const subjectCodes: string[] = [];
    const lower = text.toLowerCase();
    if (/성형|rhinoplast|blepharop|facelift|jaw|chin|nose|eyelid|plastic/i.test(lower)) subjectCodes.push("08");
    if (/피부|skin|derma|laser|botox|filler|peel|whitening|acne|wrinkle/i.test(lower)) subjectCodes.push("14");
    if (/치과|dental|teeth|veneers|orthodont/i.test(lower)) subjectCodes.push("49");
    if (/안과|eye surgery|lasik|lasek|ophthalm/i.test(lower)) subjectCodes.push("12");
    // 기본 성형외과 fallback
    if (subjectCodes.length === 0) subjectCodes.push("08");

    return NextResponse.json({ success: true, analysis: text, subjectCodes });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
