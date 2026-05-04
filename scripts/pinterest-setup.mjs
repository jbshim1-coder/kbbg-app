// Pinterest OAuth 설정 도우미
// 1단계: 인증 URL 생성 → 2단계: 코드로 토큰 교환 → 3단계: 보드 목록 조회
// 사용법:
//   node scripts/pinterest-setup.mjs auth          → 인증 URL 출력
//   node scripts/pinterest-setup.mjs token CODE    → 코드로 토큰 발급
//   node scripts/pinterest-setup.mjs boards        → 보드 목록 조회
//   node scripts/pinterest-setup.mjs test          → 핀 생성 테스트

const APP_ID = process.env.PINTEREST_APP_ID;
const APP_SECRET = process.env.PINTEREST_APP_SECRET;
const ACCESS_TOKEN = process.env.PINTEREST_ACCESS_TOKEN;
const API = "https://api.pinterest.com/v5";

const cmd = process.argv[2];
const arg = process.argv[3];

if (!cmd) {
  console.log(`
Pinterest 설정 도우미
=====================
1. node scripts/pinterest-setup.mjs auth        → 인증 URL 생성
2. 브라우저에서 URL 열고 → 승인 → redirect URL에서 code= 값 복사
3. node scripts/pinterest-setup.mjs token CODE   → 토큰 발급
4. .env.local에 PINTEREST_ACCESS_TOKEN, PINTEREST_REFRESH_TOKEN 추가
5. node scripts/pinterest-setup.mjs boards       → 보드 ID 확인
6. .env.local에 PINTEREST_BOARD_KBBG 등 추가
7. node scripts/pinterest-setup.mjs test         → 동작 테스트
  `);
  process.exit(0);
}

// 1단계: 인증 URL 생성
if (cmd === "auth") {
  if (!APP_ID) {
    console.error("PINTEREST_APP_ID가 .env.local에 없습니다.");
    console.log("\n먼저 https://developers.pinterest.com/apps/ 에서 앱을 만드세요.");
    process.exit(1);
  }
  // redirect_uri는 Pinterest 앱 설정에서 등록한 것과 동일해야 함
  const redirectUri = "https://kbeautybuyersguide.com/api/pinterest-callback";
  const url = `https://www.pinterest.com/oauth/?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=pins:read,pins:write,boards:read,boards:write&state=kbbg`;
  console.log("\n아래 URL을 브라우저에서 열고 Pinterest 로그인 후 승인하세요:");
  console.log("\n" + url);
  console.log("\n승인 후 redirect된 URL에서 ?code=XXXXX 부분을 복사하세요.");
  console.log("그 다음: node scripts/pinterest-setup.mjs token XXXXX");
}

// 2단계: 코드로 토큰 교환
if (cmd === "token") {
  if (!arg) { console.error("code를 인자로 입력하세요"); process.exit(1); }
  if (!APP_ID || !APP_SECRET) { console.error("PINTEREST_APP_ID, PINTEREST_APP_SECRET 필요"); process.exit(1); }

  const credentials = Buffer.from(`${APP_ID}:${APP_SECRET}`).toString("base64");
  const redirectUri = "https://kbeautybuyersguide.com/api/pinterest-callback";

  const res = await fetch(`${API}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: arg,
      redirect_uri: redirectUri,
      continuous_refresh: "true",
    }),
  });
  const data = await res.json();

  if (data.access_token) {
    console.log("\n=== 토큰 발급 성공 ===");
    console.log(`PINTEREST_ACCESS_TOKEN=${data.access_token}`);
    console.log(`PINTEREST_REFRESH_TOKEN=${data.refresh_token}`);
    console.log(`\n위 두 줄을 .env.local에 추가하세요.`);
  } else {
    console.error("토큰 발급 실패:", data);
  }
}

// 3단계: 보드 목록 조회
if (cmd === "boards") {
  if (!ACCESS_TOKEN) { console.error("PINTEREST_ACCESS_TOKEN 필요"); process.exit(1); }

  const res = await fetch(`${API}/boards?page_size=50`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });
  const data = await res.json();

  if (data.items) {
    console.log("\n=== Pinterest 보드 목록 ===");
    for (const board of data.items) {
      console.log(`  ${board.name} → ID: ${board.id}`);
    }
    console.log("\n위 ID를 .env.local에 추가하세요:");
    console.log("  PINTEREST_BOARD_KBBG=보드ID");
    console.log("  PINTEREST_BOARD_KSKINDAILY=보드ID");
    console.log("  PINTEREST_BOARD_DAILYHALLYUWAVE=보드ID");
    console.log("  PINTEREST_BOARD_KOREATRAVEL365=보드ID");
  } else {
    console.error("보드 조회 실패:", data);
  }
}

// 4단계: 테스트
if (cmd === "test") {
  if (!ACCESS_TOKEN) { console.error("PINTEREST_ACCESS_TOKEN 필요"); process.exit(1); }

  // 유저 정보 확인
  const res = await fetch(`${API}/user_account`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });
  const user = await res.json();
  if (user.username) {
    console.log(`\nPinterest 계정: ${user.username} (${user.account_type})`);
    console.log("API 연결 성공!");
  } else {
    console.error("API 연결 실패:", user);
  }
}
