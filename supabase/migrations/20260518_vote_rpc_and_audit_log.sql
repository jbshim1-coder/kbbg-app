-- ============================================================
-- 1. admin_audit_log 테이블 (관리자 액션 감사 로그)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email text        NOT NULL,
  action      text        NOT NULL,
  target_type text,
  target_id   text,
  details     text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
-- service role만 접근 가능 (RLS 정책 없음 = service role 전용)

-- ============================================================
-- 2. toggle_post_vote RPC — 원자적 투표 토글 (advisory lock)
-- ============================================================
CREATE OR REPLACE FUNCTION toggle_post_vote(
  p_post_id  uuid,
  p_user_id  uuid,
  p_vote_type text
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_vote text;
  v_upvotes       int;
  v_downvotes     int;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_post_id::text || p_user_id::text));

  SELECT vote_type INTO v_existing_vote
  FROM post_votes
  WHERE post_id = p_post_id AND user_id = p_user_id;

  IF v_existing_vote IS NULL THEN
    INSERT INTO post_votes (post_id, user_id, vote_type)
    VALUES (p_post_id, p_user_id, p_vote_type);
  ELSIF v_existing_vote = p_vote_type THEN
    DELETE FROM post_votes WHERE post_id = p_post_id AND user_id = p_user_id;
  ELSE
    UPDATE post_votes SET vote_type = p_vote_type
    WHERE post_id = p_post_id AND user_id = p_user_id;
  END IF;

  SELECT
    COUNT(*) FILTER (WHERE vote_type = 'up'),
    COUNT(*) FILTER (WHERE vote_type = 'down')
  INTO v_upvotes, v_downvotes
  FROM post_votes WHERE post_id = p_post_id;

  UPDATE posts SET upvotes = v_upvotes, downvotes = v_downvotes WHERE id = p_post_id;

  RETURN json_build_object(
    'upvotes',   v_upvotes,
    'downvotes', v_downvotes,
    'user_vote', (SELECT vote_type FROM post_votes WHERE post_id = p_post_id AND user_id = p_user_id)
  );
END;
$$;

-- ============================================================
-- 3. cancel_post_vote RPC — 원자적 투표 취소 (advisory lock)
-- ============================================================
CREATE OR REPLACE FUNCTION cancel_post_vote(
  p_post_id uuid,
  p_user_id uuid
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_upvotes   int;
  v_downvotes int;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_post_id::text || p_user_id::text));

  DELETE FROM post_votes WHERE post_id = p_post_id AND user_id = p_user_id;

  SELECT
    COUNT(*) FILTER (WHERE vote_type = 'up'),
    COUNT(*) FILTER (WHERE vote_type = 'down')
  INTO v_upvotes, v_downvotes
  FROM post_votes WHERE post_id = p_post_id;

  UPDATE posts SET upvotes = v_upvotes, downvotes = v_downvotes WHERE id = p_post_id;

  RETURN json_build_object(
    'upvotes',   v_upvotes,
    'downvotes', v_downvotes,
    'user_vote', null
  );
END;
$$;
