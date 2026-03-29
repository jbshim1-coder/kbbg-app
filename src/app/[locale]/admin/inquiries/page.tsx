// 추천 문의 관리 페이지 — 접수된 문의 목록 확인, 답변/종료 처리, 미답변 건 경고 표시

// 문의 처리 상태 유형
type InquiryStatus = "pending" | "answered" | "closed";

// 추천 문의 데이터 구조
interface Inquiry {
  id: number;
  user: string;                  // 문의한 사용자명
  country: string;               // 사용자 국적
  procedure: string;             // 원하는 시술 종류
  budget: string;                // 예산 범위 (예: "100~200만원")
  message: string;               // 문의 상세 내용
  status: InquiryStatus;         // 처리 상태
  assignedClinic: string | null; // 배정된 병원명 — null이면 아직 미배정
  createdAt: string;             // 문의 접수일
}

// 더미 문의 목록 — 실제 구현 시 API에서 최신순으로 fetch
const inquiries: Inquiry[] = [
  {
    id: 1,
    user: "user_jp_088",
    country: "일본",
    procedure: "쌍꺼풀 수술",
    budget: "100~200만원",
    message: "자연스러운 쌍꺼풀을 원합니다. 매몰법과 절개법 중 추천 부탁드립니다.",
    status: "pending", // 아직 답변하지 않은 문의
    assignedClinic: null,
    createdAt: "2026-03-24",
  },
  {
    id: 2,
    user: "user_cn_019",
    country: "중국",
    procedure: "코 성형",
    budget: "200~300만원",
    message: "콧대를 높이고 싶습니다. 실리콘 vs 귀 연골 어떤 게 좋을까요?",
    status: "answered", // 병원 배정 및 답변 완료
    assignedClinic: "강남뷰티성형외과",
    createdAt: "2026-03-24",
  },
  {
    id: 3,
    user: "user_sg_033",
    country: "싱가포르",
    procedure: "치아 교정",
    budget: "300~500만원",
    message: "투명 교정기 브랜드 추천과 대략적인 기간이 궁금합니다.",
    status: "pending", // 아직 답변하지 않은 문의
    assignedClinic: null,
    createdAt: "2026-03-23",
  },
  {
    id: 4,
    user: "user_us_055",
    country: "미국",
    procedure: "피부 레이저",
    budget: "50~100만원",
    message: "기미와 색소 제거를 원합니다. 방문 일정은 4월 초 예정입니다.",
    status: "closed", // 처리 완료로 종료된 문의
    assignedClinic: "압구정 라인클리닉",
    createdAt: "2026-03-20",
  },
];

// 문의 상태별 배지 색상 매핑
const statusStyles: Record<InquiryStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  answered: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-500",
};

// 문의 상태 코드를 한국어 레이블로 변환
const statusLabels: Record<InquiryStatus, string> = {
  pending: "대기중",
  answered: "답변완료",
  closed: "종료",
};

// AdminInquiriesPage: 추천 문의 목록을 카드 형태로 보여주는 페이지 컴포넌트
export default function AdminInquiriesPage() {
  // 아직 답변하지 않은(pending) 문의 건수 계산 — 경고 배너 표시 여부에 사용
  const pendingCount = inquiries.filter((i) => i.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 — 제목 + 총 문의 건수 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">추천 문의 관리</h2>
        <span className="text-sm text-gray-500">총 {inquiries.length}건</span>
      </div>

      {/* 미답변 문의 경고 배너 — pending 건수가 1건 이상일 때만 표시 */}
      {pendingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-5 py-3 text-sm text-yellow-700">
          답변 대기 중인 문의 {pendingCount}건이 있습니다.
        </div>
      )}

      {/* 문의 카드 목록 — inquiries 배열을 순회하여 카드로 렌더링 */}
      <div className="grid gap-4">
        {inquiries.map((inq) => (
          <div
            key={inq.id}
            // pending 상태인 문의는 노란 테두리로 시각적 강조
            className={`bg-white rounded-xl shadow-sm border p-5 ${
              inq.status === "pending"
                ? "border-yellow-200"
                : "border-gray-100"
            }`}
          >
            <div className="flex justify-between items-start">
              {/* 문의 상세 정보 영역 */}
              <div className="flex-1">
                {/* 상단 메타 정보 — 사용자명, 국가, 상태 배지, 접수일 */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-medium text-gray-900">{inq.user}</span>
                  <span className="text-xs text-gray-500">{inq.country}</span>
                  {/* statusStyles 맵으로 상태에 맞는 색상 배지 렌더링 */}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${statusStyles[inq.status]}`}
                  >
                    {statusLabels[inq.status]}
                  </span>
                  {/* 접수일은 오른쪽 끝으로 밀어서 배치 */}
                  <span className="text-xs text-gray-400 ml-auto">
                    {inq.createdAt}
                  </span>
                </div>

                {/* 문의 핵심 정보 — 시술 종류, 예산, 배정 병원(있을 때만) */}
                <div className="flex gap-4 text-sm mb-2">
                  <span className="text-gray-500">
                    시술:{" "}
                    <span className="text-gray-800 font-medium">
                      {inq.procedure}
                    </span>
                  </span>
                  <span className="text-gray-500">
                    예산:{" "}
                    <span className="text-gray-800 font-medium">
                      {inq.budget}
                    </span>
                  </span>
                  {/* 병원이 배정된 경우에만 배정 정보를 파란색으로 표시 */}
                  {inq.assignedClinic && (
                    <span className="text-gray-500">
                      배정:{" "}
                      <span className="text-teal-600 font-medium">
                        {inq.assignedClinic}
                      </span>
                    </span>
                  )}
                </div>

                {/* 문의 본문 내용 — 회색 배경 박스로 구분 */}
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                  {inq.message}
                </p>
              </div>

              {/* 문의 처리 액션 버튼 — 답변하기/종료 */}
              <div className="flex flex-col gap-2 ml-5 shrink-0">
                <button className="text-sm px-3 py-1.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-blue-100 transition-colors">
                  답변하기
                </button>
                <button className="text-sm px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  종료
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
