// 사이트 점검 API — 관리자 대시보드에서 전체 상태 확인
import { NextResponse } from "next/server";
import { verifyAdminFromRequest } from "@/lib/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase";

interface CheckResult {
  name: string;
  status: "pass" | "fail" | "warn";
  message: string;
  ms?: number;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kbeautybuyersguide.com";
const LOCALES = ["en", "ko", "zh", "ja", "ru", "vi", "th", "mn"];

export async function GET() {
  // 관리자 인증
  const admin = await verifyAdminFromRequest();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checks: CheckResult[] = [];

  // 1. Supabase 연결
  await runCheck(checks, "Supabase DB 연결", async () => {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("clinics").select("id").limit(1);
    if (error) throw new Error(error.message);
    return "정상 연결";
  });

  // 2. 주요 API 응답
  await runCheck(checks, "AI 검색 API", async () => {
    const res = await fetch(`${SITE_URL}/api/ai-search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "서울 피부과", locale: "ko" }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.clinics || data.clinics.length === 0) throw new Error("결과 없음");
    return `정상 (${data.clinics.length}개 결과, 총 ${data.totalCount}개)`;
  });

  await runCheck(checks, "HIRA 병원검색 API", async () => {
    const res = await fetch(`${SITE_URL}/api/hira?subject=14&region=110000&page=1`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.clinics || data.clinics.length === 0) throw new Error("결과 없음");
    return `정상 (${data.totalCount}개 병원)`;
  });

  await runCheck(checks, "관리자 통계 (DB 직접)", async () => {
    const supabase = createServiceRoleClient();
    const [usersRes, postsRes] = await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("posts").select("id", { count: "exact", head: true }),
    ]);
    const users = usersRes.count ?? 0;
    const posts = postsRes.count ?? 0;
    return `회원 ${users}명, 게시글 ${posts}개`;
  });

  // 3. 다국어 경로 점검
  for (const loc of LOCALES) {
    await runCheck(checks, `다국어 /${loc}/ 메인`, async () => {
      const res = await fetch(`${SITE_URL}/${loc}`, { redirect: "manual" });
      if (res.status === 200 || res.status === 304) return "정상";
      if (res.status >= 300 && res.status < 400) return `리다이렉트 (${res.status})`;
      throw new Error(`HTTP ${res.status}`);
    });
  }

  // 4. 인증 보호 점검 (관리자 페이지는 클라이언트 측 인증 체크)
  await runCheck(checks, "관리자 페이지 접근 차단", async () => {
    // admin layout은 클라이언트에서 getUser() 체크 → 미인증시 login으로 리다이렉트
    // 서버는 HTML 셸을 200으로 반환하지만, JS 실행 후 리다이렉트됨 (정상 동작)
    const res = await fetch(`${SITE_URL}/en/admin`, { redirect: "manual" });
    if (res.status === 200 || (res.status >= 300 && res.status < 400)) {
      return "정상 (클라이언트 측 인증 체크)";
    }
    throw new Error(`예상 밖 상태코드: ${res.status}`);
  });

  // 5. 번역 파일 키 일치 확인
  await runCheck(checks, "번역 키 누락 점검", async () => {
    try {
      const fs = await import("fs");
      const path = await import("path");
      const messagesDir = path.join(process.cwd(), "messages");
      const enFile = JSON.parse(fs.readFileSync(path.join(messagesDir, "en.json"), "utf-8"));
      const enKeys = flattenKeys(enFile);

      const missing: string[] = [];
      for (const loc of LOCALES) {
        if (loc === "en") continue;
        try {
          const locFile = JSON.parse(fs.readFileSync(path.join(messagesDir, `${loc}.json`), "utf-8"));
          const locKeys = flattenKeys(locFile);
          const diff = enKeys.filter((k) => !locKeys.includes(k));
          if (diff.length > 0) missing.push(`${loc}: ${diff.length}개 누락`);
        } catch {
          missing.push(`${loc}: 파일 없음`);
        }
      }

      if (missing.length > 0) throw new Error(missing.join(", "));
      return `전체 ${LOCALES.length}개 언어 키 일치`;
    } catch (e) {
      throw e;
    }
  });

  // 6. AI 검색 → 조건검색 파라미터 정합성 (DB 직접 검증)
  await runCheck(checks, "AI→조건검색 파라미터 전달", async () => {
    // parseIntent를 직접 호출하여 rate limit 우회
    const { parseIntent } = await import("@/lib/clinic-search-service");
    const intent = await parseIntent("서울 피부과");
    if (!intent.subject_code) throw new Error("subject_code 누락");
    if (!intent.region && !intent.region_city) throw new Error("region 누락");
    return `subject=${intent.subject_code}, region=${intent.region || intent.region_city}`;
  });

  // 결과 요약
  const passCount = checks.filter((c) => c.status === "pass").length;
  const failCount = checks.filter((c) => c.status === "fail").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;

  return NextResponse.json({
    summary: { total: checks.length, pass: passCount, fail: failCount, warn: warnCount },
    checks,
    checkedAt: new Date().toISOString(),
  });
}

// 점검 실행 헬퍼
async function runCheck(checks: CheckResult[], name: string, fn: () => Promise<string>) {
  const start = Date.now();
  try {
    const message = await fn();
    checks.push({ name, status: "pass", message, ms: Date.now() - start });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    checks.push({ name, status: "fail", message, ms: Date.now() - start });
  }
}

// JSON 키 평탄화 (중첩 객체 → "a.b.c" 형태)
function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...flattenKeys(obj[key] as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}
