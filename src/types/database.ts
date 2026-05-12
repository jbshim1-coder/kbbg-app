// ============================================================
// kbbg-app 데이터베이스 TypeScript 타입 정의
// Supabase 스키마와 1:1 대응
// ============================================================

// ============================================================
// 공통 타입
// ============================================================
export type UserRole = 'user' | 'admin' | 'moderator'         // 사용자 권한 레벨
export type Gender = 'male' | 'female' | 'other'               // 성별
export type VoteType = 'up' | 'down'                           // 추천/비추천
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed' // 신고 처리 상태
export type RecommendationStatus = 'pending' | 'processing' | 'completed' | 'failed' // AI 추천 진행 상태
export type AdType = 'banner' | 'sponsored' | 'listing'        // 광고 유형
export type InquiryStatus = 'open' | 'in_progress' | 'resolved' | 'closed'  // 문의 처리 상태

// ============================================================
// 테이블 Row 타입 (DB에서 읽어올 때)
// ============================================================

// 사용자 계정 기본 정보 — auth.users와 연동
export interface User {
  id: string            // UUID (auth.users.id와 동일)
  email: string
  username: string | null
  avatar_url: string | null
  role: UserRole        // 권한 레벨 (기본값: 'user')
  is_active: boolean    // 계정 활성화 여부 (탈퇴/정지 시 false)
  created_at: string
  updated_at: string
}

// 게시글 투표 — 추천/비추천 기록
export interface PostVote {
  id: string
  post_id: string
  user_id: string
  vote_type: VoteType
  created_at: string
}

// 사용자 프로필 확장 정보 — User와 1:1 관계
export interface UserProfile {
  id: string
  user_id: string                          // users.id 외래키
  country_code: string | null              // ISO 3166-1 alpha-2 국가 코드
  language_code: string                    // 선호 언어 코드 (기본값: 'en')
  full_name: string | null
  phone: string | null
  birth_year: number | null
  gender: Gender | null
  interested_procedures: string[] | null   // 관심 시술 ID 배열
  bio: string | null                       // 자기소개
  created_at: string
  updated_at: string
}

// 병원(클리닉) 정보
export interface Clinic {
  id: string
  name: string                 // 한국어 병원명
  name_en: string | null       // 영문 병원명
  description: string | null
  address: string | null
  city: string | null
  country_code: string         // 소재 국가 코드 (주로 'KR')
  latitude: number | null      // 지도 표시용 위도
  longitude: number | null     // 지도 표시용 경도
  phone: string | null
  email: string | null
  website: string | null
  kakao_id: string | null      // 카카오톡 채널 ID
  wechat_id: string | null     // 위챗 ID (중국 고객 대응)
  supports_english: boolean    // 영어 상담 가능 여부
  supports_chinese: boolean    // 중국어 상담 가능 여부
  supports_japanese: boolean   // 일본어 상담 가능 여부
  supports_thai: boolean       // 태국어 상담 가능 여부
  is_verified: boolean         // 투비스토리 인증 병원 여부
  is_active: boolean           // 서비스 노출 여부
  rating_avg: number | null    // 평균 평점 (리뷰 집계값)
  review_count: number         // 누적 리뷰 수
  created_at: string
  updated_at: string
  // HIRA 심평원 데이터 컬럼
  ykiho: string | null
  cl_cd: string | null
  cl_cd_nm: string | null
  dgsbjt_cd: string | null
  dgsbjt_cd_nm: string | null
  dr_tot_cnt: number
  sdr_cnt: number | null
  google_rating: number | null
  google_review_count: number | null
  synced_at: string | null
  sido_cd: string | null
  sido_cd_nm: string | null
  sggu_cd_nm: string | null
  google_place_id: string | null
  procedure_scores: Record<string, number> | null
  review_analyzed_at: string | null
  naver_blog_mentions: number | null
  naver_positive_ratio: number | null
  naver_reputation_score: number | null
  naver_analyzed_at: string | null
  naver_query: string | null
}

