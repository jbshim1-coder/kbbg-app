// 프로그래매틱 SEO: 시술 × 지역 조합 데이터
// 외국인 의료관광객이 실제 검색하는 "Best [procedure] in [region]" 패턴

export interface SeoCombination {
  slug: string;           // URL slug: "gangnam-rhinoplasty"
  procedureSlug: string;  // procedure-guides.ts slug
  region: string;         // 한국어 지역명
  regionEn: string;       // 영문 지역명
  sidoCd: string;         // HIRA 시도코드
  sgguCd?: string;        // HIRA 시군구코드 (있으면)
  dgsbjtCd: string;       // HIRA 진료과목코드
  titleEn: string;        // SEO 타이틀 (영문)
  titleKo: string;        // SEO 타이틀 (한국어)
}

// 의료관광 핵심 지역 (외국인 수요 기준)
const REGIONS = [
  { en: "Seoul", ko: "서울", sido: "110000" },
  { en: "Gangnam", ko: "강남", sido: "110000", sggu: "230" },
  { en: "Seocho", ko: "서초", sido: "110000", sggu: "220" },
  { en: "Myeongdong", ko: "명동", sido: "110000", sggu: "110" },
  { en: "Hongdae", ko: "홍대", sido: "110000", sggu: "170" },
  { en: "Busan", ko: "부산", sido: "210000" },
  { en: "Daegu", ko: "대구", sido: "220000" },
  { en: "Incheon", ko: "인천", sido: "230000" },
  { en: "Jeju", ko: "제주", sido: "390000" },
  { en: "Gyeonggi", ko: "경기", sido: "310000" },
] as const;

// 외국인 수요 높은 시술 (procedure slug + 진료과코드)
const PROCEDURES = [
  // 성형외과 (08)
  { slug: "double-eyelid-surgery", en: "Double Eyelid Surgery", ko: "쌍꺼풀 수술", cd: "08" },
  { slug: "rhinoplasty", en: "Rhinoplasty", ko: "코성형", cd: "08" },
  { slug: "facial-contouring", en: "Facial Contouring", ko: "윤곽수술", cd: "08" },
  { slug: "liposuction", en: "Liposuction", ko: "지방흡입", cd: "08" },
  { slug: "botox", en: "Botox", ko: "보톡스", cd: "08" },
  { slug: "dermal-filler", en: "Dermal Filler", ko: "필러", cd: "08" },
  { slug: "breast-augmentation", en: "Breast Augmentation", ko: "가슴성형", cd: "08" },
  // 피부과 (14)
  { slug: "laser-toning", en: "Laser Toning", ko: "레이저 토닝", cd: "14" },
  { slug: "ultherapy", en: "Ultherapy", ko: "울쎄라", cd: "14" },
  { slug: "skin-lifting", en: "Skin Lifting", ko: "피부 리프팅", cd: "14" },
  { slug: "acne-treatment", en: "Acne Treatment", ko: "여드름 치료", cd: "14" },
  { slug: "under-eye-fat-removal", en: "Under Eye Fat Removal", ko: "눈밑지방제거", cd: "14" },
  { slug: "wrinkle-treatment", en: "Wrinkle Treatment", ko: "주름 치료", cd: "14" },
  // 치과 (49)
  { slug: "teeth-whitening", en: "Teeth Whitening", ko: "치아미백", cd: "49" },
  { slug: "dental-braces", en: "Dental Braces", ko: "치아교정", cd: "49" },
  { slug: "dental-implant", en: "Dental Implant", ko: "임플란트", cd: "49" },
  { slug: "dental-veneer", en: "Dental Veneer", ko: "치아 베니어", cd: "49" },
  // 안과 (12)
  { slug: "lasik-lasek", en: "LASIK/LASEK", ko: "라식/라섹", cd: "12" },
  { slug: "hair-transplant", en: "Hair Transplant", ko: "모발이식", cd: "08" },
] as const;

// 모든 조합 생성
function generateCombinations(): SeoCombination[] {
  const combos: SeoCombination[] = [];
  for (const region of REGIONS) {
    for (const proc of PROCEDURES) {
      combos.push({
        slug: `${region.en.toLowerCase()}-${proc.slug}`,
        procedureSlug: proc.slug,
        region: region.ko,
        regionEn: region.en,
        sidoCd: region.sido,
        sgguCd: "sggu" in region ? region.sggu : undefined,
        dgsbjtCd: proc.cd,
        titleEn: `Best ${proc.en} Clinics in ${region.en}, Korea`,
        titleKo: `${region.ko} ${proc.ko} 추천 클리닉`,
      });
    }
  }
  return combos;
}

export const seoCombinations = generateCombinations();

// slug로 조합 조회
export function getCombinationBySlug(slug: string): SeoCombination | undefined {
  return seoCombinations.find((c) => c.slug === slug);
}

// 전체 slug 목록 (generateStaticParams용)
export function getAllCombinationSlugs(): string[] {
  return seoCombinations.map((c) => c.slug);
}
