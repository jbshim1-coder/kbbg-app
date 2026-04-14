// 관리자 인증 유틸리티 — Supabase Auth 기반
// isMaster()로 관리자 이메일 확인, 서버/클라이언트 모두 사용 가능

import { isMaster } from "@/lib/level-system";

// 클라이언트: Supabase 세션에서 관리자 여부 확인
export async function checkAdminAuth(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const { createClient } = await import("@/lib/supabase");
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) return false;
  return isMaster(data.user.email);
}

// 클라이언트: 로그아웃
export async function logoutAdmin(): Promise<void> {
  const { createClient } = await import("@/lib/supabase");
  const supabase = createClient();
  await supabase.auth.signOut();
}

// 서버: API route에서 관리자 인증 검증
// 인증 실패 시 null, 성공 시 user email 반환
export async function verifyAdminFromRequest(): Promise<string | null> {
  const { createServerSupabaseClient } = await import("@/lib/supabase");
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) return null;
  if (!isMaster(data.user.email)) return null;
  return data.user.email;
}
