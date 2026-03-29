"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

// 인기 게시글 더미 데이터 — upvote 순
const TRENDING_POSTS = [
  { id: 1, titleKey: "trending.post1", upvotes: 342 },
  { id: 2, titleKey: "trending.post2", upvotes: 289 },
  { id: 3, titleKey: "trending.post3", upvotes: 251 },
  { id: 4, titleKey: "trending.post4", upvotes: 198 },
  { id: 5, titleKey: "trending.post5", upvotes: 176 },
  { id: 6, titleKey: "trending.post6", upvotes: 154 },
  { id: 7, titleKey: "trending.post7", upvotes: 132 },
  { id: 8, titleKey: "trending.post8", upvotes: 118 },
  { id: 9, titleKey: "trending.post9", upvotes: 97 },
  { id: 10, titleKey: "trending.post10", upvotes: 84 },
];

// 인기 검색어 더미 데이터
const TRENDING_SEARCHES = [
  { id: 1, termKey: "trending.search1" },
  { id: 2, termKey: "trending.search2" },
  { id: 3, termKey: "trending.search3" },
  { id: 4, termKey: "trending.search4" },
  { id: 5, termKey: "trending.search5" },
  { id: 6, termKey: "trending.search6" },
  { id: 7, termKey: "trending.search7" },
  { id: 8, termKey: "trending.search8" },
  { id: 9, termKey: "trending.search9" },
  { id: 10, termKey: "trending.search10" },
];

// 순위별 색상 — 1~3위는 강조색
function getRankColor(rank: number): string {
  if (rank === 1) return "text-red-500 font-bold";
  if (rank === 2) return "text-slate-700 font-bold";
  if (rank === 3) return "text-orange-400 font-bold";
  return "text-gray-400";
}

export default function TrendingSidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  return (
    <aside className="w-full space-y-4">
      {/* 실시간 인기 게시글 */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <span className="text-base">🔥</span>
          <h3 className="text-sm font-bold text-gray-900">
            {t("trending.popular_posts")}
          </h3>
        </div>
        <ol className="divide-y divide-gray-50">
          {TRENDING_POSTS.map((post, index) => {
            const rank = index + 1;
            return (
              <li key={post.id}>
                <Link
                  href={`/${locale}/community/${post.id}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <span className={`w-5 shrink-0 text-center text-sm ${getRankColor(rank)}`}>
                    {rank}
                  </span>
                  <span className="truncate text-sm text-gray-700">
                    {t(post.titleKey as Parameters<typeof t>[0])}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>

      {/* 실시간 인기 검색어 */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <span className="text-base">📈</span>
          <h3 className="text-sm font-bold text-gray-900">
            {t("trending.popular_searches")}
          </h3>
        </div>
        <ol className="divide-y divide-gray-50">
          {TRENDING_SEARCHES.map((item, index) => {
            const rank = index + 1;
            return (
              <li key={item.id}>
                <Link
                  href={`/${locale}/search?q=${encodeURIComponent(t(item.termKey as Parameters<typeof t>[0]))}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <span className={`w-5 shrink-0 text-center text-sm ${getRankColor(rank)}`}>
                    {rank}
                  </span>
                  <span className="text-sm text-gray-700">
                    {t(item.termKey as Parameters<typeof t>[0])}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
}
