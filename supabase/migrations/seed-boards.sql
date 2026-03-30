-- boards 테이블에 16개 커뮤니티 카테고리 시드
-- Supabase SQL Editor에서 1회 실행

INSERT INTO public.boards (slug, name, name_en, category, sort_order) VALUES
  ('plastic_surgery', '성형외과', 'Plastic Surgery', 'medical', 1),
  ('dermatology', '피부과', 'Dermatology', 'medical', 2),
  ('internal_medicine', '내과', 'Internal Medicine', 'medical', 3),
  ('dental', '치과', 'Dental', 'medical', 4),
  ('ophthalmology', '안과', 'Ophthalmology', 'medical', 5),
  ('gynecology', '산부인과', 'OB/GYN', 'medical', 6),
  ('orthopedics', '정형외과', 'Orthopedics', 'medical', 7),
  ('oriental', '한의원', 'Korean Medicine', 'medical', 8),
  ('urology', '비뇨기과', 'Urology', 'medical', 9),
  ('ent', '이비인후과', 'ENT', 'medical', 10),
  ('kpop', 'K-Pop', 'K-Pop', 'culture', 11),
  ('kfood', 'K-Food', 'K-Food', 'culture', 12),
  ('kdrama', 'K-드라마', 'K-Drama', 'culture', 13),
  ('kfashion', 'K-패션', 'K-Fashion', 'culture', 14),
  ('travel', '한국 여행', 'Travel in Korea', 'culture', 15),
  ('korean_learn', '한국어 배우기', 'Learn Korean', 'culture', 16)
ON CONFLICT (slug) DO NOTHING;
