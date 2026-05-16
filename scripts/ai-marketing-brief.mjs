// AI 마케팅 브리핑 — 매일 새벽 5시(KST) 자동 발송
// GA4 데이터 분석 → Claude AI 권장사항 → 이메일

import { google } from "googleapis";
import { readFileSync, writeFileSync } from "fs";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
const GA4_CLIENT_ID = process.env.GA4_CLIENT_ID;
const GA4_CLIENT_SECRET = process.env.GA4_CLIENT_SECRET;
const REPORT_EMAIL = process.env.GA4_REPORT_EMAIL || "help@2bstory.com";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!GA4_PROPERTY_ID || !RESEND_API_KEY || !ANTHROPIC_API_KEY) {
  console.error("필수 환경변수 누락: GA4_PROPERTY_ID, RESEND_API_KEY, ANTHROPIC_API_KEY");
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(GA4_CLIENT_ID, GA4_CLIENT_SECRET);
const tokensPath = new URL("../ga4-tokens.json", import.meta.url);
let tokens;
try {
  tokens = JSON.parse(readFileSync(tokensPath.pathname, "utf-8"));
  oauth2Client.setCredentials(tokens);
} catch {
  console.error("ga4-tokens.json 없음. node scripts/ga4-auth.mjs 먼저 실행하세요.");
  process.exit(1);
}
oauth2Client.on("tokens", (t) => {
  tokens = { ...tokens, ...t };
  writeFileSync(tokensPath.pathname, JSON.stringify(tokens, null, 2));
});

const analyticsData = google.analyticsdata({ version: "v1beta", auth: oauth2Client });
const resend = new Resend(RESEND_API_KEY);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── GA4 데이터 수집 ──────────────────────────────────────────────
async function getGA4Data() {
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

  const [dailyRes, countryRes, pageRes, sourceRes, mediumRes] = await Promise.all([
    analyticsData.properties.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      requestBody: {
        dateRanges: [{ startDate: weekAgo, endDate: yesterday }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      },
    }),
    analyticsData.properties.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      requestBody: {
        dateRanges: [{ startDate: weekAgo, endDate: yesterday }],
        dimensions: [{ name: "country" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 10,
      },
    }),
    analyticsData.properties.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      requestBody: {
        dateRanges: [{ startDate: weekAgo, endDate: yesterday }],
        dimensions: [{ name: "pageTitle" }, { name: "pagePath" }],
        metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 10,
      },
    }),
    analyticsData.properties.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      requestBody: {
        dateRanges: [{ startDate: weekAgo, endDate: yesterday }],
        dimensions: [{ name: "sessionSource" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 8,
      },
    }),
    analyticsData.properties.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      requestBody: {
        dateRanges: [{ startDate: weekAgo, endDate: yesterday }],
        dimensions: [{ name: "sessionMedium" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 5,
      },
    }),
  ]);

  return {
    yesterday,
    weekAgo,
    daily: dailyRes.data.rows || [],
    countries: countryRes.data.rows || [],
    pages: pageRes.data.rows || [],
    sources: sourceRes.data.rows || [],
    mediums: mediumRes.data.rows || [],
  };
}

