// 블로그 제목/발췌문 클릭베이트 재작성 스크립트
// 사용법:
//   node scripts/rewrite-titles.mjs --dry-run          # 변경 미리보기 (DB 수정 없음)
//   node scripts/rewrite-titles.mjs --site kbbg --dry-run
//   node scripts/rewrite-titles.mjs --site kbbg        # 실제 업데이트

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// ─── .env.local 수동 파싱 (dotenv 미설치 환경 대응) ─────────────────────────
function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const lines = readFileSync(filePath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const envPath = resolve(process.cwd(), ".env.local");
loadEnvFile(envPath);

// ─── CLI 인수 파싱 ────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const siteIdx = args.indexOf("--site");
const siteFilter = siteIdx !== -1 ? args[siteIdx + 1] : null;

// ─── 환경변수 검증 ────────────────────────────────────────────────────────────
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!ANTHROPIC_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing env vars: ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── 사이트별 컨텍스트 설명 ──────────────────────────────────────────────────
const SITE_CONTEXT = {
  kbbg: "medical tourism in Korea (plastic surgery, dental, cosmetic procedures)",
  kskindaily: "Korean skincare routines and beauty products",
  koreatravel365: "travel in Korea (destinations, tips, culture, food)",
  dailyhallyuwave: "K-pop, K-drama, and Korean pop culture",
};

// ─── 언어별 번역 지시 ────────────────────────────────────────────────────────
const LANG_INSTRUCTIONS = {
  title_ko: "Korean",
  title_zh: "Chinese (Simplified)",
  title_ja: "Japanese",
  title_vi: "Vietnamese",
  title_th: "Thai",
  title_ru: "Russian",
  title_mn: "Mongolian",
};

// ─── Claude에게 제목+발췌문 재작성 요청 ─────────────────────────────────────
async function rewritePost(post) {
  const siteCtx = SITE_CONTEXT[post.site] || "general blog about Korea";

  const systemPrompt = `You are a viral content editor specializing in curiosity-driven headlines for ${siteCtx}.
Your rewrites must:
- Create an "information gap" — make readers feel they MUST click to get the answer
- Keep the core SEO keyword in the title
- Stay under 60 characters for titles, under 160 characters for excerpts
- NEVER use: "Complete Guide", "Ultimate Guide", "Everything You Need to Know"
- Use these patterns: numbers, comparisons, secrets/reveals, myth-busting, controversial questions, story hooks, FOMO, time-sensitive angles
- Excerpts should be teasers that hint at surprising content, NOT summaries

Respond ONLY with valid JSON, no markdown fences, no extra text.`;

  const userPrompt = `Site context: ${siteCtx}

Original title_en: ${post.title_en}
Original excerpt_en: ${post.excerpt_en || ""}

Current translations:
- title_ko: ${post.title_ko || ""}
- title_zh: ${post.title_zh || ""}
- title_ja: ${post.title_ja || ""}
- title_vi: ${post.title_vi || ""}
- title_th: ${post.title_th || ""}
- title_ru: ${post.title_ru || ""}
- title_mn: ${post.title_mn || ""}

Rewrite rules:
1. title_en: curiosity-driven, max 60 chars, keep core keyword, no banned phrases
2. excerpt_en: teaser that creates information gap, max 160 chars, hint at surprising fact
   Example style — Before: "A comprehensive guide to rhinoplasty costs in Korea"
                   After: "Korean nose jobs cost 70% less than the US — but there's a catch most blogs won't mention."
3. For each translated title: rewrite in the same curiosity style as title_en but in the target language (keep under 60 chars equivalent)

Return JSON with exactly these keys:
{
  "title_en": "...",
  "excerpt_en": "...",
  "title_ko": "...",
  "title_zh": "...",
  "title_ja": "...",
  "title_vi": "...",
  "title_th": "...",
  "title_ru": "...",
  "title_mn": "..."
}`;

  const response = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  });

  const text = response.content[0].text.trim();
  return JSON.parse(text);
}

