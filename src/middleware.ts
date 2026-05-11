// next-intl 미들웨어 - locale 기반 라우팅 처리
// 로그아웃 상태에서 /ko/ 접근 시 /en/으로 리다이렉트
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createIntlMiddleware(routing);

// ADMIN_EMAILS env가 없을 때 기본값
const MASTER_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || 'admin@kbeautybuyersguide.com,jbshim1@gmail.com')
    .split(',').map((e) => e.trim())
);

// Supabase 쿠키에서 JWT payload의 email 추출 (네트워크 호출 없이 로컬 디코딩)
function getEmailFromCookies(request: NextRequest): string | null {
  try {
    const tokenCookies = request.cookies.getAll()
      .filter((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'))
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const cookie of tokenCookies) {
      try {
        let value = cookie.value;
        // @supabase/ssr가 JSON으로 감쌀 때 access_token 추출
        try {
          const parsed = JSON.parse(decodeURIComponent(value));
          const at = parsed?.access_token ?? parsed?.[0]?.access_token;
          if (at) value = at;
        } catch { /* not JSON */ }

        const parts = value.split('.');
        if (parts.length !== 3) continue;
        const pad = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(pad));
        if (payload?.email) return payload.email as string;
      } catch { /* skip malformed */ }
    }
    return null;
  } catch {
    return null;
  }
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin 직접 접근 차단 → locale 기반 관리자 페이지로 리다이렉트
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const url = request.nextUrl.clone();
    url.pathname = `/en/admin${pathname.replace(/^\/admin/, '')}`;
    return NextResponse.redirect(url);
  }

  // 관리자 페이지 서버 사이드 인증 — 로그인 페이지는 제외 (H2)
  const adminMatch = pathname.match(/^\/\w{2}\/admin(?:\/|$)/);
  if (adminMatch && !pathname.includes('/admin/login')) {
    const locale = pathname.split('/')[1] || 'en';
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/admin/login`;

    const email = getEmailFromCookies(request);
    // 쿠키 없음 또는 마스터 어드민 아님 → 로그인으로
    if (!email || !MASTER_EMAILS.has(email)) {
      return NextResponse.redirect(loginUrl);
    }
  }

  // /ko/ 경로 접근 시 로그인 여부 확인
  if (pathname === '/ko' || pathname.startsWith('/ko/')) {
    // 최신 @supabase/ssr 은 토큰이 크면 쿠키를 쪼개 저장함 → `.0`, `.1` 청크도 인증으로 인정
    const hasAuthToken = request.cookies.getAll().some(
      (c) => c.name.startsWith('sb-') && c.name.includes('-auth-token')
    );

    if (!hasAuthToken) {
      const newPath = pathname.replace(/^\/ko/, '/en') || '/en';
      const url = request.nextUrl.clone();
      url.pathname = newPath;
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // next-intl이 처리해야 할 경로 패턴
  // _next/static, _next/image, favicon.ico, 확장자 있는 정적 파일은 제외
  matcher: [
    '/((?!api|auth|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
