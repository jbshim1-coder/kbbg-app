// 텍스트 번역 API — GPT-4o-mini (비용 절약)
import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  ko: "Korean",
  zh: "Chinese (Simplified)",
  ja: "Japanese",
  ru: "Russian",
  vi: "Vietnamese",
  th: "Thai",
  mn: "Mongolian",
};

export async function POST(req: NextRequest) {
  try {
    const { text, targetLocale } = await req.json();
    if (!text || !targetLocale) {
      return NextResponse.json({ error: "Missing text or targetLocale" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not set" }, { status: 500 });
    }

    const targetLang = LOCALE_NAMES[targetLocale] || "English";

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Translate the following text to ${targetLang}. Return only the translated text, no explanations.\n\n${text}`,
          },
        ],
      }),
    });

    if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);

    const data = await response.json();
    const translated = data.choices?.[0]?.message?.content || "";
    return NextResponse.json({ translated });
  } catch {
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
