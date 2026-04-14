-- 인플루언서 제휴 신청 테이블
CREATE TABLE IF NOT EXISTS influencer_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  sns_url TEXT,
  followers TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE influencer_applications ENABLE ROW LEVEL SECURITY;

-- 누구나 insert 가능 (신청 폼)
CREATE POLICY "Anyone can insert influencer application"
  ON influencer_applications FOR INSERT
  WITH CHECK (true);

-- 읽기는 service role만 (관리자 API에서 조회)
CREATE POLICY "Service role can read influencer applications"
  ON influencer_applications FOR SELECT
  USING (auth.role() = 'service_role');
