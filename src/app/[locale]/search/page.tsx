"use client";

import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { seedClinics } from "@/data/seed-clinics";
import { seedPosts } from "@/data/seed-posts";
import { seedFaqs } from "@/data/seed-faqs";

// 검색 결과 페이지 — URL ?q= 파라미터 기반으로 데이터 필터링
export default function SearchPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const q = query.toLowerCase();

  // 병원 검색 — name, nameEn, description, popularProcedures 포함 여부
  const clinicResults = q
    ? seedClinics.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.nameEn.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.popularProcedures.some((p) => p.toLowerCase().includes(q))
      )
    : [];

  // 커뮤니티 글 검색 — title, content 포함 여부
  const postResults = q
    ? seedPosts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q)
      )
    : [];

  // FAQ 검색 — question, answer 포함 여부
  const faqResults = q
    ? seedFaqs.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q)
      )
    : [];

  const totalCount = clinicResults.length + postResults.length + faqResults.length;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* 제목 + 검색어 */}
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          {t("search.title")}
        </h1>
        {query && (
          <p className="text-sm text-gray-500 mb-6">
            &ldquo;{query}&rdquo; — {t("search.results", { count: totalCount })}
          </p>
        )}

        {/* 결과 없음 */}
        {query && totalCount === 0 && (
          <div className="text-center py-20 text-gray-400">
            {t("search.no_results")}
          </div>
        )}

        {/* 병원 섹션 */}
        {clinicResults.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-semibold text-gray-600 mb-3 uppercase tracking-wide">
              {t("search.clinics")} ({clinicResults.length})
            </h2>
            <ul className="space-y-3">
              {clinicResults.map((clinic) => (
                <li
                  key={clinic.id}
                  className="bg-white rounded-xl border border-gray-100 px-5 py-4 shadow-sm"
                >
                  <p className="font-semibold text-gray-800">
                    {locale === "ko" ? clinic.name : clinic.nameEn}
                  </p>
                  <p className="text-xs text-gray-400">
                    {locale === "ko" ? clinic.nameEn : clinic.name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{clinic.region} · {clinic.specialty} · ⭐ {clinic.rating}</p>
                  {clinic.foreignLanguages.length > 0 && (
                    <p className="text-xs text-green-600 mt-1">🌐 {clinic.foreignLanguages.join(", ")}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 커뮤니티 글 섹션 */}
        {postResults.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-semibold text-gray-600 mb-3 uppercase tracking-wide">
              {t("search.posts")} ({postResults.length})
            </h2>
            <ul className="space-y-3">
              {postResults.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/${locale}/community/${post.id}`}
                    className="block bg-white rounded-xl border border-gray-100 px-5 py-4 shadow-sm hover:border-blue-200 transition-colors"
                  >
                    <p className="font-semibold text-gray-800 line-clamp-1">{post.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{post.author} · {post.board}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* FAQ 섹션 */}
        {faqResults.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-semibold text-gray-600 mb-3 uppercase tracking-wide">
              {t("search.faqs")} ({faqResults.length})
            </h2>
            <ul className="space-y-3">
              {faqResults.map((faq) => (
                <li
                  key={faq.id}
                  className="bg-white rounded-xl border border-gray-100 px-5 py-4 shadow-sm"
                >
                  <p className="font-semibold text-gray-800">{faq.question}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-3">{faq.answer}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 검색어 없을 때 안내 */}
        {!query && (
          <div className="text-center py-20 text-gray-400">
            {t("search.no_results")}
          </div>
        )}

      </div>
    </main>
  );
}
