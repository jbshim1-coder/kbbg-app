import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Google OAuth 콜백 처리 — code를 세션으로 교환
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // 쿠키에서 사용자의 마지막 locale 감지 (기본값: en)
  const cookieHeader = request.headers.get('cookie') || '';
  const localeMatch = cookieHeader.match(/NEXT_LOCALE=(\w+)/);
  const locale = localeMatch?.[1] || 'en';

  // OAuth 에러가 있으면 로그인 페이지로
  if (error) {
    return NextResponse.redirect(`${origin}/${locale}/login?error=${encodeURIComponent(errorDescription || error)}`)
  }

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { error: authError } = await supabase.auth.exchangeCodeForSession(code)

    if (!authError) {
      // next 파라미터가 있으면 해당 경로로 (관리자 로그인 등)
      const next = searchParams.get('next');
      const redirectPath = next && next.startsWith('/') ? next : `/${locale}`;
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }

    // 에러 메시지를 로그인 페이지에 전달
    return NextResponse.redirect(`${origin}/${locale}/login?error=${encodeURIComponent(authError.message)}`)
  }

  // code 없으면 로그인으로
  return NextResponse.redirect(`${origin}/${locale}/login?error=no_code`)
}
