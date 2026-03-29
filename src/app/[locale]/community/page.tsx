"use client";

import { useState, useEffect } from "react";
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
  { id: 1, title: "강남 쌍꺼풀 후기 — 3개월 경과", categoryKey: "community.plastic_surgery", author: "user_kr", level: 12, upvotes: 87, comments: 24, time: "2h ago" },
  { id: 2, title: "베트남에서 온 코성형 후기", categoryKey: "community.plastic_surgery", author: "tom_vn", level: 15, upvotes: 54, comments: 27, time: "1d ago" },
  { id: 3, title: "Jaw surgery in Gangnam — my experience", categoryKey: "community.plastic_surgery", author: "emma_us", level: 8, upvotes: 41, comments: 19, time: "3d ago" },
  // 피부과
  { id: 4, title: "레이저 토닝 5회차 경과 사진", categoryKey: "community.dermatology", author: "sarah_jp", level: 7, upvotes: 42, comments: 15, time: "4h ago" },
  { id: 5, title: "보톡스 처음 맞았어요 후기", categoryKey: "community.dermatology", author: "lisa_cn", level: 3, upvotes: 29, comments: 18, time: "8h ago" },
  { id: 6, title: "Acne scar treatment in Seoul — worth it!", categoryKey: "community.dermatology", author: "david_uk", level: 10, upvotes: 63, comments: 22, time: "2d ago" },
  // 내과
  { id: 7, title: "서울에서 건강검진 받은 후기", categoryKey: "community.internal_medicine", author: "chen_cn", level: 5, upvotes: 31, comments: 8, time: "6h ago" },
  { id: 8, title: "Full body checkup at Samsung Hospital", categoryKey: "community.internal_medicine", author: "james_au", level: 9, upvotes: 25, comments: 11, time: "1d ago" },
  // 치과
  { id: 9, title: "임플란트 2개 시술 후기 — 비용 공유", categoryKey: "community.dental", author: "mike_us", level: 20, upvotes: 63, comments: 31, time: "6h ago" },
  { id: 10, title: "치아교정 1년차 경과", categoryKey: "community.dental", author: "anna_ru", level: 28, upvotes: 71, comments: 12, time: "2d ago" },
  { id: 11, title: "Teeth whitening in Gangnam — before/after", categoryKey: "community.dental", author: "sophie_fr", level: 6, upvotes: 38, comments: 14, time: "4d ago" },
  // 안과
  { id: 12, title: "라식 수술 3개월 후기 — 시력 1.5!", categoryKey: "community.ophthalmology", author: "park_kr", level: 11, upvotes: 55, comments: 20, time: "3h ago" },
  { id: 13, title: "LASEK vs SMILE — which one to choose?", categoryKey: "community.ophthalmology", author: "kevin_sg", level: 7, upvotes: 44, comments: 16, time: "1d ago" },
  // 산부인과
  { id: 14, title: "서울에서 산전검사 받은 외국인 후기", categoryKey: "community.gynecology", author: "maria_ph", level: 4, upvotes: 22, comments: 9, time: "5h ago" },
  { id: 15, title: "Fertility treatment in Korea — our journey", categoryKey: "community.gynecology", author: "nina_de", level: 13, upvotes: 48, comments: 25, time: "2d ago" },
  // 정형외과
  { id: 16, title: "무릎 관절경 수술 후기", categoryKey: "community.orthopedics", author: "kim_kr", level: 18, upvotes: 33, comments: 7, time: "7h ago" },
  { id: 17, title: "Spine surgery in Korea — international patient", categoryKey: "community.orthopedics", author: "alex_ca", level: 9, upvotes: 29, comments: 13, time: "3d ago" },
  // 한의원
  { id: 18, title: "한방 다이어트 침 치료 2주 후기", categoryKey: "community.oriental", author: "yuki_jp", level: 5, upvotes: 38, comments: 9, time: "4h ago" },
  { id: 19, title: "Acupuncture for back pain — amazing results", categoryKey: "community.oriental", author: "john_us", level: 14, upvotes: 42, comments: 11, time: "1d ago" },
  // 비뇨기과
  { id: 20, title: "비뇨기과 검진 후기 — 남성 건강검진", categoryKey: "community.urology", author: "lee_kr", level: 6, upvotes: 19, comments: 5, time: "12h ago" },
  { id: 21, title: "Prostate checkup in Seoul — foreigner guide", categoryKey: "community.urology", author: "mark_nz", level: 8, upvotes: 27, comments: 8, time: "2d ago" },
  // 이비인후과
  { id: 22, title: "코골이 수술 후기 — 삶이 바뀌었어요", categoryKey: "community.ent", author: "choi_kr", level: 10, upvotes: 45, comments: 17, time: "5h ago" },
  { id: 23, title: "Sinus surgery experience in Korea", categoryKey: "community.ent", author: "peter_nl", level: 7, upvotes: 31, comments: 10, time: "3d ago" },
  // K-Pop
  { id: 24, title: "BTS 콘서트 서울 후기! 🎤", categoryKey: "community.kpop", author: "mina_th", level: 16, upvotes: 92, comments: 41, time: "1h ago" },
  { id: 25, title: "Best K-pop concert venues in Seoul", categoryKey: "community.kpop", author: "jessica_br", level: 11, upvotes: 67, comments: 28, time: "6h ago" },
  { id: 26, title: "아이돌 팬미팅 가는 방법 총정리", categoryKey: "community.kpop", author: "hana_jp", level: 9, upvotes: 58, comments: 22, time: "1d ago" },
  // K-Food
  { id: 27, title: "을지로 맛집 투어 후기 🍜", categoryKey: "community.kfood", author: "wang_cn", level: 8, upvotes: 73, comments: 35, time: "2h ago" },
  { id: 28, title: "Best Korean BBQ in Gangnam — top 5", categoryKey: "community.kfood", author: "rachel_us", level: 12, upvotes: 61, comments: 29, time: "8h ago" },
  { id: 29, title: "한국 길거리 음식 베스트 10", categoryKey: "community.kfood", author: "mai_vn", level: 5, upvotes: 49, comments: 18, time: "2d ago" },
  // K-드라마
  { id: 30, title: "드라마 촬영지 투어 후기 — 이태원/한남동", categoryKey: "community.kdrama", author: "suki_jp", level: 7, upvotes: 56, comments: 21, time: "3h ago" },
  { id: 31, title: "K-drama filming locations you must visit!", categoryKey: "community.kdrama", author: "clara_it", level: 10, upvotes: 48, comments: 15, time: "1d ago" },
  // K-패션
  { id: 32, title: "홍대 빈티지 쇼핑 가이드 👗", categoryKey: "community.kfashion", author: "nari_kr", level: 14, upvotes: 44, comments: 19, time: "4h ago" },
  { id: 33, title: "Myeongdong vs Gangnam — where to shop?", categoryKey: "community.kfashion", author: "amy_sg", level: 6, upvotes: 37, comments: 12, time: "2d ago" },
  // 한국 여행
  { id: 34, title: "제주도 3박4일 여행 코스 추천", categoryKey: "community.travel", author: "jung_kr", level: 20, upvotes: 82, comments: 38, time: "1h ago" },
  { id: 35, title: "Seoul travel guide for medical tourists", categoryKey: "community.travel", author: "oliver_uk", level: 15, upvotes: 65, comments: 24, time: "5h ago" },
  { id: 36, title: "부산 해운대 여행 후기 🌊", categoryKey: "community.travel", author: "tanaka_jp", level: 8, upvotes: 51, comments: 16, time: "1d ago" },
  // 한국어 배우기
  { id: 37, title: "한국어 독학 6개월 후기 — 초보에서 중급까지", categoryKey: "community.korean_learn", author: "paul_de", level: 11, upvotes: 76, comments: 33, time: "2h ago" },
  { id: 38, title: "Best apps to learn Korean in 2026", categoryKey: "community.korean_learn", author: "lucy_au", level: 9, upvotes: 58, comments: 21, time: "7h ago" },
  { id: 39, title: "병원에서 쓸 수 있는 한국어 표현 모음", categoryKey: "community.korean_learn", author: "lin_tw", level: 13, upvotes: 69, comments: 27, time: "1d ago" },
];

