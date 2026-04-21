-- 2026-04-21: 회원가입 시 public.users 자동 생성 + RLS 보강
-- Supabase Dashboard > SQL Editor에서 실행

-- ─── 1. 회원가입 시 public.users 자동 생성 트리거 ───
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'user',
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기존 트리거가 있으면 삭제 후 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 2. post_votes UPDATE 정책 추가 ───
CREATE POLICY "post_votes: 본인 수정" ON public.post_votes
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── 3. contact_inquiries RLS 강화 (로그인 유저만 insert) ───
-- 기존 너무 느슨한 정책 삭제 후 재생성
DO $$
BEGIN
  -- 기존 insert 정책이 있으면 삭제
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'contact_inquiries'
    AND policyname LIKE '%insert%'
    OR (tablename = 'contact_inquiries' AND policyname LIKE '%작성%')
  ) THEN
    DROP POLICY IF EXISTS "contact_inquiries: 누구나 작성" ON public.contact_inquiries;
    DROP POLICY IF EXISTS "contact_inquiries: insert" ON public.contact_inquiries;
  END IF;
END $$;

-- 로그인 유저만 문의 작성 가능
CREATE POLICY "contact_inquiries: 로그인 작성" ON public.contact_inquiries
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
