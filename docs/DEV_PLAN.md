# K-Beauty Buyers Guide - 개발 계획서

> 최종 업데이트: 2026-03-26

---

## 1. 기술 스택

| 영역 | 기술 | 이유 |
|------|------|------|
| 프론트엔드 | Next.js 16 + TypeScript + Tailwind CSS | SSR/SEO, 반응형, 빠른 개발 |
| 백엔드 | Next.js API Routes | 별도 서버 불필요 |
| DB/인증 | Supabase (PostgreSQL + Auth + Storage) | 관리형, 비개발자 운영 가능 |
| i18n | next-intl (8개국 언어) | URL 기반 라우팅 (/en, /ko...) |
| AI 추천 | Claude API | 추천 이유 생성 |
| 로그인 | Google OAuth (Supabase Auth) | 글로벌 커버 |
| 호스팅 | Vercel + Supabase | 자동 배포, 무료 시작 |
| 코드 관리 | GitHub (jbshim1-coder/kbbg-app) | Vercel 자동 배포 연동 |
| 개발 방식 | Claude Code (AI 코딩) | 비개발자도 운영 |

---

## 2. 프로젝트 구조 (86개 파일)

```
kbbg-app/
├── src/
│   ├── app/
│   │   ├── [locale]/           # 8개국 언어별 페이지
│   │   │   ├── page.tsx        # 홈페이지
│   │   │   ├── recommend/      # AI 추천
│   │   │   ├── community/      # 커뮤니티 (목록/상세/작성)
│   │   │   ├── hospitals/      # 병원 검색 (심평원 연동)
│   │   │   ├── live/           # 한국 거리 라이브캠
│   │   │   ├── faq/            # FAQ (8개국 번역)
│   │   │   ├── about/          # 회사 소개
│   │   │   ├── contact/        # 문의 (Supabase 저장)
│   │   │   ├── login/          # Google 로그인
│   │   │   ├── signup/         # 회원가입
│   │   │   ├── mypage/         # 마이페이지
│   │   │   ├── search/         # 통합 검색
│   │   │   ├── admin/          # 관리자 대시보드 (6페이지)
│   │   │   ├── terms/          # 이용약관
│   │   │   ├── privacy/        # 개인정보보호
│   │   │   ├── disclaimer/     # 면책조항
│   │   │   ├── guide/          # 이용 가이드
│   │   │   ├── safety/         # 안전 정보
│   │   │   ├── report/         # 신고하기
│   │   │   └── procedures/     # 시술 정보
│   │   ├── api/
│   │   │   ├── hira/           # 심평원 API (프록시 + 동기화)
│   │   │   ├── posts/          # 게시글 CRUD
│   │   │   ├── comments/       # 댓글 CRUD
│   │   │   ├── recommend/      # AI 추천 API
│   │   │   ├── search/         # 통합 검색 API
│   │   │   ├── clinics/        # 병원 API
│   │   │   └── contact/        # 문의 API
│   │   └── auth/callback/      # Google OAuth 콜백
│   ├── components/
│   │   ├── layout/             # Header, Footer
│   │   └── ui/                 # Button, Card, Input, Badge, Modal, Dropdown, SearchBar
│   ├── data/                   # 시드 데이터 (병원30, 게시글20, FAQ30×8언어, 시술20)
│   ├── lib/                    # Supabase, HIRA API, Google Places
│   ├── i18n/                   # next-intl 설정
│   └── types/                  # TypeScript 타입
├── messages/                   # 8개국 번역 JSON (en,ko,zh,ja,ru,vi,th,mn)
├── supabase/                   # DB 스키마 (18개 테이블)
└── docs/                       # 기획서, 개발 계획서
```

---

## 3. 데이터베이스 (Supabase - 18개 테이블)

| 카테고리 | 테이블 |
|---------|--------|
| 사용자 | users, user_profiles |
| 병원 | clinics, doctors, procedures, clinic_procedure_prices |
| 커뮤니티 | boards, posts, comments, votes, reports |
| AI 추천 | recommendation_sessions, recommendation_results |
| 광고 | ads_campaigns, ads_impressions, ads_clicks |
| 기타 | faqs, contact_inquiries |

