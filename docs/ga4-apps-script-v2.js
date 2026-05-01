var GA4_PROPERTY_ID = '530256659';
var REPORT_EMAIL = 'help@2bstory.com';

function sendDailyReport() {
  var today = new Date();
  var yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  var weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  var yesterdayStr = formatDate(yesterday);
  var weekAgoStr = formatDate(weekAgo);

  var coreMetrics = runReport(yesterdayStr, yesterdayStr, [], ['totalUsers', 'sessions', 'screenPageViews', 'averageSessionDuration', 'bounceRate']);
  var dailyTrend = runReport(weekAgoStr, yesterdayStr, ['date'], ['totalUsers', 'sessions', 'screenPageViews']);
  var byCountry = runReport(weekAgoStr, yesterdayStr, ['country'], ['totalUsers', 'sessions'], 10);
  var byPage = runReport(weekAgoStr, yesterdayStr, ['pagePath'], ['screenPageViews', 'totalUsers'], 10);
  var bySource = runReport(weekAgoStr, yesterdayStr, ['sessionSource'], ['totalUsers', 'sessions'], 10);

  var html = buildHtmlReport(yesterdayStr, coreMetrics, dailyTrend, byCountry, byPage, bySource);
  MailApp.sendEmail({ to: REPORT_EMAIL, subject: '[KBBG] GA4 Daily Report - ' + yesterdayStr, htmlBody: html });
}

function runReport(startDate, endDate, dimensions, metrics, limit) {
  var request = { dateRanges: [{ startDate: startDate, endDate: endDate }], metrics: metrics.map(function(m) { return { name: m }; }) };
  if (dimensions.length > 0) {
    request.dimensions = dimensions.map(function(d) { return { name: d }; });
    request.orderBys = [{ metric: { metricName: metrics[0] }, desc: true }];
  }
  if (limit) { request.limit = limit; }
  var response = AnalyticsData.Properties.runReport(request, 'properties/' + GA4_PROPERTY_ID);
  return parseResponse(response, dimensions, metrics);
}

function parseResponse(response, dimensions, metrics) {
  var rows = [];
  if (!response.rows) return rows;
  for (var r = 0; r < response.rows.length; r++) {
    var obj = {};
    var row = response.rows[r];
    if (dimensions.length > 0) {
      for (var d = 0; d < row.dimensionValues.length; d++) {
        obj[dimensions[d]] = row.dimensionValues[d].value;
      }
    }
    for (var m = 0; m < row.metricValues.length; m++) {
      obj[metrics[m]] = row.metricValues[m].value;
    }
    rows.push(obj);
  }
  return rows;
}

