// GA4 어제 방문자 빠른 조회 (이메일 없이 터미널 출력)
// 사용법: node scripts/ga4-quick-check.mjs

import { google } from "googleapis";

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
if (!GA4_PROPERTY_ID) {
  console.error("GA4_PROPERTY_ID 환경변수 필요");
  process.exit(1);
}

const auth = new google.auth.GoogleAuth({
  keyFile: new URL("../ga4-service-account.json", import.meta.url).pathname,
  scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
});

const analyticsData = google.analyticsdata({ version: "v1beta", auth });
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

const [dailyRes, countryRes] = await Promise.all([
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
      dateRanges: [{ startDate: yesterday, endDate: yesterday }],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 10,
    },
  }),
]);

console.log(`\n📊 KBBG 방문자 현황 (${yesterday})\n${"─".repeat(40)}`);

const rows = dailyRes.data.rows || [];
for (const r of rows) {
  const d = r.dimensionValues[0].value;
  const date = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
  const users = r.metricValues[0].value.padStart(4);
  const sessions = r.metricValues[1].value.padStart(4);
  const views = r.metricValues[2].value.padStart(5);
  const marker = date === yesterday ? " ◀ 어제" : "";
  console.log(`${date}  👤${users}명  📱${sessions}세션  📄${views}뷰${marker}`);
}

const countries = countryRes.data.rows || [];
if (countries.length) {
  console.log(`\n🌍 국가별 방문자 (어제)\n${"─".repeat(30)}`);
  countries.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.dimensionValues[0].value}: ${r.metricValues[0].value}명`);
  });
}
console.log();