---

## 4. 외부 API 연동

### 4-1. 심평원 의료기관 상세정보

- Endpoint: `https://apis.data.go.kr/B551182/MadmDtlInfoService2.7`
- 수집 방식: 하루 1회 → Supabase 저장
- 오퍼레이션:
  - `getDtlInfo2.7` — 병원 기본정보
  - `getEqpInfo2.7` — 보유 장비정보
  - `getDgsbjtInfo2.7` — 진료과목 상세

표시 항목: 병원명, 종별, 주소, 전화번호, 홈페이지, 의사수, 전문의수, 개설일자, 장비, 진료과목별 전문의수
제외 항목: 위경도, 진료과목코드, 우편번호, 요양기관번호

### 4-2. Google Places API
- 구글 별점 + 리뷰 수 조회
- "구글별점 · 리뷰 O건" 으로 표기
- 일일 동기화로 Supabase에 저장

### 4-3. Google OAuth
- Supabase Auth 연동
- 콜백: `/auth/callback`

---

## 5. 구현 완료 항목

| # | 기능 | 상태 |
|---|------|------|
| 1 | Next.js + Tailwind 프로젝트 셋업 | ✅ |
| 2 | 8개국 다국어 (next-intl) | ✅ |
| 3 | Supabase DB 스키마 (18테이블) | ✅ |
| 4 | 홈페이지 | ✅ |
| 5 | AI 추천 퀴즈 + 결과 | ✅ |
| 6 | 커뮤니티 (목록/상세/작성) | ✅ |
| 7 | 병원 검색 (심평원 연동) | ✅ |
| 8 | 한국 거리 라이브캠 (5채널) | ✅ |
| 9 | FAQ (30개 × 8언어) | ✅ |
| 10 | Google 로그인 | ✅ |
| 11 | 마이페이지 | ✅ |
| 12 | 통합 검색 | ✅ |
| 13 | 관리자 대시보드 (6페이지) | ✅ |
| 14 | 법적 페이지 (약관/개인정보/면책) | ✅ |
| 15 | Contact 폼 → Supabase 저장 | ✅ |
| 16 | SEO (sitemap, robots, OG태그) | ✅ |
| 17 | 시드 데이터 (병원30, 게시글20, FAQ30, 시술20) | ✅ |
| 18 | Vercel 배포 + GitHub 연동 | ✅ |
| 19 | 스팸 방지 시스템 (설계) | ✅ |
| 20 | 심평원 API 클라이언트 + 동기화 코드 | ✅ |
| 21 | Google Places API 클라이언트 | ✅ |

---

## 6. 미완료 항목

| # | 할 일 | 상태 |
|---|------|------|
| 1 | 심평원 데이터 실제 수집 | ⏳ API 활성화 대기 |
| 2 | Google Places 별점 연동 | ⏳ API 키 설정 필요 |
| 3 | 도메인 연결 | ❌ |
| 4 | Google Analytics | ❌ |
| 5 | Vercel 환경변수 (HIRA_API_KEY, GOOGLE_PLACES_API_KEY) | ❌ |
| 6 | 라이브캠 추가 (24시간 검증 채널) | ❌ |
| 7 | AI 추천 실제 엔진 (Claude API) | ❌ |
| 8 | Vercel Cron (매일 데이터 동기화) | ❌ |

---

## 7. 예상 비용

| 항목 | 초기 (월) | 성장기 (월) |
|------|----------|-----------|
| Vercel | 무료 | ~$20 |
| Supabase | 무료 | ~$25 |
| Claude API | ~$30~100 | ~$100~300 |
| Google Places API | 무료 ($200 크레딧) | ~$50 |
| 도메인 | ~$15/년 | ~$15/년 |
| **합계** | **~$50~120** | **~$200~400** |