function buildHtmlReport(date, core, trend, countries, pages, sources) {
  var c = core[0] || {};
  var users = Number(c.totalUsers || 0);
  var sessions = Number(c.sessions || 0);
  var pageviews = Number(c.screenPageViews || 0);
  var duration = Number(c.averageSessionDuration || 0);
  var bounce = (Number(c.bounceRate || 0) * 100).toFixed(1);
  var mins = Math.floor(duration / 60);
  var secs = Math.floor(duration % 60);

  var html = '';
  html += '<div style="font-family:sans-serif;max-width:640px;margin:0 auto;background:#f8f9fa;padding:20px;">';
  html += '<div style="background:linear-gradient(135deg,#1a1a2e,#16213e);color:white;padding:24px;border-radius:16px;margin-bottom:16px;">';
  html += '<h1 style="margin:0;font-size:20px;">KBBG Daily Report</h1>';
  html += '<p style="margin:4px 0 0;opacity:0.7;font-size:13px;">' + date + '</p></div>';

  html += '<div style="display:flex;gap:10px;margin-bottom:16px;">';
  html += metricCard('Visitors', users, '#4361ee');
  html += metricCard('Sessions', sessions, '#3a0ca3');
  html += metricCard('Pageviews', pageviews, '#7209b7');
  html += '</div>';
  html += '<div style="display:flex;gap:10px;margin-bottom:16px;">';
  html += metricCard('Avg Duration', mins + 'm ' + secs + 's', '#f72585');
  html += metricCard('Bounce Rate', bounce + '%', '#560bad');
  html += '</div>';

  html += '<div style="background:white;border-radius:12px;padding:16px;margin-bottom:16px;">';
  html += '<h2 style="font-size:15px;margin:0 0 12px;">7-Day Trend</h2>';
  html += '<table style="width:100%;font-size:12px;border-collapse:collapse;">';
  html += '<tr style="background:#f1f3f5;"><th style="padding:6px;text-align:left;">Date</th><th style="padding:6px;text-align:right;">Users</th><th style="padding:6px;text-align:right;">Sessions</th><th style="padding:6px;text-align:right;">Views</th></tr>';

  trend.sort(function(a, b) { return a.date.localeCompare(b.date); });
  for (var i = 0; i < trend.length; i++) {
    var row = trend[i];
    var dd = row.date;
    var df = dd.substring(0, 4) + '-' + dd.substring(4, 6) + '-' + dd.substring(6, 8);
    html += '<tr><td style="padding:6px;border-top:1px solid #eee;">' + df + '</td>';
    html += '<td style="padding:6px;border-top:1px solid #eee;text-align:right;">' + row.totalUsers + '</td>';
    html += '<td style="padding:6px;border-top:1px solid #eee;text-align:right;">' + row.sessions + '</td>';
    html += '<td style="padding:6px;border-top:1px solid #eee;text-align:right;">' + row.screenPageViews + '</td></tr>';
  }
  html += '</table></div>';

  html += tableSection('Top Countries (7 days)', ['Country', 'Users', 'Sessions'], countries.map(function(r) { return [r.country, r.totalUsers, r.sessions]; }));
  html += tableSection('Top Pages (7 days)', ['Page', 'Views', 'Users'], pages.map(function(r) { var p = r.pagePath; if (p.length > 50) p = p.substring(0, 50) + '...'; return [p, r.screenPageViews, r.totalUsers]; }));
  html += tableSection('Top Sources (7 days)', ['Source', 'Users', 'Sessions'], sources.map(function(r) { return [r.sessionSource, r.totalUsers, r.sessions]; }));

  html += '<div style="text-align:center;padding:16px;font-size:11px;color:#aaa;">Auto-generated by KBBG GA4 Reporter</div>';
  html += '</div>';
  return html;
}

function metricCard(label, value, color) {
  var html = '<div style="flex:1;background:white;border-radius:12px;padding:14px;text-align:center;">';
  html += '<div style="font-size:22px;font-weight:700;color:' + color + ';">' + value + '</div>';
  html += '<div style="font-size:11px;color:#888;margin-top:4px;">' + label + '</div></div>';
  return html;
}

function tableSection(title, headers, rows) {
  var html = '<div style="background:white;border-radius:12px;padding:16px;margin-bottom:16px;">';
  html += '<h2 style="font-size:15px;margin:0 0 12px;">' + title + '</h2>';
  html += '<table style="width:100%;font-size:12px;border-collapse:collapse;"><tr style="background:#f1f3f5;">';
  for (var h = 0; h < headers.length; h++) {
    html += '<th style="padding:6px;text-align:' + (h === 0 ? 'left' : 'right') + ';">' + headers[h] + '</th>';
  }
  html += '</tr>';
  for (var r = 0; r < rows.length; r++) {
    html += '<tr>';
    for (var c = 0; c < rows[r].length; c++) {
      html += '<td style="padding:6px;border-top:1px solid #eee;text-align:' + (c === 0 ? 'left' : 'right') + ';' + (r === 0 ? 'font-weight:600;' : '') + '">' + rows[r][c] + '</td>';
    }
    html += '</tr>';
  }
  html += '</table></div>';
  return html;
}

function formatDate(d) {
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function createDailyTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'sendDailyReport') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('sendDailyReport').timeBased().everyDays(1).atHour(8).create();
}
