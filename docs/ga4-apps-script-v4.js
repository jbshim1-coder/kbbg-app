var GA4_PROPERTY_ID = '530256659';
var REPORT_EMAIL = 'help@2bstory.com';

function sendDailyReport() {
  var today = new Date();
  var yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  var weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7);
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
  var byPage = runReport(weekAgoStr, yesterdayStr, ['pageTitle', 'pagePath'], ['totalUsers', 'screenPageViews'], 10);

  var html = buildReport(yesterdayStr, weekAgoStr, core, dailyTrend, byCountry, byMedium, bySource, byReferrer, byDevice, weekDevice, byPage);
  MailApp.sendEmail({ to: REPORT_EMAIL, subject: '[KBBG] Daily Report - ' + yesterdayStr, htmlBody: html });
}

function runReport(startDate, endDate, dimensions, metrics, limit) {
  var request = { dateRanges: [{ startDate: startDate, endDate: endDate }], metrics: metrics.map(function(m) { return { name: m }; }) };
  if (dimensions.length > 0) { request.dimensions = dimensions.map(function(d) { return { name: d }; }); request.orderBys = [{ metric: { metricName: metrics[0] }, desc: true }]; }
  if (limit) { request.limit = limit; }
  var response = AnalyticsData.Properties.runReport(request, 'properties/' + GA4_PROPERTY_ID);
  return parseResponse(response, dimensions, metrics);
}

function parseResponse(response, dimensions, metrics) {
  var rows = [];
  if (!response.rows) return rows;
  for (var r = 0; r < response.rows.length; r++) {
    var obj = {}, row = response.rows[r];
    if (dimensions.length > 0) { for (var d = 0; d < row.dimensionValues.length; d++) { obj[dimensions[d]] = row.dimensionValues[d].value; } }
    for (var m = 0; m < row.metricValues.length; m++) { obj[metrics[m]] = row.metricValues[m].value; }
    rows.push(obj);
  }
  return rows;
}

