"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import ImageUpload from "@/components/ImageUpload";
import { useRecaptcha } from "@/lib/useRecaptcha";
import { createClient } from "@/lib/supabase";
import { checkSpam, markPosted } from "@/lib/spam-guard";

// 선택 가능한 카테고리 키 목록 — 커뮤니티 전체 카테고리와 동일
const CATEGORY_KEYS = [
  "community.plastic_surgery",
  "community.dermatology",
  "community.dental",
  "community.general",
  "community.kpop",
  "community.kfood",
  "community.kdrama",
  "community.kfashion",
  "community.travel",
  "community.korean_learn",
];

// 새 게시글 작성 페이지 — 카테고리·제목·본문·이미지 첨부
export default function NewPostPage() {
  const router = useRouter();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  // 비회원 접근 차단 — 로그인 확인 중 로딩 표시
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push(`/${locale}/signup`);
      } else {
        setChecking(false);
      }
    });
  }, [locale, router]);

  // 폼 필드 상태
  const [categoryKey, setCategoryKey] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  // 제출 중 상태 — 중복 제출 방지
  const [submitting, setSubmitting] = useState(false);
  const [recaptchaError, setRecaptchaError] = useState("");
  const { verifyRecaptcha } = useRecaptcha();

  // 로그인 확인 중 로딩 스피너
  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
      </main>
    );
  }

  // 필수 필드 모두 채워진 경우에만 제출 버튼 활성화
  const isValid = categoryKey && title.trim() && body.trim();

  // 폼 제출 처리 — 실제 API 연동 전 더미 딜레이 후 커뮤니티로 이동
  // imageUrls는 Supabase insert 시 함께 전달 예정
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    // 스팸 체크
    const spamResult = checkSpam(title, body, locale);
    if (spamResult.isSpam) {
      setRecaptchaError(spamResult.reason);
      return;
    }

    const isHuman = await verifyRecaptcha("community_post");
    if (!isHuman) {
      setRecaptchaError(locale === "ko" ? "보안 검증에 실패했습니다. 다시 시도해주세요." : "Security verification failed. Please try again.");
      return;
    }

    setSubmitting(true);
    setRecaptchaError("");
    // TODO: Supabase insert 시 { categoryKey, title, body, images: imageUrls } 전달
    void imageUrls;
    markPosted("post");
    setTimeout(() => {
      router.push(`/${locale}/community`);
    }, 800);
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900">{t("community.write_title")}</h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          {/* 카테고리 선택 — 드롭다운 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("community.category_label")} <span className="text-teal-600">{t("community.required_marker")}</span>
            </label>
            <select
              value={categoryKey}
              onChange={(e) => setCategoryKey(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-400 bg-white"
            >
              <option value="">{locale === "ko" ? "카테고리를 선택하세요" : "Select a category"}</option>
              {CATEGORY_KEYS.map((catKey) => (
                <option key={catKey} value={catKey}>
                  {t(catKey as Parameters<typeof t>[0])}
                </option>
              ))}
            </select>
          </div>

          {/* 제목 입력 — 최대 100자 제한 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("community.post_title")} <span className="text-teal-600">{t("community.required_marker")}</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("community.title_placeholder")}
              maxLength={100}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-400"
            />
            {/* 글자 수 카운터 */}
            <p className="mt-1 text-right text-xs text-gray-400">{title.length}/100</p>
          </div>

          {/* 본문 에디터 — textarea 기반 (리치에디터는 추후 연동) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("community.post_content")} <span className="text-teal-600">{t("community.required_marker")}</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t("community.content_placeholder")}
              rows={10}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-400"
            />
          </div>

          {/* 이미지 업로드 — Cloudinary 연동 (최대 3장, 각 5MB 이하) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("community.image_optional")}
            </label>
            <ImageUpload onUploadComplete={(urls) => setImageUrls(urls)} />
          </div>

          {/* reCAPTCHA 에러 메시지 */}
          {recaptchaError && <p className="text-sm text-red-500 text-center">{recaptchaError}</p>}

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
              className="flex-1 rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-teal-300 hover:bg-teal-700"
            >
              {submitting ? t("community.publishing") : t("community.publish")}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
