"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Globe, Menu, X, ChevronDown, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import LevelBadge from "@/components/LevelBadge";
import { isMaster, getLevel } from "@/lib/level-system";

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

  // 로그인 사용자 상태
  const [user, setUser] = useState<User | null>(null);

  // Supabase에서 현재 로그인 사용자 확인
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // 로그아웃 핸들러
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push(localePath("/"));
  };

  // 모바일 메뉴 열림/닫힘 상태
  const [mobileOpen, setMobileOpen] = useState(false);
  // 언어 선택 드롭다운 열림/닫힘 상태
  const [langOpen, setLangOpen] = useState(false);
  // 현재 선택된 언어 (URL 기반으로 초기화)
  const [currentLocale, setCurrentLocale] = useState<(typeof LOCALES)[number]>(
    LOCALES.find((l) => l.code === currentLocaleCode) || LOCALES[0]
  );

  // 어제 방문자 수
  const [yesterdayVisitors, setYesterdayVisitors] = useState(0);
  useEffect(() => {
    // 방문자 수 조회
    fetch("/api/visitors").then(r => r.json()).then(d => setYesterdayVisitors(d.count)).catch(() => {});
    // 오늘 방문자 +1 (세션당 1회)
    if (!sessionStorage.getItem("kbbg_visited")) {
      fetch("/api/visitors", { method: "POST" }).catch(() => {});
      sessionStorage.setItem("kbbg_visited", "1");
    }
  }, []);

  // 네비게이션 링크 목록 — 번역 키 사용
  // 메뉴 순서: 사용자 유입 + 체류시간 극대화 구조
  const NAV_LINKS = [
    { href: "/ai-search", labelKey: "nav.ai_search" },
    { href: "/#face-analysis", labelKey: "nav.ai_face" },
    { href: "/hospitals", labelKey: "nav.hospital_search" },
    { href: "/community", labelKey: "nav.community" },
    { href: "/cosmetics", labelKey: "nav.kbeauty" },
    { href: "/guides", labelKey: "nav.guides" },
    { href: "/events", labelKey: "nav.events" },
    { href: "/live", labelKey: "nav.live_short" },
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

  // 검색 실행 핸들러 — 검색어를 받아 검색 결과 페이지로 이동
  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    router.push(`/${currentLocaleCode}/search?q=${encodeURIComponent(query.trim())}`);
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
            className="flex-shrink-0"
            aria-label="K-Beauty Buyers Guide"
          >
            <Image
              src="/logo.png"
              alt="K-Beauty Buyers Guide"
              width={140}
              height={48}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* ── 어제 방문자 수 ── */}
          {yesterdayVisitors > 0 && (
            <span className="hidden lg:inline text-[11px] text-gray-400">
              어제 방문자 : <span className="font-bold text-red-500">{yesterdayVisitors.toLocaleString()}</span>명
            </span>
          )}

          {/* ── PC 네비게이션 ── */}
          <nav
            className="hidden lg:flex items-center gap-1"
            aria-label={t("nav.home")}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={localePath(link.href)}
                className="px-3 py-2 rounded-lg text-base font-bold text-gray-800
                  hover:text-blue-600 hover:bg-blue-50 transition-colors duration-150"
              >
                {t(link.labelKey as Parameters<typeof t>[0])}
              </Link>
            ))}
          </nav>


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

            {/* 로그인 상태에 따라 다른 UI 표시 */}
            <div className="hidden sm:flex items-center gap-2">
              {user ? (
                <>
                  <Link
                    href={localePath("/mypage")}
                    className="flex items-center gap-1.5 text-sm text-gray-600 truncate max-w-[120px] hover:text-blue-600 transition-colors"
                  >
                    {user.user_metadata?.full_name || user.email?.split("@")[0]}
                    <LevelBadge
                      level={user.email && isMaster(user.email) ? "M" : getLevel(0)}
                      size="sm"
                    />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-sm font-medium rounded-lg text-gray-500
                      hover:bg-gray-100 transition-colors"
                    aria-label="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
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

      {/* ── 커뮤니티 카테고리 서브메뉴 ── */}
      <div className="hidden lg:block border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-1 py-1.5">
            {[
              "plastic_surgery", "dermatology", "internal_medicine", "dental",
              "ophthalmology", "gynecology", "orthopedics", "oriental",
              "urology", "ent", "kpop", "kfood", "kdrama", "kfashion",
              "travel", "korean_learn",
            ].map((key) => (
              <Link
                key={key}
                href={localePath(`/community?cat=${key}`)}
                className="px-3 py-1 rounded-full text-xs font-medium text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition-colors whitespace-nowrap"
              >
                {t(`community.${key}` as Parameters<typeof t>[0])}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── 모바일 메뉴 패널 ── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
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
