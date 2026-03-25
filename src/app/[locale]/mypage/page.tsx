"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

// 마이페이지 — 로그인 사용자 프로필 및 활동 이력
export default function MyPage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace(`/${locale}/login`);
        return;
      }
      setUser(data.user);
      setLoading(false);
    });
  }, [locale, router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}/`);
  };

  // 더미 데이터를 t()로 번역하여 생성
  const DUMMY_POSTS = [
    { id: 1, title: t("mypage.post1_title" as Parameters<typeof t>[0]), board: t("community.plastic_surgery" as Parameters<typeof t>[0]) },
    { id: 2, title: t("mypage.post2_title" as Parameters<typeof t>[0]), board: t("community.dermatology" as Parameters<typeof t>[0]) },
  ];

  const DUMMY_COMMENTS = [
    { id: 1, content: t("mypage.comment1" as Parameters<typeof t>[0]), postTitle: t("mypage.comment1_post" as Parameters<typeof t>[0]) },
    { id: 2, content: t("mypage.comment2" as Parameters<typeof t>[0]), postTitle: t("mypage.comment2_post" as Parameters<typeof t>[0]) },
  ];

  const DUMMY_RECOMMENDATIONS = [
    { id: 1, date: "2024-12-10", specialty: t("mypage.rec1_specialty" as Parameters<typeof t>[0]), result: t("mypage.rec1_name" as Parameters<typeof t>[0]) },
    { id: 2, date: "2024-11-22", specialty: t("mypage.rec2_specialty" as Parameters<typeof t>[0]), result: t("mypage.rec2_name" as Parameters<typeof t>[0]) },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">{t("common.loading")}</p>
      </main>
    );
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

        <h1 className="text-2xl font-bold text-gray-800">{t("mypage.title")}</h1>

        {/* 프로필 섹션 */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            {t("mypage.profile")}
          </h2>
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={displayName} className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-800">{displayName}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </section>

        {/* 내 글 목록 */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            {t("mypage.my_posts")}
          </h2>
          <ul className="space-y-2">
            {DUMMY_POSTS.map((post) => (
              <li key={post.id} className="text-sm text-gray-700 py-2 border-b border-gray-50 last:border-0">
                <span className="text-xs text-blue-400 mr-2">[{post.board}]</span>
                {post.title}
              </li>
            ))}
          </ul>
        </section>

        {/* 내 댓글 목록 */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            {t("mypage.my_comments")}
          </h2>
          <ul className="space-y-2">
            {DUMMY_COMMENTS.map((comment) => (
              <li key={comment.id} className="text-sm py-2 border-b border-gray-50 last:border-0">
                <p className="text-gray-700">{comment.content}</p>
                <p className="text-xs text-gray-400 mt-0.5">{comment.postTitle}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* AI 추천 이력 */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            {t("mypage.recommendations")}
          </h2>
          <ul className="space-y-2">
            {DUMMY_RECOMMENDATIONS.map((rec) => (
              <li key={rec.id} className="text-sm py-2 border-b border-gray-50 last:border-0 flex justify-between">
                <span className="text-gray-700">{rec.result} <span className="text-gray-400">({rec.specialty})</span></span>
                <span className="text-xs text-gray-400">{rec.date}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 계정 설정 */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            {t("mypage.settings")}
          </h2>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
          >
            {t("mypage.logout")}
          </button>
        </section>

      </div>
    </main>
  );
}
