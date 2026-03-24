"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

// 선택 가능한 카테고리 키 목록
const CATEGORY_KEYS = ["community.plastic_surgery", "community.dermatology", "community.dental", "community.general"];

// 새 게시글 작성 페이지 — 카테고리·제목·본문·이미지 첨부
export default function NewPostPage() {
  const router = useRouter();
  const t = useTranslations();

  // 폼 필드 상태
  const [categoryKey, setCategoryKey] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  // 제출 중 상태 — 중복 제출 방지
  const [submitting, setSubmitting] = useState(false);

  // 필수 필드 모두 채워진 경우에만 제출 버튼 활성화
  const isValid = categoryKey && title.trim() && body.trim();

  // 폼 제출 처리 — 실제 API 연동 전 더미 딜레이 후 커뮤니티로 이동
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    // TODO: Supabase insert API 호출 후 리다이렉트
    setTimeout(() => {
      router.push("/community");
    }, 800);
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900">{t("community.write_title")}</h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          {/* 카테고리 선택 — 토글 버튼 방식 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("community.category_label")} <span className="text-pink-500">{t("community.required_marker")}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_KEYS.map((catKey) => (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setCategoryKey(catKey)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    categoryKey === catKey
                      ? "bg-pink-500 text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-pink-300"
                  }`}
                >
                  {t(catKey as Parameters<typeof t>[0])}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 입력 — 최대 100자 제한 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("community.post_title")} <span className="text-pink-500">{t("community.required_marker")}</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("community.title_placeholder")}
              maxLength={100}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-400"
            />
            {/* 글자 수 카운터 */}
            <p className="mt-1 text-right text-xs text-gray-400">{title.length}/100</p>
          </div>

          {/* 본문 에디터 — textarea 기반 (리치에디터는 추후 연동) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("community.post_content")} <span className="text-pink-500">{t("community.required_marker")}</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t("community.content_placeholder")}
              rows={10}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-400"
            />
          </div>

          {/* 이미지 업로드 — 숨겨진 input을 레이블로 트리거 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("community.image_optional")}
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 px-4 py-4 text-sm text-gray-500 hover:border-pink-300 hover:bg-pink-50">
              <span>📎</span>
              <span>{imageFile ? imageFile.name : t("community.image_placeholder")}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {/* 취소 / 게시 버튼 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              {t("community.cancel")}
            </button>
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="flex-1 rounded-xl bg-pink-500 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-pink-200 hover:bg-pink-600"
            >
              {submitting ? t("community.publishing") : t("community.publish")}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
