-- 마취과 전문의 상주 뱃지 컬럼 추가
-- anesthesia_sdr_count: 해당 병원의 마취통증의학과(09) 전문의 수
-- safe_anesthesia_badge: 마취과 전문의 1명 이상 상주 여부 (뱃지 표시 기준)

ALTER TABLE public.clinics
  ADD COLUMN IF NOT EXISTS anesthesia_sdr_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS safe_anesthesia_badge boolean DEFAULT false;
