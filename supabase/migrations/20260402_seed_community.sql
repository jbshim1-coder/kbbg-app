-- 커뮤니티 시드 데이터: boards + users + 샘플 posts
-- Supabase 대시보드 SQL Editor에서 실행

-- ─── 1. Boards 생성 ───
INSERT INTO boards (slug, name, name_en, description, category, sort_order, is_active)
VALUES
  ('plastic-surgery', '성형외과', 'Plastic Surgery', '성형외과 시술 후기와 질문', '후기', 1, true),
  ('dermatology', '피부과', 'Dermatology', '피부과 시술 후기와 질문', '후기', 2, true),
  ('dental', '치과', 'Dental', '치과 치료 후기와 질문', '후기', 3, true),
  ('general', '자유게시판', 'General', '자유로운 대화와 정보 공유', '자유', 4, true)
ON CONFLICT DO NOTHING;

-- ─── 2. 가짜 계정 80개 (auth.users + public.users) ───
-- 먼저 auth.users에 계정 생성 (비밀번호: Kbbg2026!)
-- 그 후 public.users에 프로필 생성

-- EN 10명
DO $$
DECLARE
  accounts text[][] := ARRAY[
    ['emily_nyc@kbbg-user.com','Emily_NYC','en'],
    ['james_la@kbbg-user.com','James_LA','en'],
    ['sophie_london@kbbg-user.com','Sophie_London','en'],
    ['mike_sydney@kbbg-user.com','Mike_Sydney','en'],
    ['rachel_toronto@kbbg-user.com','Rachel_Toronto','en'],
    ['david_chicago@kbbg-user.com','David_Chicago','en'],
    ['anna_seattle@kbbg-user.com','Anna_Seattle','en'],
    ['chris_miami@kbbg-user.com','Chris_Miami','en'],
    ['lisa_boston@kbbg-user.com','Lisa_Boston','en'],
    ['tom_denver@kbbg-user.com','Tom_Denver','en'],
    ['xiaomei_sh@kbbg-user.com','小美_上海','zh'],
    ['dawei_bj@kbbg-user.com','大伟_北京','zh'],
    ['lili_gz@kbbg-user.com','丽丽_广州','zh'],
    ['ming_sz@kbbg-user.com','明明_深圳','zh'],
    ['xiaohong_cd@kbbg-user.com','小红_成都','zh'],
    ['ajie_hz@kbbg-user.com','阿杰_杭州','zh'],
    ['tingting_nj@kbbg-user.com','婷婷_南京','zh'],
    ['xiaolong_wh@kbbg-user.com','小龙_武汉','zh'],
    ['meimei_cq@kbbg-user.com','美美_重庆','zh'],
    ['daming_tj@kbbg-user.com','大明_天津','zh'],
    ['yuki_tokyo@kbbg-user.com','ゆき_東京','ja'],
    ['hana_osaka@kbbg-user.com','はな_大阪','ja'],
    ['takashi_yoko@kbbg-user.com','たかし_横浜','ja'],
    ['sakura_kyoto@kbbg-user.com','さくら_京都','ja'],
    ['kenta_nagoya@kbbg-user.com','けんた_名古屋','ja'],
    ['ai_fukuoka@kbbg-user.com','あい_福岡','ja'],
    ['ryo_sapporo@kbbg-user.com','りょう_札幌','ja'],
    ['mai_kobe@kbbg-user.com','まい_神戸','ja'],
    ['sota_sendai@kbbg-user.com','そうた_仙台','ja'],
    ['miku_hiro@kbbg-user.com','みく_広島','ja'],
    ['anya_msk@kbbg-user.com','Аня_Москва','ru'],
    ['dima_spb@kbbg-user.com','Дима_СПб','ru'],
    ['katya_kzn@kbbg-user.com','Катя_Казань','ru'],
    ['sasha_sochi@kbbg-user.com','Саша_Сочи','ru'],
    ['oleg_ekb@kbbg-user.com','Олег_Екб','ru'],
    ['masha_nsk@kbbg-user.com','Маша_Нск','ru'],
    ['igor_vld@kbbg-user.com','Игорь_Влд','ru'],
    ['lena_krd@kbbg-user.com','Лена_Крд','ru'],
    ['max_rst@kbbg-user.com','Макс_Рст','ru'],
    ['nastya_ufa@kbbg-user.com','Настя_Уфа','ru'],
    ['linh_hcm@kbbg-user.com','Linh_HCM','vi'],
    ['minh_hn@kbbg-user.com','Minh_Hanoi','vi'],
    ['trang_dn@kbbg-user.com','Trang_DN','vi'],
    ['duc_hp@kbbg-user.com','Duc_HP','vi'],
    ['hoa_ct@kbbg-user.com','Hoa_CT','vi'],
    ['nam_hue@kbbg-user.com','Nam_Hue','vi'],
    ['lan_nt@kbbg-user.com','Lan_NT','vi'],
    ['tuan_vt@kbbg-user.com','Tuan_VT','vi'],
    ['mai_bn@kbbg-user.com','Mai_BN','vi'],
    ['hung_th@kbbg-user.com','Hung_TH','vi'],
    ['nid_bkk@kbbg-user.com','นิด_กรุงเทพ','th'],
    ['ton_cnx@kbbg-user.com','ต้น_เชียงใหม่','th'],
    ['prae_hkt@kbbg-user.com','แพร_ภูเก็ต','th'],
    ['boy_pty@kbbg-user.com','บอย_พัทยา','th'],
    ['mint_kkn@kbbg-user.com','มิ้นท์_ขอนแก่น','th'],
    ['j_hdy@kbbg-user.com','เจ_หาดใหญ่','th'],
    ['ann_udn@kbbg-user.com','แอน_อุดร','th'],
    ['gun_ryg@kbbg-user.com','กัน_ระยอง','th'],
    ['fa_nkr@kbbg-user.com','ฟ้า_นครราชสีมา','th'],
    ['may_srt@kbbg-user.com','เมย์_สุราษฎร์','th'],
    ['bold_ub@kbbg-user.com','Болд_УБ','mn'],
    ['sarnai_ub@kbbg-user.com','Сарнай_УБ','mn'],
    ['bat_dkh@kbbg-user.com','Бат_Дархан','mn'],
    ['oyuu_edn@kbbg-user.com','Оюу_Эрдэнэт','mn'],
    ['ganaa_ub@kbbg-user.com','Ганаа_УБ','mn'],
    ['tsetseg_ub@kbbg-user.com','Цэцэг_УБ','mn'],
    ['dorj_chr@kbbg-user.com','Дорж_Чойр','mn'],
    ['nomin_ub@kbbg-user.com','Номин_УБ','mn'],
    ['temuulen_ub@kbbg-user.com','Тэмүүлэн_УБ','mn'],
    ['enkhjin_ub@kbbg-user.com','Энхжин_УБ','mn'],
    ['jiyoung_sel@kbbg-user.com','지영_서울','ko'],
    ['hyunwoo_gn@kbbg-user.com','현우_강남','ko'],
    ['sujin_bs@kbbg-user.com','수진_부산','ko'],
    ['minho_dg@kbbg-user.com','민호_대구','ko'],
    ['yeeun_ic@kbbg-user.com','예은_인천','ko'],
    ['taehyun_gj@kbbg-user.com','태현_광주','ko'],
    ['sohee_dj@kbbg-user.com','소희_대전','ko'],
    ['junyoung_jj@kbbg-user.com','준영_제주','ko'],
    ['hana_sw@kbbg-user.com','하나_수원','ko'],
    ['sungmin_us@kbbg-user.com','성민_울산','ko']
  ];
  acc text[];
  uid uuid;
BEGIN
  FOREACH acc SLICE 1 IN ARRAY accounts LOOP
    -- auth.users에 계정 생성
    INSERT INTO auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(), 'authenticated', 'authenticated',
      acc[1],
      crypt('Kbbg2026!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('username', acc[2], 'language', acc[3]),
      now(), now(), ''
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO uid;

    -- public.users에 프로필 생성
    IF uid IS NOT NULL THEN
      INSERT INTO users (id, email, username, role, is_active)
      VALUES (uid, acc[1], acc[2], 'user', true)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;
