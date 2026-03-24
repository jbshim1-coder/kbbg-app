"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

// 카테고리 탭 — 번역 키 기반으로 변경
const CATEGORY_KEYS = ["community.all", "community.plastic_surgery", "community.dermatology", "community.dental", "community.general"];

// 게시글 더미 데이터 — 실제 DB 연동 전 UI 확인용
const POSTS = [
  { id: 1, title: "강남 쌍꺼풀 후기 — 3개월 경과", categoryKey: "community.plastic_surgery", author: "user_kr", upvotes: 87, downvotes: 3, comments: 24, createdAt: "2시간 전" },
  { id: 2, title: "외국인도 보험 없이 피부과 갈 수 있나요?", categoryKey: "community.dermatology", author: "sarah_jp", upvotes: 42, downvotes: 1, comments: 15, createdAt: "4시간 전" },
  { id: 3, title: "치아 교정 가격 비교 (강남 vs 홍대)", categoryKey: "community.dental", author: "mike_us", upvotes: 63, downvotes: 5, comments: 31, createdAt: "6시간 전" },
  { id: 4, title: "보톡스 처음인데 어느 병원이 좋을까요?", categoryKey: "community.dermatology", author: "lisa_cn", upvotes: 29, downvotes: 0, comments: 18, createdAt: "8시간 전" },
  { id: 5, title: "코 성형 후 붓기 얼마나 걸려요?", categoryKey: "community.plastic_surgery", author: "tom_vn", upvotes: 54, downvotes: 2, comments: 27, createdAt: "1일 전" },
  { id: 6, title: "임플란트 가격 정보 공유합니다", categoryKey: "community.dental", author: "anna_ru", upvotes: 71, downvotes: 4, comments: 12, createdAt: "2일 전" },
  { id: 7, title: "한방 피부 관리 경험담", categoryKey: "community.general", author: "yuki_jp", upvotes: 38, downvotes: 1, comments: 9, createdAt: "3일 전" },
];

// 정렬 타입 — "popular": 추천순, "latest": 최신순
type SortType = "popular" | "latest";

// 커뮤니티 메인 페이지 — 카테고리 필터 + 정렬 + 게시글 목록
export default function CommunityPage() {
  const t = useTranslations();

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
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{t("community.title")}</h1>
          <Link
            href="/community/new"
            className="rounded-xl bg-pink-500 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-600"
          >
            {t("community.new_post")}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6">
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
              href={`/community/${post.id}`}
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
                    {post.title}
                  </h2>
                  <p className="mt-1 text-xs text-gray-400">
                    {post.author} · {post.createdAt}
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
    </main>
  );
}
