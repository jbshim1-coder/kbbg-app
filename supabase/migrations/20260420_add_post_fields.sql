-- posts 테이블에 flair, post_type, link_url 컬럼 추가
-- Supabase Dashboard > SQL Editor에서 실행

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS flair text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS post_type text DEFAULT 'text';
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS link_url text;
