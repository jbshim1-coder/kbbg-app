import Link from "next/link";
import { Mail, Globe, Share2, MessageCircle, ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";

// SNS 링크 목록 (lucide-react에서 지원하는 아이콘 사용)
const SNS_LINKS = [
  { label: "Instagram", href: "https://instagram.com", icon: Globe },
  { label: "YouTube", href: "https://youtube.com", icon: Share2 },
  { label: "Facebook", href: "https://facebook.com", icon: MessageCircle },
  { label: "X (Twitter)", href: "https://twitter.com", icon: ExternalLink },
];

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
      ],
    },
  ];

  const LEGAL_LINKS = [
    { href: lp("/disclaimer"), labelKey: "footer.disclaimer" },
    { href: lp("/terms"), labelKey: "footer.terms" },
    { href: lp("/privacy"), labelKey: "footer.privacy" },
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── 상단: 브랜드 + 네비 섹션 ── */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* 회사 정보 블록 */}
          <div className="lg:col-span-2">
            <Link
              href={lp("/")}
              className="text-xl font-bold text-teal-600 tracking-tight"
              aria-label="K-Beauty Buyers Guide"
            >
              K-Beauty<span className="text-teal-500">BG</span>
            </Link>

            <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-xs">
              {t("footer.company_desc")}
            </p>

            {/* 투비스토리 회사 정보 */}
            <div className="mt-5 space-y-1 text-xs text-gray-400">
              <p className="font-medium text-gray-500">{t("footer.company_name")}</p>
              <p>{t("footer.company_info")}</p>
              <a
                href="mailto:help@2bstory.com"
                className="inline-flex items-center gap-1 hover:text-teal-600 transition-colors"
              >
                <Mail size={12} />
                help@2bstory.com
              </a>
            </div>

            {/* SNS 아이콘 링크 */}
            <div className="mt-5 flex items-center gap-3">
              {SNS_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2 rounded-lg text-gray-400 hover:text-teal-600
                    hover:bg-teal-50 transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* 네비게이션 섹션 3개 */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.titleKey}>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                {t(section.titleKey as Parameters<typeof t>[0])}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-teal-600 transition-colors"
                    >
                      {t(link.labelKey as Parameters<typeof t>[0])}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── 하단: 저작권 + 법률 링크 ── */}
        <div className="py-6 border-t border-gray-200 flex flex-col sm:flex-row
          items-center justify-between gap-4">

          <p className="text-xs text-gray-400">
            {t("footer.copyright", { year: currentYear })}
          </p>

          <nav
            aria-label="legal"
            className="flex items-center gap-4"
          >
            {LEGAL_LINKS.map((link, idx) => (
              <span key={link.href} className="flex items-center gap-4">
                {idx > 0 && (
                  <span className="text-gray-200" aria-hidden="true">|</span>
                )}
                <Link
                  href={link.href}
                  className="text-xs text-gray-400 hover:text-teal-600 transition-colors"
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
