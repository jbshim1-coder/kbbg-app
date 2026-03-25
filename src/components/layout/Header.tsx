"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Globe, Menu, X, ChevronDown } from "lucide-react";
import SearchBar from "@/components/ui/SearchBar";
import { useTranslations } from "next-intl";

// 지원 언어 목록 — 국기 순서는 기획 기준 고정
const LOCALES = [
  { code: "en", flag: "🇺🇸", label: "English" },
  { code: "zh", flag: "🇨🇳", label: "中文" },
  { code: "ja", flag: "🇯🇵", label: "日本語" },
  { code: "ru", flag: "🇷🇺", label: "Русский" },
  { code: "vi", flag: "🇻🇳", label: "Tiếng Việt" },
  { code: "th", flag: "🇹🇭", label: "ภาษาไทย" },
  { code: "mn", flag: "🇲🇳", label: "Монгол" },
  { code: "ko", flag: "🇰🇷", label: "한국어" },
] as const;

// 헤더 컴포넌트 — 상단 고정 네비게이션 바
// sticky 포지션으로 스크롤 시에도 항상 상단에 유지
export default function Header() {
  const t = useTranslations();

  // 현재 URL 경로에서 locale 추출
  const pathname = usePathname();
  const router = useRouter();
  const currentLocaleCode = pathname.split("/")[1] || "en";

  // 모바일 메뉴 열림/닫힘 상태
  const [mobileOpen, setMobileOpen] = useState(false);
  // 언어 선택 드롭다운 열림/닫힘 상태
  const [langOpen, setLangOpen] = useState(false);
  // 현재 선택된 언어 (URL 기반으로 초기화)
  const [currentLocale, setCurrentLocale] = useState<(typeof LOCALES)[number]>(
    LOCALES.find((l) => l.code === currentLocaleCode) || LOCALES[0]
  );

  // 네비게이션 링크 목록 — 번역 키 사용
  const NAV_LINKS = [
    { href: "/", labelKey: "nav.home" },
    { href: "/recommend", labelKey: "nav.recommend" },
    { href: "/community", labelKey: "nav.community" },
    { href: "/about", labelKey: "nav.about" },
    { href: "/contact", labelKey: "nav.contact" },
  ];

  // locale 포함된 링크 생성 헬퍼
  const localePath = (path: string) => `/${currentLocaleCode}${path === "/" ? "" : path}`;

  // 언어 드롭다운 DOM 참조 — 외부 클릭 감지에 사용
  const langRef = useRef<HTMLDivElement>(null);

  // 언어 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!langRef.current?.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 모바일 메뉴 열릴 때 배경 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // 검색 실행 핸들러 — 검색어를 받아 검색 라우팅으로 연결
  const handleSearch = (query: string) => {
    // TODO: 실제 검색 라우팅으로 교체
    console.log("search:", query);
  };

  // 언어 선택 핸들러 — 선택한 언어로 URL 변경
  const handleSelectLocale = (locale: (typeof LOCALES)[number]) => {
    setCurrentLocale(locale);
    setLangOpen(false);
    // 현재 경로에서 locale 부분만 교체하여 이동
    const restPath = pathname.split("/").slice(2).join("/");
    router.push(`/${locale.code}${restPath ? `/${restPath}` : ""}`);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* ── 로고 ── */}
          <Link
            href={localePath("/")}
            className="flex-shrink-0 text-xl font-bold text-blue-600 tracking-tight"
            aria-label="K-Beauty Buyers Guide"
          >
            K-Beauty<span className="text-pink-400">BG</span>
          </Link>

          {/* ── PC 네비게이션 ── */}
          <nav
            className="hidden lg:flex items-center gap-1"
            aria-label={t("nav.home")}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={localePath(link.href)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600
                  hover:text-blue-600 hover:bg-blue-50 transition-colors duration-150"
              >
                {t(link.labelKey as Parameters<typeof t>[0])}
              </Link>
            ))}
          </nav>

          {/* ── PC 검색바 ── */}
          <div className="hidden md:flex flex-1 max-w-xs">
            <SearchBar
              placeholder={t("nav.search_placeholder")}
              onSearch={handleSearch}
              size="sm"
            />
          </div>

          {/* ── 우측 액션 영역 ── */}
          <div className="flex items-center gap-2">

            {/* 언어 선택 드롭다운 */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen((prev) => !prev)}
                aria-label={t("nav.language")}
                aria-expanded={langOpen}
                aria-haspopup="listbox"
                className="flex items-center gap-1 p-2 rounded-lg text-gray-500
                  hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Globe size={18} />
                <span className="hidden sm:inline text-sm font-medium">
                  {currentLocale.flag}
                </span>
                <ChevronDown
                  size={12}
                  className={[
                    "transition-transform duration-150",
                    langOpen ? "rotate-180" : "",
                  ].join(" ")}
                />
              </button>

              {/* 언어 목록 드롭다운 패널 — langOpen 상태일 때만 렌더링 */}
              {langOpen && (
                <div
                  role="listbox"
                  aria-label={t("nav.language")}
                  className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg
                    border border-gray-100 py-1 z-40"
                >
                  {LOCALES.map((locale) => (
                    <button
                      key={locale.code}
                      role="option"
                      aria-selected={currentLocale.code === locale.code}
                      onClick={() => handleSelectLocale(locale)}
                      className={[
                        "w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors",
                        currentLocale.code === locale.code
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50",
                      ].join(" ")}
                    >
                      <span className="text-base">{locale.flag}</span>
                      <span>{locale.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 로그인 / 회원가입 버튼 — PC에서만 표시 */}
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href={localePath("/login")}
                className="px-3 py-1.5 text-sm font-medium rounded-lg text-gray-700
                  hover:bg-gray-100 transition-colors"
              >
                {t("nav.login")}
              </Link>
              <Link
                href={localePath("/signup")}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600
                  text-white hover:bg-blue-700 transition-colors"
              >
                {t("nav.signup")}
              </Link>
            </div>

            {/* 모바일 햄버거 버튼 — lg 미만에서만 표시 */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? t("common.back") : t("nav.home")}
              aria-expanded={mobileOpen}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {/* 메뉴 열림 여부에 따라 X 또는 햄버거 아이콘 전환 */}
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── 모바일 메뉴 패널 ── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          {/* 모바일 검색바 */}
          <div className="px-4 pt-4 pb-2">
            <SearchBar
              placeholder={t("nav.search_placeholder")}
              onSearch={(q) => { handleSearch(q); setMobileOpen(false); }}
              size="md"
            />
          </div>

          {/* 모바일 네비 링크 */}
          <nav aria-label={t("nav.home")} className="px-4 py-2 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={localePath(link.href)}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700
                  hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                {t(link.labelKey as Parameters<typeof t>[0])}
              </Link>
            ))}
          </nav>

          {/* 모바일 로그인/회원가입 */}
          <div className="px-4 py-4 flex gap-3 border-t border-gray-100">
            <Link
              href={localePath("/login")}
              onClick={() => setMobileOpen(false)}
              className="flex-1 text-center px-4 py-2 text-sm font-medium rounded-lg
                border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
            >
              {t("nav.login")}
            </Link>
            <Link
              href={localePath("/signup")}
              onClick={() => setMobileOpen(false)}
              className="flex-1 text-center px-4 py-2 text-sm font-medium rounded-lg
                bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {t("nav.signup")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
