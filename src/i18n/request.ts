// next-intl 요청별 설정 - 각 요청에서 locale과 messages를 반환
// Next.js App Router의 요청 컨텍스트에서 호출되며, 서버 컴포넌트에 번역 메시지를 주입
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // 요청된 locale 추출 (비동기 — Next.js 미들웨어가 URL에서 파싱한 값)
  let locale = await requestLocale;

  // 유효하지 않은 locale은 기본값(en)으로 폴백
  // routing.locales 배열에 없는 값이면 defaultLocale 사용
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    // 해당 locale의 번역 JSON 파일을 동적 import로 로드
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
