# K-Beauty Buyers Guide — 구현 계획서 (개발자용)

> 작성일: 2026-03-28
> 목적: Claude Code가 개발할 때 참조하는 단일 기준 문서
> 기존 PROJECT_PLAN.md, DEV_PLAN.md, FULL_PLAN.md, PLAN.md를 통합/정리

---

## 0. 프로젝트 요약

| 항목 | 내용 |
|------|------|
| 프로젝트명 | K-Beauty Buyers Guide (KBBG) |
| 목적 | 외국인 환자 대상 한국 의료관광 커뮤니티 플랫폼 |
| 사이트 URL | https://kbbg-app.vercel.app |
| 도메인(예정) | kbeautybuyersguide.com |
| GitHub | jbshim1-coder/kbbg-app |
| 운영사 | 투비스토리 (2008~, jbshim1@gmail.com, 010-8718-5000) |
| 관리자 | admin@2bstory.com / kbbg2026!admin |
| 개발방식 | Claude Code (AI) — 비개발자(마케터) 운영 |

---

## 1. 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| Framework | Next.js (App Router) | 16.2.1 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| DB/Auth/Storage | Supabase (PostgreSQL) | - |
| i18n | next-intl | 4.8.3 |
| AI | Claude API (@anthropic-ai/sdk) | 0.80.0 |
| Login | Google OAuth (Supabase Auth) | - |
| Hosting | Vercel (GitHub 자동 배포) | - |
| Icons | lucide-react | 1.0.1 |

---

## 2. 지원 언어 (8개국)

| locale | 국기 | 언어 | 번역파일 |
|--------|------|------|---------|
| en (기본) | 🇺🇸 | English | messages/en.json |
| zh | 🇨🇳 | 中文 | messages/zh.json |
| ja | 🇯🇵 | 日本語 | messages/ja.json |
| ru | 🇷🇺 | Русский | messages/ru.json |
| vi | 🇻🇳 | Tiếng Việt | messages/vi.json |
| th | 🇹🇭 | ภาษาไทย | messages/th.json |
| mn | 🇲🇳 | Монгол | messages/mn.json |
| ko | 🇰🇷 | 한국어 | messages/ko.json |

---

## 3. 프로젝트 구조

```
kbbg-app/
├── src/
│   ├── app/
│   │   ├── [locale]/              # 8개국 언어별 페이지 (34개 페이지)
│   │   │   ├── page.tsx           # 홈페이지
│   │   │   ├── about/             # 소개
│   │   │   ├── admin/             # 관리자 대시보드 (6페이지)
│   │   │   ├── ai-search/         # AI 검색 결과
│   │   │   ├── community/         # 커뮤니티 (목록/상세/작성)
│   │   │   ├── contact/           # 문의
│   │   │   ├── cosmetics/         # 화장품 랭킹
│   │   │   ├── disclaimer/        # 면책조항
│   │   │   ├── faq/               # FAQ
│   │   │   ├── guide/             # 이용 가이드
│   │   │   ├── guides/            # 시술 가이드 (AEO)
│   │   │   ├── hospitals/         # 병원 검색
│   │   │   ├── influencer/        # 인플루언서
│   │   │   ├── live/              # 라이브캠
│   │   │   ├── login/             # 로그인
│   │   │   ├── mypage/            # 마이페이지
│   │   │   ├── privacy/           # 개인정보보호
│   │   │   ├── procedures/        # 시술 정보
│   │   │   ├── recommend/         # AI 추천
│   │   │   ├── report/            # 신고
│   │   │   ├── safety/            # 안전 정보
│   │   │   ├── search/            # 통합 검색
│   │   │   ├── signup/            # 회원가입
│   │   │   └── terms/             # 이용약관
│   │   ├── api/                   # API Routes (14개)
│   │   │   ├── admin/             # 관리자 API
│   │   │   ├── ai-search/         # AI 검색 API
│   │   │   ├── clinics/           # 병원 API
│   │   │   ├── comments/          # 댓글 API
│   │   │   ├── contact/           # 문의 API
│   │   │   ├── cosmetics/         # 화장품 API (네이버)
│   │   │   ├── cron/sync/         # 자동 동기화 API
│   │   │   ├── hira/              # 심평원 API (프록시+동기화)
│   │   │   ├── posts/             # 게시글 API (CRUD+투표)
│   │   │   ├── recommend/         # AI 추천 API
│   │   │   └── search/            # 통합 검색 API
│   │   └── auth/callback/         # Google OAuth 콜백
│   ├── components/                # 공통 컴포넌트 (19개)
│   ├── data/                      # 시드/정적 데이터 (12개 파일)
│   ├── lib/                       # 유틸리티 (9개)
│   ├── i18n/                      # next-intl 설정
│   └── types/                     # TypeScript 타입
├── messages/                      # 8개국 번역 JSON
├── public/                        # 정적 파일
├── supabase/                      # DB 스키마
└── docs/                          # 기획 문서
```

