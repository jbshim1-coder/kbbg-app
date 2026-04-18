# K-Beauty Buyers Guide

한국 뷰티 클리닉을 찾는 외국인 방문객을 위한 신뢰할 수 있는 가이드 서비스입니다.
AI 기반 추천과 실제 후기를 바탕으로 나에게 맞는 K-뷰티 클리닉을 찾아보세요.

## 기술 스택

- **프레임워크**: [Next.js](https://nextjs.org) (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **데이터베이스**: [Supabase](https://supabase.com) (PostgreSQL)
- **AI 추천**: [Anthropic Claude API](https://www.anthropic.com)
- **국제화(i18n)**: [next-intl](https://next-intl-docs.vercel.app)

## 시작하기

### 1. 저장소 클론

```bash
git clone <repository-url>
cd kbbg-app
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.example`을 복사하여 `.env.local`을 생성하고 실제 값을 입력합니다.

```bash
cp .env.example .env.local
```

| 변수명 | 설명 | 획득 방법 |
|--------|------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Supabase 대시보드 → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 | Supabase 대시보드 → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 롤 키 (서버 전용) | Supabase 대시보드 → Project Settings → API |
| `ANTHROPIC_API_KEY` | Claude API 키 | [Anthropic Console](https://console.anthropic.com) |
| `NEXT_PUBLIC_SITE_URL` | 배포된 사이트 URL | 로컬: `http://localhost:3000` |

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

## 주요 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행 (빌드 후)
npm run start

# ESLint 검사
npm run lint
```

## 프로젝트 구조

```
kbbg-app/
├── messages/              # 8개국 번역 JSON (en, ko, zh, ja, ru, vi, th, mn)
├── src/
│   ├── app/
│   │   ├── [locale]/      # 8개국 언어별 페이지 (34개 페이지)
│   │   ├── api/           # API Routes (14개)
│   │   └── auth/callback/ # Google OAuth 콜백
│   ├── components/        # 공통 컴포넌트 (19개)
│   ├── data/              # 시드/정적 데이터
│   ├── i18n/              # next-intl 설정 (routing, request)
│   ├── lib/               # 유틸리티 (Supabase, HIRA, Google Places)
│   └── types/             # TypeScript 타입 정의
├── supabase/              # DB 스키마 (18개 테이블)
├── docs/                  # 기획/개발 문서
├── .env.example           # 환경 변수 템플릿
└── next.config.ts         # Next.js 설정
```

## 지원 언어 (8개국)

| locale | 언어 |
|--------|------|
| en (기본) | English |
| ko | 한국어 |
| zh | 中文 |
| ja | 日本語 |
| ru | Русский |
| vi | Tiếng Việt |
| th | ภาษาไทย |
| mn | Монгол |

## 배포

[Vercel](https://vercel.com)을 통한 배포를 권장합니다.

1. Vercel에 저장소를 연결합니다.
2. 환경 변수를 Vercel 대시보드에서 설정합니다.
3. `main` 브랜치에 푸시하면 자동 배포됩니다.

## 문의

- 이메일: help@kbeautybuyersguide.com
- 사이트: [kbeautybuyersguide.com](https://kbeautybuyersguide.com)
