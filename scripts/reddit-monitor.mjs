// Reddit + YouTube 키워드 모니터링 → 이메일 알림
// 매일 1회 실행: 지난 24시간~7일 내 관련 스레드/댓글 감지 + AI 초안 생성
// cron: node scripts/reddit-monitor.mjs

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_PLACES_API_KEY;

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

const NOTIFY_EMAILS = ["jbshim1@gmail.com"];
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

// ── YouTube 키워드 설정 ───────────────────────────────────────────
const YOUTUBE_KEYWORDS = [
  "korea plastic surgery clinic",
  "korean rhinoplasty experience",
  "medical tourism korea",
  "korean skin clinic laser",
  "double eyelid surgery korea",
];

const YOUTUBE_REPLY_TRIGGERS = [
  "recommend", "suggestion", "which clinic", "where to go", "any good",
  "how do i", "how to find", "safe to", "anyone know", "can you", "should i",
  "cost", "price", "how much", "?",
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

async function searchReddit(query, subreddit) {
  const url = `https://www.reddit.com/r/${subreddit}/search.rss?q=${encodeURIComponent(query)}&sort=new&limit=10&restrict_sr=1&t=week`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "KBBG-Monitor/1.0 (kbeautybuyersguide.com)" } });
    if (!res.ok) return [];
    return parseRedditRss(await res.text(), subreddit);
  } catch { return []; }
}

// ── YouTube 검색 + 댓글 수집 ──────────────────────────────────────
async function fetchYoutubeComments(keyword) {
  if (!YOUTUBE_API_KEY) return [];
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&order=viewCount&publishedAfter=${since}&maxResults=3&key=${YOUTUBE_API_KEY}`
    );
    if (!searchRes.ok) return [];
    const searchData = await searchRes.json();
    if (!searchData.items?.length) return [];

    const comments = [];
    for (const video of searchData.items) {
      const videoId = video.id.videoId;
      const videoTitle = video.snippet.title;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      const commentsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&order=relevance&maxResults=20&key=${YOUTUBE_API_KEY}`
      );
      if (!commentsRes.ok) continue;
      const commentsData = await commentsRes.json();
      if (!commentsData.items?.length) continue;

      for (const item of commentsData.items) {
        const c = item.snippet.topLevelComment.snippet;
        const text = c.textDisplay.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        const lower = text.toLowerCase();
        if (!YOUTUBE_REPLY_TRIGGERS.some(t => lower.includes(t))) continue;

        const id = item.id;
        comments.push({
          source: "youtube",
          id,
          title: videoTitle,
          videoUrl,
          commentUrl: `${videoUrl}&lc=${id}`,
          text: text.slice(0, 400),
          author: c.authorDisplayName,
          likeCount: c.likeCount || 0,
          created: c.publishedAt,
          keyword,
        });
      }
    }
    return comments.sort((a, b) => b.likeCount - a.likeCount).slice(0, 3);
  } catch { return []; }
}

