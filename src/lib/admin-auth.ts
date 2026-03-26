// 관리자 인증 유틸리티 — localStorage 기반 토큰 관리
// 추후 Supabase Auth로 이관 가능한 구조로 설계

// 관리자 계정 하드코딩 — 이관 시 환경변수 또는 Supabase로 대체
export const ADMIN_CREDENTIALS = {
  id: "admin@2bstory.com",
  pw: "kbbg2026!admin",
} as const;

// localStorage 키 상수
const ADMIN_TOKEN_KEY = "admin_token";
const ADMIN_TOKEN_VALUE = "kbbg_admin_authenticated";

// 관리자 로그인 — 자격증명 검증 후 localStorage에 토큰 저장
export function loginAdmin(id: string, pw: string): boolean {
  if (id !== ADMIN_CREDENTIALS.id || pw !== ADMIN_CREDENTIALS.pw) return false;
  localStorage.setItem(ADMIN_TOKEN_KEY, ADMIN_TOKEN_VALUE);
  return true;
}

// 관리자 인증 상태 확인 — localStorage 토큰 존재 여부로 판단
export function checkAdminAuth(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ADMIN_TOKEN_KEY) === ADMIN_TOKEN_VALUE;
}

// 관리자 로그아웃 — localStorage 토큰 제거
export function logoutAdmin(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}