function buildReport(date, weekAgoStr, core, trend, countries, mediums, sources, referrers, devices, weekDevices, pages) {
  var c = core[0] || {};
  var totalUsers = Number(c.totalUsers||0), newUsers = Number(c.newUsers||0), returning = totalUsers - newUsers;
  var sessions = Number(c.sessions||0), pageviews = Number(c.screenPageViews||0), duration = Number(c.averageSessionDuration||0);
  var mins = Math.floor(duration/60), secs = Math.floor(duration%60);
  var deviceColors = { desktop: '#4361ee', mobile: '#e17055', tablet: '#00b894' };

  var html = '<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:680px;margin:0 auto;background:#f0f2f5;padding:24px;">';
  html += '<div style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:28px;border-radius:20px;margin-bottom:20px;"><h1 style="margin:0;font-size:22px;font-weight:700;">KBBG Daily Analytics</h1><p style="margin:6px 0 0;opacity:0.8;font-size:14px;">' + date + ' Report</p></div>';
  html += '<div style="display:flex;gap:12px;margin-bottom:12px;">' + bigCard('Total Visitors',totalUsers,'#4361ee') + bigCard('New Visitors',newUsers,'#00b894') + bigCard('Returning',returning,'#e17055') + '</div>';
  html += '<div style="display:flex;gap:12px;margin-bottom:20px;">' + bigCard('Sessions',sessions,'#6c5ce7') + bigCard('Pageviews',pageviews,'#0984e3') + bigCard('Avg Duration',mins+'m '+secs+'s','#fdcb6e') + '</div>';

  // 인기 페이지 TOP 10
  html += '<div style="background:white;border-radius:16px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);"><h2 style="font-size:16px;margin:0 0 4px;color:#2d3436;">📊 Top Pages (7일간 방문자수)</h2><p style="font-size:11px;color:#b2bec3;margin:0 0 16px;">' + weekAgoStr + ' ~ ' + date + '</p>';
  if (pages.length === 0) { html += '<p style="color:#b2bec3;font-size:13px;">No data</p>'; }
  else {
    var maxU = 1; for (var pi = 0; pi < pages.length; pi++) { if (Number(pages[pi].totalUsers) > maxU) maxU = Number(pages[pi].totalUsers); }
    html += '<table style="width:100%;font-size:12px;border-collapse:collapse;"><tr style="background:#f8f9fa;"><th style="padding:8px;text-align:left;">페이지</th><th style="padding:8px;text-align:right;">방문자</th><th style="padding:8px;text-align:right;">뷰</th></tr>';
    for (var pj = 0; pj < pages.length; pj++) {
      var pg = pages[pj], title = (pg.pageTitle||'(no title)').substring(0,40), path = (pg.pagePath||'').replace(/\?.*$/,'').substring(0,40);
      var pu = Number(pg.totalUsers||0), pv = Number(pg.screenPageViews||0), pct = (pu/maxU*100).toFixed(0), rbg = pj%2===0?'white':'#fafbfc';
      html += '<tr style="background:'+rbg+';"><td style="padding:8px;border-top:1px solid #eee;"><div style="font-weight:500;color:#2d3436;">'+title+'</div><div style="font-size:11px;color:#b2bec3;">'+path+'</div><div style="height:3px;background:#f0f2f5;border-radius:2px;margin-top:4px;"><div style="width:'+pct+'%;background:#0984e3;height:100%;border-radius:2px;"></div></div></td><td style="padding:8px;border-top:1px solid #eee;text-align:right;font-weight:700;color:#0984e3;">'+pu+'</td><td style="padding:8px;border-top:1px solid #eee;text-align:right;color:#636e72;">'+pv+'</td></tr>';
    }
    html += '</table>';
  }
  html += '</div>';

  // Device
  html += '<div style="background:white;border-radius:16px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);"><h2 style="font-size:16px;margin:0 0 16px;color:#2d3436;">Device Breakdown (Yesterday)</h2>';
  var dt = 0; for (var di = 0; di < devices.length; di++) { dt += Number(devices[di].totalUsers); } if (dt===0) dt=1;
  for (var dj = 0; dj < devices.length; dj++) { var dv=devices[dj], du=Number(dv.totalUsers), dp=(du/dt*100).toFixed(1), dc=deviceColors[dv.deviceCategory.toLowerCase()]||'#636e72', dl=dv.deviceCategory==='desktop'?'PC/Desktop':dv.deviceCategory.charAt(0).toUpperCase()+dv.deviceCategory.slice(1); html+='<div style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:13px;"><span style="font-weight:600;color:#2d3436;">'+dl+'</span><span style="color:#636e72;">'+du+' users ('+dp+'%)</span></div><div style="background:#f0f2f5;border-radius:8px;height:24px;overflow:hidden;"><div style="width:'+dp+'%;background:'+dc+';height:100%;border-radius:8px;"></div></div></div>'; }
  html += '</div>';

  // 7-Day Trend
  html += '<div style="background:white;border-radius:16px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);"><h2 style="font-size:16px;margin:0 0 16px;color:#2d3436;">7-Day Visitor Trend</h2>';
  trend.sort(function(a,b){return a.date.localeCompare(b.date);});
  var mt=1; for (var ti=0;ti<trend.length;ti++){if(Number(trend[ti].totalUsers)>mt)mt=Number(trend[ti].totalUsers);}
  for (var tj=0;tj<trend.length;tj++){var tr=trend[tj],tl=tr.date.substring(4,6)+'/'+tr.date.substring(6,8),tt=Number(tr.totalUsers),tn=Number(tr.newUsers),tp=(tt/mt*100).toFixed(0),tnp=(tn/mt*100).toFixed(0);html+='<div style="display:flex;align-items:center;margin-bottom:8px;"><span style="width:45px;font-size:12px;color:#636e72;font-weight:500;">'+tl+'</span><div style="flex:1;position:relative;height:28px;"><div style="position:absolute;top:0;left:0;width:'+tp+'%;background:linear-gradient(90deg,#4361ee,#667eea);height:100%;border-radius:6px;"></div><div style="position:absolute;top:0;left:0;width:'+tnp+'%;background:rgba(0,184,148,0.6);height:100%;border-radius:6px 0 0 6px;"></div></div><span style="width:60px;text-align:right;font-size:12px;font-weight:600;color:#2d3436;margin-left:8px;">'+tt+'</span></div>';}
  html+='<table style="width:100%;font-size:12px;border-collapse:collapse;margin-top:16px;"><tr style="background:#f8f9fa;"><th style="padding:8px;text-align:left;">Date</th><th style="padding:8px;text-align:right;">Total</th><th style="padding:8px;text-align:right;">New</th><th style="padding:8px;text-align:right;">Returning</th><th style="padding:8px;text-align:right;">Sessions</th></tr>';
  for(var tk=0;tk<trend.length;tk++){var trow=trend[tk],tdd=trow.date,tdf=tdd.substring(0,4)+'-'+tdd.substring(4,6)+'-'+tdd.substring(6,8),tTot=Number(trow.totalUsers),tNw=Number(trow.newUsers);html+='<tr><td style="padding:8px;border-top:1px solid #eee;">'+tdf+'</td><td style="padding:8px;border-top:1px solid #eee;text-align:right;font-weight:600;">'+tTot+'</td><td style="padding:8px;border-top:1px solid #eee;text-align:right;color:#00b894;">'+tNw+'</td><td style="padding:8px;border-top:1px solid #eee;text-align:right;color:#e17055;">'+(tTot-tNw)+'</td><td style="padding:8px;border-top:1px solid #eee;text-align:right;">'+trow.sessions+'</td></tr>';}
  html+='</table></div>';

  html += barSection('Visitor Countries (Yesterday)', countries, 'country', 'totalUsers', '#6c5ce7');
  html += barSection('Traffic Medium (Yesterday)', mediums, 'sessionMedium', 'totalUsers', '#e17055');
  html += barSection('Traffic Source (Yesterday)', sources, 'sessionSource', 'totalUsers', '#00b894');

  html += '<div style="background:white;border-radius:16px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);"><h2 style="font-size:16px;margin:0 0 16px;color:#2d3436;">Referral URLs (Yesterday)</h2>';
  if(referrers.length===0){html+='<p style="color:#b2bec3;font-size:13px;">No referral data</p>';}
  else{html+='<table style="width:100%;font-size:12px;border-collapse:collapse;"><tr style="background:#f8f9fa;"><th style="padding:8px;text-align:left;">URL</th><th style="padding:8px;text-align:right;">Users</th><th style="padding:8px;text-align:right;">Views</th></tr>';for(var ri=0;ri<referrers.length;ri++){var ref=referrers[ri],ru=(ref.pageReferrer||'(direct)').substring(0,60);html+='<tr><td style="padding:8px;border-top:1px solid #eee;color:#0984e3;word-break:break-all;">'+ru+'</td><td style="padding:8px;border-top:1px solid #eee;text-align:right;font-weight:600;">'+ref.totalUsers+'</td><td style="padding:8px;border-top:1px solid #eee;text-align:right;">'+ref.screenPageViews+'</td></tr>';}html+='</table>';}
  html+='</div>';

  html+='<div style="background:white;border-radius:16px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);"><h2 style="font-size:16px;margin:0 0 16px;color:#2d3436;">Device Breakdown (7 Days)</h2>';
  var wt=0;for(var wi=0;wi<weekDevices.length;wi++){wt+=Number(weekDevices[wi].totalUsers);}if(wt===0)wt=1;
  for(var wj=0;wj<weekDevices.length;wj++){var wd=weekDevices[wj],wu=Number(wd.totalUsers),wp=(wu/wt*100).toFixed(1),wc=deviceColors[wd.deviceCategory.toLowerCase()]||'#636e72',wl=wd.deviceCategory==='desktop'?'PC/Desktop':wd.deviceCategory.charAt(0).toUpperCase()+wd.deviceCategory.slice(1);html+='<div style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:13px;"><span style="font-weight:600;color:#2d3436;">'+wl+'</span><span style="color:#636e72;">'+wu+' users ('+wp+'%)</span></div><div style="background:#f0f2f5;border-radius:8px;height:24px;overflow:hidden;"><div style="width:'+wp+'%;background:'+wc+';height:100%;border-radius:8px;"></div></div></div>';}
  html+='</div>';
  html+='<div style="text-align:center;padding:16px;font-size:11px;color:#b2bec3;">Auto-generated at 5:00 AM KST by KBBG Analytics Reporter<br><a href="https://kbeautybuyersguide.com" style="color:#667eea;">kbeautybuyersguide.com</a></div></div>';
  return html;
}

