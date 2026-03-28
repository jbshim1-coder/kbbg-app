"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import TrendingSidebar from "@/components/TrendingSidebar";
import LevelBadge from "@/components/LevelBadge";

// 카테고리 탭 — 번역 키 기반으로 변경
const CATEGORY_KEYS = ["community.all", "community.plastic_surgery", "community.dermatology", "community.dental", "community.general", "community.kpop", "community.kfood", "community.kdrama", "community.kfashion", "community.travel", "community.korean_learn"];

// 게시글 더미 데이터 — 실제 DB 연동 전 UI 확인용
const POSTS = [
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

  // 카테고리 필터링 — "all" 선택 시 모든 글 표시
  const filtered = POSTS.filter(
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
            href={`/${locale}/community/new`}
            className="rounded-xl bg-pink-500 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-600"
          >
            {t("community.new_post")}
          </Link>
        </div>
      </div>

      {/* 2컬럼 레이아웃 — 왼쪽: 게시글 목록, 오른쪽: 트렌딩 사이드바 */}
      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* 왼쪽: 카테고리 + 게시글 목록 */}
        <div className="lg:col-span-2">
          {/* 카테고리 탭 — 가로 스크롤 지원 (모바일 대응) */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORY_KEYS.map((catKey) => (
              <button
                key={catKey}
                onClick={() => setActiveCategoryKey(catKey)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  activeCategoryKey === catKey
                    ? "bg-pink-500 text-white"
                    : "bg-white text-gray-600 hover:bg-pink-50"
                }`}
              >
                {t(catKey as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>

          {/* 정렬 옵션 토글 */}
          <div className="mt-4 flex gap-3 text-sm">
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
              // 각 게시글 카드 — 클릭 시 상세 페이지로 이동
              <Link
                key={post.id}
                href={`/${locale}/community/${post.id}`}
                className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
              >
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
            ))}

            {/* 필터 결과가 없을 때 빈 상태 메시지 */}
            {sorted.length === 0 && (
              <p className="py-16 text-center text-gray-400">{t("community.no_posts")}</p>
            )}
          </div>
        </div>

        {/* 오른쪽: 트렌딩 사이드바 (모바일에서는 아래로) */}
        <div className="lg:col-span-1">
          <TrendingSidebar />
        </div>
      </div>
    </main>
  );
}
