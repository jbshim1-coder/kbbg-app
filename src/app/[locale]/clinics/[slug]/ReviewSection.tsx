"use client";

// 의료법 준수: 비포 사진 금지, 애프터(시술 후) 사진만 허용

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import Image from "next/image";

type Review = {
  id: string;
  author_name: string;
  rating: number;
  content: string;
  photos: string[] | null;
  created_at: string;
};

const SFT = "'SF Pro Text','SF Pro Icons','Helvetica Neue',Helvetica,Arial,sans-serif";

function StarRow({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          style={{
            background: "none",
            border: "none",
            cursor: onChange ? "pointer" : "default",
            fontSize: 20,
            lineHeight: 1,
            color: n <= value ? "#FF9500" : "rgba(0,0,0,0.2)",
            padding: "12px 6px",
            minWidth: 44,
            minHeight: 44,
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

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
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewsRef = useRef<string[]>([]);

  // 컴포넌트 언마운트 시 모든 blob URL 해제
  useEffect(() => {
    return () => { previewsRef.current.forEach((u) => URL.revokeObjectURL(u)); };
  }, []);

  useEffect(() => { previewsRef.current = photoPreviews; }, [photoPreviews]);

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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    const remaining = 3 - photoFiles.length;
    const toAdd = selected.slice(0, remaining);
    const newUrls = toAdd.map((f) => URL.createObjectURL(f));
    setPhotoFiles((prev) => [...prev, ...toAdd]);
    setPhotoPreviews((prev) => [...prev, ...newUrls]);
  }

  function removePhoto(idx: number) {
    URL.revokeObjectURL(photoPreviews[idx]);
    setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating || content.length < 10) return;
    setError("");
    setSubmitting(true);

    let uploadedUrls: string[] = [];

    if (photoFiles.length > 0) {
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("entityId", entityId);
        photoFiles.forEach((f) => fd.append("files", f));
        const res = await fetch("/api/reviews/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Photo upload failed"); setSubmitting(false); setUploading(false); return; }
        uploadedUrls = data.urls as string[];
      } catch {
        setError("Photo upload failed");
        setSubmitting(false);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityId, entityName, rating, content, authorName, photos: uploadedUrls }),
      });
      if (res.ok) {
        setSubmitted(true);
        setContent("");
        setRating(0);
        photoPreviews.forEach((u) => URL.revokeObjectURL(u));
        setPhotoFiles([]);
        setPhotoPreviews([]);
      } else {
        const d = await res.json();
        setError(d.error || "Submission failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  const avgRating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  return (
    <div style={{ fontFamily: SFT }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20 }}>
        <h2 style={{ fontSize: 21, fontWeight: 600, lineHeight: 1.19, color: "#1d1d1f", margin: 0 }}>
          {isKo ? "시술 후기" : "Patient Reviews"}
        </h2>
        {reviews.length > 0 && (
          <span style={{ fontSize: 14, color: "rgba(0,0,0,0.48)", letterSpacing: "-0.224px" }}>
            {avgRating} ★ · {reviews.length}{isKo ? "건" : " reviews"}
          </span>
        )}
      </div>

      {/* Review list */}
      {loading ? (
        <p style={{ fontSize: 14, color: "rgba(0,0,0,0.4)" }}>Loading...</p>
      ) : reviews.length === 0 ? (
        <p style={{ fontSize: 14, color: "rgba(0,0,0,0.4)", marginBottom: 24 }}>
          {isKo ? "아직 후기가 없습니다. 첫 번째로 작성해보세요!" : "No reviews yet. Be the first to share your experience!"}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 28 }}>
          {reviews.map((r, i) => (
            <div
              key={r.id}
              style={{
                padding: "16px 0",
                borderBottom: i < reviews.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <StarRow value={r.rating} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f" }}>{r.author_name}</span>
                <span style={{ fontSize: 12, color: "rgba(0,0,0,0.4)", marginLeft: "auto" }}>
                  {new Date(r.created_at).toLocaleDateString(isKo ? "ko-KR" : "en-US")}
                </span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.5, color: "rgba(0,0,0,0.8)", margin: 0, letterSpacing: "-0.224px" }}>
                {r.content}
              </p>
              {r.photos && r.photos.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  {r.photos.map((url, pi) => (
                    <div key={pi} style={{ position: "relative", width: 80, height: 80, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                      <Image src={url} alt={`Review photo ${pi + 1}`} fill style={{ objectFit: "cover" }} sizes="80px" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Write review */}
      {submitted ? (
        <div style={{ background: "#f5f5f7", borderRadius: 8, padding: "14px 16px" }}>
          <p style={{ fontSize: 14, color: "#1d1d1f", margin: 0 }}>
            {isKo ? "후기가 접수되었습니다. 검토 후 게시됩니다." : "Your review has been submitted and will appear after moderation."}
          </p>
        </div>
      ) : !isLoggedIn ? (
        <div style={{ background: "#f5f5f7", borderRadius: 8, padding: "14px 16px", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "rgba(0,0,0,0.6)", margin: 0 }}>
            {isKo ? "로그인 후 후기를 작성할 수 있습니다." : "Sign in to leave a review."}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f", marginBottom: 12, letterSpacing: "-0.224px" }}>
              {isKo ? "후기 작성" : "Write a Review"}
            </p>

            {/* Star rating */}
            <div style={{ marginBottom: 14 }}>
              <StarRow value={rating} onChange={setRating} />
              {rating > 0 && (
                <span style={{ fontSize: 12, color: "rgba(0,0,0,0.4)", marginTop: 4, display: "block" }}>
                  {["", isKo ? "별로예요" : "Poor", isKo ? "그저그래요" : "Fair", isKo ? "괜찮아요" : "Good", isKo ? "좋아요" : "Very Good", isKo ? "최고예요" : "Excellent"][rating]}
                </span>
              )}
            </div>

            {/* Text */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isKo ? "시술 후기를 작성해주세요 (10자 이상)" : "Share your experience (minimum 10 characters)"}
              maxLength={1000}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 8,
                border: "1.5px solid rgba(0,0,0,0.12)",
                background: "#fafafc",
                fontSize: 14,
                lineHeight: 1.5,
                color: "#1d1d1f",
                resize: "vertical",
                minHeight: 96,
                outline: "none",
                boxSizing: "border-box",
                letterSpacing: "-0.224px",
                fontFamily: SFT,
              }}
            />
            <div style={{ fontSize: 12, color: "rgba(0,0,0,0.3)", textAlign: "right", marginBottom: 14 }}>
              {content.length}/1000
            </div>

            {/* Photo upload */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "rgba(0,0,0,0.6)", marginBottom: 8, letterSpacing: "-0.224px" }}>
                {isKo ? "시술 후 사진 (선택, 최대 3장)" : "After photos (optional, max 3)"}
                <span style={{ fontSize: 11, color: "rgba(0,0,0,0.35)", marginLeft: 6 }}>
                  {isKo ? "※ 시술 전 사진은 의료법상 게시 불가" : "※ Before photos not permitted under medical law"}
                </span>
              </p>

              {photoPreviews.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  {photoPreviews.map((src, i) => (
                    <div key={i} style={{ position: "relative", width: 72, height: 72, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                      <Image src={src} alt={`preview ${i}`} fill style={{ objectFit: "cover" }} sizes="72px" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        style={{
                          position: "absolute", top: 0, right: 0,
                          background: "transparent", border: "none",
                          width: 32, height: 32, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          padding: 0,
                        }}
                      >
                        <span style={{
                          background: "rgba(0,0,0,0.6)", borderRadius: "50%",
                          width: 18, height: 18, display: "flex", alignItems: "center",
                          justifyContent: "center", color: "#fff", fontSize: 11,
                        }}>×</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {photoFiles.length < 3 && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: "#f5f5f7",
                      border: "1.5px dashed rgba(0,0,0,0.15)",
                      borderRadius: 8,
                      padding: "8px 16px",
                      fontSize: 13,
                      color: "#0066cc",
                      cursor: "pointer",
                      letterSpacing: "-0.224px",
                    }}
                  >
                    {isKo ? "+ 사진 추가" : "+ Add photo"}
                  </button>
                </>
              )}
            </div>

            {error && (
              <p style={{ fontSize: 13, color: "#d70015", marginBottom: 12 }}>{error}</p>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={!rating || content.length < 10 || submitting}
                style={{
                  background: (!rating || content.length < 10 || submitting) ? "rgba(0,0,0,0.12)" : "#0071e3",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 22px",
                  fontSize: 14,
                  letterSpacing: "-0.224px",
                  cursor: (!rating || content.length < 10 || submitting) ? "default" : "pointer",
                  fontFamily: SFT,
                }}
              >
                {uploading
                  ? (isKo ? "사진 업로드 중..." : "Uploading photos...")
                  : submitting
                  ? (isKo ? "제출 중..." : "Submitting...")
                  : (isKo ? "후기 제출" : "Submit Review")}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
