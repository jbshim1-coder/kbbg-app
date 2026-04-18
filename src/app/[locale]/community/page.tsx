"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import LevelBadge from "@/components/LevelBadge";
import { createClient } from "@/lib/supabase";
import { isMaster } from "@/lib/level-system";
import { DUMMY_POSTS, type FlairType } from "./data/posts";
import { detectLanguage } from "@/lib/detect-language";

// 카테고리 키 목록
const CATEGORY_KEYS = [
  "community.plastic_surgery", "community.dermatology", "community.internal_medicine",
  "community.dental", "community.ophthalmology", "community.gynecology",
  "community.orthopedics", "community.oriental", "community.urology", "community.ent",
  "community.kpop", "community.kfood", "community.kdrama", "community.kfashion",
  "community.travel", "community.korean_learn",
];

// URL cat 파라미터 → 카테고리 키 매핑
const CAT_TO_KEY: Record<string, string> = {
  plastic_surgery: "community.plastic_surgery", dermatology: "community.dermatology",
  internal_medicine: "community.internal_medicine", dental: "community.dental",
  ophthalmology: "community.ophthalmology", gynecology: "community.gynecology",
  orthopedics: "community.orthopedics", oriental: "community.oriental",
  urology: "community.urology", ent: "community.ent",
  kpop: "community.kpop", kfood: "community.kfood", kdrama: "community.kdrama",
  kfashion: "community.kfashion", travel: "community.travel", korean_learn: "community.korean_learn",
};

// flair 색상 맵
const FLAIR_STYLE: Record<FlairType, { bg: string; text: string; label: string; labelEn: string }> = {
  review:       { bg: "bg-blue-100",   text: "text-blue-700",   label: "후기",        labelEn: "Review" },
  question:     { bg: "bg-yellow-100", text: "text-yellow-700", label: "질문",        labelEn: "Question" },
  info:         { bg: "bg-gray-100",   text: "text-gray-700",   label: "정보",        labelEn: "Info" },
  before_after: { bg: "bg-purple-100", text: "text-purple-700", label: "Before/After", labelEn: "Before/After" },
  cost:         { bg: "bg-green-100",  text: "text-green-700",  label: "비용공유",     labelEn: "Cost" },
  recommend:    { bg: "bg-rose-100",   text: "text-rose-700",   label: "병원추천",     labelEn: "Recommend" },
};

// time 문자열 → "today" | "week" | "month" | "all" 판별
function classifyTime(time: string): "today" | "week" | "month" | "all" {
  if (/^\d+h ago$/.test(time) || time === "just now") return "today";
  const dayMatch = time.match(/^(\d+)d ago$/);
  if (dayMatch) {
    const days = Number(dayMatch[1]);
    if (days <= 1) return "today";
    if (days <= 7) return "week";
    if (days <= 30) return "month";
    return "all";
  }
  return "all";
}

// Hot 점수: upvotes / (시간 가중치)
function hotScore(upvotes: number, time: string): number {
  const timeClass = classifyTime(time);
  const hourWeight: Record<string, number> = { today: 1, week: 24, month: 168, all: 720 };
  const hours = hourWeight[timeClass] ?? 1;
  return upvotes / Math.max(hours, 1);
}

