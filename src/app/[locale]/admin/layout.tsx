// 관리자 전용 레이아웃 — 모든 /admin/* 페이지에 공통 적용되는 사이드바 + 헤더 구조
import Link from "next/link";

// 사이드바 네비게이션 항목 — locale prefix는 렌더링 시 동적으로 추가
const NAV_ITEMS = [
  { path: "/admin", label: "대시보드", icon: "📊" },
  { path: "/admin/posts", label: "게시글 관리", icon: "📝" },
  { path: "/admin/users", label: "사용자 관리", icon: "👥" },
  { path: "/admin/clinics", label: "병원 데이터", icon: "🏥" },
  { path: "/admin/ads", label: "광고 관리", icon: "📢" },
  { path: "/admin/inquiries", label: "추천 문의", icon: "💬" },
];

// AdminLayout: /admin 하위 모든 페이지를 감싸는 루트 레이아웃 컴포넌트
// children에 각 페이지 콘텐츠가 주입됨
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

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
              // hover 시 배경색 변경으로 현재 위치 피드백 제공
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* 사이드바 하단 — 권한 안내 문구 */}
        <div className="px-6 py-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">관리자 전용 페이지</p>
        </div>
      </aside>

      {/* 오른쪽 메인 콘텐츠 영역 */}
      <main className="flex-1 overflow-auto">

        {/* 상단 헤더 — 로그인된 관리자 계정 표시 */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <p className="text-sm text-gray-500">
            관리자 계정으로 로그인됨 — admin@kbbg.com
          </p>
        </header>

        {/* 각 페이지 컴포넌트가 렌더링되는 영역 */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
