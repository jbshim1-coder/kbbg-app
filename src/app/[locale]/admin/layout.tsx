"use client";

// 관리자 전용 레이아웃 — 인증 체크 + 사이드바 + 헤더 구조
// 비로그인 시 /admin/login으로 리다이렉트
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams, usePathname } from "next/navigation";
import { checkAdminAuth, logoutAdmin } from "@/lib/admin-auth";

// 사이드바 네비게이션 항목 — locale prefix는 렌더링 시 동적으로 추가
const NAV_ITEMS = [
  { path: "/admin", label: "대시보드", icon: "📊" },
  { path: "/admin/users", label: "회원관리", icon: "👥" },
  { path: "/admin/ads", label: "광고관리", icon: "📢" },
  { path: "/admin/posts", label: "게시글관리", icon: "📝" },
  { path: "/admin/clinics", label: "병원 데이터", icon: "🏥" },
  { path: "/admin/inquiries", label: "추천 문의", icon: "💬" },
];

// AdminLayout: /admin 하위 모든 페이지를 감싸는 레이아웃 컴포넌트
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const locale = (params?.locale as string) || "ko";

  // 인증 상태 — null은 로딩 중, false는 미인증, true는 인증됨
  const [authChecked, setAuthChecked] = useState<boolean | null>(null);

  useEffect(() => {
    // 로그인 페이지 자체는 인증 체크 불필요
    if (pathname.includes("/admin/login")) {
      setAuthChecked(true);
      return;
    }

    const isAuth = checkAdminAuth();
    if (!isAuth) {
      // 미인증 → 로그인 페이지로 리다이렉트
      router.replace(`/${locale}/admin/login`);
    } else {
      setAuthChecked(true);
    }
  }, [pathname, locale, router]);

  // 로그아웃 핸들러 — 토큰 제거 후 로그인 페이지로 이동
  const handleLogout = () => {
    logoutAdmin();
    router.push(`/${locale}/admin/login`);
  };

  // 인증 확인 전 로딩 상태 — 레이아웃 깜빡임 방지
  if (authChecked === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-500">로딩 중...</p>
      </div>
    );
  }

  // 로그인 페이지는 사이드바 없이 children만 렌더링
  if (pathname.includes("/admin/login")) {
    return <>{children}</>;
  }

  return (
    // 전체 화면을 좌우로 분할 — 왼쪽 사이드바 / 오른쪽 메인
    <div className="flex min-h-screen bg-gray-100">

      {/* 좌측 사이드바 — 고정 너비 256px, 다크 배경 */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">

        {/* 서비스 타이틀 영역 */}
        <div className="px-6 py-5 border-b border-gray-700">
          <h1 className="text-lg font-bold tracking-tight">KBBG 관리자</h1>
          <p className="text-xs text-gray-400 mt-0.5">Admin Dashboard</p>
        </div>

        {/* 네비게이션 링크 목록 — navItems 배열을 순회하여 렌더링 */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              href={`/${locale}${item.path}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* 사이드바 하단 — 로그아웃 버튼 */}
        <div className="px-4 py-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full text-xs text-gray-400 hover:text-white py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors text-left"
          >
            로그아웃
          </button>
        </div>
      </aside>

      {/* 오른쪽 메인 콘텐츠 영역 */}
      <main className="flex-1 overflow-auto">

        {/* 상단 헤더 — 로그인된 관리자 계정 표시 */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <p className="text-sm text-gray-500">
            관리자 계정으로 로그인됨 — admin@2bstory.com
          </p>
        </header>

        {/* 각 페이지 컴포넌트가 렌더링되는 영역 */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
