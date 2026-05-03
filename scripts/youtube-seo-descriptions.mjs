// YouTube Shorts SEO 설명 생성기
// 사용법:
//   단건: node scripts/youtube-seo-descriptions.mjs "Korean rhinoplasty recovery"
//   일괄: node scripts/youtube-seo-descriptions.mjs --batch

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, appendFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { TOPICS } from "./blog-topics.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = resolve(__dirname, "youtube-descriptions-output.txt");
const BATCH_FILE = resolve(__dirname, "youtube-descriptions-batch.txt");

// .env.local 수동 파싱 (dotenv 의존성 없이)
function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !(key in process.env)) process.env[key] = val;
  }
}

loadEnv();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error("Error: ANTHROPIC_API_KEY not found in env or .env.local");
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// KBBG 사이트 링크
const KBBG_SEARCH = "https://kbeautybuyersguide.com/en/ai-search";
const KBBG_BLOG = "https://kbeautybuyersguide.com/en/blog";

// 주제별 블로그 슬러그 생성
function toSlug(keyword) {
  return keyword.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Claude API로 SEO 설명 생성
async function generateDescription(topic) {
  const prompt = `You are a YouTube Shorts SEO expert specializing in Korean medical tourism and K-beauty content.

Generate a YouTube Shorts description for this topic: "${topic}"

Target audience: International patients interested in Korean medical tourism, K-beauty, K-pop.

STRICT FORMAT — output exactly this structure with no extra commentary:

LINE1: [Hook line — curiosity-driven, max 60 chars, ends with "..."]
LINE2: [Second hook line — supports LINE1, max 80 chars]
BLANK
[2-3 sentences of value content about the topic. Mention Korea, cost savings, or quality naturally.]
BLANK
Keywords: [8-10 comma-separated search terms, naturally written, no brackets]
BLANK
MULTILINGUAL: [Korean term] | [Chinese simplified term] | [Japanese term] | [Vietnamese term]
BLANK
🏥 Find your perfect clinic: ${KBBG_SEARCH}
📋 Full guide: ${KBBG_BLOG}/${toSlug(topic)}
BLANK
[6-8 hashtags: mix #HighCompetition #MediumCompetition #Niche, always include #KBBG #KoreanMedicalTourism]

Rules:
- LINE1 and LINE2 appear above YouTube's "more" fold — make them irresistible
- Keywords must feel natural, not stuffed
- Multilingual section uses native script (한국어, 中文, 日本語, Tiếng Việt)
- Total description must be under 5000 characters
- No quotation marks around the output
- No section headers or labels in the output (no "Hook:", "Keywords:" prefix — just the word "Keywords:")`;

  const message = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  return message.content[0].text.trim();
}

// 출력 포맷 (구분선 포함)
function formatEntry(topic, description) {
  const separator = "═".repeat(70);
  const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
  return `${separator}\nTopic: ${topic}\nGenerated: ${timestamp}\n${separator}\n${description}\n\n`;
}

// 단건 생성 모드
async function runSingle(topic) {
  console.log(`\nGenerating YouTube Shorts description for: "${topic}"\n`);

  const description = await generateDescription(topic);
  const entry = formatEntry(topic, description);

  // stdout 출력
  console.log(description);

  // 파일에 추가 (append 모드)
  appendFileSync(OUTPUT_FILE, entry, "utf-8");
  console.log(`\n✓ Saved to: ${OUTPUT_FILE}`);
}

// 일괄 생성 모드 (blog-topics.mjs 첫 30개)
async function runBatch() {
  const topics = TOPICS.slice(0, 30);
  console.log(`\nBatch mode: generating ${topics.length} descriptions...\n`);

  // 배치 파일 초기화
  writeFileSync(BATCH_FILE, "", "utf-8");

  for (let i = 0; i < topics.length; i++) {
    const { keyword } = topics[i];
    process.stdout.write(`[${i + 1}/${topics.length}] ${keyword} ... `);

    try {
      const description = await generateDescription(keyword);
      const entry = formatEntry(keyword, description);
      appendFileSync(BATCH_FILE, entry, "utf-8");
      process.stdout.write("done\n");
    } catch (err) {
      process.stdout.write(`ERROR: ${err.message}\n`);
    }

    // API 호출 간격 (rate limit 방지)
    if (i < topics.length - 1) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log(`\n✓ Batch complete. Saved to: ${BATCH_FILE}`);
}

// 진입점
const arg = process.argv[2];

if (!arg) {
  console.error('Usage:');
  console.error('  Single: node scripts/youtube-seo-descriptions.mjs "Korean rhinoplasty recovery"');
  console.error('  Batch:  node scripts/youtube-seo-descriptions.mjs --batch');
  process.exit(1);
}

if (arg === "--batch") {
  await runBatch();
} else {
  await runSingle(arg);
}
