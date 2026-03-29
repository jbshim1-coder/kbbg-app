#!/usr/bin/env node
// KBBG 프로젝트 종합 기술 문서 생성
// 개발자 인수인계용 — 이 문서 하나로 프로젝트 완전 파악 가능
// 실행: node scripts/generate-full-doc.mjs

import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

const PROJECT_DIR = "/home/jbshi/kbbg-app";
const BACKUP_DIR = "/mnt/d/backup/01.kbbg/docs";
const now = new Date();
const KST = new Date(now.getTime() + 9 * 60 * 60 * 1000);
const ts = KST.toISOString().replace(/[-:T]/g, "").slice(0, 15).replace(/(\d{8})(\d{6})/, "$1_$2");

if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true });

// 헬퍼: 파일 읽기
function readSafe(path) { try { return readFileSync(path, "utf-8"); } catch { return "(파일 없음)"; } }
function execSafe(cmd) { try { return execSync(cmd, { cwd: PROJECT_DIR, encoding: "utf-8" }); } catch { return "(실행 실패)"; } }

// 헬퍼: 텍스트를 Paragraph 배열로
function textToParas(text, mono = false) {
  return text.split("\n").map(l => new Paragraph({
    children: [new TextRun({ text: l, font: mono ? "Consolas" : "맑은 고딕", size: mono ? 18 : 22 })]
  }));
}

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ text, heading: level, spacing: { before: 300, after: 100 } });
}

function bold(text) {
  return new Paragraph({ children: [new TextRun({ text, bold: true, size: 22, font: "맑은 고딕" })] });
}

function normal(text) {
  return new Paragraph({ children: [new TextRun({ text, size: 22, font: "맑은 고딕" })] });
}

function spacer() { return new Paragraph({ text: "" }); }

// 데이터 수집
const devLog = readSafe(join(PROJECT_DIR, "docs/DEV_LOG.md"));
const implPlan = readSafe(join(PROJECT_DIR, "docs/IMPLEMENTATION_PLAN.md"));
const gitLog = execSafe("git log --oneline -50");
const gitRemote = execSafe("git remote -v");
const tree = execSafe("find src -type f \\( -name '*.tsx' -o -name '*.ts' \\) | sort");
const envFile = readSafe(join(PROJECT_DIR, ".env.local"));
const envKeys = envFile.split("\n").filter(l => l.includes("=") && !l.startsWith("#"));
const pkg = JSON.parse(readSafe(join(PROJECT_DIR, "package.json")));
const schema = readSafe(join(PROJECT_DIR, "supabase/schema.sql"));
const vercelJson = readSafe(join(PROJECT_DIR, "vercel.json"));

// API 라우트 목록
const apiRoutes = execSafe("find src/app/api -name 'route.ts' | sort");

