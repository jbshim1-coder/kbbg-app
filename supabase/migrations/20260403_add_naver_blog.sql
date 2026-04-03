-- 네이버 블로그 평판 분석 컬럼 추가
-- Supabase SQL Editor에서 실행

ALTER TABLE clinics
  ADD COLUMN IF NOT EXISTS naver_blog_mentions int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS naver_positive_ratio numeric(5,2),
  ADD COLUMN IF NOT EXISTS naver_reputation_score numeric(6,2),
  ADD COLUMN IF NOT EXISTS naver_analyzed_at timestamptz,
  ADD COLUMN IF NOT EXISTS naver_query text;

-- 인덱스: 평판 점수 기반 정렬용
CREATE INDEX IF NOT EXISTS idx_clinics_naver_reputation
  ON clinics (naver_reputation_score DESC NULLS LAST);
