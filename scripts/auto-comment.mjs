#!/usr/bin/env node
// 댓글 자동 생성 — 게시글별 3~5개 댓글 + comment_count 동기화
// 실행: node scripts/auto-comment.mjs [--seed] [--daily]
// --seed: 기존 게시글에 초기 댓글 일괄 생성 (3~5개/글)
// --daily: 최근 게시글에 1~2개 댓글 추가 (cron용)
// cron: 0 12,18 * * * cd /home/jbshi/kbbg-app && node scripts/auto-comment.mjs --daily

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_KEY) {
  console.error("Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const isSeed = process.argv.includes("--seed");
const isDaily = process.argv.includes("--daily");

// 언어별 이메일 패턴 (auto-post.mjs와 동일)
const LANG_PATTERNS = {
  en: ["emily", "james_la", "sophie", "mike_sydney", "rachel", "david_chicago", "anna_seattle", "chris_miami", "lisa_boston", "tom_denver"],
  zh: ["xiaomei", "dawei", "lili_gz", "ming_sz", "xiaohong", "ajie", "tingting", "xiaolong", "meimei", "daming"],
  ja: ["yuki", "hana_osaka", "takashi", "sakura", "kenta", "ai_fukuoka", "ryo_sapporo", "mai_kobe", "sota", "miku"],
  ru: ["anya", "dima", "katya", "sasha_sochi", "oleg", "masha", "igor", "lena_krd", "max_rst", "nastya"],
  vi: ["linh", "minh", "trang", "duc_hp", "hoa_ct", "nam_hue", "lan_nt", "tuan_vt", "mai_bn", "hung_th"],
  th: ["nid_bkk", "ton_cnx", "prae", "boy_pty", "mint_kkn", "j_hdy", "ann_udn", "gun_ryg", "fa_nkr", "may_srt"],
  mn: ["bold", "sarnai", "bat_dkh", "oyuu", "ganaa", "tsetseg", "dorj", "nomin", "temuulen", "enkhjin"],
  ko: ["jiyoung", "hyunwoo", "sujin", "minho_dg", "yeeun", "taehyun", "sohee", "junyoung", "hana_sw", "sungmin"],
};

// 댓글 유형 — 자연스러운 다양성
const COMMENT_TYPES = [
  "supportive reply (e.g. 'Thanks for sharing!', 'I had a similar experience')",
  "follow-up question (e.g. 'How long was recovery?', 'Which clinic was it?')",
  "personal experience sharing (brief, 1-3 sentences about your own procedure)",
  "helpful tip or advice (e.g. 'Bring a neck pillow', 'Book early')",
  "expressing interest (e.g. 'I'm considering this too', 'Adding this to my list')",
];

function getUserLang(email) {
  for (const [lang, patterns] of Object.entries(LANG_PATTERNS)) {
    if (patterns.some((p) => email.includes(p))) return lang;
  }
  return "en";
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 댓글 발행 시간: 게시글 작성 후 1시간~7일 사이 랜덤
function randomCommentDate(postCreatedAt) {
  const postDate = new Date(postCreatedAt);
  const minOffset = 60 * 60 * 1000; // 1시간
  const maxOffset = 7 * 24 * 60 * 60 * 1000; // 7일
  const offset = randomBetween(minOffset, maxOffset);
  const commentDate = new Date(postDate.getTime() + offset);
  // 미래 날짜 방지
  const now = new Date();
  return commentDate > now ? now : commentDate;
}

async function generateComment(postTitle, postContent, lang, commentType) {
  const langNames = {
    en: "English", zh: "Simplified Chinese", ja: "Japanese",
    ru: "Russian", vi: "Vietnamese", th: "Thai", mn: "Mongolian Cyrillic", ko: "Korean",
  };

  const prompt = `You are a real user on a Korean medical tourism forum. Write a comment in ${langNames[lang] || "English"}.

Post title: "${postTitle}"
Post excerpt: "${postContent.slice(0, 200)}..."

Comment type: ${commentType}

Rules:
- Write 1-3 sentences only. Be brief and natural.
- Sound like a real person, not AI. Use casual tone.
- Occasionally use emoji (30% chance) or text expressions.
- Do NOT be overly polite or formal.
- Do NOT repeat the post title.

Return JSON only: {"content": "..."}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 300,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

async function main() {
  console.log(`\n=== 댓글 자동 생성 (${isSeed ? "SEED" : "DAILY"}) ===\n`);

  // 유저 조회 + 언어별 그룹핑
  const { data: users } = await supabase.from("users").select("id, username, email");
  const usersByLang = {};
  for (const u of users) {
    const lang = getUserLang(u.email);
    if (!usersByLang[lang]) usersByLang[lang] = [];
    usersByLang[lang].push(u);
  }

  // 게시글 조회
  let postQuery = supabase.from("posts").select("id, title, content, author_id, created_at, comment_count");
  if (isDaily) {
    // daily: 최근 3일 게시글만
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    postQuery = postQuery.gte("created_at", threeDaysAgo);
  }
  const { data: posts } = await postQuery.order("created_at", { ascending: false });

  if (!posts || posts.length === 0) {
    console.log("대상 게시글 없음");
    return;
  }
  console.log(`대상 게시글: ${posts.length}개\n`);

  const langs = Object.keys(LANG_PATTERNS);
  let totalComments = 0;

  for (const post of posts) {
    const commentCount = isSeed ? randomBetween(3, 5) : randomBetween(1, 2);
    let postComments = 0;

    for (let i = 0; i < commentCount; i++) {
      // 글 작성자와 다른 언어권 유저 선택
      const authorLang = getUserLang(users.find((u) => u.id === post.author_id)?.email || "");
      let commentLang;
      do {
        commentLang = langs[Math.floor(Math.random() * langs.length)];
      } while (commentLang === authorLang && langs.length > 1);

      const candidates = usersByLang[commentLang] || usersByLang["en"];
      const commenter = candidates[Math.floor(Math.random() * candidates.length)];
      const commentType = COMMENT_TYPES[Math.floor(Math.random() * COMMENT_TYPES.length)];

      try {
        const result = await generateComment(post.title, post.content, commentLang, commentType);
        const commentDate = isSeed
          ? randomCommentDate(post.created_at)
          : new Date();

        const { error } = await supabase.from("comments").insert({
          post_id: post.id,
          author_id: commenter.id,
          content: result.content,
          upvotes: randomBetween(0, 15),
          downvotes: randomBetween(0, 2),
          is_deleted: false,
          created_at: commentDate.toISOString(),
        });

        if (error) {
          console.error(`  실패: ${error.message}`);
        } else {
          console.log(`  ✓ [${commentLang}] ${commenter.username}: "${result.content.slice(0, 50)}..."`);
          postComments++;
          totalComments++;
        }

        // rate limit
        await new Promise((r) => setTimeout(r, 400));
      } catch (err) {
        console.error(`  에러: ${err.message}`);
      }
    }

    // comment_count 실제 값으로 동기화
    if (postComments > 0) {
      const { count } = await supabase
        .from("comments")
        .select("id", { count: "exact", head: true })
        .eq("post_id", post.id);

      await supabase
        .from("posts")
        .update({ comment_count: count })
        .eq("id", post.id);

      console.log(`[${post.title.slice(0, 40)}...] ${postComments}개 댓글 추가 (총 ${count}개)\n`);
    }
  }

  console.log(`\n=== 완료: ${totalComments}건 댓글 생성 ===\n`);
}

main().catch(console.error);
