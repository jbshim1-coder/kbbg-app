"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import LevelBadge from "@/components/LevelBadge";
import { createClient } from "@/lib/supabase";
import { isMaster } from "@/lib/level-system";
import { checkCommentSpam, markPosted } from "@/lib/spam-guard";
import { getDummyPost, type DummyComment } from "../data/posts";

// Supabase comments 테이블 행 타입
type DbComment = {
  id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  upvotes: number;
  created_at: string;
};

// 화면 표시용 통합 댓글 타입
type DisplayComment = {
  id: string | number;
  author: string;
  level: number;
  body: string;
  createdAt: string;
  parentId?: string | number | null;
  isDb?: boolean; // Supabase에서 온 댓글 여부
};

function formatRelativeTime(isoString: string, isKo: boolean): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return isKo ? "방금" : "just now";
  if (minutes < 60) return isKo ? `${minutes}분 전` : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return isKo ? `${hours}시간 전` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return isKo ? `${days}일 전` : `${days}d ago`;
}

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations();
  const { id } = use(params);
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const isKo = locale === "ko";

  const post = getDummyPost(id);

  const [upvotes, setUpvotes] = useState(post?.upvotes ?? 0);
  const [downvotes, setDownvotes] = useState(post?.downvotes ?? 0);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [postDeleted, setPostDeleted] = useState(false);
  const [master, setMaster] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 댓글: 더미 + Supabase 병합
  const [comments, setComments] = useState<DisplayComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState("");

  // 북마크
  const [bookmarked, setBookmarked] = useState(false);

  // 번역 (제목)
  const [titleTranslation, setTitleTranslation] = useState("");
  const [translating, setTranslating] = useState(false);

  // 로그인 상태 및 Supabase 댓글 로드
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
      setCurrentUserId(data.user?.id ?? null);
      if (data.user?.email && isMaster(data.user.email)) setMaster(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
      setCurrentUserId(session?.user?.id ?? null);
      setMaster(!!(session?.user?.email && isMaster(session.user.email)));
    });

    return () => subscription.unsubscribe();
  }, []);

  // 더미 댓글 초기화 + Supabase 댓글 로드
  useEffect(() => {
    if (!post) return;

    // 더미 댓글 변환
    const dummyDisplayComments: DisplayComment[] = post.comments.map((c: DummyComment) => ({
      id: c.id,
      author: c.author,
      level: c.level,
      body: isKo ? c.body : c.body, // 더미 데이터는 한국어만 있음
      createdAt: c.createdAt,
      parentId: c.parentId ?? null,
      isDb: false,
    }));

    setComments(dummyDisplayComments);

    // Supabase에서 실제 댓글 추가 로드 (실패해도 더미 유지)
    const supabase = createClient();
    supabase
      .from("comments")
      .select("id, author_id, parent_id, content, upvotes, created_at")
      .eq("post_id", id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        const dbComments: DisplayComment[] = (data as DbComment[]).map((c) => ({
          id: c.id,
          author: c.author_id.slice(0, 8), // uuid 앞 8자리로 표시
          level: 1,
          body: c.content,
          createdAt: formatRelativeTime(c.created_at, isKo),
          parentId: c.parent_id,
          isDb: true,
        }));
        setComments((prev) => [...prev, ...dbComments]);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, post]);

  // 북마크 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kbbg_bookmarks");
      if (saved) {
        const arr: number[] = JSON.parse(saved);
        setBookmarked(arr.includes(Number(id)));
      }
    } catch {
      // localStorage 접근 실패 시 무시
    }
  }, [id]);

  if (!post || postDeleted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <p className="text-gray-500">{t("community.post_not_found")}</p>
        <Link href={`/${locale}/community`} className="mt-4 text-teal-600 hover:underline">
          {t("community.back_to_community")}
        </Link>
      </main>
    );
  }

  const title = isKo ? post.title : post.titleEn;
  const content = isKo ? post.content : post.contentEn;

  // 투표 처리
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

  // 북마크 토글
  function handleBookmark() {
    try {
      const saved = localStorage.getItem("kbbg_bookmarks");
      const arr: number[] = saved ? JSON.parse(saved) : [];
      const postNum = Number(id);
      const next = bookmarked
        ? arr.filter((x) => x !== postNum)
        : [...arr, postNum];
      localStorage.setItem("kbbg_bookmarks", JSON.stringify(next));
      setBookmarked(!bookmarked);
    } catch {
      // localStorage 접근 실패 시 무시
    }
  }

  // 공유 처리
  function handleShare() {
    if (navigator.share) {
      navigator.share({ title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
      alert(isKo ? "링크가 복사되었습니다" : "Link copied to clipboard");
    }
  }

  // 제목 번역
  async function handleTranslate() {
    if (titleTranslation) {
      setTitleTranslation("");
      return;
    }
    setTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: title, targetLocale: locale }),
      });
      const data = await res.json();
      setTitleTranslation(data.translated || title);
    } catch {
      setTitleTranslation(title);
    } finally {
      setTranslating(false);
    }
  }

  // 댓글 제출 — Supabase insert 시도, 실패 시 로컬 추가
  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    const spamResult = checkCommentSpam(newComment, locale);
    if (spamResult.isSpam) {
      setCommentError(spamResult.reason);
      return;
    }

    setSubmittingComment(true);
    setCommentError("");

    const supabase = createClient();

    // Supabase insert 시도
    if (currentUserId) {
      // post_id는 실제 uuid여야 하므로 더미 게시글은 insert 실패 가능
      // RLS/FK 실패 시 로컬 댓글로 폴백
      const { error } = await supabase.from("comments").insert({
        post_id: id, // 더미 게시글은 실제 uuid가 아니므로 실패 예상
        author_id: currentUserId,
        content: newComment,
      } as never);

      if (!error) {
        // Supabase 성공 시 목록에 추가
        setComments((prev) => [
          ...prev,
          {
            id: Date.now(),
            author: currentUserId.slice(0, 8),
            level: 1,
            body: newComment,
            createdAt: isKo ? "방금" : "just now",
            isDb: true,
          },
        ]);
        markPosted("comment");
        setNewComment("");
        setSubmittingComment(false);
        return;
      }
    }

    // 로컬 폴백 (비로그인이거나 Supabase insert 실패)
    setComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        author: isKo ? "나" : "me",
        level: 0,
        body: newComment,
        createdAt: isKo ? "방금" : "just now",
      },
    ]);
    markPosted("comment");
    setNewComment("");
    setSubmittingComment(false);
  }

  // 댓글 삭제 (마스터 전용)
  function handleDeleteComment(commentId: string | number) {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  // 최상위 댓글과 대댓글 분리
  const topComments = comments.filter((c) => !c.parentId);
  const replies = (parentId: string | number) =>
    comments.filter((c) => c.parentId === parentId);

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* 뒤로가기 */}
        <Link
          href={`/${locale}/community`}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          {t("community.back")}
        </Link>

        {/* 게시글 본문 카드 */}
        <article className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
          {/* 카테고리 뱃지 */}
          <span className="inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-600">
            {t(post.categoryKey as Parameters<typeof t>[0])}
          </span>

          {/* 제목 */}
          <h1 className="mt-3 text-xl font-bold text-gray-900 sm:text-2xl leading-snug">
            {title}
          </h1>

          {/* 번역된 제목 */}
          {translating && (
            <p className="mt-1 text-sm text-gray-400 italic">
              {isKo ? "번역 중..." : "Translating..."}
            </p>
          )}
          {titleTranslation && !translating && (
            <p className="mt-1 text-sm text-blue-600 bg-blue-50 rounded-lg px-3 py-1.5">
              {titleTranslation}
            </p>
          )}

          {/* 작성자 정보 */}
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
            <LevelBadge level={post.level} size="sm" />
            <span className="font-medium text-gray-600">{post.author}</span>
            <span>·</span>
            <span>{post.time}</span>
          </div>

          {/* 본문 */}
          <div className="mt-6 whitespace-pre-line leading-relaxed text-gray-700 text-sm">
            {content}
          </div>

          {/* 투표 + 액션 버튼 */}
          <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-5">
            {/* Upvote */}
            <button
              onClick={() => handleVote("up")}
              className={`flex items-center gap-1.5 rounded-xl px-4 min-h-[44px] text-sm font-medium transition ${
                voted === "up"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-600"
              }`}
            >
              ↑ {upvotes}
            </button>

            {/* Downvote */}
            <button
              onClick={() => handleVote("down")}
              className={`flex items-center gap-1.5 rounded-xl px-4 min-h-[44px] text-sm font-medium transition ${
                voted === "down"
                  ? "bg-stone-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              ↓ {downvotes}
            </button>

            {/* 댓글 수 */}
            <span className="flex items-center gap-1 text-xs text-gray-400 px-2 min-h-[44px]">
              💬 {comments.length}
            </span>

            {/* 북마크 */}
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-1 rounded-xl px-3 min-h-[44px] text-sm transition ${
                bookmarked ? "text-rose-500" : "text-gray-400 hover:text-rose-400"
              }`}
              title={isKo ? (bookmarked ? "저장 취소" : "저장") : (bookmarked ? "Unsave" : "Save")}
            >
              {bookmarked ? "🔖" : "📌"}
              <span className="text-xs">{isKo ? "저장" : "Save"}</span>
            </button>

            {/* 공유 */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1 rounded-xl px-3 min-h-[44px] text-sm text-gray-400 hover:text-gray-600 transition"
            >
              🔗 <span className="text-xs">{isKo ? "공유" : "Share"}</span>
            </button>

            {/* 번역 */}
            <button
              onClick={handleTranslate}
              className="flex items-center gap-1 rounded-xl px-3 min-h-[44px] text-sm text-gray-400 hover:text-blue-500 transition"
            >
              🌐 <span className="text-xs">
                {titleTranslation
                  ? (isKo ? "번역 숨기기" : "Hide")
                  : (isKo ? "번역" : "Translate")}
              </span>
            </button>
          </div>

          {/* 마스터 전용 삭제 버튼 */}
          {master && (
            <div className="mt-3 border-t border-stone-100 pt-3">
              <button
                onClick={() => setPostDeleted(true)}
                className="text-xs px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors min-h-[44px]"
              >
                {t("community.delete")}
              </button>
            </div>
          )}
        </article>

        {/* 구분선 */}
        <hr className="my-6 border-stone-200" />

        {/* 댓글 섹션 */}
        <section>
          <h2 className="mb-4 text-base font-bold text-gray-900">
            {t("community.comments_count", { count: comments.length })}
          </h2>

          {/* 댓글 입력창 — 상단 배치 (Reddit 스타일) */}
          {loggedIn === false ? (
            <div className="mb-5 text-center py-4 bg-white rounded-xl border border-stone-100 shadow-sm">
              <p className="text-sm text-gray-500 mb-2">
                {isKo ? "댓글을 작성하려면 로그인이 필요합니다" : "Login required to write comments"}
              </p>
              <Link
                href={`/${locale}/signup`}
                className="inline-flex items-center justify-center px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition min-h-[44px] mx-auto"
              >
                {isKo ? "로그인 / 회원가입" : "Login / Sign Up"}
              </Link>
            </div>
          ) : loggedIn === true ? (
            <form onSubmit={handleCommentSubmit} className="mb-5">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t("community.comment_placeholder")}
                rows={3}
                className="w-full rounded-xl border border-stone-200 p-3 text-sm outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-200 resize-none"
              />
              {commentError && (
                <p className="mt-1 text-xs text-red-500">{commentError}</p>
              )}
              <button
                type="submit"
                disabled={!newComment.trim() || submittingComment}
                className="mt-2 rounded-xl bg-teal-600 px-6 min-h-[44px] text-sm font-semibold text-white hover:bg-teal-700 disabled:bg-teal-300 disabled:cursor-not-allowed transition"
              >
                {submittingComment
                  ? (isKo ? "등록 중..." : "Posting...")
                  : t("community.comment_submit")}
              </button>
            </form>
          ) : null}

          {/* 댓글 목록 */}
          <div className="flex flex-col gap-3">
            {topComments.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-8">
                {isKo ? "아직 댓글이 없습니다. 첫 댓글을 남겨보세요!" : "No comments yet. Be the first to comment!"}
              </p>
            )}

            {topComments.map((c) => (
              <div key={c.id}>
                {/* 최상위 댓글 */}
                <div className="rounded-xl bg-white p-4 shadow-sm border border-stone-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                      <LevelBadge level={c.level} size="sm" />
                      {c.author}
                    </span>
                    <span className="text-xs text-gray-400">{c.createdAt}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{c.body}</p>

                  {master && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="mt-2 text-xs px-2.5 py-1 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      {t("community.delete")}
                    </button>
                  )}
                </div>

                {/* 대댓글 목록 — 들여쓰기 */}
                {replies(c.id).map((reply) => (
                  <div
                    key={reply.id}
                    className="ml-4 sm:ml-6 mt-2 rounded-xl bg-stone-50 p-3.5 border border-stone-100"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                        <span className="text-stone-300 mr-0.5">↳</span>
                        <LevelBadge level={reply.level} size="sm" />
                        {reply.author}
                      </span>
                      <span className="text-xs text-gray-400">{reply.createdAt}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{reply.body}</p>

                    {master && (
                      <button
                        onClick={() => handleDeleteComment(reply.id)}
                        className="mt-1.5 text-xs px-2 py-0.5 bg-red-50 text-red-400 rounded hover:bg-red-100 transition-colors"
                      >
                        {t("community.delete")}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
