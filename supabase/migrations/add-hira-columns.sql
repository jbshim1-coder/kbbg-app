-- ============================================================
-- clinics 테이블에 심평원(HIRA) 전용 컬럼 추가
-- Supabase 대시보드 → SQL Editor에서 1회 실행
-- ============================================================

-- 심평원 고유 식별자
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS ykiho text UNIQUE;

-- 종별 (의원, 병원, 한의원, 한방병원 등)
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS cl_cd text;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS cl_cd_nm text;

-- 진료과목
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS dgsbjt_cd text;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS dgsbjt_cd_nm text;

-- 의료진 수
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS dr_tot_cnt integer DEFAULT 0;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS sdr_cnt integer DEFAULT 0;

-- 구글 별점
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS google_rating numeric(3,2);
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS google_review_count integer DEFAULT 0;

-- 동기화 시각
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS synced_at timestamptz;

-- 시도/시군구
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS sido_cd text;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS sido_cd_nm text;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS sggu_cd_nm text;

-- 검색/정렬용 인덱스
CREATE INDEX IF NOT EXISTS clinics_ykiho_idx ON public.clinics(ykiho);
CREATE INDEX IF NOT EXISTS clinics_dgsbjt_cd_idx ON public.clinics(dgsbjt_cd);
CREATE INDEX IF NOT EXISTS clinics_cl_cd_idx ON public.clinics(cl_cd);
CREATE INDEX IF NOT EXISTS clinics_sido_cd_idx ON public.clinics(sido_cd);
CREATE INDEX IF NOT EXISTS clinics_google_rating_idx ON public.clinics(google_rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS clinics_sdr_cnt_idx ON public.clinics(sdr_cnt DESC);
CREATE INDEX IF NOT EXISTS clinics_dr_tot_cnt_idx ON public.clinics(dr_tot_cnt DESC);

-- RLS: service role이 sync할 수 있도록 정책 추가
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'clinics' AND policyname = 'clinics: service role full access'
  ) THEN
    CREATE POLICY "clinics: service role full access" ON public.clinics
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
