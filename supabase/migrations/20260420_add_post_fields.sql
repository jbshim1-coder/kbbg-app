-- posts 테이블에 flair, post_type, link_url 컬럼 추가
-- Supabase Dashboard > SQL Editor에서 실행

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS flair text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS post_type text DEFAULT 'text';
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS link_url text;

-- 투표 테이블 (추천/비추천 영속화)
CREATE TABLE IF NOT EXISTS public.post_votes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  vote_type text NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS post_votes_post_id_idx ON public.post_votes(post_id);

-- RLS: 로그인 유저만 투표
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "post_votes: 조회 공개" ON public.post_votes FOR SELECT USING (true);
CREATE POLICY "post_votes: 로그인 투표" ON public.post_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_votes: 본인 삭제" ON public.post_votes FOR DELETE USING (auth.uid() = user_id);
