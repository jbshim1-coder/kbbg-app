// 관리자 대시보드 메인 페이지 — 사이트 전체 통계, 최근 게시글, 최근 문의를 한눈에 확인

// 상단 통계 카드 한 항목의 데이터 구조
interface StatCard {
  label: string;   // 통계 항목명 (예: "오늘 방문자")
  value: string;   // 표시할 수치 (예: "1,284")
  change: string;  // 전주 대비 변화량 (예: "+12%")
  positive: boolean; // true면 초록색, false면 빨간색으로 강조
}

// 최근 게시글 목록에 사용하는 데이터 구조
interface RecentPost {
  id: number;
  title: string;
  author: string;   // 작성자 사용자명
  country: string;  // 작성자 국적
  createdAt: string;
  reported: boolean; // 신고 접수 여부
}

// 최근 추천 문의 목록에 사용하는 데이터 구조
interface RecentInquiry {
  id: number;
  user: string;       // 문의한 사용자명
  procedure: string;  // 원하는 시술 종류
  status: "pending" | "answered" | "closed"; // 처리 상태
  createdAt: string;
}

// 더미 통계 데이터 — 실제 구현 시 서버에서 집계값 fetch
const stats: StatCard[] = [
  { label: "오늘 방문자", value: "1,284", change: "+12%", positive: true },
  { label: "총 회원", value: "8,412", change: "+3%", positive: true },
  { label: "총 게시글", value: "3,209", change: "+7%", positive: true },
  { label: "신고 건수", value: "14", change: "+2", positive: false },
];

// 더미 최근 게시글 — 실제 구현 시 API에서 최신 4건 fetch
const recentPosts: RecentPost[] = [
  {
    id: 1,
    title: "강남 성형외과 후기 공유합니다",
    author: "user_jp_001",
    country: "일본",
    createdAt: "2026-03-24",
    reported: false,
  },
  {
    id: 2,
    title: "코수술 전후 사진 (6개월 경과)",
    author: "user_cn_042",
    country: "중국",
    createdAt: "2026-03-24",
    reported: true, // 신고 접수됨 — 검토 필요
  },
  {
    id: 3,
    title: "라식 수술 비용 문의",
    author: "user_us_018",
    country: "미국",
    createdAt: "2026-03-23",
    reported: false,
  },
  {
    id: 4,
    title: "피부과 리뷰 — 강남 vs 홍대",
    author: "user_th_007",
    country: "태국",
    createdAt: "2026-03-23",
    reported: false,
  },
];

// 더미 최근 추천 문의 — 실제 구현 시 API에서 최신 3건 fetch
const recentInquiries: RecentInquiry[] = [
  {
    id: 1,
    user: "user_jp_088",
    procedure: "쌍꺼풀 수술",
    status: "pending",
    createdAt: "2026-03-24",
  },
  {
    id: 2,
    user: "user_cn_019",
    procedure: "코 성형",
    status: "answered",
    createdAt: "2026-03-24",
  },
  {
    id: 3,
    user: "user_sg_033",
    procedure: "치아 교정",
    status: "pending",
    createdAt: "2026-03-23",
  },
];

// 문의 상태별 배지 배경/텍스트 색상 매핑
const statusColors: Record<RecentInquiry["status"], string> = {
  pending: "bg-yellow-100 text-yellow-700",
  answered: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};

// 문의 상태 코드를 한국어 레이블로 변환
const statusLabels: Record<RecentInquiry["status"], string> = {
  pending: "대기",
  answered: "답변완료",
  closed: "종료",
};

// AdminDashboard: 관리자 대시보드 메인 페이지 컴포넌트
export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">대시보드</h2>

      {/* 통계 카드 4개 — 반응형 그리드 (모바일 1열 → 태블릿 2열 → 데스크탑 4열) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
          >
            {/* 통계 항목명 */}
            <p className="text-sm text-gray-500">{stat.label}</p>
            {/* 수치 — 크게 강조 */}
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {stat.value}
            </p>
            {/* 전주 대비 변화량 — positive 여부로 색상 결정 */}
            <p
              className={`text-sm mt-1 ${stat.positive ? "text-green-600" : "text-red-500"}`}
            >
              {stat.change} 이번 주
            </p>
          </div>
        ))}
      </div>

      {/* 최근 게시글 목록 섹션 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* 섹션 헤더 — 제목 + 전체 보기 링크 */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">최근 게시글</h3>
          <a href={`/${locale}/admin/posts`} className="text-sm text-blue-600 hover:underline">
            전체 보기
          </a>
        </div>

        {/* 게시글 목록 테이블 */}
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-50">
              <th className="px-6 py-3 font-medium">제목</th>
              <th className="px-6 py-3 font-medium">작성자</th>
              <th className="px-6 py-3 font-medium">국가</th>
              <th className="px-6 py-3 font-medium">날짜</th>
              <th className="px-6 py-3 font-medium">신고</th>
            </tr>
          </thead>
          <tbody>
            {/* recentPosts 배열을 순회하여 각 게시글을 테이블 행으로 렌더링 */}
            {recentPosts.map((post) => (
              <tr
                key={post.id}
                className="border-b border-gray-50 hover:bg-gray-50"
              >
                <td className="px-6 py-3 text-gray-800">{post.title}</td>
                <td className="px-6 py-3 text-gray-600">{post.author}</td>
                <td className="px-6 py-3 text-gray-600">{post.country}</td>
                <td className="px-6 py-3 text-gray-500">{post.createdAt}</td>
                <td className="px-6 py-3">
                  {/* 신고된 게시글에만 빨간 배지 표시 */}
                  {post.reported && (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                      신고
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 최근 추천 문의 목록 섹션 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* 섹션 헤더 — 제목 + 전체 보기 링크 */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">최근 추천 문의</h3>
          <a
            href={`/${locale}/admin/inquiries`}
            className="text-sm text-blue-600 hover:underline"
          >
            전체 보기
          </a>
        </div>

        {/* 문의 목록 테이블 */}
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-50">
              <th className="px-6 py-3 font-medium">사용자</th>
              <th className="px-6 py-3 font-medium">시술 유형</th>
              <th className="px-6 py-3 font-medium">상태</th>
              <th className="px-6 py-3 font-medium">접수일</th>
            </tr>
          </thead>
          <tbody>
            {/* recentInquiries 배열을 순회하여 각 문의를 테이블 행으로 렌더링 */}
            {recentInquiries.map((inq) => (
              <tr
                key={inq.id}
                className="border-b border-gray-50 hover:bg-gray-50"
              >
                <td className="px-6 py-3 text-gray-800">{inq.user}</td>
                <td className="px-6 py-3 text-gray-600">{inq.procedure}</td>
                <td className="px-6 py-3">
                  {/* statusColors/statusLabels 맵으로 상태 코드를 색상 배지로 변환 */}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${statusColors[inq.status]}`}
                  >
                    {statusLabels[inq.status]}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-500">{inq.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
