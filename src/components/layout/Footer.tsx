import Link from "next/link";
import { Mail, Globe, Share2, MessageCircle, ExternalLink } from "lucide-react";

// SNS 링크 목록 (lucide-react에서 지원하는 아이콘 사용)
const SNS_LINKS = [
  { label: "Instagram", href: "https://instagram.com", icon: Globe },
  { label: "YouTube", href: "https://youtube.com", icon: Share2 },
  { label: "Facebook", href: "https://facebook.com", icon: MessageCircle },
  { label: "X (Twitter)", href: "https://twitter.com", icon: ExternalLink },
];

// 법률/정책 링크
const LEGAL_LINKS = [
  { href: "/disclaimer", label: "면책 조항" },
  { href: "/terms", label: "이용약관" },
  { href: "/privacy", label: "개인정보보호" },
];

// 푸터 네비게이션 섹션
const FOOTER_SECTIONS = [
  {
    title: "서비스",
    links: [
      { href: "/ai-recommend", label: "AI 추천" },
      { href: "/community", label: "커뮤니티" },
      { href: "/hospitals", label: "병원 찾기" },
      { href: "/procedures", label: "시술 안내" },
    ],
  },
  {
    title: "회사",
    links: [
      { href: "/about", label: "회사 소개" },
      { href: "/contact", label: "문의하기" },
      { href: "/careers", label: "채용" },
      { href: "/press", label: "언론 보도" },
    ],
  },
  {
    title: "지원",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/guide", label: "이용 가이드" },
      { href: "/safety", label: "안전 정보" },
      { href: "/report", label: "신고하기" },
    ],
  },
];

// 푸터 컴포넌트 — 브랜드 정보, 네비게이션, 저작권 및 법률 링크 포함
export default function Footer() {
  // 저작권 연도를 동적으로 생성 (렌더링 시점 기준)
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── 상단: 브랜드 + 네비 섹션 ── */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* 회사 정보 블록 */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="text-xl font-bold text-blue-600 tracking-tight"
              aria-label="K-Beauty Buyers Guide 홈"
            >
              K-Beauty<span className="text-pink-400">BG</span>
            </Link>

            <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-xs">
              한국 뷰티 의료 관광을 위한 신뢰할 수 있는 가이드.
              AI 기반 맞춤 추천으로 최적의 병원과 시술을 찾아드립니다.
            </p>

            {/* 투비스토리 회사 정보 */}
            <div className="mt-5 space-y-1 text-xs text-gray-400">
              <p className="font-medium text-gray-500">㈜ 투비스토리</p>
              <p>2008년 설립 · 국내 500여 개 병원 파트너</p>
              <a
                href="mailto:help@2bstory.com"
                className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors"
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
                  className="p-2 rounded-lg text-gray-400 hover:text-blue-600
                    hover:bg-blue-50 transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* 네비게이션 섹션 3개 */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      {link.label}
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
            © {currentYear} 투비스토리(2bstory). All rights reserved.
          </p>

          <nav
            aria-label="법률 링크"
            className="flex items-center gap-4"
          >
            {LEGAL_LINKS.map((link, idx) => (
              <span key={link.href} className="flex items-center gap-4">
                {idx > 0 && (
                  <span className="text-gray-200" aria-hidden="true">|</span>
                )}
                <Link
                  href={link.href}
                  className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {link.label}
                </Link>
              </span>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
