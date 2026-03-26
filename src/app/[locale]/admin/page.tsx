"use client";

// 관리자 대시보드 메인 페이지 — 사이트 통계 요약 및 주요 메뉴 바로가기
import Link from "next/link";
import { useParams } from "next/navigation";

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

  // 관리 메뉴 카드 목록 — 회원관리, 광고관리, 게시글관리 3개
  const menuCards: MenuCard[] = [
    {
      href: `/${locale}/admin/users`,
      label: "회원관리",
      description: "가입 회원 목록 조회 및 차단/정지 처리",
      icon: "👥",
      color: "bg-blue-50 border-blue-100",
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
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">대시보드</h2>
        <p className="text-sm text-gray-500 mt-1">KBBG 관리자 페이지에 오신 것을 환영합니다.</p>
      </div>

      {/* 주요 관리 메뉴 카드 — 3개 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {menuCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`block rounded-xl border p-6 hover:shadow-md transition-shadow ${card.color}`}
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