---

## 4. 외부 API 연동 현황

| API | 상태 | 용도 |
|-----|------|------|
| 심평원 hospInfoServicev2 | ✅ 연동 완료 | 79,569개 병원 실데이터 |
| Google Places API | ✅ 연동 완료 | 구글별점 + 리뷰수 |
| Claude API | ✅ 연동 완료 | AI 검색 (자연어→서술형) |
| Naver Shopping API | ✅ 연동 완료 | 화장품 랭킹 |
| Google OAuth | ✅ 연동 완료 | 소셜 로그인 |
| Google Analytics 4 | ✅ 코드 삽입 완료 | 트래픽 분석 (G-H3TFLPL00B) |

---

## 5. 구현 완료 항목 (✅)

| # | 기능 |
|---|------|
| 1 | Next.js 16 + TypeScript + Tailwind CSS 프로젝트 |
| 2 | 8개국 다국어 (next-intl, URL 기반 라우팅) |
| 3 | Supabase DB 스키마 (18개 테이블) |
| 4 | 홈페이지 (슬라이드 배너, AI 검색, 병원 필터, 커뮤니티 프리뷰, 라이브캠, 트렌딩) |
| 5 | AI 추천 퀴즈 + 결과 UI |
| 6 | 레딧 스타일 커뮤니티 (11개 카테고리, upvote/downvote, 댓글, 마스터 삭제) |
| 7 | 병원 검색 (심평원 실데이터, 8개 필터, 정렬, Google별점) |
| 8 | AI 검색 (자연어→심평원→Google별점→Claude 서술형) |
| 9 | 한국 거리 라이브캠 (5채널) |
| 10 | FAQ (30개 × 8언어) |
| 11 | Google 로그인 (OAuth + Supabase Auth) |
| 12 | 마이페이지 (프로필, 내 글, 내 댓글, AI 추천 이력) |
| 13 | 통합 검색 |
| 14 | 관리자 대시보드 (6페이지: 회원/광고/병원/문의/게시글/메인) |
| 15 | 법적 페이지 (이용약관, 개인정보보호, 면책조항) |
| 16 | Contact 폼 → Supabase 저장 |
| 17 | SEO (sitemap.xml, robots.txt, OG태그, JSON-LD) |
| 18 | AEO 시술 가이드 (20개 시술, FAQPage JSON-LD) |
| 19 | Vercel 배포 + GitHub 자동 배포 |
| 20 | 화장품 랭킹 (네이버/올리브영/글로우픽/화해 4탭) |
| 21 | 회원 레벨 시스템 (1-30 + M마스터, 포인트) |
| 22 | 출석 체크 (+1P/일, 연속 스트릭) |
| 23 | SNS 공유 (+2P, 하루 3회) |
| 24 | 슬라이드 배너 (4개, 5초 자동전환) |
| 25 | 광고 배너 (전체 페이지 상단) |
| 26 | 인플루언서 모집 페이지 |
| 27 | 검색 결과 최상단 광고 노출 |
| 28 | GA4 코드 삽입 |

---

## 6. 현재 문제점 및 버그 🔴

### 6-1. 크리티컬 (즉시 수정 필요)

