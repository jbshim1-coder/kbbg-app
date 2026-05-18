-- clinic_reviews 테이블에 애프터 사진 URL 배열 추가
-- 의료법 준수: 시술 전 사진 금지, 시술 후 사진만 허용
ALTER TABLE public.clinic_reviews
  ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';
