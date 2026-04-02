#!/usr/bin/env node
// 매일 자동 글쓰기 — 2개 계정 × 8개 언어 = 16건/일
// 실행: node scripts/auto-post.mjs
// cron: 0 9 * * * cd /home/jbshi/kbbg-app && node scripts/auto-post.mjs

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_KEY) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 언어별 글 생성 프롬프트 — 페르소나 구체화 (Gemini 제안 반영)
const LANG_PROMPTS = {
  en: "You are a 20-30 year old American or British woman who traveled to Korea for cosmetic surgery. Write casually like a real forum user — use some slang, occasional typos are OK, and sprinkle in emoji sometimes. Share your honest experience.",
  zh: "你是一个25-35岁的中国女生（用简体中文），去韩国做了医美。像在小红书发帖一样写，语气自然随意，可以用一些网络用语和表情符号。",
  ja: "あなたは20-30代の日本人女性で、韓国で美容施術を受けました。自然な口調で書いてください。絵文字やカジュアルな表現を混ぜてOKです。",
  ru: "Вы — русская девушка 20-30 лет, которая ездила в Корею на косметическую процедуру. Пишите как в обычном форуме — живым языком, можно с эмодзи и сленгом.",
  vi: "Bạn là người Việt Nam 20-35 tuổi đã đi Hàn Quốc làm thẩm mỹ. Viết tự nhiên như đăng trên group Facebook — dùng ngôn ngữ đời thường, emoji OK.",
  th: "คุณเป็นคนไทยอายุ 20-30 ปี ไปทำศัลยกรรมที่เกาหลี เขียนแบบธรรมชาติเหมือนโพสต์ในกลุ่ม Facebook — ใช้ภาษาพูด อิโมจิได้",
  mn: "Та бол 20-30 насны Монгол эмэгтэй, Солонгост гоо сайхны мэс засал хийлгэсэн. Форум дээр бичдэг шиг байгалийн чөлөөтэй бичнэ үү.",
  ko: "당신은 20-30대 한국인으로 성형외과/피부과에서 시술을 받았습니다. 커뮤니티에 글 쓰듯 편하게, 가끔 이모지나 줄임말을 섞어서 자연스럽게 써주세요.",
};

// 게시판별 주제
const BOARD_TOPICS = {
  "plastic-surgery": [
    "rhinoplasty review", "double eyelid surgery experience", "jaw contouring recovery",
    "breast augmentation in Korea", "fat grafting results", "revision surgery advice",
    "consultation tips for plastic surgery", "before and after comparison",
    "choosing between clinics", "post-op care routine",
  ],
  "dermatology": [
    "laser toning results", "Ulthera vs Thermage", "acne scar treatment",
    "Botox experience in Korea", "filler review", "skin whitening treatment",
    "pore treatment at Korean clinic", "hair removal laser",
    "PRP facial results", "Korean skincare after procedure",
  ],
  "dental": [
    "dental implant experience", "veneers in Seoul", "teeth whitening review",
    "orthodontics in Korea", "dental crown abroad", "wisdom tooth removal",
    "full mouth restoration", "dental tourism cost comparison",
  ],
  "general": [
    "first time medical tourism tips", "hotel recommendations near Gangnam clinics",
    "transportation guide for medical tourists", "how to communicate with Korean doctors",
    "insurance for medical tourism", "best time to visit Korea for procedures",
    "combining tourism with medical trip", "translation app recommendations",
    "recovery food in Korea", "clinic payment methods guide",
  ],
};

