// 가짜 계정 80개 (8개 언어 × 10개) + 자동 글쓰기
// 실행: node scripts/fake-accounts.mjs

export const FAKE_ACCOUNTS = {
  en: [
    { name: "Emily_NYC", email: "emily_nyc@kbbg-user.com" },
    { name: "James_LA", email: "james_la@kbbg-user.com" },
    { name: "Sophie_London", email: "sophie_london@kbbg-user.com" },
    { name: "Mike_Sydney", email: "mike_sydney@kbbg-user.com" },
    { name: "Rachel_Toronto", email: "rachel_toronto@kbbg-user.com" },
    { name: "David_Chicago", email: "david_chicago@kbbg-user.com" },
    { name: "Anna_Seattle", email: "anna_seattle@kbbg-user.com" },
    { name: "Chris_Miami", email: "chris_miami@kbbg-user.com" },
    { name: "Lisa_Boston", email: "lisa_boston@kbbg-user.com" },
    { name: "Tom_Denver", email: "tom_denver@kbbg-user.com" },
  ],
  zh: [
    { name: "小美_上海", email: "xiaomei_sh@kbbg-user.com" },
    { name: "大伟_北京", email: "dawei_bj@kbbg-user.com" },
    { name: "丽丽_广州", email: "lili_gz@kbbg-user.com" },
    { name: "明明_深圳", email: "ming_sz@kbbg-user.com" },
    { name: "小红_成都", email: "xiaohong_cd@kbbg-user.com" },
    { name: "阿杰_杭州", email: "ajie_hz@kbbg-user.com" },
    { name: "婷婷_南京", email: "tingting_nj@kbbg-user.com" },
    { name: "小龙_武汉", email: "xiaolong_wh@kbbg-user.com" },
    { name: "美美_重庆", email: "meimei_cq@kbbg-user.com" },
    { name: "大明_天津", email: "daming_tj@kbbg-user.com" },
  ],
  ja: [
    { name: "ゆき_東京", email: "yuki_tokyo@kbbg-user.com" },
    { name: "はな_大阪", email: "hana_osaka@kbbg-user.com" },
    { name: "たかし_横浜", email: "takashi_yoko@kbbg-user.com" },
    { name: "さくら_京都", email: "sakura_kyoto@kbbg-user.com" },
    { name: "けんた_名古屋", email: "kenta_nagoya@kbbg-user.com" },
    { name: "あい_福岡", email: "ai_fukuoka@kbbg-user.com" },
    { name: "りょう_札幌", email: "ryo_sapporo@kbbg-user.com" },
    { name: "まい_神戸", email: "mai_kobe@kbbg-user.com" },
    { name: "そうた_仙台", email: "sota_sendai@kbbg-user.com" },
    { name: "みく_広島", email: "miku_hiro@kbbg-user.com" },
  ],
  ru: [
    { name: "Аня_Москва", email: "anya_msk@kbbg-user.com" },
    { name: "Дима_СПб", email: "dima_spb@kbbg-user.com" },
    { name: "Катя_Казань", email: "katya_kzn@kbbg-user.com" },
    { name: "Саша_Сочи", email: "sasha_sochi@kbbg-user.com" },
    { name: "Олег_Екб", email: "oleg_ekb@kbbg-user.com" },
    { name: "Маша_Нск", email: "masha_nsk@kbbg-user.com" },
    { name: "Игорь_Влд", email: "igor_vld@kbbg-user.com" },
    { name: "Лена_Крд", email: "lena_krd@kbbg-user.com" },
    { name: "Макс_Рст", email: "max_rst@kbbg-user.com" },
    { name: "Настя_Уфа", email: "nastya_ufa@kbbg-user.com" },
  ],
  vi: [
    { name: "Linh_HCM", email: "linh_hcm@kbbg-user.com" },
    { name: "Minh_Hanoi", email: "minh_hn@kbbg-user.com" },
    { name: "Trang_DN", email: "trang_dn@kbbg-user.com" },
    { name: "Duc_HP", email: "duc_hp@kbbg-user.com" },
    { name: "Hoa_CT", email: "hoa_ct@kbbg-user.com" },
    { name: "Nam_Hue", email: "nam_hue@kbbg-user.com" },
    { name: "Lan_NT", email: "lan_nt@kbbg-user.com" },
    { name: "Tuan_VT", email: "tuan_vt@kbbg-user.com" },
    { name: "Mai_BN", email: "mai_bn@kbbg-user.com" },
    { name: "Hung_TH", email: "hung_th@kbbg-user.com" },
  ],
  th: [
    { name: "นิด_กรุงเทพ", email: "nid_bkk@kbbg-user.com" },
    { name: "ต้น_เชียงใหม่", email: "ton_cnx@kbbg-user.com" },
    { name: "แพร_ภูเก็ต", email: "prae_hkt@kbbg-user.com" },
    { name: "บอย_พัทยา", email: "boy_pty@kbbg-user.com" },
    { name: "มิ้นท์_ขอนแก่น", email: "mint_kkn@kbbg-user.com" },
    { name: "เจ_หาดใหญ่", email: "j_hdy@kbbg-user.com" },
    { name: "แอน_อุดร", email: "ann_udn@kbbg-user.com" },
    { name: "กัน_ระยอง", email: "gun_ryg@kbbg-user.com" },
    { name: "ฟ้า_นครราชสีมา", email: "fa_nkr@kbbg-user.com" },
    { name: "เมย์_สุราษฎร์", email: "may_srt@kbbg-user.com" },
  ],
  mn: [
    { name: "Болд_УБ", email: "bold_ub@kbbg-user.com" },
    { name: "Сарнай_УБ", email: "sarnai_ub@kbbg-user.com" },
    { name: "Бат_Дархан", email: "bat_dkh@kbbg-user.com" },
    { name: "Оюу_Эрдэнэт", email: "oyuu_edn@kbbg-user.com" },
    { name: "Ганаа_УБ", email: "ganaa_ub@kbbg-user.com" },
    { name: "Цэцэг_УБ", email: "tsetseg_ub@kbbg-user.com" },
    { name: "Дорж_Чойр", email: "dorj_chr@kbbg-user.com" },
    { name: "Номин_УБ", email: "nomin_ub@kbbg-user.com" },
    { name: "Тэмүүлэн_УБ", email: "temuulen_ub@kbbg-user.com" },
    { name: "Энхжин_УБ", email: "enkhjin_ub@kbbg-user.com" },
  ],
  ko: [
    { name: "지영_서울", email: "jiyoung_sel@kbbg-user.com" },
    { name: "현우_강남", email: "hyunwoo_gn@kbbg-user.com" },
    { name: "수진_부산", email: "sujin_bs@kbbg-user.com" },
    { name: "민호_대구", email: "minho_dg@kbbg-user.com" },
    { name: "예은_인천", email: "yeeun_ic@kbbg-user.com" },
    { name: "태현_광주", email: "taehyun_gj@kbbg-user.com" },
    { name: "소희_대전", email: "sohee_dj@kbbg-user.com" },
    { name: "준영_제주", email: "junyoung_jj@kbbg-user.com" },
    { name: "하나_수원", email: "hana_sw@kbbg-user.com" },
    { name: "성민_울산", email: "sungmin_us@kbbg-user.com" },
  ],
};

// 전체 계정 리스트 출력
if (process.argv[1]?.endsWith("fake-accounts.mjs")) {
  let total = 0;
  for (const [lang, accounts] of Object.entries(FAKE_ACCOUNTS)) {
    console.log(`\n=== ${lang.toUpperCase()} (${accounts.length}개) ===`);
    accounts.forEach((a, i) => {
      console.log(`  ${i + 1}. ${a.name} — ${a.email}`);
      total++;
    });
  }
  console.log(`\n총 ${total}개 계정`);
}
