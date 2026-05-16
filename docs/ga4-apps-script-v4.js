var GA4_PROPERTY_ID = '530256659';
var GSC_SITE_URL = 'sc-domain:kbeautybuyersguide.com';
var REPORT_EMAIL = 'help@2bstory.com';

function sendDailyReport() {
  var today = new Date();
  var yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  var weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  var yesterdayStr = formatDate(yesterday);
  var weekAgoStr = formatDate(weekAgo);

  // GSC는 2~3일 딜레이 있음 → 3일 전 ~ 9일 전 구간 사용
  var gscEnd = new Date(today);
  gscEnd.setDate(today.getDate() - 3);
  var gscStart = new Date(today);
  gscStart.setDate(today.getDate() - 9);
  var gscEndStr = formatDate(gscEnd);
  var gscStartStr = formatDate(gscStart);

  // GA4 데이터
  var core = runReport(yesterdayStr, yesterdayStr, [], ['totalUsers', 'newUsers', 'sessions', 'screenPageViews', 'averageSessionDuration']);
  var dailyTrend = runReport(weekAgoStr, yesterdayStr, ['date'], ['totalUsers', 'newUsers', 'sessions']);
  var byCountry = runReport(yesterdayStr, yesterdayStr, ['country'], ['totalUsers', 'sessions'], 10);
  var byMedium = runReport(yesterdayStr, yesterdayStr, ['sessionMedium'], ['totalUsers', 'sessions'], 10);
  var bySource = runReport(yesterdayStr, yesterdayStr, ['sessionSource'], ['totalUsers', 'sessions'], 10);
  var byReferrer = runReport(yesterdayStr, yesterdayStr, ['pageReferrer'], ['totalUsers', 'screenPageViews'], 10);
  var byDevice = runReport(yesterdayStr, yesterdayStr, ['deviceCategory'], ['totalUsers', 'sessions']);
  var weekDevice = runReport(weekAgoStr, yesterdayStr, ['deviceCategory'], ['totalUsers', 'sessions']);
  var byPage = runReport(weekAgoStr, yesterdayStr, ['pageTitle', 'pagePath'], ['totalUsers', 'screenPageViews'], 10);

  // GSC 데이터
  var gscKeywords = getGscData(GSC_SITE_URL, gscStartStr, gscEndStr, ['query'], 20);
  var gscPages = getGscData(GSC_SITE_URL, gscStartStr, gscEndStr, ['page'], 10);

  var html = buildReport(yesterdayStr, weekAgoStr, gscStartStr, gscEndStr, core, dailyTrend, byCountry, byMedium, bySource, byReferrer, byDevice, weekDevice, byPage, gscKeywords, gscPages);
  MailApp.sendEmail({ to: REPORT_EMAIL, subject: '[KBBG] Daily Report - ' + yesterdayStr, htmlBody: html });
}

// ── GSC ──────────────────────────────────────────────
function getGscData(siteUrl, startDate, endDate, dimensions, limit) {
  try {
    var request = {
      startDate: startDate,
      endDate: endDate,
      dimensions: dimensions,
      rowLimit: limit || 20,
      dataState: 'final'
    };
    var response = SearchConsole.Searchanalytics.query(siteUrl, request);
    return response.rows || [];
  } catch (e) {
    Logger.log('GSC error: ' + e.message);
    return [];
  }
}

// ── GA4 ──────────────────────────────────────────────
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

