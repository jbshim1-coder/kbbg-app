-- 인플루언서 제휴 신청 테이블
create table if not exists influencer_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  sns_url text,
  followers text,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 관리자만 읽기/수정 가능 (RLS)
alter table influencer_applications enable row level security;

create policy "service_role_all" on influencer_applications
  for all using (true) with check (true);
