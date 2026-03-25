"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

// 게시글 타입 정의
type Comment = { id: number; author: string; body: string; createdAt: string };
type Post = {
  id: number;
  titleKey: string;
  categoryKey: string;
  author: string;
  contentKey: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  comments: Comment[];
};

// 게시글 더미 데이터 — id를 키로 사용하는 맵 구조 (실제 API 연동 전)
const POSTS: Record<string, Post> = {
  "1": {
    id: 1,
    titleKey: "community_preview.post1_title",
    categoryKey: "community.plastic_surgery",
    author: "user_kr",
    contentKey: "community.dummy_post1_content",
    upvotes: 87,
    downvotes: 3,
    createdAt: "2025-03-22",
    comments: [
      { id: 1, author: "sarah_jp", body: "Which clinic specifically?", createdAt: "1h ago" },
      { id: 2, author: "mike_us", body: "Could you share swelling photos too!", createdAt: "30m ago" },
    ],
  },
};

// 게시글 상세 페이지 — 클라이언트 컴포넌트 (투표·댓글 상태 필요)
// Next.js 16: params는 Promise이므로 use() 훅으로 언래핑
export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations();
  // Promise params를 use()로 동기적으로 읽기
  const { id } = use(params);
  const post = POSTS[id];
  // 현재 경로에서 locale 추출 (pathname: /{locale}/community/{id})
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  // 투표 상태 — 초기값은 더미 데이터의 upvotes/downvotes
  const [upvotes, setUpvotes] = useState(post?.upvotes ?? 0);
  const [downvotes, setDownvotes] = useState(post?.downvotes ?? 0);
  // voted: null=미투표, "up"=추천, "down"=비추천
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  // 댓글 목록 상태 — 새 댓글 추가 시 로컬 업데이트
  const [comments, setComments] = useState<Comment[]>(post?.comments ?? []);
  const [newComment, setNewComment] = useState("");

  // 존재하지 않는 게시글 처리
  if (!post) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <p className="text-gray-500">{t("community.post_not_found")}</p>
        <Link href={`/${locale}/community`} className="mt-4 text-pink-500 hover:underline">
          {t("community.back_to_community")}
        </Link>
      </main>
    );
  }

  // 투표 처리 — 같은 버튼 재클릭 시 무시, 반대 투표로 전환 시 이전 값 차감
  function handleVote(type: "up" | "down") {
    if (voted === type) return;
    if (type === "up") {
      setUpvotes((v) => v + 1);
      if (voted === "down") setDownvotes((v) => v - 1);
    } else {
      setDownvotes((v) => v + 1);
      if (voted === "up") setUpvotes((v) => v - 1);
    }
    setVoted(type);
  }

  // 댓글 제출 — 빈 입력 방지 후 로컬 상태에 추가 (실제 연동 시 API 호출)
  function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments((prev) => [
      ...prev,
      { id: Date.now(), author: "me", body: newComment, createdAt: t("community.just_now") },
    ]);
    setNewComment("");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* 뒤로가기 링크 */}
        <Link href={`/${locale}/community`} className="text-sm text-gray-400 hover:text-gray-600">
          {t("community.back")}
        </Link>

        {/* 게시글 본문 카드 */}
        <article className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
            {t(post.categoryKey as Parameters<typeof t>[0])}
          </span>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">
            {t(post.titleKey as Parameters<typeof t>[0])}
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            {post.author} · {post.createdAt}
          </p>

          {/* 본문 — 줄바꿈 보존 */}
          <div className="mt-6 whitespace-pre-line leading-relaxed text-gray-700">
            {t(post.contentKey as Parameters<typeof t>[0])}
          </div>

          {/* 투표 버튼 — 선택 시 색상 강조 */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={() => handleVote("up")}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition ${
                voted === "up"
                  ? "bg-pink-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-pink-50"
              }`}
            >
              ↑ {t("community.upvote")} {upvotes}
            </button>
            <button
              onClick={() => handleVote("down")}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition ${
                voted === "down"
                  ? "bg-gray-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              ↓ {t("community.downvote")} {downvotes}
            </button>
          </div>
        </article>

        {/* 댓글 섹션 */}
        <section className="mt-6">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            {t("community.comments_count", { count: comments.length })}
          </h2>

          {/* 댓글 목록 */}
          <div className="flex flex-col gap-3">
            {comments.map((c) => (
              <div key={c.id} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">{c.author}</span>
                  <span className="text-xs text-gray-400">{c.createdAt}</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{c.body}</p>
              </div>
            ))}
          </div>

          {/* 댓글 작성 폼 */}
          <form onSubmit={handleCommentSubmit} className="mt-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t("community.comment_placeholder")}
              rows={3}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-pink-400"
            />
            <button
              type="submit"
              className="mt-2 rounded-xl bg-pink-500 px-6 py-2 text-sm font-semibold text-white hover:bg-pink-600"
            >
              {t("community.comment_submit")}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
