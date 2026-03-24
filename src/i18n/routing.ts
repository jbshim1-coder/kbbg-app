// next-intl 라우팅 설정 - 지원 언어 및 기본 언어 정의
// 이 설정은 미들웨어와 request.ts에서 공통으로 참조됨
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // 지원하는 7개 언어: 영어, 중국어, 일본어, 러시아어, 베트남어, 태국어, 몽골어
  locales: ['en', 'zh', 'ja', 'ru', 'vi', 'th', 'mn'] as const,

  // 기본 언어는 영어 — locale 감지 실패 시 폴백
  defaultLocale: 'en',

  // 모든 언어에 locale prefix 적용 (예: /en/..., /zh/...)
  // 'as-needed'로 변경하면 기본 언어(en)는 prefix 없이 접근 가능
  localePrefix: 'always',
});

// 지원 locale 유니온 타입 — 타입 안전한 locale 처리에 사용
export type Locale = (typeof routing.locales)[number];
