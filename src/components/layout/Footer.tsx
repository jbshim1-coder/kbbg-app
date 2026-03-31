import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";

// 푸터 컴포넌트 — 브랜드 정보, 네비게이션, 저작권 및 법률 링크 포함
// locale prop을 받아 모든 내부 링크에 locale prefix를 적용
export default async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations();
  // 저작권 연도를 동적으로 생성 (렌더링 시점 기준)
  const currentYear = new Date().getFullYear();

  // locale prefix 헬퍼
  const lp = (path: string) => `/${locale}${path}`;

  // 푸터 네비게이션 섹션 — 번역 키 사용
  const FOOTER_SECTIONS = [
    {
      titleKey: "footer.services",
      links: [
        { href: lp("/recommend"), labelKey: "footer.service_ai" },
        { href: lp("/community"), labelKey: "footer.service_community" },
        { href: lp("/hospitals"), labelKey: "footer.service_hospitals" },
        { href: lp("/procedures"), labelKey: "footer.service_procedures" },
      ],
    },
    {
      titleKey: "footer.company",
      links: [
        { href: lp("/about"), labelKey: "footer.company_about" },
        { href: lp("/contact"), labelKey: "footer.company_contact" },
      ],
    },
    {
      titleKey: "footer.support",
      links: [
        { href: lp("/faq"), labelKey: "footer.support_faq" },
        { href: lp("/guides"), labelKey: "footer.support_guides" },
        { href: lp("/guide"), labelKey: "footer.support_guide" },
        { href: lp("/safety"), labelKey: "footer.support_safety" },
        { href: lp("/report"), labelKey: "footer.support_report" },
        { href: lp("/guidelines"), labelKey: "footer.support_guidelines" },
        { href: lp("/bug-report"), labelKey: "footer.bug_report", sub: "footer.bug_report_reward" },
      ],
    },
  ];

  const LEGAL_LINKS = [
    { href: lp("/disclaimer"), labelKey: "footer.disclaimer" },
    { href: lp("/terms"), labelKey: "footer.terms" },
    { href: lp("/privacy"), labelKey: "footer.privacy" },
  ];

  return (
    <footer className="bg-stone-50 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── 상단: 브랜드 + 네비 섹션 ── */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* 회사 정보 블록 */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <Link href={lp("/")} aria-label="K-Beauty Buyers Guide">
              <Image src="/logo.png" alt="K-Beauty Buyers Guide" width={140} height={48} className="h-10 w-auto" />
            </Link>

            <div className="mt-5 space-y-1.5 text-xs text-gray-400">
              <p className="font-semibold text-gray-500">{t("footer.company_name")}</p>
              <p>{t("footer.company_info")}</p>
              <a
                href="mailto:help@2bstory.com"
                className="inline-flex items-center gap-1.5 hover:text-slate-700 transition-colors"
              >
                <Mail size={12} />
                help@2bstory.com
              </a>
            </div>
          </div>

          {/* 네비게이션 섹션 3개 */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.titleKey}>
              <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-4">
                {t(section.titleKey as Parameters<typeof t>[0])}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-slate-700 transition-colors"
                    >
                      {t(link.labelKey as Parameters<typeof t>[0])}
                    </Link>
                    {"sub" in link && link.sub && (
                      <p className="text-[10px] text-rose-400 mt-0.5">{t(link.sub as Parameters<typeof t>[0])}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── 하단: 저작권 + 법률 링크 ── */}
        <div className="py-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">

          <p className="text-xs text-gray-400">
            {t("footer.copyright", { year: currentYear })}
          </p>

          <nav aria-label="legal" className="flex items-center gap-1">
            {LEGAL_LINKS.map((link, idx) => (
              <span key={link.href} className="flex items-center gap-1">
                {idx > 0 && (
                  <span className="text-stone-300 px-1" aria-hidden="true">·</span>
                )}
                <Link
                  href={link.href}
                  className="text-xs text-gray-400 hover:text-slate-700 transition-colors"
                >
                  {t(link.labelKey as Parameters<typeof t>[0])}
                </Link>
              </span>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
