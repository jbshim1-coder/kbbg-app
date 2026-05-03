// PAA(People Also Ask) 스타일 주제 생성기
// blog-topics.mjs의 시드 키워드를 기반으로 구글 PAA 형식 질문을 생성
// 사용법: node scripts/paa-topics-generator.mjs
// 결과: scripts/blog-topics-paa.mjs (blog-topics.mjs와 동일한 포맷)

import Anthropic from "@anthropic-ai/sdk";
import { writeFileSync } from "fs";
import { TOPICS } from "./blog-topics.mjs";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  console.error("Missing env var: ANTHROPIC_API_KEY");
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// 카테고리별로 시드 키워드를 그룹핑
function groupByCategory(topics) {
  return topics.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {});
}

// 각 카테고리에서 대표 시드를 샘플링 (전체 365개 대신 카테고리당 8개)
function sampleSeeds(grouped, perCategory = 8) {
  const seeds = [];
  for (const [category, topics] of Object.entries(grouped)) {
    // 균등 간격으로 샘플링해서 다양성 확보
    const step = Math.max(1, Math.floor(topics.length / perCategory));
    for (let i = 0; i < topics.length && seeds.length - seeds.filter(s => s.category !== category).length < perCategory; i += step) {
      seeds.push(topics[i]);
    }
  }
  return seeds;
}

// Claude API로 PAA 질문 생성 (배치 처리)
async function generatePaaQuestions(seedBatch) {
  const seedList = seedBatch.map((t, i) => `${i + 1}. [${t.category}] "${t.keyword}"`).join("\n");

  const prompt = `You are an SEO expert specializing in Korean medical tourism and K-beauty.

For each seed keyword below, generate 3-5 "People Also Ask" style questions that Google would show in search results.
These questions should:
- Be exactly how real people type questions into Google (natural language)
- Target high-intent searchers (people planning to visit Korea for beauty/medical)
- Include specific details: prices, procedures, safety, comparisons, how-to
- Be diverse: some "how much", some "is it safe", some "how to", some "what is the best", some "vs" comparisons
- Be in ENGLISH only
- Be concise (under 70 characters each)

Seed keywords:
${seedList}

Respond with ONLY a JSON array, no markdown. Each element must have:
{
  "seed_index": <1-based number>,
  "category": "<same category as seed>",
  "questions": ["question 1", "question 2", ...]
}

Example output:
[
  {
    "seed_index": 1,
    "category": "guide",
    "questions": [
      "How much does rhinoplasty cost in Korea 2026?",
      "Is nose surgery in Korea safe for foreigners?",
      "What is the best clinic for rhinoplasty in Seoul?"
    ]
  }
]`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonStr = text.replace(/^```json\n?/, "").replace(/\n?```$/, "");

  try {
    return JSON.parse(jsonStr);
  } catch {
    console.error("JSON 파싱 실패, 빈 배열 반환");
    return [];
  }
}

// PAA 질문을 TOPICS 포맷의 엔트리로 변환
function questionsToTopicEntries(batchResults, seedBatch) {
  const entries = [];
  for (const result of batchResults) {
    const seed = seedBatch[result.seed_index - 1];
    if (!seed) continue;
    for (const question of result.questions || []) {
      // 질문 형식 정규화: 끝에 ? 없으면 추가
      const keyword = question.trim().replace(/\?$/, "") + "?";
      entries.push({ category: result.category, keyword });
    }
  }
  return entries;
}

// blog-topics-paa.mjs 파일 생성
function writePaaTopicsFile(entries) {
  const outputPath = new URL("./blog-topics-paa.mjs", import.meta.url).pathname;

  // 카테고리별로 그룹화해서 가독성 향상
  const grouped = groupByCategory(entries);
  const categoryOrder = ["guide", "faq", "compare", "cosmetics", "ingredient", "tips", "event"];

  const lines = [
    "// PAA(People Also Ask) 형식 블로그 주제",
    "// paa-topics-generator.mjs로 자동 생성됨 — 직접 수정하지 말 것",
    `// 생성일시: ${new Date().toISOString()}`,
    "// 사용법: auto-blog.mjs에서 import해서 TOPICS와 혼합 사용",
    "",
    "export const PAA_TOPICS = [",
  ];

  for (const category of categoryOrder) {
    const catEntries = grouped[category];
    if (!catEntries || catEntries.length === 0) continue;

    const catLabel = {
      guide: "GUIDE — 시술 가이드 PAA",
      faq: "FAQ — 자주 묻는 질문 PAA",
      compare: "COMPARE — 비용 비교 PAA",
      cosmetics: "COSMETICS — 화장품 PAA",
      ingredient: "INGREDIENT — 성분 PAA",
      tips: "TIPS — 의료관광 팁 PAA",
      event: "EVENT — 이벤트/트렌드 PAA",
    }[category] || category.toUpperCase();

    lines.push(`  // ${"═".repeat(63)}`);
    lines.push(`  // ${catLabel} (${catEntries.length}개)`);
    lines.push(`  // ${"═".repeat(63)}`);

    for (const entry of catEntries) {
      // 키워드 내 큰따옴표 이스케이프
      const safeKeyword = entry.keyword.replace(/"/g, '\\"');
      lines.push(`  { category: "${entry.category}", keyword: "${safeKeyword}" },`);
    }
    lines.push("");
  }

  lines.push("];");

  writeFileSync(outputPath, lines.join("\n"), "utf8");
  return outputPath;
}

// ─── 메인 실행 ──────────────────────────────────────────────────────
async function main() {
  console.log(`[${new Date().toISOString()}] PAA 주제 생성 시작`);
  console.log(`시드 주제 총 ${TOPICS.length}개`);

  // 카테고리별 그룹핑 후 샘플링
  const grouped = groupByCategory(TOPICS);
  const categories = Object.keys(grouped);
  console.log(`카테고리: ${categories.join(", ")}`);

  // 카테고리당 8개씩 샘플링 → 전체 약 56개 시드
  const perCategory = 8;
  const seeds = [];
  for (const [category, topics] of Object.entries(grouped)) {
    const step = Math.max(1, Math.floor(topics.length / perCategory));
    for (let i = 0; i < topics.length && seeds.filter(s => s.category === category).length < perCategory; i += step) {
      seeds.push(topics[i]);
    }
  }

  console.log(`샘플링된 시드: ${seeds.length}개`);

  // 5개씩 배치로 API 호출 (rate limit 방지)
  const BATCH_SIZE = 5;
  const allEntries = [];

  for (let i = 0; i < seeds.length; i += BATCH_SIZE) {
    const batch = seeds.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(seeds.length / BATCH_SIZE);

    console.log(`배치 ${batchNum}/${totalBatches} 처리 중... (${batch.map(s => s.keyword.slice(0, 30)).join(", ")})`);

    const results = await generatePaaQuestions(batch);
    const entries = questionsToTopicEntries(results, batch);

    console.log(`  → ${entries.length}개 PAA 질문 생성됨`);
    allEntries.push(...entries);

    // 다음 배치 전 잠깐 대기 (API rate limit 방지)
    if (i + BATCH_SIZE < seeds.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log(`\n총 ${allEntries.length}개 PAA 주제 생성 완료`);

  // 파일 저장
  const outputPath = writePaaTopicsFile(allEntries);
  console.log(`저장 완료: ${outputPath}`);
  console.log(`\n다음 단계: auto-blog.mjs에서 PAA 주제를 30% 확률로 사용하도록 설정됨`);
}

main().catch(err => {
  console.error("에러:", err.message);
  process.exit(1);
});