| # | 문제 | 영향 | 해결 방법 |
|---|------|------|----------|
| C1 | **Guides 페이지 전체 영어 하드코딩** | 한국어 등 모든 locale에서 영어만 표시 | locale별 번역 적용 (히어로, 카드, CTA 전부) |
| C2 | **중복 페이지 존재** (src/app/about, community, contact 등) | [locale] 없는 경로에도 페이지 존재 → SEO 혼란, 404 가능성 | src/app/ 루트의 중복 페이지 삭제 |
| C3 | **로고 이미지 미적용** | Header에 텍스트 로고 사용중, public/에 로고 파일 없음 | 로고 이미지를 public/에 복사 후 Header에 Image 적용 |
| C4 | **og-image.png 없음** | 소셜 공유 시 이미지 미표시 | 로고 기반 OG 이미지 생성 후 public/에 배치 |
| C5 | **favicon 미교체** | 기본 Next.js 아이콘 사용중 | 로고 기반 favicon 생성 |

### 6-2. 중요 (빠른 수정 권장)

| # | 문제 | 영향 | 해결 방법 |
|---|------|------|----------|
| M1 | **Header에 SearchBar 미사용** | import만 하고 JSX에 렌더링 안 함 | 검색바 UI 추가 또는 import 제거 |
| M2 | **화장품 페이지 카테고리 한국어 하드코딩** | 전체/스킨케어/메이크업 등이 외국인에게 한국어로 표시 | i18n 번역 키 적용 |
| M3 | **SlideBanner isKo 로직** | ko/en 2개만 분기, 나머지 6개 언어는 영어 표시 | 번역 키(next-intl) 사용으로 전환 |
| M4 | **DailyCheckIn isKo 로직** | 위와 동일 | 번역 키 사용으로 전환 |
| M5 | **ShareButton isKo 로직** | 위와 동일 | 번역 키 사용으로 전환 |
| M6 | **DEV_PLAN.md 오래된 API 정보** | MadmDtlInfoService2.7 (잘못된 엔드포인트) 기재 | hospInfoServicev2로 수정 |
| M7 | **문서 간 상태 불일치** | PROJECT_PLAN vs PLAN vs FULL_PLAN이 서로 다른 완료 상태 기재 | 이 문서(IMPLEMENTATION_PLAN.md)로 통합 |

### 6-3. 개선 사항

| # | 문제 | 해결 방법 |
|---|------|----------|
| I1 | 여러 컴포넌트에서 `isKo` 패턴 반복 | 클라이언트 컴포넌트에서 `useTranslations()` 사용으로 통일 |
| I2 | 커뮤니티 게시글이 시드데이터만 존재 | Supabase 실데이터 연동 |
| I3 | 병원 검색 결과에 이미지 없음 | 기본 병원 아이콘/로고 표시 |
| I4 | 모바일에서 병원 필터 8개가 좁음 | 모바일 필터 UI 개선 (아코디언 또는 모달) |
| I5 | Vercel Cron 미설정 | CRON_SECRET 환경변수 등록 + vercel.json cron 활성화 |

---

## 7. 남은 개발 작업 (우선순위순)

### Phase A — 즉시 수정 (현재 세션)

| 순서 | 작업 | 예상 난이도 |
|------|------|-----------|
| A1 | 로고 이미지 public/에 복사 + Header 적용 | 쉬움 |
| A2 | Guides 페이지 다국어 적용 (8개 언어) | 보통 |
| A3 | 중복 페이지 삭제 (src/app/about 등) | 쉬움 |
| A4 | isKo 패턴 → useTranslations 전환 (SlideBanner, DailyCheckIn, ShareButton) | 보통 |
| A5 | 화장품 페이지 카테고리 i18n | 쉬움 |

### Phase B — 단기 (1~2일)

| 순서 | 작업 |
|------|------|
| B1 | favicon + og-image 생성/적용 |
| B2 | Header 검색바 표시 또는 제거 |
| B3 | Vercel Cron 설정 (심평원+Google Places 일일 동기화) |
| B4 | 커뮤니티 Supabase 실데이터 연동 (현재 시드데이터) |
| B5 | 도메인 연결 (kbeautybuyersguide.com) |

### Phase C — 중기 (1~2주)

