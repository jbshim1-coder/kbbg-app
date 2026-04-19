#!/usr/bin/env node
// 병원 이벤트 자동 수집 — AI(GPT)로 웹페이지에서 이벤트 추출
// 실행: node scripts/collect-events.mjs
// cron: 0 6 * * 1 (매주 월요일 06:00 UTC = 한국 15:00)

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const EVENTS_PATH = resolve(__dirname, "../src/data/events-data.json");
const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_KEY) {
  console.error("Missing OPENAI_API_KEY");
  process.exit(1);
}

// 현재 이벤트 데이터 로드
const currentData = JSON.parse(readFileSync(EVENTS_PATH, "utf-8"));
const CLINICS = currentData.clinics;

// 웹페이지 텍스트 추출 (HTML → 텍스트, 최대 3000자)
async function fetchPageText(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "ko-KR,ko;q=0.9",
      },
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    // HTML 태그 제거, 공백 정리
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return text.slice(0, 4000);
  } catch (err) {
    console.error(`  페이지 로드 실패: ${err.message}`);
    return null;
  }
}

// GPT로 이벤트 정보 추출
async function extractEvents(clinic, pageText) {
  const prompt = `다음은 "${clinic.clinic}" (${clinic.category}, ${clinic.area}) 병원 웹페이지의 텍스트입니다.

이 텍스트에서 현재 진행 중인 이벤트/프로모션/할인 정보를 추출하세요.

규칙:
- 시술명, 이벤트 가격, 원래 가격(있으면)을 추출
- 가격은 "000,000" 형식 (원 단위, 콤마 포함)
- 원래 가격을 알 수 없으면 이벤트 가격의 약 1.5~2배로 추정
- 이벤트 기간이 있으면 추출, 없으면 "상시 운영"
- 이벤트가 없으면 빈 배열 반환
- 최대 5개 항목

웹페이지 텍스트:
${pageText}

JSON으로 반환:
{
  "title": "이벤트 제목 (간결하게)",
  "items": [{"name": "시술명", "price": "이벤트가격", "original": "원래가격"}],
  "period": "기간"
}

이벤트 정보가 없으면: {"title": "", "items": [], "period": ""}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 600,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

async function main() {
  console.log("\n=== 이벤트 자동 수집 시작 ===\n");
  console.log(`대상 병원: ${CLINICS.length}개\n`);

  const today = new Date().toISOString().slice(0, 10);
  const newEvents = [];
  let successCount = 0;

  for (let i = 0; i < CLINICS.length; i++) {
    const clinic = CLINICS[i];
    console.log(`[${i + 1}/${CLINICS.length}] ${clinic.clinic}...`);

    // 웹페이지 텍스트 추출
    const pageText = await fetchPageText(clinic.url);
    if (!pageText) {
      // 실패 시 기존 데이터 유지
      const existing = currentData.events.find(
        (e) => e.clinic === clinic.clinic
      );
      if (existing) {
        newEvents.push(existing);
        console.log("  → 기존 데이터 유지 (페이지 로드 실패)");
      }
      continue;
    }

    try {
      const result = await extractEvents(clinic, pageText);

      if (result.items && result.items.length > 0) {
        newEvents.push({
          id: i + 1,
          clinic: clinic.clinic,
          area: clinic.area,
          category: clinic.category,
          title: result.title,
          items: result.items,
          period: result.period || "상시 운영",
          url: clinic.url,
        });
        console.log(
          `  ✓ "${result.title}" (${result.items.length}개 항목)`
        );
        successCount++;
      } else {
        // 이벤트 없으면 기존 데이터 유지
        const existing = currentData.events.find(
          (e) => e.clinic === clinic.clinic
        );
        if (existing) {
          newEvents.push({ ...existing, id: i + 1 });
          console.log("  → 이벤트 없음, 기존 데이터 유지");
        } else {
          console.log("  → 이벤트 없음, 건너뜀");
        }
      }
    } catch (err) {
      console.error(`  에러: ${err.message}`);
      const existing = currentData.events.find(
        (e) => e.clinic === clinic.clinic
      );
      if (existing) {
        newEvents.push({ ...existing, id: i + 1 });
        console.log("  → 기존 데이터 유지 (추출 실패)");
      }
    }

    // rate limit
    await new Promise((r) => setTimeout(r, 1000));
  }

  // 새 데이터 저장
  const updatedData = {
    updatedAt: today,
    clinics: CLINICS,
    events: newEvents,
  };

  writeFileSync(EVENTS_PATH, JSON.stringify(updatedData, null, 2), "utf-8");
  console.log(`\n=== 완료: ${successCount}/${CLINICS.length}개 수집, 파일 저장 ===\n`);
}

main().catch(console.error);