// ── AI 초안 생성 ──────────────────────────────────────────────────
async function generateDraft(post) {
  const isYoutube = post.source === "youtube";

  const contextBlock = isYoutube
    ? `Video title: "${post.title}"\nComment by ${post.author}: "${post.text}"`
    : `Post title: "${post.title}"\nContent: "${post.text}"\nr/${post.subreddit}`;

  const prompt = `You are a helpful Korean medical tourism expert. Write a genuine, non-spammy ${isYoutube ? "YouTube" : "Reddit"} reply.

${contextBlock}

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
  const isYoutube = post.source === "youtube";
  const accentColor = isYoutube ? "#FF0000" : "#ff4500";
  const label = isYoutube ? `YouTube · ${post.keyword}` : `r/${post.subreddit}`;
  const actionLabel = isYoutube ? "YouTube에서 댓글 달기 →" : "Reddit에서 댓글 달기 →";
  const actionUrl = isYoutube ? post.commentUrl : post.url;
  const displayText = isYoutube ? `💬 ${post.author}: "${post.text}"` : post.text;

  return `
  <div style="margin:20px 0;padding:18px;background:#f8f9fa;border-left:4px solid ${accentColor};border-radius:4px">
    <p style="margin:0 0 4px;font-size:12px;color:#666">${label} · ${new Date(post.created).toLocaleDateString("ko-KR")}</p>
    <h3 style="margin:0 0 8px;font-size:15px">
      <a href="${isYoutube ? post.videoUrl : post.url}" style="color:${accentColor};text-decoration:none">${post.title}</a>
    </h3>
    ${displayText ? `<p style="margin:0 0 12px;font-size:13px;color:#555">${displayText}</p>` : ""}
    <div style="background:#fff;border:1px solid #e0e0e0;border-radius:4px;padding:14px">
      <p style="margin:0 0 6px;font-size:11px;font-weight:bold;color:#888;text-transform:uppercase">📝 AI 답변 초안 (복사해서 붙여넣기)</p>
      <p style="margin:0;font-size:13px;line-height:1.7;white-space:pre-wrap">${draft}</p>
    </div>
    <p style="margin:8px 0 0">
      <a href="${actionUrl}" style="background:${accentColor};color:#fff;padding:6px 14px;border-radius:4px;text-decoration:none;font-size:12px;font-weight:bold">${actionLabel}</a>
    </p>
  </div>`;
}

// ── 메인 ─────────────────────────────────────────────────────────
async function main() {
  console.log("Reddit + YouTube 모니터링 시작...");

  const [redditResults, youtubeResults] = await Promise.all([
    Promise.allSettled(REDDIT_SEARCHES.map(s => searchReddit(s.q, s.sub))),
    YOUTUBE_API_KEY
      ? Promise.allSettled(YOUTUBE_KEYWORDS.map(k => fetchYoutubeComments(k)))
      : Promise.resolve([]),
  ]);

  const seen = new Set();
  const redditPosts = [];
  const youtubePosts = [];

  for (const r of redditResults) {
    if (r.status !== "fulfilled") continue;
    for (const p of r.value) {
      if (!seen.has(p.id)) { seen.add(p.id); redditPosts.push(p); }
    }
  }
  for (const r of youtubeResults) {
    if (r.status !== "fulfilled") continue;
    for (const p of r.value) {
      if (!seen.has(p.id)) { seen.add(p.id); youtubePosts.push(p); }
    }
  }

  redditPosts.sort((a, b) => new Date(b.created) - new Date(a.created));
  youtubePosts.sort((a, b) => b.likeCount - a.likeCount);

  const totalFound = redditPosts.length + youtubePosts.length;
  if (totalFound === 0) {
    console.log("새 스레드/댓글 없음 — 오늘은 이메일 발송 안 함");
    return;
  }

  console.log(`Reddit ${redditPosts.length}개 + YouTube ${youtubePosts.length}개 발견`);
  console.log("AI 초안 생성 중...");

  const allPosts = [
    ...redditPosts.slice(0, 15),
    ...youtubePosts.slice(0, 5),
  ];
  const drafts = await Promise.allSettled(allPosts.map(p => generateDraft(p)));

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

  const youtubeSection = youtubePosts.length > 0
    ? `<h2 style="font-size:16px;color:#FF0000;margin:28px 0 4px;border-bottom:2px solid #FF0000;padding-bottom:6px">
        ▶️ YouTube — ${youtubePosts.length}개
       </h2>
       ${youtubePosts.filter(p => draftMap.has(p.id)).map(p => postCard(p, draftMap.get(p.id))).join("")}`
    : `<p style="color:#999;font-size:13px">오늘 YouTube 답변할 댓글 없음</p>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,sans-serif;max-width:660px;margin:0 auto;padding:20px;color:#333">
  <div style="background:linear-gradient(135deg,#ff4500,#CC0000);color:#fff;padding:18px 22px;border-radius:10px 10px 0 0">
    <h1 style="margin:0;font-size:20px">🔍 KBBG 커뮤니티 모니터링</h1>
    <p style="margin:6px 0 0;font-size:13px;opacity:0.9">${date} · Reddit ${redditPosts.length}개 + YouTube ${youtubePosts.length}개 발견</p>
  </div>
  <div style="border:1px solid #e0e0e0;border-top:none;padding:20px 24px;border-radius:0 0 10px 10px">
    <p style="margin:0 0 16px;font-size:14px;color:#555">
      아래 스레드/댓글에 AI 초안을 복사해서 답변하면 KBBG로 자연스러운 유입을 만들 수 있습니다.
    </p>
    ${redditSection}
    ${youtubeSection}
    <hr style="border:none;border-top:1px solid #eee;margin:28px 0 16px">
    <p style="font-size:11px;color:#aaa;margin:0">
      KBBG 자동 커뮤니티 모니터링 · <a href="${KBBG_URL}" style="color:#aaa">kbeautybuyersguide.com</a>
    </p>
  </div>
</body>
</html>`;

  await sendEmail({
    to: NOTIFY_EMAILS,
    subject: `[KBBG-커뮤니티] Reddit ${redditPosts.length}개 + YouTube ${youtubePosts.length}개 — ${date}`,
    html,
  });

  console.log(`✅ 이메일 발송 완료 → ${NOTIFY_EMAILS.join(", ")}`);
  console.log(`   Reddit: ${redditPosts.length}개 / YouTube: ${youtubePosts.length}개`);
}

main().catch((e) => {
  console.error("모니터 오류:", e.message);
  process.exit(1);
});
