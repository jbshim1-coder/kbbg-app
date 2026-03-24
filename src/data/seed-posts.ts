// 더미 커뮤니티 게시글 데이터 — 외국인 환자가 작성한 것처럼 자연스럽게
// 실제 시술 후기, 질문, 경험담 형식

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  authorCountry: string;   // ISO 2-letter country code
  board: "plastic-surgery" | "dermatology" | "dental" | "general";
  upvotes: number;
  downvotes: number;
  commentCount: number;
  viewCount: number;
  createdAt: string;       // ISO 8601
}

export const seedPosts: Post[] = [
  // ─── 성형 게시판 ──────────────────────────────────────────────────
  {
    id: "post-001",
    title: "My rhinoplasty experience at a Gangnam clinic — 3-month update",
    content: `I finally did it! After lurking on this forum for two years I went ahead with my nose job at a clinic in Gangnam. I flew in from the UK specifically for the procedure.

Quick summary:
- Clinic: Areumdaun Plastic Surgery (압구정)
- Surgeon: Dr. Park (board-certified, 12 years experience)
- Procedure: Tip plasty + slight hump reduction
- Total cost: ~$2,800 USD (including consultation and 1 follow-up)

**The good:** The coordinator spoke fluent English and answered every single one of my paranoid WhatsApp messages at midnight Seoul time. The clinic itself felt like a high-end hotel. Anesthesia team was professional and I didn't have any nausea post-op.

**Week 1:** Swollen beyond recognition. My tip looked enormous but everyone online said this was normal and they were right.

**Month 3:** The swelling is 80% gone. I can finally see the result and honestly I'm really happy. The hump is gone and the tip is refined but not fake-looking.

Would I recommend going to Korea for rhinoplasty? Yes, 100%. Just do your research, read reviews on Korean sites too (Naver blog posts are gold if you can get them translated), and do at least 3 consultations before committing.

Happy to answer questions!`,
    author: "SophiaFromLondon",
    authorCountry: "GB",
    board: "plastic-surgery",
    upvotes: 342,
    downvotes: 8,
    commentCount: 67,
    viewCount: 8920,
    createdAt: "2026-01-15T09:23:00Z",
  },
  {
    id: "post-002",
    title: "Double eyelid surgery — Chinese patient's honest review",
    content: `Hi everyone, I'm a 24-year-old from Shanghai who just got double eyelid surgery done in Seoul last month. I wanted to write an honest review because there's a lot of fluffy content out there.

**Why Korea over China?**
Honestly, I could have gotten it done in Shanghai for less money, but I've seen some botched results among my friends and the surgeons in Gangnam have a reputation for precision. I also wanted an excuse to travel.

**Pre-op:**
I did video consultations with 4 clinics before flying over. Two of them felt pushy about upselling additional procedures I didn't ask for. I ultimately chose a mid-sized clinic that was patient with my questions.

**The surgery:**
Non-incisional method, under local anesthesia, took about 45 minutes. I was awake the whole time which sounds scary but it was actually fine. Mild discomfort, no real pain.

**Cost breakdown (approximately):**
- Non-incisional double eyelid: $900
- Flight + 10-day hotel near clinic: $600
- Food and misc: $300
- Total trip: ~$1,800

**Recovery:**
Days 1–3 were rough. Very swollen, couldn't open my eyes fully. Day 7 I went out in public (with sunglasses). Day 14 I looked almost normal. Now at 5 weeks the fold is there and looking natural.

**Verdict:** 9/10. Would do it again. The remaining 1 point is just because I wish the clinic had a better system for post-op photo sharing — I had to email everything manually.`,
    author: "LinXiaoMei",
    authorCountry: "CN",
    board: "plastic-surgery",
    upvotes: 215,
    downvotes: 5,
    commentCount: 43,
    viewCount: 5610,
    createdAt: "2026-01-28T14:45:00Z",
  },
  {
    id: "post-003",
    title: "Is Korean plastic surgery cheaper than the US? (Real numbers inside)",
    content: `I've seen a lot of posts claiming Korea is always cheaper but I wanted to do a proper comparison. Here's what I found after getting consultations in both LA and Seoul.

**Rhinoplasty (tip + bridge):**
- LA quote: $8,500–$12,000
- Seoul quotes (3 clinics): $2,500–$4,200
- Savings: Roughly 60–70%

**Upper blepharoplasty (eyelid):**
- LA quote: $3,800–$5,500
- Seoul quotes: $900–$1,500
- Savings: ~70%

**Facial contouring (V-line jaw):**
- LA: Very few surgeons offer this, quotes were $15,000–$22,000
- Seoul: $5,000–$9,000 depending on complexity
- Savings: 50–60%

**Important caveats:**
1. Add $1,500–$3,000 for flights + accommodation
2. You need to budget for at least 10–14 days off work
3. Follow-up care is harder from abroad — some issues can only be addressed in-person

Even accounting for travel, the math works out significantly in Korea's favor for most procedures. Korea has also developed highly specialized surgeons for certain procedures (especially facial bone work and rhinoplasty) that are harder to find in the US.

Not financial or medical advice, just sharing my research!`,
    author: "MarcusFromDallas",
    authorCountry: "US",
    board: "plastic-surgery",
    upvotes: 489,
    downvotes: 22,
    commentCount: 91,
    viewCount: 14300,
    createdAt: "2026-02-03T11:00:00Z",
  },
  {
    id: "post-004",
    title: "Jaw contouring (V-line) 6-month post-op — with photos description",
    content: `Six months post jaw contouring and I wanted to give a detailed update because this is a serious surgery that deserves serious discussion.

**Background:** I'm from Thailand, 28F, had a naturally very wide lower face that I was self-conscious about since my teens.

**Surgery:** Square jaw reduction + chin reshaping (combination V-line). This is bone surgery — they literally shave and reshape the jaw bone. It is NOT like getting Botox in your jaw muscle (that's a completely different, much simpler procedure).

**Recovery timeline:**
- Week 1: Face was so swollen I genuinely didn't recognize myself. Had to be on a liquid diet.
- Weeks 2–4: Soft food only (porridge, yogurt, soft tofu). Still noticeably swollen.
- Month 2: Swelling reducing but still significant. Don't judge the result yet.
- Month 3: Starting to see the "real" result. Looking more natural.
- Month 6: I'm happy. The final shape is softer and more proportional to my features.

**Pain level:** Surprisingly manageable with prescribed medication. The discomfort from liquid diet and jaw stiffness was worse than actual pain.

**Total cost:** ~$7,200 USD at a reputable Gangnam hospital (mid-range for this procedure)

**Would I recommend it?** Yes, but only if you are 100% ready for a 3–6 month commitment to the recovery process. This is not a weekend procedure.

I'm happy to answer DMs.`,
    author: "MintraKrairat",
    authorCountry: "TH",
    board: "plastic-surgery",
    upvotes: 378,
    downvotes: 14,
    commentCount: 82,
    viewCount: 9870,
    createdAt: "2026-02-10T08:30:00Z",
  },

  // ─── 피부과 게시판 ────────────────────────────────────────────────
  {
    id: "post-005",
    title: "Ultherapy vs Thermage in Korea — which should I choose?",
    content: `I've been doing research for my upcoming trip to Seoul and I'm trying to decide between Ultherapy and Thermage. Both target skin laxity but the technology is different (ultrasound vs radiofrequency).

**My situation:** 38F, mild jowling starting, want a non-surgical tightening treatment.

**Price comparison I found (Gangnam clinics):**
- Full face Ultherapy: $800–$1,500
- Full face Thermage FLX: $700–$1,200
- Full face + neck combo (either): $1,200–$2,200

**What I learned from consultations:**
Two dermatologists told me that for my age and concern, either would work but Ultherapy penetrates deeper into the SMAS layer (same layer surgeons tighten during a facelift), making it better for structural lifting. Thermage is more versatile for surface texture improvement too.

Both have zero downtime which is perfect for a trip.

Has anyone done both and have a preference? I'm leaning toward Ultherapy but at $300–$400 more the price difference is meaningful.`,
    author: "JessicaVanDerBerg",
    authorCountry: "NL",
    board: "dermatology",
    upvotes: 127,
    downvotes: 3,
    commentCount: 38,
    viewCount: 3240,
    createdAt: "2026-01-20T16:00:00Z",
  },
  {
    id: "post-006",
    title: "Korean laser treatments for dark spots — my 2-week skin trip diary",
    content: `Just got back from a 2-week skin trip to Seoul. Main goal was to address hyperpigmentation (dark spots from sun damage + post-acne marks). Here's my day-by-day experience.

**Day 1:** Arrived, jet-lagged. Did my first consultation at a Gangnam dermatology clinic. The doctor spoke excellent English and used a Visia skin analysis machine to show me exactly where my pigmentation was and at what depth.

**Day 3:** First Pico laser toning session ($200). Mild warmth during procedure, no pain. Face was slightly red for 2 hours, then normal. Zero downtime as promised.

**Day 7:** Follow-up session ($180, second visit discount). This time I also added a Vitamin C + Glutathione IV drip ($80) for internal skin brightening.

**Day 10:** Collagen booster injection (Skinbooster, similar to Restylane Vital). This was the most "treatment-feeling" — tiny injections all over the face. Felt like light pinpricks. Small bumps resolved in 2 days.

**Day 14:** Final check. The dermatologist showed me the before/after Visia scan side by side. Pigmentation was visibly reduced. Not 100% gone but definitely 40–50% better.

**Total spend:** ~$600 for all 3 treatments
**Would I do it again?** Already planning my next trip 6 months later.`,
    author: "AmyTanSingapore",
    authorCountry: "SG",
    board: "dermatology",
    upvotes: 293,
    downvotes: 7,
    commentCount: 54,
    viewCount: 6780,
    createdAt: "2026-02-05T10:15:00Z",
  },
  {
    id: "post-007",
    title: "Acne scar treatment in Korea — worth the trip?",
    content: `Short answer: yes. Long answer follows.

I've had moderate acne scarring (rolling + boxcar scars) since my early 20s. Tried everything at home in Australia — fractional lasers, microneedling, even Subcision. Some improvement but never satisfied.

Did a 10-day trip to Seoul specifically for this. Booked consultations at 3 clinics beforehand via email.

**Treatment plan I received:** 2 sessions of fractional CO2 laser (spaced 5 days apart, which is aggressive but doable in 10 days), plus 1 session of subscision for the deepest rolling scars.

**Cost:** $420 per laser session, $180 for subscision = $1,020 total

**In Australia I paid:** $550–$700 per fractional laser session. So the math was already favorable.

**Results at 3 months (now):** I'm genuinely shocked. The texture is dramatically smoother. The deepest scars are still visible but the overall appearance is probably 60% better. My dermatologist back home (who was skeptical) admitted the results were impressive.

**Caveat:** Recovery from fractional CO2 is no joke. Days 1–5 your face looks sunburned and is crusting. Plan to stay in your hotel. I brought a ton of recovery-focused sheet masks which helped.

**Recommendation:** If you have moderate-to-severe acne scars and are willing to deal with 5–7 days of recovery, a focused trip to Korea makes a lot of sense both quality and cost-wise.`,
    author: "RyanMelbourneAU",
    authorCountry: "AU",
    board: "dermatology",
    upvotes: 412,
    downvotes: 11,
    commentCount: 76,
    viewCount: 10200,
    createdAt: "2026-02-18T13:40:00Z",
  },

  // ─── 치과 게시판 ──────────────────────────────────────────────────
  {
    id: "post-008",
    title: "Dental implants in Korea — a complete guide from someone who did it",
    content: `I'm a 52-year-old from Canada who needed 3 dental implants. My dentist back home quoted $6,500 per implant (yes, really). I did some research and found I could get all 3 done in Korea for less than one Canadian implant. Here's exactly how it went.

**Total Korean cost:** $1,600 per implant = $4,800 for 3
**Canadian quote:** $6,500 x 3 = $19,500
**Savings even after flights + hotel:** ~$12,000

**Timeline:** This required 2 trips to Korea.

*Trip 1 (4 days):* Extractions (I still had the failing teeth), bone grafting, and implant post placement. Recovery was fine — some swelling, prescribed antibiotics and painkillers.

*Trip 2 (3 months later, 3 days):* Abutment placement and final crown fitting. This is quick and mostly painless.

**The clinics:** I visited two clinics for consultations. Chose a 10-dentist practice in Gangnam that had English-speaking staff and had been doing implants for 15+ years.

**Was it worth the hassle?** Absolutely. I combined it with a mini vacation in Seoul. The food was incredible and I had a great time between appointments.

**Things I wish I'd known:**
1. Book your follow-up trip calendar before you leave home
2. Bring your full dental X-rays — saves time and money at first consultation
3. Some clinics offer lodging discounts at partner hotels — ask about this

Happy to answer any questions about the process.`,
    author: "DavidFromVancouver",
    authorCountry: "CA",
    board: "dental",
    upvotes: 534,
    downvotes: 18,
    commentCount: 98,
    viewCount: 15600,
    createdAt: "2026-01-08T09:00:00Z",
  },
  {
    id: "post-009",
    title: "Veneers in Seoul — are Korean veneers as good as Turkish ones?",
    content: `The medical tourism community loves to debate Korea vs Turkey for veneers. I've now done veneers in both countries (Turkey first, then Korea for replacements/corrections) so I can give a real comparison.

**Turkey veneers (2022):** Paid $180/tooth for 10 veneers = $1,800. They were e.max ceramic, shade matched, looked great initially. However, 2 had small chips by year 2 and the shade started looking slightly yellow compared to my natural teeth.

**Korea veneers (2025):** Paid $380/tooth for 6 veneers (front teeth only this time) = $2,280. The lab work took 5 days (rushed for medical tourists) vs the standard 7. Color matching was exceptional — the dentist literally held multiple shade samples under different lights.

**Quality difference:** Noticeable. The Korean veneers have a translucency that looks more like real teeth. The Turkey ones were slightly more "opaque white."

**Would I go to Korea for veneers again?** Yes. The price is double Turkey but the finish quality is also noticeably higher. Depends on your priority — for front teeth that you see every day, I prefer the Korean quality.

**Practical note:** Seoul is harder to reach than Istanbul for most Europeans, which often tilts the decision. If you're coming from Asia/North America, Korea makes more sense geographically.`,
    author: "ElenaFromRiga",
    authorCountry: "LV",
    board: "dental",
    upvotes: 178,
    downvotes: 32,
    commentCount: 45,
    viewCount: 4900,
    createdAt: "2026-02-12T15:20:00Z",
  },
  {
    id: "post-010",
    title: "Emergency dental in Seoul — my experience as a tourist",
    content: `This isn't a planned medical tourism story — I cracked a tooth on my first day in Seoul while eating tteokbokki (those rice cakes are NO JOKE) and needed emergency dental care.

**What I did:**
1. Googled "English speaking dentist Seoul" at 9pm. Found a clinic in Itaewon that listed 24-hour emergency contact.
2. Called the number — actual human answered, in English.
3. Was seen at 8am the next morning.

**Treatment:** The crack was deep but hadn't reached the pulp, so they did a same-day crown using their in-house CEREC machine (milled right there in 2 hours).

**Cost:** 380,000 KRW (~$280 USD) for the crown. Back home in the US this would have been $1,200–$1,800 and required two appointments.

**The experience:** Honestly better than my regular dentist at home. Clean, modern equipment, explained everything step by step, no judgment about the tteokbokki incident.

**Lesson learned:** Don't fear dental emergencies in Seoul. The dental care here is genuinely world-class and very reasonably priced. I've since recommended the city to three friends for planned dental work.`,
    author: "BrookeFromSeattle",
    authorCountry: "US",
    board: "dental",
    upvotes: 267,
    downvotes: 4,
    commentCount: 39,
    viewCount: 7100,
    createdAt: "2026-02-20T11:50:00Z",
  },

  // ─── 일반 게시판 ──────────────────────────────────────────────────
  {
    id: "post-011",
    title: "Complete beginner's guide to medical tourism in Korea (2026)",
    content: `I've now done 3 medical trips to Korea and I want to compile everything I know for first-timers.

**VISA:**
Most nationalities can enter Korea visa-free for 30–90 days. Check the Korean e-VISA site. Medical tourism doesn't require a special visa for short procedures.

**BOOKING PROCESS:**
1. Identify your procedure(s)
2. Email 3–5 clinics with clear photos and your medical history summary
3. Schedule video consultations (most offer these free)
4. Book the one you feel most comfortable with
5. Only book flights after you have a confirmed consultation slot

**ACCOMMODATION:**
Stay near the clinic if possible. Apgujeong and Cheongdam areas in Gangnam have many short-stay apartments and guesthouses popular with medical tourists. Recovery is easier when you don't have a long commute.

**MONEY:**
Pay in cash (Korean won) when possible — many clinics offer a small discount. KEB Hana Bank ATMs and Woori Bank ATMs are most reliable for foreign cards.

**LANGUAGE:**
Major clinics have English coordinators. For everything else, Papago (Korean app) is more accurate than Google Translate for Korean-English.

**POST-OP:**
Make sure you understand what medications you're taking home (customs declaration) and get written instructions in English. Schedule a follow-up with your home doctor before you leave Korea.

Questions welcome!`,
    author: "PriyaFromMumbai",
    authorCountry: "IN",
    board: "general",
    upvotes: 621,
    downvotes: 14,
    commentCount: 113,
    viewCount: 22400,
    createdAt: "2026-01-05T07:30:00Z",
  },
  {
    id: "post-012",
    title: "Do Korean clinics accept credit cards? What's the best way to pay?",
    content: `Quick practical post since this confused me before my first trip.

**Credit cards:** Most major Gangnam clinics accept Visa, Mastercard, and sometimes Amex. However, foreign transaction fees add 1–3%. Some smaller clinics are cash-only.

**Cash (Korean Won):** Usually the best option. You can get KRW at the airport (rates are decent at Incheon) or use ATMs. Woori Bank and KEB Hana ATMs have the lowest fees for foreign cards in my experience.

**Wire transfer:** For large procedures ($5,000+), many clinics prefer a deposit via wire transfer in advance. Ask for the clinic's bank details and reference number.

**What I do:** Bring enough cash for the procedure + 20% buffer. Keep a credit card as backup. Don't carry it all at once — Korea is very safe but why risk it.

**Receipts:** Always get an itemized receipt. You may be able to claim some of this on your home country's medical tax deductions depending on your jurisdiction.

Hope this helps!`,
    author: "OliverFromStockholm",
    authorCountry: "SE",
    board: "general",
    upvotes: 189,
    downvotes: 2,
    commentCount: 27,
    viewCount: 5300,
    createdAt: "2026-01-22T14:10:00Z",
  },
  {
    id: "post-013",
    title: "Solo female traveler + medical tourism in Korea — is it safe?",
    content: `I'm a 31-year-old woman from Germany who did a solo medical tourism trip to Seoul last November. I got rhinoplasty done and wanted to share a safety perspective since I see this question a lot.

**Overall safety:** Seoul is extraordinarily safe for solo female travelers. I walked back to my guesthouse at midnight through Gangnam and felt completely fine. Crime against tourists is very rare.

**Post-op solo recovery:** This was the harder part. The first 48 hours after nose surgery you really want someone around — not for safety reasons, but because you're groggy, slightly nauseous from anesthesia, and can't really look after yourself fully.

**What I did:**
- Booked a clinic that had a "recovery care" add-on service ($80/night for a nurse check-in)
- Stayed at a guesthouse 5 minutes walk from the clinic
- Gave my family the clinic's address and my emergency contact in Korea

**Things that helped:**
- Having all documents translated before arrival (passport copy, travel insurance, medical history)
- Downloading Korea apps: KakaoTaxi (for rides), Naver Map (for navigation), Papago (translation)
- Joining a Korea medical tourism Facebook group where I found a recovery buddy (another patient staying at the same guesthouse)

**Would I do it again solo?** Yes. It was one of the most empowering travel experiences I've had. Just plan for the first 2 days of recovery being low-energy.`,
    author: "LenaFromHamburg",
    authorCountry: "DE",
    board: "general",
    upvotes: 445,
    downvotes: 9,
    commentCount: 87,
    viewCount: 11800,
    createdAt: "2026-01-30T09:45:00Z",
  },
  {
    id: "post-014",
    title: "How to spot red flags when choosing a Korean plastic surgery clinic",
    content: `After doing extensive research and visiting 6 clinics for consultations before choosing one, here are the red flags I learned to watch for:

**Red flags:**
1. **Pressure to book immediately** — "This price is only valid today." Legitimate clinics don't need to pressure you.
2. **Surgeon switching** — You consult with one surgeon but a different one operates. Ask specifically who will operate.
3. **Unusually low prices** — If a rhinoplasty quote is $800–$1,000, something is off. You get what you pay for.
4. **Vague answers about complications** — Every good surgeon can clearly explain complication rates and revision policies.
5. **No English documentation** — Post-op instructions in Korean only = potential problems.
6. **Can't see actual patient results** — Stock photos or heavily filtered photos are not the same as real patient results.

**Green flags:**
- Board-certified surgeon with verifiable credentials (check the Korean Medical Association)
- Written quote and surgical plan before you commit
- Clear revision policy in writing
- Genuine before/after photos with realistic expectations
- English-speaking coordinator who is patient with questions
- No pressure to add procedures you didn't ask about

Stay safe out there and trust your gut. If something feels off in a consultation, it probably is.`,
    author: "FionaFromDublin",
    authorCountry: "IE",
    board: "general",
    upvotes: 728,
    downvotes: 16,
    commentCount: 124,
    viewCount: 19600,
    createdAt: "2026-02-08T16:30:00Z",
  },
  {
    id: "post-015",
    title: "Combining a Korea trip with medical procedures — 2-week itinerary",
    content: `Not every day needs to be spent at the clinic! Here's how I structured my 2-week Seoul trip around a skin procedure schedule.

**Procedure schedule:**
- Day 1: Arrival, rest
- Day 2: Consultation, Pico laser session #1
- Day 3: Rest, gentle sightseeing (Bukchon Hanok Village — no sun exposure needed there)
- Day 5: Skinbooster injection
- Day 7: Pico laser session #2
- Day 8–10: Full sightseeing (skin recovered)
- Day 12: Final dermatology check
- Day 14: Departure

**Recommended activities between treatments:**
- Gyeongbokgung Palace (minimal sun exposure in morning)
- Insadong arts district (indoor galleries)
- Lotte World Tower observation deck (indoor)
- Korean BBQ restaurants, night markets
- Spa (jjimjilbang) — wait until fully healed from any procedures

**What I avoided right after laser:**
- Direct sunlight without SPF 50+
- Swimming or saunas for 48 hours
- Heavy exercise

The key is planning light activities during recovery days and saving outdoor/active plans for when your skin is ready. Seoul has more than enough to do.`,
    author: "NaomiFromToronto",
    authorCountry: "CA",
    board: "general",
    upvotes: 312,
    downvotes: 6,
    commentCount: 52,
    viewCount: 8900,
    createdAt: "2026-02-25T12:00:00Z",
  },
  {
    id: "post-016",
    title: "LASIK in Korea — $1,800 vs $4,500 at home. My experience.",
    content: `I've worn glasses since age 8. Did LASIK in Seoul last month and I'm writing this without glasses for the first time in 23 years.

**Why Korea:**
US quotes: $4,200–$5,000 for both eyes (all-in)
Seoul quotes: $1,600–$2,200 for both eyes (all-in)

**Clinic selection:**
I went with an eye clinic in Gangnam that had an English-speaking doctor (trained in the US) and used the Zeiss VisuMax laser system — same equipment as top clinics in the States.

**The procedure:**
Took literally 8 minutes total. The actual laser-on-eye time is about 20 seconds per eye. I was awake, mildly anxious but not in pain. They gave me a mild sedative.

**Immediately after:**
Vision was blurry like looking through frosted glass. They put me in a dark room for an hour, then sent me back to my hotel in a taxi with eye shields and instructions to sleep.

**Next morning:**
Vision was 20/20. I cried. The front desk lady thought something was wrong.

**Recovery:**
5 days of antibiotic + steroid drops. No rubbing. Avoid dusty environments. That's basically it.

**Would I recommend:**
100%. This was the best money I've ever spent. The savings alone paid for flights and hotel with money to spare.

Any questions about the Korea LASIK experience, ask away.`,
    author: "CarlosFromMiami",
    authorCountry: "US",
    board: "general",
    upvotes: 567,
    downvotes: 12,
    commentCount: 103,
    viewCount: 16400,
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "post-017",
    title: "What nobody tells you about recovering in Seoul after surgery",
    content: `Real talk about post-surgery recovery in Seoul — the parts blogs don't mention.

**The loneliness:** If you're solo, the recovery period can feel very isolating. You're in a foreign country, you can't do much, and you're probably self-conscious about swelling. I suggest bringing a good book, loading up your Netflix downloads, and connecting with other patients at your guesthouse.

**The diet challenge:** Post-op you may be on soft foods. Finding soft Korean food is actually easier than you'd think (juk/porridge restaurants everywhere) but explain your restrictions using the Papago app if the restaurant doesn't have English menus.

**The sleep position:** Most post-facial surgeries require sleeping elevated. Korean guesthouses aren't always set up for this. Bring an extra pillow or request them in advance.

**The heat:** If you're recovering in summer, Seoul humidity is intense. Stay air-conditioned and avoid sweating near your healing incisions.

**The pharmacy:** Korean pharmacies (약국) are excellent and very common. Show them your prescription from the clinic — most pharmacists near Gangnam can read it and will dispense correctly.

**The silver lining:** I actually ended up having a really meaningful, introspective recovery week. Lots of journaling, Korean dramas, room service, slow walks in Apgujeong. If you accept it as a "quiet time" rather than fighting it, it's fine.`,
    author: "IsabellaFromSydney",
    authorCountry: "AU",
    board: "general",
    upvotes: 394,
    downvotes: 8,
    commentCount: 71,
    viewCount: 10500,
    createdAt: "2026-03-05T14:20:00Z",
  },
  {
    id: "post-018",
    title: "Travel insurance for medical tourism — what you actually need",
    content: `Most standard travel insurance excludes elective cosmetic surgery complications. Here's what I learned the hard way.

**What standard travel insurance covers:**
- Emergency unrelated to your planned procedure
- Travel disruption, lost luggage
- Pre-existing condition emergencies (if declared)

**What it does NOT cover:**
- Complications from your elective surgery
- Revision surgery if unhappy with results
- Extended stay due to recovery complications

**What you need:**
1. **Medical travel insurance that specifically covers elective procedures** — there are specialized policies for this. I used a broker who specializes in medical tourism.

2. **The clinic's own warranty/revision policy** — get this in writing before surgery. Good clinics will offer free or discounted revision within 1 year for functional issues.

3. **Evacuation insurance** — if something goes seriously wrong, medical evacuation from Korea to your home country is expensive ($30,000+). Worth the premium.

**Approximate costs:**
- Standard travel insurance: $50–$100 for 2 weeks
- Medical tourism specific coverage: $200–$400 depending on procedure value

It's not cheap but neither is an unexpected complication with no coverage. Be informed before you book.`,
    author: "AnneFromZurich",
    authorCountry: "CH",
    board: "general",
    upvotes: 453,
    downvotes: 7,
    commentCount: 69,
    viewCount: 12300,
    createdAt: "2026-03-10T09:15:00Z",
  },
  {
    id: "post-019",
    title: "Korean skincare routine I learned from my dermatologist visit",
    content: `I went to Seoul primarily for a laser treatment but the 30-minute consultation with the dermatologist taught me more about skincare than 10 years of YouTube.

**What they actually use:**
The dermatologist told me that most of her Korean patients use very simple routines — 4–5 products max. The elaborate 10-step routine is somewhat of a Western myth about Korean skincare.

**What she recommended for my skin (combo, slight hyperpigmentation):**
1. **Gentle low-pH cleanser** (she recommended COSRX)
2. **Niacinamide serum** (10% for brightening — she said anything above that is marketing)
3. **Ceramide moisturizer** (barrier repair is more important than most people realize)
4. **SPF 50 PA++++ sunscreen** — THIS is the real secret. Every day. Even indoors.

**What she told me to stop using:**
- Vitamin C serum (irritating my skin without me realizing)
- Exfoliating toner (I was over-exfoliating)
- Heavy retinol (too harsh for daytime sensitivity I had)

**The sunscreen thing is real:** She said 80% of her patients' pigmentation issues would improve significantly with consistent daily SPF alone before any laser treatments. I've been using Korean sunscreen religiously for 3 months and the difference is visible.

The consultation cost $30. Best $30 I've ever spent on skincare.`,
    author: "ZoeFromParis",
    authorCountry: "FR",
    board: "dermatology",
    upvotes: 631,
    downvotes: 19,
    commentCount: 118,
    viewCount: 17800,
    createdAt: "2026-03-15T11:00:00Z",
  },
  {
    id: "post-020",
    title: "Breast augmentation in Korea — my 1-year update",
    content: `One year since my breast augmentation in Seoul. Promised myself I'd write this update once I had a full year of perspective.

**Quick facts:**
- Age: 32, from USA
- Implants: Motiva round implants, moderate profile, 295cc
- Surgeon: board-certified at a mid-size Gangnam clinic
- Cost: $3,800 USD (vs $8,000–$14,000 quotes in the US)
- Hospital stay: day surgery, discharged same day

**Why Korea:**
The price was the initial draw but I ended up feeling more confident in my surgeon after the Korean consultations than the US ones. The Korean surgeons seemed more focused on anatomical fit and natural appearance. My US consultations felt more like a sales pitch.

**Year 1 experience:**
- Month 1–3: The "drop and fluff" period — implants high, tight, not natural looking. Was slightly panicking.
- Month 4–6: Started dropping into position. Shape improving.
- Month 9–12: Final result. Natural looking, proportional, exactly what I asked for.

**Any regrets?** None. The result is exactly what I wanted. The recovery (1 week of significant chest tightness, 3 weeks of movement restrictions) was manageable.

**The one thing I wish I'd known:** The "drop and fluff" timeline is REAL. Don't judge your results in the first 3 months. Trust the process.

Messaging is open if anyone has specific questions.`,
    author: "StephanieFromAtlanta",
    authorCountry: "US",
    board: "plastic-surgery",
    upvotes: 489,
    downvotes: 21,
    commentCount: 95,
    viewCount: 13900,
    createdAt: "2026-03-20T15:30:00Z",
  },
];
