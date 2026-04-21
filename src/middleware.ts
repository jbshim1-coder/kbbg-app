// next-intl 미들웨어 - locale 기반 라우팅 처리
// 로그아웃 상태에서 /ko/ 접근 시 /en/으로 리다이렉트
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createIntlMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin 직접 접근 차단 → locale 기반 관리자 페이지로 리다이렉트
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const url = request.nextUrl.clone();
    url.pathname = `/en/admin${pathname.replace(/^\/admin/, '')}`;
    return NextResponse.redirect(url);
  }

  // 관리자 페이지 서버 사이드 인증 — 로그인 페이지는 제외
  const adminMatch = pathname.match(/^\/\w{2}\/admin(?:\/|$)/);
  if (adminMatch && !pathname.includes('/admin/login')) {
    const hasAuthToken = request.cookies.getAll().some(
      (c) => c.name.startsWith('sb-') && c.name.includes('-auth-token')
    );
    if (!hasAuthToken) {
      const locale = pathname.split('/')[1] || 'en';
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/admin/login`;
      return NextResponse.redirect(url);
    }
  }

  // /ko/ 경로 접근 시 로그인 여부 확인
  if (pathname === '/ko' || pathname.startsWith('/ko/')) {
    // Supabase auth 쿠키로 로그인 상태 판별
    // 최신 @supabase/ssr 은 토큰이 크면 쿠키를 쪼개 저장함 → `.0`, `.1` 청크도 인증으로 인정
    const hasAuthToken = request.cookies.getAll().some(
      (c) => c.name.startsWith('sb-') && c.name.includes('-auth-token')
    );

    if (!hasAuthToken) {
      // 로그아웃 상태 → /en/ 으로 리다이렉트
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
