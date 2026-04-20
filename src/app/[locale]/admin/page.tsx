"use client";

// 관리자 대시보드 메인 페이지 — 실시간 통계 카드 + 주요 메뉴 바로가기
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// 통계 데이터 구조
interface Stats {
  totalUsers: number;
  totalPosts: number;
  totalClinics: number;
  todayVisitors: number;
  pendingReports: number;
}

// 메뉴 카드 데이터 구조
interface MenuCard {
  href: string;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export default function AdminDashboard() {
  const params = useParams();
  const locale = (params?.locale as string) || "ko";
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setStats(d);
      })
      .finally(() => setLoading(false));
  }, []);

  // 통계 카드 목록
  const statCards = [
    {
      label: "총 회원",
      value: stats?.totalUsers ?? 0,
      href: `/${locale}/admin/users`,
      icon: "👥",
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
    },
    {
      label: "총 게시글",
      value: stats?.totalPosts ?? 0,
      href: `/${locale}/admin/posts`,
      icon: "📝",
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-700",
    },
    {
      label: "활성 병원",
      value: stats?.totalClinics ?? 0,
      href: `/${locale}/admin/clinics`,
      icon: "🏥",
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
    },
    {
      label: "오늘 방문자",
      value: stats?.todayVisitors ?? 0,
      href: `/${locale}/admin`,
      icon: "📊",
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
    },
    {
      label: "미처리 신고",
      value: stats?.pendingReports ?? 0,
      href: `/${locale}/admin/inquiries`,
      icon: "🚨",
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
    },
  ];

  // 관리 메뉴 카드 목록
  const menuCards: MenuCard[] = [
    {
      href: `/${locale}/admin/users`,
      label: "회원관리",
      description: "가입 회원 목록 조회 및 차단/정지 처리",
      icon: "👥",
      color: "bg-slate-50 border-blue-100",
    },
    {
      href: `/${locale}/admin/ads`,
      label: "광고관리",
      description: "광고 등록/수정/삭제 및 검색 결과 노출 관리",
      icon: "📢",
      color: "bg-green-50 border-green-100",
    },
    {
      href: `/${locale}/admin/posts`,
      label: "게시글관리",
      description: "커뮤니티 게시글 조회 및 신고 처리",
      icon: "📝",
      color: "bg-purple-50 border-purple-100",
    },
    {
      href: `/${locale}/admin/comments`,
      label: "댓글관리",
      description: "커뮤니티 댓글 조회 및 삭제 관리",
      icon: "🗨️",
      color: "bg-cyan-50 border-cyan-100",
    },
    {
      href: `/${locale}/admin/bug-reports`,
      label: "기능오류 신고",
      description: "사용자 기능오류 신고 확인 및 100P 지급 처리",
      icon: "🐛",
      color: "bg-red-50 border-red-100",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">대시보드</h2>
        <p className="text-sm text-gray-500 mt-1">KBBG 관리자 페이지에 오신 것을 환영합니다.</p>
      </div>

      {/* 실시간 통계 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`block rounded-xl border ${card.border} ${card.bg} p-4 hover:shadow-md transition-shadow`}
          >
            <div className="text-2xl mb-2">{card.icon}</div>
            <p className="text-xs text-gray-500 mb-1">{card.label}</p>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            ) : (
              <p className={`text-2xl font-bold ${card.text}`}>
                {card.value.toLocaleString()}
              </p>
            )}
          </Link>
        ))}
      </div>

      {/* 주요 관리 메뉴 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {menuCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`block rounded-xl border p-6 hover:shadow-sm transition-shadow ${card.color}`}
          >
            <div className="text-3xl mb-3">{card.icon}</div>
            <h3 className="font-semibold text-gray-800 text-lg">{card.label}</h3>
            <p className="text-sm text-gray-500 mt-1">{card.description}</p>
          </Link>
        ))}
      </div>

      {/* 최근 활동 로그 */}
      <RecentActivity locale={locale} />

      {/* 기타 관리 메뉴 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-700 mb-4">기타 관리</h3>
        <div className="flex flex-wrap gap-3">
          <Link href={`/${locale}/admin/clinics`}
            className="px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
            🏥 병원 데이터
          </Link>
          <Link href={`/${locale}/admin/inquiries`}
            className="px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
            💬 추천 문의
          </Link>
        </div>
      </div>

      {/* 사이트 점검 */}
      <HealthCheck />
    </div>
  );
}

// 사이트 점검 컴포넌트
interface CheckItem {
  name: string;
  status: "pass" | "fail" | "warn";
  message: string;
  ms?: number;
}

