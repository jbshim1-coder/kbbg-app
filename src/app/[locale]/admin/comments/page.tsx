"use client";

// 댓글 관리 페이지 — 전체 댓글 목록 조회 및 삭제
import { useEffect, useState, useCallback } from "react";

interface Comment {
  id: string;
  content: string;
  author_id: string | null;
  post_id: string | null;
  created_at: string;
  // 게시글 제목은 별도 조회 없이 post_id만 표시
  [key: string]: unknown;
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const limit = 20;

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/comments?page=${page}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
        setTotal(data.total || 0);
      }
    } catch {
      // 조회 실패 시 빈 목록
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleDelete = async (commentId: string) => {
    if (!confirm("이 댓글을 삭제하시겠습니까?")) return;
    setDeleting(commentId);
    try {
      const res = await fetch(`/api/admin/comments?id=${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchComments();
      }
    } catch {
      alert("삭제 처리 중 오류가 발생했습니다.");
    }
    setDeleting(null);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">댓글 관리</h2>
        <span className="text-sm text-gray-500">총 {total}개</span>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <p className="text-sm text-gray-400">불러오는 중...</p>
      )}

      {/* 데이터 없음 */}
      {!loading && comments.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">
          댓글이 없습니다.
        </div>
      )}

      {/* 댓글 목록 테이블 */}
      {!loading && comments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 font-medium">작성자</th>
                <th className="px-6 py-3 font-medium">내용</th>
                <th className="px-6 py-3 font-medium">게시글 ID</th>
                <th className="px-6 py-3 font-medium">작성일</th>
                <th className="px-6 py-3 font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-600">
                    {comment.author_id
                      ? comment.author_id.slice(0, 8) + "..."
                      : "-"}
                  </td>
                  <td className="px-6 py-3 text-gray-800 max-w-xs truncate">
                    {comment.content || "-"}
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {comment.post_id
                      ? comment.post_id.slice(0, 8) + "..."
                      : "-"}
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {comment.created_at
                      ? new Date(comment.created_at).toLocaleDateString("ko-KR")
                      : "-"}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={deleting === comment.id}
                      className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {deleting === comment.id ? "삭제 중..." : "삭제"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="text-sm px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            이전
          </button>
          <span className="text-sm text-gray-500 px-3 py-1.5">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="text-sm px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