// ── HTML 리포트 ───────────────────────────────────────
function buildReport(date, weekAgoStr, gscStart, gscEnd, core, trend, countries, mediums, sources, referrers, devices, weekDevices, pages, gscKeywords, gscPages) {
  var c = core[0] || {};
  var totalUsers = Number(c.totalUsers || 0);
  var newUsers = Number(c.newUsers || 0);
  var returning = totalUsers - newUsers;
  var sessions = Number(c.sessions || 0);
  var pageviews = Number(c.screenPageViews || 0);
  var duration = Number(c.averageSessionDuration || 0);
  var mins = Math.floor(duration / 60);
  var secs = Math.floor(duration % 60);

  var html = '';
  html += '<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:680px;margin:0 auto;background:#f0f2f5;padding:24px;">';

  // Header
  html += '<div style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:28px;border-radius:20px;margin-bottom:20px;">';
  html += '<h1 style="margin:0;font-size:22px;font-weight:700;">KBBG Daily Analytics</h1>';
  html += '<p style="margin:6px 0 0;opacity:0.8;font-size:14px;">' + date + ' Report</p>';
  html += '</div>';

  // Core metrics
  html += '<div style="display:flex;gap:12px;margin-bottom:12px;">';
  html += bigCard('Total Visitors', totalUsers, '#4361ee');
  html += bigCard('New Visitors', newUsers, '#00b894');
  html += bigCard('Returning', returning, '#e17055');
  html += '</div>';
  html += '<div style="display:flex;gap:12px;margin-bottom:20px;">';
  html += bigCard('Sessions', sessions, '#6c5ce7');
  html += bigCard('Pageviews', pageviews, '#0984e3');
  html += bigCard('Avg Duration', mins + 'm ' + secs + 's', '#fdcb6e');
  html += '</div>';

  // ★ GSC 유입 키워드 TOP 20
  html += gscKeywordsSection(gscKeywords, gscStart, gscEnd);

  // ★ GSC 인기 페이지 TOP 10
  html += gscPagesSection(gscPages, gscStart, gscEnd);

  // ★ GA4 인기 페이지 TOP 10 (7일)
  html += ga4PagesSection(pages, weekAgoStr, date);

  // Device (Yesterday)
  html += '<div style="background:white;border-radius:16px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">';
  html += '<h2 style="font-size:16px;margin:0 0 16px;color:#2d3436;">Device Breakdown (Yesterday)</h2>';
  var deviceTotal = 0;
  for (var di = 0; di < devices.length; di++) { deviceTotal += Number(devices[di].totalUsers); }
  if (deviceTotal === 0) deviceTotal = 1;
  var deviceColors = { desktop: '#4361ee', mobile: '#e17055', tablet: '#00b894' };
  for (var dj = 0; dj < devices.length; dj++) {
    var dev = devices[dj];
    var devUsers = Number(dev.totalUsers);
    var devPct = (devUsers / deviceTotal * 100).toFixed(1);
    var devColor = deviceColors[dev.deviceCategory.toLowerCase()] || '#636e72';
    var devLabel = dev.deviceCategory === 'desktop' ? 'PC/Desktop' : dev.deviceCategory.charAt(0).toUpperCase() + dev.deviceCategory.slice(1);
    html += '<div style="margin-bottom:12px;">';
    html += '<div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:13px;">';
    html += '<span style="font-weight:600;color:#2d3436;">' + devLabel + '</span>';
    html += '<span style="color:#636e72;">' + devUsers + ' users (' + devPct + '%)</span>';
    html += '</div>';
    html += '<div style="background:#f0f2f5;border-radius:8px;height:24px;overflow:hidden;">';
    html += '<div style="width:' + devPct + '%;background:' + devColor + ';height:100%;border-radius:8px;"></div>';
    html += '</div></div>';
  }
  html += '</div>';

  // 7-Day Trend
  html += '<div style="background:white;border-radius:16px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">';
  html += '<h2 style="font-size:16px;margin:0 0 16px;color:#2d3436;">7-Day Visitor Trend</h2>';
  trend.sort(function(a, b) { return a.date.localeCompare(b.date); });
  var maxTrend = 1;
  for (var ti = 0; ti < trend.length; ti++) {
    var tu = Number(trend[ti].totalUsers);
    if (tu > maxTrend) maxTrend = tu;
  }
  for (var tj = 0; tj < trend.length; tj++) {
    var tr = trend[tj];
    var tDate = tr.date;
    var tLabel = tDate.substring(4, 6) + '/' + tDate.substring(6, 8);
    var tTotal = Number(tr.totalUsers);
    var tNew = Number(tr.newUsers);
    var tPct = (tTotal / maxTrend * 100).toFixed(0);
    var tNewPct = (tNew / maxTrend * 100).toFixed(0);
    html += '<div style="display:flex;align-items:center;margin-bottom:8px;">';
    html += '<span style="width:45px;font-size:12px;color:#636e72;font-weight:500;">' + tLabel + '</span>';
    html += '<div style="flex:1;position:relative;height:28px;">';
    html += '<div style="position:absolute;top:0;left:0;width:' + tPct + '%;background:linear-gradient(90deg,#4361ee,#667eea);height:100%;border-radius:6px;"></div>';
    html += '<div style="position:absolute;top:0;left:0;width:' + tNewPct + '%;background:rgba(0,184,148,0.6);height:100%;border-radius:6px 0 0 6px;"></div>';
    html += '</div>';
    html += '<span style="width:60px;text-align:right;font-size:12px;font-weight:600;color:#2d3436;margin-left:8px;">' + tTotal + '</span>';
    html += '</div>';
  }
  html += '<div style="display:flex;gap:16px;margin-top:12px;font-size:11px;color:#636e72;">';
  html += '<span><span style="display:inline-block;width:10px;height:10px;background:#4361ee;border-radius:2px;margin-right:4px;"></span>Total</span>';
  html += '<span><span style="display:inline-block;width:10px;height:10px;background:rgba(0,184,148,0.6);border-radius:2px;margin-right:4px;"></span>New</span>';
  html += '</div>';
  html += '<table style="width:100%;font-size:12px;border-collapse:collapse;margin-top:16px;">';
  html += '<tr style="background:#f8f9fa;"><th style="padding:8px;text-align:left;">Date</th><th style="padding:8px;text-align:right;">Total</th><th style="padding:8px;text-align:right;">New</th><th style="padding:8px;text-align:right;">Returning</th><th style="padding:8px;text-align:right;">Sessions</th></tr>';
  for (var tk = 0; tk < trend.length; tk++) {
    var trow = trend[tk];
    var tdd = trow.date;
    var tdf = tdd.substring(0, 4) + '-' + tdd.substring(4, 6) + '-' + tdd.substring(6, 8);
    var tTot = Number(trow.totalUsers);
    var tNw = Number(trow.newUsers);
    var tRet = tTot - tNw;
    html += '<tr><td style="padding:8px;border-top:1px solid #eee;">' + tdf + '</td>';
    html += '<td style="padding:8px;border-top:1px solid #eee;text-align:right;font-weight:600;">' + tTot + '</td>';
    html += '<td style="padding:8px;border-top:1px solid #eee;text-align:right;color:#00b894;">' + tNw + '</td>';
    html += '<td style="padding:8px;border-top:1px solid #eee;text-align:right;color:#e17055;">' + tRet + '</td>';
    html += '<td style="padding:8px;border-top:1px solid #eee;text-align:right;">' + trow.sessions + '</td></tr>';
  }
  html += '</table></div>';

  // Countries / Medium / Source
  html += barSection('Visitor Countries (Yesterday)', countries, 'country', 'totalUsers', '#6c5ce7');
  html += barSection('Traffic Medium (Yesterday)', mediums, 'sessionMedium', 'totalUsers', '#e17055');
  html += barSection('Traffic Source (Yesterday)', sources, 'sessionSource', 'totalUsers', '#00b894');

  // Referrer URLs
  html += '<div style="background:white;border-radius:16px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">';
  html += '<h2 style="font-size:16px;margin:0 0 16px;color:#2d3436;">Referral URLs (Yesterday)</h2>';
  if (referrers.length === 0) {
    html += '<p style="color:#b2bec3;font-size:13px;">No referral data</p>';
  } else {
    html += '<table style="width:100%;font-size:12px;border-collapse:collapse;">';
    html += '<tr style="background:#f8f9fa;"><th style="padding:8px;text-align:left;">URL</th><th style="padding:8px;text-align:right;">Users</th><th style="padding:8px;text-align:right;">Views</th></tr>';
    for (var ri = 0; ri < referrers.length; ri++) {
      var ref = referrers[ri];
      var refUrl = ref.pageReferrer || '(direct)';
      if (refUrl.length > 60) refUrl = refUrl.substring(0, 60) + '...';
      html += '<tr><td style="padding:8px;border-top:1px solid #eee;color:#0984e3;word-break:break-all;">' + refUrl + '</td>';
      html += '<td style="padding:8px;border-top:1px solid #eee;text-align:right;font-weight:600;">' + ref.totalUsers + '</td>';
      html += '<td style="padding:8px;border-top:1px solid #eee;text-align:right;">' + ref.screenPageViews + '</td></tr>';
    }
    html += '</table>';
  }
  html += '</div>';

  // 7-Day Device
  html += '<div style="background:white;border-radius:16px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">';
  html += '<h2 style="font-size:16px;margin:0 0 16px;color:#2d3436;">Device Breakdown (7 Days)</h2>';
  var wdTotal = 0;
  for (var wi = 0; wi < weekDevices.length; wi++) { wdTotal += Number(weekDevices[wi].totalUsers); }
  if (wdTotal === 0) wdTotal = 1;
  for (var wj = 0; wj < weekDevices.length; wj++) {
    var wd = weekDevices[wj];
    var wdUsers = Number(wd.totalUsers);
    var wdPct = (wdUsers / wdTotal * 100).toFixed(1);
    var wdColor = deviceColors[wd.deviceCategory.toLowerCase()] || '#636e72';
    var wdLabel = wd.deviceCategory === 'desktop' ? 'PC/Desktop' : wd.deviceCategory.charAt(0).toUpperCase() + wd.deviceCategory.slice(1);
    html += '<div style="margin-bottom:12px;">';
    html += '<div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:13px;">';
    html += '<span style="font-weight:600;color:#2d3436;">' + wdLabel + '</span>';
    html += '<span style="color:#636e72;">' + wdUsers + ' users (' + wdPct + '%)</span>';
    html += '</div>';
    html += '<div style="background:#f0f2f5;border-radius:8px;height:24px;overflow:hidden;">';
    html += '<div style="width:' + wdPct + '%;background:' + wdColor + ';height:100%;border-radius:8px;"></div>';
    html += '</div></div>';
  }
  html += '</div>';

  // Footer
  html += '<div style="text-align:center;padding:16px;font-size:11px;color:#b2bec3;">';
  html += 'Auto-generated at 5:00 AM KST by KBBG Analytics Reporter<br>';
  html += '<a href="https://kbeautybuyersguide.com" style="color:#667eea;">kbeautybuyersguide.com</a>';
  html += '</div></div>';

  return html;
}

