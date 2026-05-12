// next-intl 미들웨어 - locale 기반 라우팅 처리
// 로그아웃 상태에서 /ko/ 접근 시 /en/으로 리다이렉트
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const intlMiddleware = createIntlMiddleware(routing);

// 서명 검증 없이 이메일을 추출할 수 없으므로 Supabase 서버 검증 사용
const MASTER_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || '')
    .split(',').map((e) => e.trim()).filter(Boolean)
);

async function getVerifiedEmail(request: NextRequest): Promise<string | null> {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll() { /* middleware는 읽기 전용 */ },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email ?? null;
  } catch {
    return null;
  }
}

export default async function middleware(request: NextRequest) {
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

    const email = await getVerifiedEmail(request);
    // 토큰 검증 실패 또는 마스터 어드민 아님 → 로그인으로
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
