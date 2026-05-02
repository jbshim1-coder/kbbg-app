// KBBG Asia 쇼츠 주제 — 아시아 채널용 (365개, 1년치)
// 대상: 중국, 일본, 베트남, 태국, 몽골 시청자
// 규칙: 매 7번째 주제는 service 카테고리 / 병원명 금지 / 한국어 금지 / 동물·수술·혐오 금지
export const TOPICS = [
  // ── Week 1 ──────────────────────────────────────────────────────────────────
  { day: 1,  category: "kbeauty",  keyword: "glass skin trend",            script_hint: "Why Asian tourists travel to Korea just for glass skin treatments — what clinics actually do" },
  { day: 2,  category: "kpop",     keyword: "idol clear skin secret",      script_hint: "What K-pop idols eat and apply daily to maintain flawless skin — fan breakdown" },
  { day: 3,  category: "kfood",    keyword: "red ginseng skin benefits",   script_hint: "How Koreans use red ginseng in food AND skincare — dual benefit explained" },
  { day: 4,  category: "travel",   keyword: "first time Korea medical trip", script_hint: "Step-by-step guide for Vietnamese first-timers planning a Korea beauty trip" },
  { day: 5,  category: "skincare", keyword: "double cleansing method",     script_hint: "Oil cleanser first, foam second — why Koreans swear by this two-step method" },
  { day: 6,  category: "compare",  keyword: "skin whitening Korea vs Thailand", script_hint: "How Korean and Thai approaches to brightening skin differ — methods and results" },
  { day: 7,  category: "service",  keyword: "KBBG clinic finder intro",    script_hint: "Find verified Korean beauty clinics in 30 seconds — how KBBG AI matching works" },

  // ── Week 2 ──────────────────────────────────────────────────────────────────
  { day: 8,  category: "kbeauty",  keyword: "V-line jaw treatment",        script_hint: "Why V-line face shape is the most-requested look from Chinese and Japanese visitors" },
  { day: 9,  category: "kpop",     keyword: "NewJeans no-makeup look",     script_hint: "Recreating the NewJeans bare-skin aesthetic — products and routine revealed" },
  { day: 10, category: "kfood",    keyword: "kimchi for gut and skin",     script_hint: "Fermented kimchi bacteria that help clear acne — science explained simply" },
  { day: 11, category: "travel",   keyword: "Korea beauty visa tips",      script_hint: "What visa do you need for a Korean medical beauty trip — Thailand and Vietnam guide" },
  { day: 12, category: "skincare", keyword: "snail mucin serum guide",     script_hint: "What snail mucin actually does to your pores — Korean dermatologist explains" },
  { day: 13, category: "compare",  keyword: "lip filler Korea vs Japan",   script_hint: "Natural vs dramatic — how lip aesthetics differ between Korean and Japanese clinics" },
  { day: 14, category: "service",  keyword: "KBBG multilingual support",   script_hint: "KBBG supports Chinese, Japanese, Vietnamese, Thai — no language barrier for your clinic search" },

  // ── Week 3 ──────────────────────────────────────────────────────────────────
  { day: 15, category: "kbeauty",  keyword: "nose bridge filler trend",    script_hint: "High nose bridge without permanent procedure — why non-surgical filler is booming in Korea" },
  { day: 16, category: "kpop",     keyword: "BLACKPINK hair care routine", script_hint: "How BLACKPINK members keep hair shiny despite constant styling — their known tips" },
  { day: 17, category: "kfood",    keyword: "Korean seaweed soup skin glow", script_hint: "Miyeok-guk (seaweed soup) after beauty treatments — why Korean clinics recommend it" },
  { day: 18, category: "travel",   keyword: "Gangnam beauty district map", script_hint: "First-time visitor's guide to Gangnam's beauty street — what to expect and where to go" },
  { day: 19, category: "skincare", keyword: "toner pad vs toner water",    script_hint: "Soaked pad or poured liquid — which Korean toner method suits your skin type" },
  { day: 20, category: "compare",  keyword: "acne scar treatment Korea vs Vietnam", script_hint: "Comparing laser acne scar approaches in Korean vs Vietnamese clinics — cost and results" },
  { day: 21, category: "service",  keyword: "KBBG review system explained", script_hint: "How KBBG collects and verifies real patient reviews — no fake stars, only real stories" },

  // ── Week 4 ──────────────────────────────────────────────────────────────────
  { day: 22, category: "kbeauty",  keyword: "Botox for square jaw",        script_hint: "Masseter Botox for slim jaw — the Korean technique popular across Asia" },
  { day: 23, category: "kpop",     keyword: "Aespa skin glow method",      script_hint: "How Aespa members achieve that dewy on-stage glow — breakdown of their known routine" },
  { day: 24, category: "kfood",    keyword: "collagen-rich Korean foods",  script_hint: "Samgyeopsal, bone broth, and more — foods Koreans eat for natural skin elasticity" },
  { day: 25, category: "travel",   keyword: "medical tourism budget Korea", script_hint: "Average cost range for a 5-day Korean beauty trip from Japan — realistic budget breakdown" },
  { day: 26, category: "skincare", keyword: "essence vs serum difference", script_hint: "Korean essence and serum sound the same but work differently — quick explainer" },
  { day: 27, category: "compare",  keyword: "double eyelid Korea vs China", script_hint: "Full incision vs partial — how Korean and Chinese clinics approach double eyelid differently" },
  { day: 28, category: "service",  keyword: "KBBG before-after gallery",   script_hint: "Real before-and-after photos from verified KBBG patients — how to browse and filter" },

  // ── Week 5 ──────────────────────────────────────────────────────────────────
  { day: 29, category: "kbeauty",  keyword: "LED mask home treatment",     script_hint: "Korean celebrity LED face masks — which wavelength does what and how to use at home" },
  { day: 30, category: "kpop",     keyword: "Seventeen members skin tips", script_hint: "Seventeen's 13-member group skincare culture — what they've shared in interviews" },
  { day: 31, category: "kfood",    keyword: "barley tea skin hydration",   script_hint: "Bori-cha (barley tea) — the Korean zero-calorie drink that hydrates and detoxes skin" },
  { day: 32, category: "travel",   keyword: "Korea incheon airport beauty", script_hint: "K-beauty shopping at Incheon Airport duty-free — must-buy list for transit travelers" },
  { day: 33, category: "skincare", keyword: "sunscreen SPF50 everyday",    script_hint: "Why Korean dermatologists say SPF50 every 2 hours is non-negotiable — even indoors" },
  { day: 34, category: "compare",  keyword: "hair loss treatment Korea vs Mongolia", script_hint: "How Korean scalp clinics differ from Mongolian approaches — technology comparison" },
  { day: 35, category: "service",  keyword: "KBBG how to book consultation", script_hint: "Book a free online consultation with a Korean clinic through KBBG — 3 simple steps" },

  // ── Week 6 ──────────────────────────────────────────────────────────────────
  { day: 36, category: "kbeauty",  keyword: "thread lift non-surgical",    script_hint: "Thread lift that lifts face without going under the knife — what Korean clinics offer" },
  { day: 37, category: "kpop",     keyword: "IVE makeup-free skin",        script_hint: "How IVE maintains camera-ready skin on hectic schedules — their known habits" },
  { day: 38, category: "kfood",    keyword: "mung bean mask K-tradition",  script_hint: "Korean grandmothers' mung bean facial mask — traditional recipe still used by clinics" },
  { day: 39, category: "travel",   keyword: "language barrier Korean clinic", script_hint: "How to communicate at a Korean clinic when you don't speak Korean — practical tips" },
  { day: 40, category: "skincare", keyword: "AHA BHA Korean exfoliation",  script_hint: "Korean approach to chemical exfoliation — how often and which acids for Asian skin" },
  { day: 41, category: "compare",  keyword: "anti-aging Korea vs Japan",   script_hint: "Korean vs Japanese philosophy on aging skin — different aesthetics, different results" },
  { day: 42, category: "service",  keyword: "KBBG price comparison tool",  script_hint: "Compare treatment price ranges across Korean clinics on KBBG — no hidden fees" },

  // ── Week 7 ──────────────────────────────────────────────────────────────────
  { day: 43, category: "kbeauty",  keyword: "pore tightening laser",       script_hint: "Laser treatments for enlarged pores — Korean clinic options popular with Chinese tourists" },
  { day: 44, category: "kpop",     keyword: "TXT skincare philosophy",     script_hint: "TXT members on skin health — what they've said about routines and stress management" },
  { day: 45, category: "kfood",    keyword: "doenjang anti-aging paste",   script_hint: "Fermented soybean paste (doenjang) — the Korean superfood linked to anti-aging studies" },
  { day: 46, category: "travel",   keyword: "Vietnam to Korea medical tour", script_hint: "Vietnam to Korea medical tourism guide — visa, flights, clinic booking, and recovery stay" },
  { day: 47, category: "skincare", keyword: "centella asiatica calm skin", script_hint: "Cica (centella) — why Korean brands use this herb to calm redness and strengthen skin barrier" },
  { day: 48, category: "compare",  keyword: "skin clinic service Japan vs Korea", script_hint: "How the clinic experience differs in Japan vs Korea — consultation style, aftercare, follow-up" },
  { day: 49, category: "service",  keyword: "KBBG for group medical trips", script_hint: "Planning a group beauty trip to Korea? KBBG handles multi-person clinic coordination" },

  // ── Week 8 ──────────────────────────────────────────────────────────────────
  { day: 50, category: "kbeauty",  keyword: "skin booster hydration shot", script_hint: "Rejuran and Juvederm hydration boosters — Korean clinic treatments for deep skin moisture" },
  { day: 51, category: "kpop",     keyword: "Stray Kids hair treatment",   script_hint: "Stray Kids' known hair care habits — how they handle color-damaged hair on tour" },
  { day: 52, category: "kfood",    keyword: "Korean rice water for skin",  script_hint: "Ssaltteum (rice water) toner — the traditional Korean beauty hack that went global" },
  { day: 53, category: "travel",   keyword: "Korea medical tour recovery hotel", script_hint: "Where to stay after a Korean skin treatment — recovery-friendly hotels near clinics" },
  { day: 54, category: "skincare", keyword: "niacinamide brightening routine", script_hint: "Niacinamide in Korean skincare — how to layer it correctly for even skin tone" },
  { day: 55, category: "compare",  keyword: "filler longevity Korea vs Thailand", script_hint: "How long fillers last — comparison of Korean and Thai clinic techniques and aftercare" },
  { day: 56, category: "service",  keyword: "KBBG treatment category guide", script_hint: "Browse KBBG by treatment type — skin, hair, body, dental — find what you need fast" },

  // ── Week 9 ──────────────────────────────────────────────────────────────────
  { day: 57, category: "kbeauty",  keyword: "Korean BB cream origin",      script_hint: "BB cream was invented in Korea — the full history and why it changed Asian beauty forever" },
  { day: 58, category: "kpop",     keyword: "LE SSERAFIM workout skin",    script_hint: "How LE SSERAFIM's intense training affects skin and what they do to recover" },
  { day: 59, category: "kfood",    keyword: "green tea skin antioxidants", script_hint: "Korean green tea (nokcha) — antioxidant content vs Chinese and Japanese varieties for skin" },
  { day: 60, category: "travel",   keyword: "Thailand to Korea beauty trip", script_hint: "Thai traveler's guide to Korea medical tourism — what's different, what to expect" },
  { day: 61, category: "skincare", keyword: "hyaluronic acid 3 layer method", script_hint: "Korean 3-layer hyaluronic acid application — why you apply it on damp skin" },
  { day: 62, category: "compare",  keyword: "whitening drip Korea vs Vietnam", script_hint: "IV glutathione drip: Korean clinic protocol vs Vietnamese approach — safety and results" },
  { day: 63, category: "service",  keyword: "KBBG verified clinic badge",  script_hint: "What the KBBG verified badge means — standards clinics must meet to be listed" },

  // ── Week 10 ─────────────────────────────────────────────────────────────────
  { day: 64, category: "kbeauty",  keyword: "micro-needling RF skin tightening", script_hint: "RF microneedling — the Korean clinic treatment popular with women in their 30s and 40s" },
  { day: 65, category: "kpop",     keyword: "TWICE no-filter skin challenge", script_hint: "TWICE members sharing unfiltered selfies — what their actual skin looks like and why" },
  { day: 66, category: "kfood",    keyword: "jujube red date skin glow",   script_hint: "Daechu (jujube) tea — traditional Korean ingredient for circulation and skin brightness" },
  { day: 67, category: "travel",   keyword: "Mongolia to Korea beauty trip", script_hint: "Mongolian travelers' guide to Korean medical beauty — cost, language, what to prepare" },
  { day: 68, category: "skincare", keyword: "retinol Korean brand picks",  script_hint: "Korean brand retinol alternatives — less irritating formulas for sensitive Asian skin types" },
  { day: 69, category: "compare",  keyword: "acne treatment Korea vs China", script_hint: "How Chinese dermatology clinics and Korean clinics approach acne differently — approach comparison" },
  { day: 70, category: "service",  keyword: "KBBG mobile app overview",    script_hint: "Search, compare, and contact Korean clinics from your phone — KBBG app walkthrough" },

  // ── Week 11 ─────────────────────────────────────────────────────────────────
  { day: 71, category: "kbeauty",  keyword: "scalp care Korean trend",     script_hint: "Korean clinics offer scalp treatments alongside hair procedures — what the trend looks like" },
  { day: 72, category: "kpop",     keyword: "ENHYPEN skincare for men",    script_hint: "Male K-pop skincare is normal — what ENHYPEN members have shared about their routines" },
  { day: 73, category: "kfood",    keyword: "persimmon skin benefits",     script_hint: "Gam (persimmon) — the Korean autumn fruit with Vitamin C content great for pigmentation" },
  { day: 74, category: "travel",   keyword: "Korea medical trip checklist", script_hint: "10-item checklist before flying to Korea for a beauty procedure — what you must prepare" },
  { day: 75, category: "skincare", keyword: "sleeping mask overnight",     script_hint: "Korean sleeping pack — how to use it correctly and which ingredients work overnight" },
  { day: 76, category: "compare",  keyword: "dental whitening Korea vs Japan", script_hint: "Comparing teeth whitening quality and price at Korean vs Japanese dental clinics" },
  { day: 77, category: "service",  keyword: "KBBG interpreter service",    script_hint: "KBBG connects you with Korean clinic interpreters — Vietnamese, Thai, Japanese, Chinese" },

  // ── Week 12 ─────────────────────────────────────────────────────────────────
  { day: 78, category: "kbeauty",  keyword: "chok-chok dewy skin trend",   script_hint: "Chok-chok means bouncy, dewy skin — the Korean ideal and how clinics help achieve it" },
  { day: 79, category: "kpop",     keyword: "aespa no-surgery natural look", script_hint: "Aespa's aesthetic is AI-meets-natural — what their skin prep philosophy reportedly is" },
  { day: 80, category: "kfood",    keyword: "Korean pumpkin porridge skin", script_hint: "Hobakjuk (pumpkin porridge) — beta-carotene-rich Korean dish that supports skin repair" },
  { day: 81, category: "travel",   keyword: "Japan to Korea day trip beauty", script_hint: "Day trip from Fukuoka or Osaka to Korea for a skin treatment — is it worth it?" },
  { day: 82, category: "skincare", keyword: "vitamin C serum layering",    script_hint: "Korean vitamin C serum tips — when to apply, what not to mix, and which form is stable" },
  { day: 83, category: "compare",  keyword: "body whitening Korea vs Thailand", script_hint: "Full body brightening treatments in Korea vs Thailand — approach, sessions, and cost range" },
  { day: 84, category: "service",  keyword: "KBBG treatment guide PDF",    script_hint: "Download KBBG's free Korean beauty procedure guide — available in 5 Asian languages" },

  // ── Week 13 ─────────────────────────────────────────────────────────────────
  { day: 85, category: "kbeauty",  keyword: "freckle removal laser",       script_hint: "Why Korean clinics see high demand for freckle removal from Chinese and Vietnamese patients" },
  { day: 86, category: "kpop",     keyword: "BTS Jin skin reveal",         script_hint: "Jin's reportedly simple skincare philosophy — what he's shared about his routine" },
  { day: 87, category: "kfood",    keyword: "lotus root skin detox",       script_hint: "Yeongeun (lotus root) in Korean cuisine — the fiber-rich vegetable that helps clear skin" },
  { day: 88, category: "travel",   keyword: "Korea beauty trip insurance", script_hint: "Do you need travel insurance for a Korean medical beauty trip? What to look for" },
  { day: 89, category: "skincare", keyword: "Korean sunscreen reapplication hack", script_hint: "How Koreans reapply sunscreen over makeup — cushion compacts and mist sprays explained" },
  { day: 90, category: "compare",  keyword: "lip tint Korea vs China cosmetics", script_hint: "Korean vs Chinese lip tint formulas — different textures, pigment levels, and wear time" },
  { day: 91, category: "service",  keyword: "KBBG consultation in your language", script_hint: "Chat with Korean clinic staff in your language through KBBG — no translation needed" },

  // ── Week 14 ─────────────────────────────────────────────────────────────────
  { day: 92, category: "kbeauty",  keyword: "exosome treatment trend",     script_hint: "Exosome skin regeneration — the newest Korean clinic trend explained in simple terms" },
  { day: 93, category: "kpop",     keyword: "NCT Dream skin regimen",      script_hint: "NCT Dream's busy schedule and how they reportedly maintain healthy skin on the road" },
  { day: 94, category: "kfood",    keyword: "mukbang food culture and skin", script_hint: "Does mukbang culture hurt skin? Korean dermatologists weigh in on high-sodium diets" },
  { day: 95, category: "travel",   keyword: "Korean medical tour agency guide", script_hint: "How to choose a reliable medical tourism agency for Korea — red flags and green flags" },
  { day: 96, category: "skincare", keyword: "essence sheet mask hybrid",   script_hint: "Korean essence-soaked sheet masks — how to use them in your routine without overdoing it" },
  { day: 97, category: "compare",  keyword: "Korean vs Vietnamese spa culture", script_hint: "How Korean and Vietnamese spa wellness philosophies differ — treatment goals and methods" },
  { day: 98, category: "service",  keyword: "KBBG for solo travelers",     script_hint: "Solo female traveler going to Korea for skin care? KBBG helps you plan safely" },

  // ── Week 15 ─────────────────────────────────────────────────────────────────
  { day: 99,  category: "kbeauty",  keyword: "pigmentation melasma treatment", script_hint: "Melasma removal — why Korean clinics specialize in this for Asian skin tones" },
  { day: 100, category: "kpop",     keyword: "Kep1er skin recovery tips",  script_hint: "How Kep1er members recover skin after stage makeup — their known skin reset habits" },
  { day: 101, category: "kfood",    keyword: "Korean corn silk tea skin",  script_hint: "Oksusu-tea (corn silk tea) — the Korean diuretic drink that reduces puffiness" },
  { day: 102, category: "travel",   keyword: "Myeongdong beauty shopping guide", script_hint: "How to shop for authentic Korean skincare in Myeongdong — brands, prices, tips" },
  { day: 103, category: "skincare", keyword: "ampoule vs serum Korea",     script_hint: "Korean ampoule — more concentrated than serum, when to use it and how to layer" },
  { day: 104, category: "compare",  keyword: "hair transplant Korea vs Thailand", script_hint: "Hair transplant: comparing Korean FUE technique with Thailand's approach — price and outcome" },
  { day: 105, category: "service",  keyword: "KBBG how reviews are verified", script_hint: "Every KBBG clinic review is verified with appointment records — how the system works" },

  // ── Week 16 ─────────────────────────────────────────────────────────────────
  { day: 106, category: "kbeauty",  keyword: "lip plumping filler natural", script_hint: "Korean lip filler philosophy — natural volume over dramatic change, what to request" },
  { day: 107, category: "kpop",     keyword: "MAMAMOO skin aging philosophy", script_hint: "MAMAMOO members on aging naturally vs treatments — what they've said publicly" },
  { day: 108, category: "kfood",    keyword: "Korean bean sprout detox",   script_hint: "Kongnamul (bean sprouts) — the hangover remedy vegetable that also detoxes skin" },
  { day: 109, category: "travel",   keyword: "Korea beauty trip with friend group", script_hint: "How 3-4 friends can plan a Korea beauty trip together — budget tips and coordination" },
  { day: 110, category: "skincare", keyword: "tightening eye cream Korea", script_hint: "Korean eye cream techniques — how to tap, not rub, and which ingredients target dark circles" },
  { day: 111, category: "compare",  keyword: "skin clinic etiquette Korea vs Japan", script_hint: "Clinic behavior norms in Korea vs Japan — what to expect and how to act" },
  { day: 112, category: "service",  keyword: "KBBG for Chinese travelers",  script_hint: "Chinese travelers love Korean skin clinics — KBBG's Chinese-language support and popular treatments" },

  // ── Week 17 ─────────────────────────────────────────────────────────────────
  { day: 113, category: "kbeauty",  keyword: "undereye filler dark circles", script_hint: "Tear trough filler for under-eye hollows — Korean clinic approach and what to expect" },
  { day: 114, category: "kpop",     keyword: "ITZY intense stage skin care", script_hint: "ITZY's intense performance schedule and how they reportedly protect their skin" },
  { day: 115, category: "kfood",    keyword: "Korean sweet potato skin benefits", script_hint: "Goguma (sweet potato) — Vitamin A-rich snack Korean celebrities reportedly eat for skin" },
  { day: 116, category: "travel",   keyword: "Korea medical trip recovery tips", script_hint: "What to do and avoid during recovery after a Korean skin treatment — practical guide" },
  { day: 117, category: "skincare", keyword: "face mist hydration trick",  script_hint: "Korean face mist technique — spray on skin not over makeup for best hydration result" },
  { day: 118, category: "compare",  keyword: "body contouring Korea vs Vietnam", script_hint: "Non-surgical body shaping in Korean vs Vietnamese clinics — technology and results compared" },
  { day: 119, category: "service",  keyword: "KBBG for Japanese travelers", script_hint: "KBBG Japan guide — popular Korean treatments among Japanese visitors and how to book" },

  // ── Week 18 ─────────────────────────────────────────────────────────────────
  { day: 120, category: "kbeauty",  keyword: "Korean derma clinic vs beauty salon", script_hint: "What's the difference between a Korean dermatology clinic and a beauty salon — important distinction" },
  { day: 121, category: "kpop",     keyword: "Stray Kids Bang Chan skincare", script_hint: "Bang Chan's known skincare habits — what the leader of Stray Kids has shared with fans" },
  { day: 122, category: "kfood",    keyword: "Korean soybean health tradition", script_hint: "Meju (fermented soybean) in Korean culture — how soy isoflavones help skin elasticity" },
  { day: 123, category: "travel",   keyword: "Sinchon Hongdae beauty clinics", script_hint: "Clinics near Hongdae and Sinchon — younger crowd areas with competitive pricing" },
  { day: 124, category: "skincare", keyword: "Korean toner first step why", script_hint: "Why toner is the first step in Korean skincare — pH balance and absorption explained" },
  { day: 125, category: "compare",  keyword: "smile line filler Korea vs Thailand", script_hint: "Nasolabial fold filler: Korean minimalist approach vs Thai fuller style — what Asians prefer" },
  { day: 126, category: "service",  keyword: "KBBG for Thai travelers",    script_hint: "Thai tourists in Korea — KBBG's Thai-language support and most-searched Korean treatments" },

  // ── Week 19 ─────────────────────────────────────────────────────────────────
  { day: 127, category: "kbeauty",  keyword: "skin barrier repair K-trend", script_hint: "Skin barrier damage is rising among Asian women — Korean clinic protocol for repair" },
  { day: 128, category: "kpop",     keyword: "4th gen idol minimal skincare", script_hint: "4th generation K-pop idols prefer minimal routines — the shift away from 10-step products" },
  { day: 129, category: "kfood",    keyword: "Korean plum juice skin alkaline", script_hint: "Maesil (plum extract) drink — the alkaline Korean condiment believed to balance skin pH" },
  { day: 130, category: "travel",   keyword: "Korea medical tourism packages", script_hint: "All-inclusive Korean medical beauty packages — what's included and price range overview" },
  { day: 131, category: "skincare", keyword: "mugwort soothing tradition",  script_hint: "Ssuk (mugwort) in Korean skincare — traditional herb that calms irritated, sensitive skin" },
  { day: 132, category: "compare",  keyword: "laser skin tone Korea vs China", script_hint: "Laser treatment for skin tone in Korean vs Chinese clinics — protocols for Asian skin" },
  { day: 133, category: "service",  keyword: "KBBG for Mongolian travelers", script_hint: "Mongolians increasingly visiting Korean clinics — KBBG guide for first-time visitors from Mongolia" },

  // ── Week 20 ─────────────────────────────────────────────────────────────────
  { day: 134, category: "kbeauty",  keyword: "PRP skin rejuvenation",      script_hint: "PRP (platelet-rich plasma) treatment at Korean clinics — what it does and who it's for" },
  { day: 135, category: "kpop",     keyword: "SHINee Key skin longevity",  script_hint: "Key from SHINee openly talks about skincare — what he uses for ageless-looking skin" },
  { day: 136, category: "kfood",    keyword: "Korean chicken soup skin repair", script_hint: "Samgyetang (ginseng chicken soup) — collagen and nutrients for skin repair in Korean culture" },
  { day: 137, category: "travel",   keyword: "Korea beauty trip spring season", script_hint: "Why spring is the best season for Korean skin treatments — less UV, ideal recovery weather" },
  { day: 138, category: "skincare", keyword: "galactomyces ferment glow",  script_hint: "Galactomyces yeast ferment in Korean skincare — the ingredient behind SK-II-type glow products" },
  { day: 139, category: "compare",  keyword: "Korean vs Vietnamese facial massage", script_hint: "Korean Gua sha vs Vietnamese facial massage — different traditions, different results" },
  { day: 140, category: "service",  keyword: "KBBG appointment reminder system", script_hint: "KBBG sends appointment reminders in your language — never miss your Korean clinic booking" },

  // ── Week 21 ─────────────────────────────────────────────────────────────────
  { day: 141, category: "kbeauty",  keyword: "waterless skincare trend",   script_hint: "Korean waterless beauty — highly concentrated formulas replacing water-diluted products" },
  { day: 142, category: "kpop",     keyword: "NMIXX pre-debut skin prep",  script_hint: "How NMIXX prepared their skin for debut — the intensive routine reportedly used" },
  { day: 143, category: "kfood",    keyword: "Korean tofu skin protein",   script_hint: "Dubu (tofu) — isoflavone-rich food that Korean skin nutritionists recommend for firmness" },
  { day: 144, category: "travel",   keyword: "Korea beauty trip autumn",   script_hint: "Autumn travel for Korean skin treatments — dry air considerations and post-treatment care" },
  { day: 145, category: "skincare", keyword: "propolis Korean beauty ingredient", script_hint: "Bee propolis in Korean skincare — anti-inflammatory and brightening properties explained" },
  { day: 146, category: "compare",  keyword: "under-eye treatment China vs Korea", script_hint: "Dark circle and puffiness treatments — how Korean and Chinese clinics approach the eye area" },
  { day: 147, category: "service",  keyword: "KBBG treatment cost estimator", script_hint: "Use KBBG's cost estimator to plan your Korea beauty budget — no surprise clinic bills" },

  // ── Week 22 ─────────────────────────────────────────────────────────────────
  { day: 148, category: "kbeauty",  keyword: "Korean moisturizer texture types", script_hint: "Gel, lotion, cream, balm — Korean moisturizer textures and which suits each skin type" },
  { day: 149, category: "kpop",     keyword: "G-Dragon beauty influence",  script_hint: "G-Dragon's fashion-meets-beauty aesthetic — how he influenced Korean male grooming culture" },
  { day: 150, category: "kfood",    keyword: "pine nut porridge skin benefits", script_hint: "Jatjuk (pine nut porridge) — the Korean post-illness meal with Vitamin E for skin repair" },
  { day: 151, category: "travel",   keyword: "Korea first-day arrival beauty tips", script_hint: "What to do on your first day in Korea before a clinic appointment — skin prep and jet lag" },
  { day: 152, category: "skincare", keyword: "Korean patch treatment spot", script_hint: "Hydrocolloid pimple patches — the Korean invention that changed spot treatment worldwide" },
  { day: 153, category: "compare",  keyword: "collagen supplement Korea vs Japan", script_hint: "Korean vs Japanese collagen drink culture — different formulas and beauty philosophies" },
  { day: 154, category: "service",  keyword: "KBBG post-treatment follow-up", script_hint: "After you return home from Korea, KBBG helps you follow up with your clinic online" },

  // ── Week 23 ─────────────────────────────────────────────────────────────────
  { day: 155, category: "kbeauty",  keyword: "lifting HIFU ultrasound",    script_hint: "HIFU non-surgical lifting at Korean clinics — what to expect and how long results last" },
  { day: 156, category: "kpop",     keyword: "EXO Chanyeol skin tips",     script_hint: "Chanyeol's minimal approach to skincare — what he's shared about keeping skin calm" },
  { day: 157, category: "kfood",    keyword: "Korean wild sesame seed skin", script_hint: "Deulkkae (perilla seed) oil — the Korean omega-3 source used for skin inflammation" },
  { day: 158, category: "travel",   keyword: "Korea beauty trip with baby", script_hint: "Can you travel to Korea for skin treatments with a toddler? — family trip planning tips" },
  { day: 159, category: "skincare", keyword: "ceramide skin barrier Korea", script_hint: "Korean ceramide-heavy moisturizers — why they work for dry and eczema-prone Asian skin" },
  { day: 160, category: "compare",  keyword: "Mongolian vs Korean skin concerns", script_hint: "Mongolian women's top skin concerns vs Korean solutions — dry climate meets high-tech clinics" },
  { day: 161, category: "service",  keyword: "KBBG clinic map Seoul",      script_hint: "Interactive Seoul clinic map on KBBG — find treatments near your hotel in seconds" },

  // ── Week 24 ─────────────────────────────────────────────────────────────────
  { day: 162, category: "kbeauty",  keyword: "Korean men skincare rise",   script_hint: "Korean men's skincare market is one of the largest globally — why and what they use" },
  { day: 163, category: "kpop",     keyword: "BIGBANG T.O.P skin history", script_hint: "T.O.P's dramatic skin transformation — what's known about his skincare evolution" },
  { day: 164, category: "kfood",    keyword: "pear enzyme digestive skin", script_hint: "Bae (Korean pear) — the enzyme-rich fruit used in Korean marinades and skin brightening" },
  { day: 165, category: "travel",   keyword: "Korea beauty trip tax refund", script_hint: "VAT refund on Korean skincare and clinic purchases — how foreign visitors claim it" },
  { day: 166, category: "skincare", keyword: "peptide anti-wrinkle Korean brand", script_hint: "Korean peptide serums — different types and which ones target fine lines effectively" },
  { day: 167, category: "compare",  keyword: "acupuncture vs Korean facial", script_hint: "Traditional Chinese acupuncture facials vs Korean dermatology facials — different school, same goal" },
  { day: 168, category: "service",  keyword: "KBBG partner clinic benefits", script_hint: "KBBG partner clinics offer priority booking for app users — how to unlock the perks" },

  // ── Week 25 ─────────────────────────────────────────────────────────────────
  { day: 169, category: "kbeauty",  keyword: "Korean color cosmetics makeup skin", script_hint: "Korean cosmetics are designed to care for skin while you wear makeup — the dual function trend" },
  { day: 170, category: "kpop",     keyword: "BLACKPINK Lisa skin in Thailand vs Korea", script_hint: "How Thai native Lisa's skin adapted to Korean beauty culture — what she's shared" },
  { day: 171, category: "kfood",    keyword: "Korean lotus leaf detox tea", script_hint: "Yeonip-cha (lotus leaf tea) — Korean herbal drink used for lymph detox and skin clarity" },
  { day: 172, category: "travel",   keyword: "Itaewon Hanam clinic guide", script_hint: "Clinics in Itaewon and surrounding areas — multilingual staff and foreigner-friendly services" },
  { day: 173, category: "skincare", keyword: "mandelic acid Korean gentle exfoliant", script_hint: "Mandelic acid in Korean skincare — gentler than glycolic, better for sensitive Asian skin" },
  { day: 174, category: "compare",  keyword: "Korean vs Chinese hair care culture", script_hint: "Scalp-first vs length-first — how Korean and Chinese hair care philosophy diverges" },
  { day: 175, category: "service",  keyword: "KBBG trending treatments this month", script_hint: "KBBG's monthly trending treatment list — what's most-booked by Asian visitors right now" },

  // ── Week 26 ─────────────────────────────────────────────────────────────────
  { day: 176, category: "kbeauty",  keyword: "sensitive skin Korean approach", script_hint: "Korean clinics' gentle approach to sensitive skin — fragrance-free, barrier-first protocol" },
  { day: 177, category: "kpop",     keyword: "Wanna One visual member skin prep", script_hint: "How Wanna One's visual members prepared skin before variety show appearances" },
  { day: 178, category: "kfood",    keyword: "Korean bokbunja berry skin",  script_hint: "Bokbunja (Korean black raspberry) — anthocyanin-rich berry in Korean beauty foods" },
  { day: 179, category: "travel",   keyword: "Korea dental trip guide Asia", script_hint: "Coming to Korea for dental work? Complete guide for Asian visitors — cost range and clinics" },
  { day: 180, category: "skincare", keyword: "Korean cushion foundation skin protection", script_hint: "Korean cushion foundation — how it was invented to protect skin in Korea's climate" },
  { day: 181, category: "compare",  keyword: "Korean vs Thai dental cosmetics", script_hint: "Dental veneers and whitening: Korea vs Thailand — quality comparison and price range" },
  { day: 182, category: "service",  keyword: "KBBG newsletter beauty tips", script_hint: "Subscribe to KBBG weekly newsletter — Korean beauty tips delivered in your language" },

  // ── Week 27 ─────────────────────────────────────────────────────────────────
  { day: 183, category: "kbeauty",  keyword: "Korean clinic aftercare products", script_hint: "What Korean clinics give patients post-treatment — barrier repair kits and recovery masks" },
  { day: 184, category: "kpop",     keyword: "Red Velvet Irene skin secrets", script_hint: "Irene's flawless skin has been discussed widely — what her known habits and tips are" },
  { day: 185, category: "kfood",    keyword: "Korean tea tradition skin calm", script_hint: "Korean tea culture (barley, chrysanthemum, cinnamon) — which teas support skin health" },
  { day: 186, category: "travel",   keyword: "Korean clinic consultation free?", script_hint: "Are Korean clinic consultations free for foreign visitors? — what to expect and how to ask" },
  { day: 187, category: "skincare", keyword: "green tea seed facial oil Korea", script_hint: "Innisfree-style green tea seed oil — why Korean brands use it for balanced hydration" },
  { day: 188, category: "compare",  keyword: "Korean vs Japanese anti-pollution skincare", script_hint: "Pollution shield skincare in Korea vs Japan — city-specific approaches and products" },
  { day: 189, category: "service",  keyword: "KBBG how to leave a clinic review", script_hint: "Your review helps other Asian travelers — how to submit a verified review on KBBG" },

  // ── Week 28 ─────────────────────────────────────────────────────────────────
  { day: 190, category: "kbeauty",  keyword: "Korean anti-pollution skin shield", script_hint: "Urban skin protection — how Korean city dwellers protect skin from fine dust (PM2.5)" },
  { day: 191, category: "kpop",     keyword: "SuperM workout recovery skin", script_hint: "SuperM's intense training and how group members reportedly recover their skin after workouts" },
  { day: 192, category: "kfood",    keyword: "Korean abalone skin benefits", script_hint: "Jeonbok (abalone) — the luxury Korean seafood with glycine that supports skin collagen" },
  { day: 193, category: "travel",   keyword: "Korea climate skin adjustment tip", script_hint: "Adjusting your skin routine when arriving in Korea — humidity, temperature, and water quality" },
  { day: 194, category: "skincare", keyword: "lactic acid milk cleanse Korea", script_hint: "Korean milk-based cleansers with lactic acid — gentle exfoliation in your daily wash" },
  { day: 195, category: "compare",  keyword: "scar treatment Korea vs Vietnam clinics", script_hint: "Scar reduction treatments in Korean vs Vietnamese clinics — laser vs topical protocols" },
  { day: 196, category: "service",  keyword: "KBBG treatment package deals", script_hint: "Bundle multiple Korean treatments through KBBG and get coordinated scheduling and support" },

  // ── Week 29 ─────────────────────────────────────────────────────────────────
  { day: 197, category: "kbeauty",  keyword: "Korean makeup base no-makeup makeup", script_hint: "The Korean no-makeup makeup look — what products and techniques create that bare-skin effect" },
  { day: 198, category: "kpop",     keyword: "Monsta X workout + skincare balance", script_hint: "Monsta X's gym-heavy schedule and their known approach to managing acne from sweat" },
  { day: 199, category: "kfood",    keyword: "Korean bracken fern skin",   script_hint: "Gosari (bracken fern) — iron-rich Korean mountain vegetable that supports skin oxygenation" },
  { day: 200, category: "travel",   keyword: "200th day Korea beauty milestone", script_hint: "From curious to confident — a year-long Korean beauty journey for Asian patients" },
  { day: 201, category: "skincare", keyword: "Ginseng in Korean skincare history", script_hint: "Ginseng has been in Korean skincare for centuries — modern science confirms why it works" },
  { day: 202, category: "compare",  keyword: "Korean vs Japanese sheet mask market", script_hint: "Korean and Japanese sheet masks dominate Asia — what sets each country's formula apart" },
  { day: 203, category: "service",  keyword: "KBBG trusted by Asian patients",  script_hint: "Thousands of Asian patients found their Korean clinic through KBBG — real stories shared" },

  // ── Week 30 ─────────────────────────────────────────────────────────────────
  { day: 204, category: "kbeauty",  keyword: "Korean bio-cellulose mask",  script_hint: "Bio-cellulose vs cotton sheet masks — why Korean clinics use bio-cellulose for premium treatments" },
  { day: 205, category: "kpop",     keyword: "Taeyeon anti-aging revealed", script_hint: "Taeyeon looks younger every year — what she's shared about her skincare and lifestyle" },
  { day: 206, category: "kfood",    keyword: "Korean chrysanthemum tea skin", script_hint: "Gukhwa-cha (chrysanthemum tea) — Korean herbal tea with antioxidants for clear complexion" },
  { day: 207, category: "travel",   keyword: "Korea monsoon season skin tips", script_hint: "Visiting Korea in summer monsoon? Skin tips for humidity and rain during treatment recovery" },
  { day: 208, category: "skincare", keyword: "Korean multi-step face routine order", script_hint: "The definitive Korean skincare order — from lightest to heaviest, explained step by step" },
  { day: 209, category: "compare",  keyword: "Thai vs Korean massage for skin", script_hint: "Thai body massage vs Korean lymph drainage — two approaches with skin benefits compared" },
  { day: 210, category: "service",  keyword: "KBBG virtual clinic tour",   script_hint: "Tour Korean clinics virtually before booking — 360° clinic previews available on KBBG" },

  // ── Week 31 ─────────────────────────────────────────────────────────────────
  { day: 211, category: "kbeauty",  keyword: "Korean derma laser types guide", script_hint: "Picosecond, fractional, CO2 — Korean clinic laser types and what each one treats" },
  { day: 212, category: "kpop",     keyword: "GOT7 Jackson skincare philosophy", script_hint: "Jackson Wang's skincare — how the HK-raised K-pop star bridges Korean and Chinese beauty habits" },
  { day: 213, category: "kfood",    keyword: "Korean pine needle bath skin", script_hint: "Sonip (pine needle) bath tradition — Korean spa practice that firms and refreshes skin" },
  { day: 214, category: "travel",   keyword: "Korea visa-free countries list", script_hint: "Which Asian countries can enter Korea visa-free for a medical beauty trip — 2024 updated list" },
  { day: 215, category: "skincare", keyword: "Korean double serum method",  script_hint: "Layering two serums in Korean skincare — which combinations work and which cancel each other" },
  { day: 216, category: "compare",  keyword: "Korea vs China cosmetic regulation", script_hint: "How Korean and Chinese cosmetic safety regulations differ — what it means for your products" },
  { day: 217, category: "service",  keyword: "KBBG treatment timeline planner", script_hint: "Plan your Korean treatment timeline on KBBG — multiple sessions scheduled around your trip" },

  // ── Week 32 ─────────────────────────────────────────────────────────────────
  { day: 218, category: "kbeauty",  keyword: "Korean eye cream under-eye patch", script_hint: "Hydrogel eye patches at Korean clinics — 20-minute treatment for brighter under-eyes" },
  { day: 219, category: "kpop",     keyword: "TWICE Momo skin journey",    script_hint: "Momo's skin evolution since debut — what she's shared about her changing routine" },
  { day: 220, category: "kfood",    keyword: "Korean lotus root stir-fry skin", script_hint: "Yeon-geun bokkeum — Korean lotus root stir-fry with polyphenols for skin radiance" },
  { day: 221, category: "travel",   keyword: "Seoul skin clinic neighborhood comparison", script_hint: "Gangnam vs Apgujeong vs Sinchon clinics — price range, specialty, and clientele compared" },
  { day: 222, category: "skincare", keyword: "Korean spring water mist mineral", script_hint: "Jeju and Dokdo mineral spring mists — Korean volcanic water in skincare and why it's unique" },
  { day: 223, category: "compare",  keyword: "Thai vs Korean beauty standard 2024", script_hint: "Thai and Korean beauty ideals — how they overlap and where they differ in 2024" },
  { day: 224, category: "service",  keyword: "KBBG clinic specialty filter", script_hint: "Filter Korean clinics by specialty on KBBG — acne, anti-aging, brightening, hair, and more" },

  // ── Week 33 ─────────────────────────────────────────────────────────────────
  { day: 225, category: "kbeauty",  keyword: "Korean scalp serum trend",   script_hint: "Scalp serums from Korean brands — the hair-root-first approach to stronger hair" },
  { day: 226, category: "kpop",     keyword: "Baekhyun skin glow under light", script_hint: "Baekhyun's stage skin is exceptional — fans break down his known prep routine" },
  { day: 227, category: "kfood",    keyword: "Korean fermented fish paste skin", script_hint: "Jeotgal (fermented seafood paste) — probiotics in traditional Korean cuisine for gut-skin health" },
  { day: 228, category: "travel",   keyword: "Korea medical trip with parents", script_hint: "Taking parents to Korea for anti-aging treatments — how to plan for older travelers" },
  { day: 229, category: "skincare", keyword: "Korean cleansing brush tool", script_hint: "Korean facial cleansing devices — which brush and device types dermatologists recommend" },
  { day: 230, category: "compare",  keyword: "Japan vs Korea haircare brand", script_hint: "Japanese haircare vs Korean scalp treatment brands — what each country's formula emphasizes" },
  { day: 231, category: "service",  keyword: "KBBG referral friend discount", script_hint: "Refer a friend to KBBG and unlock clinic perks — how the referral program works" },

  // ── Week 34 ─────────────────────────────────────────────────────────────────
  { day: 232, category: "kbeauty",  keyword: "Korean face yoga lymph drainage", script_hint: "Korean facial massage technique — lymph node draining method to reduce puffiness" },
  { day: 233, category: "kpop",     keyword: "ASTRO Cha Eunwoo skin breakdown", script_hint: "Cha Eunwoo is called the 'face of a generation' — what's known about his skincare routine" },
  { day: 234, category: "kfood",    keyword: "Korean citrus yuja tea skin", script_hint: "Yuja-cha (yuzu tea) — Vitamin C-rich Korean winter drink for brightening and immunity" },
  { day: 235, category: "travel",   keyword: "Korea medical trip re-entry guide", script_hint: "Coming back to Korea for a follow-up treatment — what to prepare for the second visit" },
  { day: 236, category: "skincare", keyword: "Korean oil cleanser guide",  script_hint: "How to choose a Korean oil cleanser for your skin type — and how to use it without breaking out" },
  { day: 237, category: "compare",  keyword: "Korean vs Chinese hair dye damage care", script_hint: "Post-dye damage recovery — Korean scalp treatment vs Chinese herbal hair care" },
  { day: 238, category: "service",  keyword: "KBBG how AI matches clinics", script_hint: "KBBG's AI considers your skin type, country, and goal to match the best-fit Korean clinic" },

  // ── Week 35 ─────────────────────────────────────────────────────────────────
  { day: 239, category: "kbeauty",  keyword: "Korean spa jjimjilbang skin", script_hint: "Jjimjilbang (Korean sauna) — how traditional Korean bath culture benefits skin long-term" },
  { day: 240, category: "kpop",     keyword: "PENTAGON Wooseok skin tips", script_hint: "Wooseok's known skin care habits — the K-pop idol who openly shares his skincare routine" },
  { day: 241, category: "kfood",    keyword: "Korean ox bone broth skin collagen", script_hint: "Seolleongtang (ox bone broth) — collagen-rich Korean soup for skin elasticity" },
  { day: 242, category: "travel",   keyword: "Korea night market beauty shopping", script_hint: "Dongdaemun and Namdaemun night markets — Korean skincare shopping tips for late-night arrivals" },
  { day: 243, category: "skincare", keyword: "Korean sunscreen stick on-the-go", script_hint: "Korean sunscreen sticks for touch-up — SPF on the move without disturbing makeup" },
  { day: 244, category: "compare",  keyword: "Korean vs Mongolian skin texture differences", script_hint: "How climate shapes skin — Mongolian harsh-cold vs Korean four-season skin concerns" },
  { day: 245, category: "service",  keyword: "KBBG success story highlight", script_hint: "A real patient from China found her perfect Korean clinic through KBBG — her story" },

  // ── Week 36 ─────────────────────────────────────────────────────────────────
  { day: 246, category: "kbeauty",  keyword: "Korean eye area aging treatment", script_hint: "Eyes show age first — Korean clinic protocol for treating crow's feet and under-eye lines" },
  { day: 247, category: "kpop",     keyword: "BLACKPINK Rose Paris influence skincare", script_hint: "How Rose bridges K-beauty and French beauty — her reportedly mixed skincare philosophy" },
  { day: 248, category: "kfood",    keyword: "Korean black garlic immunity skin", script_hint: "Heukmaul (black garlic) — the Korean superfood with double the antioxidants of raw garlic" },
  { day: 249, category: "travel",   keyword: "Korea travel sim card beauty tips", script_hint: "Stay connected in Korea during your beauty trip — SIM card options for Asian visitors" },
  { day: 250, category: "skincare", keyword: "Korean overnight fermented mask", script_hint: "Fermented ingredients in Korean sleeping masks — lactic acid, yeast, and bifida ferment" },
  { day: 251, category: "compare",  keyword: "Vietnam vs Korean massage spa", script_hint: "Vietnamese spa experience vs Korean skin clinic spa — what each one does for your body" },
  { day: 252, category: "service",  keyword: "KBBG beauty trip starter guide", script_hint: "Never been to Korea for beauty? KBBG's starter guide walks you through every step" },

  // ── Week 37 ─────────────────────────────────────────────────────────────────
  { day: 253, category: "kbeauty",  keyword: "Korean meso injection hydration", script_hint: "Mesotherapy microinjections for deep hydration — popular Korean clinic treatment explained" },
  { day: 254, category: "kpop",     keyword: "IU skin discipline revealed", script_hint: "IU's disciplined skin approach — what the 'Nation's Little Sister' does to maintain her look" },
  { day: 255, category: "kfood",    keyword: "Korean pumpkin seed skin oil", script_hint: "Hobak seed oil — zinc-rich Korean ingredient used for acne and skin barrier repair" },
  { day: 256, category: "travel",   keyword: "Korea beauty trip solo safety", script_hint: "Traveling solo to Korea for beauty treatments — safety tips for women traveling alone" },
  { day: 257, category: "skincare", keyword: "Korean clay mask deep clean",  script_hint: "Korean kaolin and bentonite clay masks — how to use them without over-drying Asian skin" },
  { day: 258, category: "compare",  keyword: "Korean vs Japanese sun protection culture", script_hint: "Both Korea and Japan are SPF-obsessed — but their sunscreen formulas are very different" },
  { day: 259, category: "service",  keyword: "KBBG treatment history tracker", script_hint: "Track all your Korean clinic visits in one place on KBBG — useful for follow-up care" },

  // ── Week 38 ─────────────────────────────────────────────────────────────────
  { day: 260, category: "kbeauty",  keyword: "Korean clinic post-laser care", script_hint: "What to do the first 48 hours after a laser treatment at a Korean clinic — exact steps" },
  { day: 261, category: "kpop",     keyword: "Sunmi aging gracefully approach", script_hint: "Sunmi's candid talks about skincare as she ages in the industry — her honest method" },
  { day: 262, category: "kfood",    keyword: "Korean doenjang collagen jjigae", script_hint: "Doenjang jjigae (soybean paste stew) — the Korean daily meal with isoflavones for skin" },
  { day: 263, category: "travel",   keyword: "Korea beauty trip app must-haves", script_hint: "3 apps every Asian medical tourist needs when visiting Korea for beauty — including KBBG" },
  { day: 264, category: "skincare", keyword: "Korean hand cream gifting culture", script_hint: "Why Koreans gift hand cream — and which Korean hand creams are worth bringing home" },
  { day: 265, category: "compare",  keyword: "Korean vs Chinese beauty influencer trust", script_hint: "Chinese beauty influencers vs Korean dermatology-backed creators — who Asian audiences trust more" },
  { day: 266, category: "service",  keyword: "KBBG clinic Q&A board",      script_hint: "Ask a question about any Korean clinic on KBBG — real patient answers, not sponsored content" },

  // ── Week 39 ─────────────────────────────────────────────────────────────────
  { day: 267, category: "kbeauty",  keyword: "Korean nasal bridge augmentation non-surgical", script_hint: "Nose filler for higher bridge — Korean technique for a natural result without permanence" },
  { day: 268, category: "kpop",     keyword: "GOT7 Mark Tuan skin across markets", script_hint: "Mark Tuan's skin journey across K-pop, China, and US markets — how his routine adapted" },
  { day: 269, category: "kfood",    keyword: "Korean black bean noodle skin", script_hint: "Jajangmyeon culture — and the surprising skin benefits of fermented black bean paste" },
  { day: 270, category: "travel",   keyword: "Korea beauty trip payment options", script_hint: "Paying at Korean clinics — which cards are accepted, WeChat Pay, UnionPay, cash tips" },
  { day: 271, category: "skincare", keyword: "Korean facial oil last step", script_hint: "Face oil as the final skincare step in Korean routine — which oils and how to use them" },
  { day: 272, category: "compare",  keyword: "acupuncture vs Botox for wrinkles Asia", script_hint: "Traditional acupuncture vs Korean Botox for fine lines — different approaches, compared honestly" },
  { day: 273, category: "service",  keyword: "KBBG for repeat Korea visitors", script_hint: "Coming back to Korea for the second or third time? KBBG tracks your history and preferences" },

  // ── Week 40 ─────────────────────────────────────────────────────────────────
  { day: 274, category: "kbeauty",  keyword: "Korean beauty festival shopping", script_hint: "Olive Young and Lohb'z festivals — Korean beauty sale seasons that coincide with travel" },
  { day: 275, category: "kpop",     keyword: "BTS RM art-meets-skincare philosophy", script_hint: "RM's minimal, thoughtful approach to skincare — how he speaks about skin and self-care" },
  { day: 276, category: "kfood",    keyword: "Korean arrowroot tteok skin", script_hint: "Chik-tteok (arrowroot rice cake) — Korean traditional food with starch that may calm inflammation" },
  { day: 277, category: "travel",   keyword: "Korea beauty district Apgujeong guide", script_hint: "Apgujeong Rodeo Street — Seoul's most premium beauty clinic neighborhood explained" },
  { day: 278, category: "skincare", keyword: "Korean copper peptide serum", script_hint: "Copper peptide in Korean anti-aging serums — remodeling skin from deep layers explained" },
  { day: 279, category: "compare",  keyword: "Korean vs Vietnamese anti-aging timeline", script_hint: "When do women in Korea and Vietnam start anti-aging routines? — cultural timing compared" },
  { day: 280, category: "service",  keyword: "KBBG top 10 treatments Asia 2024", script_hint: "KBBG's most-booked Korean treatments by Asian visitors this year — ranked and explained" },

  // ── Week 41 ─────────────────────────────────────────────────────────────────
  { day: 281, category: "kbeauty",  keyword: "Korean hair color skin tone matching", script_hint: "Korean colorists match hair color to skin tone — how to request the right shade at a salon" },
  { day: 282, category: "kpop",     keyword: "aespa Karina transparent skin secret", script_hint: "Karina's ultra-translucent skin is discussed by fans — what her known skincare habits are" },
  { day: 283, category: "kfood",    keyword: "Korean sujeonggwa cinnamon ginger", script_hint: "Sujeonggwa (cinnamon ginger punch) — Korean traditional drink with circulation benefits for skin" },
  { day: 284, category: "travel",   keyword: "Korea beauty trip winter season", script_hint: "Winter is ideal for certain Korean skin treatments — which ones and why cold weather helps" },
  { day: 285, category: "skincare", keyword: "Korean skin barrier rebuild protocol", script_hint: "How Korean dermatologists rebuild a compromised skin barrier — step-by-step protocol" },
  { day: 286, category: "compare",  keyword: "Korean vs Mongolian beauty standard evolution", script_hint: "How Korean beauty influence has shaped Mongolian beauty standards over the past decade" },
  { day: 287, category: "service",  keyword: "KBBG for medical tourism newbies", script_hint: "Complete beginner guide to Korean medical beauty tourism — everything you need to know on KBBG" },

  // ── Week 42 ─────────────────────────────────────────────────────────────────
  { day: 288, category: "kbeauty",  keyword: "Korean tightening SMAS lift", script_hint: "SMAS layer lifting — the Korean clinic technique that lifts deeper than standard HIFU" },
  { day: 289, category: "kpop",     keyword: "Suga skin while producing music", script_hint: "Suga's skin approach during intensive production periods — how stress affects skin and his methods" },
  { day: 290, category: "kfood",    keyword: "Korean pine mushroom immune skin", script_hint: "Songyi (pine mushroom) — Korea's prized autumn mushroom with beta-glucan for skin immunity" },
  { day: 291, category: "travel",   keyword: "Korea travel Korean phrases clinic", script_hint: "10 Korean phrases every beauty tourist needs at the clinic — pronunciation guide included" },
  { day: 292, category: "skincare", keyword: "Korean essence water distinction", script_hint: "First essence vs skin water — Korean first-step products and what makes them different" },
  { day: 293, category: "compare",  keyword: "Korean vs Japanese approach to minimalism beauty", script_hint: "Both Korea and Japan trend toward minimal beauty — but their 'less is more' means different things" },
  { day: 294, category: "service",  keyword: "KBBG clinic staff language skills", script_hint: "KBBG rates clinic staff by language proficiency — find Korean clinics with Chinese-speaking staff" },

  // ── Week 43 ─────────────────────────────────────────────────────────────────
  { day: 295, category: "kbeauty",  keyword: "Korean dark spot eraser treatment", script_hint: "Post-inflammatory hyperpigmentation treatment — Korean protocol for Asian skin types" },
  { day: 296, category: "kpop",     keyword: "Song Joong-ki skin maintenance", script_hint: "Actor Song Joong-ki's skin over years of drama and film work — known habits and products" },
  { day: 297, category: "kfood",    keyword: "Korean acorn jelly skin detox", script_hint: "Dotori-muk (acorn jelly) — low-calorie Korean food with tannins believed to detox skin" },
  { day: 298, category: "travel",   keyword: "Korea beauty trip debrief guide", script_hint: "What to do when you return home after Korean treatments — follow-up routine and aftercare" },
  { day: 299, category: "skincare", keyword: "Korean glow toner ingredient",  script_hint: "What makes Korean glow toners different — niacinamide, ferments, and illuminating agents" },
  { day: 300, category: "compare",  keyword: "300 days of Asian beauty lessons", script_hint: "Reflections on 300 days of comparing Asian beauty cultures — what Korea does differently" },
  { day: 301, category: "service",  keyword: "KBBG 300-day milestone community", script_hint: "300 days of helping Asian patients find Korean clinics — KBBG community celebrates the milestone" },

  // ── Week 44 ─────────────────────────────────────────────────────────────────
  { day: 302, category: "kbeauty",  keyword: "Korean lip and chin harmony filler", script_hint: "Chin filler for facial balance — Korean aesthetic principle of lower-face harmony explained" },
  { day: 303, category: "kpop",     keyword: "Park Seo-joon skincare evolved", script_hint: "Park Seo-joon's skin transformation from early career to now — known habits and changes" },
  { day: 304, category: "kfood",    keyword: "Korean black sesame porridge skin", script_hint: "Heukimja-juk (black sesame porridge) — Korean food with vitamin E and zinc for skin repair" },
  { day: 305, category: "travel",   keyword: "Korea beauty travel insurance claim", script_hint: "Had a complication after a Korean beauty procedure? How travel insurance claims work" },
  { day: 306, category: "skincare", keyword: "Korean active ingredient safety", script_hint: "Korean dermatologists' approach to actives — lower percentages, better tolerance for Asian skin" },
  { day: 307, category: "compare",  keyword: "Korean vs Thai face V-shaping methods", script_hint: "Face slimming in Korea vs Thailand — filler, Botox, and thread techniques compared" },
  { day: 308, category: "service",  keyword: "KBBG community top-rated clinics", script_hint: "KBBG community's highest-rated Korean clinics this quarter — ranked by real patient scores" },

  // ── Week 45 ─────────────────────────────────────────────────────────────────
  { day: 309, category: "kbeauty",  keyword: "Korean body care trend full skin", script_hint: "Full-body skincare is a growing Korean trend — lotion, scrub, and clinic services for the body" },
  { day: 310, category: "kpop",     keyword: "EXO Chen skin during military", script_hint: "Military skin care — how Korean male idols reportedly maintain their skin during service" },
  { day: 311, category: "kfood",    keyword: "Korean fern bracken soup skin", script_hint: "Gosari-guk (bracken soup) — Korean mountain vegetable with iron for skin oxygenation" },
  { day: 312, category: "travel",   keyword: "Korea beauty trip local grocery skin buy", script_hint: "What to buy at Korean pharmacies and grocery stores for your skin — affordable hidden gems" },
  { day: 313, category: "skincare", keyword: "Korean barrier-safe makeup remover", script_hint: "Micellar water vs balm cleanser — Korean approach to removing makeup without stripping skin" },
  { day: 314, category: "compare",  keyword: "Korean vs Vietnamese acupressure face", script_hint: "Korean pressure point facial massage vs Vietnamese acupressure — same points, different pressure" },
  { day: 315, category: "service",  keyword: "KBBG for long-stay Korea visitors", script_hint: "Staying in Korea for 2+ weeks for multiple treatments? KBBG coordinates your full schedule" },

  // ── Week 46 ─────────────────────────────────────────────────────────────────
  { day: 316, category: "kbeauty",  keyword: "Korean collagen drink market",  script_hint: "Korea's collagen drink culture — which peptide-based drinks Korean women actually consume" },
  { day: 317, category: "kpop",     keyword: "f(x) Luna honest skin journey", script_hint: "Luna's public skin struggle and recovery — her candid interview moments on acne and healing" },
  { day: 318, category: "kfood",    keyword: "Korean spinach side dish skin iron", script_hint: "Sigeumchi-namul (spinach banchan) — iron-rich Korean side dish that supports skin oxygenation" },
  { day: 319, category: "travel",   keyword: "Korea beauty trip summer tips", script_hint: "Summer in Korea is hot and humid — how to choose treatments that suit the climate" },
  { day: 320, category: "skincare", keyword: "Korean aqua peel hydration treatment", script_hint: "Aqua peel (hydrafacial-style) treatment at Korean clinics — what the machine does in 30 minutes" },
  { day: 321, category: "compare",  keyword: "Korean vs Chinese toner market size", script_hint: "Korea and China are both toner-obsessed — how the two markets differ in formula and culture" },
  { day: 322, category: "service",  keyword: "KBBG clinic certification check",  script_hint: "How to verify a Korean clinic's license through KBBG — protect yourself from unlicensed operators" },

  // ── Week 47 ─────────────────────────────────────────────────────────────────
  { day: 323, category: "kbeauty",  keyword: "Korean skin tone analysis",   script_hint: "Korean clinics use Fitzpatrick scale to customize laser settings for Asian skin tones" },
  { day: 324, category: "kpop",     keyword: "Jennie's skin philosophy",    script_hint: "Jennie has been vocal about skin — what she's shared about her routine and favorite products" },
  { day: 325, category: "kfood",    keyword: "Korean black rice bran skin", script_hint: "Heukmi (black rice) bran extract — the Korean food and skincare ingredient with anthocyanins" },
  { day: 326, category: "travel",   keyword: "Korea medical trip price negotiation", script_hint: "Can you negotiate clinic prices in Korea? — what's flexible and what's fixed for foreigners" },
  { day: 327, category: "skincare", keyword: "Korean tightening cream neck", script_hint: "Korean neck and décolletage cream — why Korean women start neck care in their 20s" },
  { day: 328, category: "compare",  keyword: "Korean vs Vietnam skin clinic aftercare", script_hint: "Post-treatment aftercare culture — Korean clinic follow-up vs Vietnamese clinic approach" },
  { day: 329, category: "service",  keyword: "KBBG seasonal treatment picks", script_hint: "KBBG curates recommended Korean treatments for each season — autumn edition now available" },

  // ── Week 48 ─────────────────────────────────────────────────────────────────
  { day: 330, category: "kbeauty",  keyword: "Korean skin glow peel enzyme", script_hint: "Enzyme peel at Korean clinics — papaya and pineapple enzyme masks for gentle skin renewal" },
  { day: 331, category: "kpop",     keyword: "BIGBANG Daesung skin evolution", script_hint: "Daesung's well-documented skin journey — how he addressed concerns openly over the years" },
  { day: 332, category: "kfood",    keyword: "Korean omija five-flavor berry skin", script_hint: "Omija (five-flavor berry) — rare Korean medicinal berry for circulation and skin glow" },
  { day: 333, category: "travel",   keyword: "Korea beauty trip emergency clinic", script_hint: "What to do if your skin reacts badly in Korea — emergency dermatology access for tourists" },
  { day: 334, category: "skincare", keyword: "Korean fermented rice extract skin", script_hint: "Rice ferment filtrate — the byproduct of Korean rice wine that transformed modern skincare" },
  { day: 335, category: "compare",  keyword: "Korean vs Mongolian diet and skin", script_hint: "Meat-heavy Mongolian diet vs vegetable-rich Korean diet — how nutrition affects skin health" },
  { day: 336, category: "service",  keyword: "KBBG new clinic additions this month", script_hint: "New Korean clinics added to KBBG this month — what they specialize in and early reviews" },

  // ── Week 49 ─────────────────────────────────────────────────────────────────
  { day: 337, category: "kbeauty",  keyword: "Korean glass skin at-home routine", script_hint: "Recreate glass skin at home using Korean techniques — no clinic required, budget-friendly" },
  { day: 338, category: "kpop",     keyword: "Sunye Wonder Girls comeback skin", script_hint: "Sunye's comeback years later — how her skin looks years after leaving the industry" },
  { day: 339, category: "kfood",    keyword: "Korean radish skin vitamin C", script_hint: "Mu (Korean radish) — the versatile white vegetable with Vitamin C that Korean cooks use daily" },
  { day: 340, category: "travel",   keyword: "Korea beauty trip cash or card?", script_hint: "Should you bring cash or use card at Korean clinics? — payment tips for Asian visitors" },
  { day: 341, category: "skincare", keyword: "Korean sleeping pack rotation",  script_hint: "Rotating sleeping packs by ingredient — Korean approach to avoiding skin adaptation" },
  { day: 342, category: "compare",  keyword: "Korean vs Thai social media beauty influence", script_hint: "Korean and Thai beauty content dominate Asian social media — how each influences audiences" },
  { day: 343, category: "service",  keyword: "KBBG live chat with clinic",  script_hint: "Chat live with a Korean clinic through KBBG — get answers before you book your flight" },

  // ── Week 50 ─────────────────────────────────────────────────────────────────
  { day: 344, category: "kbeauty",  keyword: "Korean tone-up cream CC",     script_hint: "Korean tone-up creams — hybrid between skincare and light coverage that brightens instantly" },
  { day: 345, category: "kpop",     keyword: "Zico skin during independent career", script_hint: "Zico managing his skin while running his own label — what he's shared about the stress" },
  { day: 346, category: "kfood",    keyword: "Korean roasted grain mix skin", script_hint: "Misutgaru (grain powder drink) — the Korean multi-grain nutritional drink for skin energy" },
  { day: 347, category: "travel",   keyword: "Korea beauty trip souvenir guide", script_hint: "Best Korean skincare souvenirs to bring back home — what's unique, what's buyable elsewhere" },
  { day: 348, category: "skincare", keyword: "Korean mild exfoliant for sensitive", script_hint: "PHA and polyglutamic acid in Korean sensitive-skin exfoliants — gentle with real results" },
  { day: 349, category: "compare",  keyword: "Japanese wabi-sabi vs Korean perfect skin ideal", script_hint: "Japan's acceptance of imperfection vs Korea's perfection drive — different beauty mindsets" },
  { day: 350, category: "service",  keyword: "KBBG year-end top treatments",  script_hint: "KBBG's year-end round-up — the top 10 Korean treatments chosen by Asian patients in 2024" },

  // ── Week 51 ─────────────────────────────────────────────────────────────────
  { day: 351, category: "kbeauty",  keyword: "Korean beauty routine for 20s", script_hint: "Starting K-beauty in your 20s — prevention-first approach and what Korean women prioritize early" },
  { day: 352, category: "kpop",     keyword: "STAYC debut skin protocol",   script_hint: "STAYC's rookie debut era skin preparation — the intensive pre-debut skincare reportedly used" },
  { day: 353, category: "kfood",    keyword: "Korean sweet rice cake energy skin", script_hint: "Tteok (rice cake) in Korean culture — slow-digesting carb that avoids insulin spikes that harm skin" },
  { day: 354, category: "travel",   keyword: "Korea beauty trip wrap-up tips", script_hint: "Final day in Korea after a beauty trip — how to pack treatments safely and clear customs" },
  { day: 355, category: "skincare", keyword: "Korean SPF lotion daily body",  script_hint: "Body sunscreen culture in Korea — why SPF lotion on arms and neck is a daily habit" },
  { day: 356, category: "compare",  keyword: "Korean vs Chinese beauty routine average steps", script_hint: "Korean 10-step vs Chinese 5-step — survey data on how many steps Asian women actually use" },
  { day: 357, category: "service",  keyword: "KBBG year in review 2024",    script_hint: "One year of KBBG — statistics on most-searched treatments, top clinics, and Asian patient trends" },

  // ── Week 52 ─────────────────────────────────────────────────────────────────
  { day: 358, category: "kbeauty",  keyword: "Korean beauty 2025 trend preview", script_hint: "What's coming in Korean beauty clinics in 2025 — new lasers, biotech ingredients, and trends" },
  { day: 359, category: "kpop",     keyword: "Year-end award show skin prep",  script_hint: "How K-pop idols prepare their skin for year-end award shows — the intensive 2-week protocol" },
  { day: 360, category: "kfood",    keyword: "Korean New Year skin cleanse tradition", script_hint: "Seollal (Korean New Year) and the tradition of skin reset — foods and rituals for a fresh start" },
  { day: 361, category: "travel",   keyword: "Plan your 2025 Korea beauty trip", script_hint: "Start planning your 2025 Korea medical beauty trip now — KBBG's step-by-step planning guide" },
  { day: 362, category: "skincare", keyword: "Korean New Year skincare reset",  script_hint: "How Koreans reset their skincare routine at the new year — simplify, assess, and rebuild" },
  { day: 363, category: "compare",  keyword: "One year of Asian beauty compared", script_hint: "365 days of comparing Korean, Japanese, Chinese, Vietnamese, and Thai beauty — final reflections" },
  { day: 364, category: "service",  keyword: "KBBG 2025 features coming soon",  script_hint: "What KBBG is building for 2025 — new features for Asian medical tourists announced" },
  { day: 365, category: "service",  keyword: "KBBG 365-day thank you Asia",    script_hint: "365 days of Korean beauty content for Asia — KBBG thanks every viewer and patient who trusted us" },
];

// 카테고리별 분배 현황
// kbeauty : 52개
// kpop    : 52개
// kfood   : 52개
// travel  : 52개
// skincare: 52개
// compare : 51개
// service : 54개  (매 7번째 + 마지막 날 포함)
// 합계    : 365개