// ── 새 섹션: GSC 유입 키워드 ─────────────────────────
function gscKeywordsSection(keywords, startDate, endDate) {
  var html = '<div style="background:white;border-radius:16px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">';
  html += '<div style="display:flex;align-items:center;margin-bottom:4px;">';
  html += '<h2 style="font-size:16px;margin:0;color:#2d3436;">🔍 Search Keywords TOP 20</h2>';
  html += '<span style="margin-left:8px;font-size:11px;color:#b2bec3;background:#f8f9fa;padding:2px 8px;border-radius:20px;">via Google Search Console</span>';
  html += '</div>';
  html += '<p style="font-size:11px;color:#b2bec3;margin:0 0 16px;">' + startDate + ' ~ ' + endDate + ' (3일 딜레이 반영)</p>';

  if (!keywords || keywords.length === 0) {
    html += '<p style="color:#b2bec3;font-size:13px;">No keyword data (GSC API 연결 확인 필요)</p></div>';
    return html;
  }

  var maxClicks = 1;
  for (var i = 0; i < keywords.length; i++) {
    if (Number(keywords[i].clicks) > maxClicks) maxClicks = Number(keywords[i].clicks);
  }

  html += '<table style="width:100%;font-size:12px;border-collapse:collapse;">';
  html += '<tr style="background:#f8f9fa;">';
  html += '<th style="padding:8px;text-align:left;">#</th>';
  html += '<th style="padding:8px;text-align:left;">키워드</th>';
  html += '<th style="padding:8px;text-align:right;">클릭</th>';
  html += '<th style="padding:8px;text-align:right;">노출</th>';
  html += '<th style="padding:8px;text-align:right;">CTR</th>';
  html += '<th style="padding:8px;text-align:right;">순위</th>';
  html += '</tr>';

  for (var j = 0; j < keywords.length; j++) {
    var kw = keywords[j];
    var query = (kw.keys && kw.keys[0]) ? kw.keys[0] : '(unknown)';
    var clicks = Number(kw.clicks || 0);
    var impressions = Number(kw.impressions || 0);
    var ctr = ((kw.ctr || 0) * 100).toFixed(1);
    var position = (kw.position || 0).toFixed(1);
    var clickPct = (clicks / maxClicks * 100).toFixed(0);
    var rowBg = j % 2 === 0 ? 'white' : '#fafbfc';
    html += '<tr style="background:' + rowBg + ';">';
    html += '<td style="padding:8px;border-top:1px solid #eee;color:#b2bec3;font-size:11px;">' + (j + 1) + '</td>';
    html += '<td style="padding:8px;border-top:1px solid #eee;font-weight:500;">';
    html += '<div>' + query + '</div>';
    html += '<div style="height:4px;background:#f0f2f5;border-radius:2px;margin-top:4px;">';
    html += '<div style="width:' + clickPct + '%;background:#667eea;height:100%;border-radius:2px;"></div>';
    html += '</div></td>';
    html += '<td style="padding:8px;border-top:1px solid #eee;text-align:right;font-weight:700;color:#4361ee;">' + clicks + '</td>';
    html += '<td style="padding:8px;border-top:1px solid #eee;text-align:right;color:#636e72;">' + impressions + '</td>';
    html += '<td style="padding:8px;border-top:1px solid #eee;text-align:right;color:#00b894;">' + ctr + '%</td>';
    html += '<td style="padding:8px;border-top:1px solid #eee;text-align:right;color:' + (Number(position) <= 10 ? '#e17055' : '#636e72') + ';font-weight:' + (Number(position) <= 10 ? '700' : '400') + ';">' + position + '</td>';
    html += '</tr>';
  }
  html += '</table></div>';
  return html;
}

