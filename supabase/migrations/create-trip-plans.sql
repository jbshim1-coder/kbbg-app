-- 3일 여정 플래너 테이블
CREATE TABLE IF NOT EXISTS trip_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  procedures TEXT[] NOT NULL DEFAULT '{}',
  arrival_date DATE NOT NULL,
  departure_date DATE NOT NULL,
  itinerary JSONB NOT NULL DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  locale TEXT DEFAULT 'en',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trip_plans_share ON trip_plans(share_token);
CREATE INDEX IF NOT EXISTS idx_trip_plans_user ON trip_plans(user_id);

ALTER TABLE trip_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trip_plans_select"
  ON trip_plans FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "trip_plans_insert"
  ON trip_plans FOR INSERT
  WITH CHECK (true);
