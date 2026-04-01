-- 병원 리뷰 분석용 컬럼 추가
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS google_place_id TEXT;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS procedure_scores JSONB DEFAULT NULL;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS review_analyzed_at TIMESTAMPTZ DEFAULT NULL;

-- procedure_scores 인덱스 (JSONB 검색용)
CREATE INDEX IF NOT EXISTS idx_clinics_procedure_scores ON clinics USING GIN (procedure_scores);
