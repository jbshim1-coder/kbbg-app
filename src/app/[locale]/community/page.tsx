"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import LevelBadge from "@/components/LevelBadge";
import { createClient } from "@/lib/supabase";
import { isMaster } from "@/lib/level-system";

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

// 16개 카테고리 전체 가상 게시글 — 다양한 국적의 가상 회원
const INITIAL_POSTS = [
  // 성형외과
  { id: 1, title: "강남 쌍꺼풀 후기 — 3개월 경과", categoryKey: "community.plastic_surgery", author: "user_kr", level: 12, upvotes: 87, comments: 24, time: "2h ago", imageUrl: "https://images.unsplash.com/photo-1614359975067-0f0b3c6d2d3a?w=400&h=300&fit=crop" },
  { id: 2, title: "베트남에서 온 코성형 후기", categoryKey: "community.plastic_surgery", author: "tom_vn", level: 15, upvotes: 54, comments: 27, time: "1d ago" },
  { id: 3, title: "강남 턱수술 3개월 — 붓기 빠지는 과정", categoryKey: "community.plastic_surgery", author: "emma_us", level: 8, upvotes: 41, comments: 19, time: "3d ago" },
  // 피부과
  { id: 4, title: "레이저 토닝 5회차 경과 사진", categoryKey: "community.dermatology", author: "sarah_jp", level: 7, upvotes: 42, comments: 15, time: "4h ago", imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop" },
  { id: 5, title: "보톡스 처음 맞았어요 후기", categoryKey: "community.dermatology", author: "lisa_cn", level: 3, upvotes: 29, comments: 18, time: "8h ago" },
  { id: 6, title: "서울에서 여드름 흉터 치료 후기 — 대만족!", categoryKey: "community.dermatology", author: "david_uk", level: 10, upvotes: 63, comments: 22, time: "2d ago" },
  // 내과
  { id: 7, title: "서울에서 건강검진 받은 후기", categoryKey: "community.internal_medicine", author: "chen_cn", level: 5, upvotes: 31, comments: 8, time: "6h ago" },
  { id: 8, title: "삼성병원 종합검진 패키지 후기", categoryKey: "community.internal_medicine", author: "james_au", level: 9, upvotes: 25, comments: 11, time: "1d ago" },
  // 치과
  { id: 9, title: "임플란트 2개 시술 후기 — 비용 공유", categoryKey: "community.dental", author: "mike_us", level: 20, upvotes: 63, comments: 31, time: "6h ago" },
  { id: 10, title: "치아교정 1년차 경과", categoryKey: "community.dental", author: "anna_ru", level: 28, upvotes: 71, comments: 12, time: "2d ago" },
  { id: 11, title: "강남 치아미백 전후 비교 사진", categoryKey: "community.dental", author: "sophie_fr", level: 6, upvotes: 38, comments: 14, time: "4d ago", imageUrl: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=300&fit=crop" },
  // 안과
  { id: 12, title: "라식 수술 3개월 후기 — 시력 1.5!", categoryKey: "community.ophthalmology", author: "park_kr", level: 11, upvotes: 55, comments: 20, time: "3h ago" },
  { id: 13, title: "라섹 vs 스마일 — 어떤 걸 선택할까?", categoryKey: "community.ophthalmology", author: "kevin_sg", level: 7, upvotes: 44, comments: 16, time: "1d ago" },
  // 산부인과
  { id: 14, title: "서울에서 산전검사 받은 외국인 후기", categoryKey: "community.gynecology", author: "maria_ph", level: 4, upvotes: 22, comments: 9, time: "5h ago" },
  { id: 15, title: "한국에서 난임 치료 받은 경험담", categoryKey: "community.gynecology", author: "nina_de", level: 13, upvotes: 48, comments: 25, time: "2d ago" },
  // 정형외과
  { id: 16, title: "무릎 관절경 수술 후기", categoryKey: "community.orthopedics", author: "kim_kr", level: 18, upvotes: 33, comments: 7, time: "7h ago" },
  { id: 17, title: "한국에서 척추 수술 받은 후기", categoryKey: "community.orthopedics", author: "alex_ca", level: 9, upvotes: 29, comments: 13, time: "3d ago" },
  // 한의원
  { id: 18, title: "한방 다이어트 침 치료 2주 후기", categoryKey: "community.oriental", author: "yuki_jp", level: 5, upvotes: 38, comments: 9, time: "4h ago" },
  { id: 19, title: "허리 통증 침 치료 — 놀라운 효과!", categoryKey: "community.oriental", author: "john_us", level: 14, upvotes: 42, comments: 11, time: "1d ago" },
  // 비뇨기과
  { id: 20, title: "비뇨기과 검진 후기 — 남성 건강검진", categoryKey: "community.urology", author: "lee_kr", level: 6, upvotes: 19, comments: 5, time: "12h ago" },
  { id: 21, title: "서울에서 전립선 검진 받는 방법", categoryKey: "community.urology", author: "mark_nz", level: 8, upvotes: 27, comments: 8, time: "2d ago" },
  // 이비인후과
  { id: 22, title: "코골이 수술 후기 — 삶이 바뀌었어요", categoryKey: "community.ent", author: "choi_kr", level: 10, upvotes: 45, comments: 17, time: "5h ago" },
  { id: 23, title: "한국에서 축농증 수술 경험담", categoryKey: "community.ent", author: "peter_nl", level: 7, upvotes: 31, comments: 10, time: "3d ago" },
  // K-Pop
  { id: 24, title: "BTS 콘서트 서울 후기! 🎤", categoryKey: "community.kpop", author: "mina_th", level: 16, upvotes: 92, comments: 41, time: "1h ago", imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop" },
  { id: 25, title: "서울 K-pop 콘서트 장소 베스트", categoryKey: "community.kpop", author: "jessica_br", level: 11, upvotes: 67, comments: 28, time: "6h ago" },
  { id: 26, title: "아이돌 팬미팅 가는 방법 총정리", categoryKey: "community.kpop", author: "hana_jp", level: 9, upvotes: 58, comments: 22, time: "1d ago" },
  // K-Food
  { id: 27, title: "을지로 맛집 투어 후기 🍜", categoryKey: "community.kfood", author: "wang_cn", level: 8, upvotes: 73, comments: 35, time: "2h ago", imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop" },
  { id: 28, title: "강남 한우 맛집 TOP 5 추천", categoryKey: "community.kfood", author: "rachel_us", level: 12, upvotes: 61, comments: 29, time: "8h ago" },
  { id: 29, title: "한국 길거리 음식 베스트 10", categoryKey: "community.kfood", author: "mai_vn", level: 5, upvotes: 49, comments: 18, time: "2d ago" },
  // K-드라마
  { id: 30, title: "드라마 촬영지 투어 후기 — 이태원/한남동", categoryKey: "community.kdrama", author: "suki_jp", level: 7, upvotes: 56, comments: 21, time: "3h ago" },
  { id: 31, title: "꼭 가봐야 할 드라마 촬영지 모음!", categoryKey: "community.kdrama", author: "clara_it", level: 10, upvotes: 48, comments: 15, time: "1d ago" },
  // K-패션
  { id: 32, title: "홍대 빈티지 쇼핑 가이드 👗", categoryKey: "community.kfashion", author: "nari_kr", level: 14, upvotes: 44, comments: 19, time: "4h ago", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop" },
  { id: 33, title: "명동 vs 강남 — 쇼핑은 어디서?", categoryKey: "community.kfashion", author: "amy_sg", level: 6, upvotes: 37, comments: 12, time: "2d ago" },
  // 한국 여행
  { id: 34, title: "제주도 3박4일 여행 코스 추천", categoryKey: "community.travel", author: "jung_kr", level: 20, upvotes: 82, comments: 38, time: "1h ago", imageUrl: "https://images.unsplash.com/photo-1537667577736-d6a3e4aa5eb8?w=400&h=300&fit=crop" },
  { id: 35, title: "의료관광 서울 여행 가이드", categoryKey: "community.travel", author: "oliver_uk", level: 15, upvotes: 65, comments: 24, time: "5h ago" },
  { id: 36, title: "부산 해운대 여행 후기 🌊", categoryKey: "community.travel", author: "tanaka_jp", level: 8, upvotes: 51, comments: 16, time: "1d ago" },
  // 한국어 배우기
  { id: 37, title: "한국어 독학 6개월 후기 — 초보에서 중급까지", categoryKey: "community.korean_learn", author: "paul_de", level: 11, upvotes: 76, comments: 33, time: "2h ago" },
  { id: 38, title: "2026년 한국어 학습 앱 추천", categoryKey: "community.korean_learn", author: "lucy_au", level: 9, upvotes: 58, comments: 21, time: "7h ago" },
  { id: 39, title: "병원에서 쓸 수 있는 한국어 표현 모음", categoryKey: "community.korean_learn", author: "lin_tw", level: 13, upvotes: 69, comments: 27, time: "1d ago" },
];

type SortType = "popular" | "latest";
type Reply = { author: string; text: string; time: string };

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
  const [sort, setSort] = useState<SortType>("popular");
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [master, setMaster] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchAll, setIsSearchAll] = useState(false);

  // 대댓글 상태 — Map<postId, Reply[]>
  const [replies, setReplies] = useState<Record<number, Reply[]>>({});
  // 답글 입력창 열려있는 postId
  const [replyOpenId, setReplyOpenId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  // 북마크 상태 — Set<postId>
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());

  // 번역 상태 — Map<postId, {text, loading}>
  const [translations, setTranslations] = useState<Record<number, { text: string; loading: boolean }>>({});

  void CATEGORY_KEYS; void setActiveCategoryKey;

  // URL cat 변경 시 카테고리 업데이트
  useEffect(() => {
    if (catParam && CAT_TO_KEY[catParam]) {
      setActiveCategoryKey(CAT_TO_KEY[catParam]);
    }
  }, [catParam]);

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

  const handleDeletePost = (postId: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  // 북마크 토글
  const handleBookmark = (postId: number) => {
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
  const handleReplySubmit = (postId: number) => {
    if (!replyText.trim()) return;
    const newReply: Reply = {
      author: isKo ? "나" : "me",
      text: replyText,
      time: isKo ? "방금" : "just now",
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
  const handleTranslate = async (postId: number, title: string) => {
    // 이미 번역됐으면 토글
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

  // 검색 + 카테고리 필터
  const filtered = posts.filter((p) => {
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
    return true;
  });
  const sorted = [...filtered].sort((a, b) =>
    sort === "popular" ? b.upvotes - a.upvotes : b.id - a.id
  );

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
              placeholder={isKo ? "제목, 작성자 검색..." : "Search by title, author..."}
              className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
            <button
              onClick={() => setIsSearchAll(!isSearchAll)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
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
            <p className="mt-2 text-xs text-gray-400">
              {isKo
                ? `"${searchQuery}" 검색 결과: ${sorted.length}건 ${isSearchAll ? "(전체)" : `(${t(activeCategoryKey as Parameters<typeof t>[0])})`}`
                : `"${searchQuery}" results: ${sorted.length} ${isSearchAll ? "(all)" : "(current category)"}`}
            </p>
          )}
        </div>

        {/* 정렬 옵션 */}
        <div className="flex gap-3 text-sm mb-4">
          <button
            onClick={() => setSort("popular")}
            className={`font-medium transition-colors ${sort === "popular" ? "text-rose-500" : "text-gray-400 hover:text-gray-600"}`}
          >
            {t("community.trending")}
          </button>
          <button
            onClick={() => setSort("latest")}
            className={`font-medium transition-colors ${sort === "latest" ? "text-rose-500" : "text-gray-400 hover:text-gray-600"}`}
          >
            {t("community.latest")}
          </button>
        </div>

        {/* 게시글 목록 */}
        {sorted.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            {t("community.title")} — {isKo ? "아직 글이 없습니다" : "No posts yet"}
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((post) => {
              const isBookmarked = bookmarks.has(post.id);
              const translation = translations[post.id];
              const postReplies = replies[post.id] || [];
              const isReplyOpen = replyOpenId === post.id;

              return (
                <div key={post.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  {/* 이미지 썸네일 */}
                  {"imageUrl" in post && post.imageUrl && (
                    <div className="overflow-hidden rounded-t-2xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-rose-500 font-medium">
                          {t(post.categoryKey as Parameters<typeof t>[0])}
                        </span>
                        <h3 className="mt-1 font-semibold text-gray-800">{post.title}</h3>

                        {/* 번역 결과 표시 */}
                        {translation?.loading && (
                          <p className="mt-1 text-xs text-gray-400 italic">
                            {isKo ? "번역 중..." : "Translating..."}
                          </p>
                        )}
                        {translation?.text && !translation.loading && (
                          <p className="mt-1 text-xs text-blue-600 bg-blue-50 rounded-lg px-2 py-1">
                            {translation.text}
                          </p>
                        )}

                        <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-400">
                          <LevelBadge level={post.level} size="sm" />
                          <span>{post.author}</span>
                          <span>· {post.time}</span>
                        </div>
                      </div>

                      {/* 우측: 통계 + 북마크 */}
                      <div className="text-right text-xs text-gray-400 shrink-0 ml-4 flex flex-col items-end gap-1">
                        <div>↑ {post.upvotes}</div>
                        <div>💬 {post.comments}</div>
                        {/* 북마크 버튼 — 터치 영역 최소 44px */}
                        <button
                          onClick={() => handleBookmark(post.id)}
                          className={`text-base transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${isBookmarked ? "text-rose-500" : "text-gray-300 hover:text-gray-400"}`}
                          title={isKo ? (isBookmarked ? "저장 취소" : "저장") : (isBookmarked ? "Unsave" : "Save")}
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
                        className="text-xs text-gray-400 hover:text-rose-500 transition-colors min-h-[44px] px-3 flex items-center"
                      >
                        💬 {isKo ? "답글" : "Reply"}
                      </button>
                      <button
                        onClick={() => handleTranslate(post.id, post.title)}
                        className="text-xs text-gray-400 hover:text-blue-500 transition-colors min-h-[44px] px-3 flex items-center"
                      >
                        🌐 {translation?.text ? (isKo ? "번역 숨기기" : "Hide") : (isKo ? "번역" : "Translate")}
                      </button>
                    </div>

                    {/* 답글 입력창 */}
                    {isReplyOpen && (
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={isKo ? "답글 입력..." : "Write a reply..."}
                          className="flex-1 text-xs px-3 py-2 border border-stone-200 rounded-xl outline-none focus:border-rose-300"
                          onKeyDown={(e) => { if (e.key === "Enter") handleReplySubmit(post.id); }}
                        />
                        <button
                          onClick={() => handleReplySubmit(post.id)}
                          className="text-xs px-3 py-2 bg-rose-400 text-white rounded-xl hover:bg-rose-500"
                        >
                          {isKo ? "등록" : "Post"}
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
        )}
      </div>
    </main>
  );
}

export default function CommunityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 flex items-center justify-center"><p className="text-sm text-gray-400">Loading...</p></div>}>
      <CommunityContent />
    </Suspense>
  );
}