function barSection(title, data, dimKey, metricKey, color) {
  var html='<div style="background:white;border-radius:16px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);"><h2 style="font-size:16px;margin:0 0 16px;color:#2d3436;">'+title+'</h2>';
  if(data.length===0){return html+'<p style="color:#b2bec3;font-size:13px;">No data</p></div>';}
  var mv=1;for(var i=0;i<data.length;i++){if(Number(data[i][metricKey])>mv)mv=Number(data[i][metricKey]);}
  for(var j=0;j<data.length;j++){var row=data[j],val=Number(row[metricKey]),pct=(val/mv*100).toFixed(0),lbl=(row[dimKey]||'(not set)').substring(0,40);html+='<div style="margin-bottom:10px;"><div style="display:flex;justify-content:space-between;margin-bottom:3px;font-size:12px;"><span style="color:#2d3436;">'+lbl+'</span><span style="font-weight:600;color:#2d3436;">'+val+'</span></div><div style="background:#f0f2f5;border-radius:6px;height:18px;overflow:hidden;"><div style="width:'+pct+'%;background:'+color+';height:100%;border-radius:6px;"></div></div></div>';}
  return html+'</div>';
}

function bigCard(label, value, color) {
  return '<div style="flex:1;background:white;border-radius:14px;padding:18px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.04);"><div style="font-size:28px;font-weight:800;color:'+color+';">'+value+'</div><div style="font-size:12px;color:#636e72;margin-top:6px;">'+label+'</div></div>';
}

function formatDate(d) {
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

function createDailyTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) { if (triggers[i].getHandlerFunction()==='sendDailyReport') { ScriptApp.deleteTrigger(triggers[i]); } }
  ScriptApp.newTrigger('sendDailyReport').timeBased().everyDays(1).atHour(20).create();
}
