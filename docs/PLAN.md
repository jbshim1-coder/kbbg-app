# K-Beauty Buyers Guide — 개발 기준 문서

> 최종 업데이트: 2026-03-26
> 개발자용 핵심 참조 문서

---

## 1. 현재 구현 상태

| # | 기능 | 상태 |
|---|------|------|
| 1 | Next.js 16 + Tailwind 프로젝트 셋업 | ✅ |
| 2 | 8개국 다국어 (next-intl, /en /ko /zh /ja /ru /vi /th /mn) | ✅ |
| 3 | Supabase DB 스키마 (18개 테이블) | ✅ |
| 4 | 홈페이지 | ✅ |
| 5 | AI 추천 퀴즈 + 결과 UI | ✅ |
| 6 | 커뮤니티 (목록/상세/작성) | ✅ |
| 7 | 병원 검색 페이지 + 심평원 API 클라이언트 | ✅ |
| 8 | 한국 거리 라이브캠 (5채널) | ✅ |
| 9 | FAQ (30개 × 8언어) | ✅ |
| 10 | Google 로그인 (OAuth + Supabase Auth) | ✅ |
| 11 | 마이페이지 (프로필/내 글/내 댓글/AI 추천 이력) | ✅ |
| 12 | 통합 검색 | ✅ |
| 13 | 관리자 대시보드 (6페이지) | ✅ |
| 14 | 법적 페이지 (약관/개인정보/면책/가이드/안전/신고) | ✅ |
| 15 | Contact 폼 → Supabase 저장 | ✅ |
| 16 | SEO (sitemap.xml, robots.txt, OG태그) | ✅ |
| 17 | 시드 데이터 (병원 30, 게시글 20, FAQ 30, 시술 20) | ✅ |
| 18 | Vercel 배포 + GitHub 자동 배포 | ✅ |
| 19 | 스팸 방지 시스템 (설계 완료) | ✅ |
| 20 | Google Places API 클라이언트 코드 | ✅ |
| 21 | 심평원 API 데이터 실제 수집 | ⏳ API 활성화 대기 |
| 22 | Google Places 별점 연동 | ⏳ API 키 설정 필요 |
| 23 | Vercel 환경변수 등록 | ❌ |
| 24 | Vercel Cron (매일 자동 동기화) | ❌ |
| 25 | AI 추천 실제 엔진 (Claude API) | ❌ |
| 26 | 도메인 연결 (kbeautybuyersguide.com) | ❌ |
| 27 | Google Analytics | ❌ |
| 28 | 라이브캠 추가 채널 (24시간 검증) | ❌ |

---

## 2. 남은 작업

| 순서 | 할 일 |
|------|------|
| 1 | 심평원 API 데이터 활성화 확인 → 실제 수집 테스트 |
| 2 | Vercel에 환경변수 추가: `HIRA_API_KEY`, `GOOGLE_PLACES_API_KEY` |
| 3 | Google Places API 연동 (구글별점 + 리뷰수) |
| 4 | Vercel Cron 설정 (매일 심평원 + Google Places 동기화) |
| 5 | AI 추천 실제 엔진 연결 (Claude API) |
| 6 | 도메인 구매 + Vercel 연결 (kbeautybuyersguide.com) |
| 7 | Google Analytics 설정 |
| 8 | 라이브캠 추가 (24시간 검증된 채널 발굴) |

---

## 3. 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | Next.js 16 + TypeScript + Tailwind CSS |
| 백엔드 | Next.js API Routes |
| DB/인증/저장소 | Supabase (PostgreSQL + Auth + Storage) |
| i18n | next-intl (8개국, URL 기반: /en, /ko, /zh...) |
| AI 추천 | Claude API (예정) |
| 로그인 | Google OAuth (Supabase Auth) |
| 호스팅 | Vercel + Supabase |
| 코드 관리 | GitHub — jbshim1-coder/kbbg-app |
| 배포 URL | https://kbbg-app.vercel.app |

---

## 4. 데이터 소스

### 심평원 의료기관 상세정보 API

- Endpoint: `https://apis.data.go.kr/B551182/MadmDtlInfoService2.7`
- 수집 주기: 하루 1회 (Vercel Cron) → Supabase `clinics` 테이블 저장
- API 키 상태: 발급 완료, 데이터 활성화 대기 중

| 오퍼레이션 | 수집 정보 |
|-----------|---------|
| getDtlInfo2.7 | 병원명, 종별, 주소, 전화번호, 홈페이지, 의사수, 전문의수, 개설일자 |
| getEqpInfo2.7 | 보유 장비명 (CT, MRI, 레이저 등), 수량 |
| getDgsbjtInfo2.7 | 진료과목명, 과목별 전문의수 |

- 제외 필드: 위경도, 진료과목코드, 우편번호, 요양기관번호

### Google Places API

- 수집 항목: 구글 별점 (1~5점), 구글 리뷰 수
- 수집 주기: 하루 1회 → Supabase `clinics` 테이블에 저장
- 표기: "구글별점 · 리뷰 O건"

---

## 5. 병원 카드 표시 형태

```
🏥 병원명                           [홈페이지 방문]
   종별 · 진료과목
   주소
   📞 전화번호
   👨‍⚕️ 의사 O명 · 🏅 전문의 O명 (과목별)
   🔬 보유장비: CT 1대, 레이저 3대
   📅 개설일: 2010.03.15
   ⭐ 4.5 구글별점 · 리뷰 128건
```