// 의사 정보 — 병원 소속
export interface Doctor {
  id: string
  clinic_id: string            // 소속 병원 ID (clinics.id 외래키)
  name: string                 // 한국어 의사명
  name_en: string | null       // 영문 의사명
  specialty: string | null     // 전문 분야 (예: 성형외과, 피부과)
  license_number: string | null // 의사 면허 번호
  bio: string | null           // 의사 소개
  photo_url: string | null     // 프로필 사진 URL
  is_representative: boolean   // 대표 의사 여부
  is_active: boolean           // 서비스 노출 여부
  created_at: string
  updated_at: string
}

// 시술 카탈로그 — 병원에서 제공하는 시술 종류
export interface Procedure {
  id: string
  name: string              // 한국어 시술명
  name_en: string | null    // 영문 시술명
  category: string          // 시술 카테고리 (예: 쌍꺼풀, 코성형)
  description: string | null
  icon_url: string | null   // 시술 대표 아이콘 URL
  sort_order: number        // 목록 표시 순서 (낮을수록 먼저)
  is_active: boolean        // 서비스 노출 여부
  created_at: string
  updated_at: string
}

// 병원별 시술 가격 정보 — clinic과 procedure의 중간 테이블
export interface ClinicProcedurePrice {
  id: string
  clinic_id: string          // 병원 ID (clinics.id 외래키)
  procedure_id: string       // 시술 ID (procedures.id 외래키)
  price_min: number | null   // 최저 가격
  price_max: number | null   // 최고 가격
  currency: string           // 통화 코드 (예: KRW, USD)
  price_note: string | null  // 가격 관련 안내 문구
  is_negotiable: boolean     // 가격 협의 가능 여부
  is_active: boolean         // 노출 여부
  created_at: string
  updated_at: string
}

// 게시판 정보 — 커뮤니티 게시판 카테고리
export interface Board {
  id: string
  slug: string              // URL에 사용되는 고유 식별자 (예: 'review', 'qna')
  name: string              // 한국어 게시판명
  name_en: string | null    // 영문 게시판명
  description: string | null
  category: string          // 게시판 분류 (예: 후기, 질문)
  sort_order: number        // 목록 표시 순서
  is_active: boolean        // 서비스 노출 여부
  created_at: string
  updated_at: string
}

