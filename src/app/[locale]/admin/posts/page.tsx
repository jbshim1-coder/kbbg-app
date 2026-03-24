// 게시글 관리 페이지 — 신고된 게시글 우선 표시, 상태별 필터링 및 승인/숨김/삭제 액션 제공

// 게시글의 노출 상태 유형
type PostStatus = "active" | "hidden" | "deleted";

// 관리자 화면에서 사용하는 게시글 데이터 구조
interface AdminPost {
  id: number;
  title: string;
  author: string;      // 작성자 사용자명
  country: string;     // 작성자 국적
  status: PostStatus;  // 현재 노출 상태
  reportCount: number; // 누적 신고 횟수 — 0이면 신고 없음
  createdAt: string;
}

// 더미 게시글 목록 — 신고 건수가 있는 항목을 앞에 배치하여 검토 우선순위 반영
// 실제 구현 시 API에서 reportCount DESC 정렬로 fetch
const posts: AdminPost[] = [
  {
    id: 2,
    title: "코수술 전후 사진 (6개월 경과)",
    author: "user_cn_042",
    country: "중국",
    status: "active",
    reportCount: 3,
    createdAt: "2026-03-24",
  },
  {
    id: 7,
    title: "허위 후기 의심 게시글",
    author: "user_vn_091",
    country: "베트남",
    status: "active",
    reportCount: 7, // 신고 다수 — 즉각 검토 필요
    createdAt: "2026-03-22",
  },
  {
    id: 1,
    title: "강남 성형외과 후기 공유합니다",
    author: "user_jp_001",
    country: "일본",
    status: "active",
    reportCount: 0,
    createdAt: "2026-03-24",
  },
  {
    id: 3,
    title: "라식 수술 비용 문의",
    author: "user_us_018",
    country: "미국",
    status: "hidden", // 관리자가 숨김 처리한 게시글
    reportCount: 0,
    createdAt: "2026-03-23",
  },
  {
    id: 4,
    title: "피부과 리뷰 — 강남 vs 홍대",
    author: "user_th_007",
    country: "태국",
    status: "active",
    reportCount: 0,
    createdAt: "2026-03-23",
  },
  {
    id: 5,
    title: "삭제된 스팸 게시글",
    author: "user_xx_000",
    country: "미상",
    status: "deleted", // 관리자가 삭제 처리한 게시글
    reportCount: 12,
    createdAt: "2026-03-20",
  },
];

// 게시글 상태별 배지 색상 매핑
const statusStyles: Record<PostStatus, string> = {
  active: "bg-green-100 text-green-700",
  hidden: "bg-yellow-100 text-yellow-700",
  deleted: "bg-red-100 text-red-600",
};

// 게시글 상태 코드를 한국어 레이블로 변환
const statusLabels: Record<PostStatus, string> = {
  active: "게시중",
  hidden: "숨김",
  deleted: "삭제됨",
};

// AdminPostsPage: 전체 게시글 목록을 테이블로 표시하고 관리 액션을 제공하는 페이지 컴포넌트
export default function AdminPostsPage() {
  return (
    <div className="space-y-6">
      {/* 페이지 헤더 — 제목 + 총 게시글 수 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">게시글 관리</h2>
        <span className="text-sm text-gray-500">총 {posts.length}개</span>
      </div>

      {/* 신고 게시글 경고 배너 — 신고 건수가 1건 이상인 게시글이 존재할 때만 표시 */}
      {posts.some((p) => p.reportCount > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-3 text-sm text-red-700">
          신고된 게시글 {posts.filter((p) => p.reportCount > 0).length}건이
          검토를 기다리고 있습니다.
        </div>
      )}

      {/* 게시글 목록 테이블 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-3 font-medium">제목</th>
              <th className="px-6 py-3 font-medium">작성자</th>
              <th className="px-6 py-3 font-medium">국가</th>
              <th className="px-6 py-3 font-medium">신고</th>
              <th className="px-6 py-3 font-medium">상태</th>
              <th className="px-6 py-3 font-medium">날짜</th>
              <th className="px-6 py-3 font-medium">액션</th>
            </tr>
          </thead>
          <tbody>
            {/* posts 배열을 순회하여 각 게시글을 행으로 렌더링 */}
            {posts.map((post) => (
              <tr
                key={post.id}
                // 신고된 게시글 행은 연한 빨간 배경으로 시각적으로 강조
                className={`border-b border-gray-50 hover:bg-gray-50 ${
                  post.reportCount > 0 ? "bg-red-50/30" : ""
                }`}
              >
                {/* 제목 — 긴 제목은 말줄임 처리 */}
                <td className="px-6 py-3 text-gray-800 max-w-xs truncate">
                  {post.title}
                </td>
                <td className="px-6 py-3 text-gray-600">{post.author}</td>
                <td className="px-6 py-3 text-gray-600">{post.country}</td>
                <td className="px-6 py-3">
                  {/* 신고 횟수가 1건 이상일 때만 빨간 배지로 건수 표시 */}
                  {post.reportCount > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">
                      {post.reportCount}건
                    </span>
                  )}
                </td>
                <td className="px-6 py-3">
                  {/* statusStyles 맵으로 상태에 맞는 색상 배지 렌더링 */}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${statusStyles[post.status]}`}
                  >
                    {statusLabels[post.status]}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-500">{post.createdAt}</td>
                <td className="px-6 py-3">
                  {/* 게시글 관리 액션 버튼 — 승인/숨김/삭제 */}
                  <div className="flex gap-2">
                    <button className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                      승인
                    </button>
                    <button className="text-xs px-2 py-1 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition-colors">
                      숨김
                    </button>
                    <button className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors">
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
