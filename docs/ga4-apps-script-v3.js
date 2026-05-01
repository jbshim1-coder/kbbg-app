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

  var core = runReport(yesterdayStr, yesterdayStr, [], ['totalUsers', 'newUsers', 'sessions', 'screenPageViews', 'averageSessionDuration']);
  var dailyTrend = runReport(weekAgoStr, yesterdayStr, ['date'], ['totalUsers', 'newUsers', 'sessions']);
  var byCountry = runReport(yesterdayStr, yesterdayStr, ['country'], ['totalUsers', 'sessions'], 10);
  var byMedium = runReport(yesterdayStr, yesterdayStr, ['sessionMedium'], ['totalUsers', 'sessions'], 10);
  var bySource = runReport(yesterdayStr, yesterdayStr, ['sessionSource'], ['totalUsers', 'sessions'], 10);
  var byReferrer = runReport(yesterdayStr, yesterdayStr, ['pageReferrer'], ['totalUsers', 'screenPageViews'], 10);
  var byDevice = runReport(yesterdayStr, yesterdayStr, ['deviceCategory'], ['totalUsers', 'sessions']);
  var weekDevice = runReport(weekAgoStr, yesterdayStr, ['deviceCategory'], ['totalUsers', 'sessions']);

  var html = buildReport(yesterdayStr, weekAgoStr, core, dailyTrend, byCountry, byMedium, bySource, byReferrer, byDevice, weekDevice);
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

function buildReport(date, weekAgoStr, core, trend, countries, mediums, sources, referrers, devices, weekDevices) {
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

  // Core metrics - 2 rows
  html += '<div style="display:flex;gap:12px;margin-bottom:12px;">';
  html += bigCard('Total Visitors', totalUsers, '#4361ee', totalUsers > 0 ? '+' : '');
  html += bigCard('New Visitors', newUsers, '#00b894', '');
  html += bigCard('Returning', returning, '#e17055', '');
  html += '</div>';
  html += '<div style="display:flex;gap:12px;margin-bottom:20px;">';
  html += bigCard('Sessions', sessions, '#6c5ce7', '');
  html += bigCard('Pageviews', pageviews, '#0984e3', '');
  html += bigCard('Avg Duration', mins + 'm ' + secs + 's', '#fdcb6e', '');
  html += '</div>';

  // PC vs Mobile - Donut style bar
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
    html += '<div style="width:' + devPct + '%;background:' + devColor + ';height:100%;border-radius:8px;transition:width 0.3s;"></div>';
    html += '</div></div>';
  }
  html += '</div>';

  // 7-Day Trend - Bar chart
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
    var tReturn = tTotal - tNew;
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

  // 7-day numbers table
  html += '<table style="width:100%;font-size:12px;border-collapse:collapse;margin-top:16px;">';
  html += '<tr style="background:#f8f9fa;"><th style="padding:8px;text-align:left;border-radius:6px 0 0 0;">Date</th><th style="padding:8px;text-align:right;">Total</th><th style="padding:8px;text-align:right;">New</th><th style="padding:8px;text-align:right;">Returning</th><th style="padding:8px;text-align:right;border-radius:0 6px 0 0;">Sessions</th></tr>';
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

  // Countries - Horizontal bars
  html += barSection('Visitor Countries (Yesterday)', countries, 'country', 'totalUsers', '#6c5ce7');

  // Medium - Horizontal bars
  html += barSection('Traffic Medium (Yesterday)', mediums, 'sessionMedium', 'totalUsers', '#e17055');

  // Source - Horizontal bars
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

  // Weekly Device comparison
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
  html += 'Auto-generated at 5:00 AM KST by KBBG GA4 Reporter<br>';
  html += '<a href="https://kbeautybuyersguide.com" style="color:#667eea;">kbeautybuyersguide.com</a>';
  html += '</div></div>';

  return html;
}

function barSection(title, data, dimKey, metricKey, color) {
  var html = '<div style="background:white;border-radius:16px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">';
  html += '<h2 style="font-size:16px;margin:0 0 16px;color:#2d3436;">' + title + '</h2>';
  if (data.length === 0) {
    html += '<p style="color:#b2bec3;font-size:13px;">No data</p></div>';
    return html;
  }
  var maxVal = 1;
  for (var i = 0; i < data.length; i++) {
    var v = Number(data[i][metricKey]);
    if (v > maxVal) maxVal = v;
  }
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
