// 인기 시술 목록 시드 데이터
// 카테고리: 성형, 피부, 치과, 안과

export type ProcedureCategory =
  | "plastic-surgery"  // 성형
  | "dermatology"      // 피부과
  | "dental"           // 치과
  | "ophthalmology";   // 안과

export interface Procedure {
  id: string;
  name: string;            // 영문 시술명
  nameKo: string;          // 한국어 시술명
  category: ProcedureCategory;
  description: string;
  averagePriceUSD: number; // 평균 가격 (미국 달러 기준)
  recoveryDays: number;    // 평균 회복 기간 (일)
  popularityRank: number;  // 인기 순위 (1 = 가장 인기)
  isMinimallyInvasive: boolean; // 최소 침습 여부
  typicalDurationMinutes: number; // 시술 시간 (분)
}

export const seedProcedures: Procedure[] = [
  // ─── 성형외과 시술 ────────────────────────────────────────────────
  {
    id: "proc-001",
    name: "Double Eyelid Surgery",
    nameKo: "쌍꺼풀 수술",
    category: "plastic-surgery",
    description:
      "Creates a visible crease in the upper eyelid for a wider, more defined eye appearance. Available as incisional (permanent, better for hooded lids) or non-incisional (suture method, faster recovery). The most frequently performed cosmetic surgery in South Korea. Particularly refined by Korean surgeons for Asian eyelid anatomy.",
    averagePriceUSD: 1100,
    recoveryDays: 14,
    popularityRank: 1,
    isMinimallyInvasive: false,
    typicalDurationMinutes: 45,
  },
  {
    id: "proc-002",
    name: "Rhinoplasty (Nose Job)",
    nameKo: "코 성형",
    category: "plastic-surgery",
    description:
      "Surgical reshaping of the nose, including bridge augmentation, tip refinement, dorsal hump reduction, or overall structural correction. Korean surgeons are globally recognized for their natural-looking rhinoplasty results, often using autologous cartilage harvested from the ear or rib for structure and longevity.",
    averagePriceUSD: 3200,
    recoveryDays: 21,
    popularityRank: 2,
    isMinimallyInvasive: false,
    typicalDurationMinutes: 120,
  },
  {
    id: "proc-003",
    name: "Facial Contouring (V-Line)",
    nameKo: "윤곽 수술 (V라인)",
    category: "plastic-surgery",
    description:
      "Bone-level surgical reshaping of the lower face including square jaw reduction, mandible angle contouring, and/or chin reshaping to achieve a slimmer, oval face shape. One of the most technically demanding cosmetic procedures, and Korea's concentration of surgeons experienced in this specific surgery is unmatched globally.",
    averagePriceUSD: 7500,
    recoveryDays: 90,
    popularityRank: 6,
    isMinimallyInvasive: false,
    typicalDurationMinutes: 180,
  },
  {
    id: "proc-004",
    name: "Breast Augmentation",
    nameKo: "가슴 성형 (확대술)",
    category: "plastic-surgery",
    description:
      "Surgical placement of implants (typically silicone or Motiva ergonomix) to increase breast size and improve shape. Korean surgeons offer a range of implant choices, incision locations, and placement techniques. Often combined with a lift (mastopexy) for patients with ptosis. Day surgery with general anesthesia.",
    averagePriceUSD: 4500,
    recoveryDays: 30,
    popularityRank: 5,
    isMinimallyInvasive: false,
    typicalDurationMinutes: 90,
  },
  {
    id: "proc-005",
    name: "Liposuction",
    nameKo: "지방흡입술",
    category: "plastic-surgery",
    description:
      "Removal of excess fat deposits from targeted body areas (abdomen, thighs, arms, flanks) using a suction cannula. Korean clinics frequently use VASER liposuction (ultrasound-assisted) for more precise fat removal and faster recovery. Results are best maintained with a stable weight post-procedure.",
    averagePriceUSD: 3800,
    recoveryDays: 14,
    popularityRank: 7,
    isMinimallyInvasive: false,
    typicalDurationMinutes: 120,
  },
  {
    id: "proc-006",
    name: "Fat Grafting (Autologous Fat Transfer)",
    nameKo: "지방이식",
    category: "plastic-surgery",
    description:
      "Transfer of the patient's own purified fat from a donor site (typically abdomen or thighs) to areas needing volume restoration — commonly cheeks, temples, under-eyes, and hands. Results are natural-looking and long-lasting. Often combined with rhinoplasty or facial contouring for comprehensive facial rejuvenation.",
    averagePriceUSD: 2800,
    recoveryDays: 21,
    popularityRank: 9,
    isMinimallyInvasive: false,
    typicalDurationMinutes: 120,
  },
  {
    id: "proc-007",
    name: "Botox & Dermal Fillers",
    nameKo: "보톡스 & 필러",
    category: "plastic-surgery",
    description:
      "Injectable treatments for wrinkle reduction (Botox/Dysport) and volume restoration (hyaluronic acid fillers such as Juvederm or Restylane). Among the most affordable procedures available in Korea, with prices 50–70% lower than the US. No downtime. Popular for facial slimming (masseter Botox), lip augmentation, and nasolabial fold reduction.",
    averagePriceUSD: 350,
    recoveryDays: 1,
    popularityRank: 3,
    isMinimallyInvasive: true,
    typicalDurationMinutes: 30,
  },

  // ─── 피부과 시술 ──────────────────────────────────────────────────
  {
    id: "proc-008",
    name: "Pico Laser Toning",
    nameKo: "피코 레이저 토닝",
    category: "dermatology",
    description:
      "Ultra-short picosecond laser pulses that target melanin deposits to treat pigmentation, melasma, post-acne dark spots, and sun damage. Virtually zero downtime — mild redness resolves within hours. Multiple sessions (4–6) are typically recommended for best results. One of the most popular dermatology treatments among medical tourists in Korea.",
    averagePriceUSD: 200,
    recoveryDays: 0,
    popularityRank: 4,
    isMinimallyInvasive: true,
    typicalDurationMinutes: 30,
  },
  {
    id: "proc-009",
    name: "Ultherapy (HIFU)",
    nameKo: "울쎄라",
    category: "dermatology",
    description:
      "High-Intensity Focused Ultrasound (HIFU) that delivers targeted thermal energy to the SMAS layer — the same layer tightened in surgical facelifts. Stimulates collagen production for gradual skin lifting and tightening over 3–6 months post-treatment. Zero downtime. Results last 12–18 months. Ideal for mild to moderate skin laxity in the 30–55 age group.",
    averagePriceUSD: 1100,
    recoveryDays: 0,
    popularityRank: 8,
    isMinimallyInvasive: true,
    typicalDurationMinutes: 60,
  },
  {
    id: "proc-010",
    name: "Fractional CO2 Laser",
    nameKo: "프락셀 CO2 레이저",
    category: "dermatology",
    description:
      "Ablative fractional laser that creates micro-treatment zones in the skin to stimulate dramatic collagen remodeling. Highly effective for acne scars, deep wrinkles, and uneven skin texture. Requires 5–7 days of significant downtime (redness, crusting). Results are among the most dramatic of any non-surgical skin treatment. Often performed in 1–2 sessions per trip.",
    averagePriceUSD: 420,
    recoveryDays: 7,
    popularityRank: 11,
    isMinimallyInvasive: true,
    typicalDurationMinutes: 45,
  },
  {
    id: "proc-011",
    name: "Skin Booster Injection",
    nameKo: "스킨 부스터 주사",
    category: "dermatology",
    description:
      "Microinjections of stabilized hyaluronic acid (Restylane Vital, Juvederm Hydrate) across the face to deeply hydrate skin, improve elasticity, and reduce fine lines from within. Not a volumizing filler — it stays in place and integrates with skin tissue. Results last 4–6 months. Minimal downtime (small injection marks resolve in 1–2 days).",
    averagePriceUSD: 380,
    recoveryDays: 2,
    popularityRank: 12,
    isMinimallyInvasive: true,
    typicalDurationMinutes: 45,
  },
  {
    id: "proc-012",
    name: "PDO Thread Lift",
    nameKo: "PDO 실 리프팅",
    category: "dermatology",
    description:
      "Insertion of polydioxanone (PDO) threads under the skin to mechanically lift sagging tissue and stimulate collagen production. Results are visible immediately (mechanical lift) and improve over 3 months (collagen effect). Lasts 18–24 months. Recovery involves mild bruising and swelling for 3–5 days. Effective alternative to surgery for mild-to-moderate laxity.",
    averagePriceUSD: 1200,
    recoveryDays: 5,
    popularityRank: 14,
    isMinimallyInvasive: true,
    typicalDurationMinutes: 60,
  },

  // ─── 치과 시술 ────────────────────────────────────────────────────
  {
    id: "proc-013",
    name: "Dental Implant",
    nameKo: "치아 임플란트",
    category: "dental",
    description:
      "Titanium posts surgically anchored in the jawbone to replace missing teeth, topped with a custom ceramic crown. The gold standard for tooth replacement. Korean dental clinics perform implants with implant brands including Osstem, Megagen, Nobel Biocare, and Straumann at significantly lower cost than Western countries. Requires 2 trips 3–6 months apart for osseointegration.",
    averagePriceUSD: 1400,
    recoveryDays: 7,
    popularityRank: 10,
    isMinimallyInvasive: false,
    typicalDurationMinutes: 60,
  },
  {
    id: "proc-014",
    name: "Porcelain Veneers",
    nameKo: "포세린 베니어",
    category: "dental",
    description:
      "Ultra-thin ceramic shells bonded to the front surface of teeth to correct color, shape, size, and minor alignment issues. Korean dental labs produce veneers with exceptional translucency and color-matching. Available as traditional (requiring slight enamel removal) or ultra-thin no-prep veneers. Same-day options available at some clinics using CAD/CAM milling technology.",
    averagePriceUSD: 350,
    recoveryDays: 0,
    popularityRank: 16,
    isMinimallyInvasive: true,
    typicalDurationMinutes: 90,
  },
  {
    id: "proc-015",
    name: "Invisalign Clear Aligners",
    nameKo: "인비절라인",
    category: "dental",
    description:
      "Clear removable aligner system for orthodontic treatment without metal braces. Korean orthodontists are certified Invisalign providers and the total cost is significantly lower than the US or Europe. Full treatment (comprehensive case) takes 12–24 months but can be initiated during a visit to Korea and continued with a home-country provider using shared digital records.",
    averagePriceUSD: 3200,
    recoveryDays: 0,
    popularityRank: 17,
    isMinimallyInvasive: true,
    typicalDurationMinutes: 60,
  },
  {
    id: "proc-016",
    name: "Professional Teeth Whitening",
    nameKo: "치아 미백",
    category: "dental",
    description:
      "In-office bleaching using high-concentration hydrogen peroxide activated by an LED or laser light source, for immediate 2–5 shade lightening in a single session. Korean clinics offer Zoom and GLO whitening systems, often at 60–70% of US prices. Sensitivity is manageable with post-whitening desensitizer treatment included in most packages.",
    averagePriceUSD: 180,
    recoveryDays: 0,
    popularityRank: 18,
    isMinimallyInvasive: true,
    typicalDurationMinutes: 60,
  },

  // ─── 안과 시술 ────────────────────────────────────────────────────
  {
    id: "proc-017",
    name: "LASIK",
    nameKo: "라식",
    category: "ophthalmology",
    description:
      "Laser-assisted in-situ keratomileusis — a flap is created in the cornea, underlying tissue is reshaped by excimer laser, and the flap is repositioned. Rapid visual recovery (clear vision within 24 hours), minimal discomfort. Requires adequate corneal thickness. Korean eye clinics use state-of-the-art laser systems (Zeiss VisuMax, Alcon WaveLight) at competitive pricing.",
    averagePriceUSD: 1800,
    recoveryDays: 3,
    popularityRank: 13,
    isMinimallyInvasive: false,
    typicalDurationMinutes: 15,
  },
  {
    id: "proc-018",
    name: "LASEK",
    nameKo: "라섹",
    category: "ophthalmology",
    description:
      "Laser epithelial keratomileusis — the surface layer (epithelium) is gently removed, laser reshapes the cornea, and the epithelium regenerates. Slower recovery than LASIK (3–5 days blurry vision) but no flap complications and better for patients with thinner corneas or dry eye. Preferred by Korean surgeons for active lifestyle patients (contact sports, military).",
    averagePriceUSD: 1600,
    recoveryDays: 7,
    popularityRank: 15,
    isMinimallyInvasive: false,
    typicalDurationMinutes: 15,
  },
  {
    id: "proc-019",
    name: "ICL (Implantable Collamer Lens)",
    nameKo: "안내 렌즈 삽입술 (ICL)",
    category: "ophthalmology",
    description:
      "A tiny collamer lens is surgically implanted between the iris and natural lens — no corneal tissue is removed. Ideal for patients with high prescriptions, thin corneas, or dry eye who are not candidates for LASIK/LASEK. Reversible. Korea is a global center of excellence for ICL implantation, with some clinics having performed 10,000+ cases. Significantly lower cost than the US or UK.",
    averagePriceUSD: 2800,
    recoveryDays: 3,
    popularityRank: 19,
    isMinimallyInvasive: false,
    typicalDurationMinutes: 20,
  },
  {
    id: "proc-020",
    name: "SMILE (Small Incision Lenticule Extraction)",
    nameKo: "스마일 라식",
    category: "ophthalmology",
    description:
      "Third-generation laser vision correction that creates a disc of corneal tissue (lenticule) inside the intact cornea and removes it through a tiny incision — no flap, minimal dry eye impact, fast recovery. Suitable for myopia and astigmatism. Requires the Zeiss VisuMax laser system, available at leading Korean eye clinics. Fastest growing vision correction procedure in Korea.",
    averagePriceUSD: 2200,
    recoveryDays: 2,
    popularityRank: 20,
    isMinimallyInvasive: false,
    typicalDurationMinutes: 15,
  },
];
