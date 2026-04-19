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
    </div>
  );
}
