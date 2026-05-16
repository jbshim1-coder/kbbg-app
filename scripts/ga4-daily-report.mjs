// GA4 일일 리포트 — 시각화 HTML 이메일 전송
// cron: 매일 08:00 UTC (한국 17시)
// 사용법: node scripts/ga4-daily-report.mjs

import { google } from "googleapis";
import { readFileSync, writeFileSync } from "fs";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
const GA4_CLIENT_ID = process.env.GA4_CLIENT_ID;
const GA4_CLIENT_SECRET = process.env.GA4_CLIENT_SECRET;
const REPORT_EMAILS = [process.env.GA4_REPORT_EMAIL || "help@2bstory.com", "katieblue@naver.com"];
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!GA4_PROPERTY_ID || !GA4_CLIENT_ID || !RESEND_API_KEY) {
  console.error("Missing env vars");
  process.exit(1);
}

// OAuth 클라이언트 설정
const oauth2Client = new google.auth.OAuth2(GA4_CLIENT_ID, GA4_CLIENT_SECRET);
const tokensPath = new URL("../ga4-tokens.json", import.meta.url);
let tokens;
try {
  tokens = JSON.parse(readFileSync(tokensPath.pathname, "utf-8"));
  oauth2Client.setCredentials(tokens);
} catch {
  console.error("ga4-tokens.json 없음. 먼저 node scripts/ga4-auth.mjs 실행하세요.");
  process.exit(1);
}

// 토큰 자동 갱신
oauth2Client.on("tokens", (newTokens) => {
  tokens = { ...tokens, ...newTokens };
  writeFileSync(tokensPath.pathname, JSON.stringify(tokens, null, 2));
});

const analyticsData = google.analyticsdata({ version: "v1beta", auth: oauth2Client });
const resend = new Resend(RESEND_API_KEY);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── GA4 데이터 가져오기 ─────────────────────────────────────────
async function getGA4Data() {
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

  // 7일간 일별 방문자
  const dailyRes = await analyticsData.properties.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    requestBody: {
      dateRanges: [{ startDate: weekAgo, endDate: yesterday }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    },
  });

  // 국가별 방문자 (어제)
  const countryRes = await analyticsData.properties.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    requestBody: {
      dateRanges: [{ startDate: yesterday, endDate: yesterday }],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 10,
    },
  });

  // 방문 경로 (어제)
  const pathRes = await analyticsData.properties.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    requestBody: {
      dateRanges: [{ startDate: yesterday, endDate: yesterday }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    },
  });

  // 유입 소스 (어제)
  const sourceRes = await analyticsData.properties.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    requestBody: {
      dateRanges: [{ startDate: yesterday, endDate: yesterday }],
      dimensions: [{ name: "sessionSource" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    },
  });

  return {
    daily: dailyRes.data.rows || [],
    countries: countryRes.data.rows || [],
    paths: pathRes.data.rows || [],
    sources: sourceRes.data.rows || [],
    yesterday,
  };
}

// ─── 블로그 현황 가져오기 ────────────────────────────────────────
async function getBlogStats() {
  const sites = ["kbbg", "kskindaily", "dailyhallyuwave", "koreatravel365"];
  const stats = {};
  for (const site of sites) {
    const { count } = await supabase
      .from("blog_posts")
      .select("*", { count: "exact", head: true })
      .eq("site", site)
      .eq("is_published", true);
    stats[site] = count || 0;
  }
  return stats;
}

