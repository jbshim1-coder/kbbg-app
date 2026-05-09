-- posts 테이블에 rating 컬럼 추가 (리뷰 flair 전용, 1~5점)
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS rating smallint CHECK (rating >= 1 AND rating <= 5);
