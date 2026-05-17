// 3-Day Korea Medical Trip Planner — Claude Haiku 기반 AI 일정 생성
// 입력: 시술/날짜/예산/관심사 → Supabase 클리닉 후보 → Claude로 JSON 일정 생성

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServiceRoleClient } from "@/lib/supabase";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 요청 바디 타입
interface GenerateRequest {
  procedures: string[];
  arrivalDate: string;
  preferences: {
    budget: string;
    interests: string[];
  };
}

// Supabase에서 가져온 클리닉 요약 타입
interface ClinicSummary {
  name_en: string | null;
  address: string | null;
  google_rating: number | null;
  sggu_cd_nm: string | null;
}

// Claude 응답 일정 타입
interface ItineraryItem {
  time: string;
  type: string;
  title: string;
  detail: string;
}

interface ItineraryDay {
  day: number;
  date_label: string;
  items: ItineraryItem[];
}

interface Itinerary {
  summary: string;
  days: ItineraryDay[];
  tips: string[];
  estimated_cost: string;
}

// 서울 성형/피부 클리닉 상위 10개 조회
async function fetchClinics(): Promise<ClinicSummary[]> {
  const supabase = createServiceRoleClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("clinics")
    .select("name_en, address, google_rating, sggu_cd_nm, sido_cd_nm, dgsbjt_cd_nm")
    .eq("sido_cd_nm", "서울")
    .in("dgsbjt_cd_nm", ["Plastic Surgery", "Dermatology"])
    .order("google_rating", { ascending: false, nullsFirst: false })
    .limit(10);

  if (error || !data) return [];
  return data as ClinicSummary[];
}

// 클리닉 목록을 프롬프트용 텍스트로 직렬화
function formatClinics(clinics: ClinicSummary[]): string {
  if (clinics.length === 0) return "(no clinics available)";
  return clinics
    .map((c, i) => {
      const parts = [
        `${i + 1}. ${c.name_en || "Unnamed"}`,
        c.sggu_cd_nm || null,
        c.address || null,
        c.google_rating ? `Rating ${c.google_rating}` : null,
      ].filter(Boolean);
      return parts.join(" | ");
    })
    .join("\n");
}

// Claude 응답 텍스트에서 JSON 블록 추출
function extractJson(text: string): Itinerary | null {
  // 코드펜스 안의 JSON 우선 시도
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenceMatch ? fenceMatch[1] : text;
  // 첫 { 부터 마지막 } 까지 잘라내 파싱
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const jsonStr = candidate.slice(start, end + 1);
  try {
    return JSON.parse(jsonStr) as Itinerary;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateRequest;
    const { procedures, arrivalDate, preferences } = body || ({} as GenerateRequest);

    if (!procedures || procedures.length === 0 || !arrivalDate) {
      return NextResponse.json(
        { error: "procedures and arrivalDate are required" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 });
    }

    const clinics = await fetchClinics();
    const clinicText = formatClinics(clinics);

    const budget = preferences?.budget || "Standard";
    const interests = (preferences?.interests || []).join(", ") || "(none)";

    const userPrompt = `Create a 4-day Korea medical tourism itinerary (Fri-Mon).
Procedures: ${procedures.join(", ")}
Budget: ${budget}
Interests: ${interests}
Arrival date: ${arrivalDate}
Available clinics:
${clinicText}

Return ONLY valid JSON (no extra prose, no markdown fences) matching:
{
  "summary": "one line summary",
  "days": [
    {
      "day": 1,
      "date_label": "Friday - Arrival",
      "items": [
        { "time": "15:00", "type": "transport", "title": "Arrive at Incheon Airport", "detail": "Take AREX to Hongik University station (~50min, ₩9,500)" },
        { "time": "18:00", "type": "hotel", "title": "Check-in Gangnam area", "detail": "Recommended: near Apgujeong or Sinnonhyeon station" },
        { "time": "20:00", "type": "food", "title": "Dinner at Gangnam", "detail": "Try Korean BBQ nearby" }
      ]
    }
  ],
  "tips": ["tip1", "tip2", "tip3"],
  "estimated_cost": "$X,XXX - $X,XXX USD"
}

Day 1 = Friday (Arrival), Day 2 = Saturday (Procedure day), Day 3 = Sunday (Recovery), Day 4 = Monday (Departure).
Use the "type" field values: transport, hotel, clinic, food, activity.
Pick clinic names ONLY from the provided list when scheduling clinic visits.`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 2048,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text =
      response.content[0]?.type === "text" ? response.content[0].text : "";

    const itinerary = extractJson(text);
    if (!itinerary) {
      return NextResponse.json(
        { error: "Failed to parse AI response", raw: text },
        { status: 502 }
      );
    }

    return NextResponse.json({ itinerary });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[planner/generate] Error:", message);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
