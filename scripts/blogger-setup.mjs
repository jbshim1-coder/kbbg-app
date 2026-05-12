// Blogger OAuth 초기 설정 — 최초 1회만 실행
// 사용법: node scripts/blogger-setup.mjs
//
// 사전 준비:
// 1. Google Cloud Console → APIs & Services → Blogger API 활성화
// 2. OAuth 2.0 클라이언트 ID 생성 (데스크톱 앱 유형)
// 3. 클라이언트 ID/Secret을 .env.local에 추가
//    BLOGGER_CLIENT_ID=...
//    BLOGGER_CLIENT_SECRET=...

import { OAuth2Client } from "google-auth-library";
import { createInterface } from "readline";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = join(__dirname, "../.env.local");

const CLIENT_ID = process.env.BLOGGER_CLIENT_ID;
const CLIENT_SECRET = process.env.BLOGGER_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ .env.local에 BLOGGER_CLIENT_ID, BLOGGER_CLIENT_SECRET을 먼저 설정하세요.");
  process.exit(1);
}

const oauth2 = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, "urn:ietf:wg:oauth:2.0:oob");

const authUrl = oauth2.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/blogger"],
  prompt: "consent",
});

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🔑 아래 URL을 브라우저에서 열어 구글 계정으로 로그인하세요:");
console.log("\n" + authUrl + "\n");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

const rl = createInterface({ input: process.stdin, output: process.stdout });
rl.question("인증 후 나타난 코드를 붙여넣으세요: ", async (code) => {
  rl.close();
  try {
    const { tokens } = await oauth2.getToken(code.trim());
    const refreshToken = tokens.refresh_token;

    if (!refreshToken) {
      console.error("❌ refresh_token이 없습니다. 위 URL에서 '액세스 허용'을 다시 클릭하세요.");
      process.exit(1);
    }

    // .env.local에 refresh token 추가
    let envContent = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, "utf8") : "";
    if (envContent.includes("BLOGGER_REFRESH_TOKEN=")) {
      envContent = envContent.replace(/^BLOGGER_REFRESH_TOKEN=.*$/m, `BLOGGER_REFRESH_TOKEN=${refreshToken}`);
    } else {
      envContent += `\nBLOGGER_REFRESH_TOKEN=${refreshToken}\n`;
    }
    writeFileSync(ENV_PATH, envContent);

    console.log("✅ BLOGGER_REFRESH_TOKEN이 .env.local에 저장되었습니다.");

    // Blogger 블로그 목록 조회
    oauth2.setCredentials(tokens);
    const token = await oauth2.getAccessToken();
    const res = await fetch("https://www.googleapis.com/blogger/v3/users/self/blogs", {
      headers: { Authorization: `Bearer ${token.token}` },
    });
    const data = await res.json();
    if (data.items?.length) {
      console.log("\n📋 연결된 Blogger 블로그 목록:");
      data.items.forEach(b => console.log(`  - ${b.name}: ${b.id}  (${b.url})`));
      console.log("\n위 Blog ID를 .env.local에 추가하세요:");
      console.log("  BLOGGER_ID_KBBG=<kbbg용 Blog ID>");
      console.log("  BLOGGER_ID_KSKINDAILY=<kskindaily용 Blog ID>");
      console.log("  BLOGGER_ID_HALLYU=<dailyhallyuwave용 Blog ID>");
      console.log("  BLOGGER_ID_KOREATRAVEL=<koreatravel365용 Blog ID>\n");
    } else {
      console.log("\n⚠️  Blogger 블로그가 없습니다. blogger.com에서 먼저 블로그를 4개 만드세요.");
    }
  } catch (e) {
    console.error("❌ 오류:", e.message);
  }
});
