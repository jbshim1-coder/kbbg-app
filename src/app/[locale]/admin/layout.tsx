"use client";

// 관리자 전용 레이아웃 — Supabase Auth 기반 인증 + 사이드바 + 헤더
// 관리자가 아닌 경우 /admin/login으로 리다이렉트
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { isMaster } from "@/lib/level-system";

// 사이드바 네비게이션 항목
const NAV_ITEMS = [
  { path: "/admin", label: "대시보드", icon: "📊" },
  { path: "/admin/users", label: "회원관리", icon: "👥" },
  { path: "/admin/ads", label: "광고관리", icon: "📢" },
  { path: "/admin/posts", label: "게시글관리", icon: "📝" },
  { path: "/admin/comments", label: "댓글관리", icon: "🗨️" },
  { path: "/admin/clinics", label: "병원 데이터", icon: "🏥" },
  { path: "/admin/inquiries", label: "추천 문의", icon: "💬" },
  { path: "/admin/bug-reports", label: "기능오류 신고", icon: "🐛" },
  { path: "/admin/reviews", label: "리뷰관리", icon: "⭐" },
  { path: "/admin/audit", label: "감사 로그", icon: "📋" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const locale = (params?.locale as string) || "ko";

  const [authChecked, setAuthChecked] = useState<boolean | null>(null);
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    // 로그인 페이지는 인증 체크 불필요
    if (pathname.includes("/admin/login")) {
      setAuthChecked(true);
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email;
      if (!email || !isMaster(email)) {
        router.replace(`/${locale}/admin/login`);
      } else {
        setAdminEmail(email);
        setAuthChecked(true);
      }
    });
  }, [pathname, locale, router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}/admin/login`);
  };

  if (authChecked === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (pathname.includes("/admin/login")) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-gray-700">
          <h1 className="text-lg font-bold tracking-tight">KBBG 관리자</h1>
          <p className="text-xs text-gray-400 mt-0.5">Admin Dashboard</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const fullPath = `/${locale}${item.path}`;
            // 대시보드는 정확 일치, 하위 메뉴는 prefix 일치로 활성 판단
            const isActive = item.path === "/admin"
              ? pathname === fullPath
              : pathname.startsWith(fullPath);
            return (
              <Link
                key={item.path}
                href={fullPath}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-gray-700 text-white font-semibold"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full text-xs text-gray-400 hover:text-white py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors text-left"
          >
            로그아웃
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <p className="text-sm text-gray-500">
            관리자 계정으로 로그인됨 — {adminEmail}
          </p>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