// DB 게시글 시간 표시용
function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// 16개 카테고리 전체 가상 게시글 — 다양한 국적의 가상 회원
const INITIAL_POSTS = [
  // 성형외과
  { id: 1,  title: "강남 쌍꺼풀 후기 — 3개월 경과",         titleEn: "Gangnam Double Eyelid Surgery Review — 3 Months Later",              categoryKey: "community.plastic_surgery",   author: "user_kr",   level: 12, upvotes: 87, comments: 24, time: "2h ago",  flair: "review"       as FlairType, postType: "text"  as const, isPinned: true },
  { id: 2,  title: "베트남에서 온 코성형 전후 비교",           titleEn: "Rhinoplasty Before & After from Vietnam",                           categoryKey: "community.plastic_surgery",   author: "tom_vn",    level: 15, upvotes: 54, comments: 27, time: "1d ago",  flair: "before_after" as FlairType, postType: "image" as const, imageUrl: "https://images.unsplash.com/photo-1614359975067-0f0b3c6d2d3a?w=400&h=300&fit=crop" },
  { id: 3,  title: "강남 턱수술 3개월 — 붓기 빠지는 과정",   titleEn: "Gangnam Jaw Surgery 3 Months — Swelling Recovery Process",           categoryKey: "community.plastic_surgery",   author: "emma_us",   level: 8,  upvotes: 41, comments: 19, time: "3d ago",  flair: "before_after" as FlairType, postType: "text"  as const },
  // 피부과
  { id: 4,  title: "레이저 토닝 5회차 경과 사진",             titleEn: "Laser Toning 5th Session Progress Photos",                          categoryKey: "community.dermatology",       author: "sarah_jp",  level: 7,  upvotes: 42, comments: 15, time: "4h ago",  flair: "review"       as FlairType, postType: "image" as const, imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop" },
  { id: 5,  title: "보톡스 처음 맞았어요 후기",               titleEn: "My First Botox Experience Review",                                  categoryKey: "community.dermatology",       author: "lisa_cn",   level: 3,  upvotes: 29, comments: 18, time: "8h ago",  flair: "question"     as FlairType, postType: "text"  as const },
  { id: 6,  title: "서울에서 여드름 흉터 치료 후기 — 대만족!", titleEn: "Acne Scar Treatment Review in Seoul — Very Satisfied!",             categoryKey: "community.dermatology",       author: "david_uk",  level: 10, upvotes: 63, comments: 22, time: "2d ago",  flair: "cost"         as FlairType, postType: "text"  as const },
  // 내과
  { id: 7,  title: "서울에서 건강검진 받은 후기",             titleEn: "Health Checkup Review in Seoul",                                    categoryKey: "community.internal_medicine", author: "chen_cn",   level: 5,  upvotes: 31, comments: 8,  time: "6h ago",  flair: "info"         as FlairType, postType: "text"  as const, isPinned: true },
  { id: 8,  title: "삼성병원 종합검진 패키지 후기",           titleEn: "Samsung Hospital Comprehensive Checkup Package Review",             categoryKey: "community.internal_medicine", author: "james_au",  level: 9,  upvotes: 25, comments: 11, time: "1d ago",  flair: "recommend"    as FlairType, postType: "text"  as const },
  // 치과
  { id: 9,  title: "임플란트 2개 시술 후기 — 비용 공유",     titleEn: "Dental Implant x2 Review — Sharing Costs",                          categoryKey: "community.dental",            author: "mike_us",   level: 20, upvotes: 63, comments: 31, time: "6h ago",  flair: "cost"         as FlairType, postType: "text"  as const },
  { id: 10, title: "치아교정 1년차 경과",                     titleEn: "1 Year Progress on Dental Braces",                                  categoryKey: "community.dental",            author: "anna_ru",   level: 28, upvotes: 71, comments: 12, time: "2d ago",  flair: "review"       as FlairType, postType: "text"  as const },
  { id: 11, title: "강남 치아미백 전후 비교 사진",             titleEn: "Gangnam Teeth Whitening Before & After Photos",                     categoryKey: "community.dental",            author: "sophie_fr", level: 6,  upvotes: 38, comments: 14, time: "4d ago",  flair: "before_after" as FlairType, postType: "image" as const, imageUrl: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=300&fit=crop" },
  // 안과
  { id: 12, title: "라식 수술 3개월 후기 — 시력 1.5!",       titleEn: "LASIK Surgery 3 Month Review — Vision 1.5!",                        categoryKey: "community.ophthalmology",     author: "park_kr",   level: 11, upvotes: 55, comments: 20, time: "3h ago",  flair: "review"       as FlairType, postType: "text"  as const },
  { id: 13, title: "라섹 vs 스마일 — 어떤 걸 선택할까?",     titleEn: "LASEK vs SMILE — Which One to Choose?",                             categoryKey: "community.ophthalmology",     author: "kevin_sg",  level: 7,  upvotes: 44, comments: 16, time: "1d ago",  flair: "question"     as FlairType, postType: "text"  as const },
  // 산부인과
  { id: 14, title: "서울에서 산전검사 받은 외국인 후기",       titleEn: "Foreigner's Prenatal Checkup Experience in Seoul",                  categoryKey: "community.gynecology",        author: "maria_ph",  level: 4,  upvotes: 22, comments: 9,  time: "5h ago",  flair: "info"         as FlairType, postType: "text"  as const },
  { id: 15, title: "한국에서 난임 치료 받은 경험담",           titleEn: "Fertility Treatment Experience in Korea",                           categoryKey: "community.gynecology",        author: "nina_de",   level: 13, upvotes: 48, comments: 25, time: "2d ago",  flair: "review"       as FlairType, postType: "text"  as const },
  // 정형외과
  { id: 16, title: "무릎 관절경 수술 후기",                   titleEn: "Knee Arthroscopy Surgery Review",                                   categoryKey: "community.orthopedics",       author: "kim_kr",    level: 18, upvotes: 33, comments: 7,  time: "7h ago",  flair: "review"       as FlairType, postType: "text"  as const },
  { id: 17, title: "한국에서 척추 수술 받은 후기",             titleEn: "Spine Surgery Review in Korea",                                     categoryKey: "community.orthopedics",       author: "alex_ca",   level: 9,  upvotes: 29, comments: 13, time: "3d ago",  flair: "review"       as FlairType, postType: "text"  as const },
  // 한의원
  { id: 18, title: "한방 다이어트 침 치료 2주 후기",           titleEn: "2-Week Acupuncture Diet Treatment Review",                          categoryKey: "community.oriental",          author: "yuki_jp",   level: 5,  upvotes: 38, comments: 9,  time: "4h ago",  flair: "review"       as FlairType, postType: "text"  as const },
  { id: 19, title: "허리 통증 침 치료 — 놀라운 효과!",        titleEn: "Back Pain Acupuncture — Amazing Results!",                          categoryKey: "community.oriental",          author: "john_us",   level: 14, upvotes: 42, comments: 11, time: "1d ago",  flair: "info"         as FlairType, postType: "link"  as const, linkUrl: "https://example.com/korean-acupuncture-guide" },
  // 비뇨기과
  { id: 20, title: "비뇨기과 검진 후기 — 남성 건강검진",      titleEn: "Urology Checkup Review — Men's Health Screening",                  categoryKey: "community.urology",           author: "lee_kr",    level: 6,  upvotes: 19, comments: 5,  time: "12h ago", flair: "info"         as FlairType, postType: "text"  as const },
  { id: 21, title: "서울에서 전립선 검진 받는 방법",           titleEn: "How to Get a Prostate Screening in Seoul",                         categoryKey: "community.urology",           author: "mark_nz",   level: 8,  upvotes: 27, comments: 8,  time: "2d ago",  flair: "info"         as FlairType, postType: "link"  as const, linkUrl: "https://example.com/prostate-screening-seoul" },
  // 이비인후과
  { id: 22, title: "코골이 수술 후기 — 삶이 바뀌었어요",      titleEn: "Snoring Surgery Review — Life Changing!",                          categoryKey: "community.ent",               author: "choi_kr",   level: 10, upvotes: 45, comments: 17, time: "5h ago",  flair: "review"       as FlairType, postType: "text"  as const },
  { id: 23, title: "한국에서 축농증 수술 경험담",               titleEn: "Sinusitis Surgery Experience in Korea",                            categoryKey: "community.ent",               author: "peter_nl",  level: 7,  upvotes: 31, comments: 10, time: "3d ago",  flair: "review"       as FlairType, postType: "text"  as const },
  // K-Pop
  { id: 24, title: "BTS 콘서트 서울 후기! 🎤",               titleEn: "BTS Concert in Seoul Review! 🎤",                                  categoryKey: "community.kpop",              author: "mina_th",   level: 16, upvotes: 92, comments: 41, time: "1h ago",  flair: "review"       as FlairType, postType: "image" as const, imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop" },
  { id: 25, title: "서울 K-pop 콘서트 장소 베스트",           titleEn: "Best K-pop Concert Venues in Seoul",                               categoryKey: "community.kpop",              author: "jessica_br", level: 11, upvotes: 67, comments: 28, time: "6h ago", flair: "info"         as FlairType, postType: "text"  as const },
  { id: 26, title: "아이돌 팬미팅 가는 방법 총정리",           titleEn: "Complete Guide to Attending Idol Fan Meetings",                     categoryKey: "community.kpop",              author: "hana_jp",   level: 9,  upvotes: 58, comments: 22, time: "1d ago",  flair: "info"         as FlairType, postType: "text"  as const },
  // K-Food
  { id: 27, title: "을지로 맛집 투어 후기 🍜",               titleEn: "Euljiro Food Tour Review 🍜",                                      categoryKey: "community.kfood",             author: "wang_cn",   level: 8,  upvotes: 73, comments: 35, time: "2h ago",  flair: "review"       as FlairType, postType: "image" as const, imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop" },
  { id: 28, title: "강남 한우 맛집 TOP 5 추천",               titleEn: "Top 5 Hanwoo Beef Restaurants in Gangnam",                          categoryKey: "community.kfood",             author: "rachel_us", level: 12, upvotes: 61, comments: 29, time: "8h ago",  flair: "recommend"    as FlairType, postType: "text"  as const },
  { id: 29, title: "한국 길거리 음식 베스트 10",               titleEn: "Top 10 Korean Street Food Must-Tries",                             categoryKey: "community.kfood",             author: "mai_vn",    level: 5,  upvotes: 49, comments: 18, time: "2d ago",  flair: "info"         as FlairType, postType: "text"  as const },
  // K-드라마
  { id: 30, title: "드라마 촬영지 투어 후기 — 이태원/한남동", titleEn: "K-Drama Filming Location Tour — Itaewon/Hannam",                    categoryKey: "community.kdrama",            author: "suki_jp",   level: 7,  upvotes: 56, comments: 21, time: "3h ago",  flair: "review"       as FlairType, postType: "text"  as const },
  { id: 31, title: "꼭 가봐야 할 드라마 촬영지 모음!",         titleEn: "Must-Visit K-Drama Filming Locations!",                            categoryKey: "community.kdrama",            author: "clara_it",  level: 10, upvotes: 48, comments: 15, time: "1d ago",  flair: "info"         as FlairType, postType: "link"  as const, linkUrl: "https://example.com/kdrama-filming-locations" },
  // K-패션
  { id: 32, title: "홍대 빈티지 쇼핑 가이드 👗",             titleEn: "Hongdae Vintage Shopping Guide 👗",                                categoryKey: "community.kfashion",          author: "nari_kr",   level: 14, upvotes: 44, comments: 19, time: "4h ago",  flair: "info"         as FlairType, postType: "image" as const, imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop" },
  { id: 33, title: "명동 vs 강남 — 쇼핑은 어디서?",          titleEn: "Myeongdong vs Gangnam — Where to Shop?",                            categoryKey: "community.kfashion",          author: "amy_sg",    level: 6,  upvotes: 37, comments: 12, time: "2d ago",  flair: "question"     as FlairType, postType: "text"  as const },
  // 한국 여행
  { id: 34, title: "제주도 3박4일 여행 코스 추천",             titleEn: "Jeju Island 4-Day Travel Itinerary Recommendation",                categoryKey: "community.travel",            author: "jung_kr",   level: 20, upvotes: 82, comments: 38, time: "1h ago",  flair: "recommend"    as FlairType, postType: "image" as const, imageUrl: "https://images.unsplash.com/photo-1537667577736-d6a3e4aa5eb8?w=400&h=300&fit=crop" },
  { id: 35, title: "의료관광 서울 여행 가이드",               titleEn: "Medical Tourism Seoul Travel Guide",                                categoryKey: "community.travel",            author: "oliver_uk", level: 15, upvotes: 65, comments: 24, time: "5h ago",  flair: "info"         as FlairType, postType: "text"  as const },
  { id: 36, title: "부산 해운대 여행 후기 🌊",               titleEn: "Busan Haeundae Travel Review 🌊",                                  categoryKey: "community.travel",            author: "tanaka_jp", level: 8,  upvotes: 51, comments: 16, time: "1d ago",  flair: "review"       as FlairType, postType: "text"  as const },
  // 한국어 배우기
  { id: 37, title: "한국어 독학 6개월 후기 — 초보에서 중급까지", titleEn: "6-Month Self-Study Korean Review — Beginner to Intermediate",    categoryKey: "community.korean_learn",      author: "paul_de",   level: 11, upvotes: 76, comments: 33, time: "2h ago",  flair: "review"       as FlairType, postType: "text"  as const },
  { id: 38, title: "2026년 한국어 학습 앱 추천",             titleEn: "Best Korean Learning Apps in 2026",                                  categoryKey: "community.korean_learn",      author: "lucy_au",   level: 9,  upvotes: 58, comments: 21, time: "7h ago",  flair: "recommend"    as FlairType, postType: "text"  as const },
  { id: 39, title: "병원에서 쓸 수 있는 한국어 표현 모음",     titleEn: "Useful Korean Phrases for Hospital Visits",                         categoryKey: "community.korean_learn",      author: "lin_tw",    level: 13, upvotes: 69, comments: 27, time: "1d ago",  flair: "info"         as FlairType, postType: "text"  as const },
];

type SortType = "hot" | "top" | "new";
type TimeFilter = "all" | "today" | "week" | "month";
type Reply = { author: string; text: string; time: string };

const PAGE_SIZE = 10;

// DUMMY_POSTS에서 id에 해당하는 미리보기 텍스트 추출 (isKo에 따라 한/영 선택)
function getPreview(postId: number | string, isKo: boolean): string {
  const dummy = DUMMY_POSTS.find((p) => p.id === postId);
  if (!dummy) return "";
  return isKo ? dummy.preview : dummy.previewEn;
}

function FlairBadge({ flair, isKo }: { flair: FlairType; isKo: boolean }) {
  const style = FLAIR_STYLE[flair];
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
      {isKo ? style.label : style.labelEn}
    </span>
  );
}

function CommunityContent() {
  const t = useTranslations();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = pathname.split("/")[1] || "en";
  const isKo = locale === "ko";

  // URL ?cat= 파라미터로 카테고리 초기화
  const catParam = searchParams.get("cat") || "";
  const initialCat = CAT_TO_KEY[catParam] || "community.plastic_surgery";

  const [activeCategoryKey, setActiveCategoryKey] = useState(initialCat);
  const [sort, setSort] = useState<SortType>("hot");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  type CommunityPost = {
    id: number | string;
    title: string;
    categoryKey: string;
    author: string;
    level: number;
    upvotes: number;
    comments: number;
    time: string;
    flair: FlairType;
    postType: "text" | "image" | "link";
    isPinned?: boolean;
    imageUrl?: string;
    linkUrl?: string;
  };
  const [allPosts, setAllPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [master, setMaster] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchAll, setIsSearchAll] = useState(false);

  // 무한 스크롤
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 대댓글 상태 — Map<postId, Reply[]>
  const [replies, setReplies] = useState<Record<string | number, Reply[]>>({});
  // 답글 입력창 열려있는 postId
  const [replyOpenId, setReplyOpenId] = useState<number | string | null>(null);
  const [replyText, setReplyText] = useState("");

  // 북마크 상태 — Set<postId>
  const [bookmarks, setBookmarks] = useState<Set<number | string>>(new Set());

  // 번역 상태 — Map<postId, {text, loading}>
  const [translations, setTranslations] = useState<Record<string | number, { text: string; loading: boolean }>>({});

  // 자동 번역 결과 — Map<postId, string> (locale이 다른 게시글만)
  const [autoTranslations, setAutoTranslations] = useState<Record<string | number, string>>({});
  // 자동 번역 중인 postId 집합
  const [autoTranslating, setAutoTranslating] = useState<Set<string | number>>(new Set());

  // before_after 블러 해제 상태 — Set<postId>
  const [blurRevealed, setBlurRevealed] = useState<Set<number | string>>(new Set());

  void CATEGORY_KEYS; void setActiveCategoryKey;

  // URL cat 변경 시 카테고리 업데이트
  useEffect(() => {
    if (catParam && CAT_TO_KEY[catParam]) {
      setActiveCategoryKey(CAT_TO_KEY[catParam]);
    }
  }, [catParam]);

  // 카테고리/정렬/필터 변경 시 페이지 리셋
  useEffect(() => {
    setPage(1);
  }, [activeCategoryKey, sort, timeFilter, searchQuery, isSearchAll]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
      if (data.user?.email && isMaster(data.user.email)) setMaster(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
      setMaster(!!(session?.user?.email && isMaster(session.user.email)));
    });
    return () => subscription.unsubscribe();
  }, []);

  // Supabase에서 DB 게시글 로드 → 더미 데이터와 병합
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("posts")
      .select("id, title, content, author_id, upvotes, comment_count, created_at, board_id")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        const dbPosts = data.map((p: { id: string; title: string; author_id: string; upvotes: number; comment_count: number; created_at: string }) => ({
          id: p.id,
          title: p.title,
          categoryKey: "community.plastic_surgery",
          author: p.author_id?.slice(0, 8) || "user",
          level: 1,
          upvotes: p.upvotes || 0,
          comments: p.comment_count || 0,
          time: formatRelativeTime(p.created_at),
          flair: "review" as FlairType,
          postType: "text" as const,
        }));
        setAllPosts((prev) => [...prev, ...dbPosts]);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // localStorage에서 북마크/답글 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kbbg_bookmarks");
      if (saved) setBookmarks(new Set(JSON.parse(saved)));
      const savedReplies = localStorage.getItem("kbbg_replies");
      if (savedReplies) setReplies(JSON.parse(savedReplies));
    } catch {
      // localStorage 접근 실패 시 무시
    }
  }, []);

  const handleDeletePost = (postId: number | string) => {
    setAllPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  // 북마크 토글
  const handleBookmark = (postId: number | string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      try { localStorage.setItem("kbbg_bookmarks", JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  };

  // 답글 제출
  const handleReplySubmit = (postId: number | string) => {
    if (!replyText.trim()) return;
    const newReply: Reply = {
      author: t("ui.me"),
      text: replyText,
      time: t("ui.just_now"),
    };
    setReplies((prev) => {
      const next = { ...prev, [postId]: [...(prev[postId] || []), newReply] };
      try { localStorage.setItem("kbbg_replies", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
    setReplyText("");
    setReplyOpenId(null);
  };

  // 번역 요청
  const handleTranslate = async (postId: number | string, title: string) => {
    if (translations[postId]?.text) {
      setTranslations((prev) => {
        const { [postId]: _, ...rest } = prev;
        return rest;
      });
      return;
    }
    setTranslations((prev) => ({ ...prev, [postId]: { text: "", loading: true } }));
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: title, targetLocale: locale }),
      });
      const data = await res.json();
      setTranslations((prev) => ({
        ...prev,
        [postId]: { text: data.translated || title, loading: false },
      }));
    } catch {
      setTranslations((prev) => ({ ...prev, [postId]: { text: title, loading: false } }));
    }
  };

  // 검색 + 카테고리 + 시간 필터
  const filtered = allPosts.filter((p) => {
    if (!isSearchAll && !searchQuery) {
      if (p.categoryKey !== activeCategoryKey) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchAuthor = p.author.toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor) return false;
      if (!isSearchAll && p.categoryKey !== activeCategoryKey) return false;
    }
    // 시간 필터
    if (timeFilter !== "all") {
      const tc = classifyTime(p.time);
      if (timeFilter === "today" && tc !== "today") return false;
      if (timeFilter === "week" && tc !== "today" && tc !== "week") return false;
      if (timeFilter === "month" && tc === "all") return false;
    }
    return true;
  });

  // pinned 우선, 그 다음 정렬
  const pinnedPosts = filtered.filter((p) => "isPinned" in p && p.isPinned);
  const normalPosts = filtered.filter((p) => !("isPinned" in p && p.isPinned));

  const sortedNormal = [...normalPosts].sort((a, b) => {
    if (sort === "hot") return hotScore(b.upvotes, b.time) - hotScore(a.upvotes, a.time);
    if (sort === "top") return b.upvotes - a.upvotes;
    return String(b.id).localeCompare(String(a.id)); // new
  });

  const allSorted = [...pinnedPosts, ...sortedNormal];

  // 무한 스크롤: 현재 page까지만 표시
  const visiblePosts = allSorted.slice(0, page * PAGE_SIZE);
  const hasMore = visiblePosts.length < allSorted.length;

  // 현재 화면에 보이는 게시글 중 locale과 다른 언어 게시글을 자동 번역
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const postsToTranslate = visiblePosts.filter((post) => {
      const { lang } = detectLanguage(post.title);
      if (autoTranslations[post.id] || autoTranslating.has(post.id)) return false;
      // 더미 게시글(id 1~39)은 한/영 제공 — 자동 번역 불필요
      if (typeof post.id === "number") return false;
      return lang !== locale;
    });

    if (postsToTranslate.length === 0) return;

    setAutoTranslating((prev) => {
      const next = new Set(prev);
      postsToTranslate.forEach((p) => next.add(p.id));
      return next;
    });

    postsToTranslate.forEach(async (post) => {
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: post.title, targetLocale: locale }),
        });
        const data = await res.json();
        setAutoTranslations((prev) => ({ ...prev, [post.id]: data.translated || post.title }));
      } catch {
        // 번역 실패 시 원문 유지
      } finally {
        setAutoTranslating((prev) => {
          const next = new Set(prev);
          next.delete(post.id);
          return next;
        });
      }
    });
  // visiblePosts id 목록이 바뀔 때만 실행
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visiblePosts.map((p) => p.id).join(","), locale]);

  // IntersectionObserver로 하단 sentinel 감지
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    // 약간의 딜레이로 로딩 느낌 부여
    setTimeout(() => {
      setPage((p) => p + 1);
      setIsLoadingMore(false);
    }, 400);
  }, [hasMore, isLoadingMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const timeFilterLabels: Record<TimeFilter, string> = {
    all:   t("ui.all_time"),
    today: t("ui.today"),
    week:  t("ui.this_week"),
    month: t("ui.this_month"),
  };

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-100 px-4 py-8">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{t("community.title")}</h1>
          <Link
            href={loggedIn ? `/${locale}/community/new` : `/${locale}/signup`}
            className="rounded-xl bg-rose-400 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 transition-colors"
          >
            {t("community.new_post")}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">

        {/* 검색바 */}
        <div className="mb-5">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("ui.search_placeholder_community")}
              className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 min-h-[44px]"
            />
            <button
              onClick={() => setIsSearchAll(!isSearchAll)}
              className={`px-4 min-h-[44px] rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                isSearchAll
                  ? "bg-rose-400 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {isKo
                ? (isSearchAll ? "전체 검색 중" : "카테고리 내 검색")
                : (isSearchAll ? "Search All" : "In Category")}
            </button>
          </div>
          {searchQuery && (
            <p className="mt-2 text-xs text-gray-500">
              {isKo
                ? `"${searchQuery}" 검색 결과: ${allSorted.length}건 ${isSearchAll ? "(전체)" : `(${t(activeCategoryKey as Parameters<typeof t>[0])})`}`
                : `"${searchQuery}" results: ${allSorted.length} ${isSearchAll ? "(all)" : "(current category)"}`}
            </p>
          )}
        </div>

        {/* 정렬 + 시간 필터 */}
        <div className="flex items-center justify-between mb-4">
          {/* Hot / Top / New 정렬 버튼 */}
          <div className="flex gap-1 text-sm">
            {(["hot", "top", "new"] as SortType[]).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`min-h-[44px] px-3 font-medium transition-colors rounded-lg ${
                  sort === s ? "text-rose-500 bg-rose-50" : "text-gray-500 hover:text-gray-600"
                }`}
              >
                {s === "hot" ? t("ui.hot") :
                 s === "top" ? "⬆ Top" :
                               t("ui.newest")}
              </button>
            ))}
          </div>

          {/* 시간 필터 드롭다운 */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            className="text-xs border border-stone-200 rounded-lg px-3 min-h-[44px] bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-rose-300"
          >
            {(["all", "today", "week", "month"] as TimeFilter[]).map((tf) => (
              <option key={tf} value={tf}>{timeFilterLabels[tf]}</option>
            ))}
          </select>
        </div>

        {/* 게시글 목록 */}
        {allSorted.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            {t("community.title")} — {t("ui.no_posts")}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {visiblePosts.map((post) => {
                const isBookmarked = bookmarks.has(post.id);
                const translation = translations[post.id];
                const postReplies = replies[post.id] || [];
                const isReplyOpen = replyOpenId === post.id;
                const preview = getPreview(post.id, isKo);
                const isPinned = "isPinned" in post && post.isPinned;
                const flair = "flair" in post ? post.flair as FlairType | undefined : undefined;
                const postType = "postType" in post ? post.postType as string : "text";
                const imageUrl = "imageUrl" in post ? post.imageUrl as string | undefined : undefined;
                const isBeforeAfter = flair === "before_after";
                const isBlurRevealed = blurRevealed.has(post.id);

                return (
                  <div
                    key={post.id}
                    className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow ${
                      isPinned ? "border-2 border-rose-200 bg-rose-50/30" : ""
                    }`}
                  >
                    {/* 이미지 썸네일 — before_after는 블러 처리 */}
                    {imageUrl && (
                      <div className="relative overflow-hidden rounded-t-2xl">
                        <Link href={`/${locale}/community/${post.id}`} className="block">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageUrl}
                            alt={post.title}
                            className={`w-full h-32 object-cover hover:scale-105 transition-transform duration-200 ${
                              isBeforeAfter && !isBlurRevealed ? "blur-md" : ""
                            }`}
                          />
                        </Link>
                        {isBeforeAfter && !isBlurRevealed && (
                          <button
                            onClick={() => setBlurRevealed((prev) => new Set([...prev, post.id]))}
                            className="absolute inset-0 flex items-center justify-center bg-black/20"
                          >
                            <span className="bg-white/90 text-gray-700 text-xs font-semibold px-4 py-2 rounded-full shadow">
                              {t("ui.click_to_view")}
                            </span>
                          </button>
                        )}
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {/* 카테고리 + flair 뱃지 */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isPinned && (
                              <span className="text-xs text-rose-500 font-medium">📌 {t("ui.pinned")}</span>
                            )}
                            <span className="text-xs text-rose-500 font-medium">
                              {t(post.categoryKey as Parameters<typeof t>[0])}
                            </span>
                            {flair && <FlairBadge flair={flair} isKo={isKo} />}
                            {/* postType 아이콘 */}
                            {postType === "image" && <span className="text-xs text-gray-500">🖼️</span>}
                            {postType === "link" && <span className="text-xs text-gray-500">🔗</span>}
                          </div>

                          {/* 제목 — 국기 + 클릭 시 상세 페이지 이동 */}
                          {(() => {
                            const { flag, lang } = detectLanguage(post.title);
                            const autoTr = autoTranslations[post.id];
                            const isAutoTranslating = autoTranslating.has(post.id);
                            const isDummy = typeof post.id === "number";
                            // 더미 게시글은 locale에 따라 한/영 제목 선택
                            const dummyTitle = isDummy && !isKo && "titleEn" in post ? (post as typeof post & { titleEn: string }).titleEn : post.title;
                            return (
                              <>
                                <Link href={`/${locale}/community/${post.id}`}>
                                  <h3 className="mt-1 font-semibold text-gray-800 hover:text-rose-500 transition-colors cursor-pointer flex items-start gap-1.5">
                                    <span className="shrink-0 text-base leading-tight">{flag}</span>
                                    <span>
                                      {/* 더미: locale별 제목, DB글: 자동번역 or 원문 */}
                                      {isDummy ? dummyTitle : (autoTr || post.title)}
                                    </span>
                                  </h3>
                                </Link>
                                {/* 자동 번역 중 스피너 */}
                                {!isDummy && isAutoTranslating && (
                                  <div className="mt-1 flex items-center gap-1">
                                    <div className="h-3 w-3 animate-spin rounded-full border border-blue-300 border-t-transparent" />
                                    <span className="text-xs text-gray-500">{t("ui.translating")}</span>
                                  </div>
                                )}
                                {/* 번역된 경우 원문을 작은 글씨로 표시 */}
                                {!isDummy && autoTr && lang !== locale && (
                                  <p className="mt-0.5 text-xs text-gray-500 truncate">
                                    {post.title}
                                  </p>
                                )}
                              </>
                            );
                          })()}

                          {/* 본문 미리보기 2줄 — id 1~10만 표시 */}
                          {preview && (
                            <p className="mt-1.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                              {preview}
                            </p>
                          )}

                          {/* 수동 번역 결과 표시 */}
                          {translation?.loading && (
                            <p className="mt-1 text-xs text-gray-500 italic">
                              {t("ui.translating")}
                            </p>
                          )}
                          {translation?.text && !translation.loading && (
                            <p className="mt-1 text-xs text-blue-600 bg-blue-50 rounded-lg px-2 py-1">
                              {translation.text}
                            </p>
                          )}

                          <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
                            <LevelBadge level={post.level} size="sm" />
                            <span>{post.author}</span>
                            <span>· {post.time}</span>
                          </div>
                        </div>

                        {/* 우측: 통계 + 북마크 */}
                        <div className="text-right text-xs text-gray-500 shrink-0 ml-4 flex flex-col items-end gap-1">
                          <div>↑ {post.upvotes}</div>
                          <div>💬 {post.comments}</div>
                          {/* 북마크 버튼 — 터치 영역 최소 44px */}
                          <button
                            onClick={() => handleBookmark(post.id)}
                            className={`text-base transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${isBookmarked ? "text-rose-500" : "text-gray-500 hover:text-gray-600"}`}
                            title={isBookmarked ? t("ui.unsave") : t("ui.save")}
                          >
                            {isBookmarked ? "🔖" : "📌"}
                          </button>
                        </div>

                        {master && (
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="ml-2 text-xs text-red-400 hover:text-red-600"
                          >
                            삭제
                          </button>
                        )}
                      </div>

                      {/* 액션 버튼: 답글 + 번역 — 터치 영역 최소 44px */}
                      <div className="mt-3 flex items-center gap-1 border-t border-stone-50 pt-3">
                        <button
                          onClick={() => {
                            setReplyOpenId(isReplyOpen ? null : post.id);
                            setReplyText("");
                          }}
                          className="text-xs text-gray-500 hover:text-rose-500 transition-colors min-h-[44px] px-3 flex items-center"
                        >
                          💬 {t("ui.reply")}
                        </button>
                        <button
                          onClick={() => handleTranslate(post.id, post.title)}
                          className="text-xs text-gray-500 hover:text-blue-500 transition-colors min-h-[44px] px-3 flex items-center"
                        >
                          🌐 {translation?.text ? t("ui.hide_translation") : t("ui.translate")}
                        </button>
                      </div>

                      {/* 답글 입력창 — 44px 터치 타겟 보장 */}
                      {isReplyOpen && (
                        <div className="mt-2 flex gap-2">
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={t("ui.write_reply")}
                            className="flex-1 text-xs px-3 py-2.5 border border-stone-200 rounded-xl outline-none focus:border-rose-300 min-h-[44px]"
                            onKeyDown={(e) => { if (e.key === "Enter") handleReplySubmit(post.id); }}
                          />
                          <button
                            onClick={() => handleReplySubmit(post.id)}
                            className="text-xs px-4 min-h-[44px] bg-rose-400 text-white rounded-xl hover:bg-rose-500 shrink-0"
                          >
                            {t("ui.post")}
                          </button>
                        </div>
                      )}

                      {/* 답글 목록 — 들여쓰기 (모바일 ml-2, 데스크탑 ml-4) */}
                      {postReplies.length > 0 && (
                        <div className="mt-2 ml-2 sm:ml-4 space-y-2">
                          {postReplies.map((reply, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-gray-500 bg-stone-50 rounded-xl px-3 py-2">
                              <span className="text-stone-300 shrink-0">↳</span>
                              <span className="font-medium text-gray-700 shrink-0">{reply.author}</span>
                              <span className="flex-1 min-w-0 break-words">{reply.text}</span>
                              <span className="text-gray-300 shrink-0">{reply.time}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 무한 스크롤 sentinel */}
            <div ref={sentinelRef} className="mt-6 flex justify-center min-h-[40px]">
              {isLoadingMore && (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-rose-300 border-t-transparent" />
              )}
              {!hasMore && allSorted.length > PAGE_SIZE && (
                <p className="text-xs text-gray-500">
                  {t("ui.all_loaded")}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function CommunityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 flex items-center justify-center"><p className="text-sm text-gray-500">Loading...</p></div>}>
      <CommunityContent />
    </Suspense>
  );
}