// 게시글 정보
export interface Post {
  id: string
  board_id: string        // 소속 게시판 ID
  author_id: string       // 작성자 ID (users.id 외래키)
  title: string
  title_en: string | null // 영문 번역 제목 (자동 번역)
  content: string         // 본문 (마크다운 또는 HTML)
  images: string[] | null // 첨부 이미지 URL 배열
  upvotes: number         // 추천 수
  downvotes: number       // 비추천 수
  view_count: number      // 조회 수
  comment_count: number   // 댓글 수 (캐시된 집계값)
  is_pinned: boolean      // 공지 고정 여부
  is_deleted: boolean     // 소프트 삭제 여부 (실제 삭제 대신 플래그 처리)
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  parent_id: string | null  // null이면 최상위 댓글
  content: string
  upvotes: number
  downvotes: number
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface Vote {
  id: string
  user_id: string
  post_id: string | null
  comment_id: string | null
  vote_type: VoteType
  created_at: string
  updated_at: string
}

export interface Report {
  id: string
  reporter_id: string
  post_id: string | null
  comment_id: string | null
  reason: string
  description: string | null
  status: ReportStatus
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

// AI 추천 세션 — 한 번의 추천 요청 단위
export interface RecommendationSession {
  id: string
  user_id: string | null          // 로그인 사용자 ID (비로그인 시 null)
  session_token: string | null    // 비로그인 사용자 식별용 토큰
  procedure_id: string | null     // 추천 대상 시술 ID
  requirements: Record<string, unknown> | null  // 사용자 요구사항 (jsonb)
  status: RecommendationStatus    // 추천 처리 진행 상태
  created_at: string
  updated_at: string
}

// AI 추천 결과 — 세션당 여러 병원이 순위별로 저장됨
export interface RecommendationResult {
  id: string
  session_id: string          // 소속 추천 세션 ID
  clinic_id: string           // 추천된 병원 ID
  rank: number                // 추천 순위 (1이 가장 높음)
  score: number | null        // AI 매칭 점수
  reason: string | null       // 추천 이유 텍스트
  price_estimate: number | null // 예상 가격 (KRW)
  created_at: string
  updated_at: string
}

// 광고 캠페인 — 병원이 등록하는 유료 광고 집행 단위
export interface AdsCampaign {
  id: string
  clinic_id: string                  // 광고주 병원 ID
  name: string                       // 캠페인 이름
  type: AdType                       // 광고 유형 (배너/스폰서/리스팅)
  target_boards: string[] | null     // 노출 대상 게시판 ID 배열 (null이면 전체)
  target_countries: string[] | null  // 노출 대상 국가 코드 배열 (null이면 전체)
  budget_daily: number | null        // 일일 예산 (KRW)
  budget_total: number | null        // 총 예산 (KRW)
  starts_at: string                  // 캠페인 시작일시
  ends_at: string | null             // 캠페인 종료일시 (null이면 무기한)
  is_active: boolean                 // 현재 집행 중 여부
  created_at: string
  updated_at: string
}

export interface AdsImpression {
  id: string
  campaign_id: string
  user_id: string | null
  session_id: string | null
  page_path: string | null
  created_at: string
  updated_at: string
}

export interface AdsClick {
  id: string
  campaign_id: string
  user_id: string | null
  session_id: string | null
  page_path: string | null
  created_at: string
  updated_at: string
}

// 자주 묻는 질문 — 국가/언어별로 다른 내용 제공 가능
export interface Faq {
  id: string
  category: string              // FAQ 분류 (예: 예약, 결제, 시술)
  country_code: string | null   // 특정 국가 대상 FAQ (null이면 공통)
  language_code: string         // 표시 언어 코드
  question: string              // 질문 텍스트
  answer: string                // 답변 텍스트
  sort_order: number            // 목록 표시 순서
  is_active: boolean            // 서비스 노출 여부
  created_at: string
  updated_at: string
}

// 문의 내역 — 사용자가 제출한 1:1 문의
export interface ContactInquiry {
  id: string
  user_id: string | null        // 로그인 사용자 ID (비로그인 시 null)
  name: string                  // 문의자 이름
  email: string                 // 답변 받을 이메일
  phone: string | null
  country_code: string | null   // 문의자 국가 코드
  category: string              // 문의 유형 (예: 예약, 불만, 제휴)
  subject: string               // 문의 제목
  message: string               // 문의 내용
  status: InquiryStatus         // 처리 상태
  assigned_to: string | null    // 담당 직원 ID
  resolved_at: string | null    // 처리 완료 일시
  created_at: string
  updated_at: string
}

// ============================================================
// Insert 타입 (생성 시 사용 — id, created_at, updated_at 제외)
// ============================================================

export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'>
export type UserProfileInsert = Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>
export type ClinicInsert = Omit<Clinic, 'id' | 'created_at' | 'updated_at'>
export type DoctorInsert = Omit<Doctor, 'id' | 'created_at' | 'updated_at'>
export type ProcedureInsert = Omit<Procedure, 'id' | 'created_at' | 'updated_at'>
export type ClinicProcedurePriceInsert = Omit<ClinicProcedurePrice, 'id' | 'created_at' | 'updated_at'>
export type BoardInsert = Omit<Board, 'id' | 'created_at' | 'updated_at'>
export type PostInsert = Omit<Post, 'id' | 'created_at' | 'updated_at'>
export type CommentInsert = Omit<Comment, 'id' | 'created_at' | 'updated_at'>
export type VoteInsert = Omit<Vote, 'id' | 'created_at' | 'updated_at'>
export type ReportInsert = Omit<Report, 'id' | 'created_at' | 'updated_at'>
export type RecommendationSessionInsert = Omit<RecommendationSession, 'id' | 'created_at' | 'updated_at'>
export type RecommendationResultInsert = Omit<RecommendationResult, 'id' | 'created_at' | 'updated_at'>
export type AdsCampaignInsert = Omit<AdsCampaign, 'id' | 'created_at' | 'updated_at'>
export type AdsImpressionInsert = Omit<AdsImpression, 'id' | 'created_at' | 'updated_at'>
export type AdsClickInsert = Omit<AdsClick, 'id' | 'created_at' | 'updated_at'>
export type FaqInsert = Omit<Faq, 'id' | 'created_at' | 'updated_at'>
export type ContactInquiryInsert = Omit<ContactInquiry, 'id' | 'created_at' | 'updated_at'>

// ============================================================
// Update 타입 (수정 시 사용 — 모든 필드 선택적)
// ============================================================

export type UserUpdate = Partial<UserInsert>
export type UserProfileUpdate = Partial<UserProfileInsert>
export type ClinicUpdate = Partial<ClinicInsert>
export type DoctorUpdate = Partial<DoctorInsert>
export type ProcedureUpdate = Partial<ProcedureInsert>
export type ClinicProcedurePriceUpdate = Partial<ClinicProcedurePriceInsert>
export type BoardUpdate = Partial<BoardInsert>
export type PostUpdate = Partial<PostInsert>
export type CommentUpdate = Partial<CommentInsert>
export type ReportUpdate = Partial<ReportInsert>
export type RecommendationSessionUpdate = Partial<RecommendationSessionInsert>
export type AdsCampaignUpdate = Partial<AdsCampaignInsert>
export type FaqUpdate = Partial<FaqInsert>
export type ContactInquiryUpdate = Partial<ContactInquiryInsert>

// ============================================================
// Supabase Database 타입 (제네릭 쿼리에 사용)
// ============================================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: UserInsert
        Update: UserUpdate
      }
      user_profiles: {
        Row: UserProfile
        Insert: UserProfileInsert
        Update: UserProfileUpdate
      }
      clinics: {
        Row: Clinic
        Insert: ClinicInsert
        Update: ClinicUpdate
      }
      doctors: {
        Row: Doctor
        Insert: DoctorInsert
        Update: DoctorUpdate
      }
      procedures: {
        Row: Procedure
        Insert: ProcedureInsert
        Update: ProcedureUpdate
      }
      clinic_procedure_prices: {
        Row: ClinicProcedurePrice
        Insert: ClinicProcedurePriceInsert
        Update: ClinicProcedurePriceUpdate
      }
      boards: {
        Row: Board
        Insert: BoardInsert
        Update: BoardUpdate
      }
      posts: {
        Row: Post
        Insert: PostInsert
        Update: PostUpdate
      }
      comments: {
        Row: Comment
        Insert: CommentInsert
        Update: CommentUpdate
      }
      votes: {
        Row: Vote
        Insert: VoteInsert
        Update: Pick<Vote, 'vote_type'>  // vote_type만 변경 허용
      }
      post_votes: {
        Row: PostVote
        Insert: Omit<PostVote, 'id' | 'created_at'>
        Update: Pick<PostVote, 'vote_type'>
      }
      reports: {
        Row: Report
        Insert: ReportInsert
        Update: ReportUpdate
      }
      recommendation_sessions: {
        Row: RecommendationSession
        Insert: RecommendationSessionInsert
        Update: RecommendationSessionUpdate
      }
      recommendation_results: {
        Row: RecommendationResult
        Insert: RecommendationResultInsert
        Update: Partial<RecommendationResultInsert>
      }
      ads_campaigns: {
        Row: AdsCampaign
        Insert: AdsCampaignInsert
        Update: AdsCampaignUpdate
      }
      ads_impressions: {
        Row: AdsImpression
        Insert: AdsImpressionInsert
        Update: Partial<AdsImpressionInsert>
      }
      ads_clicks: {
        Row: AdsClick
        Insert: AdsClickInsert
        Update: Partial<AdsClickInsert>
      }
      faqs: {
        Row: Faq
        Insert: FaqInsert
        Update: FaqUpdate
      }
      contact_inquiries: {
        Row: ContactInquiry
        Insert: ContactInquiryInsert
        Update: ContactInquiryUpdate
      }
    }
  }
}

// ============================================================
// 조인 포함 확장 타입 (자주 쓰는 뷰 형태)
// ============================================================

/** 게시글 + 작성자 정보 */
export interface PostWithAuthor extends Post {
  author: Pick<User, 'id' | 'username' | 'avatar_url'>
}

/** 댓글 + 작성자 + 대댓글 */
export interface CommentWithReplies extends Comment {
  author: Pick<User, 'id' | 'username' | 'avatar_url'>
  replies?: CommentWithReplies[]
}

/** 병원 + 시술 가격 목록 */
export interface ClinicWithPrices extends Clinic {
  prices: (ClinicProcedurePrice & { procedure: Procedure })[]
}

/** 추천 결과 + 병원 상세 */
export interface RecommendationResultWithClinic extends RecommendationResult {
  clinic: Clinic
}