type SortType = "popular" | "latest";

export default function CommunityPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = pathname.split("/")[1] || "en";

  // URL ?cat= 파라미터로 카테고리 초기화
  const catParam = searchParams.get("cat") || "";
  const initialCat = CAT_TO_KEY[catParam] || "community.plastic_surgery";

  const [activeCategoryKey, setActiveCategoryKey] = useState(initialCat);
  const [sort, setSort] = useState<SortType>("popular");
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [master, setMaster] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

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

  const handleDeletePost = (postId: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const filtered = posts.filter((p) => p.categoryKey === activeCategoryKey);
  const sorted = [...filtered].sort((a, b) =>
    sort === "popular" ? b.upvotes - a.upvotes : 0
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-8">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{t("community.title")}</h1>
          <Link
            href={loggedIn ? `/${locale}/community/new` : `/${locale}/signup`}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
          >
            {t("community.new_post")}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">

        {/* 정렬 옵션 */}
        <div className="flex gap-3 text-sm mb-4">
          <button
            onClick={() => setSort("popular")}
            className={`font-medium transition-colors ${sort === "popular" ? "text-emerald-600" : "text-gray-400 hover:text-gray-600"}`}
          >
            {t("community.trending")}
          </button>
          <button
            onClick={() => setSort("latest")}
            className={`font-medium transition-colors ${sort === "latest" ? "text-emerald-600" : "text-gray-400 hover:text-gray-600"}`}
          >
            {t("community.latest")}
          </button>
        </div>

        {/* 게시글 목록 */}
        {sorted.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            {t("community.title")} — 아직 글이 없습니다
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl shadow-md p-5 flex items-start justify-between hover:shadow-lg transition-shadow">
                <div className="flex-1">
                  <span className="text-xs text-emerald-600 font-medium">
                    {t(post.categoryKey as Parameters<typeof t>[0])}
                  </span>
                  <h3 className="mt-1 font-semibold text-gray-800">{post.title}</h3>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-400">
                    <LevelBadge level={post.level} size="sm" />
                    <span>{post.author}</span>
                    <span>· {post.time}</span>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-400 shrink-0 ml-4">
                  <div>↑ {post.upvotes}</div>
                  <div>💬 {post.comments}</div>
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
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
