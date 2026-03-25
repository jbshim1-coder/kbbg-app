import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Google OAuth 콜백 처리 — code를 세션으로 교환
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // OAuth 에러가 있으면 로그인 페이지로
  if (error) {
    return NextResponse.redirect(`${origin}/en/login?error=${encodeURIComponent(errorDescription || error)}`)
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
      return NextResponse.redirect(`${origin}/en`)
    }

    // 에러 메시지를 로그인 페이지에 전달
    return NextResponse.redirect(`${origin}/en/login?error=${encodeURIComponent(authError.message)}`)
  }

  // code 없으면 로그인으로
  return NextResponse.redirect(`${origin}/en/login?error=no_code`)
}
