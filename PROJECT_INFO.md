# kbbg-app — K-Beauty Buyers Guide (한국 뷰티/의료 병원 추천 플랫폼)

## 배포 URL
- **Vercel**: https://kbeautybuyersguide.com

## GitHub
- https://github.com/jbshim1-coder/kbbg-app (Private)

## 연동된 외부 서비스
- **Supabase**: 데이터베이스, 인증 (https://appqwvuseeenbmgoacrz.supabase.co)
- **심평원(HIRA) API**: 병원 공공데이터 수집 (매일 자동 동기화)
- **OpenAI API**: GPT-4o-mini (자연어 검색 의도 추출)
- **Anthropic API**: Claude Sonnet (병원 추천 설명 생성)
- **Google Places API**: 구글 별점/리뷰 조회
- **네이버 검색 API**: 블로그 화제성 조회
- **Google Analytics**: G-H3TFLPL00B

## 환경변수
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_CONTACT_EMAIL`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `HIRA_API_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_PLACES_API_KEY`
- `NAVER_CLIENT_ID`
- `NAVER_CLIENT_SECRET`
- `CRON_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

## 주요 기능
- AI 자연어 검색 (GPT 의도추출 → DB 검색 → Claude 설명생성)
- 조건 기반 병원 검색 (진료과, 지역, 전문의 수 등)
- 심평원 데이터 매일 자동 동기화 (Vercel Cron, 03:00 UTC)
- 구글 별점 + 네이버 블로그 화제성 자동 수집
- 다국어 지원 (한국어, 영어, 중국어, 일본어, 태국어)

## 현재 상태
- **운영중** — 다국어(i18n) 시스템 구현 완료, AI 검색 운영 중

## 마지막 업데이트
- 2026-04-20
