"use client";

// 게시글 관리 페이지 — Supabase posts 테이블 연동 (non-locale 버전)
// [locale]/admin/posts/page.tsx와 동일한 구현

import { useEffect, useState, useCallback } from "react";

type PostStatus = "active" | "hidden" | "deleted" | "pinned";

interface PostRow {
  id: string;
  title: string;
  title_en: string | null;
  author_id: string | null;
  board_id: string | null;
  view_count: number;
  comment_count: number;
  upvotes: number;
  downvotes: number;
  is_pinned: boolean;
  is_deleted: boolean;
  created_at: string;
}

const statusStyles: Record<PostStatus, string> = {
  active: "bg-green-100 text-green-700",
  hidden: "bg-yellow-100 text-yellow-700",
  deleted: "bg-red-100 text-red-600",
  pinned: "bg-blue-100 text-blue-700",
};

const statusLabels: Record<PostStatus, string> = {
  active: "게시중",
  hidden: "숨김",
  deleted: "삭제됨",
  pinned: "고정",
};

function getPostStatus(post: PostRow): PostStatus {
  if (post.is_deleted) return "deleted";
  if (post.is_pinned) return "pinned";
  return "active";
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [acting, setActing] = useState<string | null>(null);
  const limit = 20;

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filter !== "all") params.set("status", filter);
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/posts?${params}`);
    if (res.ok) {
      const data = await res.json();
      setPosts(data.posts || []);
      setTotal(data.total || 0);
    }
    setLoading(false);
  }, [page, filter, search]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  async function handleAction(postId: string, action: string) {
    setActing(postId);
    const res = await fetch("/api/admin/posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, action }),
    });
    if (res.ok) await fetchPosts();
    setActing(null);
  }

  function handleSearch() { setPage(1); setSearch(searchInput); }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">게시글 관리</h2>
        <span className="text-sm text-gray-500">총 {total}개</span>
      </div>

      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="제목 검색..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-56 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
          <button onClick={handleSearch} className="text-sm px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors">검색</button>
        </div>
        <div className="flex gap-1.5">
          {(["all", "active", "pinned", "deleted"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${filter === f ? "bg-slate-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {f === "all" ? "전체" : f === "active" ? "게시중" : f === "pinned" ? "고정" : "삭제됨"}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-sm text-gray-400">불러오는 중...</p>}

      {!loading && posts.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">게시글이 없습니다.</div>
      )}

      {!loading && posts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 font-medium">제목</th>
                <th className="px-6 py-3 font-medium">조회</th>
                <th className="px-6 py-3 font-medium">댓글</th>
                <th className="px-6 py-3 font-medium">추천</th>
                <th className="px-6 py-3 font-medium">상태</th>
                <th className="px-6 py-3 font-medium">날짜</th>
                <th className="px-6 py-3 font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const status = getPostStatus(post);
                return (
                  <tr key={post.id} className={`border-b border-gray-50 hover:bg-gray-50 ${post.is_deleted ? "bg-red-50/30" : ""}`}>
                    <td className="px-6 py-3 text-gray-800 max-w-xs truncate">{post.title}</td>
                    <td className="px-6 py-3 text-gray-600">{post.view_count}</td>
                    <td className="px-6 py-3 text-gray-600">{post.comment_count}</td>
                    <td className="px-6 py-3 text-gray-600">{post.upvotes}</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyles[status]}`}>{statusLabels[status]}</span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{new Date(post.created_at).toLocaleDateString("ko-KR")}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        {post.is_deleted ? (
                          <button onClick={() => handleAction(post.id, "unhide")} disabled={acting === post.id} className="text-xs px-2 py-1 bg-slate-50 text-slate-700 rounded hover:bg-blue-100 transition-colors disabled:opacity-50">복원</button>
                        ) : (
                          <>
                            <button onClick={() => handleAction(post.id, post.is_pinned ? "unpin" : "pin")} disabled={acting === post.id} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors disabled:opacity-50">{post.is_pinned ? "고정해제" : "고정"}</button>
                            <button onClick={() => handleAction(post.id, "hide")} disabled={acting === post.id} className="text-xs px-2 py-1 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition-colors disabled:opacity-50">숨김</button>
                            <button onClick={() => handleAction(post.id, "delete")} disabled={acting === post.id} className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors disabled:opacity-50">삭제</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="text-sm px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors">이전</button>
          <span className="text-sm text-gray-500 px-3 py-1.5">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="text-sm px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors">다음</button>
        </div>
      )}
    </div>
  );
}
