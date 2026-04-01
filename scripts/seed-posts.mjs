#!/usr/bin/env node
// 시드 게시글 20개를 가짜 계정으로 DB에 삽입
// 실행: node scripts/seed-posts.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// seed-posts.ts에서 데이터 추출 (TypeScript 파일을 직접 파싱)
const raw = readFileSync("src/data/seed-posts.ts", "utf-8");

// 게시글 배열 추출을 위한 간단한 파싱
function extractPosts(source) {
  const posts = [];
  const regex = /\{\s*id:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]*)"[\s\S]*?content:\s*`([\s\S]*?)`[\s\S]*?author:\s*"([^"]*)"[\s\S]*?authorCountry:\s*"([^"]*)"[\s\S]*?board:\s*"([^"]*)"[\s\S]*?upvotes:\s*(\d+)[\s\S]*?downvotes:\s*(\d+)[\s\S]*?commentCount:\s*(\d+)[\s\S]*?viewCount:\s*(\d+)[\s\S]*?createdAt:\s*"([^"]*)"/g;

  let match;
  while ((match = regex.exec(source)) !== null) {
    posts.push({
      seedId: match[1],
      title: match[2],
      content: match[3].trim(),
      author: match[4],
      country: match[5],
      board: match[6],
      upvotes: parseInt(match[7]),
      downvotes: parseInt(match[8]),
      commentCount: parseInt(match[9]),
      viewCount: parseInt(match[10]),
      createdAt: match[11],
    });
  }
  return posts;
}

// 언어별 계정 매핑 (country → language)
const COUNTRY_TO_LANG = {
  US: "en", GB: "en", CA: "en", AU: "en",
  CN: "zh", TW: "zh",
  JP: "ja",
  RU: "ru",
  VN: "vi",
  TH: "th",
  MN: "mn",
  KR: "ko",
};

async function main() {
  console.log("\n=== 시드 게시글 삽입 시작 ===\n");

  // 1. 게시글 데이터 추출
  const posts = extractPosts(raw);
  console.log(`추출된 게시글: ${posts.length}개\n`);

  if (posts.length === 0) {
    console.error("게시글을 추출하지 못했습니다.");
    return;
  }

  // 2. boards 조회
  const { data: boards } = await supabase.from("boards").select("id, slug");
  if (!boards || boards.length === 0) {
    console.error("boards가 비어있습니다. step1_boards.sql을 먼저 실행하세요.");
    return;
  }
  const boardMap = Object.fromEntries(boards.map((b) => [b.slug, b.id]));
  console.log("boards:", Object.keys(boardMap).join(", "));

  // 3. users 조회
  const { data: users } = await supabase.from("users").select("id, username, email");
  if (!users || users.length === 0) {
    console.error("users가 비어있습니다. step2_users.sql을 먼저 실행하세요.");
    return;
  }
  console.log(`users: ${users.length}명\n`);

  // 언어별 유저 그룹
  const usersByLang = {};
  for (const u of users) {
    const emailPrefix = u.email.split("@")[0];
    // 간단한 언어 추정: 이메일로 매핑
    let lang = "en";
    if (u.email.includes("xiaomei") || u.email.includes("dawei") || u.email.includes("lili_gz") || u.email.includes("ming_sz") || u.email.includes("xiaohong") || u.email.includes("ajie") || u.email.includes("tingting") || u.email.includes("xiaolong") || u.email.includes("meimei") || u.email.includes("daming")) lang = "zh";
    else if (u.email.includes("yuki") || u.email.includes("hana_osaka") || u.email.includes("takashi") || u.email.includes("sakura") || u.email.includes("kenta") || u.email.includes("ai_fukuoka") || u.email.includes("ryo_sapporo") || u.email.includes("mai_kobe") || u.email.includes("sota") || u.email.includes("miku")) lang = "ja";
    else if (u.email.includes("anya") || u.email.includes("dima") || u.email.includes("katya") || u.email.includes("sasha_sochi") || u.email.includes("oleg") || u.email.includes("masha") || u.email.includes("igor") || u.email.includes("lena_krd") || u.email.includes("max_rst") || u.email.includes("nastya")) lang = "ru";
    else if (u.email.includes("linh") || u.email.includes("minh") || u.email.includes("trang") || u.email.includes("duc_hp") || u.email.includes("hoa_ct") || u.email.includes("nam_hue") || u.email.includes("lan_nt") || u.email.includes("tuan_vt") || u.email.includes("mai_bn") || u.email.includes("hung_th")) lang = "vi";
    else if (u.email.includes("nid_bkk") || u.email.includes("ton_cnx") || u.email.includes("prae") || u.email.includes("boy_pty") || u.email.includes("mint_kkn") || u.email.includes("j_hdy") || u.email.includes("ann_udn") || u.email.includes("gun_ryg") || u.email.includes("fa_nkr") || u.email.includes("may_srt")) lang = "th";
    else if (u.email.includes("bold") || u.email.includes("sarnai") || u.email.includes("bat_dkh") || u.email.includes("oyuu") || u.email.includes("ganaa") || u.email.includes("tsetseg") || u.email.includes("dorj") || u.email.includes("nomin") || u.email.includes("temuulen") || u.email.includes("enkhjin")) lang = "mn";
    else if (u.email.includes("jiyoung") || u.email.includes("hyunwoo") || u.email.includes("sujin") || u.email.includes("minho_dg") || u.email.includes("yeeun") || u.email.includes("taehyun") || u.email.includes("sohee") || u.email.includes("junyoung") || u.email.includes("hana_sw") || u.email.includes("sungmin")) lang = "ko";

    if (!usersByLang[lang]) usersByLang[lang] = [];
    usersByLang[lang].push(u);
  }

  // 4. 게시글 삽입
  let inserted = 0;
  for (const post of posts) {
    const boardId = boardMap[post.board];
    if (!boardId) {
      console.log(`스킵: board "${post.board}" 없음`);
      continue;
    }

    // 작성자 국가에 맞는 언어의 유저 선택
    const lang = COUNTRY_TO_LANG[post.country] || "en";
    const candidates = usersByLang[lang] || usersByLang["en"];
    const author = candidates[inserted % candidates.length];

    const { error } = await supabase.from("posts").insert({
      board_id: boardId,
      author_id: author.id,
      title: post.title,
      content: post.content,
      upvotes: post.upvotes,
      downvotes: post.downvotes,
      view_count: post.viewCount,
      comment_count: post.commentCount,
      is_pinned: false,
      is_deleted: false,
      created_at: post.createdAt,
    });

    if (error) {
      console.error(`실패: "${post.title.slice(0, 40)}..." — ${error.message}`);
    } else {
      console.log(`✓ [${post.board}] ${post.title.slice(0, 50)}... (by ${author.username})`);
      inserted++;
    }
  }

  console.log(`\n=== 완료: ${inserted}/${posts.length}개 게시글 삽입 ===\n`);
}

main().catch(console.error);