| 순서 | 작업 |
|------|------|
| C1 | Cloudinary 이미지 업로드 연동 |
| C2 | 게시글 이미지 업로드 (3장 제한, 1MB 압축) |
| C3 | AI 추천 고도화 (Claude API 연동 개선) |
| C4 | 스팸 방지 실구현 (reCAPTCHA + AI 필터) |
| C5 | 회원 레벨별 권한 실적용 (읽기전용→댓글→글쓰기 등) |
| C6 | 라이브캠 추가 채널 발굴 (24시간 검증) |
| C7 | 화장품 데이터 자동 업데이트 (주간 크론) |

### Phase D — 장기 (1개월+)

| 순서 | 작업 |
|------|------|
| D1 | Before/After 갤러리 |
| D2 | 비용 계산기 |
| D3 | 실시간 채팅 (환자↔관리자) |
| D4 | 병원 직접 등록 기능 |
| D5 | 프리미엄 추천 컨설팅 결제 |
| D6 | 모바일 앱 (PWA 또는 React Native) |

---

## 8. 수익 모델

| 단계 | 모델 | 시기 |
|------|------|------|
| 1단계 | 트래픽 확보 — 무료 운영 | 현재 |
| 2단계 | AI 추천 광고 (3+1), 배너 광고, 카테고리 스폰서 | 트래픽 확보 후 |
| 3단계 | 프리미엄 추천 컨설팅, 병원 직접 등록 | 성장기 |

---

## 9. 환경변수 (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
HIRA_API_KEY=                    # 심평원 API 키
GOOGLE_PLACES_API_KEY=           # Google Places API 키
ANTHROPIC_API_KEY=               # Claude API 키
NAVER_CLIENT_ID=                 # 네이버 쇼핑 API
NAVER_CLIENT_SECRET=
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-H3TFLPL00B
CRON_SECRET=                     # Vercel Cron 인증
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=  # (예정)
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=  # (예정)
```

---

## 10. 배포 체크리스트

- [ ] Vercel 환경변수 모두 등록 확인
- [ ] CRON_SECRET 설정
- [ ] 도메인 연결 (kbeautybuyersguide.com)
- [ ] Supabase Google OAuth redirect URL에 도메인 추가
- [ ] og-image.png, favicon 배포
- [ ] Google Search Console 등록
- [ ] Google Analytics 대시보드 확인

---

## 11. 데이터 소스 정리

### 심평원 병원정보서비스 (실데이터 연동 완료)
- **Endpoint**: `https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList`
- **수집 항목**: 병원명, 종별, 주소, 전화번호, 홈페이지, 의사수, 전문의수, 개설일자
- **수집 주기**: 하루 1회 (Vercel Cron, 예정)
- **총 병원수**: 79,569개

### Google Places API
- **수집 항목**: 구글 별점 (1~5), 리뷰 수
- **표기**: "⭐ 4.5 · 리뷰 128건"
- **수집 주기**: 하루 1회 (심평원 동기화와 함께)

### Naver Shopping API
- **용도**: 화장품 랭킹 (카테고리별 TOP 20)
- **수집 주기**: 실시간 (API 호출)

### 로컬 화장품 데이터
- 올리브영 TOP 20, 글로우픽 TOP 20, 화해 TOP 20
- 수동 업데이트 (주간) → 향후 자동화 예정

---

## 12. 회원 레벨 시스템

### 포인트 획득
| 활동 | 포인트 |
|------|--------|
| 글 작성 | +5 |
| 댓글 작성 | +2 |
| 추천 받기 (글) | +3 |
| 추천 받기 (댓글) | +1 |
| 출석 체크 | +1 |
| AI 추천 이용 | +2 |
| 후기 작성 (사진 포함) | +10 |
| SNS 공유 | +2 (하루 3회) |

### 레벨 구간
| 레벨 | 필요 포인트 | 권한 |
|------|-----------|------|
| 0 | 0 | 읽기만 |
| 1 | 10 | 댓글 가능 |
| 2 | 30 | 글쓰기 가능 |
| 3 | 100 | 추천 가능 |
| 5 | 500 | 이미지 업로드 |
| 10 | 3,000 | 닉네임 컬러 |
| 15 | 10,000 | 프로필 뱃지 |
| 20 | 30,000 | VIP 마크 |
| 25 | 80,000 | 커뮤니티 영향력 |
| 30 | 200,000 | 최상위 유저 |
| M | 관리자 | 마스터 (admin@2bstory.com) |
