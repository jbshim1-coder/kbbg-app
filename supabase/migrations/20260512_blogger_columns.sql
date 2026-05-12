-- Blogger 교차 포스팅 추적 컬럼 추가
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS blogger_url TEXT,
  ADD COLUMN IF NOT EXISTS blogger_posted_at TIMESTAMPTZ;
