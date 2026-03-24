// 트렌드 리포트 시드 데이터 — 2026년 한국에서 주목받는 시술
// 각 시술별 설명, 가격, 인기 이유 포함

export interface TrendingProcedure {
  rank: number;
  id: string;
  name: string;            // 영문명
  nameKo: string;          // 한국어명
  category: string;
  tagline: string;         // 한 줄 요약
  description: string;
  whyTrending: string[];   // 인기 이유 목록
  priceRangeUSD: {
    min: number;
    max: number;
  };
  recoveryDays: number;
  demandGrowthPercent: number;  // 전년 대비 검색/예약 증가율 (%)
  topClinicArea: string;
  keyFacts: string[];
}

export interface TrendingReport {
  title: string;
  titleKo: string;
  publishedAt: string;       // ISO 8601
  summary: string;
  procedures: TrendingProcedure[];
  editorNote: string;
}

// ─── 2026 트렌드 리포트 ────────────────────────────────────────────
export const trendingReport2026: TrendingReport = {
  title: "Korea's Top 5 Rising Procedures of 2026",
  titleKo: "2026년 한국에서 뜨는 시술 TOP 5",
  publishedAt: "2026-03-01T00:00:00Z",
  summary:
    "Medical tourism to South Korea continues to grow, and 2026 is seeing a notable shift in what international patients are seeking. While classic procedures like rhinoplasty and double eyelid surgery remain popular, five emerging treatments have seen explosive growth in bookings, online searches, and media coverage. Here is what is driving the 2026 wave.",
  procedures: [
    // ─── #1 ─────────────────────────────────────────────────────────
    {
      rank: 1,
      id: "trend-001",
      name: "Exosome Therapy",
      nameKo: "엑소좀 치료",
      category: "dermatology",
      tagline: "The next-generation skin rejuvenation taking over K-beauty clinics",
      description:
        "Exosome therapy uses nano-vesicles derived from stem cells to deliver growth factors, proteins, and genetic material directly into skin cells, triggering deep regeneration, collagen synthesis, and pigmentation correction. Unlike traditional PRP (platelet-rich plasma), exosomes carry a far richer biological payload and produce more consistent results. In Korea, exosome treatments are now offered in a variety of delivery formats: topical application post-laser, microinjection, and nano-needling infusion. The most popular use is as a post-laser amplifier — applied immediately after a Pico or fractional laser session, exosomes dramatically reduce downtime while accelerating results.",
      whyTrending: [
        "Featured extensively in Korean dermatology journals and beauty media throughout 2025",
        "Influencers from the US, UK, and China sharing dramatic before/after results on social media",
        "Combines seamlessly with existing laser treatments for a multiplied effect",
        "Zero downtime when used as a standalone topical treatment",
        "Stem-cell-derived technology perceived as cutting-edge by international patients",
        "Not yet widely available outside Korea and Japan, creating strong medical tourism pull",
      ],
      priceRangeUSD: { min: 300, max: 900 },
      recoveryDays: 0,
      demandGrowthPercent: 187,
      topClinicArea: "Gangnam (Cheongdam / Apgujeong)",
      keyFacts: [
        "Booking inquiries for exosome treatments increased 187% year-over-year in Korea",
        "Most commonly paired with Pico laser for a combined anti-aging and brightening effect",
        "Suitable for all skin types and tones",
        "Results are cumulative — patients typically see best outcomes after 3–5 sessions",
        "Currently unregulated or unavailable in many Western markets, making Korea a sole-source destination",
      ],
    },

    // ─── #2 ─────────────────────────────────────────────────────────
    {
      rank: 2,
      id: "trend-002",
      name: "SMILE Laser Vision Correction",
      nameKo: "스마일 라식",
      category: "ophthalmology",
      tagline: "Flapless, fast, and dry-eye-friendly — the LASIK evolution is here",
      description:
        "SMILE (Small Incision Lenticule Extraction) is the third generation of laser vision correction. Unlike LASIK, no flap is created in the cornea — a tiny lenticule of tissue is laser-sculpted inside the intact eye and removed through a 2mm incision. The result is a procedure with significantly reduced dry eye risk, no flap complications, and faster return to normal activities. Korea was among the early adopters of the Zeiss VisuMax platform that powers SMILE, and several Gangnam eye clinics now perform exclusively SMILE and LASEK (phasing out traditional LASIK). International patients, particularly those who were previously told they were not LASIK candidates due to dry eye or thin corneas, are traveling to Korea to explore SMILE as a viable alternative.",
      whyTrending: [
        "Growing awareness that dry eye is a significant post-LASIK issue, and SMILE virtually eliminates it",
        "Active lifestyle patients (athletes, military, outdoor workers) prefer the flap-free approach",
        "Korean eye clinics offering SMILE at $2,000–$2,500 vs $4,000–$5,500 in the US",
        "Shorter recovery time than LASEK with better dry eye profile than LASIK",
        "Strong YouTube and TikTok content from Korean clinics demonstrating the painless procedure",
      ],
      priceRangeUSD: { min: 1900, max: 2600 },
      recoveryDays: 2,
      demandGrowthPercent: 134,
      topClinicArea: "Gangnam, Jamsil",
      keyFacts: [
        "134% increase in international patient inquiries for SMILE in Korea in 2025",
        "FDA-approved in the US but available at far fewer centers and significantly higher cost",
        "Suitable for myopia up to -10.00D and astigmatism up to -5.00D",
        "Both eyes treated in under 15 minutes total",
        "Korea's SMILE volume per capita is among the highest in the world",
      ],
    },

    // ─── #3 ─────────────────────────────────────────────────────────
    {
      rank: 3,
      id: "trend-003",
      name: "Jawline & Masseter Botox",
      nameKo: "사각턱 보톡스",
      category: "plastic-surgery",
      tagline: "The 30-minute procedure redefining face shape without surgery",
      description:
        "Masseter Botox (jaw Botox) injects botulinum toxin into the masseter muscle to reduce its bulk, gradually slimming an overly square or wide jaw into a softer, more oval shape. The effect takes 4–8 weeks to appear and lasts 4–6 months before a touch-up is needed. It is an injectable procedure — no surgery, no cuts, no anesthesia. In Korea, jaw Botox has been practiced and refined for over 20 years, and Korean injectors are among the world's most skilled at precise dosing and placement. The effect size achievable by Korean practitioners is often greater than what patients find available at home due to the higher unit doses approved for cosmetic use in Korea.",
      whyTrending: [
        "K-pop and K-drama celebrities visibly using the 'small face' look driving global demand",
        "TikTok and Instagram content showcasing dramatic before/after results going viral internationally",
        "Completely non-surgical with zero downtime — ideal for a single-day side trip during any Seoul visit",
        "Prices in Korea ($150–$300) are a fraction of US costs ($600–$1,200)",
        "Can be combined with chin filler in the same appointment for a comprehensive jawline refresh",
      ],
      priceRangeUSD: { min: 150, max: 350 },
      recoveryDays: 0,
      demandGrowthPercent: 112,
      topClinicArea: "Gangnam, Hongdae",
      keyFacts: [
        "Results last 4–6 months; most patients return to Korea or find a local injector for maintenance",
        "Units used in Korea for jaw Botox (50–100 units/side) often exceed what clinics abroad will perform",
        "Can reduce teeth grinding (bruxism) as a secondary benefit",
        "Safe same-day procedure; patients can eat, drink, and fly afterward",
        "Demand from male patients growing fastest — up 90% in male bookings year-over-year",
      ],
    },

    // ─── #4 ─────────────────────────────────────────────────────────
    {
      rank: 4,
      id: "trend-004",
      name: "All-on-4 Dental Implants",
      nameKo: "올온포 임플란트",
      category: "dental",
      tagline: "A full arch of permanent teeth in 24 hours — Korea making it affordable",
      description:
        "The All-on-4 procedure places four strategically angled dental implants in the jaw to support a full arch of fixed prosthetic teeth — all in a single surgical day. It is a transformative solution for patients who have lost most or all teeth in an arch, or those facing extensive extractions. In the US and Europe, All-on-4 per arch typically costs $20,000–$30,000. Korean dental hospitals perform the same procedure for $8,000–$14,000 per arch using premium implant systems (Nobel Biocare, Straumann). The combination of dramatic cost savings and Korea's world-class dental surgical standards is attracting an older demographic — primarily patients in their 50s–70s — that was not traditionally part of the Korean medical tourism conversation.",
      whyTrending: [
        "Aging international population facing full-arch tooth loss with prohibitive home-country costs",
        "Strong social media community of All-on-4 patients sharing Korean experiences",
        "Korean dental surgeons with 10,000+ implant cases offering premium skill at accessible price",
        "Clinics offering dedicated multi-day international patient programs for full-arch cases",
        "\"Dental vacation\" concept — patients combining major dental work with a Seoul holiday",
      ],
      priceRangeUSD: { min: 8000, max: 14000 },
      recoveryDays: 14,
      demandGrowthPercent: 98,
      topClinicArea: "Gangnam, Itaewon",
      keyFacts: [
        "One arch treated in a single surgical day under sedation",
        "Temporary fixed teeth placed same day; final prosthetic fitted at 3–6 month follow-up",
        "Korean clinics offer international patient coordinators who plan 2-trip itineraries",
        "Average savings of $15,000–$20,000 per arch versus US pricing, even after travel costs",
        "Major growth in bookings from US, Canada, and Australia — markets with highest local dental costs",
      ],
    },

    // ─── #5 ─────────────────────────────────────────────────────────
    {
      rank: 5,
      id: "trend-005",
      name: "Non-Surgical Nose Job (Filler Rhinoplasty)",
      nameKo: "비수술 코 성형 (코 필러)",
      category: "plastic-surgery",
      tagline: "Reshape your nose in 15 minutes with zero surgery",
      description:
        "Non-surgical rhinoplasty uses injectable hyaluronic acid filler to reshape the nose — raising the bridge, refining the tip, correcting asymmetry, or smoothing a dorsal hump — all without surgery, incisions, or anesthesia. Results are immediate, last 12–18 months, and are reversible with hyaluronidase if needed. Korean injectors are exceptionally skilled at this technique, having developed specific protocols for Asian nasal anatomy that produce natural, balanced results. While not a substitute for surgical rhinoplasty in complex cases, it is ideal for patients wanting an improvement without the surgery commitment, or wanting to preview their desired result before committing to surgery.",
      whyTrending: [
        "\"Lunchtime nose job\" concept resonating with time-poor international visitors",
        "Zero downtime and reversibility reducing the decision barrier for first-time aesthetic patients",
        "Korean injectors' reputation for precision and natural Asian nose aesthetics drawing patients from across Asia",
        "Price ($200–$600) vs surgical rhinoplasty ($2,500–$5,000) makes it accessible for a much broader audience",
        "Social media documentation of immediate results creating viral content loop",
      ],
      priceRangeUSD: { min: 200, max: 600 },
      recoveryDays: 0,
      demandGrowthPercent: 76,
      topClinicArea: "Gangnam, Hongdae, Itaewon",
      keyFacts: [
        "Procedure takes 10–20 minutes with topical numbing cream",
        "Results visible immediately — patients leave looking different",
        "Must be performed by an experienced injector — vascular occlusion is a rare but serious risk",
        "Results last 12–18 months; repeat visits common among medical tourists",
        "Many surgical rhinoplasty candidates use filler first to 'test drive' their desired result",
      ],
    },
  ],
  editorNote:
    "Data is based on aggregated inquiry volumes, clinic booking trends, and search data from Korean medical tourism platforms in 2025–2026. Prices reflect typical ranges at reputable mid-to-high-tier Gangnam clinics and do not represent the absolute lowest or highest prices available. Always consult with a qualified physician before undergoing any medical procedure.",
};

// ─── 빠른 접근용 배열 export ───────────────────────────────────────
// 트렌드 순위 리스트만 필요할 때 사용
export const trendingProcedures: TrendingProcedure[] =
  trendingReport2026.procedures;