// ── 블로그 최근 포스팅 현황 ──────────────────────────────────────
async function getBlogStats() {
  const { data: recentPosts } = await supabase
    .from("blog_posts")
    .select("site, title_en, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(20);

  const siteCounts = {};
  const recentTitles = [];
  for (const post of recentPosts || []) {
    siteCounts[post.site] = (siteCounts[post.site] || 0) + 1;
    if (recentTitles.length < 10) recentTitles.push(`[${post.site}] ${post.title_en}`);
  }
  return { siteCounts, recentTitles };
}

// ── Claude AI 분석 ───────────────────────────────────────────────
async function analyzeWithClaude(ga4, blogStats) {
  const totalUsers7d = ga4.daily.reduce((s, r) => s + parseInt(r.metricValues[0].value || 0), 0);
  const totalSessions7d = ga4.daily.reduce((s, r) => s + parseInt(r.metricValues[1].value || 0), 0);
  const yesterdayRow = ga4.daily[ga4.daily.length - 1];
  const yesterdayUsers = yesterdayRow ? parseInt(yesterdayRow.metricValues[0].value || 0) : 0;

  const topPages = ga4.pages.slice(0, 5).map(r =>
    `${r.dimensionValues[1].value} (방문자: ${r.metricValues[0].value})`
  ).join("\n");

  const topCountries = ga4.countries.slice(0, 5).map(r =>
    `${r.dimensionValues[0].value}: ${r.metricValues[0].value}명`
  ).join(", ");

  const topSources = ga4.sources.slice(0, 5).map(r =>
    `${r.dimensionValues[0].value}: ${r.metricValues[0].value}세션`
  ).join(", ");

  const prompt = `당신은 K-Beauty / K-Medical Tourism 전문 마케팅 전략가입니다.
KBBG(K-Beauty Buyers Guide, kbeautybuyersguide.com)의 어제 데이터를 분석하고 오늘의 블로그 & 마케팅 방향을 제안해주세요.

## 사이트 소개
- 외국인(영어권, 일본, 중국, 태국, 러시아 등)을 위한 한국 병원/클리닉 추천 사이트
- 주요 서비스: 성형외과, 피부과, 치과, 안과, 임플란트 등
- 4개 외부 블로그 운영: kskindaily.com, dailyhallyuwave.com, koreatravel365.com, KBBG 내부 블로그

## 지난 7일 GA4 데이터 (${ga4.weekAgo} ~ ${ga4.yesterday})
- 총 방문자: ${totalUsers7d}명
- 총 세션: ${totalSessions7d}
- 어제 방문자: ${yesterdayUsers}명

### 인기 페이지 TOP 5
${topPages}

### 방문 국가
${topCountries}

### 유입 소스
${topSources}

### 최근 블로그 포스팅 (최근 10개)
${blogStats.recentTitles.join("\n")}

---

위 데이터를 바탕으로 아래 형식으로 분석해주세요. 반드시 한국어로 작성하되, 실용적이고 구체적으로 작성해주세요.

## 📊 어제 데이터 한줄 요약
(어제 방문자 수와 특이사항을 1-2문장으로)

## 🔥 지금 뜨는 트렌드
(인기 페이지, 방문 국가 데이터를 보고 어떤 콘텐츠가 잘 되고 있는지 2-3가지)

## ✍️ 오늘 블로그 추천 주제 (5개)
(각 주제마다: 제목 + 왜 지금 써야 하는지 한 줄 이유)
1.
2.
3.
4.
5.

## 📣 오늘 마케팅 액션 (3가지)
(지금 당장 할 수 있는 구체적인 액션. SNS, 커뮤니티, 광고 등)
1.
2.
3.

## ⚡ 이번 주 집중할 것 (1가지)
(가장 임팩트 있는 한 가지만)`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  return message.content[0].text;
}

// ── 블로그별 오늘의 AI 주제 생성 ────────────────────────────────
async function generateTopicsForBlogs(ga4, analysis) {
  const topPagesText = ga4.pages.slice(0, 5).map(r =>
    `${r.dimensionValues[0].value} (방문자: ${r.metricValues[0].value})`
  ).join("\n");

  const topCountriesText = ga4.countries.slice(0, 3).map(r =>
    `${r.dimensionValues[0].value}: ${r.metricValues[0].value}명`
  ).join(", ");

  const prompt = `당신은 K-Beauty 마케팅 전문가입니다.
아래 GA4 데이터를 바탕으로 오늘 4개 블로그에 발행할 주제를 생성해주세요.

인기 페이지: ${topPagesText}
방문 국가: ${topCountriesText}
마케팅 분석 요약: ${analysis.slice(0, 400)}

블로그 소개:
- kbbg: 의료관광/클리닉 가이드 (category: guide/faq/compare/ingredient/tips)
- kskindaily: 한국 스킨케어 (category: routine/ingredient/product/compare/tips)
- dailyhallyuwave: 한류/K-pop 뷰티 (category: celebrity/trend/culture/music/drama)
- koreatravel365: 한국 여행/뷰티 관광 (category: itinerary/food/culture/shopping/tips)

반드시 아래 JSON 형식으로만 응답 (마크다운 코드블록 없이 순수 JSON):
{"kbbg":[{"category":"guide","keyword":"영어 키워드"},{"category":"faq","keyword":"영어 키워드"},{"category":"tips","keyword":"영어 키워드"}],"kskindaily":[{"category":"routine","keyword":"영어 키워드"},{"category":"ingredient","keyword":"영어 키워드"},{"category":"product","keyword":"영어 키워드"}],"dailyhallyuwave":[{"category":"celebrity","keyword":"영어 키워드"},{"category":"trend","keyword":"영어 키워드"},{"category":"culture","keyword":"영어 키워드"}],"koreatravel365":[{"category":"itinerary","keyword":"영어 키워드"},{"category":"food","keyword":"영어 키워드"},{"category":"tips","keyword":"영어 키워드"}]}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI 주제 JSON 파싱 실패");

  const topics = JSON.parse(jsonMatch[0]);
  topics.date = new Date().toISOString().slice(0, 10);

  const outPath = new URL("./ai-brief-topics.json", import.meta.url);
  writeFileSync(outPath.pathname, JSON.stringify(topics, null, 2));
  console.log("✅ AI 주제 저장 완료:", outPath.pathname);

  return topics;
}

// ── HTML 이메일 빌드 ─────────────────────────────────────────────
function buildEmail(ga4, analysis, today, aiTopics) {
  const totalUsers = ga4.daily.reduce((s, r) => s + parseInt(r.metricValues[0].value || 0), 0);
  const yesterdayRow = ga4.daily[ga4.daily.length - 1];
  const yesterdayUsers = yesterdayRow ? parseInt(yesterdayRow.metricValues[0].value || 0) : 0;
  const prevDayRow = ga4.daily[ga4.daily.length - 2];
  const prevUsers = prevDayRow ? parseInt(prevDayRow.metricValues[0].value || 0) : 0;
  const change = prevUsers > 0 ? Math.round((yesterdayUsers - prevUsers) / prevUsers * 100) : 0;
  const changeColor = change >= 0 ? '#00b894' : '#e17055';
  const changeStr = change >= 0 ? `+${change}%` : `${change}%`;

  // 마크다운 → HTML 간단 변환
  const analysisHtml = analysis
    .replace(/## (.*)/g, '<h3 style="font-size:15px;font-weight:700;color:#2d3436;margin:20px 0 10px;border-left:4px solid #667eea;padding-left:12px;">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^(\d+\. .*)/gm, '<div style="padding:6px 0 6px 16px;font-size:13px;color:#2d3436;border-bottom:1px solid #f0f2f5;">$1</div>')
    .replace(/\n\n/g, '<br>')
    .replace(/\n/g, '<br>');

  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:680px;margin:0 auto;background:#f0f2f5;padding:24px;">

  <!-- 헤더 -->
  <div style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:28px;border-radius:20px;margin-bottom:20px;">
    <div style="font-size:12px;opacity:0.8;margin-bottom:6px;">🤖 AI 마케팅 브리핑</div>
    <h1 style="margin:0;font-size:22px;font-weight:700;">오늘의 KBBG 전략 보고서</h1>
    <p style="margin:6px 0 0;opacity:0.8;font-size:14px;">${today} — Claude AI 분석</p>
  </div>

  <!-- 핵심 수치 -->
  <div style="display:flex;gap:12px;margin-bottom:20px;">
    <div style="flex:1;background:white;border-radius:14px;padding:18px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
      <div style="font-size:32px;font-weight:800;color:#4361ee;">${yesterdayUsers}</div>
      <div style="font-size:11px;color:#636e72;margin-top:4px;">어제 방문자</div>
      <div style="font-size:12px;font-weight:600;color:${changeColor};margin-top:4px;">${changeStr} 전일比</div>
    </div>
    <div style="flex:1;background:white;border-radius:14px;padding:18px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
      <div style="font-size:32px;font-weight:800;color:#6c5ce7;">${totalUsers}</div>
      <div style="font-size:11px;color:#636e72;margin-top:4px;">7일 누적 방문자</div>
    </div>
    <div style="flex:1;background:white;border-radius:14px;padding:18px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
      <div style="font-size:32px;font-weight:800;color:#00b894;">${ga4.countries[0]?.dimensionValues[0].value || '-'}</div>
      <div style="font-size:11px;color:#636e72;margin-top:4px;">TOP 방문 국가</div>
    </div>
  </div>

  <!-- AI 분석 -->
  <div style="background:white;border-radius:16px;padding:24px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
    <div style="display:flex;align-items:center;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #f0f2f5;">
      <div style="width:36px;height:36px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:10px;display:flex;align-items:center;justify-content:center;margin-right:12px;">
        <span style="color:white;font-size:18px;">🤖</span>
      </div>
      <div>
        <div style="font-weight:700;color:#2d3436;font-size:15px;">Claude AI 분석 결과</div>
        <div style="font-size:11px;color:#b2bec3;">지난 7일 데이터 기반 자동 분석</div>
      </div>
    </div>
    <div style="font-size:13px;line-height:1.8;color:#2d3436;">
      ${analysisHtml}
    </div>
  </div>

  <!-- 인기 페이지 -->
  <div style="background:white;border-radius:16px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
    <h2 style="font-size:15px;margin:0 0 14px;color:#2d3436;">📊 인기 페이지 TOP 5 (7일)</h2>
    <table style="width:100%;font-size:12px;border-collapse:collapse;">
      <tr style="background:#f8f9fa;">
        <th style="padding:8px;text-align:left;">페이지</th>
        <th style="padding:8px;text-align:right;">방문자</th>
        <th style="padding:8px;text-align:right;">뷰</th>
      </tr>
      ${ga4.pages.slice(0, 5).map((r, i) => {
        const title = r.dimensionValues[0].value.substring(0, 35) || '(no title)';
        const path = r.dimensionValues[1].value.replace(/\?.*$/, '').substring(0, 35);
        const users = r.metricValues[0].value;
        const views = r.metricValues[1].value;
        const bg = i % 2 === 0 ? 'white' : '#fafbfc';
        return `<tr style="background:${bg};"><td style="padding:8px;border-top:1px solid #eee;"><div style="font-weight:500;">${title}</div><div style="font-size:10px;color:#b2bec3;">${path}</div></td><td style="padding:8px;border-top:1px solid #eee;text-align:right;font-weight:700;color:#4361ee;">${users}</td><td style="padding:8px;border-top:1px solid #eee;text-align:right;color:#636e72;">${views}</td></tr>`;
      }).join('')}
    </table>
  </div>

  <!-- 오늘 예약된 주제 -->
  ${aiTopics ? `
  <div style="background:white;border-radius:16px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
    <h2 style="font-size:15px;margin:0 0 14px;color:#2d3436;">📋 오늘 예약된 블로그 주제 (AI 자동 선정)</h2>
    ${['kbbg','kskindaily','dailyhallyuwave','koreatravel365'].map(site => {
      const topics = aiTopics[site] || [];
      const siteLabel = {kbbg:'KBBG 내부',kskindaily:'K Skin Daily',dailyhallyuwave:'Daily Hallyu Wave',koreatravel365:'Korea Travel 365'}[site];
      return `<div style="margin-bottom:12px;">
        <div style="font-size:12px;font-weight:700;color:#667eea;margin-bottom:4px;">${siteLabel}</div>
        ${topics.map(t => `<div style="font-size:12px;color:#2d3436;padding:3px 0 3px 10px;border-left:2px solid #e0e3ff;">[${t.category}] ${t.keyword}</div>`).join('')}
      </div>`;
    }).join('')}
  </div>` : ''}

  <!-- 푸터 -->
  <div style="text-align:center;padding:16px;font-size:11px;color:#b2bec3;">
    🤖 Auto-generated at 5:00 AM KST by KBBG AI Marketing Advisor<br>
    <a href="https://kbeautybuyersguide.com" style="color:#667eea;">kbeautybuyersguide.com</a>
  </div>

</div>`;
}

// ── 메인 ────────────────────────────────────────────────────────
async function main() {
  console.log("📊 GA4 데이터 수집 중...");
  const ga4 = await getGA4Data();

  console.log("📝 블로그 현황 수집 중...");
  const blogStats = await getBlogStats();

  console.log("🤖 Claude AI 분석 중...");
  const analysis = await analyzeWithClaude(ga4, blogStats);

  console.log("📋 오늘의 블로그 주제 생성 중...");
  let aiTopics = null;
  try {
    aiTopics = await generateTopicsForBlogs(ga4, analysis);
  } catch (e) {
    console.error("주제 생성 실패 (무시):", e.message);
  }

  const today = new Date().toISOString().slice(0, 10);
  const html = buildEmail(ga4, analysis, today, aiTopics);

  console.log("📧 이메일 발송 중...");
  const { error } = await resend.emails.send({
    from: "KBBG AI Brief <onboarding@resend.dev>",
    to: REPORT_EMAIL,
    subject: `🤖 KBBG AI 마케팅 브리핑 — ${today}`,
    html,
  });

  if (error) {
    console.error("이메일 전송 실패:", error);
    process.exit(1);
  }

  console.log(`✅ AI 브리핑 발송 완료 → ${REPORT_EMAIL}`);
}

main().catch((err) => {
  console.error("에러:", err.message);
  process.exit(1);
});
