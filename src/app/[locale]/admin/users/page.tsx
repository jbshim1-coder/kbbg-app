// 사용자 관리 페이지 — 회원 목록 조회, 국가별 통계 요약, 정지/차단 액션 제공

// 회원 계정의 활성화 상태 유형
type UserStatus = "active" | "suspended" | "banned";

// 관리자 화면에서 사용하는 회원 데이터 구조
interface AdminUser {
  id: number;
  username: string;   // 사용자명 (고유 식별자)
  email: string;      // 이메일 주소
  country: string;    // 국적 — 외국인 의료관광 플랫폼 특성상 주요 필터 기준
  status: UserStatus; // 계정 활성화 상태
  postCount: number;  // 작성한 게시글 수
  joinedAt: string;   // 가입일 (ISO 날짜 문자열)
}

// 더미 회원 목록 — 실제 구현 시 API에서 페이지네이션으로 fetch
const users: AdminUser[] = [
  {
    id: 1,
    username: "user_jp_001",
    email: "jp001@example.com",
    country: "일본",
    status: "active",
    postCount: 12,
    joinedAt: "2025-11-03",
  },
  {
    id: 2,
    username: "user_cn_042",
    email: "cn042@example.com",
    country: "중국",
    status: "suspended", // 이상 활동으로 일시 정지된 계정
    postCount: 8,
    joinedAt: "2025-12-15",
  },
  {
    id: 3,
    username: "user_us_018",
    email: "us018@example.com",
    country: "미국",
    status: "active",
    postCount: 4,
    joinedAt: "2026-01-08",
  },
  {
    id: 4,
    username: "user_th_007",
    email: "th007@example.com",
    country: "태국",
    status: "active",
    postCount: 21, // 가장 활발한 기여자
    joinedAt: "2025-09-22",
  },
  {
    id: 5,
    username: "user_vn_091",
    email: "vn091@example.com",
    country: "베트남",
    status: "banned", // 규정 위반으로 영구 차단된 계정
    postCount: 3,
    joinedAt: "2026-02-14",
  },
  {
    id: 6,
    username: "user_sg_033",
    email: "sg033@example.com",
    country: "싱가포르",
    status: "active",
    postCount: 7,
    joinedAt: "2026-03-01",
  },
];

// 회원 상태별 배지 색상 매핑
const statusStyles: Record<UserStatus, string> = {
  active: "bg-green-100 text-green-700",
  suspended: "bg-yellow-100 text-yellow-700",
  banned: "bg-red-100 text-red-600",
};

// 회원 상태 코드를 한국어 레이블로 변환
const statusLabels: Record<UserStatus, string> = {
  active: "정상",
  suspended: "정지",
  banned: "차단",
};

// AdminUsersPage: 전체 회원 목록과 국가별 분포를 보여주는 페이지 컴포넌트
export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      {/* 페이지 헤더 — 제목 + 총 회원 수 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">사용자 관리</h2>
        <span className="text-sm text-gray-500">총 {users.length}명</span>
      </div>

      {/* 국가별 회원 수 요약 카드 — 6개 국가를 그리드로 표시 */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {["일본", "중국", "미국", "태국", "베트남", "싱가포르"].map(
          (country) => {
            // 해당 국가에 속하는 회원 수를 필터링하여 카운트
            const count = users.filter((u) => u.country === country).length;
            return (
              <div
                key={country}
                className="bg-white rounded-lg border border-gray-100 px-4 py-3 text-center"
              >
                <p className="text-xs text-gray-500">{country}</p>
                <p className="text-lg font-bold text-gray-800">{count}</p>
              </div>
            );
          }
        )}
      </div>

      {/* 회원 목록 테이블 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-3 font-medium">사용자명</th>
              <th className="px-6 py-3 font-medium">이메일</th>
              <th className="px-6 py-3 font-medium">국가</th>
              <th className="px-6 py-3 font-medium">게시글 수</th>
              <th className="px-6 py-3 font-medium">상태</th>
              <th className="px-6 py-3 font-medium">가입일</th>
              <th className="px-6 py-3 font-medium">액션</th>
            </tr>
          </thead>
          <tbody>
            {/* users 배열을 순회하여 각 회원을 행으로 렌더링 */}
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-50 hover:bg-gray-50"
              >
                <td className="px-6 py-3 font-medium text-gray-800">
                  {user.username}
                </td>
                <td className="px-6 py-3 text-gray-600">{user.email}</td>
                <td className="px-6 py-3 text-gray-600">{user.country}</td>
                <td className="px-6 py-3 text-gray-600">{user.postCount}</td>
                <td className="px-6 py-3">
                  {/* statusStyles 맵으로 상태에 맞는 색상 배지 렌더링 */}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${statusStyles[user.status]}`}
                  >
                    {statusLabels[user.status]}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-500">{user.joinedAt}</td>
                <td className="px-6 py-3">
                  {/* 회원 제재 액션 버튼 — 정지(일시)/차단(영구) */}
                  <div className="flex gap-2">
                    <button className="text-xs px-2 py-1 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition-colors">
                      정지
                    </button>
                    <button className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors">
                      차단
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
