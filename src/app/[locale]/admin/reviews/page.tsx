"use client";

import { useState, useEffect } from "react";

type Review = {
  id: string;
  entity_id: string;
  entity_name: string;
  author_name: string;
  rating: number;
  content: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const qs = filter === "all" ? "" : `?status=${filter}`;
    fetch(`/api/admin/reviews${qs}`)
      .then((r) => r.json())
      .then(({ reviews: data }) => setReviews(data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [filter]);

  async function updateStatus(id: string, status: "approved" | "rejected") {
    setUpdating(id);
    await fetch("/api/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setUpdating(null);
  }

  const tabs: { key: typeof filter; label: string }[] = [
    { key: "pending", label: "대기 중" },
    { key: "approved", label: "승인됨" },
    { key: "rejected", label: "거부됨" },
    { key: "all", label: "전체" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">리뷰 관리</h1>
        <p className="text-sm text-gray-500 mt-1">클리닉 방문 후기 승인/거부</p>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">로딩 중...</p>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
          <p className="text-sm text-gray-400">리뷰가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-yellow-500 text-sm">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                    <span className="text-sm font-medium text-gray-800">{review.author_name}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleString("ko-KR")}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      review.status === "pending" ? "bg-yellow-50 text-yellow-700" :
                      review.status === "approved" ? "bg-green-50 text-green-700" :
                      "bg-red-50 text-red-700"
                    }`}>
                      {review.status === "pending" ? "대기" : review.status === "approved" ? "승인" : "거부"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">
                    대상: <span className="text-gray-600">{review.entity_name}</span>
                    <span className="ml-1 text-gray-300">({review.entity_id})</span>
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.content}</p>
                </div>

                {review.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => updateStatus(review.id, "approved")}
                      disabled={updating === review.id}
                      className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      승인
                    </button>
                    <button
                      onClick={() => updateStatus(review.id, "rejected")}
                      disabled={updating === review.id}
                      className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                      거부
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