// ── 새 섹션: GSC 인기 페이지 ─────────────────────────
function gscPagesSection(pages, startDate, endDate) {
  var html = '<div style="background:white;border-radius:16px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">';
  html += '<h2 style="font-size:16px;margin:0 0 4px;color:#2d3436;">📄 Top Pages (GSC 클릭수)</h2>';
  html += '<p style="font-size:11px;color:#b2bec3;margin:0 0 16px;">' + startDate + ' ~ ' + endDate + '</p>';

  if (!pages || pages.length === 0) {
    html += '<p style="color:#b2bec3;font-size:13px;">No page data</p></div>';
    return html;
  }

  html += '<table style="width:100%;font-size:12px;border-collapse:collapse;">';
  html += '<tr style="background:#f8f9fa;"><th style="padding:8px;text-align:left;">페이지</th><th style="padding:8px;text-align:right;">클릭</th><th style="padding:8px;text-align:right;">노출</th><th style="padding:8px;text-align:right;">순위</th></tr>';
  for (var i = 0; i < pages.length; i++) {
    var pg = pages[i];
    var url = (pg.keys && pg.keys[0]) ? pg.keys[0] : '';
    var shortUrl = url.replace('https://kbeautybuyersguide.com', '').replace('https://www.kbeautybuyersguide.com', '');
    if (shortUrl.length > 55) shortUrl = shortUrl.substring(0, 55) + '...';
    var rowBg = i % 2 === 0 ? 'white' : '#fafbfc';
    html += '<tr style="background:' + rowBg + ';">';
    html += '<td style="padding:8px;border-top:1px solid #eee;color:#0984e3;font-size:11px;">' + (shortUrl || '/') + '</td>';
    html += '<td style="padding:8px;border-top:1px solid #eee;text-align:right;font-weight:700;color:#4361ee;">' + Number(pg.clicks || 0) + '</td>';
    html += '<td style="padding:8px;border-top:1px solid #eee;text-align:right;color:#636e72;">' + Number(pg.impressions || 0) + '</td>';
    html += '<td style="padding:8px;border-top:1px solid #eee;text-align:right;">' + (pg.position || 0).toFixed(1) + '</td>';
    html += '</tr>';
  }
  html += '</table></div>';
  return html;
}

