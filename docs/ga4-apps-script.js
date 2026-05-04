// ===== KBBG GA4 일일 리포트 (Apps Script) =====
// 설정: 아래 두 값만 확인하세요
const GA4_PROPERTY_ID = '530256659';
const REPORT_EMAIL = 'help@2bstory.com';

function sendDailyReport() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  const yesterdayStr = formatDate(yesterday);
  const weekAgoStr = formatDate(weekAgo);

  // 1. 어제 핵심 지표
  const coreMetrics = runReport(yesterdayStr, yesterdayStr,
    [],
    ['totalUsers', 'sessions', 'screenPageViews', 'averageSessionDuration', 'bounceRate']
  );

  // 2. 7일간 방문자 추이
  const dailyTrend = runReport(weekAgoStr, yesterdayStr,
    ['date'],
    ['totalUsers', 'sessions', 'screenPageViews']
  );

  // 3. 국가별 TOP 10
  const byCountry = runReport(weekAgoStr, yesterdayStr,
    ['country'],
    ['totalUsers', 'sessions'],
    10
  );

  // 4. 인기 페이지 TOP 10
  const byPage = runReport(weekAgoStr, yesterdayStr,
    ['pagePath'],
    ['screenPageViews', 'totalUsers'],
    10
  );

  // 5. 유입 소스 TOP 10
  const bySource = runReport(weekAgoStr, yesterdayStr,
    ['sessionSource'],
    ['totalUsers', 'sessions'],
    10
  );

  // HTML 리포트 생성
  const html = buildHtmlReport(yesterdayStr, coreMetrics, dailyTrend, byCountry, byPage, bySource);

  // 이메일 전송
  MailApp.sendEmail({
    to: REPORT_EMAIL,
    subject: `[KBBG] GA4 일일 리포트 — ${yesterdayStr}`,
    htmlBody: html
  });

  Logger.log('Report sent to ' + REPORT_EMAIL);
}

function runReport(startDate, endDate, dimensions, metrics, limit) {
  const request = {
    dateRanges: [{ startDate: startDate, endDate: endDate }],
    metrics: metrics.map(m => ({ name: m })),
  };

  if (dimensions.length > 0) {
    request.dimensions = dimensions.map(d => ({ name: d }));
    request.orderBys = [{ metric: { metricName: metrics[0] }, desc: true }];
  }

  if (limit) {
    request.limit = limit;
  }

  const response = AnalyticsData.Properties.runReport(request, 'properties/' + GA4_PROPERTY_ID);
  return parseResponse(response, dimensions, metrics);
}

function parseResponse(response, dimensions, metrics) {
  const rows = [];
  if (!response.rows) return rows;

  response.rows.forEach(row => {
    const obj = {};
    if (dimensions.length > 0) {
      row.dimensionValues.forEach((val, i) => {
        obj[dimensions[i]] = val.value;
      });
    }
    row.metricValues.forEach((val, i) => {
      obj[metrics[i]] = val.value;
    });
    rows.push(obj);
  });

  return rows;
}

