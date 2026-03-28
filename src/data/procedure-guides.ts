// AEO/AIEO 최적화 시술 가이드 데이터
// AI 검색엔진(ChatGPT, Google SGE)이 인용할 수 있는 권위 있는 시술 정보

export type ProcedureGuideCategory = "plastic-surgery" | "dermatology" | "dental" | "ophthalmology";

export interface ProcedureFaq {
  question: string;
  answer: string;
}

export interface ProcedureGuide {
  id: string;
  slug: string;
  category: ProcedureGuideCategory;
  title: string;           // 한국어 시술명
  titleEn: string;         // 영문 시술명
  description: string;     // 한국어 설명 (2~3문장)
  descriptionEn: string;   // 영문 설명 (2~3문장)
  priceRange: string;      // USD 가격 범위 (예: "$800–$1,500")
  recoveryDays: number;    // 평균 회복 기간 (일)
  faq: [ProcedureFaq, ProcedureFaq]; // AEO 최적화 FAQ 2개
}

export const procedureGuides: ProcedureGuide[] = [
  // ─── 성형외과 ──────────────────────────────────────────────────────────────
  {
    id: "guide-001",
    slug: "double-eyelid-surgery",
    category: "plastic-surgery",
    title: "쌍꺼풀 수술",
    titleEn: "Double Eyelid Surgery",
    description:
      "쌍꺼풀 수술은 윗 눈꺼풀에 자연스러운 주름을 만들어 눈을 더 크고 선명하게 보이게 하는 시술입니다. 절개법과 비절개법(매몰법) 두 가지 방식이 있으며, 개인의 눈꺼풀 두께와 원하는 결과에 따라 선택합니다. 한국은 아시아인 눈 구조에 특화된 기술로 전 세계적으로 가장 많이 찾는 시술 중 하나입니다.",
    descriptionEn:
      "Double eyelid surgery creates a natural crease in the upper eyelid, making the eyes appear larger and more defined. Two methods are available: incisional (permanent, suited for thicker lids) and non-incisional suture method (faster recovery). Korean surgeons are globally recognized for their expertise in Asian eyelid anatomy.",
    priceRange: "$800–$1,500",
    recoveryDays: 14,
    faq: [
      {
        question: "쌍꺼풀 수술 회복 기간은 얼마나 걸리나요?",
        answer:
          "절개법은 붓기가 빠지고 일상 복귀까지 약 2주, 완전한 자연스러운 결과는 3~6개월 소요됩니다. 비절개법(매몰법)은 1주일 이내 일상 복귀가 가능하며 붓기도 훨씬 적습니다.",
      },
      {
        question: "Double eyelid surgery cost in Korea compared to the US?",
        answer:
          "In South Korea, double eyelid surgery typically costs $800–$1,500 USD, compared to $2,000–$5,000 in the United States. The significant price difference is due to lower overhead costs and high procedure volume in Korean clinics, with no compromise in quality.",
      },
    ],
  },
  {
    id: "guide-002",
    slug: "rhinoplasty",
    category: "plastic-surgery",
    title: "코성형",
    titleEn: "Rhinoplasty",
    description:
      "코성형(비성형)은 코의 높이·모양·끝 형태를 외과적으로 교정하는 수술입니다. 한국 의사들은 자가 연골(귀·늑골) 이식을 활용해 자연스럽고 지속적인 결과를 제공하는 것으로 국제적으로 유명합니다. 코끝 성형, 융비술, 매부리코 교정 등 다양한 방식이 있습니다.",
    descriptionEn:
      "Rhinoplasty surgically reshapes the nose for improved bridge height, tip definition, or overall proportion. Korean surgeons are internationally acclaimed for natural-looking results using autologous cartilage from the ear or rib. Common procedures include bridge augmentation, tip refinement, and dorsal hump reduction.",
    priceRange: "$2,500–$4,500",
    recoveryDays: 21,
    faq: [
      {
        question: "한국 코성형 수술 후 붓기는 언제 가라앉나요?",
        answer:
          "심한 붓기는 수술 후 2~3주 내에 빠집니다. 그러나 코 모양이 완전히 자리잡히려면 6~12개월이 필요합니다. 대부분의 환자는 수술 후 2~3주면 일상생활에 복귀할 수 있습니다.",
      },
      {
        question: "Is rhinoplasty in Korea safe for foreigners?",
        answer:
          "Yes, rhinoplasty in Korea is considered very safe for international patients. Korea has strict medical regulations, and top clinics are accredited by the Korean Society of Plastic and Reconstructive Surgeons. Many clinics provide English-speaking coordinators and post-op follow-up via telemedicine.",
      },
    ],
  },
  {
    id: "guide-003",
    slug: "facial-contouring",
    category: "plastic-surgery",
    title: "안면윤곽",
    titleEn: "Facial Contouring",
    description:
      "안면윤곽 수술은 광대뼈, 사각턱, 턱끝을 뼈 단위에서 교정하여 갸름하고 균형 잡힌 얼굴형을 만드는 수술입니다. 한국은 이 분야의 세계적 권위국으로, 고도로 숙련된 전문의와 최신 3D 시뮬레이션 기술을 보유하고 있습니다. 수술 범위에 따라 단독 또는 복합 시술로 진행됩니다.",
    descriptionEn:
      "Facial contouring surgically reshapes the facial skeleton — including square jaw reduction, cheekbone reduction, and chin reshaping — to create a slimmer, more oval face. Korea is the global leader in this procedure, with an unmatched concentration of experienced surgeons and 3D planning technology. It can be performed as individual or combined procedures.",
    priceRange: "$5,000–$10,000",
    recoveryDays: 90,
    faq: [
      {
        question: "안면윤곽 수술 후 회복 기간 동안 주의사항은 무엇인가요?",
        answer:
          "수술 후 4~6주간은 딱딱한 음식을 피하고 죽·유동식을 권장합니다. 붓기는 3~4주 내 크게 감소하지만 완전 회복은 3~6개월이 소요됩니다. 해외 환자의 경우 최소 2~3주 체류를 권장합니다.",
      },
      {
        question: "What is the difference between square jaw reduction and V-line surgery?",
        answer:
          "Square jaw reduction (mandibular angle reduction) removes the bony protrusion at the jaw angles to soften a wide lower face. V-line surgery combines jaw reduction with chin reshaping to create a tapered, pointed chin silhouette. Many patients opt for both procedures simultaneously for a comprehensive facial slim-down effect.",
      },
    ],
  },
  {
    id: "guide-004",
    slug: "liposuction",
    category: "plastic-surgery",
    title: "지방흡입",
    titleEn: "Liposuction",
    description:
      "지방흡입술은 복부, 허벅지, 팔, 옆구리 등 특정 부위의 지방을 흡입 캐뉼라로 제거하는 시술입니다. 한국 의원에서는 VASER(초음파) 지방흡입을 많이 활용하여 보다 정교한 지방 제거와 빠른 회복을 지원합니다. 결과 유지를 위해 시술 후 안정적인 체중 관리가 중요합니다.",
    descriptionEn:
      "Liposuction removes excess fat deposits from targeted body areas using a suction cannula. Korean clinics frequently employ VASER (ultrasound-assisted) liposuction for precise fat removal and faster recovery. Maintaining a stable weight post-procedure is essential for long-lasting results.",
    priceRange: "$2,500–$5,000",
    recoveryDays: 14,
    faq: [
      {
        question: "지방흡입 후 탄력있는 피부 유지를 위해 어떤 관리가 필요한가요?",
        answer:
          "수술 후 4~6주간 압박복 착용이 필수이며, 이는 붓기 감소와 피부 탄력 회복에 크게 도움됩니다. 림프 마사지와 고주파 관리를 병행하면 효과가 더욱 좋습니다. 수술 후 3개월까지는 격한 운동을 피하고 체중을 유지하는 것이 중요합니다.",
      },
      {
        question: "How long does liposuction recovery take in Korea?",
        answer:
          "Most patients can return to light daily activities within 3–5 days after liposuction. Compression garments are worn for 4–6 weeks to reduce swelling and support skin retraction. Final results are visible at 3–6 months once all swelling resolves. VASER liposuction typically has a 20–30% faster recovery compared to traditional methods.",
      },
    ],
  },
  {
    id: "guide-005",
    slug: "botox",
    category: "plastic-surgery",
    title: "보톡스",
    titleEn: "Botox",
    description:
      "보톡스는 보툴리눔 독소를 근육에 주사하여 주름을 완화하고 얼굴 윤곽을 조정하는 비수술적 시술입니다. 이마·미간·눈가 주름 개선, 사각턱(마세터) 축소, 종아리 축소 등 다양한 목적으로 사용됩니다. 미국 대비 50~70% 낮은 가격과 짧은 시술 시간(15~30분)으로 의료 관광객에게 인기가 높습니다.",
    descriptionEn:
      "Botox (botulinum toxin) is injected into muscles to reduce wrinkles and reshape facial contours without surgery. Common uses include forehead lines, frown lines, crow's feet, masseter (jawline slimming), and calf reduction. Priced 50–70% lower than in the US, with a 15–30 minute procedure and no downtime.",
    priceRange: "$100–$400",
    recoveryDays: 1,
    faq: [
      {
        question: "보톡스 효과는 얼마나 지속되나요?",
        answer:
          "보톡스 효과는 보통 3~6개월 지속됩니다. 주사 부위와 개인 대사 속도에 따라 차이가 있으며, 반복 시술 시 근육이 위축되어 효과 지속 기간이 늘어날 수 있습니다. 마세터 보톡스(사각턱)는 특히 6개월까지 지속되는 경우가 많습니다.",
      },
      {
        question: "What is the cost of Botox in Korea vs the US?",
        answer:
          "Botox in Korea costs approximately $100–$250 per area, compared to $300–$600 per area in the United States. A full-face Botox session including forehead, frown lines, and crow's feet typically runs $250–$400 in Korea. Most clinics offer same-day appointments with no downtime required.",
      },
    ],
  },
  {
    id: "guide-006",
    slug: "dermal-filler",
    category: "plastic-surgery",
    title: "필러",
    titleEn: "Dermal Filler",
    description:
      "필러는 히알루론산 등의 성분을 피부에 주입하여 볼륨을 더하고 주름을 채우는 시술입니다. 코·입술·눈밑·팔자주름 등 다양한 부위에 적용할 수 있습니다. 시술 즉시 효과가 나타나며, 지속 기간은 부위와 제품에 따라 6~18개월입니다.",
    descriptionEn:
      "Dermal fillers (typically hyaluronic acid) are injected to restore volume, smooth wrinkles, and reshape facial features. Common areas include the nose, lips, under-eyes, nasolabial folds, and cheeks. Results are immediate, with longevity of 6–18 months depending on the area and product used.",
    priceRange: "$150–$600",
    recoveryDays: 1,
    faq: [
      {
        question: "필러 시술 후 멍이나 붓기는 얼마나 지속되나요?",
        answer:
          "가벼운 멍과 붓기는 대부분 2~5일 내 사라집니다. 입술 필러는 붓기가 조금 더 오래 지속될 수 있으며, 아르니카 크림과 냉찜질이 회복에 도움이 됩니다. 시술 후 1~2주간은 과격한 운동, 사우나, 음주를 삼가는 것이 좋습니다.",
      },
      {
        question: "Is hyaluronic acid filler reversible in Korea?",
        answer:
          "Yes, hyaluronic acid fillers are fully reversible. Korean clinics can dissolve the filler using hyaluronidase enzyme if the patient is unsatisfied with the result or experiences a vascular complication. This reversibility makes HA fillers the preferred choice for first-time patients and nose fillers.",
      },
    ],
  },
  // ─── 피부과 ────────────────────────────────────────────────────────────────
  {
    id: "guide-007",
    slug: "laser-toning",
    category: "dermatology",
    title: "레이저 토닝",
    titleEn: "Laser Toning",
    description:
      "레이저 토닝은 저출력 레이저를 반복 조사하여 기미, 잡티, 색소침착을 개선하는 대표적인 피부과 시술입니다. 다운타임이 거의 없고 피부 톤을 균일하게 만들어주어 의료 관광객이 한국 방문 중 가장 즐겨 받는 시술 중 하나입니다. 4~6회 세션을 권장하며 1회당 소요 시간은 약 20~30분입니다.",
    descriptionEn:
      "Laser toning uses low-fluence Q-switched laser pulses to break down melanin and treat melasma, pigmentation, and uneven skin tone. With virtually zero downtime and a 20–30 minute session time, it is one of the most popular dermatology treatments among medical tourists visiting Korea. 4–6 sessions are typically recommended.",
    priceRange: "$80–$200",
    recoveryDays: 0,
    faq: [
      {
        question: "레이저 토닝 시술 후 자외선 차단은 왜 중요한가요?",
        answer:
          "레이저 시술 후 피부는 자외선에 더욱 민감해져 색소침착 재발 위험이 높아집니다. 시술 후 최소 2주간 SPF 50 이상 자외선 차단제를 매일 사용하고, 모자와 자외선 차단 의류를 착용하는 것이 필수입니다.",
      },
      {
        question: "How many laser toning sessions are needed for melasma treatment in Korea?",
        answer:
          "For melasma treatment, dermatologists in Korea typically recommend 6–10 sessions spaced 2–4 weeks apart. Medical tourists usually complete 2–3 sessions during a single trip and continue maintenance sessions on subsequent visits. Combining laser toning with brightening serums (vitamin C, niacinamide) significantly improves outcomes.",
      },
    ],
  },
  {
    id: "guide-008",
    slug: "ultherapy",
    category: "dermatology",
    title: "울쎄라",
    titleEn: "Ultherapy",
    description:
      "울쎄라(HIFU)는 집속 초음파 에너지를 피부 SMAS층에 전달하여 콜라겐 재생을 유도하고 피부를 리프팅하는 비수술적 시술입니다. 시술 후 3~6개월에 걸쳐 효과가 서서히 나타나며 12~18개월 지속됩니다. 다운타임이 없어 바쁜 일정의 의료 관광객에게 적합합니다.",
    descriptionEn:
      "Ultherapy (HIFU) delivers focused ultrasound energy to the SMAS layer — the same tissue tightened in surgical facelifts — to stimulate collagen production and lift the skin without surgery. Results develop gradually over 3–6 months and last 12–18 months. Zero downtime makes it ideal for busy medical tourists.",
    priceRange: "$800–$1,500",
    recoveryDays: 0,
    faq: [
      {
        question: "울쎄라 시술은 얼마나 아픈가요?",
        answer:
          "시술 중 초음파 에너지가 전달될 때 화끈거리거나 찌릿한 느낌이 있을 수 있습니다. 대부분의 클리닉에서 시술 전 진통제 또는 국소마취 크림을 사용하여 불편감을 최소화합니다. 개인 통증 역치와 시술 부위에 따라 차이가 있으며, 시술 후 약간의 홍조가 수 시간 내 사라집니다.",
      },
      {
        question: "What is the difference between Ultherapy and Thermage in Korea?",
        answer:
          "Ultherapy uses focused ultrasound to target the deep SMAS layer (4.5mm depth), making it ideal for structural lifting of the face and neck. Thermage uses radiofrequency energy targeting the dermis (2–3mm depth), best for skin tightening and texture improvement. Many Korean clinics offer combination treatments for comprehensive results. Ultherapy tends to cost 20–30% more than Thermage.",
      },
    ],
  },
  {
    id: "guide-009",
    slug: "skin-lifting",
    category: "dermatology",
    title: "피부 리프팅",
    titleEn: "Skin Lifting",
    description:
      "피부 리프팅은 PDO 실, 고주파, HIFU 등 다양한 기술을 활용해 처진 피부를 탄력 있게 끌어올리는 비수술적 시술입니다. 수술에 비해 회복이 빠르고 부작용 위험이 낮으며 자연스러운 결과를 얻을 수 있습니다. 나이와 피부 처짐 정도에 따라 적합한 시술법을 선택합니다.",
    descriptionEn:
      "Skin lifting encompasses non-surgical treatments — PDO thread lift, radiofrequency (RF), and HIFU — that firm and lift sagging skin with minimal downtime. Results are more gradual than surgery but with significantly lower risk and recovery time. The optimal method is chosen based on age, degree of laxity, and treatment area.",
    priceRange: "$500–$2,000",
    recoveryDays: 3,
    faq: [
      {
        question: "PDO 실 리프팅과 HIFU(울쎄라)의 차이점은 무엇인가요?",
        answer:
          "PDO 실 리프팅은 피부 아래 실을 삽입해 즉각적인 기계적 리프팅 효과와 함께 콜라겐 생성을 유도합니다. HIFU는 초음파로 깊은 층을 자극하여 장기적인 콜라겐 재생에 초점을 맞춥니다. PDO는 효과가 즉시 나타나는 반면, HIFU는 3~6개월에 걸쳐 효과가 나타납니다.",
      },
      {
        question: "How long do PDO thread lift results last?",
        answer:
          "PDO thread lift results typically last 12–24 months. The immediate mechanical lift (from the threads themselves) is visible right away, while the collagen-stimulating effect builds over 2–3 months. As the PDO threads dissolve naturally, the collagen scaffold they stimulated continues to provide support. Maintenance treatments every 12–18 months help sustain results.",
      },
    ],
  },
  {
    id: "guide-010",
    slug: "acne-treatment",
    category: "dermatology",
    title: "여드름 치료",
    titleEn: "Acne Treatment",
    description:
      "한국 피부과는 여드름 원인 분석부터 압출, 레이저, 약물 치료까지 체계적인 여드름 관리 프로그램을 제공합니다. 특히 여드름 흉터와 모공 개선을 위한 프락셀·CO2 레이저 치료가 전 세계 환자들에게 높은 평가를 받고 있습니다. 단기 집중 트리트먼트부터 장기 관리 플랜까지 다양한 옵션이 있습니다.",
    descriptionEn:
      "Korean dermatology clinics offer comprehensive acne management combining extraction, laser therapy, and medical-grade skincare. Fractional CO2 laser for acne scars and enlarged pores is particularly renowned among international patients. Treatment plans range from single-session intensive treatments to multi-visit programs.",
    priceRange: "$100–$600",
    recoveryDays: 5,
    faq: [
      {
        question: "여드름 흉터 치료에 가장 효과적인 레이저는 무엇인가요?",
        answer:
          "프락셀 CO2 레이저와 어블레이티브 점박이 레이저가 여드름 흉터에 가장 효과적입니다. 깊은 박스형·롤링형 흉터는 서브시전(피하 절개)과 레이저를 병행하면 효과가 높습니다. 1~2회의 집중 시술 후 상당한 개선을 기대할 수 있으며, 3~4회 반복 시술 시 80% 이상 개선도 가능합니다.",
      },
      {
        question: "What acne scar treatments are available in Korea for tourists?",
        answer:
          "Korean dermatology clinics offer fractional CO2 laser (most effective, 5–7 day downtime), Pico laser fractional (less downtime, 2–3 day recovery), subcision for rolling scars, and RF microneedling (Morpheus8/Intracel). Many clinics offer 'acne scar packages' combining 2–3 modalities for optimal results within a single visit.",
      },
    ],
  },
  // ─── 치과 ──────────────────────────────────────────────────────────────────
  {
    id: "guide-011",
    slug: "teeth-whitening",
    category: "dental",
    title: "치아 미백",
    titleEn: "Teeth Whitening",
    description:
      "전문 치아 미백은 고농도 과산화수소를 치아에 도포 후 LED·레이저로 활성화하여 즉각적인 미백 효과를 제공합니다. 한국 치과에서는 Zoom·GLO 시스템을 사용하며, 1회 시술로 2~5단계 밝기 향상이 가능합니다. 미국 대비 60~70% 저렴한 비용으로 의료 관광객들이 선호하는 치과 시술입니다.",
    descriptionEn:
      "Professional teeth whitening uses high-concentration hydrogen peroxide activated by LED or laser light for immediate 2–5 shade improvement in a single session. Korean dental clinics use Zoom and GLO whitening systems at 60–70% of US prices. Most sessions include a desensitizing treatment to manage post-whitening sensitivity.",
    priceRange: "$120–$250",
    recoveryDays: 0,
    faq: [
      {
        question: "치아 미백 후 음식 제한은 얼마나 지속되나요?",
        answer:
          "미백 시술 후 48시간은 커피, 홍차, 레드와인, 카레 등 색소 짙은 음식을 피하는 '화이트 다이어트'를 권장합니다. 이 기간에 치아가 외부 착색에 가장 취약합니다. 이후에는 정상 식단으로 돌아올 수 있으나, 커피 음용 후 물로 입을 헹구는 습관을 들이면 미백 효과를 더 오래 유지할 수 있습니다.",
      },
      {
        question: "How long does professional teeth whitening last in Korea?",
        answer:
          "Professional in-office whitening results last 1–3 years depending on diet and oral hygiene habits. Korean dentists often recommend take-home whitening trays for maintenance, extending results significantly. Avoiding staining foods and beverages (coffee, red wine, tea) and regular dental cleanings are the best ways to preserve the whitening effect.",
      },
    ],
  },
  {
    id: "guide-012",
    slug: "dental-braces",
    category: "dental",
    title: "치아 교정",
    titleEn: "Dental Braces",
    description:
      "치아 교정은 금속 브라켓, 세라믹 브라켓, 투명 교정(인비절라인) 등 다양한 방식으로 치열을 가지런히 하는 치과 치료입니다. 한국 교정 전문의는 글로벌 자격을 보유하고 있으며, 비용은 서구권 대비 30~50% 저렴합니다. 해외 환자는 한국에서 시작 후 본국에서 이어갈 수 있는 디지털 기록 공유 시스템을 활용할 수 있습니다.",
    descriptionEn:
      "Dental braces correct misaligned teeth using metal brackets, ceramic brackets, or clear aligners (Invisalign). Korean orthodontists hold international board certifications and offer treatment at 30–50% lower cost than Western countries. International patients can start treatment in Korea and continue with a home-country provider using shared digital records.",
    priceRange: "$2,000–$5,000",
    recoveryDays: 0,
    faq: [
      {
        question: "인비절라인(투명 교정)과 일반 교정의 비용 차이는 어느 정도인가요?",
        answer:
          "한국에서 인비절라인 종합 치료는 약 $3,000~$5,000, 금속 브라켓 교정은 $1,500~$2,500, 세라믹 브라켓은 $2,000~$3,500 수준입니다. 인비절라인은 심미성과 편의성이 높지만, 치열 상태에 따라 전통 교정이 더 효과적인 경우도 있습니다. 교정 전문의와 상담을 통해 최적의 방법을 결정하는 것이 중요합니다.",
      },
      {
        question: "Can I start orthodontic treatment in Korea and finish it at home?",
        answer:
          "Yes, many Korean orthodontists are experienced with international patients who start treatment in Korea and continue with a dentist in their home country. Clinics provide detailed digital treatment plans, 3D scans, and Invisalign or clear aligner trays in advance. Regular check-ups can be completed during subsequent Korea visits or via digital monitoring apps.",
      },
    ],
  },
  {
    id: "guide-013",
    slug: "dental-implant",
    category: "dental",
    title: "임플란트",
    titleEn: "Dental Implant",
    description:
      "치아 임플란트는 상실된 치아의 뿌리를 티타늄 픽스처로 대체하고 위에 맞춤형 도자기 크라운을 씌우는 치과 시술입니다. 한국은 Osstem, MegaGen 등 세계적인 임플란트 브랜드를 보유하고 있으며, 미국 대비 50~60% 저렴한 비용으로 높은 성공률을 자랑합니다. 골 유착에 3~6개월이 필요하므로 두 차례 방문이 필요합니다.",
    descriptionEn:
      "Dental implants replace missing tooth roots with titanium fixtures topped with custom ceramic crowns. Korea is home to globally-used implant brands including Osstem and MegaGen, offering 50–60% cost savings vs. the US with equivalent success rates. Two visits spaced 3–6 months apart are required for osseointegration.",
    priceRange: "$1,000–$2,000",
    recoveryDays: 7,
    faq: [
      {
        question: "임플란트 수술 후 주의사항과 회복 과정을 알려주세요.",
        answer:
          "수술 당일은 부드러운 음식만 섭취하고, 1주일간 흡연·음주를 삼가야 합니다. 3~6개월 후 골 유착이 완성되면 최종 크라운을 장착합니다. 해외 환자의 경우 1차 방문에서 픽스처 식립, 2차 방문에서 크라운 장착으로 진행하며, 사이에 원격 진료로 경과를 확인합니다.",
      },
      {
        question: "How much does a dental implant cost in Korea vs the US?",
        answer:
          "A single dental implant in Korea costs $1,000–$1,800 USD (including the fixture, abutment, and crown), compared to $3,000–$6,000 in the United States. Korean implant brands like Osstem and MegaGen meet international ISO standards and are used in over 80 countries. Many clinics offer all-inclusive medical tourism packages with accommodation and transportation.",
      },
    ],
  },
  {
    id: "guide-014",
    slug: "dental-veneer",
    category: "dental",
    title: "라미네이트",
    titleEn: "Dental Veneer",
    description:
      "라미네이트(치아 베니어)는 치아 앞면에 초박형 도자기 조각을 부착하여 색상·모양·크기를 교정하는 시술입니다. 한국 치과 기공소의 높은 도자기 제작 기술 덕분에 자연치아와 구분하기 어려울 정도로 자연스러운 결과를 제공합니다. CAD/CAM 기술을 활용한 당일 라미네이트도 일부 클리닉에서 가능합니다.",
    descriptionEn:
      "Dental veneers are ultra-thin ceramic shells bonded to the front of teeth to correct color, shape, and minor alignment issues. Korean dental labs produce veneers with exceptional translucency and color-matching at competitive prices. Same-day veneers using CAD/CAM milling technology are available at select clinics.",
    priceRange: "$250–$500 per tooth",
    recoveryDays: 0,
    faq: [
      {
        question: "라미네이트 시술 전 치아를 많이 삭제해야 하나요?",
        answer:
          "전통적인 라미네이트는 0.5~0.7mm의 에나멜 삭제가 필요하지만, 초박형(노 프렙) 라미네이트는 삭제량이 최소화되거나 없습니다. 치아 상태와 원하는 결과에 따라 적합한 방법을 교정 전문의가 결정합니다. 한 번 삭제한 에나멜은 재생되지 않으므로 신중한 상담이 중요합니다.",
      },
      {
        question: "How long do porcelain veneers last in Korea?",
        answer:
          "High-quality porcelain veneers placed by Korean dental labs typically last 10–20 years with proper care. Korean dental ceramists are known for producing wafer-thin veneers (0.3–0.5mm) with excellent light translucency that closely mimics natural enamel. Avoiding teeth grinding (bruxism), excessive biting force, and staining beverages will maximize veneer longevity.",
      },
    ],
  },
  // ─── 안과 ──────────────────────────────────────────────────────────────────
  {
    id: "guide-015",
    slug: "lasik-lasek",
    category: "ophthalmology",
    title: "라식/라섹",
    titleEn: "LASIK/LASEK",
    description:
      "라식(LASIK)은 각막 절편을 만든 후 레이저로 시력을 교정하는 시술로, 24시간 내 빠른 시력 회복이 특징입니다. 라섹(LASEK)은 각막 표면을 재생시키는 방식으로, 각막 두께가 얇거나 건성안 환자에게 적합합니다. 한국은 Zeiss VisuMax, Alcon WaveLight 등 최신 레이저 장비를 갖춘 세계적인 시력교정 센터입니다.",
    descriptionEn:
      "LASIK creates a corneal flap and reshapes the underlying tissue with an excimer laser, offering visual recovery within 24 hours. LASEK removes the epithelial layer for surface laser correction, preferred for patients with thinner corneas or dry eye. Korea's top eye clinics feature state-of-the-art Zeiss VisuMax and Alcon WaveLight systems.",
    priceRange: "$1,500–$2,500",
    recoveryDays: 7,
    faq: [
      {
        question: "라식과 라섹 중 어떤 시술이 저에게 맞는지 어떻게 알 수 있나요?",
        answer:
          "라식은 각막이 충분히 두껍고 건성안이 심하지 않은 분에게 적합하며 회복이 빠릅니다. 라섹은 각막이 얇거나, 건성안, 운동·군인처럼 충격 위험이 있는 분에게 권장됩니다. 정밀 검사(각막 두께, 동공 크기, 굴절이상 등) 후 의사가 최적 방법을 결정합니다.",
      },
      {
        question: "What is the cost of LASIK surgery in Korea for foreigners?",
        answer:
          "LASIK in Korea costs $1,500–$2,000 USD per both eyes, compared to $3,000–$5,000 in the United States. LASEK is typically priced similarly or slightly lower at $1,400–$1,800. Most leading Korean eye clinics offer all-inclusive packages for international patients including pre-operative testing, the procedure, post-op check-ups, and eye drops.",
      },
    ],
  },
  {
    id: "guide-016",
    slug: "hair-transplant",
    category: "plastic-surgery",
    title: "모발 이식",
    titleEn: "Hair Transplant",
    description:
      "모발 이식은 후두부(공여부)에서 모낭을 채취하여 탈모 부위에 이식하는 수술입니다. FUE(비절개), DHI(직접 이식) 방식이 주로 사용되며, 이식 후 모발은 3~6개월 내 성장을 시작하고 12개월 후 최종 결과를 확인할 수 있습니다. 한국은 탈모 치료 전문 병원과 기술력이 뛰어나 가격 대비 품질이 높습니다.",
    descriptionEn:
      "Hair transplantation extracts hair follicles from the donor area (back of the scalp) and implants them into thinning or bald areas. FUE and DHI methods are commonly used in Korea. Transplanted hair begins growing in 3–6 months, with final results visible at 12 months. Korea offers competitive pricing with high-quality outcomes.",
    priceRange: "$3,000–$7,000",
    recoveryDays: 14,
    faq: [
      {
        question: "모발 이식 후 이식 모발이 다시 빠지나요?",
        answer:
          "이식 후 2~6주 내 이식 모발이 일시적으로 탈락하는 '쇼크 로스' 현상이 정상적으로 발생합니다. 이후 모낭은 휴지기를 거쳐 3~6개월부터 새 모발을 생성합니다. 이식된 모낭은 탈모 저항성 후두부 모낭이므로 영구적으로 유지됩니다.",
      },
      {
        question: "What is the difference between FUE and DHI hair transplant methods?",
        answer:
          "FUE (Follicular Unit Extraction) harvests individual follicles using a micro-punch tool and implants them via pre-made recipient sites. DHI (Direct Hair Implantation) uses a Choi pen to implant follicles directly without pre-made holes, allowing denser packing and better angle control. DHI is generally 20–30% more expensive but offers more precise hairline design.",
      },
    ],
  },
  {
    id: "guide-017",
    slug: "breast-augmentation",
    category: "plastic-surgery",
    title: "가슴 성형",
    titleEn: "Breast Augmentation",
    description:
      "가슴 성형(확대술)은 실리콘 또는 Motiva 임플란트를 삽입하여 가슴의 크기와 형태를 개선하는 수술입니다. 절개 위치(겨드랑이, 유륜 하방, 유방 하주름)와 임플란트 삽입 면(유방 조직 하방, 대흉근 하방)에 따라 다양한 옵션이 있습니다. 전신마취로 진행되는 당일 수술이며 회복 기간은 약 4주입니다.",
    descriptionEn:
      "Breast augmentation places silicone or Motiva implants to increase breast size and improve shape. Options vary by incision site (axilla, periareolar, inframammary fold) and implant placement plane. It is a same-day surgery under general anesthesia with approximately 4 weeks of recovery.",
    priceRange: "$3,500–$6,000",
    recoveryDays: 30,
    faq: [
      {
        question: "가슴 성형 후 언제부터 운동을 다시 시작할 수 있나요?",
        answer:
          "가벼운 하체 운동은 수술 후 2~3주부터 가능하지만, 가슴·상체 운동과 무거운 물건 들기는 6~8주 후부터 권장됩니다. 임플란트가 완전히 자리를 잡고 캡슐이 형성되는 3개월까지 과도한 상체 활동은 피하는 것이 좋습니다.",
      },
      {
        question: "How safe are breast implants used in Korean plastic surgery?",
        answer:
          "Korean plastic surgery clinics primarily use FDA-cleared and CE-marked implants including Motiva Ergonomix, Mentor, and Allergan. Motiva implants are particularly popular in Korea for their low complication rates and natural feel. All implant materials used in Korea must meet Korea Ministry of Food and Drug Safety (MFDS) approval standards.",
      },
    ],
  },
  {
    id: "guide-018",
    slug: "under-eye-fat-removal",
    category: "plastic-surgery",
    title: "눈밑 지방 제거",
    titleEn: "Under-Eye Fat Removal",
    description:
      "눈밑 지방 제거(경결막 지방이전술)는 눈 아래 돌출된 지방 주머니를 안쪽(결막) 절개를 통해 제거하거나 꺼진 눈밑에 재배치하는 수술입니다. 외부 흉터가 없고 회복이 빠르며, 피곤해 보이거나 나이 들어 보이는 인상을 개선하는 데 효과적입니다. 지방 재배치 시 꺼진 눈밑 라인도 함께 교정됩니다.",
    descriptionEn:
      "Under-eye fat removal (transconjunctival blepharoplasty) removes or repositions protruding fat pockets via an internal (conjunctival) incision, leaving no external scars. It effectively addresses the tired or aged appearance caused by under-eye bags. Fat repositioning simultaneously corrects hollow tear trough deformities.",
    priceRange: "$1,500–$3,000",
    recoveryDays: 14,
    faq: [
      {
        question: "눈밑 지방 제거 수술과 필러 중 어떤 게 더 나은가요?",
        answer:
          "눈밑 지방이 심하게 돌출되거나 꺼진 부위가 명확한 경우 수술적 지방이전술이 더 근본적인 해결책입니다. 지방 돌출이 경미하고 꺼짐이 주된 문제라면 히알루론산 필러로도 개선이 가능합니다. 수술은 효과가 영구적이며 필러는 12~18개월 주기로 유지 관리가 필요합니다.",
      },
      {
        question: "What is the recovery time for under-eye fat removal surgery in Korea?",
        answer:
          "Most patients experience bruising and swelling for 7–10 days after transconjunctival under-eye fat removal. Since the incision is inside the lower eyelid, there are no visible external scars. Patients can typically return to office work in 7–10 days, though sunglasses are recommended for 2 weeks. Final results are fully visible at 4–6 weeks.",
      },
    ],
  },
  {
    id: "guide-019",
    slug: "wrinkle-treatment",
    category: "dermatology",
    title: "주름 제거",
    titleEn: "Wrinkle Treatment",
    description:
      "주름 치료는 보톡스, 필러, 레이저 리서페이싱, 스킨부스터 등 다양한 방법을 조합하여 깊이와 원인에 따라 맞춤 진행합니다. 한국 피부과·성형외과는 이 '레이어드(layered) 접근법'으로 자연스럽고 과장되지 않은 동안 결과를 추구합니다. 표정 주름, 정적 주름, 피부 탄력 저하 등 유형별로 적합한 시술이 다릅니다.",
    descriptionEn:
      "Wrinkle treatment in Korea uses a combination approach — Botox, fillers, laser resurfacing, and skin boosters — matched to wrinkle depth, type, and location. Korean clinics excel at the 'layered approach' that delivers natural, non-overdone rejuvenation. Dynamic wrinkles, static lines, and skin laxity each require different treatment strategies.",
    priceRange: "$200–$1,500",
    recoveryDays: 2,
    faq: [
      {
        question: "나이별 주름 치료에서 가장 효과적인 방법은 무엇인가요?",
        answer:
          "30대 초반은 보톡스 예방 치료와 스킨부스터가 효과적이며, 30~40대는 보톡스+필러+레이저 토닝 조합을 많이 사용합니다. 50대 이상 깊은 주름과 처짐에는 울쎄라·서마지·PDO 실 리프팅이 효과적이며, 중증 케이스는 수술적 리프팅을 고려합니다.",
      },
      {
        question: "What non-surgical wrinkle treatments are available at Korean clinics?",
        answer:
          "Korean clinics offer a wide range of non-surgical wrinkle treatments: Botox (dynamic wrinkles, 3–6 month duration), hyaluronic acid fillers (deep lines and volume loss), Ultherapy/HIFU (skin laxity, collagen stimulation), fractional laser (skin texture and fine lines), and skin boosters (overall hydration and elasticity). Combination treatments are tailored to each patient's anatomy and goals.",
      },
    ],
  },
  {
    id: "guide-020",
    slug: "mole-wart-removal",
    category: "dermatology",
    title: "점/사마귀 제거",
    titleEn: "Mole/Wart Removal",
    description:
      "점·사마귀 제거는 레이저(CO2, 어비움) 또는 전기소작술을 이용해 피부 병변을 안전하게 제거하는 시술입니다. 한국 피부과는 흉터를 최소화하면서 정밀하게 제거하는 기술로 정평이 나 있으며, 가격도 서구권 대비 매우 저렴합니다. 악성 가능성이 있는 색소성 병변은 조직 검사를 먼저 권장합니다.",
    descriptionEn:
      "Mole and wart removal uses CO2 laser, erbium laser, or electrocautery to safely eliminate skin lesions with minimal scarring. Korean dermatologists are skilled at precision removal with excellent cosmetic outcomes, at a fraction of Western prices. Pigmented lesions with any suspicious features should be tested before removal.",
    priceRange: "$20–$200",
    recoveryDays: 7,
    faq: [
      {
        question: "점 제거 후 관리는 어떻게 해야 하나요?",
        answer:
          "시술 부위는 1~2주간 딱지가 생기고 자연 탈락합니다. 이 기간에 딱지를 억지로 뜯으면 흉터가 생길 수 있으므로 주의하세요. 자외선 차단제를 꾸준히 바르면 색소침착 예방에 효과적이며, 3~6개월 후 자국이 거의 보이지 않게 됩니다.",
      },
      {
        question: "How many moles can be removed in one visit to a Korean clinic?",
        answer:
          "Most Korean dermatology clinics can remove 10–20 small moles in a single 30–45 minute session, making it very efficient for medical tourists. Pricing is typically per lesion ($20–$50 per mole) or offered in bundles. Larger or raised moles may require individual laser sessions. Healing takes 7–14 days per site, so scheduling removal early in a trip is recommended.",
      },
    ],
  },
];

// 카테고리별 필터 헬퍼
export function getGuidesByCategory(category: ProcedureGuideCategory): ProcedureGuide[] {
  return procedureGuides.filter((g) => g.category === category);
}

// slug로 가이드 조회 헬퍼
export function getGuideBySlug(slug: string): ProcedureGuide | undefined {
  return procedureGuides.find((g) => g.slug === slug);
}
