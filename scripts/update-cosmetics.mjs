#!/usr/bin/env node
// 화장품 순위 자동 수집 스크립트
// 네이버 쇼핑 API로 올리브영/글로우픽/화해 TOP 20 수집 → 영문 번역 → TS 파일 저장
// cron: 매주 월요일 09:00 KST 실행

import { writeFileSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env.local 수동 파싱 (dotenv 의존성 없이)
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
  console.error("ERROR: NAVER_CLIENT_ID or NAVER_CLIENT_SECRET not set");
  process.exit(1);
}

// HTML 태그 제거
function stripHtml(str) {
  return str.replace(/<[^>]*>/g, "");
}

// 네이버 쇼핑 API 검색
async function searchNaver(query, display = 20) {
  const url = `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(query)}&display=${display}&sort=sim`;
  const res = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": NAVER_CLIENT_ID,
      "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
    },
  });
  if (!res.ok) throw new Error(`Naver API ${res.status}: ${query}`);
  const data = await res.json();
  return data.items.map((item) => ({
    title: stripHtml(item.title),
    brand: stripHtml(item.brand || ""),
    lprice: item.lprice,
    category: detectCategory(stripHtml(item.title)),
  }));
}

// 제품명으로 카테고리 추정
function detectCategory(name) {
  const n = name.toLowerCase();
  if (/선크림|sun|spf|자외선/.test(n)) return "선케어";
  if (/클렌징|클렌저|폼|워터|리무버/.test(n)) return "클렌징";
  if (/쿠션|파운데이션|틴트|립|아이|브로우|마스카라|팔레트|하이라이터|블러셔/.test(n)) return "메이크업";
  return "스킨케어";
}

// 가격 포맷
function formatPrice(lprice) {
  if (!lprice) return "-";
  return Number(lprice).toLocaleString("ko-KR") + "원";
}

// OpenAI로 제품명 영문 번역
async function translateNames(names) {
  if (!OPENAI_API_KEY) {
    console.warn("WARN: OPENAI_API_KEY not set, using Korean names as English");
    return names;
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `Translate these Korean cosmetics product names to English. Return ONLY a JSON array of strings, same order. Keep brand names as-is.\n\n${JSON.stringify(names)}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    console.warn("WARN: OpenAI translation failed, using Korean names");
    return names;
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "[]";
  try {
    // JSON 배열 추출 (```json ... ``` 래핑 제거)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : names;
  } catch {
    return names;
  }
}

// 소스별 검색 쿼리
const SOURCES = [
  {
    name: "oliveyoung",
    queries: [
      "올리브영 스킨케어 베스트",
      "올리브영 메이크업 베스트",
      "올리브영 선크림 베스트",
    ],
    file: "cosmetics-oliveyoung.ts",
    varName: "oliveyoungTop20",
  },
  {
    name: "glowpick",
    queries: [
      "글로우픽 스킨케어 추천",
      "글로우픽 메이크업 추천",
      "글로우픽 선크림 추천",
    ],
    file: "cosmetics-glowpick.ts",
    varName: "glowpickTop20",
  },
  {
    name: "hwahae",
    queries: [
      "화해 스킨케어 랭킹",
      "화해 메이크업 랭킹",
      "화해 선크림 추천",
    ],
    file: "cosmetics-hwahae.ts",
    varName: "hwahaeTop20",
  },
];

async function updateSource(source) {
  console.log(`\n[${source.name}] 수집 시작...`);

  // 여러 쿼리로 검색하여 다양한 카테고리 제품 수집
  let allItems = [];
  for (const query of source.queries) {
    try {
      const items = await searchNaver(query, 10);
      allItems.push(...items);
      // API rate limit 방지
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.warn(`  WARN: ${query} 실패 - ${err.message}`);
    }
  }

  // 중복 제거 (제품명 기준) 후 상위 20개
  const seen = new Set();
  const unique = [];
  for (const item of allItems) {
    const key = item.title.slice(0, 20);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }
  const top20 = unique.slice(0, 20);

  if (top20.length === 0) {
    console.warn(`  WARN: ${source.name} 결과 없음, 스킵`);
    return false;
  }

  // 영문 번역
  const koNames = top20.map((i) => i.title);
  console.log(`  번역 중... (${koNames.length}개)`);
  const enNames = await translateNames(koNames);

  // TS 파일 생성
  const items = top20.map((item, idx) => ({
    rank: idx + 1,
    brand: item.brand || "-",
    name: item.title,
    nameEn: enNames[idx] || item.title,
    category: item.category,
    price: formatPrice(item.lprice),
  }));

  const isOliveyoung = source.name === "oliveyoung";
  const importLine = isOliveyoung
    ? ""
    : 'import type { ManualCosmeticsItem } from "./cosmetics-oliveyoung";\n\n';
  const interfaceDef = isOliveyoung
    ? `export interface ManualCosmeticsItem {
  rank: number;
  brand: string;
  name: string;
  nameEn: string;
  category: string;
  price: string;
}\n\n`
    : "";

  const content = `${interfaceDef}${importLine}export const ${source.varName}: ManualCosmeticsItem[] = ${JSON.stringify(items, null, 2).replace(/"(\w+)":/g, "$1:")};\n`;

  const filePath = resolve(__dirname, `../src/data/${source.file}`);
  writeFileSync(filePath, content, "utf-8");
  console.log(`  저장 완료: ${source.file} (${items.length}개)`);
  return true;
}

// 메인 실행
async function main() {
  console.log("=== 화장품 순위 자동 수집 시작 ===");
  console.log(`시각: ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`);

  let updated = false;
  for (const source of SOURCES) {
    try {
      const ok = await updateSource(source);
      if (ok) updated = true;
    } catch (err) {
      console.error(`ERROR [${source.name}]:`, err.message);
    }
  }

  if (updated) {
    console.log("\n=== Git 커밋 + push ===");
    const { execSync } = await import("child_process");
    const cwd = resolve(__dirname, "..");
    try {
      execSync("git add src/data/cosmetics-*.ts", { cwd });
      const date = new Date().toISOString().slice(0, 10);
      execSync(
        `git commit -m "chore: 화장품 순위 자동 업데이트 (${date})"`,
        { cwd }
      );
      execSync("git push origin main", { cwd });
      console.log("Push 완료!");
    } catch (err) {
      console.error("Git 오류:", err.message);
    }
  } else {
    console.log("\n업데이트 없음 — 스킵");
  }

  console.log("\n=== 완료 ===");
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
