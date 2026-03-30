// 커뮤니티 더미 게시글 데이터 — id 1~10 상세 본문 + 댓글
// 실제 Supabase posts 테이블 데이터가 없을 때 폴백으로 사용

export type FlairType = "review" | "question" | "info" | "before_after" | "cost" | "recommend";
export type PostType = "text" | "image" | "link";

export type DummyComment = {
  id: number;
  author: string;
  level: number;
  body: string;
  createdAt: string;
  parentId?: number; // 대댓글용 부모 댓글 id
};

export type DummyPost = {
  id: number;
  title: string;
  titleEn: string;
  categoryKey: string;
  author: string;
  level: number;
  preview: string;    // 목록 미리보기 2줄용
  previewEn: string;
  content: string;    // 상세 페이지 본문
  contentEn: string;
  upvotes: number;
  downvotes: number;
  time: string;
  comments: DummyComment[];
  flair?: FlairType;
  postType?: PostType;
  isPinned?: boolean;
  imageUrl?: string;  // image 타입 게시글의 이미지 URL
  linkUrl?: string;   // link 타입 게시글의 외부 링크 URL
};

export const DUMMY_POSTS: DummyPost[] = [
  {
    id: 1,
    title: "강남 쌍꺼풀 후기 — 3개월 경과",
    titleEn: "Gangnam Double Eyelid Surgery Review — 3 Months Later",
    categoryKey: "community.plastic_surgery",
    author: "user_kr",
    level: 12,
    preview: "강남뷰티클리닉에서 쌍꺼풀 수술을 받은 지 3개월이 지났습니다. 붓기가 빠지고 자연스러워졌어요.",
    previewEn: "It's been 3 months since my double eyelid surgery at Gangnam Beauty Clinic. Swelling has gone down and it looks natural now.",
    content: `강남뷰티클리닉에서 쌍꺼풀 수술을 받은 지 3개월이 지났습니다.

수술 후 약 2주간 붓기가 있었고, 한 달 반 정도 지나니 자연스러워졌습니다.
의사 선생님이 영어로 소통을 잘 해주셔서 외국인이지만 불편함이 없었습니다.

가격은 150만원이었고, 사후 관리 2회가 포함되어 있었습니다.
전반적으로 매우 만족하고, 다음에는 코성형도 고려 중입니다.

병원 위치는 강남역 3번 출구에서 도보 5분이라 찾기 쉬웠어요.
예약은 카카오톡으로 했고, 당일 통역 서비스도 제공해 주었습니다.`,
    contentEn: `It has been 3 months since I had double eyelid surgery at Gangnam Beauty Clinic.

Swelling lasted about 2 weeks after surgery, and it looked natural after about a month and a half.
The doctor communicated well in English, so there was no inconvenience even as a foreigner.

The price was 1,500,000 KRW, which included 2 aftercare sessions.
Overall very satisfied and considering rhinoplasty next time.

The clinic is a 5-minute walk from Gangnam Station Exit 3, easy to find.
I booked via KakaoTalk and they also provided same-day interpretation service.`,
    upvotes: 87,
    downvotes: 3,
    time: "2h ago",
    flair: "review",
    postType: "text",
    isPinned: true,
    comments: [
      { id: 101, author: "sarah_jp", level: 7, body: "정확히 어느 병원인가요?", createdAt: "1시간 전" },
      { id: 102, author: "mike_us", level: 3, body: "붓기 사진도 공유해주실 수 있나요!", createdAt: "30분 전" },
      { id: 103, author: "user_kr", level: 12, body: "병원명은 DM으로 보내드릴게요! 공개는 좀 어렵네요 😅", createdAt: "10분 전", parentId: 101 },
    ],
  },
  {
    id: 2,
    title: "베트남에서 온 코성형 전후 비교",
    titleEn: "Rhinoplasty Before & After from Vietnam",
    categoryKey: "community.plastic_surgery",
    author: "tom_vn",
    level: 15,
    preview: "베트남에서 한국 코성형을 위해 의료관광을 다녀왔습니다. 결과에 정말 만족합니다!",
    previewEn: "Came to Korea from Vietnam for rhinoplasty medical tourism. Really satisfied with the results!",
    content: `베트남 하노이에서 한국 코성형을 위해 의료관광을 다녀왔습니다.

수술 전 온라인으로 3개 병원을 비교하고 최종적으로 압구정 클리닉을 선택했습니다.
비용은 숙박 포함 약 350만원이었는데 베트남 물가 대비 합리적이었습니다.

수술 당일 통역사가 함께해 주셔서 의사 선생님과 소통이 원활했습니다.
수술 후 3일간 서울에 머물며 경과를 체크한 후 귀국했습니다.

6개월이 지난 지금 코 모양이 정말 자연스럽고 만족스럽습니다.
다음에는 눈 수술도 고려하고 있어요. 한국 의료 수준 정말 최고입니다!`,
    contentEn: `I came from Hanoi, Vietnam for rhinoplasty medical tourism in Korea.

Before the surgery, I compared 3 clinics online and finally chose a clinic in Apgujeong.
The cost was about 3,500,000 KRW including accommodation, which was reasonable compared to Vietnamese prices.

An interpreter was with me on the day of surgery so communication with the doctor was smooth.
I stayed in Seoul for 3 days after the surgery to check on recovery before going home.

6 months later, the nose shape is very natural and I'm very satisfied.
I'm considering eye surgery next time. Korean medical standards are truly the best!`,
    upvotes: 54,
    downvotes: 2,
    time: "1d ago",
    flair: "before_after",
    postType: "image",
    imageUrl: "https://images.unsplash.com/photo-1614359975067-0f0b3c6d2d3a?w=800&h=600&fit=crop",
    comments: [
      { id: 201, author: "mai_vn", level: 5, body: "어느 병원인지 알 수 있나요? 저도 베트남에서 가려고 해요!", createdAt: "20시간 전" },
      { id: 202, author: "tom_vn", level: 15, body: "DM 주시면 알려드릴게요 😊 통역 서비스 포함 패키지 있어요", createdAt: "18시간 전", parentId: 201 },
      { id: 203, author: "anna_ru", level: 28, body: "러시아에서도 한국 코성형 많이 하러 오는데, 좋은 후기네요!", createdAt: "15시간 전" },
    ],
  },
  {
    id: 3,
    title: "강남 턱수술 3개월 — 붓기 빠지는 과정",
    titleEn: "Gangnam Jaw Surgery 3 Months — Swelling Recovery Process",
    categoryKey: "community.plastic_surgery",
    author: "emma_us",
    level: 8,
    preview: "턱수술 후 붓기가 빠지는 과정을 공유합니다. 3개월 경과 사진 포함.",
    previewEn: "Sharing the swelling recovery process after jaw surgery. Includes 3-month progress photos.",
    content: `미국에서 한국 강남으로 턱수술(하악 후퇴술)을 받으러 왔습니다.

수술 전 온라인 상담을 한국어 통역과 함께 3회 진행했고,
수술 당일 포함 총 7일간 서울에 머물렀습니다.

붓기 타임라인:
- 수술 후 1주: 심한 붓기, 유동식만 가능
- 2주: 붓기 40% 감소, 죽 종류 섭취 가능
- 1개월: 붓기 70% 감소, 일상생활 복귀
- 3개월: 붓기 90% 이상 감소, 자연스러운 윤곽

비용은 약 600만원이었습니다. 미국 대비 절반 이하 가격이에요.
전체적으로 매우 만족스럽고, 한국 의료관광 강력 추천합니다!`,
    contentEn: `I came from the US to Gangnam, Korea for jaw surgery (mandibular setback).

Before the surgery, I had 3 online consultations with a Korean interpreter,
and I stayed in Seoul for a total of 7 days including the day of surgery.

Swelling timeline:
- Week 1: Severe swelling, only liquid diet possible
- Week 2: 40% swelling reduction, soft foods possible
- 1 month: 70% swelling reduction, back to daily life
- 3 months: Over 90% swelling reduction, natural contour

The cost was about 6,000,000 KRW. Less than half the price compared to the US.
Overall very satisfied, strongly recommend Korean medical tourism!`,
    upvotes: 41,
    downvotes: 1,
    time: "3d ago",
    flair: "before_after",
    postType: "text",
    comments: [
      { id: 301, author: "sophie_fr", level: 6, body: "사진 없나요? 경과가 너무 궁금해요!", createdAt: "2일 전" },
      { id: 302, author: "emma_us", level: 8, body: "개인 보호를 위해 사진은 올리기 어렵지만 DM으로 공유할게요", createdAt: "2일 전", parentId: 301 },
    ],
  },
  {
    id: 4,
    title: "레이저 토닝 5회차 경과 사진",
    titleEn: "Laser Toning 5th Session Progress Photos",
    categoryKey: "community.dermatology",
    author: "sarah_jp",
    level: 7,
    preview: "서울 피부과에서 레이저 토닝 5회차를 받았습니다. 기미와 잡티가 눈에 띄게 줄었어요.",
    previewEn: "Had my 5th laser toning session at a Seoul dermatology clinic. Dark spots and blemishes have noticeably reduced.",
    content: `일본 도쿄에서 서울로 피부 레이저 토닝을 받으러 왔습니다.

총 10회 패키지로 계약했고, 지금까지 5회 완료했습니다.
매회 방문 시 2~3일 서울에 머물며 시술 후 경과를 확인합니다.

경과:
- 1회: 시술 직후 약간 붉어짐, 당일 회복
- 3회: 기미가 조금씩 옅어지기 시작
- 5회: 기미 약 50% 개선, 피부 전체 톤이 밝아짐

가격은 10회 기준 120만원으로, 일본 대비 훨씬 저렴합니다.
의사 선생님이 영어와 일본어 조금씩 하셔서 소통이 잘 됐어요.

10회 완료 후 최종 후기도 올릴게요!`,
    contentEn: `I came from Tokyo, Japan to Seoul for laser toning treatments.

I signed up for a 10-session package and have completed 5 so far.
Each visit I stay in Seoul for 2-3 days to monitor recovery after treatment.

Progress:
- Session 1: Slight redness immediately after, recovered same day
- Session 3: Dark spots starting to fade slightly
- Session 5: About 50% improvement in dark spots, overall skin tone brightened

The price is 1,200,000 KRW for 10 sessions, much cheaper than Japan.
The doctor speaks a little English and Japanese, so communication was easy.

I'll post a final review after completing all 10 sessions!`,
    upvotes: 42,
    downvotes: 1,
    time: "4h ago",
    flair: "review",
    postType: "image",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop",
    comments: [
      { id: 401, author: "lisa_cn", level: 3, body: "어느 피부과인지 알려주실 수 있나요?", createdAt: "3시간 전" },
      { id: 402, author: "david_uk", level: 10, body: "레이저 토닝 통증은 어느 정도인가요?", createdAt: "2시간 전" },
      { id: 403, author: "sarah_jp", level: 7, body: "통증은 거의 없어요! 따끔한 느낌 정도예요 😊", createdAt: "1시간 전", parentId: 402 },
    ],
  },
  {
    id: 5,
    title: "보톡스 처음 맞았어요 후기",
    titleEn: "My First Botox Experience Review",
    categoryKey: "community.dermatology",
    author: "lisa_cn",
    level: 3,
    preview: "중국에서 온 후기입니다. 이마 보톡스를 처음 맞아봤는데 생각보다 간단하고 효과가 좋아요.",
    previewEn: "Review from China. Got forehead Botox for the first time — it was simpler than expected and very effective.",
    content: `중국 상하이에서 한국 의료관광으로 처음 보톡스를 맞아봤습니다.

서울 강남에 있는 피부과에서 이마 + 미간 보톡스를 맞았습니다.
총 비용은 30만원이었고, 시술 시간은 10분도 안 걸렸어요.

시술 과정:
1. 의사 상담 (통역 앱 사용)
2. 세안 및 마취 크림 도포 (20분)
3. 보톡스 주사 (5분)
4. 얼음 찜질 (5분)

시술 후 즉시 일상생활 가능했고, 효과는 3~4일 후부터 나타났습니다.
주름이 눈에 띄게 줄었고, 중국에서 맞는 것보다 훨씬 자연스러워요.

3~6개월마다 유지관리가 필요하다고 해서 다음 번 한국 방문 시 또 맞으려고 합니다!`,
    contentEn: `I tried Botox for the first time in Korea as medical tourism from Shanghai, China.

I got forehead + frown line Botox at a dermatology clinic in Gangnam, Seoul.
The total cost was 300,000 KRW and the procedure took less than 10 minutes.

Procedure process:
1. Doctor consultation (using translation app)
2. Face wash and numbing cream application (20 min)
3. Botox injections (5 min)
4. Ice compress (5 min)

I was able to go about my day immediately after the procedure, and effects appeared after 3-4 days.
Wrinkles noticeably reduced, and it looks much more natural than getting it done in China.

They say maintenance is needed every 3-6 months, so I plan to get it again on my next visit to Korea!`,
    upvotes: 29,
    downvotes: 0,
    time: "8h ago",
    flair: "question",
    postType: "text",
    comments: [
      { id: 501, author: "wang_cn", level: 8, body: "같은 중국인으로서 도움이 많이 됐어요! 저도 가보고 싶네요", createdAt: "7시간 전" },
      { id: 502, author: "yuki_jp", level: 5, body: "보톡스 후 멍은 없었나요?", createdAt: "6시간 전" },
    ],
  },
  {
    id: 6,
    title: "서울에서 여드름 흉터 치료 후기 — 대만족!",
    titleEn: "Acne Scar Treatment Review in Seoul — Very Satisfied!",
    categoryKey: "community.dermatology",
    author: "david_uk",
    level: 10,
    preview: "영국에서 온 David입니다. 서울에서 여드름 흉터 프락셀 레이저 치료를 받았어요. 정말 효과적이에요!",
    previewEn: "David from the UK here. Got Fraxel laser treatment for acne scars in Seoul. It's really effective!",
    content: `영국 런던에서 온 David입니다. 10년 이상 고민해온 여드름 흉터를 한국에서 치료했습니다.

선택한 치료: 프락셀 레이저 (Fractional CO2) 3회 + 카복시테라피 2회

치료 결과 (3개월 후):
- 박스형 흉터: 약 60% 개선
- 롤링 흉터: 약 70% 개선
- 피부 전반적인 질감과 톤 향상

총 비용: 약 80만원 (영국 대비 1/3 수준)

한국 피부과 의사들의 실력이 정말 대단합니다.
저는 홍대 근처 피부과에서 받았는데, 영어 소통이 완벽하게 됐습니다.
외국인 환자가 많아서 그런지 매우 편안한 환경이었어요.

영국에서 같은 치료를 받으면 최소 250만원은 넘었을 텐데, 한국에서 1/3 가격에 더 좋은 결과를 얻었습니다.`,
    contentEn: `David here from London, UK. I treated the acne scars I'd been troubled by for over 10 years in Korea.

Treatment chosen: Fraxel Laser (Fractional CO2) x3 sessions + Carboxy Therapy x2 sessions

Treatment results (after 3 months):
- Boxcar scars: About 60% improvement
- Rolling scars: About 70% improvement
- Overall improvement in skin texture and tone

Total cost: About 800,000 KRW (1/3 of UK prices)

Korean dermatologists are truly amazing.
I went to a clinic near Hongdae, and English communication was perfect.
Probably because they have many foreign patients, the environment was very comfortable.

The same treatment in the UK would cost at least 2,500,000 KRW, but I got better results in Korea for 1/3 the price.`,
    upvotes: 63,
    downvotes: 2,
    time: "2d ago",
    flair: "cost",
    postType: "text",
    comments: [
      { id: 601, author: "peter_nl", level: 7, body: "홍대 어느 피부과인지 알 수 있나요?", createdAt: "1일 전" },
      { id: 602, author: "david_uk", level: 10, body: "DM으로 알려드릴게요! 영어 잘 되는 곳이에요 👍", createdAt: "1일 전", parentId: 601 },
      { id: 603, author: "kevin_sg", level: 7, body: "싱가포르에서도 비싼데, 한국 가보고 싶어지네요", createdAt: "20시간 전" },
    ],
  },
  {
    id: 7,
    title: "서울에서 건강검진 받은 후기",
    titleEn: "Health Checkup Review in Seoul",
    categoryKey: "community.internal_medicine",
    author: "chen_cn",
    level: 5,
    preview: "중국에서 서울로 건강검진을 받으러 왔습니다. 한국 검진 시스템이 정말 체계적이고 빠릅니다.",
    previewEn: "Came from China to Seoul for a health checkup. The Korean health checkup system is really systematic and fast.",
    content: `중국 베이징에서 서울로 건강검진을 받으러 왔습니다.

선택한 검진: 기본 종합건강검진 + 위내시경 + 복부초음파

검진 과정:
- 예약: 온라인으로 2주 전 예약 (중국어 안내 가능)
- 검진 당일: 오전 8시 입실, 오후 1시 완료 (총 5시간)
- 결과 수령: 당일 기본 결과, 상세 보고서는 2~3일 후 이메일

특이사항:
- 위내시경 수면으로 진행 (편안했어요)
- 모든 검진 항목 영어/중국어 안내 제공
- 의사 설명 시 중국어 통역 서비스 무료 제공

비용: 45만원 (중국 내 비슷한 수준 검진 대비 저렴)
결과: 전반적으로 건강. 비타민 D 부족 처방 받음

한국 의료 시스템 정말 효율적이에요. 매년 오고 싶습니다!`,
    contentEn: `I came from Beijing, China to Seoul for a health checkup.

Chosen package: Basic comprehensive health checkup + gastroscopy + abdominal ultrasound

Checkup process:
- Booking: Online reservation 2 weeks in advance (Chinese guidance available)
- Checkup day: Check-in at 8am, completed by 1pm (5 hours total)
- Results: Basic results same day, detailed report via email in 2-3 days

Special notes:
- Gastroscopy done under sedation (comfortable)
- All checkup items provided with English/Chinese guidance
- Free Chinese interpretation service during doctor consultation

Cost: 450,000 KRW (cheaper than similar checkups within China)
Results: Generally healthy. Prescribed Vitamin D supplement

The Korean healthcare system is really efficient. I want to come every year!`,
    upvotes: 31,
    downvotes: 0,
    time: "6h ago",
    flair: "info",
    postType: "text",
    isPinned: true,
    comments: [
      { id: 701, author: "james_au", level: 9, body: "어느 병원에서 받으셨나요? 저도 건강검진 고민 중이에요", createdAt: "5시간 전" },
      { id: 702, author: "chen_cn", level: 5, body: "강남 세브란스 건강검진센터요! 영어도 잘 됩니다", createdAt: "4시간 전", parentId: 701 },
    ],
  },
  {
    id: 8,
    title: "삼성병원 종합검진 패키지 후기",
    titleEn: "Samsung Hospital Comprehensive Checkup Package Review",
    categoryKey: "community.internal_medicine",
    author: "james_au",
    level: 9,
    preview: "호주에서 서울 삼성서울병원 VIP 종합건강검진을 받았습니다. 서비스와 시설이 세계 최고 수준입니다.",
    previewEn: "Had a VIP comprehensive health checkup at Samsung Seoul Hospital from Australia. The service and facilities are world-class.",
    content: `호주 시드니에서 삼성서울병원 VIP 종합건강검진을 받으러 왔습니다.

선택 패키지: VIP 종합건강검진 (암 스크리닝 포함)

포함 항목:
- 혈액검사 (30여 항목)
- 흉부 CT + 복부 CT
- 대장/위내시경 (수면)
- MRI 뇌 + 심장 초음파
- 골밀도 + 갑상선 초음파
- 피부과 + 안과 + 치과 스크리닝

총 소요 시간: 약 8시간
비용: 약 280만원

영어 전담 코디네이터가 처음부터 끝까지 함께해 주었습니다.
모든 검진 항목을 하루에 완료할 수 있다는 게 정말 큰 장점입니다.

결과: 대장 용종 1개 발견 → 즉시 제거 처치 (추가 비용 없음)
이게 없었다면 나중에 큰 문제가 될 수 있었다고 하는데, 정말 다행입니다.

호주에서 이런 수준의 검진을 받으려면 6개월 이상 기다려야 하고 비용도 2~3배 더 비쌉니다.
매우 강력히 추천드립니다!`,
    contentEn: `I came from Sydney, Australia for a VIP comprehensive health checkup at Samsung Seoul Hospital.

Chosen package: VIP Comprehensive Health Checkup (including cancer screening)

Included items:
- Blood tests (30+ items)
- Chest CT + Abdominal CT
- Colonoscopy/gastroscopy (under sedation)
- Brain MRI + Heart echocardiogram
- Bone density + Thyroid ultrasound
- Dermatology + Ophthalmology + Dental screening

Total time: About 8 hours
Cost: About 2,800,000 KRW

An English-dedicated coordinator was with me from start to finish.
Being able to complete all checkup items in one day is a huge advantage.

Results: 1 colon polyp found → immediately removed (no additional cost)
They said without this it could have become a major problem later — really thankful.

In Australia, getting this level of checkup requires a 6+ month wait and costs 2-3 times more.
Highly recommend!`,
    upvotes: 25,
    downvotes: 0,
    time: "1d ago",
    flair: "recommend",
    postType: "text",
    comments: [
      { id: 801, author: "oliver_uk", level: 15, body: "VIP 패키지 예약은 얼마나 일찍 해야 하나요?", createdAt: "22시간 전" },
      { id: 802, author: "james_au", level: 9, body: "최소 한 달 전에는 예약하시는 게 좋아요. 국제환자센터에 이메일로 문의하세요!", createdAt: "20시간 전", parentId: 801 },
      { id: 803, author: "mark_nz", level: 8, body: "뉴질랜드에서도 검진 때문에 한국 갈 계획이에요. 좋은 정보 감사합니다!", createdAt: "18시간 전" },
    ],
  },
  {
    id: 9,
    title: "임플란트 2개 시술 후기 — 비용 공유",
    titleEn: "Dental Implant x2 Review — Sharing Costs",
    categoryKey: "community.dental",
    author: "mike_us",
    level: 20,
    preview: "미국에서 임플란트 비용이 너무 비싸 한국 의료관광을 선택했습니다. 총 비용과 과정을 상세히 공유합니다.",
    previewEn: "Chose Korean medical tourism because implant costs in the US were too high. Sharing detailed costs and process.",
    content: `미국 뉴욕에서 임플란트가 필요해서 한국 의료관광을 선택했습니다.

미국 임플란트 비용: 1개당 약 $3,000~5,000 (한화 약 400~670만원)
한국에서의 비용: 1개당 약 100~150만원

2개 임플란트 전체 과정 (총 3회 방문):

1차 방문 (3박 4일):
- 정밀 CT 촬영 및 진단
- 임플란트 식립 수술
- 처방약 및 주의사항 안내

2차 방문 (2박 3일, 4개월 후):
- 임플란트 안착 확인
- 지대주 (어버트먼트) 연결

3차 방문 (1박 2일, 6주 후):
- 최종 크라운 (보철) 장착

총 비용:
- 임플란트 2개: 240만원
- 숙박 3회: 약 60만원
- 항공: 약 80만원
- 합계: 약 380만원 (미국 대비 70% 절약!)

강남에 있는 유명 치과에서 받았고, 영어 전담 코디네이터 서비스 있었습니다.
정말 만족스럽고 강력히 추천드립니다!`,
    contentEn: `I needed dental implants in New York and chose Korean medical tourism.

US implant cost: About $3,000~5,000 per implant
Korean cost: About 1,000,000~1,500,000 KRW per implant

Full process for 2 implants (3 total visits):

1st visit (3 nights/4 days):
- Detailed CT scan and diagnosis
- Implant placement surgery
- Prescription and aftercare instructions

2nd visit (2 nights/3 days, 4 months later):
- Check implant integration
- Abutment connection

3rd visit (1 night/2 days, 6 weeks later):
- Final crown (prosthetic) placement

Total costs:
- 2 implants: 2,400,000 KRW
- Accommodation x3 visits: About 600,000 KRW
- Flights: About 800,000 KRW
- Total: About 3,800,000 KRW (70% savings vs. US!)

Received treatment at a well-known clinic in Gangnam with English-dedicated coordinator service.
Really satisfied and highly recommend!`,
    upvotes: 63,
    downvotes: 1,
    time: "6h ago",
    flair: "cost",
    postType: "text",
    comments: [
      { id: 901, author: "rachel_us", level: 12, body: "미국에서 오는 사람으로서 너무 공감돼요! 저도 치과 때문에 한국 가려고요", createdAt: "5시간 전" },
      { id: 902, author: "alex_ca", level: 9, body: "캐나다도 비슷한 상황이에요. 항공비 포함해도 훨씬 저렴하네요", createdAt: "4시간 전" },
      { id: 903, author: "mike_us", level: 20, body: "맞아요! 항공비 포함해도 미국 치과 1개 값보다 싸요 😄", createdAt: "3시간 전", parentId: 902 },
    ],
  },
  {
    id: 10,
    title: "치아교정 1년차 경과",
    titleEn: "1 Year Progress on Dental Braces",
    categoryKey: "community.dental",
    author: "anna_ru",
    level: 28,
    preview: "러시아에서 한국 치아교정을 시작한 지 1년이 지났습니다. 클리어 얼라이너로 진행 중이며 결과에 매우 만족합니다.",
    previewEn: "It's been 1 year since I started dental braces in Korea from Russia. Using clear aligners and very satisfied with the results.",
    content: `러시아 모스크바에서 한국 치아교정을 받고 있는 Anna입니다.

교정 방법: 인비절라인 (클리어 얼라이너)
예상 기간: 18개월 (현재 12개월 경과)

선택 이유:
- 러시아 대비 약 40% 저렴한 가격
- 한국 치과 의사들의 높은 기술력
- 원격 진료 앱으로 중간 점검 가능

1년 경과 상황:
- 앞니 간격 거의 해소
- 삐뚤어진 치아 약 80% 교정
- 미소가 훨씬 자연스러워짐

방문 주기:
- 첫 방문: 정밀 검사 + 교정 시작
- 3개월마다 한국 방문 (조정 및 새 얼라이너 수령)
- 원격 앱으로 월 1회 사진 전송 점검

총 비용: 350만원 (러시아보다 150만원 저렴)
한국 방문 시 숙박비 포함해도 훨씬 저렴합니다.

6개월 후 최종 완료 후기도 올릴게요! 교정 중인 분들 화이팅 😊`,
    contentEn: `I'm Anna, getting dental braces in Korea from Moscow, Russia.

Orthodontic method: Invisalign (clear aligners)
Expected duration: 18 months (currently 12 months in)

Reasons for choosing Korea:
- About 40% cheaper than Russia
- High skill level of Korean dentists
- Remote consultation app for midway check-ins

Progress at 1 year:
- Front tooth gap almost resolved
- About 80% correction of crooked teeth
- Smile looks much more natural

Visit schedule:
- First visit: Detailed examination + start of braces
- Visit Korea every 3 months (adjustment + new aligners)
- Monthly photo check via remote app

Total cost: 3,500,000 KRW (1,500,000 KRW cheaper than Russia)
Even including accommodation for Korean visits, still much cheaper.

I'll post a final review in 6 months when it's complete! Hang in there fellow braces people 😊`,
    upvotes: 71,
    downvotes: 2,
    time: "2d ago",
    flair: "review",
    postType: "text",
    comments: [
      { id: 1001, author: "nina_de", level: 13, body: "독일에서도 교정이 비싼데 한국 고려해볼게요! 원격 진료 앱은 어떤 걸 쓰나요?", createdAt: "1일 전" },
      { id: 1002, author: "anna_ru", level: 28, body: "병원에서 자체 앱을 제공해줘요! 알라이너 진행 상황을 사진으로 보내면 의사가 확인해줍니다 😊", createdAt: "1일 전", parentId: 1001 },
      { id: 1003, author: "clara_it", level: 10, body: "이탈리아에서도 교정 생각 중인데 너무 도움이 되는 후기네요!", createdAt: "20시간 전" },
    ],
  },
];

// id로 더미 게시글 찾기
export function getDummyPost(id: string | number): DummyPost | undefined {
  return DUMMY_POSTS.find((p) => p.id === Number(id));
}

// 카테고리 키로 미리보기용 게시글 목록 반환
export function getDummyPostsByCategory(categoryKey: string): DummyPost[] {
  return DUMMY_POSTS.filter((p) => p.categoryKey === categoryKey);
}
