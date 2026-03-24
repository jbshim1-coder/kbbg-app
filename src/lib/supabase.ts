// ============================================================
// Supabase 클라이언트 설정
// 서버 컴포넌트용 / 클라이언트 컴포넌트용 분리
// @supabase/ssr 패키지 사용 (Next.js App Router 권장 방식)
// ============================================================

import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// ============================================================
// 환경변수 — .env.local에 정의 필요
// NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
// NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
// ============================================================
// 환경변수 누락 시 런타임 에러 발생 (! 단언 사용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ============================================================
// 클라이언트 컴포넌트용 Supabase 클라이언트
// 'use client' 컴포넌트에서 직접 import하여 사용
// ============================================================
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// ============================================================
// 서버 컴포넌트용 Supabase 클라이언트
// Server Component, Route Handler, Server Action에서 사용
// 쿠키를 통해 세션을 읽고 갱신
// ============================================================
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      // 모든 쿠키 읽기 — 세션 복원에 사용
      getAll() {
        return cookieStore.getAll()
      },
      // 쿠키 쓰기 — Server Component에서는 불가하므로 try/catch로 무시
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Component에서는 쿠키 쓰기가 불가 — Middleware에서 처리
        }
      },
    },
  })
}

// ============================================================
// 관리자 작업용 Service Role 클라이언트
// RLS를 우회하므로 서버 사이드에서만 사용할 것
// 절대로 클라이언트에 노출 금지
// ============================================================
export function createServiceRoleClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // 서비스 롤 키 미설정 시 조기 에러 — 잘못된 권한으로 실행되는 것을 방지
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  return createBrowserClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,  // 서버 사이드에서는 토큰 자동 갱신 불필요
      persistSession: false,    // 세션 저장 불필요 (단발성 관리자 작업용)
    },
  })
}
