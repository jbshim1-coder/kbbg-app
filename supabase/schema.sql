-- ============================================================
-- kbbg-app 데이터베이스 스키마
-- Supabase PostgreSQL용 전체 DDL
-- ============================================================

-- UUID 확장 활성화
create extension if not exists "uuid-ossp";

-- ============================================================
-- 공통 타임스탬프 트리거 함수
-- ============================================================
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- 1. users (Supabase Auth와 연동되는 사용자 기본 정보)
-- ============================================================
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  username    text unique,
  avatar_url  text,
  role        text not null default 'user' check (role in ('user', 'admin', 'moderator')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger users_updated_at
  before update on public.users
  for each row execute function handle_updated_at();

-- ============================================================
-- 2. user_profiles (사용자 상세 프로필 — 국가, 언어, 관심 시술)
-- ============================================================
create table if not exists public.user_profiles (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null unique references public.users(id) on delete cascade,
  country_code        text,                        -- ISO 3166-1 alpha-2 (KR, CN, TH 등)
  language_code       text not null default 'ko',  -- BCP 47 언어 코드
  full_name           text,
  phone               text,
  birth_year          int,
  gender              text check (gender in ('male', 'female', 'other')),
  interested_procedures text[],                    -- 관심 시술 ID 목록
  bio                 text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function handle_updated_at();

-- ============================================================
-- 3. clinics (병원 기본 정보)
-- ============================================================
create table if not exists public.clinics (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  name_en             text,
  description         text,
  address             text,
  city                text,
  country_code        text not null default 'KR',
  latitude            double precision,
  longitude           double precision,
  phone               text,
  email               text,
  website             text,
  kakao_id            text,
  wechat_id           text,
  -- 외국어 지원 여부
  supports_english    boolean not null default false,
  supports_chinese    boolean not null default false,
  supports_japanese   boolean not null default false,
  supports_thai       boolean not null default false,
  -- 병원 상태
  is_verified         boolean not null default false,
  is_active           boolean not null default true,
  -- 평점 (집계 캐시)
  rating_avg          numeric(3,2) default 0,
  review_count        int not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger clinics_updated_at
  before update on public.clinics
  for each row execute function handle_updated_at();

-- ============================================================
-- 4. doctors (의사/원장 정보)
-- ============================================================
create table if not exists public.doctors (
  id              uuid primary key default uuid_generate_v4(),
  clinic_id       uuid not null references public.clinics(id) on delete cascade,
  name            text not null,
  name_en         text,
  specialty       text,               -- 전문 분야 (성형외과, 피부과 등)
  license_number  text,
  bio             text,
  photo_url       text,
  is_representative boolean not null default false,  -- 대표원장 여부
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger doctors_updated_at
  before update on public.doctors
  for each row execute function handle_updated_at();

-- ============================================================
-- 5. procedures (시술 종류 마스터)
-- ============================================================
create table if not exists public.procedures (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  name_en     text,
  category    text not null,  -- plastic_surgery, dermatology, dental 등
  description text,
  icon_url    text,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger procedures_updated_at
  before update on public.procedures
  for each row execute function handle_updated_at();

-- ============================================================
-- 6. clinic_procedure_prices (병원별 시술 가격)
-- ============================================================
create table if not exists public.clinic_procedure_prices (
  id              uuid primary key default uuid_generate_v4(),
  clinic_id       uuid not null references public.clinics(id) on delete cascade,
  procedure_id    uuid not null references public.procedures(id) on delete cascade,
  price_min       numeric(12,2),      -- 최소 가격
  price_max       numeric(12,2),      -- 최대 가격
  currency        text not null default 'KRW',
  price_note      text,               -- 가격 설명 (옵션에 따라 다름 등)
  is_negotiable   boolean not null default false,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (clinic_id, procedure_id)
);

create trigger clinic_procedure_prices_updated_at
  before update on public.clinic_procedure_prices
  for each row execute function handle_updated_at();

-- ============================================================
-- 7. boards (게시판 카테고리)
-- ============================================================
create table if not exists public.boards (
  id          uuid primary key default uuid_generate_v4(),
  slug        text not null unique,   -- plastic-surgery, dermatology, dental 등
  name        text not null,
  name_en     text,
  description text,
  category    text not null,          -- 최상위 분류
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger boards_updated_at
  before update on public.boards
  for each row execute function handle_updated_at();

-- ============================================================
-- 8. posts (게시글)
-- ============================================================
create table if not exists public.posts (
  id            uuid primary key default uuid_generate_v4(),
  board_id      uuid not null references public.boards(id) on delete restrict,
  author_id     uuid not null references public.users(id) on delete cascade,
  title         text not null,
  content       text not null,
  images        text[],               -- 첨부 이미지 URL 목록
  -- 통계 (집계 캐시)
  upvotes       int not null default 0,
  downvotes     int not null default 0,
  view_count    int not null default 0,
  comment_count int not null default 0,
  -- 상태
  is_pinned     boolean not null default false,
  is_deleted    boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index posts_board_id_idx on public.posts(board_id);
create index posts_author_id_idx on public.posts(author_id);
create index posts_created_at_idx on public.posts(created_at desc);

create trigger posts_updated_at
  before update on public.posts
  for each row execute function handle_updated_at();

-- ============================================================
-- 9. comments (댓글 — 대댓글 지원)
-- ============================================================
create table if not exists public.comments (
  id          uuid primary key default uuid_generate_v4(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  author_id   uuid not null references public.users(id) on delete cascade,
  parent_id   uuid references public.comments(id) on delete cascade,  -- null이면 최상위 댓글
  content     text not null,
  upvotes     int not null default 0,
  downvotes   int not null default 0,
  is_deleted  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index comments_post_id_idx on public.comments(post_id);
create index comments_parent_id_idx on public.comments(parent_id);

create trigger comments_updated_at
  before update on public.comments
  for each row execute function handle_updated_at();

-- ============================================================
-- 10. votes (게시글/댓글 추천·비추천)
-- ============================================================
create table if not exists public.votes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  post_id     uuid references public.posts(id) on delete cascade,
  comment_id  uuid references public.comments(id) on delete cascade,
  vote_type   text not null check (vote_type in ('up', 'down')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- post 또는 comment 중 하나만 가져야 함
  constraint votes_target_check check (
    (post_id is not null and comment_id is null) or
    (post_id is null and comment_id is not null)
  ),
  -- 동일 대상에 중복 투표 방지
  unique nulls not distinct (user_id, post_id, comment_id)
);

create trigger votes_updated_at
  before update on public.votes
  for each row execute function handle_updated_at();

-- ============================================================
-- 11. reports (신고)
-- ============================================================
create table if not exists public.reports (
  id              uuid primary key default uuid_generate_v4(),
  reporter_id     uuid not null references public.users(id) on delete cascade,
  -- 신고 대상 (게시글 또는 댓글)
  post_id         uuid references public.posts(id) on delete cascade,
  comment_id      uuid references public.comments(id) on delete cascade,
  reason          text not null,  -- spam, abuse, misinformation 등
  description     text,
  status          text not null default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by     uuid references public.users(id),
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint reports_target_check check (
    (post_id is not null and comment_id is null) or
    (post_id is null and comment_id is not null)
  )
);

create trigger reports_updated_at
  before update on public.reports
  for each row execute function handle_updated_at();

-- ============================================================
-- 12. recommendation_sessions (AI 추천 세션)
-- ============================================================
create table if not exists public.recommendation_sessions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references public.users(id) on delete set null,  -- 비로그인 허용
  session_token   text unique,        -- 비로그인 사용자 세션 식별
  procedure_id    uuid references public.procedures(id),
  requirements    jsonb,              -- 사용자가 입력한 요구사항 (예산, 선호도 등)
  status          text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger recommendation_sessions_updated_at
  before update on public.recommendation_sessions
  for each row execute function handle_updated_at();

-- ============================================================
-- 13. recommendation_results (AI 추천 결과)
-- ============================================================
create table if not exists public.recommendation_results (
  id              uuid primary key default uuid_generate_v4(),
  session_id      uuid not null references public.recommendation_sessions(id) on delete cascade,
  clinic_id       uuid not null references public.clinics(id) on delete cascade,
  rank            int not null,       -- 추천 순위
  score           numeric(5,4),       -- 추천 점수 (0.0000 ~ 1.0000)
  reason          text,               -- AI가 생성한 추천 이유
  price_estimate  numeric(12,2),      -- 예상 가격
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (session_id, clinic_id)
);

create trigger recommendation_results_updated_at
  before update on public.recommendation_results
  for each row execute function handle_updated_at();

-- ============================================================
-- 14. ads_campaigns (광고 캠페인)
-- ============================================================
create table if not exists public.ads_campaigns (
  id              uuid primary key default uuid_generate_v4(),
  clinic_id       uuid not null references public.clinics(id) on delete cascade,
  name            text not null,
  type            text not null check (type in ('banner', 'sponsored', 'listing')),
  target_boards   uuid[],             -- 노출할 게시판 ID 목록 (null이면 전체)
  target_countries text[],            -- 타겟 국가 코드 목록
  budget_daily    numeric(12,2),
  budget_total    numeric(12,2),
  starts_at       timestamptz not null,
  ends_at         timestamptz,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger ads_campaigns_updated_at
  before update on public.ads_campaigns
  for each row execute function handle_updated_at();

-- ============================================================
-- 15. ads_impressions (광고 노출 기록)
-- ============================================================
create table if not exists public.ads_impressions (
  id          uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.ads_campaigns(id) on delete cascade,
  user_id     uuid references public.users(id) on delete set null,
  session_id  text,                   -- 비로그인 세션 식별
  page_path   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index ads_impressions_campaign_id_idx on public.ads_impressions(campaign_id);
create index ads_impressions_created_at_idx on public.ads_impressions(created_at desc);

create trigger ads_impressions_updated_at
  before update on public.ads_impressions
  for each row execute function handle_updated_at();

-- ============================================================
-- 16. ads_clicks (광고 클릭 기록)
-- ============================================================
create table if not exists public.ads_clicks (
  id          uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.ads_campaigns(id) on delete cascade,
  user_id     uuid references public.users(id) on delete set null,
  session_id  text,
  page_path   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index ads_clicks_campaign_id_idx on public.ads_clicks(campaign_id);

create trigger ads_clicks_updated_at
  before update on public.ads_clicks
  for each row execute function handle_updated_at();

-- ============================================================
-- 17. faqs (자주 묻는 질문 — 국가별, 카테고리별)
-- ============================================================
create table if not exists public.faqs (
  id              uuid primary key default uuid_generate_v4(),
  category        text not null,      -- visa, insurance, procedure, payment 등
  country_code    text,               -- null이면 전체 공통
  language_code   text not null default 'ko',
  question        text not null,
  answer          text not null,
  sort_order      int not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger faqs_updated_at
  before update on public.faqs
  for each row execute function handle_updated_at();

-- ============================================================
-- 18. contact_inquiries (1:1 문의)
-- ============================================================
create table if not exists public.contact_inquiries (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references public.users(id) on delete set null,
  name            text not null,
  email           text not null,
  phone           text,
  country_code    text,
  category        text not null,  -- general, clinic, technical, report 등
  subject         text not null,
  message         text not null,
  status          text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to     uuid references public.users(id),
  resolved_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger contact_inquiries_updated_at
  before update on public.contact_inquiries
  for each row execute function handle_updated_at();

-- ============================================================
-- RLS (Row Level Security) 활성화
-- ============================================================
alter table public.users                    enable row level security;
alter table public.user_profiles            enable row level security;
alter table public.clinics                  enable row level security;
alter table public.doctors                  enable row level security;
alter table public.procedures               enable row level security;
alter table public.clinic_procedure_prices  enable row level security;
alter table public.boards                   enable row level security;
alter table public.posts                    enable row level security;
alter table public.comments                 enable row level security;
alter table public.votes                    enable row level security;
alter table public.reports                  enable row level security;
alter table public.recommendation_sessions  enable row level security;
alter table public.recommendation_results   enable row level security;
alter table public.ads_campaigns            enable row level security;
alter table public.ads_impressions          enable row level security;
alter table public.ads_clicks               enable row level security;
alter table public.faqs                     enable row level security;
alter table public.contact_inquiries        enable row level security;

-- ============================================================
-- RLS 정책: users
-- ============================================================
-- 본인 레코드만 조회/수정 가능, 관리자는 전체 접근
create policy "users: 본인만 조회" on public.users
  for select using (auth.uid() = id);

create policy "users: 본인만 수정" on public.users
  for update using (auth.uid() = id);

-- ============================================================
-- RLS 정책: user_profiles
-- ============================================================
create policy "user_profiles: 본인만 조회" on public.user_profiles
  for select using (auth.uid() = user_id);

create policy "user_profiles: 본인만 수정" on public.user_profiles
  for update using (auth.uid() = user_id);

create policy "user_profiles: 본인만 삽입" on public.user_profiles
  for insert with check (auth.uid() = user_id);

-- ============================================================
-- RLS 정책: clinics (공개 읽기, 관리자 쓰기)
-- ============================================================
create policy "clinics: 전체 공개 조회" on public.clinics
  for select using (is_active = true);

-- ============================================================
-- RLS 정책: doctors (공개 읽기)
-- ============================================================
create policy "doctors: 전체 공개 조회" on public.doctors
  for select using (is_active = true);

-- ============================================================
-- RLS 정책: procedures (공개 읽기)
-- ============================================================
create policy "procedures: 전체 공개 조회" on public.procedures
  for select using (is_active = true);

-- ============================================================
-- RLS 정책: clinic_procedure_prices (공개 읽기)
-- ============================================================
create policy "clinic_procedure_prices: 전체 공개 조회" on public.clinic_procedure_prices
  for select using (is_active = true);

-- ============================================================
-- RLS 정책: boards (공개 읽기)
-- ============================================================
create policy "boards: 전체 공개 조회" on public.boards
  for select using (is_active = true);

-- ============================================================
-- RLS 정책: posts
-- ============================================================
-- 삭제되지 않은 게시글은 전체 공개
create policy "posts: 전체 공개 조회" on public.posts
  for select using (is_deleted = false);

-- 로그인한 사용자만 게시글 작성 가능
create policy "posts: 로그인 사용자만 작성" on public.posts
  for insert with check (auth.uid() = author_id);

-- 본인 게시글만 수정/삭제 가능
create policy "posts: 본인만 수정" on public.posts
  for update using (auth.uid() = author_id);

create policy "posts: 본인만 삭제" on public.posts
  for delete using (auth.uid() = author_id);

-- ============================================================
-- RLS 정책: comments
-- ============================================================
create policy "comments: 전체 공개 조회" on public.comments
  for select using (is_deleted = false);

create policy "comments: 로그인 사용자만 작성" on public.comments
  for insert with check (auth.uid() = author_id);

create policy "comments: 본인만 수정" on public.comments
  for update using (auth.uid() = author_id);

create policy "comments: 본인만 삭제" on public.comments
  for delete using (auth.uid() = author_id);

-- ============================================================
-- RLS 정책: votes
-- ============================================================
create policy "votes: 로그인 사용자만 조회" on public.votes
  for select using (auth.uid() = user_id);

create policy "votes: 로그인 사용자만 투표" on public.votes
  for insert with check (auth.uid() = user_id);

create policy "votes: 본인 투표만 변경" on public.votes
  for update using (auth.uid() = user_id);

create policy "votes: 본인 투표만 취소" on public.votes
  for delete using (auth.uid() = user_id);

-- ============================================================
-- RLS 정책: reports (신고는 본인만 조회)
-- ============================================================
create policy "reports: 본인 신고만 조회" on public.reports
  for select using (auth.uid() = reporter_id);

create policy "reports: 로그인 사용자만 신고" on public.reports
  for insert with check (auth.uid() = reporter_id);

-- ============================================================
-- RLS 정책: recommendation_sessions
-- ============================================================
create policy "recommendation_sessions: 본인 세션만 조회" on public.recommendation_sessions
  for select using (auth.uid() = user_id);

create policy "recommendation_sessions: 누구나 생성 가능" on public.recommendation_sessions
  for insert with check (true);

-- ============================================================
-- RLS 정책: recommendation_results
-- ============================================================
create policy "recommendation_results: 세션 소유자만 조회" on public.recommendation_results
  for select using (
    exists (
      select 1 from public.recommendation_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

-- ============================================================
-- RLS 정책: ads_campaigns (공개 읽기)
-- ============================================================
create policy "ads_campaigns: 활성 캠페인 공개 조회" on public.ads_campaigns
  for select using (is_active = true);

-- ============================================================
-- RLS 정책: ads_impressions / ads_clicks (삽입만 허용)
-- ============================================================
create policy "ads_impressions: 누구나 기록 가능" on public.ads_impressions
  for insert with check (true);

create policy "ads_clicks: 누구나 기록 가능" on public.ads_clicks
  for insert with check (true);

-- ============================================================
-- RLS 정책: faqs (공개 읽기)
-- ============================================================
create policy "faqs: 전체 공개 조회" on public.faqs
  for select using (is_active = true);

-- ============================================================
-- RLS 정책: contact_inquiries
-- ============================================================
create policy "contact_inquiries: 본인 문의만 조회" on public.contact_inquiries
  for select using (auth.uid() = user_id);

create policy "contact_inquiries: 누구나 문의 가능" on public.contact_inquiries
  for insert with check (true);