// ─── HTML 이메일 생성 ────────────────────────────────────────────
function buildEmailHtml(ga4, blogStats) {
  const { daily, countries, paths, sources, yesterday } = ga4;

  // 7일 방문자 차트 (CSS 막대 그래프)
  const maxUsers = Math.max(...daily.map((r) => parseInt(r.metricValues[0].value) || 1));
  const dailyBars = daily.map((r) => {
    const date = r.dimensionValues[0].value;
    const users = parseInt(r.metricValues[0].value);
    const sessions = parseInt(r.metricValues[1].value);
    const views = parseInt(r.metricValues[2].value);
    const pct = Math.round((users / maxUsers) * 100);
    const dateFormatted = `${date.slice(4, 6)}/${date.slice(6, 8)}`;
    return `
      <tr>
        <td style="padding:4px 8px;font-size:12px;color:#666;width:50px">${dateFormatted}</td>
        <td style="padding:4px 0">
          <div style="background:#0071e3;height:24px;width:${Math.max(pct, 5)}%;border-radius:4px;display:flex;align-items:center;padding-left:8px">
            <span style="color:white;font-size:11px;font-weight:600">${users}</span>
          </div>
        </td>
        <td style="padding:4px 8px;font-size:11px;color:#999;width:80px">${sessions}s / ${views}pv</td>
      </tr>`;
  }).join("");

  // 국가 테이블
  const countryRows = countries.map((r, i) => {
    const country = r.dimensionValues[0].value;
    const users = r.metricValues[0].value;
    return `<tr><td style="padding:3px 8px;font-size:12px">${i + 1}. ${country}</td><td style="padding:3px 8px;font-size:12px;font-weight:600;text-align:right">${users}</td></tr>`;
  }).join("") || '<tr><td style="padding:8px;font-size:12px;color:#999">No data</td></tr>';

  // 경로 테이블
  const pathRows = paths.map((r, i) => {
    const path = r.dimensionValues[0].value;
    const views = r.metricValues[0].value;
    return `<tr><td style="padding:3px 8px;font-size:11px;color:#333;max-width:200px;overflow:hidden;text-overflow:ellipsis">${i + 1}. ${path}</td><td style="padding:3px 8px;font-size:12px;font-weight:600;text-align:right">${views}</td></tr>`;
  }).join("") || '<tr><td style="padding:8px;font-size:12px;color:#999">No data</td></tr>';

  // 유입 소스 테이블
  const sourceRows = sources.map((r, i) => {
    const source = r.dimensionValues[0].value || "(direct)";
    const sessions = r.metricValues[0].value;
    return `<tr><td style="padding:3px 8px;font-size:12px">${i + 1}. ${source}</td><td style="padding:3px 8px;font-size:12px;font-weight:600;text-align:right">${sessions}</td></tr>`;
  }).join("") || '<tr><td style="padding:8px;font-size:12px;color:#999">No data</td></tr>';

  // 어제 총 방문자
  const yesterdayRow = daily.find((r) => r.dimensionValues[0].value === yesterday.replace(/-/g, ""));
  const totalUsers = yesterdayRow ? parseInt(yesterdayRow.metricValues[0].value) : 0;
  const totalSessions = yesterdayRow ? parseInt(yesterdayRow.metricValues[1].value) : 0;
  const totalViews = yesterdayRow ? parseInt(yesterdayRow.metricValues[2].value) : 0;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f7;padding:20px">

  <!-- 헤더 -->
  <div style="background:#1d1d1f;border-radius:16px;padding:24px;text-align:center;margin-bottom:16px">
    <h1 style="color:white;font-size:20px;margin:0">📊 KBBG Daily Report</h1>
    <p style="color:#86868b;font-size:13px;margin:8px 0 0">${yesterday}</p>
  </div>

  <!-- 핵심 지표 -->
  <div style="display:flex;gap:8px;margin-bottom:16px">
    <div style="flex:1;background:white;border-radius:12px;padding:16px;text-align:center">
      <p style="font-size:11px;color:#86868b;margin:0">Users</p>
      <p style="font-size:28px;font-weight:700;color:#1d1d1f;margin:4px 0">${totalUsers}</p>
    </div>
    <div style="flex:1;background:white;border-radius:12px;padding:16px;text-align:center">
      <p style="font-size:11px;color:#86868b;margin:0">Sessions</p>
      <p style="font-size:28px;font-weight:700;color:#1d1d1f;margin:4px 0">${totalSessions}</p>
    </div>
    <div style="flex:1;background:white;border-radius:12px;padding:16px;text-align:center">
      <p style="font-size:11px;color:#86868b;margin:0">Page Views</p>
      <p style="font-size:28px;font-weight:700;color:#1d1d1f;margin:4px 0">${totalViews}</p>
    </div>
  </div>

  <!-- 7일 추이 -->
  <div style="background:white;border-radius:12px;padding:16px;margin-bottom:16px">
    <h2 style="font-size:14px;color:#1d1d1f;margin:0 0 12px">📈 7-Day Visitors</h2>
    <table style="width:100%;border-collapse:collapse">${dailyBars}</table>
  </div>

  <!-- 국가 + 유입소스 -->
  <div style="display:flex;gap:8px;margin-bottom:16px">
    <div style="flex:1;background:white;border-radius:12px;padding:16px">
      <h2 style="font-size:14px;color:#1d1d1f;margin:0 0 8px">🌍 Countries</h2>
      <table style="width:100%;border-collapse:collapse">${countryRows}</table>
    </div>
    <div style="flex:1;background:white;border-radius:12px;padding:16px">
      <h2 style="font-size:14px;color:#1d1d1f;margin:0 0 8px">🔗 Sources</h2>
      <table style="width:100%;border-collapse:collapse">${sourceRows}</table>
    </div>
  </div>

  <!-- 인기 경로 -->
  <div style="background:white;border-radius:12px;padding:16px;margin-bottom:16px">
    <h2 style="font-size:14px;color:#1d1d1f;margin:0 0 8px">📄 Top Pages</h2>
    <table style="width:100%;border-collapse:collapse">${pathRows}</table>
  </div>

  <!-- 블로그 현황 -->
  <div style="background:white;border-radius:12px;padding:16px;margin-bottom:16px">
    <h2 style="font-size:14px;color:#1d1d1f;margin:0 0 8px">✍️ Blog Posts</h2>
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:3px 8px;font-size:12px">KBBG Internal</td><td style="text-align:right;font-size:12px;font-weight:600">${blogStats.kbbg} posts</td></tr>
      <tr><td style="padding:3px 8px;font-size:12px">K Skin Daily</td><td style="text-align:right;font-size:12px;font-weight:600">${blogStats.kskindaily} posts</td></tr>
      <tr><td style="padding:3px 8px;font-size:12px">Daily Hallyu Wave</td><td style="text-align:right;font-size:12px;font-weight:600">${blogStats.dailyhallyuwave} posts</td></tr>
      <tr><td style="padding:3px 8px;font-size:12px">Korea Travel 365</td><td style="text-align:right;font-size:12px;font-weight:600">${blogStats.koreatravel365} posts</td></tr>
    </table>
  </div>

  <!-- 푸터 -->
  <p style="text-align:center;font-size:11px;color:#86868b">
    Auto-generated by KBBG Analytics · <a href="https://kbeautybuyersguide.com" style="color:#0071e3">kbeautybuyersguide.com</a>
  </p>

</body>
</html>`;
}

// ─── 메인 ────────────────────────────────────────────────────────
async function main() {
  console.log(`[${new Date().toISOString()}] GA4 일일 리포트 생성 시작`);

  const ga4 = await getGA4Data();
  const blogStats = await getBlogStats();
  const html = buildEmailHtml(ga4, blogStats);

  const { error } = await resend.emails.send({
    from: "KBBG Report <onboarding@resend.dev>",
    to: REPORT_EMAILS,
    subject: `📊 KBBG Daily Report — ${ga4.yesterday}`,
    html,
  });

  if (error) {
    console.error("이메일 전송 실패:", error);
    process.exit(1);
  }

  console.log(`✅ 리포트 전송 완료 → ${REPORT_EMAILS.join(", ")}`);
}

main().catch((err) => {
  console.error("에러:", err.message);
  process.exit(1);
});