// ─── 배치 처리 (5개씩, 배치 사이 1초 대기) ──────────────────────────────────
async function processBatch(posts) {
  const results = [];
  for (const post of posts) {
    try {
      const rewritten = await rewritePost(post);
      results.push({ post, rewritten, error: null });
    } catch (err) {
      console.error(`  Error rewriting slug=${post.slug}: ${err.message}`);
      results.push({ post, rewritten: null, error: err.message });
    }
  }
  return results;
}

// ─── 메인 실행 ───────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n=== 블로그 제목 재작성 스크립트 ===`);
  console.log(`모드: ${isDryRun ? "DRY RUN (미리보기만)" : "실제 업데이트"}`);
  if (siteFilter) console.log(`사이트 필터: ${siteFilter}`);
  console.log("");

  // 퍼블리시된 포스트 로드
  let query = supabase
    .from("blog_posts")
    .select("id, slug, site, title_en, title_ko, title_zh, title_ja, title_vi, title_th, title_ru, title_mn, excerpt_en")
    .eq("is_published", true);

  if (siteFilter) {
    query = query.eq("site", siteFilter);
  }

  const { data: posts, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase 조회 실패:", error.message);
    process.exit(1);
  }

  if (!posts || posts.length === 0) {
    console.log("처리할 포스트가 없습니다.");
    return;
  }

  console.log(`총 ${posts.length}개 포스트 처리 예정\n`);

  const BATCH_SIZE = 5;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < posts.length; i += BATCH_SIZE) {
    const batch = posts.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(posts.length / BATCH_SIZE);

    console.log(`배치 ${batchNum}/${totalBatches} 처리 중... (${batch.length}개)`);

    const results = await processBatch(batch);

    for (const { post, rewritten, error: err } of results) {
      if (err || !rewritten) {
        errorCount++;
        continue;
      }

      console.log(`\n  [${post.slug}] (${post.site})`);
      console.log(`    제목 전: ${post.title_en}`);
      console.log(`    제목 후: ${rewritten.title_en}`);
      console.log(`    발췌 전: ${post.excerpt_en || "(없음)"}`);
      console.log(`    발췌 후: ${rewritten.excerpt_en}`);
      if (rewritten.title_ko) {
        console.log(`    title_ko: ${rewritten.title_ko}`);
      }

      if (!isDryRun) {
        // title_en, excerpt_en, 번역 제목 모두 업데이트
        const updatePayload = {
          title_en: rewritten.title_en,
          excerpt_en: rewritten.excerpt_en,
          title_ko: rewritten.title_ko || post.title_ko,
          title_zh: rewritten.title_zh || post.title_zh,
          title_ja: rewritten.title_ja || post.title_ja,
          title_vi: rewritten.title_vi || post.title_vi,
          title_th: rewritten.title_th || post.title_th,
          title_ru: rewritten.title_ru || post.title_ru,
          title_mn: rewritten.title_mn || post.title_mn,
        };

        const { error: updateErr } = await supabase
          .from("blog_posts")
          .update(updatePayload)
          .eq("id", post.id);

        if (updateErr) {
          console.error(`    업데이트 실패: ${updateErr.message}`);
          errorCount++;
        } else {
          console.log(`    DB 업데이트 완료`);
          successCount++;
        }
      } else {
        successCount++;
      }
    }

    // 마지막 배치가 아니면 1초 대기 (API 레이트 리밋 방지)
    if (i + BATCH_SIZE < posts.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log(`\n=== 완료 ===`);
  console.log(`성공: ${successCount}개`);
  if (errorCount > 0) console.log(`실패: ${errorCount}개`);
  if (isDryRun) {
    console.log("\n[DRY RUN] 실제 DB는 변경되지 않았습니다.");
    console.log("실제 적용하려면 --dry-run 플래그를 제거하고 다시 실행하세요.");
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