// ── 새 섹션: GA4 인기 페이지 ─────────────────────────
function ga4PagesSection(pages, startDate, endDate) {
  var html = '<div style="background:white;border-radius:16px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">';
  html += '<h2 style="font-size:16px;margin:0 0 4px;color:#2d3436;">📊 Top Pages (GA4 방문자수, 7일)</h2>';
  html += '<p style="font-size:11px;color:#b2bec3;margin:0 0 16px;">' + startDate + ' ~ ' + endDate + '</p>';

  if (!pages || pages.length === 0) {
    html += '<p style="color:#b2bec3;font-size:13px;">No page data</p></div>';
    return html;
  }

  var maxUsers = 1;
  for (var i = 0; i < pages.length; i++) {
    if (Number(pages[i].totalUsers) > maxUsers) maxUsers = Number(pages[i].totalUsers);
  }

  html += '<table style="width:100%;font-size:12px;border-collapse:collapse;">';
  html += '<tr style="background:#f8f9fa;"><th style="padding:8px;text-align:left;">페이지</th><th style="padding:8px;text-align:right;">방문자</th><th style="padding:8px;text-align:right;">뷰</th></tr>';
  for (var j = 0; j < pages.length; j++) {
    var pg = pages[j];
    var title = pg.pageTitle || '(no title)';
    if (title.length > 40) title = title.substring(0, 40) + '...';
    var path = (pg.pagePath || '').replace(/\?.*$/, '');
    if (path.length > 40) path = path.substring(0, 40) + '...';
    var users = Number(pg.totalUsers || 0);
    var views = Number(pg.screenPageViews || 0);
    var pct = (users / maxUsers * 100).toFixed(0);
    var rowBg = j % 2 === 0 ? 'white' : '#fafbfc';
    html += '<tr style="background:' + rowBg + ';">';
    html += '<td style="padding:8px;border-top:1px solid #eee;">';
    html += '<div style="font-weight:500;color:#2d3436;">' + title + '</div>';
    html += '<div style="font-size:11px;color:#b2bec3;">' + path + '</div>';
    html += '<div style="height:3px;background:#f0f2f5;border-radius:2px;margin-top:4px;">';
    html += '<div style="width:' + pct + '%;background:#0984e3;height:100%;border-radius:2px;"></div>';
    html += '</div></td>';
    html += '<td style="padding:8px;border-top:1px solid #eee;text-align:right;font-weight:700;color:#0984e3;">' + users + '</td>';
    html += '<td style="padding:8px;border-top:1px solid #eee;text-align:right;color:#636e72;">' + views + '</td>';
    html += '</tr>';
  }
  html += '</table></div>';
  return html;
}

