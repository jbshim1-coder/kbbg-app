// next-intl 미들웨어 - locale 기반 라우팅 처리
// 요청 URL에서 locale을 감지하고, 없으면 Accept-Language 헤더 기반으로 리다이렉트
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// routing 설정을 기반으로 next-intl 미들웨어 생성
export default createMiddleware(routing);

export const config = {
  // next-intl이 처리해야 할 경로 패턴
  // _next/static, _next/image, favicon.ico, 확장자 있는 정적 파일은 제외
  matcher: [
    // 루트 경로 및 locale prefix가 있는 모든 경로 처리
    // auth 콜백 경로는 locale 처리에서 제외
    '/((?!api|auth|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
