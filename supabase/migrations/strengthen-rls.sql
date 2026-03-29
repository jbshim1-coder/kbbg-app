-- RLS 강화 마이그레이션
-- contact_inquiries: 누구나 INSERT, SELECT는 service_role만 (개인정보 보호)
-- clinics: SELECT 공개, INSERT/UPDATE/DELETE는 service_role만
-- daily_visitors: SELECT 공개, INSERT/UPDATE는 service_role만

-- =====================
-- contact_inquiries
-- =====================
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거 후 재설정
DROP POLICY IF EXISTS "contact_inquiries_insert" ON contact_inquiries;
DROP POLICY IF EXISTS "contact_inquiries_select" ON contact_inquiries;

-- 누구나 문의 제출 가능
CREATE POLICY "contact_inquiries_insert"
  ON contact_inquiries
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 개인정보 보호: service_role만 조회 가능
CREATE POLICY "contact_inquiries_select"
  ON contact_inquiries
  FOR SELECT
  TO service_role
  USING (true);

-- =====================
-- clinics
-- =====================
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clinics_select" ON clinics;
DROP POLICY IF EXISTS "clinics_insert" ON clinics;
DROP POLICY IF EXISTS "clinics_update" ON clinics;
DROP POLICY IF EXISTS "clinics_delete" ON clinics;

-- 모든 사용자가 병원 정보 조회 가능
CREATE POLICY "clinics_select"
  ON clinics
  FOR SELECT
  TO public
  USING (true);

-- 데이터 변경은 service_role만
CREATE POLICY "clinics_insert"
  ON clinics
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "clinics_update"
  ON clinics
  FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "clinics_delete"
  ON clinics
  FOR DELETE
  TO service_role
  USING (true);

-- =====================
-- daily_visitors
-- =====================
ALTER TABLE daily_visitors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "daily_visitors_select" ON daily_visitors;
DROP POLICY IF EXISTS "daily_visitors_insert" ON daily_visitors;
DROP POLICY IF EXISTS "daily_visitors_update" ON daily_visitors;

-- 방문자 수 집계는 공개
CREATE POLICY "daily_visitors_select"
  ON daily_visitors
  FOR SELECT
  TO public
  USING (true);

-- 기록/수정은 service_role만
CREATE POLICY "daily_visitors_insert"
  ON daily_visitors
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "daily_visitors_update"
  ON daily_visitors
  FOR UPDATE
  TO service_role
  USING (true);

-- =====================
-- users (본인만 조회/수정)
-- =====================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;

CREATE POLICY "users_select_own"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