// 문서 생성
const doc = new Document({
  sections: [{
    properties: {},
    children: [
      // 표지
      new Paragraph({ children: [new TextRun({ text: "K-Beauty Buyers Guide", bold: true, size: 48, font: "맑은 고딕" })], heading: HeadingLevel.TITLE }),
      new Paragraph({ children: [new TextRun({ text: "프로젝트 종합 기술 문서 (개발자 인수인계용)", bold: true, size: 28, font: "맑은 고딕" })] }),
      spacer(),
      normal(`생성일시: ${KST.toISOString().slice(0, 19).replace("T", " ")} (KST)`),
      normal("이 문서 하나로 프로젝트를 완전히 이해하고 복구/운영할 수 있습니다."),
      normal("문서는 4시간마다 자동 갱신되어 D:\\backup\\01.kbbg\\docs\\에 저장됩니다."),
      spacer(),

      // ═══ 1. 프로젝트 개요 ═══
      heading("1. 프로젝트 개요"),
      bold("프로젝트명: K-Beauty Buyers Guide (KBBG)"),
      normal("목적: 외국인 환자 대상 한국 의료관광 커뮤니티 플랫폼"),
      normal("사이트 URL: https://kbbg-app.vercel.app"),
      normal("도메인(예정): kbeautybuyersguide.com"),
      normal("GitHub: https://github.com/jbshim1-coder/kbbg-app"),
      normal("운영사: 투비스토리 (2008~, help@2bstory.com, 010-8718-5000)"),
      normal("관리자 계정: admin@2bstory.com / kbbg2026!admin"),
      normal("개발방식: Claude Code (AI) — 비개발자(마케터) 운영"),
      spacer(),

      // ═══ 2. 기술 스택 ═══
      heading("2. 기술 스택"),
      normal("Framework: Next.js 16.2.1 (App Router, Turbopack)"),
      normal("Language: TypeScript 5.x"),
      normal("Styling: Tailwind CSS 4.x"),
      normal("DB/Auth/Storage: Supabase (PostgreSQL + Auth + Storage)"),
      normal("i18n: next-intl 4.8.3 (8개국 언어, URL 기반 라우팅)"),
      normal("AI: Claude API (@anthropic-ai/sdk 0.80.0)"),
      normal("Login: Google OAuth (Supabase Auth)"),
      normal("Hosting: Vercel (GitHub 자동 배포)"),
      normal("Email: Resend API (help@2bstory.com 알림)"),
      normal("Icons: lucide-react 1.0.1"),
      normal("Word: docx 9.6.1"),
      spacer(),

      // ═══ 3. 환경변수 + 비밀키 ═══
      heading("3. 환경변수 및 비밀키"),
      normal("⚠️ 이 섹션은 보안 정보를 포함합니다. 외부 유출 금지."),
      normal("파일 위치: .env.local (git에 포함되지 않음)"),
      spacer(),
      ...envKeys.map(l => {
        const [key, ...val] = l.split("=");
        return new Paragraph({ children: [
          new TextRun({ text: key + " = ", bold: true, font: "Consolas", size: 18 }),
          new TextRun({ text: val.join("="), font: "Consolas", size: 18 }),
        ]});
      }),
      spacer(),

      // ═══ 4. 외부 서비스 계정 ═══
      heading("4. 외부 서비스 계정 정보"),
      bold("[Supabase]"),
      normal("대시보드: https://supabase.com/dashboard"),
      normal("조직: jbshim1-coder's Org (PRO 플랜)"),
      normal("프로젝트: kbbg (main/PRODUCTION)"),
      spacer(),
      bold("[Vercel]"),
      normal("대시보드: https://vercel.com/jbshim1-coders-projects"),
      normal("프로젝트: kbbg-app"),
      normal("자동 배포: main 브랜치 push 시"),
      spacer(),
      bold("[GitHub]"),
      normal("저장소: https://github.com/jbshim1-coder/kbbg-app"),
      normal("브랜치: main (단일 브랜치)"),
      spacer(),
      bold("[Google]"),
      normal("OAuth: Supabase Auth 연동 (Google 로그인)"),
      normal("GA4: G-H3TFLPL00B"),
      normal("Places API: GOOGLE_PLACES_API_KEY (병원 별점 조회)"),
      spacer(),
      bold("[Resend]"),
      normal("용도: 문의/상담 폼 제출 시 help@2bstory.com 이메일 알림"),
      normal("무료: 100건/일"),
      spacer(),
      bold("[심평원 HIRA]"),
      normal("API: https://apis.data.go.kr/B551182/hospInfoServicev2"),
      normal("용도: 전국 병원 데이터 (79,569개)"),
      spacer(),

      // ═══ 5. 지원 언어 ═══
      heading("5. 지원 언어 (8개국)"),
      normal("en (영어/기본), ko (한국어), zh (중국어), ja (일본어)"),
      normal("ru (러시아어), vi (베트남어), th (태국어), mn (몽골어)"),
      normal("번역 파일: messages/[locale].json"),
      spacer(),

      // ═══ 6. DB 스키마 ═══
      heading("6. 데이터베이스 스키마 (Supabase PostgreSQL)"),
      normal("총 18개 테이블 + daily_visitors + RPC 함수"),
      spacer(),
      bold("주요 테이블:"),
      normal("users, user_profiles — 사용자"),
      normal("clinics, doctors, procedures — 병원/의사/시술"),
      normal("boards, posts, comments, votes, reports — 커뮤니티"),
      normal("recommendation_sessions, recommendation_results — AI 추천"),
      normal("ads_campaigns, ads_impressions, ads_clicks — 광고"),
      normal("faqs, contact_inquiries — FAQ/문의"),
      normal("daily_visitors — 일별 방문자 카운트"),
      spacer(),
      bold("전체 스키마 SQL:"),
      ...schema.slice(0, 3000).split("\n").map(l => new Paragraph({ children: [new TextRun({ text: l, font: "Consolas", size: 16 })] })),
      normal("... (전체 스키마는 supabase/schema.sql 참조)"),
      spacer(),

      // ═══ 7. API 라우트 ═══
      heading("7. API 라우트 목록"),
      ...apiRoutes.split("\n").filter(Boolean).map(l => {
        const route = l.replace("src/app/api/", "/api/").replace("/route.ts", "");
        return normal(`${route}`);
      }),
      spacer(),
      bold("주요 API 설명:"),
      normal("/api/hira — 심평원 실시간 병원 검색"),
      normal("/api/clinics/search — DB 기반 병원 검색 (관련성 점수)"),
      normal("/api/ai-search — Claude AI 자연어 병원 추천"),
      normal("/api/cron/sync — 심평원+구글별점 일일 동기화"),
      normal("/api/consultation — 운영자 상담 폼 (DB저장+이메일)"),
      normal("/api/contact — 일반 문의 (DB저장+이메일)"),
      normal("/api/report-notify — 신고 이메일 알림"),
      normal("/api/visitors — 일별 방문자 카운트"),
      normal("/api/admin/ads — 광고 관리"),
      spacer(),

      // ═══ 8. 배포 ═══
      heading("8. 배포 및 CI/CD"),
      normal("방식: GitHub main 브랜치에 push → Vercel 자동 배포"),
      normal("빌드: next build (Turbopack)"),
      normal("환경: Vercel Serverless Functions (10초 타임아웃)"),
      spacer(),
      bold("vercel.json:"),
      ...textToParas(vercelJson, true),
      spacer(),

      // ═══ 9. 백업 정책 ═══
      heading("9. 백업 정책"),
      normal("자동 백업: 4시간마다 cron 실행 (0 */4 * * *)"),
      normal("스크립트: /home/jbshi/kbbg-backup.sh"),
      normal("저장 위치: D:\\backup\\01.kbbg\\"),
      normal("내용: 코드(tar.gz) + DB(JSON) + 개발문서(Word)"),
      normal("보관 기간: 3일 (이후 자동 삭제)"),
      spacer(),

      // ═══ 10. 보안 ═══
      heading("10. 보안 설정"),
      normal("Supabase RLS: 모든 테이블에 Row Level Security 활성화"),
      normal("인증: Google OAuth (Supabase Auth)"),
      normal("관리자: admin@2bstory.com (마스터 권한)"),
      normal("API 보호: CRON_SECRET으로 Cron API 인증"),
      normal("서비스 키: SUPABASE_SERVICE_ROLE_KEY (서버 전용, 클라이언트 노출 금지)"),
      spacer(),

      // ═══ 11. SEO ═══
      heading("11. SEO 설정"),
      normal("sitemap.xml: 자동 생성"),
      normal("robots.txt: 설정 완료"),
      normal("OG 태그: 페이지별 설정"),
      normal("JSON-LD: FAQPage, MedicalBusiness 스키마"),
      normal("hreflang: 8개국 언어별 URL"),
      normal("GA4: G-H3TFLPL00B"),
      spacer(),

      // ═══ 12. 수익 모델 ═══
      heading("12. 수익 모델 및 광고 시스템"),
      normal("1단계: 트래픽 확보 — 무료 운영 (현재)"),
      normal("2단계: AI 추천 광고 (3+1), 배너 광고, 카테고리 스폰서"),
      normal("3단계: 프리미엄 추천 컨설팅"),
      spacer(),
      normal("광고 시스템: 검색 결과 최상단 노출 (광고 라벨)"),
      normal("관리: /admin/ads에서 관리자가 등록/수정"),
      spacer(),

      // ═══ 13. 핵심 비즈니스 로직 ═══
      heading("13. 핵심 비즈니스 로직"),
      spacer(),
      bold("13-1. AI 병원 추천 알고리즘 (Relevance Score)"),
      normal("사용자가 진료과+지역을 검색하면 관련성 점수로 병원을 정렬합니다."),
      spacer(),
      bold("점수 계산 공식:"),
      normal("총점 = 상호매칭(100) + 전문의비율(30) + 구글별점(20) + 전문병원보너스(20) - 종합병원감점(20) - 다진료과감점 - 상호불일치감점(50)"),
      spacer(),
      normal("• 상호 매칭 +100점: 병원명에 검색한 진료과명 포함 (예: 'OO피부과의원'에 '피부' 포함)"),
      normal("  → 의료법상 전문의만 상호에 진료과 표기 가능하므로 가장 신뢰도 높은 지표"),
      normal("• 상호 부분매칭 +80점: 진료과 축약명 포함 (예: '피부' 포함)"),
      normal("• 전문의 비율 +0~30점: (전문의수 / 전체의사수) × 30"),
      normal("• 구글 별점 +0~20점: 별점×4 + ln(리뷰수). 별점이 검색을 지배하지 않도록 최대 20점 제한"),
      normal("• 전문병원 보너스 +20점: 종별코드 31(의원) 또는 상호에 '의원/클리닉' 포함"),
      normal("• 종합병원 감점 -20점: 종별코드 01/11(상급종합/종합) — 모든 검색에 걸리는 문제 방지"),
      normal("• 상호 불일치 감점 -50점: 피부과 검색인데 상호에 '소아' 등 다른 진료과명 포함 시"),
      spacer(),
      normal("구현: Supabase RPC 함수 search_clinics_ranked()로 DB에서 직접 계산+정렬"),
      normal("파일: supabase/migrations/add-search-rpc.sql, src/app/api/clinics/search/route.ts"),
      spacer(),

      bold("13-2. AI 검색 (자연어 → 병원 추천)"),
      normal("사용자 자연어 질문 → 파라미터 파싱 → DB 검색 → Claude AI 서술형 답변"),
      normal("1단계: parseQuery()로 자연어에서 지역+진료과 코드 추출"),
      normal("  예: '수원에서 피부과 추천해줘' → sidoCd=310000, dgsbjtCd=14, keyword='수원'"),
      normal("2단계: Supabase DB에서 관련성 점수 기반 검색 (상위 5개)"),
      normal("3단계: 검색 결과를 Claude API에 전송 → 서술형 추천 답변 생성"),
      normal("4단계: AI가 긍정적 큐레이터 역할로 추천 이유 설명 (부정적 표현 금지)"),
      normal("파일: src/app/api/ai-search/route.ts, src/lib/claude-api.ts"),
      spacer(),

      bold("13-3. 심평원 데이터 동기화"),
      normal("심평원 hospInfoServicev2 API에서 전국 병원 데이터를 Supabase에 동기화"),
      normal("• 동기화 대상: 전체 진료과(SUBJECT_CODES) + 한의원/한방병원(clCd 91/92)"),
      normal("• 동기화 주기: 매일 03:00 UTC (Vercel Cron)"),
      normal("• 동기화 방식: 지역별 분할 실행 (Vercel 타임아웃 대응)"),
      normal("• 구글 별점: 동기화 시 별점 없는 상위 50개 병원 자동 조회+캐싱"),
      normal("• 검색 시에도 별점 없는 상위 5개 자동 조회+DB 캐싱 (점진적 축적)"),
      normal("파일: src/app/api/cron/sync/route.ts, src/lib/hira-api.ts, src/lib/google-places.ts"),
      spacer(),

      bold("13-4. 회원 레벨 시스템"),
      normal("레벨 0~30 + M(마스터). 포인트 기반, 비추천/마이너스 없음."),
      normal("• 글 작성 +5P, 댓글 +2P, 추천받기(글) +3P, 추천받기(댓글) +1P"),
      normal("• 출석 체크 +1P/일 (KST 0시 기준), AI 추천 이용 +2P, SNS 공유 +2P(일 3회)"),
      normal("• 레벨 0(읽기만) → 1(댓글) → 2(글쓰기) → 3(추천) → 5(이미지) → 10(닉네임컬러) → 30(최상위)"),
      normal("• 마스터(M): admin@2bstory.com — 최고 관리자"),
      normal("파일: src/lib/level-system.ts, src/components/LevelBadge.tsx"),
      spacer(),

      bold("13-5. 출석 체크"),
      normal("매일 1회 출석 시 +1P. 한국시간(KST) 0시 기준 갱신."),
      normal("localStorage로 클라이언트 관리 (kbbg_checkin_date, kbbg_checkin_streak)"),
      normal("연속 출석 스트릭(streak) 표시."),
      normal("파일: src/components/DailyCheckIn.tsx"),
      spacer(),

      bold("13-6. 광고 시스템"),
      normal("• 검색 결과 최상단에 광고 카드 1개 노출 (노란 배경, '광고' 라벨)"),
      normal("• 관리자 대시보드(/admin/ads)에서 등록/수정/삭제"),
      normal("• 광고 데이터: 병원명, 제목, 설명, 링크 URL, 활성 여부"),
      normal("파일: src/app/api/admin/ads/route.ts"),
      spacer(),

      bold("13-7. 이메일 알림 시스템"),
      normal("Resend API로 help@2bstory.com에 이메일 발송"),
      normal("• 운영자 상담 신청 (/api/consultation) → 이메일"),
      normal("• 일반 문의 (/api/contact) → 이메일"),
      normal("• 신고 접수 (/api/report-notify) → 이메일"),
      normal("RESEND_API_KEY 환경변수 필요. 없으면 이메일만 안 가고 DB 저장은 됨."),
      normal("파일: src/lib/email.ts"),
      spacer(),

      bold("13-8. 방문자 카운터"),
      normal("• Supabase daily_visitors 테이블에 일별 방문자 수 저장"),
      normal("• 세션당 1회만 카운트 (sessionStorage)"),
      normal("• 헤더에 '어제 방문자 : XXX,XXX명' 빨간 볼드로 표시"),
      normal("• KST 0시 기준 날짜 구분"),
      normal("파일: src/app/api/visitors/route.ts"),
      spacer(),

      // ═══ 14. 알려진 제한사항 ═══
      heading("14. 알려진 제한사항 및 주의사항"),
      normal("• Vercel 서버리스 타임아웃: 10초 (Pro: 60초)"),
      normal("• 구글 별점 조회: 페이지당 5개 제한 (API 비용)"),
      normal("• 심평원 Cron 동기화: 지역별 분할 실행 필요"),
      normal("• 네이버 플레이스 리뷰: API 미제공 (크롤링 불가)"),
      normal("• Resend 무료: 100건/일 이메일 한도"),
      normal("• 커뮤니티 게시글: 현재 시드 데이터 (Supabase 실연동 필요)"),
      spacer(),

      // ═══ 14. 성능 제약 ═══
      heading("15. 성능 및 비용"),
      bold("월간 예상 비용:"),
      normal("Vercel: 무료~$20"),
      normal("Supabase: 무료~$25 (Pro)"),
      normal("Claude API: $30~100"),
      normal("Google Places API: $0~50 ($200 무료 크레딧)"),
      normal("Resend: 무료 (100건/일)"),
      normal("합계: 약 $50~200/월"),
      spacer(),

      // ═══ 15. 패키지 의존성 ═══
      heading("16. 패키지 의존성"),
      bold("dependencies:"),
      ...Object.entries(pkg.dependencies || {}).map(([k, v]) => new Paragraph({ children: [new TextRun({ text: `  ${k}: ${v}`, font: "Consolas", size: 18 })] })),
      spacer(),
      bold("devDependencies:"),
      ...Object.entries(pkg.devDependencies || {}).map(([k, v]) => new Paragraph({ children: [new TextRun({ text: `  ${k}: ${v}`, font: "Consolas", size: 18 })] })),
      spacer(),

      // ═══ 16. 프로젝트 파일 구조 ═══
      heading("17. 프로젝트 소스 파일 구조"),
      ...tree.split("\n").filter(Boolean).map(l => new Paragraph({ children: [new TextRun({ text: l, font: "Consolas", size: 16 })] })),
      spacer(),

      // ═══ 17. Git 히스토리 ═══
      heading("18. Git 커밋 히스토리 (최근 50개)"),
      bold("Remote:"),
      ...gitRemote.split("\n").filter(Boolean).map(l => new Paragraph({ children: [new TextRun({ text: l, font: "Consolas", size: 18 })] })),
      spacer(),
      ...gitLog.split("\n").filter(Boolean).map(l => new Paragraph({ children: [new TextRun({ text: l, font: "Consolas", size: 18 })] })),
      spacer(),

      // ═══ 18. 작업 기록 ═══
      heading("19. 작업 기록 (Development Log)"),
      ...textToParas(devLog),
      spacer(),

      // ═══ 19. 구현 계획서 ═══
      heading("20. 구현 계획서"),
      ...textToParas(implPlan.slice(0, 5000)),
      normal("... (전체는 docs/IMPLEMENTATION_PLAN.md 참조)"),
    ],
  }],
});

const filePath = join(BACKUP_DIR, `KBBG_종합기술문서_${ts}.docx`);
const buffer = await Packer.toBuffer(doc);
writeFileSync(filePath, buffer);
console.log(`[doc] 종합 기술 문서 생성 완료: ${filePath}`);
