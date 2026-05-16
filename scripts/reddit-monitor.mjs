// Reddit + Quora 키워드 모니터링 → 이메일 알림
// 매일 1회 실행: 지난 24시간 내 관련 스레드/질문 감지 + AI 초안 생성
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
  if (!res.ok) throw new Error(`Resend 오류: ${await res.text()}`);
  return res.json();
}

const NOTIFY_EMAILS = ["help@2bstory.com", "katieblue@naver.com"];
const KBBG_URL = "https://kbeautybuyersguide.com";

// ── Reddit 검색 설정 ──────────────────────────────────────────────
const REDDIT_SEARCHES = [
  { q: "Korean plastic surgery clinic recommendation", sub: "PlasticSurgery" },
  { q: "Korea rhinoplasty cost", sub: "PlasticSurgery" },
  { q: "Korean medical tourism", sub: "koreatravel" },
  { q: "Korea cosmetic surgery", sub: "korea" },
  { q: "k-beauty clinic Seoul", sub: "kbeauty" },
  { q: "Korean skin clinic laser", sub: "AsianBeauty" },
  { q: "double eyelid surgery Korea", sub: "PlasticSurgery" },
  { q: "Korea LASIK cost", sub: "korea" },
];

// ── Quora 토픽 RSS 설정 ───────────────────────────────────────────
const QUORA_TOPICS = [
  "Korean-Plastic-Surgery",
  "Medical-Tourism-in-South-Korea",
  "K-Beauty",
  "Korean-Cosmetic-Surgery",
  "Korea-Travel",
];

// ── Reddit RSS 파서 ───────────────────────────────────────────────
function parseRedditRss(xml, subreddit) {
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let m;
  while ((m = entryRegex.exec(xml)) !== null) {
    const block = m[1];
    const id = (block.match(/<id>([^<]+)<\/id>/) || [])[1] || "";
    if (!id.startsWith("t3_")) continue;
    const title = (block.match(/<title[^>]*>([^<]+)<\/title>/) || [])[1] || "";
    const link = (block.match(/<link[^>]+href="([^"]+)"/) || [])[1] || "";
    const updated = (block.match(/<updated>([^<]+)<\/updated>/) || [])[1] || "";
    const contentRaw = (block.match(/<content[^>]*>([\s\S]*?)<\/content>/) || [])[1] || "";
    const text = contentRaw
      .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
      .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);
    entries.push({
      source: "reddit",
      title: title.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
      url: link,
      subreddit,
      text,
      created: updated,
      id: id.replace("t3_", ""),
    });
  }
  return entries;
}

// ── Quora RSS 파서 ────────────────────────────────────────────────
function parseQuoraRss(xml, topic) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1];
    const title = (block.match(/<title><!\[CDATA\[([^\]]+)\]\]><\/title>/) || block.match(/<title>([^<]+)<\/title>/) || [])[1] || "";
    const link = (block.match(/<link>([^<]+)<\/link>/) || [])[1] || "";
    const pubDate = (block.match(/<pubDate>([^<]+)<\/pubDate>/) || [])[1] || "";
    const desc = (block.match(/<description><!\[CDATA\[([^\]]*)\]\]><\/description>/) || block.match(/<description>([^<]*)<\/description>/) || [])[1] || "";
    const text = desc.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);
    if (!title || !link) continue;
    const id = link.replace(/[^a-z0-9]/gi, "").slice(-20);
    items.push({
      source: "quora",
      title: title.trim(),
      url: link.trim(),
      topic,
      text,
      created: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      id,
    });
  }
  return items;
}

async function searchReddit(query, subreddit) {
  const url = `https://www.reddit.com/r/${subreddit}/search.rss?q=${encodeURIComponent(query)}&sort=new&limit=10&restrict_sr=1&t=week`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "KBBG-Monitor/1.0 (kbeautybuyersguide.com)" } });
    if (!res.ok) return [];
    return parseRedditRss(await res.text(), subreddit);
  } catch { return []; }
}

