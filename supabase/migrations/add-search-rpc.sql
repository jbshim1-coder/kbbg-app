-- 병원 검색 관련성 점수 RPC 함수
-- 상호 매칭 + 전문성 + 구글별점 + 종합병원 감점 + 다진료과 감점

CREATE OR REPLACE FUNCTION public.search_clinics_ranked(
  p_subject text DEFAULT '',
  p_keyword text DEFAULT '',
  p_region text DEFAULT '',
  p_type text DEFAULT '',
  p_page int DEFAULT 1,
  p_limit int DEFAULT 10
)
RETURNS TABLE (
  ykiho text,
  name text,
  cl_cd text,
  cl_cd_nm text,
  dgsbjt_cd text,
  dgsbjt_cd_nm text,
  address text,
  phone text,
  website text,
  dr_tot_cnt int,
  sdr_cnt int,
  sido_cd_nm text,
  sggu_cd_nm text,
  google_rating numeric,
  google_review_count int,
  relevance_score numeric,
  total_count bigint
) LANGUAGE plpgsql AS $$
DECLARE
  v_subject_name text := '';
  v_subject_short text := '';
  v_offset int := (p_page - 1) * p_limit;
BEGIN
  -- 진료과 코드에서 이름 추출
  IF p_subject != '' THEN
    SELECT
      CASE p_subject
        WHEN '01' THEN '내과'
        WHEN '02' THEN '신경과'
        WHEN '03' THEN '정신건강의학과'
        WHEN '04' THEN '외과'
        WHEN '05' THEN '정형외과'
        WHEN '06' THEN '신경외과'
        WHEN '08' THEN '성형외과'
        WHEN '09' THEN '마취통증의학과'
        WHEN '10' THEN '산부인과'
        WHEN '12' THEN '안과'
        WHEN '13' THEN '이비인후과'
        WHEN '14' THEN '피부과'
        WHEN '15' THEN '비뇨의학과'
        WHEN '21' THEN '재활의학과'
        WHEN '49' THEN '치과'
        WHEN '80' THEN '한방내과'
        ELSE ''
      END INTO v_subject_name;

    -- 짧은 이름 (과 제거): 피부과 → 피부, 성형외과 → 성형
    v_subject_short := REPLACE(REPLACE(v_subject_name, '외과', ''), '과', '');
    IF v_subject_short = '' THEN v_subject_short := v_subject_name; END IF;
  END IF;

  RETURN QUERY
  WITH scored AS (
    SELECT
      c.ykiho,
      c.name,
      c.cl_cd,
      c.cl_cd_nm,
      c.dgsbjt_cd,
      c.dgsbjt_cd_nm,
      c.address,
      c.phone,
      c.website,
      c.dr_tot_cnt,
      c.sdr_cnt,
      c.sido_cd_nm,
      c.sggu_cd_nm,
      c.google_rating,
      c.google_review_count,
      (
        -- 1) 상호 매칭 (최대 100점)
        CASE
          WHEN v_subject_name != '' AND c.name ILIKE '%' || v_subject_name || '%' THEN 100
          WHEN v_subject_short != '' AND c.name ILIKE '%' || v_subject_short || '%' THEN 80
          ELSE 0
        END
        -- 2) 전문의 비율 (최대 30점)
        + CASE
            WHEN c.dr_tot_cnt > 0 THEN LEAST(30, (COALESCE(c.sdr_cnt, 0)::numeric / c.dr_tot_cnt) * 30)
            ELSE 0
          END
        -- 3) 구글 별점 (최대 20점) — 별점×4, 리뷰수 로그 보정
        + CASE
            WHEN c.google_rating IS NOT NULL THEN
              LEAST(20, c.google_rating * 4 + LN(GREATEST(COALESCE(c.google_review_count, 0), 1)))
            ELSE 0
          END
        -- 4) 전문병원 보너스 (+20) — 의원/클리닉
        + CASE
            WHEN c.cl_cd IN ('31') OR c.name ILIKE '%의원%' OR c.name ILIKE '%클리닉%' THEN 20
            ELSE 0
          END
        -- 5) 종합병원 감점 (-20) — 모든 검색에 걸리는 문제 방지
        - CASE
            WHEN c.cl_cd IN ('01', '11') OR c.name ILIKE '%종합병원%' OR c.name ILIKE '%대학병원%' THEN 20
            ELSE 0
          END
        -- 6) 상호 불일치 → 점수 제거 (WHERE절에서 하드 제외됨)
        + 0
      )::numeric AS relevance_score,
      COUNT(*) OVER() AS total_count
    FROM public.clinics c
    WHERE c.is_active = true
      AND (p_subject = '' OR c.dgsbjt_cd = p_subject)
      AND (p_region = '' OR c.sido_cd = p_region)
      AND (p_keyword = '' OR c.name ILIKE '%' || p_keyword || '%' OR c.address ILIKE '%' || p_keyword || '%')
      AND (p_type = '' OR (p_type = 'korean_medicine' AND c.cl_cd IN ('91', '92')))
      -- 의원만 노출 (2차/종합/대학병원 제외, 내과/건강검진은 허용)
      AND (p_subject IN ('', '01') OR c.cl_cd IN ('31', '91', '92') OR c.cl_cd IS NULL)
      -- 상호에 다른 진료과명이 있으면 완전 제외 (인간 상식 기반)
      AND (v_subject_name = '' OR v_subject_name = '내과' OR NOT (
        (v_subject_name NOT LIKE '%소아%' AND c.name ILIKE '%소아%') OR
        (v_subject_name NOT LIKE '%산부%' AND c.name ILIKE '%산부인과%') OR
        (v_subject_name NOT LIKE '%정형%' AND c.name ILIKE '%정형%과%') OR
        (v_subject_name NOT LIKE '%신경%' AND c.name ILIKE '%신경%과%') OR
        (v_subject_name NOT LIKE '%안%' AND v_subject_name != '내과' AND c.name ILIKE '%안과%') OR
        (v_subject_name NOT LIKE '%치%' AND c.name ILIKE '%치과%') OR
        (v_subject_name NOT LIKE '%비뇨%' AND c.name ILIKE '%비뇨%') OR
        (v_subject_name NOT LIKE '%이비인후%' AND c.name ILIKE '%이비인후%') OR
        (v_subject_name NOT LIKE '%가정%' AND c.name ILIKE '%가정의학%')
      ))
  )
  SELECT * FROM scored
  ORDER BY scored.relevance_score DESC, scored.google_rating DESC NULLS LAST, scored.sdr_cnt DESC
  OFFSET v_offset LIMIT p_limit;
END;
$$;
