// FAQ 시드 데이터 — AEO/AIEO 최적화 Q&A 형식
// 카테고리: 일반, 비자, 비용, 시술, 회복, 언어

export type FaqCategory =
  | "general"       // 일반
  | "visa"          // 비자
  | "cost"          // 비용
  | "procedure"     // 시술
  | "recovery"      // 회복
  | "language";     // 언어

export interface Faq {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
  tags: string[];   // 검색 최적화용 태그
}

export const seedFaqs: Faq[] = [
  // ─── 일반 (General) ──────────────────────────────────────────────
  {
    id: "faq-001",
    category: "general",
    question: "Why do people travel to South Korea for medical procedures?",
    answer:
      "South Korea is a global leader in medical tourism for several compelling reasons. First, Korean surgeons — especially in plastic surgery and dermatology — have developed highly specialized techniques refined over decades, often achieving results that are difficult to replicate elsewhere. Second, costs are typically 40–70% lower than in the United States, Canada, or Australia for comparable quality. Third, Korea has strict licensing requirements and modern, accredited facilities. Finally, the combination of cutting-edge technology and a culture that places high value on aesthetics has created a uniquely concentrated ecosystem of expertise in Gangnam, Seoul.",
    tags: ["why korea", "medical tourism", "overview", "quality"],
  },
  {
    id: "faq-002",
    category: "general",
    question: "Is South Korea safe for medical tourists?",
    answer:
      "South Korea is consistently ranked among the world's safest countries for travelers, with extremely low rates of violent crime against tourists. The medical system is well-regulated: all practicing physicians must be licensed by the Korean Medical Association, and hospitals are regularly inspected. For medical procedures specifically, Korea has a Medical Dispute Mediation system that handles complaints from both domestic and international patients. As with any medical travel, the key risk is choosing an unverified clinic — always verify surgeon credentials, read independent reviews, and get all terms in writing before proceeding.",
    tags: ["safety", "regulations", "accreditation", "medical standards"],
  },
  {
    id: "faq-003",
    category: "general",
    question: "How far in advance should I book my medical trip to Korea?",
    answer:
      "For non-urgent elective procedures, booking 6–12 weeks in advance is ideal. This gives you time for: (1) video consultations with multiple clinics, (2) preparation of medical records and photos, (3) securing travel insurance, and (4) making accommodation and flight arrangements. For major surgeries like facial contouring or full facial packages, some top-tier clinics in Gangnam have waitlists of 3–6 months. For minor treatments like laser therapy or Botox, 2–4 weeks notice is usually sufficient. Avoid booking flights until you have a confirmed appointment with your chosen clinic.",
    tags: ["booking", "planning", "timeline", "advance booking"],
  },
  {
    id: "faq-004",
    category: "general",
    question: "What types of medical procedures are most popular in Korea?",
    answer:
      "The most popular medical procedures among international patients in Korea are: (1) Plastic surgery — rhinoplasty (nose), double eyelid surgery, facial contouring (V-line jaw, cheekbone reduction), and breast augmentation; (2) Dermatology — laser skin treatments, Ultherapy, thread lifts, and acne scar treatment; (3) Dental procedures — implants, veneers, Invisalign, and full-arch solutions; (4) Vision correction — LASIK, LASEK, and ICL implants. Korea is particularly dominant in facial bone contouring surgeries that require highly specialized surgeons, as these procedures are performed far more frequently in Korea than anywhere else in the world.",
    tags: ["procedures", "popular treatments", "plastic surgery", "dermatology", "dental", "lasik"],
  },
  {
    id: "faq-005",
    category: "general",
    question: "How do I find a reputable clinic in Korea?",
    answer:
      "Finding a reputable clinic requires research across multiple sources: (1) Check the Korean Medical Association database (kma.org) to verify the surgeon's license; (2) Read reviews on international platforms (RealSelf, international medical tourism forums) as well as Korean-language platforms (Naver Blog, Kakao) — use translation tools; (3) Look for clinics with a dedicated international patient department and English coordinators; (4) Do video consultations with at least 3 clinics before deciding; (5) Ask for before-and-after photos of actual patients, not stock photos; (6) Request a written quote and surgical plan before committing. Avoid clinics that pressure you to book immediately or offer prices significantly below the market rate.",
    tags: ["finding a clinic", "verification", "research", "reputable clinic"],
  },

  // ─── 비자 (Visa) ─────────────────────────────────────────────────
  {
    id: "faq-006",
    category: "visa",
    question: "Do I need a visa to travel to South Korea for medical tourism?",
    answer:
      "South Korea offers visa-free entry for citizens of over 100 countries for stays ranging from 30 to 90 days. Most Western nations (US, UK, EU countries, Canada, Australia) do not require a visa for short medical tourism visits. Citizens of countries not on the visa-free list can apply for a C-3-M Medical Tourism Visa, which can be issued for stays up to 90 days. Additionally, if your stay must exceed the visa-free period due to extended treatment or recovery, you can apply for a G-1 visa (medical treatment stay) which allows stays of up to 1 year. Always verify current visa requirements through the Korean Embassy or the Hi Korea e-Government website as policies can change.",
    tags: ["visa", "visa-free", "C-3-M", "G-1 visa", "entry requirements"],
  },
  {
    id: "faq-007",
    category: "visa",
    question: "What is the C-3-M Medical Tourism Visa and who needs it?",
    answer:
      "The C-3-M Medical Tourism Visa is a short-term visa specifically designed for foreign nationals traveling to South Korea for medical treatment who are from countries that do not have a visa-free agreement with Korea. It allows a single entry stay of up to 90 days. To apply, you typically need: (1) a valid passport, (2) a letter of invitation or appointment confirmation from a Korean medical institution, (3) proof of financial ability to cover medical expenses, (4) a completed application form. The visa is processed at Korean embassies or consulates in your home country. Processing times are typically 5–10 business days. Travelers from visa-free countries do not need this visa and can enter on a standard tourist visa waiver.",
    tags: ["C-3-M visa", "medical visa", "visa application", "visa requirements"],
  },
  {
    id: "faq-008",
    category: "visa",
    question: "Can I extend my stay in Korea if my recovery takes longer than expected?",
    answer:
      "Yes, it is possible to extend your stay in Korea if medically necessary. The options depend on your current visa status: (1) If you entered on a visa-free waiver, you can apply for a single extension at a local immigration office (hikorea.go.kr) for 30 days in most cases; (2) If you entered on a C-3-M visa, you can apply for a G-1 (medical stay) visa change at an immigration office, which allows you to stay for up to 1 year with the doctor's recommendation letter; (3) You will need supporting documentation from your Korean clinic confirming the medical necessity of the extended stay. Plan ahead — apply for extension before your current status expires. Immigration offices are found in major cities and Incheon Airport.",
    tags: ["visa extension", "extended stay", "immigration", "recovery visa"],
  },
  {
    id: "faq-009",
    category: "visa",
    question: "Can I bring a companion with me on a medical tourism visa?",
    answer:
      "Yes, a companion (caregiver or family member) traveling with a medical tourist can typically obtain a C-3-M companion visa (sometimes called C-3-M companion status). The companion must apply separately and submit proof of relationship to the patient (marriage certificate, family register, etc.) along with the patient's visa application. If you are from a visa-free country, your companion can also enter visa-free under the standard tourist waiver. Note that a companion who stays in Korea longer than their visa-free period will also need to apply for an extension or appropriate visa change. Most clinics can provide a companion invitation letter if requested.",
    tags: ["companion visa", "caregiver", "family", "accompanying person"],
  },

  // ─── 비용 (Cost) ──────────────────────────────────────────────────
  {
    id: "faq-010",
    category: "cost",
    question: "How much does plastic surgery cost in South Korea compared to other countries?",
    answer:
      "South Korea generally offers 40–70% savings over US prices and 30–50% savings over UK/Australian prices for comparable procedures. Approximate price ranges (USD): Rhinoplasty $2,000–$5,000 (US: $7,000–$15,000); Double eyelid surgery $700–$1,800 (US: $3,000–$6,000); V-line jaw contouring $5,000–$10,000 (US: $12,000–$25,000); Breast augmentation $3,000–$6,000 (US: $8,000–$15,000). These are wide ranges because cost varies significantly by clinic tier, surgeon experience, and procedural complexity. When budgeting, add $1,500–$3,000 for flights and accommodation, and factor in the value of 10–14 days off work. Even with these costs, significant savings typically remain.",
    tags: ["cost", "price", "comparison", "how much", "budget"],
  },
  {
    id: "faq-011",
    category: "cost",
    question: "What does the cost of a procedure in Korea typically include?",
    answer:
      "Prices quoted by Korean clinics for surgical procedures typically include: surgeon's fee, anesthesia, operating room use, basic nursing care, and standard follow-up consultations during your stay. What is often NOT included: pre-operative medical tests (if required), prescription medications to take home, compression garments, accommodations, and translations for documents you take home. Always ask for an itemized quote in writing. Some clinics offer all-inclusive medical tourism packages that bundle accommodation, airport transfers, and coordination services — these can be convenient but compare the total against booking components separately.",
    tags: ["what's included", "cost breakdown", "quote", "package"],
  },
  {
    id: "faq-012",
    category: "cost",
    question: "How much should I budget for a dental trip to Korea?",
    answer:
      "Dental procedure costs in Korea (per tooth/unit, approximate USD): Single dental implant $900–$1,800 (US: $3,500–$6,000); Porcelain veneer $280–$450 (US: $900–$2,500); Ceramic crown $280–$400 (US: $900–$2,000); Invisalign full treatment $2,500–$4,000 (US: $5,000–$8,000); Teeth whitening $120–$250 (US: $400–$800). For a dental trip, also budget for: flights + accommodation ($800–$2,000 for 1–2 weeks), potential second trip for implants (implant osseointegration requires 3–6 months), and travel insurance. Most dental tourists who need 2–4 implants find the total trip cost is still 40–60% below their home country price.",
    tags: ["dental cost", "implant price", "veneer price", "dental tourism budget"],
  },
  {
    id: "faq-013",
    category: "cost",
    question: "What is the best way to pay at Korean clinics?",
    answer:
      "The most common and often most cost-effective payment method is Korean Won cash. You can exchange currency at Incheon Airport (competitive rates), use ATMs (KEB Hana Bank and Woori Bank have reliable foreign card service), or use currency exchange shops in Myeongdong and Gangnam. Most major clinics accept Visa and Mastercard credit cards but may add a 1–3% foreign transaction fee. For larger procedures, clinics often require a deposit in advance via international wire transfer — ask for bank account details and a reference number. Cryptocurrency is not widely accepted at medical clinics. Keep all receipts as some countries allow partial medical expense tax deductions.",
    tags: ["payment", "cash", "credit card", "wire transfer", "currency"],
  },
  {
    id: "faq-014",
    category: "cost",
    question: "Is Korean medical care covered by my home country's insurance?",
    answer:
      "Most home-country health insurance plans do not cover elective cosmetic procedures regardless of where they are performed. Standard health insurance rarely reimburses procedures such as rhinoplasty, breast augmentation, or cosmetic dental work in Korea. However, there are exceptions: (1) Some vision correction (LASIK/ICL) may be partially covered depending on your plan and diagnosis; (2) Medically necessary dental work (like implants after trauma) might qualify; (3) Some flexible spending account (FSA) or health savings account (HSA) funds in the US can be used for certain medical procedures. Before traveling, contact your insurance provider with the procedure's CPT/ICD code to verify coverage. Additionally, consider purchasing specialized medical tourism insurance that covers complications from elective procedures.",
    tags: ["insurance", "coverage", "home insurance", "FSA", "HSA"],
  },

  // ─── 시술 (Procedure) ─────────────────────────────────────────────
  {
    id: "faq-015",
    category: "procedure",
    question: "What is double eyelid surgery and how is it done in Korea?",
    answer:
      "Double eyelid surgery (blepharoplasty) creates a visible crease in the upper eyelid, which is naturally absent in roughly 50% of East Asian individuals. In Korea, it is the most commonly performed cosmetic procedure. There are two main techniques: (1) Non-incisional (suture) method — tiny sutures create the crease without cutting, takes 30–45 minutes, minimal recovery, best for younger patients with thinner eyelids; (2) Incisional method — a small incision removes excess skin and fat, longer recovery but more permanent result, better for patients with puffier or older eyelids. Korean surgeons are globally recognized for their expertise in this procedure. Costs range from $700 (non-incisional) to $1,800 (incisional) at reputable Gangnam clinics.",
    tags: ["double eyelid", "blepharoplasty", "eye surgery", "incisional", "non-incisional"],
  },
  {
    id: "faq-016",
    category: "procedure",
    question: "What is rhinoplasty like in Korea? Is the approach different from Western countries?",
    answer:
      "Korean rhinoplasty surgeons are world-renowned, particularly for their ability to create subtle, natural-looking results that complement Asian facial features. The Korean approach often emphasizes refinement — raising and defining the nasal bridge, refining the tip, and improving overall facial harmony — rather than dramatic transformation. Technically, Korean surgeons frequently use autologous cartilage (from the patient's own ear or rib) for structural support, which tends to produce more natural and longer-lasting results than synthetic implants alone. Procedures range from simple tip refinement (1.5–2 hours) to complex revision rhinoplasty (3–5 hours). Swelling takes 3–6 months to fully resolve, so results are not immediately apparent.",
    tags: ["rhinoplasty", "nose job", "nose surgery", "Korean rhinoplasty"],
  },
  {
    id: "faq-017",
    category: "procedure",
    question: "What is V-line jaw surgery and what is the recovery like?",
    answer:
      "V-line surgery (or facial contouring surgery) is a category of procedures that reshape the lower face — including the jaw, mandible angle, and chin — to create a slimmer, more oval facial appearance. It may involve: square jaw reduction (shaving or cutting the mandible angle), chin osteotomy (reshaping the chin bone), and sometimes cheekbone reduction. This is real orthognathic bone surgery performed under general anesthesia, lasting 2–4 hours. Recovery is significant: liquid/soft food diet for 4–8 weeks, facial swelling for 3–6 months, full result visible at 6–12 months. It is one of the most complex cosmetic procedures offered in Korea and requires a highly experienced surgeon. Not recommended for first-time surgery patients. Cost: $5,000–$12,000 depending on scope.",
    tags: ["V-line", "jaw surgery", "facial contouring", "jaw reduction", "chin surgery"],
  },
  {
    id: "faq-018",
    category: "procedure",
    question: "What non-surgical skin treatments are most popular in Korea?",
    answer:
      "Korea is a global leader in non-surgical aesthetic medicine. The most popular non-surgical skin treatments for international patients include: (1) Ultherapy / HIFU — ultrasound-based skin lifting, zero downtime, $800–$1,500; (2) Thermage FLX — radiofrequency tightening, zero downtime, $700–$1,200; (3) Pico laser toning — pigmentation, pores, and rejuvenation, $150–$300/session; (4) Skin booster injections (Restylane Vital, Juvederm) — deep hydration, microinjections across the face, $300–$600; (5) Thread lift (PDO threads) — mechanical lifting effect, 2–3 days minor bruising, $800–$2,000; (6) Botox and fillers — widely available, very competitive pricing. Many visitors combine 2–3 of these treatments in a single trip.",
    tags: ["non-surgical", "laser", "Ultherapy", "Thermage", "skin booster", "thread lift"],
  },
  {
    id: "faq-019",
    category: "procedure",
    question: "How long does it take to get LASIK in Korea and what is the total process?",
    answer:
      "LASIK in Korea is efficient and well-organized for international patients. The full process from arrival to post-op clearance typically takes 3–5 days: Day 1 — comprehensive eye examination (corneal mapping, thickness measurement, prescription analysis), takes 2–3 hours; no contact lenses for 1–2 weeks prior required. Day 2 (or same day if tests clear) — the surgery itself takes 10–15 minutes total for both eyes. Day 3–4 — post-operative check at 24 hours. Some clinics provide a 1-week follow-up via telemedicine for patients who fly home earlier. Total cost for both eyes: $1,500–$2,200 at reputable Korean eye clinics, significantly less than equivalent clinics in the US, UK, or Australia.",
    tags: ["LASIK", "vision correction", "eye surgery", "process", "timeline"],
  },
  {
    id: "faq-020",
    category: "procedure",
    question: "What should I bring to my consultation in Korea?",
    answer:
      "To make the most of your Korean clinic consultation, bring: (1) Photos — clear, well-lit photos of the area(s) you are considering treating, both close-up and from multiple angles; (2) Reference images — examples of results you like (and results you want to avoid); (3) Medical history summary — any relevant conditions, previous surgeries, allergies, and current medications in English; (4) Questions list — prepare your questions in advance since consultation time is limited; (5) Passport or ID; (6) Translation of any existing medical reports. For dental consultations, bring recent dental X-rays if available. For eye consultations, bring your current glasses prescription and contact lens history. Most English-speaking clinics accept emailed documents in advance, which saves time.",
    tags: ["consultation", "what to bring", "preparation", "photos", "medical history"],
  },

  // ─── 회복 (Recovery) ──────────────────────────────────────────────
  {
    id: "faq-021",
    category: "recovery",
    question: "How long do I need to stay in Korea after plastic surgery?",
    answer:
      "Minimum recommended stay depends heavily on the procedure: Double eyelid (non-incisional) — 5–7 days; Rhinoplasty — 10–14 days (splint removal required at day 7–10); Breast augmentation — 7–10 days; Jaw/facial contouring surgery — 14–21 days minimum; Liposuction — 7–10 days; Laser skin treatments — 3–5 days. These minimums assume the procedure goes smoothly. Plan for at least one post-operative check before flying home. Long-haul flights (over 8 hours) may require additional days of rest before flying as altitude and pressure changes can affect healing. Always get your surgeon's specific clearance before boarding a flight home.",
    tags: ["recovery time", "how long to stay", "post-op", "minimum stay"],
  },
  {
    id: "faq-022",
    category: "recovery",
    question: "Is it safe to fly home after surgery? When is it safe to fly?",
    answer:
      "Flying too soon after surgery carries real risks: deep vein thrombosis (DVT) from immobility on long flights, swelling exacerbation from cabin pressure changes, and infection risk from public air travel. General guidelines: (1) Minor procedures (Botox, fillers, laser) — can fly the next day; (2) Rhinoplasty — typically cleared after splint removal (day 7–10), but many surgeons prefer 10–14 days; (3) Breast augmentation or liposuction — usually 7–10 days; (4) Facial bone surgery — minimum 14 days, prefer 21 days; (5) Dental implants (post-extraction) — 3–5 days. On long flights after surgery: walk every hour, stay hydrated, wear compression socks, avoid alcohol. Always get written medical clearance from your Korean surgeon before flying.",
    tags: ["flying after surgery", "when to fly", "DVT", "flight safety", "clearance"],
  },
  {
    id: "faq-023",
    category: "recovery",
    question: "What accommodations are best for medical recovery in Seoul?",
    answer:
      "The best accommodation for surgical recovery in Seoul depends on your procedure: (1) Guesthouses near the clinic — many medical tourism-specific guesthouses in the Apgujeong and Sinsa-dong areas offer recovery-friendly rooms with adjustable beds, 24-hour reception, and staff familiar with post-op needs. Cost: $50–$120/night; (2) Serviced apartments — more space, kitchen for preparing soft foods, privacy. Recommended for 2+ week stays. Cost: $80–$200/night; (3) Hospital recovery rooms — some major clinics offer in-house recovery suites for the first 1–3 nights post-surgery, which is ideal for major procedures; (4) Hotel near the clinic — standard option, ensure they allow early check-in since you'll arrive from surgery groggy. Search Naver Map or Airbnb for medical recovery accommodation Seoul for specialized options.",
    tags: ["accommodation", "recovery hotel", "guesthouse", "where to stay", "recovery apartment"],
  },
  {
    id: "faq-024",
    category: "recovery",
    question: "What should I eat during recovery in Seoul?",
    answer:
      "Post-surgical diet depends on your procedure, but general guidance: (1) Facial bone surgery (jaw, V-line) — liquid/blended diet for 4–8 weeks. Korea has excellent juk (rice porridge) restaurants everywhere; also doenjang jjigae (soybean paste soup, served soft), and easily blended Korean soups; (2) Rhinoplasty — no dietary restrictions but avoid blowing your nose; soft foods for the first few days while swollen; (3) Dental procedures — soft foods for 1–2 weeks. Korean convenience stores (CU, GS25) stock soft tofu, yogurt, and puddings 24/7; (4) Laser/skin treatments — no dietary restrictions but increase water intake and antioxidant-rich foods; (5) All patients should avoid alcohol for at least 2–4 weeks post-surgery as it increases swelling and delays healing. Delivery apps like Coupang Eats and Baemin offer English-language interfaces.",
    tags: ["diet", "recovery food", "what to eat", "post-op diet", "soft food"],
  },
  {
    id: "faq-025",
    category: "recovery",
    question: "How do I manage swelling and bruising after cosmetic surgery?",
    answer:
      "Managing post-surgical swelling is a common concern. Evidence-based approaches: (1) Elevation — keep the surgical area elevated above heart level, especially when sleeping (use extra pillows); (2) Cold compresses — apply cold (not ice directly) for 15–20 minutes at a time in the first 48 hours; after 72 hours, switch to warm compresses to help lymphatic drainage; (3) Arnica — oral arnica supplements and topical arnica gel are widely used (and frequently recommended by Korean surgeons) to reduce bruising; available at Korean pharmacies; (4) Avoid salt — excess sodium dramatically increases post-op swelling; (5) Gentle lymphatic massage — some Korean clinics offer post-operative lymphatic massage, which significantly reduces swelling timeline; (6) Patience — some swelling (especially after nose and jaw surgery) is normal for months. Don't judge your result in the first 4–8 weeks.",
    tags: ["swelling", "bruising", "recovery tips", "arnica", "lymphatic massage", "cold compress"],
  },

  // ─── 언어 (Language) ──────────────────────────────────────────────
  {
    id: "faq-026",
    category: "language",
    question: "Do I need to speak Korean to get medical treatment in Korea?",
    answer:
      "No — you do not need to speak Korean to receive medical treatment in Korea. Major clinics in Gangnam and other medical tourism areas maintain dedicated international patient departments with English-speaking coordinators who handle everything from scheduling and translation to post-op care instructions. For clinics without English staff, professional medical interpreters can be arranged (often at additional cost). Useful apps for navigating outside the clinic: Papago (Korean-English translation, more accurate than Google Translate for Korean), Naver Map (navigation in English), and KakaoTalk (many clinics communicate via this app). Most large pharmacies near Gangnam can dispense your prescribed medications without needing to explain in Korean — just show the prescription.",
    tags: ["language", "English", "Korean", "translation", "language barrier"],
  },
  {
    id: "faq-027",
    category: "language",
    question: "What languages do Korean clinics support besides English?",
    answer:
      "Korean medical tourism clinics, especially in Gangnam, have invested heavily in multilingual services to attract international patients. Common languages supported beyond English: Chinese (Mandarin/Simplified) is the most widely available — Korea receives more Chinese medical tourists than any other nationality; Japanese (many Gangnam clinics have Japanese coordinators); Thai (popular at clinics specializing in facial procedures); Vietnamese (growing demand from Southeast Asia); Arabic (available at select clinics catering to Middle Eastern patients); Russian (available at a smaller number of clinics). Less common: French, Spanish, German, Portuguese. When contacting clinics, specify your language preference and ask specifically whether they have a coordinator who speaks it fluently (not just a translation app).",
    tags: ["languages", "Chinese", "Japanese", "Arabic", "multilingual", "interpreter"],
  },
  {
    id: "faq-028",
    category: "language",
    question: "What translation apps work best in Korea for medical tourism?",
    answer:
      "The best translation apps for navigating Korea as a medical tourist: (1) Papago (by Naver) — the gold standard for Korean-English translation, significantly more accurate than Google Translate for Korean; available free on iOS and Android; camera mode translates menus and signs in real-time; (2) Google Translate — less accurate for Korean but useful for camera/photo translation of text; (3) DeepL — excellent for paragraph-level document translation; useful for understanding medical consent forms (still get a human translation for anything you're signing); (4) KakaoTalk — Korea's dominant messaging app, many clinics use it for updates and photo sharing. Save the clinic's KakaoTalk ID before you arrive. Note: Always verify important medical information (dosages, diagnoses, instructions) through a qualified human interpreter rather than relying solely on app translations.",
    tags: ["Papago", "Google Translate", "translation app", "Kakao", "language tools"],
  },
  {
    id: "faq-029",
    category: "language",
    question: "How do I communicate post-op care instructions if I don't speak Korean?",
    answer:
      "Before leaving any Korean medical clinic, ensure you receive: (1) Written post-op instructions in English — request this explicitly; reputable clinics serving international patients will have these prepared; (2) A medication list in English with each drug's name, dosage, frequency, and any restrictions; (3) An emergency contact number with English-speaking staff available after hours; (4) A schedule of any required follow-up appointments or telemedicine consultations. For prescription medications, Korean pharmacists near Gangnam are accustomed to international patients — the prescription label will typically show both Korean and generic drug names. If you can't get English documentation from the clinic, photograph every Korean document and use Papago's camera translation as a backup. Always confirm you understand your post-op care before discharge.",
    tags: ["post-op instructions", "medication", "discharge", "communication", "language"],
  },
  {
    id: "faq-030",
    category: "language",
    question: "Are there medical interpreters available in Korea for patients who need them?",
    answer:
      "Yes — professional medical interpreters are available in South Korea through several channels: (1) Clinic-based interpreters — most international patient departments at major Gangnam clinics have staff interpreters; confirm availability in your specific language when booking; (2) Korea Medical Tourism Association (KMTA) — maintains a directory of certified medical interpreters; (3) Private medical interpreter services — bookable by the hour, cost approximately $30–$80/hour; (4) Government health tourism services — the Korea Health Industry Development Institute (KHIDI) runs a Health Tourism Assistance service available at some hospitals for free or low cost; (5) Hospital International Centers — large hospitals like Samsung Medical Center and Asan Medical Center have dedicated International Health Services offices with multi-language support. For complex procedures, investing in a dedicated professional interpreter rather than relying solely on clinic staff is strongly recommended.",
    tags: ["medical interpreter", "interpreter service", "KMTA", "KHIDI", "professional interpretation"],
  },
];
