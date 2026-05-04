// GA4 OAuth 인증 — 최초 1회만 실행
// 사용법: node scripts/ga4-auth.mjs
// 브라우저에서 구글 로그인 → 토큰 저장

import { google } from "googleapis";
import http from "http";
import { writeFileSync } from "fs";

const CLIENT_ID = process.env.GA4_CLIENT_ID;
const CLIENT_SECRET = process.env.GA4_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3333/callback";

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["https://www.googleapis.com/auth/analytics.readonly"],
});

console.log("\n========================================");
console.log("아래 URL을 브라우저에 붙여넣고 구글 로그인하세요:");
console.log("========================================\n");
console.log(authUrl);
console.log("\n로그인 후 자동으로 토큰이 저장됩니다. 기다려주세요...\n");

// 콜백 서버
const server = http.createServer(async (req, res) => {
  if (!req.url?.startsWith("/callback")) return;
  const url = new URL(req.url, "http://localhost:3333");
  const code = url.searchParams.get("code");

  if (!code) {
    res.end("Error: no code");
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    writeFileSync(
      new URL("../ga4-tokens.json", import.meta.url),
      JSON.stringify(tokens, null, 2)
    );
    console.log("\n✅ 토큰 저장 완료! (ga4-tokens.json)");
    console.log("이제 이 터미널을 닫아도 됩니다.\n");
    res.end("✅ 인증 완료! 이 창을 닫아도 됩니다.");
  } catch (err) {
    console.error("토큰 발급 실패:", err.message);
    res.end("Error: " + err.message);
  }

  server.close();
});

server.listen(3333, () => {
  console.log("콜백 서버 대기중 (localhost:3333)...");
});