async function generatePost(lang, board, topic) {
  const langPrompt = LANG_PROMPTS[lang] || LANG_PROMPTS.en;
  const prompt = `${langPrompt}

Write a community forum post about: "${topic}" for a Korean medical tourism platform.

Requirements:
- Title: short, natural, engaging (max 80 chars). Do NOT start with "My" every time.
- Content: vary length naturally — short posts (50-100 words) for quick questions, medium (150-250 words) for experiences, long (250-400 words) for detailed reviews.
- Include specific details when relevant (cost range, recovery days, clinic area like Gangnam/Sinsa/Apgujeong).
- Sound like a REAL person — not AI. Vary sentence length. Use incomplete sentences sometimes. Be opinionated.
- Do NOT use bullet points in every post. Mix paragraph style and list style.
- Board category: ${board}

Return JSON only:
{"title": "...", "content": "..."}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 800,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

async function main() {
  console.log("\n=== 자동 글쓰기 시작 ===\n");

  // boards 조회
  const { data: boards } = await supabase.from("boards").select("id, slug");
  const boardMap = Object.fromEntries(boards.map((b) => [b.slug, b.id]));

  // users 조회 + 언어별 그룹핑
  const { data: users } = await supabase.from("users").select("id, username, email");
  const usersByLang = {};
  const langPatterns = {
    en: ["emily", "james_la", "sophie", "mike_sydney", "rachel", "david_chicago", "anna_seattle", "chris_miami", "lisa_boston", "tom_denver"],
    zh: ["xiaomei", "dawei", "lili_gz", "ming_sz", "xiaohong", "ajie", "tingting", "xiaolong", "meimei", "daming"],
    ja: ["yuki", "hana_osaka", "takashi", "sakura", "kenta", "ai_fukuoka", "ryo_sapporo", "mai_kobe", "sota", "miku"],
    ru: ["anya", "dima", "katya", "sasha_sochi", "oleg", "masha", "igor", "lena_krd", "max_rst", "nastya"],
    vi: ["linh", "minh", "trang", "duc_hp", "hoa_ct", "nam_hue", "lan_nt", "tuan_vt", "mai_bn", "hung_th"],
    th: ["nid_bkk", "ton_cnx", "prae", "boy_pty", "mint_kkn", "j_hdy", "ann_udn", "gun_ryg", "fa_nkr", "may_srt"],
    mn: ["bold", "sarnai", "bat_dkh", "oyuu", "ganaa", "tsetseg", "dorj", "nomin", "temuulen", "enkhjin"],
    ko: ["jiyoung", "hyunwoo", "sujin", "minho_dg", "yeeun", "taehyun", "sohee", "junyoung", "hana_sw", "sungmin"],
  };

  for (const [lang, patterns] of Object.entries(langPatterns)) {
    usersByLang[lang] = users.filter((u) => patterns.some((p) => u.email.includes(p)));
  }

  // 오늘 날짜 기반 로테이션 인덱스
  const dayIndex = Math.floor(Date.now() / 86400000);
  const boardSlugs = Object.keys(BOARD_TOPICS);
  let totalPosted = 0;

  for (const lang of Object.keys(LANG_PROMPTS)) {
    const langUsers = usersByLang[lang] || [];
    if (langUsers.length === 0) continue;

    // 2명 선택 (로테이션)
    const user1 = langUsers[dayIndex % langUsers.length];
    const user2 = langUsers[(dayIndex + 1) % langUsers.length];
    const selectedUsers = [user1, user2];

    for (let i = 0; i < 2; i++) {
      const user = selectedUsers[i];
      const boardSlug = boardSlugs[(dayIndex + i + totalPosted) % boardSlugs.length];
      const topics = BOARD_TOPICS[boardSlug];
      const topic = topics[(dayIndex + totalPosted) % topics.length];

      try {
        console.log(`[${lang}] ${user.username} → ${boardSlug}: "${topic}"...`);
        const post = await generatePost(lang, boardSlug, topic);

        const { error } = await supabase.from("posts").insert({
          board_id: boardMap[boardSlug],
          author_id: user.id,
          title: post.title,
          content: post.content,
          // 현실적 지표: 좋아요 = 조회수의 1~5%
          ...(() => {
            const views = Math.floor(Math.random() * 800) + 30;
            const rate = 0.01 + Math.random() * 0.04;
            return {
              view_count: views,
              upvotes: Math.max(1, Math.floor(views * rate)),
              downvotes: Math.floor(Math.random() * 2),
              comment_count: 0,
            };
          })(),
          is_pinned: false,
          is_deleted: false,
        });

        if (error) {
          console.error(`  실패: ${error.message}`);
        } else {
          console.log(`  ✓ "${post.title.slice(0, 50)}..."`);
          totalPosted++;
        }

        // rate limit
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        console.error(`  에러: ${err.message}`);
      }
    }
  }

  console.log(`\n=== 완료: ${totalPosted}건 게시 ===\n`);
}

main().catch(console.error);
