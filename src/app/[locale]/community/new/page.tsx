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

type PostType = "text" | "image" | "link";
import type { FlairType } from "@/lib/community-utils";

const FLAIR_OPTIONS: { value: FlairType; labelKey: string }[] = [
  { value: "review",       labelKey: "ui.flair_review" },
  { value: "question",     labelKey: "ui.flair_question" },
  { value: "info",         labelKey: "ui.flair_info" },
  { value: "before_after", labelKey: "ui.flair_before_after" },
  { value: "cost",         labelKey: "ui.flair_cost" },
  { value: "recommend",    labelKey: "ui.flair_recommend" },
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
  const [flair, setFlair] = useState<FlairType | "">("");
  const [postType, setPostType] = useState<PostType>("text");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  // 제출 중 상태 — 중복 제출 방지
  const [submitting, setSubmitting] = useState(false);
  const [recaptchaError, setRecaptchaError] = useState("");
  const [submitError, setSubmitError] = useState("");
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

  // 폼 제출 처리 — Supabase posts 테이블에 insert
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
      setRecaptchaError(t("community.captcha_failed"));
      return;
    }

    setSubmitting(true);
    setRecaptchaError("");
    setSubmitError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/${locale}/signup`);
      return;
    }

    // Supabase posts insert
    // board_id: NOT NULL FK이므로 boards 테이블에서 slug로 매핑 시도
    // boards 테이블이 비어있거나 매핑 실패 시 에러 처리
    const slug = categoryKey.replace("community.", "").replace("_", "-");
    const { data: boardData } = await supabase
      .from("boards")
      .select("id")
      .eq("slug", slug)
      .single();

    const boardId = (boardData as { id: string } | null)?.id ?? null;

    if (!boardId) {
      // board_id 없이는 insert 불가 (NOT NULL 제약) — 사용자에게 알림 후 커뮤니티로 이동
      setSubmitError(
        locale === "ko"
          ? "게시판 설정이 아직 완료되지 않았습니다. 잠시 후 다시 시도해주세요."
          : "Board configuration is not complete yet. Please try again later."
      );
      setSubmitting(false);
      return;
    }

    // 영문 제목 자동 번역 (영어가 아닌 경우만)
    let titleEn: string | null = null;
    try {
      const { detectLanguage } = await import("@/lib/detect-language");
      const { lang } = detectLanguage(title);
      if (lang !== "en") {
        const trRes = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: title, targetLocale: "en" }),
        });
        const trData = await trRes.json();
        if (trData.translated) titleEn = trData.translated;
      } else {
        titleEn = title;
      }
    } catch {
      // 번역 실패 시 null 유지
    }

    const { data: insertedPost, error } = await supabase
      .from("posts")
      .insert({
        board_id: boardId,
        author_id: user.id,
        title,
        title_en: titleEn,
        content: body,
        images: imageUrls.length > 0 ? imageUrls : null,
        flair: flair || null,
        post_type: postType,
        link_url: postType === "link" ? linkUrl || null : postType === "image" ? imageUrl || null : null,
      } as never)
      .select("id")
      .single();

    if (error) {
      setSubmitError(t("community.post_failed"));
      setSubmitting(false);
      return;
    }

    markPosted("post");

    // 성공 시 새 게시글 상세 페이지로 이동
    const newPostId = (insertedPost as { id: string } | null)?.id;
    if (newPostId) {
      router.push(`/${locale}/community/${newPostId}`);
    } else {
      router.push(`/${locale}/community`);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900">{t("community.write_title")}</h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          {/* 카테고리 선택 — 드롭다운 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("community.category_label")} <span className="text-slate-700">{t("community.required_marker")}</span>
            </label>
            <select
              value={categoryKey}
              onChange={(e) => setCategoryKey(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-teal-400 bg-white"
            >
              <option value="">{t("community.select_category")}</option>
              {CATEGORY_KEYS.map((catKey) => (
                <option key={catKey} value={catKey}>
                  {t(catKey as Parameters<typeof t>[0])}
                </option>
              ))}
            </select>
          </div>

          {/* 게시 유형 선택 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("community.post_type_label")}
            </label>
            <div className="flex gap-2">
              {(["text", "image", "link"] as PostType[]).map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => setPostType(pt)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    postType === pt
                      ? "bg-slate-800 text-white border-slate-600"
                      : "bg-white text-gray-600 border-stone-200 hover:border-slate-300"
                  }`}
                >
                  {pt === "text"  ? `📝 ${t("community.type_text")}` :
                   pt === "image" ? `🖼️ ${t("community.type_image")}` :
                                    `🔗 ${t("community.type_link")}`}
                </button>
              ))}
            </div>
          </div>

          {/* Flair 선택 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("community.flair_label")}
            </label>
            <select
              value={flair}
              onChange={(e) => setFlair(e.target.value as FlairType | "")}
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-teal-400 bg-white"
            >
              <option value="">{t("community.no_flair")}</option>
              {FLAIR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.labelKey as Parameters<typeof t>[0])}
                </option>
              ))}
            </select>
          </div>

          {/* 이미지 URL 입력 (image 타입) */}
          {postType === "image" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t("community.image_url")}
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-teal-400"
              />
            </div>
          )}

          {/* 링크 URL 입력 (link 타입) */}
          {postType === "link" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t("community.link_url")}
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-teal-400"
              />
            </div>
          )}

          {/* 제목 입력 — 최대 100자 제한 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("community.post_title")} <span className="text-slate-700">{t("community.required_marker")}</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("community.title_placeholder")}
              maxLength={100}
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-teal-400"
            />
            {/* 글자 수 카운터 */}
            <p className="mt-1 text-right text-xs text-gray-400">{title.length}/100</p>
          </div>

          {/* 본문 에디터 — textarea 기반 (리치에디터는 추후 연동) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("community.post_content")} <span className="text-slate-700">{t("community.required_marker")}</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t("community.content_placeholder")}
              rows={10}
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-teal-400"
            />
          </div>

          {/* 이미지 업로드 — Cloudinary 연동 (최대 3장, 각 5MB 이하) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("community.image_optional")}
            </label>
            <ImageUpload onUploadComplete={(urls) => setImageUrls(urls)} locale={locale} />
          </div>

          {/* reCAPTCHA / 제출 에러 메시지 */}
          {recaptchaError && <p className="text-sm text-red-500 text-center">{recaptchaError}</p>}
          {submitError && <p className="text-sm text-red-500 text-center bg-red-50 rounded-xl px-4 py-3">{submitError}</p>}

          {/* 취소 / 게시 버튼 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-xl border border-stone-300 py-3 text-sm font-semibold text-gray-700 hover:bg-stone-50"
            >
              {t("community.cancel")}
            </button>
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="flex-1 rounded-xl bg-slate-800 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 hover:bg-slate-900"
            >
              {submitting ? t("community.publishing") : t("community.publish")}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
