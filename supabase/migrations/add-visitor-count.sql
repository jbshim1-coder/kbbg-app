-- 일별 방문자 카운터 테이블
CREATE TABLE IF NOT EXISTS public.daily_visitors (
  date date PRIMARY KEY,
  count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 전체 공개 조회 허용
ALTER TABLE public.daily_visitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_visitors: public read" ON public.daily_visitors
  FOR SELECT USING (true);
CREATE POLICY "daily_visitors: service role write" ON public.daily_visitors
  FOR ALL USING (true) WITH CHECK (true);