function buildHtmlReport(date, core, trend, countries, pages, sources) {
  const c = core[0] || {};
  const users = Number(c.totalUsers || 0);
  const sessions = Number(c.sessions || 0);
  const pageviews = Number(c.screenPageViews || 0);
  const duration = Number(c.averageSessionDuration || 0);
  const bounce = (Number(c.bounceRate || 0) * 100).toFixed(1);
  const mins = Math.floor(duration / 60);
  const secs = Math.floor(duration % 60);

  let html = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;background:#f8f9fa;padding:20px;">
    <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);color:white;padding:24px;border-radius:16px;margin-bottom:16px;">
      <h1 style="margin:0;font-size:20px;">KBBG Daily Report</h1>
      <p style="margin:4px 0 0;opacity:0.7;font-size:13px;">${date} (어제)</p>
    </div>

    <!-- 핵심 지표 -->
    <div style="display:flex;gap:10px;margin-bottom:16px;">
      ${metricCard('Visitors', users, '#4361ee')}
      ${metricCard('Sessions', sessions, '#3a0ca3')}
      ${metricCard('Pageviews', pageviews, '#7209b7')}
    </div>
    <div style="display:flex;gap:10px;margin-bottom:16px;">
      ${metricCard('Avg Duration', mins + 'm ' + secs + 's', '#f72585')}
      ${metricCard('Bounce Rate', bounce + '%', '#560bad')}
    </div>

    <!-- 7일 추이 -->
    <div style="background:white;border-radius:12px;padding:16px;margin-bottom:16px;">
      <h2 style="font-size:15px;margin:0 0 12px;">7-Day Trend</h2>
      <table style="width:100%;font-size:12px;border-collapse:collapse;">
        <tr style="background:#f1f3f5;">
          <th style="padding:6px;text-align:left;">Date</th>
          <th style="padding:6px;text-align:right;">Users</th>
          <th style="padding:6px;text-align:right;">Sessions</th>
          <th style="padding:6px;text-align:right;">Views</th>
        </tr>`;

  trend.sort((a, b) => a.date.localeCompare(b.date));
  trend.forEach(row => {
    const d = row.date;
    const dateFormatted = d.substring(0,4) + '-' + d.substring(4,6) + '-' + d.substring(6,8);
    html += `
        <tr>
          <td style="padding:6px;border-top:1px solid #eee;">${dateFormatted}</td>
          <td style="padding:6px;border-top:1px solid #eee;text-align:right;">${row.totalUsers}</td>
          <td style="padding:6px;border-top:1px solid #eee;text-align:right;">${row.sessions}</td>
          <td style="padding:6px;border-top:1px solid #eee;text-align:right;">${row.screenPageViews}</td>
        </tr>`;
  });

  // Bar chart (simple CSS bars)
  const maxUsers = Math.max(...trend.map(r => Number(r.totalUsers)), 1);
  html += `</table>
      <div style="margin-top:12px;">`;
  trend.forEach(row => {
    const pct = (Number(row.totalUsers) / maxUsers * 100).toFixed(0);
    const d = row.date;
    const dayLabel = d.substring(4,6) + '/' + d.substring(6,8);
    html += `
        <div style="display:flex;align-items:center;margin:3px 0;font-size:11px;">
          <span style="width:40px;color:#888;">${dayLabel}</span>
          <div style="flex:1;background:#eee;border-radius:4px;height:16px;overflow:hidden;">
            <div style="width:${pct}%;background:linear-gradient(90deg,#4361ee,#7209b7);height:100%;border-radius:4px;"></div>
          </div>
          <span style="width:30px;text-align:right;color:#555;margin-left:6px;">${row.totalUsers}</span>
        </div>`;
  });
  html += `</div></div>`;

  // 국가별 TOP 10
  html += tableSection('Top Countries (7 days)', ['Country', 'Users', 'Sessions'],
    countries.map(r => [r.country, r.totalUsers, r.sessions]));

  // 인기 페이지 TOP 10
  html += tableSection('Top Pages (7 days)', ['Page', 'Views', 'Users'],
    pages.map(r => [r.pagePath.length > 50 ? r.pagePath.substring(0,50) + '...' : r.pagePath, r.screenPageViews, r.totalUsers]));

  // 유입 소스 TOP 10
  html += tableSection('Top Sources (7 days)', ['Source', 'Users', 'Sessions'],
    sources.map(r => [r.sessionSource, r.totalUsers, r.sessions]));

  // 푸터
  html += `
    <div style="text-align:center;padding:16px;font-size:11px;color:#aaa;">
      Auto-generated by KBBG GA4 Reporter<br>
      <a href="https://kbeautybuyersguide.com" style="color:#4361ee;">kbeautybuyersguide.com</a>
    </div>
  </div>`;

  return html;
}

function metricCard(label, value, color) {
  return `<div style="flex:1;background:white;border-radius:12px;padding:14px;text-align:center;">
    <div style="font-size:22px;font-weight:700;color:${color};">${value}</div>
    <div style="font-size:11px;color:#888;margin-top:4px;">${label}</div>
  </div>`;
}

function tableSection(title, headers, rows) {
  let html = `
    <div style="background:white;border-radius:12px;padding:16px;margin-bottom:16px;">
      <h2 style="font-size:15px;margin:0 0 12px;">${title}</h2>
      <table style="width:100%;font-size:12px;border-collapse:collapse;">
        <tr style="background:#f1f3f5;">`;
  headers.forEach((h, i) => {
    html += `<th style="padding:6px;text-align:${i === 0 ? 'left' : 'right'};">${h}</th>`;
  });
  html += '</tr>';
  rows.forEach((row, idx) => {
    html += '<tr>';
    row.forEach((cell, i) => {
      html += `<td style="padding:6px;border-top:1px solid #eee;text-align:${i === 0 ? 'left' : 'right'};${idx === 0 ? 'font-weight:600;' : ''}">${cell}</td>`;
    });
    html += '</tr>';
  });
  html += '</table></div>';
  return html;
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

// 매일 자동 실행 트리거 설정
function createDailyTrigger() {
  // 기존 트리거 삭제
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'sendDailyReport') {
      ScriptApp.deleteTrigger(t);
    }
  });

  // 매일 오전 8시(UTC) = 한국 오후 5시 실행
  ScriptApp.newTrigger('sendDailyReport')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();

  Logger.log('Daily trigger created (08:00 UTC = 17:00 KST)');
}
