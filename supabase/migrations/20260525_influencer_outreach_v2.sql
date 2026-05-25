-- influencer_outreach 추적 컬럼 추가
ALTER TABLE influencer_outreach
  ADD COLUMN IF NOT EXISTS country_code   text,
  ADD COLUMN IF NOT EXISTS language       text,
  ADD COLUMN IF NOT EXISTS niche          text DEFAULT 'beauty',
  ADD COLUMN IF NOT EXISTS source_url     text,
  ADD COLUMN IF NOT EXISTS email_subject  text,
  ADD COLUMN IF NOT EXISTS email_body     text,
  ADD COLUMN IF NOT EXISTS resend_email_id text,
  ADD COLUMN IF NOT EXISTS opened_at      timestamptz,
  ADD COLUMN IF NOT EXISTS clicked_at     timestamptz;

-- status check constraint 확장 (opened, clicked, bounced 추가)
ALTER TABLE influencer_outreach
  DROP CONSTRAINT IF EXISTS influencer_outreach_status_check;

ALTER TABLE influencer_outreach
  ADD CONSTRAINT influencer_outreach_status_check
  CHECK (status IN ('found','emailed','opened','clicked','replied','unsubscribed','bounced'));
