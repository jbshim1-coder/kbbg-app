// Google 색인 알림 스크립트
// 새 URL을 Google Indexing API에 즉시 색인 요청
// 사용법: node scripts/google-index-notify.mjs <url>
// 환경변수: GOOGLE_SERVICE_ACCOUNT_PATH (서비스 계정 JSON 파일 경로)

import { readFileSync, existsSync } from "fs";
import { GoogleAuth } from "google-auth-library";

const INDEXING_API_ENDPOINT = "https://indexing.googleapis.com/v3/urlNotifications:publish";
const SCOPES = ["https://www.googleapis.com/auth/indexing"];

// IndexNow — Bing/Yandex 즉시 색인 프로토콜 (Google ping은 2023년 폐기됨)
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

// 사이트별 도메인 → IndexNow 키 매핑
// IndexNow 키는 https://www.indexnow.org/ 에서 발급 후 .env.local에 추가
const SITE_INDEXNOW = {
  "kbeautybuyersguide.com": process.env.INDEXNOW_KEY_KBBG,
  "kskindaily.com":         process.env.INDEXNOW_KEY_KSKINDAILY,
  "koreatravel365.com":     process.env.INDEXNOW_KEY_KOREATRAVEL,
  "dailyhallyuwave.com":    process.env.INDEXNOW_KEY_HALLYU,
};

// ─── IndexNow (Bing/Yandex 즉시 색인 알림) ────────────────────────────
export async function pingSitemaps(siteId) {
  // 키 없으면 조용히 스킵 (설정 전까지 오류 없이 진행)
  const domain = getSiteDomain(siteId || "kbbg");
  const key = SITE_INDEXNOW[domain];
  if (!key) return;

  const sitemapUrl = `https://${domain}/sitemap.xml`;
  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host: domain, key, urlList: [sitemapUrl] }),
    });
    console.log(`IndexNow ping: ${domain} → ${res.status}`);
  } catch (e) {
    console.log(`IndexNow ping failed (non-critical): ${e.message}`);
  }
}

function getSiteDomain(siteId) {
  const map = {
    kbbg: "kbeautybuyersguide.com",
    kskindaily: "kskindaily.com",
    koreatravel365: "koreatravel365.com",
    dailyhallyuwave: "dailyhallyuwave.com",
  };
  return map[siteId] || "";
}

// ─── Google Indexing API 색인 요청 ────────────────────────────────────
export async function notifyGoogleIndexing(pageUrl) {
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;

  // 서비스 계정 키 파일 없으면 스킵 (설정 안 된 환경에서 graceful fallback)
  if (!keyPath) {
    console.log("Indexing API not configured (GOOGLE_SERVICE_ACCOUNT_PATH not set)");
    return;
  }
  if (!existsSync(keyPath)) {
    console.log("Indexing API not configured (service account key file not found)");
    return;
  }

  try {
    const keyFile = JSON.parse(readFileSync(keyPath, "utf8"));
    const auth = new GoogleAuth({ credentials: keyFile, scopes: SCOPES });
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const res = await fetch(INDEXING_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.token}`,
      },
      body: JSON.stringify({ url: pageUrl, type: "URL_UPDATED" }),
    });

    const body = await res.json();
    if (res.ok) {
      console.log(`Indexing API: ${pageUrl} → 색인 요청 완료`);
    } else {
      // API 오류도 치명적이지 않으므로 경고만 출력
      console.log(`Indexing API warning: ${body.error?.message || JSON.stringify(body)}`);
    }
  } catch (e) {
    console.log(`Indexing API error (non-critical): ${e.message}`);
  }
}

// ─── 단독 실행 시 CLI 모드 ────────────────────────────────────────────
const isMain = process.argv[1]?.endsWith("google-index-notify.mjs");
if (isMain) {
  const urlArg = process.argv[2];
  if (!urlArg) {
    console.error("Usage: node scripts/google-index-notify.mjs <url>");
    process.exit(1);
  }
  await notifyGoogleIndexing(urlArg);
}
