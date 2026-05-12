// Reddit 키워드 모니터링 → 이메일 알림
// 매일 1회 실행: 지난 24시간 내 관련 스레드 감지 + AI 댓글 초안 생성
// cron: node scripts/reddit-monitor.mjs

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const RESEND_API_KEY = process.env.RESEND_API_KEY;

async function sendEmail({ to, subject, html }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "KBBG Monitor <onboarding@resend.dev>",
      to,
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend 오류: ${err}`);
  }
  return res.json();
}

// help@2bstory.com은 Resend에서 2bstory.com 도메인 인증 후 추가
const NOTIFY_EMAILS = ["jbshim1@gmail.com"];
const KBBG_URL = "https://kbeautybuyersguide.com";

// 모니터링 키워드 + 서브레딧 조합
const SEARCHES = [
  { q: "Korean plastic surgery clinic recommendation", sub: "PlasticSurgery" },
  { q: "Korea rhinoplasty cost", sub: "PlasticSurgery" },
  { q: "Korean medical tourism", sub: "koreatravel" },
  { q: "Korea cosmetic surgery", sub: "korea" },
  { q: "k-beauty clinic Seoul", sub: "kbeauty" },
  { q: "Korean skin clinic laser", sub: "AsianBeauty" },
  { q: "double eyelid surgery Korea", sub: "PlasticSurgery" },
  { q: "Korea LASIK cost", sub: "korea" },
];

function parseRssEntries(xml, subreddit) {
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let m;
  while ((m = entryRegex.exec(xml)) !== null) {
    const block = m[1];
    const id = (block.match(/<id>([^<]+)<\/id>/) || [])[1] || "";
    // t3_ = post, t5_ = subreddit listing — skip non-posts
    if (!id.startsWith("t3_")) continue;
    const title = (block.match(/<title[^>]*>([^<]+)<\/title>/) || [])[1] || "";
    const link = (block.match(/<link[^>]+href="([^"]+)"/) || [])[1] || "";
    const updated = (block.match(/<updated>([^<]+)<\/updated>/) || [])[1] || "";
    const contentRaw = (block.match(/<content[^>]*>([\s\S]*?)<\/content>/) || [])[1] || "";
    // decode HTML entities and strip tags for plain text snippet
    const text = contentRaw
      .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
      .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);
    entries.push({
      title: title.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
      url: link,
      subreddit,
      score: 0,
      comments: 0,
      text,
      created: updated,
      id: id.replace("t3_", ""),
    });
  }
  return entries;
}

async function searchReddit(query, subreddit) {
  const url = `https://www.reddit.com/r/${subreddit}/search.rss?q=${encodeURIComponent(query)}&sort=new&limit=5&restrict_sr=1&t=week`;
  const res = await fetch(url, {
    headers: { "User-Agent": "KBBG-Monitor/1.0 (kbeautybuyersguide.com)" },
  });
  if (!res.ok) return [];
  const xml = await res.text();
  return parseRssEntries(xml, subreddit);
}

async function generateDraftReply(post) {
  const prompt = `You are a helpful Korean medical tourism expert. Write a genuine, non-spammy Reddit reply to this post.

Post title: "${post.title}"
Post content: "${post.text}"
Subreddit: r/${post.subreddit}

Write a 3-4 sentence helpful reply that:
1. Directly answers their question with real advice
2. Naturally mentions KBBG (${KBBG_URL}) as a useful resource for comparing clinics
3. Sounds like a real person, NOT a bot or marketer
4. Includes one specific helpful tip they didn't ask about

Reply only with the comment text, no intro or explanation.`;

  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });
  return msg.content[0].text.trim();
}