async function fetchQuoraTopic(topic) {
  const url = `https://www.quora.com/rss/topic/${topic}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; KBBG-Monitor/1.0)",
        "Accept": "application/rss+xml, application/xml, text/xml",
      },
    });
    if (!res.ok) return [];
    return parseQuoraRss(await res.text(), topic);
  } catch { return []; }
}

// ── AI 초안 생성 ──────────────────────────────────────────────────
async function generateDraft(post) {
  const isQuora = post.source === "quora";
  const platform = isQuora ? "Quora" : "Reddit";
  const location = isQuora ? `topic: ${post.topic}` : `r/${post.subreddit}`;

  const prompt = `You are a helpful Korean medical tourism expert. Write a genuine, non-spammy ${platform} reply.

${isQuora ? "Question" : "Post"} title: "${post.title}"
Content: "${post.text}"
${platform} ${location}

Write a 3-4 sentence helpful reply that:
1. Directly answers their question with real advice
2. Naturally mentions KBBG (${KBBG_URL}) as a useful resource for comparing clinics
3. Sounds like a real person, NOT a bot or marketer
4. Includes one specific helpful tip

Reply only with the comment text, no intro or explanation.`;

  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });
  return msg.content[0].text.trim();
}

// ── 이메일 카드 HTML ─────────────────────────────────────────────
function postCard(post, draft) {
  const isQuora = post.source === "quora";
  const accentColor = isQuora ? "#b92b27" : "#ff4500";
  const label = isQuora ? `Quora · ${post.topic.replace(/-/g, " ")}` : `r/${post.subreddit}`;
  const actionLabel = isQuora ? "Quora에서 답변 달기 →" : "Reddit에서 댓글 달기 →";

  return `
  <div style="margin:20px 0;padding:18px;background:#f8f9fa;border-left:4px solid ${accentColor};border-radius:4px">
    <p style="margin:0 0 4px;font-size:12px;color:#666">${label} · ${new Date(post.created).toLocaleDateString("ko-KR")}</p>
    <h3 style="margin:0 0 8px;font-size:15px">
      <a href="${post.url}" style="color:${accentColor};text-decoration:none">${post.title}</a>
    </h3>
    ${post.text ? `<p style="margin:0 0 12px;font-size:13px;color:#555">${post.text}...</p>` : ""}
    <div style="background:#fff;border:1px solid #e0e0e0;border-radius:4px;padding:14px">
      <p style="margin:0 0 6px;font-size:11px;font-weight:bold;color:#888;text-transform:uppercase">📝 AI 답변 초안 (복사해서 붙여넣기)</p>
      <p style="margin:0;font-size:13px;line-height:1.7;white-space:pre-wrap">${draft}</p>
    </div>
    <p style="margin:8px 0 0">
      <a href="${post.url}" style="background:${accentColor};color:#fff;padding:6px 14px;border-radius:4px;text-decoration:none;font-size:12px;font-weight:bold">${actionLabel}</a>
    </p>
  </div>`;
}

// ── 메인 ─────────────────────────────────────────────────────────
async function main() {
  console.log("Reddit + Quora 모니터링 시작...");

  const [redditResults, quoraResults] = await Promise.all([
    Promise.allSettled(REDDIT_SEARCHES.map(s => searchReddit(s.q, s.sub))),
    Promise.allSettled(QUORA_TOPICS.map(t => fetchQuoraTopic(t))),
  ]);

  // 중복 제거하며 합치기
  const seen = new Set();
  const redditPosts = [];
  const quoraPosts = [];

  for (const r of redditResults) {
    if (r.status !== "fulfilled") continue;
    for (const p of r.value) {
      if (!seen.has(p.id)) { seen.add(p.id); redditPosts.push(p); }
    }
  }
  for (const r of quoraResults) {
    if (r.status !== "fulfilled") continue;
    for (const p of r.value) {
      if (!seen.has(p.id)) { seen.add(p.id); quoraPosts.push(p); }
    }
  }

  redditPosts.sort((a, b) => new Date(b.created) - new Date(a.created));
  quoraPosts.sort((a, b) => new Date(b.created) - new Date(a.created));

  const totalFound = redditPosts.length + quoraPosts.length;
  if (totalFound === 0) {
    console.log("새 스레드/질문 없음 — 오늘은 이메일 발송 안 함");
    return;
  }

  console.log(`Reddit ${redditPosts.length}개 + Quora ${quoraPosts.length}개 발견`);
  console.log("AI 초안 생성 중...");

  // 전체 AI 초안 생성 (최대 20개, 과도한 API 방지)
  const allPosts = [...redditPosts, ...quoraPosts].slice(0, 20);
  const drafts = await Promise.allSettled(allPosts.map(p => generateDraft(p)));

  // 포스트별 초안 매핑
  const draftMap = new Map();
  allPosts.forEach((p, i) => {
    draftMap.set(p.id, drafts[i].status === "fulfilled" ? drafts[i].value : "(초안 생성 실패)");
  });

  const date = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  const redditSection = redditPosts.length > 0
    ? `<h2 style="font-size:16px;color:#ff4500;margin:28px 0 4px;border-bottom:2px solid #ff4500;padding-bottom:6px">
        🔴 Reddit — ${redditPosts.length}개
       </h2>
       ${redditPosts.filter(p => draftMap.has(p.id)).map(p => postCard(p, draftMap.get(p.id))).join("")}`
    : `<p style="color:#999;font-size:13px">오늘 Reddit 새 스레드 없음</p>`;

  const quoraSection = quoraPosts.length > 0
    ? `<h2 style="font-size:16px;color:#b92b27;margin:28px 0 4px;border-bottom:2px solid #b92b27;padding-bottom:6px">
        ❓ Quora — ${quoraPosts.length}개
       </h2>
       ${quoraPosts.filter(p => draftMap.has(p.id)).map(p => postCard(p, draftMap.get(p.id))).join("")}`
    : `<p style="color:#999;font-size:13px">오늘 Quora 새 질문 없음</p>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,sans-serif;max-width:660px;margin:0 auto;padding:20px;color:#333">
  <div style="background:linear-gradient(135deg,#ff4500,#b92b27);color:#fff;padding:18px 22px;border-radius:10px 10px 0 0">
    <h1 style="margin:0;font-size:20px">🔍 KBBG 커뮤니티 모니터링</h1>
    <p style="margin:6px 0 0;font-size:13px;opacity:0.9">${date} · Reddit ${redditPosts.length}개 + Quora ${quoraPosts.length}개 발견</p>
  </div>
  <div style="border:1px solid #e0e0e0;border-top:none;padding:20px 24px;border-radius:0 0 10px 10px">
    <p style="margin:0 0 16px;font-size:14px;color:#555">
      아래 스레드/질문에 AI 초안을 복사해서 답변하면 KBBG로 자연스러운 유입을 만들 수 있습니다.
    </p>
    ${redditSection}
    ${quoraSection}
    <hr style="border:none;border-top:1px solid #eee;margin:28px 0 16px">
    <p style="font-size:11px;color:#aaa;margin:0">
      KBBG 자동 커뮤니티 모니터링 · <a href="${KBBG_URL}" style="color:#aaa">kbeautybuyersguide.com</a>
    </p>
  </div>
</body>
</html>`;

  await sendEmail({
    to: NOTIFY_EMAILS,
    subject: `[KBBG-커뮤니티] Reddit ${redditPosts.length}개 + Quora ${quoraPosts.length}개 발견 — ${date}`,
    html,
  });

  console.log(`✅ 이메일 발송 완료 → ${NOTIFY_EMAILS.join(", ")}`);
  console.log(`   Reddit: ${redditPosts.length}개 / Quora: ${quoraPosts.length}개`);
}

main().catch((e) => {
  console.error("모니터 오류:", e.message);
  process.exit(1);
});
