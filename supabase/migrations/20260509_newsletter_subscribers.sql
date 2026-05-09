-- 뉴스레터 구독자 테이블
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL,
  locale text NOT NULL DEFAULT 'en',
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT newsletter_subscribers_email_unique UNIQUE (email)
);

-- 이메일 인덱스
CREATE INDEX IF NOT EXISTS newsletter_subscribers_email_idx ON public.newsletter_subscribers(email);

-- RLS: 읽기 불가 (서비스 롤만 접근)
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "newsletter: 서비스 롤만 접근" ON public.newsletter_subscribers
  USING (false);
