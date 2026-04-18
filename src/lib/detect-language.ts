// 텍스트에서 언어를 감지하고 국기 이모지를 반환한다
// 유니코드 범위 기반 간단한 클라이언트 사이드 감지 (API 비용 없음)

export type DetectedLang = {
  lang: string;
  flag: string;
};

const LANG_MAP: Array<{ test: (text: string) => boolean; lang: string; flag: string }> = [
  // 한글 (U+AC00~U+D7AF)
  { test: (t) => /[\uAC00-\uD7AF]/.test(t), lang: "ko", flag: "🇰🇷" },
  // 히라가나/가타카나 (U+3040~U+30FF)
  { test: (t) => /[\u3040-\u30FF]/.test(t), lang: "ja", flag: "🇯🇵" },
  // 태국 문자 (U+0E00~U+0E7F)
  { test: (t) => /[\u0E00-\u0E7F]/.test(t), lang: "th", flag: "🇹🇭" },
  // 키릴 문자 (U+0400~U+04FF)
  { test: (t) => /[\u0400-\u04FF]/.test(t), lang: "ru", flag: "🇷🇺" },
  // 몽골 문자 (U+1800~U+18AF)
  { test: (t) => /[\u1800-\u18AF]/.test(t), lang: "mn", flag: "🇲🇳" },
  // CJK (U+4E00~U+9FFF) — 히라가나/가타카나 이후에 체크해야 일본어와 구분
  { test: (t) => /[\u4E00-\u9FFF]/.test(t), lang: "zh", flag: "🇨🇳" },
  // 베트남어 특수문자
  { test: (t) => /[ăơưđÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂƠƯĐ]/.test(t), lang: "vi", flag: "🇻🇳" },
];

export function detectLanguage(text: string): DetectedLang {
  for (const entry of LANG_MAP) {
    if (entry.test(text)) return { lang: entry.lang, flag: entry.flag };
  }
  // 나머지 라틴 → 영어
  return { lang: "en", flag: "🇺🇸" };
}

// 언어 코드 → locale별 언어명 (예: "태국어로 작성됨" 표시용)
const LANG_NAMES: Record<string, Record<string, string>> = {
  ko: { ko: "한국어", en: "Korean", zh: "韩语", ja: "韓国語", vi: "Tiếng Hàn", th: "ภาษาเกาหลี", ru: "Корейский", mn: "Солонгос хэл" },
  en: { ko: "영어", en: "English", zh: "英语", ja: "英語", vi: "Tiếng Anh", th: "ภาษาอังกฤษ", ru: "Английский", mn: "Англи хэл" },
  ja: { ko: "일본어", en: "Japanese", zh: "日语", ja: "日本語", vi: "Tiếng Nhật", th: "ภาษาญี่ปุ่น", ru: "Японский", mn: "Япон хэл" },
  zh: { ko: "중국어", en: "Chinese", zh: "中文", ja: "中国語", vi: "Tiếng Trung", th: "ภาษาจีน", ru: "Китайский", mn: "Хятад хэл" },
  ru: { ko: "러시아어", en: "Russian", zh: "俄语", ja: "ロシア語", vi: "Tiếng Nga", th: "ภาษารัสเซีย", ru: "Русский", mn: "Орос хэл" },
  th: { ko: "태국어", en: "Thai", zh: "泰语", ja: "タイ語", vi: "Tiếng Thái", th: "ภาษาไทย", ru: "Тайский", mn: "Тай хэл" },
  vi: { ko: "베트남어", en: "Vietnamese", zh: "越南语", ja: "ベトナム語", vi: "Tiếng Việt", th: "ภาษาเวียดนาม", ru: "Вьетнамский", mn: "Вьетнам хэл" },
  mn: { ko: "몽골어", en: "Mongolian", zh: "蒙古语", ja: "モンゴル語", vi: "Tiếng Mông Cổ", th: "ภาษามองโกเลีย", ru: "Монгольский", mn: "Монгол хэл" },
};

export function getLangName(lang: string, locale: string): string {
  return LANG_NAMES[lang]?.[locale] ?? LANG_NAMES[lang]?.en ?? lang;
}
