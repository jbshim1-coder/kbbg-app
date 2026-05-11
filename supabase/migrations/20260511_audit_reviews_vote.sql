-- ============================================================
-- Supabase Dashboard SQL 편집기에서 실행
-- https://supabase.com/dashboard/project/appqwvuseeenbmgoacrz/sql/new
-- ============================================================

-- 1. admin_audit_log 테이블 (C3 감사 로그)
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email text NOT NULL,
  action text NOT NULL,
  target_type text,
  target_id text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at
  ON public.admin_audit_log(created_at DESC);
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_audit_log' AND policyname='admin_audit_service_only') THEN
    CREATE POLICY admin_audit_service_only ON public.admin_audit_log USING (false);
  END IF;
END $$;

-- 2. clinic_reviews 테이블 (텍스트 리뷰)
CREATE TABLE IF NOT EXISTS public.clinic_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id text NOT NULL,
  entity_name text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL DEFAULT 'Anonymous',
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content text NOT NULL CHECK (char_length(content) BETWEEN 10 AND 1000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_clinic_reviews_entity_id
  ON public.clinic_reviews(entity_id);
CREATE INDEX IF NOT EXISTS idx_clinic_reviews_status
  ON public.clinic_reviews(status);
ALTER TABLE public.clinic_reviews ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='clinic_reviews' AND policyname='read_approved_reviews') THEN
    CREATE POLICY read_approved_reviews ON public.clinic_reviews FOR SELECT USING (status = 'approved');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='clinic_reviews' AND policyname='insert_own_review') THEN
    CREATE POLICY insert_own_review ON public.clinic_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 3. post_votes unique constraint + toggle RPC (C7/H3 race condition 방지)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='post_votes' AND constraint_type='UNIQUE'
  ) THEN
    ALTER TABLE public.post_votes ADD CONSTRAINT post_votes_post_id_user_id_key UNIQUE (post_id, user_id);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.toggle_post_vote(
  p_post_id uuid,
  p_user_id uuid,
  p_vote_type text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_id uuid;
  v_existing_type text;
  v_upvotes bigint;
  v_downvotes bigint;
  v_user_vote text;
BEGIN
  -- advisory lock으로 동일 (post, user) 쌍의 동시 요청을 직렬화
  PERFORM pg_advisory_xact_lock(
    ('x' || left(md5(p_post_id::text || p_user_id::text), 15))::bit(60)::bigint
  );

  SELECT id, vote_type INTO v_existing_id, v_existing_type
  FROM public.post_votes
  WHERE post_id = p_post_id AND user_id = p_user_id;

  IF v_existing_id IS NOT NULL THEN
    IF v_existing_type = p_vote_type THEN
      DELETE FROM public.post_votes WHERE id = v_existing_id;
      v_user_vote := NULL;
    ELSE
      UPDATE public.post_votes SET vote_type = p_vote_type WHERE id = v_existing_id;
      v_user_vote := p_vote_type;
    END IF;
  ELSE
    INSERT INTO public.post_votes (post_id, user_id, vote_type)
    VALUES (p_post_id, p_user_id, p_vote_type);
    v_user_vote := p_vote_type;
  END IF;

  SELECT COUNT(*) INTO v_upvotes FROM public.post_votes WHERE post_id = p_post_id AND vote_type = 'up';
  SELECT COUNT(*) INTO v_downvotes FROM public.post_votes WHERE post_id = p_post_id AND vote_type = 'down';
  UPDATE public.posts SET upvotes = v_upvotes, downvotes = v_downvotes WHERE id = p_post_id;

  RETURN jsonb_build_object('upvotes', v_upvotes, 'downvotes', v_downvotes, 'user_vote', v_user_vote);
END;
$$;
