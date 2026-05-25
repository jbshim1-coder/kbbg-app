-- admin_set_clinic_status RPC — advisory lock으로 동시 상태 변경 직렬화
CREATE OR REPLACE FUNCTION public.admin_set_clinic_status(
  p_clinic_id uuid,
  p_action text
)
RETURNS TABLE (
  id uuid,
  is_active boolean,
  is_verified boolean,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_action NOT IN ('activate', 'deactivate', 'verify', 'unverify') THEN
    RAISE EXCEPTION 'Invalid action: %', p_action;
  END IF;

  -- 같은 clinic row 동시 변경 직렬화
  PERFORM pg_advisory_xact_lock(hashtext('clinic_status:' || p_clinic_id::text));

  RETURN QUERY
  UPDATE public.clinics c
  SET
    is_active = CASE
      WHEN p_action = 'activate' THEN true
      WHEN p_action = 'deactivate' THEN false
      ELSE c.is_active
    END,
    is_verified = CASE
      WHEN p_action = 'verify' THEN true
      WHEN p_action = 'unverify' THEN false
      ELSE c.is_verified
    END,
    updated_at = now()
  WHERE c.id = p_clinic_id
  RETURNING c.id, c.is_active, c.is_verified, c.updated_at;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Clinic not found: %', p_clinic_id;
  END IF;
END;
$$;