async function main() {
  console.log("Reddit 모니터링 시작...");

  // 모든 검색 병렬 실행
  const results = await Promise.allSettled(
    SEARCHES.map((s) => searchReddit(s.q, s.sub))
  );

  // 결과 합치기 + 중복 제거
  const seen = new Set();
  const posts = [];
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    for (const p of r.value) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        posts.push(p);
      }
    }
  }

  if (posts.length === 0) {
    console.log("새 스레드 없음 — 오늘은 이메일 발송 안 함");
    return;
  }

  console.log(`${posts.length}개 스레드 발견, AI 댓글 초안 생성 중...`);

  // 최신순 정렬 후 상위 5개만 초안 생성 (API 절약)
  const topPosts = posts
    .sort((a, b) => new Date(b.created) - new Date(a.created))
    .slice(0, 5);

  const drafts = await Promise.allSettled(
    topPosts.map((p) => generateDraftReply(p))
  );

  // 이메일 HTML 생성
  const date = new Date().toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric",
  });

  const sections = topPosts.map((post, i) => {
    const draft = drafts[i].status === "fulfilled" ? drafts[i].value : "(초안 생성 실패)";
    return `
      <div style="margin:24px 0;padding:20px;background:#f8f9fa;border-left:4px solid #ff4500;border-radius:4px">
        <p style="margin:0 0 4px;font-size:12px;color:#666">r/${post.subreddit} · ${new Date(post.created).toLocaleDateString("ko-KR")}</p>
        <h3 style="margin:0 0 8px;font-size:16px">
          <a href="${post.url}" style="color:#ff4500;text-decoration:none">${post.title}</a>
        </h3>
        ${post.text ? `<p style="margin:0 0 12px;font-size:13px;color:#555">${post.text}...</p>` : ""}
        <div style="background:#fff;border:1px solid #e0e0e0;border-radius:4px;padding:14px">
          <p style="margin:0 0 6px;font-size:11px;font-weight:bold;color:#888;text-transform:uppercase">📝 AI 댓글 초안 (복사해서 붙여넣기)</p>
          <p style="margin:0;font-size:14px;line-height:1.6;white-space:pre-wrap">${draft}</p>
        </div>
        <p style="margin:8px 0 0;font-size:12px">
          <a href="${post.url}" style="background:#ff4500;color:#fff;padding:6px 14px;border-radius:4px;text-decoration:none;font-size:12px;font-weight:bold">
            Reddit에서 댓글 달기 →
          </a>
        </p>
      </div>`;
  }).join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,sans-serif;max-width:640px;margin:0 auto;padding:20px;color:#333">
  <div style="background:#ff4500;color:#fff;padding:16px 20px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;font-size:20px">🔍 KBBG Reddit 모니터링</h1>
    <p style="margin:4px 0 0;font-size:13px;opacity:0.9">${date} · ${topPosts.length}개 스레드 발견 (전체 ${posts.length}개 중)</p>
  </div>
  <div style="border:1px solid #e0e0e0;border-top:none;padding:20px;border-radius:0 0 8px 8px">
    <p style="margin:0 0 4px;font-size:14px;color:#555">
      아래 스레드에 AI 초안을 복사해서 댓글을 달면 KBBG로 자연스러운 유입을 만들 수 있습니다.
    </p>
    ${sections}
    <hr style="border:none;border-top:1px solid #e0e0e0;margin:24px 0">
    <p style="font-size:12px;color:#999;margin:0">
      이 이메일은 KBBG 자동 모니터링 시스템에서 발송됩니다.<br>
      전체 ${posts.length}개 스레드 보기: 상위 5개만 초안을 생성했습니다.
    </p>
  </div>
</body>
</html>`;

  await sendEmail({
    to: NOTIFY_EMAILS,
    subject: `[KBBG] Reddit 새 스레드 ${topPosts.length}개 발견 — ${date}`,
    html,
  });

  console.log(`✅ 이메일 발송 완료 → ${NOTIFY_EMAILS.join(", ")}`);
  console.log(`   발견된 스레드: ${posts.length}개 / 초안 생성: ${topPosts.length}개`);
}

main().catch((e) => {
  console.error("Reddit 모니터 오류:", e.message);
  process.exit(1);
});
