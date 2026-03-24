// 광고 관리 페이지 — 캠페인 목록, 노출수/클릭수/CTR 통계, 수정/삭제 액션 제공

// 광고 캠페인의 진행 상태 유형
type AdStatus = "active" | "paused" | "ended";

// 광고 캠페인 데이터 구조
interface AdCampaign {
  id: number;
  name: string;         // 캠페인 이름
  advertiser: string;   // 광고주 병원명
  status: AdStatus;     // 캠페인 현재 상태
  impressions: number;  // 누적 광고 노출수
  clicks: number;       // 누적 광고 클릭수
  budget: number;       // 캠페인 예산 (원화)
  startDate: string;    // 캠페인 시작일
  endDate: string;      // 캠페인 종료일
}

// 더미 캠페인 목록 — 실제 구현 시 광고 집계 API에서 fetch
const campaigns: AdCampaign[] = [
  {
    id: 1,
    name: "강남뷰티 봄 프로모션",
    advertiser: "강남뷰티성형외과",
    status: "active",
    impressions: 48320,
    clicks: 1204,
    budget: 500000,
    startDate: "2026-03-01",
    endDate: "2026-03-31",
  },
  {
    id: 2,
    name: "압구정 라인 신규 시술",
    advertiser: "압구정 라인클리닉",
    status: "active",
    impressions: 31500,
    clicks: 892,
    budget: 300000,
    startDate: "2026-03-10",
    endDate: "2026-04-10",
  },
  {
    id: 3,
    name: "치아교정 할인 이벤트",
    advertiser: "신촌 아이디어치과",
    status: "paused", // 광고주 요청으로 일시 중단
    impressions: 12400,
    clicks: 310,
    budget: 150000,
    startDate: "2026-02-15",
    endDate: "2026-04-15",
  },
  {
    id: 4,
    name: "피부관리 겨울 캠페인",
    advertiser: "홍대 스킨케어의원",
    status: "ended", // 계약 기간 만료로 종료된 캠페인
    impressions: 89200,
    clicks: 2130,
    budget: 800000,
    startDate: "2025-12-01",
    endDate: "2026-02-28",
  },
];

// 캠페인 상태별 배지 색상 매핑
const statusStyles: Record<AdStatus, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  ended: "bg-gray-100 text-gray-500",
};

// 캠페인 상태 코드를 한국어 레이블로 변환
const statusLabels: Record<AdStatus, string> = {
  active: "진행중",
  paused: "일시정지",
  ended: "종료",
};

// CTR(클릭률) 계산 함수 — clicks / impressions * 100, 소수점 2자리 반환
// 노출수가 0이면 나눗셈 오류 방지를 위해 "0.00%" 반환
function calcCtr(impressions: number, clicks: number): string {
  if (impressions === 0) return "0.00%";
  return ((clicks / impressions) * 100).toFixed(2) + "%";
}

// 숫자를 한국어 천 단위 쉼표 포맷으로 변환 (예: 48320 → "48,320")
function formatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}

// AdminAdsPage: 전체 광고 캠페인 현황과 통계를 보여주는 페이지 컴포넌트
export default function AdminAdsPage() {
  // 전체 통계 집계 — campaigns 배열에서 reduce로 합산
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  // 현재 진행 중인 캠페인 수만 별도 카운트
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 — 제목 + 캠페인 추가 버튼 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">광고 관리</h2>
        {/* 새 캠페인 등록 버튼 — 클릭 시 등록 폼으로 이동 (미구현) */}
        <button className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          + 캠페인 추가
        </button>
      </div>

      {/* 전체 광고 통계 요약 카드 3개 */}
      <div className="grid grid-cols-3 gap-5">
        {/* 진행중 캠페인 수 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">진행중 캠페인</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {activeCampaigns}
          </p>
        </div>
        {/* 전체 누적 노출수 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">총 노출수</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {formatNumber(totalImpressions)}
          </p>
        </div>
        {/* 전체 누적 클릭수 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">총 클릭수</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {formatNumber(totalClicks)}
          </p>
        </div>
      </div>

      {/* 캠페인 목록 테이블 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-3 font-medium">캠페인명</th>
              <th className="px-6 py-3 font-medium">광고주</th>
              <th className="px-6 py-3 font-medium">상태</th>
              <th className="px-6 py-3 font-medium">노출수</th>
              <th className="px-6 py-3 font-medium">클릭수</th>
              <th className="px-6 py-3 font-medium">CTR</th>
              <th className="px-6 py-3 font-medium">예산</th>
              <th className="px-6 py-3 font-medium">기간</th>
              <th className="px-6 py-3 font-medium">액션</th>
            </tr>
          </thead>
          <tbody>
            {/* campaigns 배열을 순회하여 각 캠페인을 행으로 렌더링 */}
            {campaigns.map((campaign) => (
              <tr
                key={campaign.id}
                className="border-b border-gray-50 hover:bg-gray-50"
              >
                <td className="px-6 py-3 font-medium text-gray-800">
                  {campaign.name}
                </td>
                <td className="px-6 py-3 text-gray-600">
                  {campaign.advertiser}
                </td>
                <td className="px-6 py-3">
                  {/* statusStyles 맵으로 상태에 맞는 색상 배지 렌더링 */}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${statusStyles[campaign.status]}`}
                  >
                    {statusLabels[campaign.status]}
                  </span>
                </td>
                {/* 노출수/클릭수는 천 단위 쉼표 포맷으로 표시 */}
                <td className="px-6 py-3 text-gray-700">
                  {formatNumber(campaign.impressions)}
                </td>
                <td className="px-6 py-3 text-gray-700">
                  {formatNumber(campaign.clicks)}
                </td>
                {/* CTR은 파란색으로 강조 표시 */}
                <td className="px-6 py-3 text-blue-600 font-medium">
                  {calcCtr(campaign.impressions, campaign.clicks)}
                </td>
                {/* 예산은 원화 기호와 함께 천 단위 쉼표 포맷으로 표시 */}
                <td className="px-6 py-3 text-gray-700">
                  ₩{formatNumber(campaign.budget)}
                </td>
                <td className="px-6 py-3 text-gray-500 text-xs">
                  {campaign.startDate} ~ {campaign.endDate}
                </td>
                <td className="px-6 py-3">
                  {/* 캠페인 관리 액션 버튼 — 수정/삭제 */}
                  <div className="flex gap-2">
                    <button className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                      수정
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