// ── 공통 헬퍼 ────────────────────────────────────────
function barSection(title, data, dimKey, metricKey, color) {
  var html = '<div style="background:white;border-radius:16px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">';
  html += '<h2 style="font-size:16px;margin:0 0 16px;color:#2d3436;">' + title + '</h2>';
  if (data.length === 0) { html += '<p style="color:#b2bec3;font-size:13px;">No data</p></div>'; return html; }
  var maxVal = 1;
  for (var i = 0; i < data.length; i++) { var v = Number(data[i][metricKey]); if (v > maxVal) maxVal = v; }
  for (var j = 0; j < data.length; j++) {
    var row = data[j];
    var val = Number(row[metricKey]);
    var pct = (val / maxVal * 100).toFixed(0);
    var label = row[dimKey] || '(not set)';
    if (label.length > 40) label = label.substring(0, 40) + '...';
    html += '<div style="margin-bottom:10px;">';
    html += '<div style="display:flex;justify-content:space-between;margin-bottom:3px;font-size:12px;">';
    html += '<span style="color:#2d3436;">' + label + '</span>';
    html += '<span style="font-weight:600;color:#2d3436;">' + val + '</span>';
    html += '</div>';
    html += '<div style="background:#f0f2f5;border-radius:6px;height:18px;overflow:hidden;">';
    html += '<div style="width:' + pct + '%;background:' + color + ';height:100%;border-radius:6px;"></div>';
    html += '</div></div>';
  }
  html += '</div>';
  return html;
}

function bigCard(label, value, color) {
  var html = '<div style="flex:1;background:white;border-radius:14px;padding:18px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.04);">';
  html += '<div style="font-size:28px;font-weight:800;color:' + color + ';">' + value + '</div>';
  html += '<div style="font-size:12px;color:#636e72;margin-top:6px;">' + label + '</div>';
  html += '</div>';
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
  ScriptApp.newTrigger('sendDailyReport').timeBased().everyDays(1).atHour(20).create();
}
