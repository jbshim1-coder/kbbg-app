import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

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

// 텍스트 번역 API — Claude Haiku로 비용 절약
export async function POST(req: NextRequest) {
  try {
    const { text, targetLocale } = await req.json();
    if (!text || !targetLocale) {
      return NextResponse.json({ error: "Missing text or targetLocale" }, { status: 400 });
    }

    const targetLang = LOCALE_NAMES[targetLocale] || "English";

    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Translate the following text to ${targetLang}. Return only the translated text, no explanations.\n\n${text}`,
        },
      ],
    });

    const translated = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ translated });
  } catch {
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