function HealthCheck() {
  const [checks, setChecks] = useState<CheckItem[]>([]);
  const [summary, setSummary] = useState<{ total: number; pass: number; fail: number; warn: number } | null>(null);
  const [running, setRunning] = useState(false);
  const [checkedAt, setCheckedAt] = useState("");

  const runCheck = async () => {
    setRunning(true);
    setChecks([]);
    setSummary(null);
    try {
      const res = await fetch("/api/admin/health-check");
      const data = await res.json();
      setChecks(data.checks || []);
      setSummary(data.summary || null);
      setCheckedAt(data.checkedAt ? new Date(data.checkedAt).toLocaleString("ko-KR") : "");
    } catch {
      setChecks([{ name: "점검 실행", status: "fail", message: "API 호출 실패" }]);
    } finally {
      setRunning(false);
    }
  };

  const statusIcon = (s: string) => s === "pass" ? "✅" : s === "fail" ? "❌" : "⚠️";
  const statusColor = (s: string) => s === "pass" ? "text-green-700 bg-green-50" : s === "fail" ? "text-red-700 bg-red-50" : "text-amber-700 bg-amber-50";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700">🔍 사이트 점검</h3>
        <button
          onClick={runCheck}
          disabled={running}
          className="px-4 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:bg-slate-400 transition-colors min-h-[40px]"
        >
          {running ? "점검 중..." : "전체 점검 실행"}
        </button>
      </div>

      {summary && (
        <div className="flex gap-3 mb-4">
          <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-600">전체 {summary.total}개</span>
          <span className="text-sm px-3 py-1 rounded-full bg-green-50 text-green-700">통과 {summary.pass}</span>
          {summary.fail > 0 && <span className="text-sm px-3 py-1 rounded-full bg-red-50 text-red-700">실패 {summary.fail}</span>}
          {summary.warn > 0 && <span className="text-sm px-3 py-1 rounded-full bg-amber-50 text-amber-700">경고 {summary.warn}</span>}
          {checkedAt && <span className="text-xs text-gray-400 self-center ml-auto">{checkedAt}</span>}
        </div>
      )}

      {checks.length > 0 && (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {checks.map((c, i) => (
            <div key={i} className={`flex items-start gap-3 px-3 py-2 rounded-lg ${statusColor(c.status)}`}>
              <span className="shrink-0 mt-0.5">{statusIcon(c.status)}</span>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium">{c.name}</span>
                <p className="text-xs opacity-75 break-all">{c.message}</p>
              </div>
              {c.ms !== undefined && <span className="text-xs opacity-50 shrink-0">{c.ms}ms</span>}
            </div>
          ))}
        </div>
      )}

      {checks.length === 0 && !running && (
        <p className="text-sm text-gray-400 text-center py-4">&quot;전체 점검 실행&quot; 버튼을 눌러 사이트 상태를 확인하세요</p>
      )}
    </div>
  );
}

// 최근 활동 로그 — 최근 게시글/문의 표시
function RecentActivity({ locale }: { locale: string }) {
  const [recentPosts, setRecentPosts] = useState<{ id: string; title: string; created_at: string }[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<{ id: string; name: string; created_at: string }[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/posts?page=1&limit=5").then(r => r.json()).catch(() => ({ posts: [] })),
      fetch("/api/admin/inquiries?page=1&limit=5").then(r => r.json()).catch(() => ({ inquiries: [] })),
    ]).then(([postsData, inquiriesData]) => {
      setRecentPosts((postsData.posts || []).slice(0, 5));
      setRecentInquiries((inquiriesData.inquiries || []).slice(0, 5));
    }).finally(() => setLoadingActivity(false));
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {/* 최근 게시글 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-700">최근 게시글</h3>
          <Link href={`/${locale}/admin/posts`} className="text-xs text-slate-600 hover:underline">
            전체 보기
          </Link>
        </div>
        {loadingActivity ? (
          <p className="text-sm text-gray-400">로딩 중...</p>
        ) : recentPosts.length === 0 ? (
          <p className="text-sm text-gray-400">게시글이 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {recentPosts.map((post) => (
              <li key={post.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-800 truncate max-w-[200px]">{post.title}</span>
                <span className="text-xs text-gray-400 shrink-0 ml-2">
                  {new Date(post.created_at).toLocaleDateString("ko-KR")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 최근 문의 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-700">최근 문의</h3>
          <Link href={`/${locale}/admin/inquiries`} className="text-xs text-slate-600 hover:underline">
            전체 보기
          </Link>
        </div>
        {loadingActivity ? (
          <p className="text-sm text-gray-400">로딩 중...</p>
        ) : recentInquiries.length === 0 ? (
          <p className="text-sm text-gray-400">문의가 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {recentInquiries.map((inq) => (
              <li key={inq.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-800 truncate max-w-[200px]">{inq.name || "익명"}</span>
                <span className="text-xs text-gray-400 shrink-0 ml-2">
                  {new Date(inq.created_at).toLocaleDateString("ko-KR")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
