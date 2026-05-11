"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

type Review = {
  id: string;
  author_name: string;
  rating: number;
  content: string;
  created_at: string;
};

export default function ReviewSection({
  entityId,
  entityName,
  locale,
}: {
  entityId: string;
  entityName: string;
  locale: string;
}) {
  const isKo = locale === "ko";
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authorName, setAuthorName] = useState("");

  useEffect(() => {
    fetch(`/api/reviews?entityId=${encodeURIComponent(entityId)}`)
      .then((r) => r.json())
      .then(({ reviews: data }) => setReviews(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setIsLoggedIn(true);
        setAuthorName(data.user.email?.split("@")[0] || "");
      }
    });
  }, [entityId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating || content.length < 10) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityId, entityName, rating, content, authorName }),
      });
      if (res.ok) {
        setSubmitted(true);
        setContent("");
        setRating(0);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
      <h2 className="text-base font-bold text-gray-900 mb-4">
        {isKo ? "방문 후기" : "Patient Reviews"}
        {reviews.length > 0 && (
          <span className="ml-2 text-xs font-normal text-gray-400">({reviews.length})</span>
        )}
      </h2>

      {loading ? (
        <p className="text-xs text-gray-400">{isKo ? "로딩 중..." : "Loading..."}</p>
      ) : reviews.length > 0 ? (
        <div className="space-y-3 mb-6">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-stone-50 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-yellow-500 text-xs leading-none">
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </span>
                <span className="text-xs font-medium text-gray-600">{r.author_name}</span>
                <span className="text-xs text-gray-300">
                  {new Date(r.created_at).toLocaleDateString(isKo ? "ko-KR" : "en-US")}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{r.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 mb-6">
          {isKo
            ? "아직 후기가 없습니다. 첫 번째로 작성해보세요!"
            : "No reviews yet. Be the first to share your experience!"}
        </p>
      )}

      {submitted ? (
        <p className="text-xs text-green-700 bg-green-50 rounded-xl px-4 py-3">
          {isKo
            ? "후기가 접수되었습니다. 검토 후 게시됩니다."
            : "Your review has been submitted and will be posted after moderation."}
        </p>
      ) : !isLoggedIn ? (
        <p className="text-xs text-gray-400 bg-stone-50 rounded-xl px-4 py-3 text-center">
          {isKo ? "로그인 후 후기를 작성할 수 있습니다." : "Sign in to leave a review."}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`text-xl transition-colors leading-none ${
                  n <= rating ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"
                }`}
              >
                ★
              </button>
            ))}
            <span className="text-xs text-gray-400 ml-2">
              {rating > 0 ? `${rating}/5` : isKo ? "별점 선택" : "Select rating"}
            </span>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              isKo
                ? "클리닉 방문 후기를 작성해주세요 (10자 이상)"
                : "Share your clinic experience (minimum 10 characters)"
            }
            className="w-full text-xs border border-stone-200 rounded-xl px-3 py-2.5 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-100"
            maxLength={1000}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">{content.length}/1000</span>
            <button
              type="submit"
              disabled={!rating || content.length < 10 || submitting}
              className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-full disabled:opacity-40 hover:bg-gray-700 transition-colors"
            >
              {submitting
                ? isKo ? "제출 중..." : "Submitting..."
                : isKo ? "후기 작성" : "Submit Review"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
