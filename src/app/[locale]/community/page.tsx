"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import LevelBadge from "@/components/LevelBadge";
import { createClient } from "@/lib/supabase";
import { isMaster } from "@/lib/level-system";

// 카테고리 탭 — 번역 키 기반으로 변경
const CATEGORY_KEYS = ["community.all", "community.plastic_surgery", "community.dermatology", "community.dental", "community.general", "community.kpop", "community.kfood", "community.kdrama", "community.kfashion", "community.travel", "community.korean_learn"];

// 게시글 더미 데이터 — 실제 DB 연동 전 UI 확인용
const INITIAL_POSTS = [
  { id: 1, titleKey: "community_preview.post1_title", categoryKey: "community.plastic_surgery", author: "user_kr", level: 12, upvotes: 87, downvotes: 3, comments: 24, createdAtKey: "community.time_2h" },
  { id: 2, titleKey: "community_preview.post2_title", categoryKey: "community.dermatology", author: "sarah_jp", level: 7, upvotes: 42, downvotes: 1, comments: 15, createdAtKey: "community.time_4h" },
  { id: 3, titleKey: "community_preview.post3_title", categoryKey: "community.dental", author: "mike_us", level: 20, upvotes: 63, downvotes: 5, comments: 31, createdAtKey: "community.time_6h" },
  { id: 4, titleKey: "community.dummy_post4_title", categoryKey: "community.dermatology", author: "lisa_cn", level: 3, upvotes: 29, downvotes: 0, comments: 18, createdAtKey: "community.time_8h" },
  { id: 5, titleKey: "community.dummy_post5_title", categoryKey: "community.plastic_surgery", author: "tom_vn", level: 15, upvotes: 54, downvotes: 2, comments: 27, createdAtKey: "community.time_1d" },
  { id: 6, titleKey: "community.dummy_post6_title", categoryKey: "community.dental", author: "anna_ru", level: 28, upvotes: 71, downvotes: 4, comments: 12, createdAtKey: "community.time_2d" },
  { id: 7, titleKey: "community.dummy_post7_title", categoryKey: "community.general", author: "yuki_jp", level: 5, upvotes: 38, downvotes: 1, comments: 9, createdAtKey: "community.time_3d" },
];

// 정렬 타입 — "popular": 추천순, "latest": 최신순
type SortType = "popular" | "latest";

// 커뮤니티 메인 페이지 — 카테고리 필터 + 정렬 + 게시글 목록
export default function CommunityPage() {
  const t = useTranslations();
  const pathname = usePathname();
  // pathname: /ko/community → locale = "ko"
  const locale = pathname.split("/")[1] || "en";

  // 선택된 카테고리 키 상태 (기본값: community.all)
  const [activeCategoryKey, setActiveCategoryKey] = useState("community.all");
  // 정렬 방식 상태
  const [sort, setSort] = useState<SortType>("popular");
  // 게시글 목록 상태 — 삭제 시 로컬 제거
  const [posts, setPosts] = useState(INITIAL_POSTS);
  // 현재 로그인 사용자가 마스터인지 여부
  const [master, setMaster] = useState(false);
  // 로그인 여부 — null: 확인 전, false: 비로그인, true: 로그인
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  // 로그인 사용자 확인 — 마스터 여부 및 로그인 상태 감지
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
      if (data.user?.email && isMaster(data.user.email)) {
        setMaster(true);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
      setMaster(!!(session?.user?.email && isMaster(session.user.email)));
    });
    return () => subscription.unsubscribe();
  }, []);

  // 게시글 삭제 핸들러 — 마스터 전용, 목록에서 즉시 제거
  const handleDeletePost = (postId: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  // 카테고리 필터링 — "all" 선택 시 모든 글 표시
  const filtered = posts.filter(
    (p) => activeCategoryKey === "community.all" || p.categoryKey === activeCategoryKey
  );

  // 정렬 적용 — 인기순: upvotes 내림차순, 최신순: 배열 순서 유지 (실제 연동 시 createdAt 기준)
  const sorted = [...filtered].sort((a, b) =>
    sort === "popular" ? b.upvotes - a.upvotes : 0
  );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 페이지 헤더 — 제목 + 글쓰기 버튼 */}
      <div className="bg-white border-b border-gray-100 px-4 py-6">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{t("community.title")}</h1>
          <Link
            href={loggedIn ? `/${locale}/community/new` : `/${locale}/signup`}
            className="rounded-xl bg-pink-500 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-600"
          >
            {t("community.new_post")}
          </Link>
        </div>
      </div>

      {/* 전체 너비 레이아웃 */}
      <div className="mx-auto max-w-4xl px-4 py-6">

        {/* 카테고리 + 정렬 상단 바 */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* 카테고리 드롭다운 */}
          <select
            value={activeCategoryKey}
            onChange={(e) => setActiveCategoryKey(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium bg-white focus:outline-none focus:border-pink-400"
          >
            {CATEGORY_KEYS.map((catKey) => (
              <option key={catKey} value={catKey}>
                {t(catKey as Parameters<typeof t>[0])}
              </option>
            ))}
          </select>

          {/* 정렬 옵션 토글 */}
          <div className="flex gap-3 text-sm">
            <button
              onClick={() => setSort("popular")}
              className={`font-medium ${sort === "popular" ? "text-pink-500" : "text-gray-400 hover:text-gray-600"}`}
            >
              {t("community.trending")}
            </button>
            <button
              onClick={() => setSort("latest")}
              className={`font-medium ${sort === "latest" ? "text-pink-500" : "text-gray-400 hover:text-gray-600"}`}
            >
              {t("community.latest")}
            </button>
        </div>

          {/* 게시글 카드 목록 */}
          <div className="mt-4 flex flex-col gap-3">
            {sorted.map((post) => (
              // 각 게시글 카드 — 마스터는 삭제 버튼 포함
              <div key={post.id} className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md relative">
                <Link href={`/${locale}/community/${post.id}`} className="block">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      {/* 카테고리 배지 */}
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                          {t(post.categoryKey as Parameters<typeof t>[0])}
                        </span>
                      </div>
                      {/* 제목 — 긴 제목은 말줄임표 처리 */}
                      <h2 className="mt-1 truncate text-base font-semibold text-gray-900">
                        {t(post.titleKey as Parameters<typeof t>[0])}
                      </h2>
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                        <LevelBadge level={post.level} size="sm" />
                        {post.author} · {t(post.createdAtKey as Parameters<typeof t>[0])}
                      </p>
                    </div>
                    {/* 추천 수 및 댓글 수 */}
                    <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-gray-400">
                      <span>↑ {post.upvotes}</span>
                      <span>💬 {post.comments}</span>
                    </div>
                  </div>
                </Link>

                {/* 마스터 전용 삭제 버튼 */}
                {master && (
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="mt-2 text-xs px-3 py-1 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    {t("community.delete")}
                  </button>
                )}
              </div>
            ))}

            {/* 필터 결과가 없을 때 빈 상태 메시지 */}
            {sorted.length === 0 && (
              <p className="py-16 text-center text-gray-400">{t("community.no_posts")}</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
