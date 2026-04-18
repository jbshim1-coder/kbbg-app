"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Globe, Menu, X, ChevronDown, LogOut, Bell } from "lucide-react";
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
  // 알림 드롭다운 상태
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // 더미 알림 데이터 — 향후 Supabase 실시간 연동 예정
  const DUMMY_NOTIFICATIONS = [
    { id: 1, text: currentLocaleCode === "ko" ? "sarah_jp님이 내 게시글에 댓글을 달았습니다." : "sarah_jp commented on your post.", time: "2m ago", read: false },
    { id: 2, text: currentLocaleCode === "ko" ? "내 게시글이 인기글에 선정되었습니다! 🎉" : "Your post was featured as trending! 🎉", time: "1h ago", read: false },
    { id: 3, text: currentLocaleCode === "ko" ? "mike_us님이 내 댓글에 답글을 달았습니다." : "mike_us replied to your comment.", time: "3h ago", read: true },
    { id: 4, text: currentLocaleCode === "ko" ? "새 공지사항: 커뮤니티 가이드라인 업데이트" : "Notice: Community guidelines updated.", time: "1d ago", read: true },
  ];
  // 현재 선택된 언어 — URL이 바뀌면(middleware redirect 포함) 항상 pathname과 동기화
  const currentLocale =
    LOCALES.find((l) => l.code === currentLocaleCode) || LOCALES[0];

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
      if (!notifRef.current?.contains(e.target as Node)) {
        setNotifOpen(false);
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

  // 언어 선택 핸들러 — 선택한 언어로 URL 변경 (currentLocale은 pathname에서 자동 동기화됨)
  const handleSelectLocale = (locale: (typeof LOCALES)[number]) => {
    setLangOpen(false);
    // 현재 경로에서 locale 부분만 교체하여 이동
    const restPath = pathname.split("/").slice(2).join("/");
    router.push(`/${locale.code}${restPath ? `/${restPath}` : ""}`);
  };

  void handleSearch;

  return (
    <header className="sticky top-0 z-30 w-full glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-12 gap-2">

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
            <span className="hidden md:inline text-[11px] text-white/60 whitespace-nowrap">
              {t("header.yesterday_visitors" as Parameters<typeof t>[0])} <span className="font-bold text-[var(--accent-link-dark)]">{yesterdayVisitors.toLocaleString()}</span>{t("header.visitors_unit" as Parameters<typeof t>[0])}
            </span>
          )}

          {/* ── PC 네비게이션 ── */}
          <nav
            className="hidden lg:flex items-center gap-0.5 flex-nowrap"
            aria-label={t("nav.home")}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={localePath(link.href)}
                className="px-2.5 py-1.5 rounded-[var(--radius-sm)] text-xs font-normal text-white/80
                  hover:text-white hover:bg-white/10 transition-all duration-200 whitespace-nowrap"
              >
                {t(link.labelKey as Parameters<typeof t>[0])}
              </Link>
            ))}
          </nav>


          {/* ── 우측 액션 영역 ── */}
          <div className="flex items-center gap-2">

            {/* 알림 아이콘 — 로그인 시만 표시 */}
            {user && (
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setNotifOpen((prev) => !prev)}
                  aria-label="Notifications"
                  className="relative p-2 rounded-[var(--radius-sm)] text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <Bell size={18} />
                  {/* 읽지 않은 알림 뱃지 */}
                  {DUMMY_NOTIFICATIONS.some((n) => !n.read) && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--accent)] rounded-full" />
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-[var(--background-dark-surface)] rounded-[var(--radius-lg)] apple-shadow border border-[var(--border-dark)] py-1 z-40">
                    <p className="px-4 py-2 text-xs font-semibold text-white/60 border-b border-[var(--border-dark)]">
                      {currentLocaleCode === "ko" ? "알림" : "Notifications"}
                    </p>
                    {DUMMY_NOTIFICATIONS.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 text-sm border-b border-[var(--border-dark)] last:border-0 ${n.read ? "text-white/50" : "text-white bg-white/5"}`}
                      >
                        <p className="leading-snug">{n.text}</p>
                        <p className="mt-0.5 text-xs text-gray-400">{n.time}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 언어 선택 드롭다운 */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen((prev) => !prev)}
                aria-label={t("nav.language")}
                aria-expanded={langOpen}
                aria-haspopup="listbox"
                className="flex items-center gap-1 p-2 rounded-[var(--radius-sm)] text-white/60
                  hover:text-white hover:bg-white/10 transition-all duration-200"
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
                  className="absolute right-0 mt-2 w-44 bg-[var(--background-dark-surface)] rounded-[var(--radius-lg)]
                    apple-shadow border border-[var(--border-dark)] py-1 z-40"
                >
                  {LOCALES.filter((l) => l.code !== "ko" || (user?.email && isMaster(user.email))).map((locale) => (
                    <button
                      key={locale.code}
                      role="option"
                      aria-selected={currentLocale.code === locale.code}
                      onClick={() => handleSelectLocale(locale)}
                      className={[
                        "w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors",
                        currentLocale.code === locale.code
                          ? "bg-white/10 text-white font-medium"
                          : "text-white/70 hover:bg-white/5 hover:text-white",
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
                    className="flex items-center gap-1.5 text-xs text-white/70 truncate max-w-[80px] sm:max-w-[120px] hover:text-white transition-all duration-200"
                  >
                    {user.user_metadata?.full_name || user.email?.split("@")[0]}
                    <LevelBadge
                      level={user.email && isMaster(user.email) ? "M" : getLevel(0)}
                      size="sm"
                    />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-sm font-medium rounded-[var(--radius-sm)] text-white/50
                      hover:bg-white/10 hover:text-white transition-all duration-200"
                    aria-label="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={localePath("/login")}
                    className="px-3 py-1.5 text-xs font-normal rounded-[var(--radius-pill)] text-white/80
                      hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    href={localePath("/signup")}
                    className="px-3 py-1.5 text-xs font-normal rounded-[var(--radius-pill)] bg-[var(--accent)]
                      text-white hover:bg-[var(--accent-hover)] transition-all duration-200"
                  >
                    {t("nav.signup")}
                  </Link>
                </>
              )}
            </div>

            {/* 모바일 햄버거 버튼 — lg 미만에서만 표시, 최소 44px 터치 타겟 보장 */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? t("common.back") : t("nav.home")}
              aria-expanded={mobileOpen}
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-[var(--radius-sm)] text-white/60 hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              {/* 메뉴 열림 여부에 따라 X 또는 햄버거 아이콘 전환 */}
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── 커뮤니티 카테고리 서브메뉴 ── */}
      <div className="hidden lg:block border-t border-[var(--border-dark)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
                className="px-3 py-1 rounded-[var(--radius-pill)] text-[10px] font-normal text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200 whitespace-nowrap"
              >
                {t(`community.${key}` as Parameters<typeof t>[0])}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── 모바일 메뉴 패널 ── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[var(--border-dark)] bg-[var(--background-dark)]">
          {/* 모바일 네비 링크 — 최소 44px 터치 타겟 보장 */}
          <nav aria-label={t("nav.home")} className="px-4 py-2 flex flex-col gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={localePath(link.href)}
                onClick={() => setMobileOpen(false)}
                className={`px-3 min-h-[44px] flex items-center rounded-[var(--radius-sm)] text-sm font-normal transition-all duration-200 ${
                  pathname.includes(link.href) && link.href !== "/"
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {t(link.labelKey as Parameters<typeof t>[0])}
              </Link>
            ))}
          </nav>

          {/* 모바일 카테고리 서브메뉴 */}
          <div className="px-4 py-2 border-t border-[var(--border-dark)]">
            <p className="text-xs text-white/40 mb-2">{t("community.categories")}</p>
            <div className="flex flex-wrap gap-1">
              {[
                "plastic_surgery", "dermatology", "internal_medicine", "dental",
                "ophthalmology", "gynecology", "orthopedics", "oriental",
                "urology", "ent", "kpop", "kfood", "kdrama", "kfashion",
                "travel", "korean_learn",
              ].map((key) => (
                <Link
                  key={key}
                  href={localePath(`/community?cat=${key}`)}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 min-h-[36px] rounded-[var(--radius-pill)] text-xs font-normal text-white/50 bg-white/5 hover:text-white hover:bg-white/10 transition-all duration-200 whitespace-nowrap"
                >
                  {t(`community.${key}` as Parameters<typeof t>[0])}
                </Link>
              ))}
            </div>
          </div>

          {/* 모바일 로그인/회원가입 또는 로그인 사용자 정보 */}
          <div className="px-4 py-4 border-t border-[var(--border-dark)]">
            {user ? (
              <div className="flex items-center justify-between gap-3">
                <Link
                  href={localePath("/mypage")}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-sm text-white/70 min-w-0"
                >
                  <span className="truncate max-w-[160px]">
                    {user.user_metadata?.full_name || user.email?.split("@")[0]}
                  </span>
                  <LevelBadge
                    level={user.email && isMaster(user.email) ? "M" : getLevel(0)}
                    size="sm"
                  />
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="px-4 py-3 min-h-[44px] text-sm font-normal rounded-[var(--radius-md)] border border-[var(--border-dark)] text-white/50 hover:bg-white/10 hover:text-white transition-all duration-200 shrink-0"
                >
                  {t("nav.logout")}
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link
                  href={localePath("/login")}
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-4 py-3 min-h-[44px] text-sm font-medium rounded-lg
                    border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href={localePath("/signup")}
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-4 py-3 min-h-[44px] text-sm font-medium rounded-lg
                    bg-slate-800 text-white hover:bg-slate-900 transition-colors"
                >
                  {t("nav.signup")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
