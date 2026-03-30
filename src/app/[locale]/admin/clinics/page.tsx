// 병원 데이터 관리 페이지 — 등록된 병원 목록 조회, 인증 상태 확인, 수정/삭제 액션 제공

// 병원 데이터 구조
interface Clinic {
  id: number;
  name: string;           // 병원명
  district: string;       // 소재 구 (예: 강남구)
  specialties: string[];  // 전문 시술 목록
  phone: string;          // 대표 전화번호
  website: string;        // 공식 웹사이트 주소
  verified: boolean;      // 관리자 인증 완료 여부 — 인증된 병원만 상단 추천에 노출
  updatedAt: string;      // 최종 정보 수정일
}

// 더미 병원 목록 — 실제 구현 시 DB에서 fetch
const clinics: Clinic[] = [
  {
    id: 1,
    name: "강남뷰티성형외과",
    district: "강남구",
    specialties: ["쌍꺼풀", "코 성형", "지방흡입"],
    phone: "02-1234-5678",
    website: "www.example-clinic1.com",
    verified: true,
    updatedAt: "2026-03-10",
  },
  {
    id: 2,
    name: "압구정 라인클리닉",
    district: "강남구",
    specialties: ["보톡스", "필러", "피부 레이저"],
    phone: "02-9876-5432",
    website: "www.example-clinic2.com",
    verified: true,
    updatedAt: "2026-02-28",
  },
  {
    id: 3,
    name: "신촌 아이디어치과",
    district: "서대문구",
    specialties: ["치아교정", "임플란트", "미백"],
    phone: "02-5555-1234",
    website: "www.example-clinic3.com",
    verified: false, // 미인증 — 정보 검수 후 인증 처리 필요
    updatedAt: "2026-01-15",
  },
  {
    id: 4,
    name: "홍대 스킨케어의원",
    district: "마포구",
    specialties: ["여드름", "색소", "피부관리"],
    phone: "02-3333-7890",
    website: "www.example-clinic4.com",
    verified: true,
    updatedAt: "2026-03-20",
  },
];

// AdminClinicsPage: 병원 카드 목록을 표시하고 수정/삭제 액션을 제공하는 페이지 컴포넌트
export default function AdminClinicsPage() {
  return (
    <div className="space-y-6">
      {/* 페이지 헤더 — 제목 + 병원 추가 버튼 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">병원 데이터 관리</h2>
        {/* 새 병원 등록 버튼 — 클릭 시 등록 폼으로 이동 (미구현) */}
        <button className="text-sm px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors">
          + 병원 추가
        </button>
      </div>

      {/* 병원 카드 목록 — clinics 배열을 순회하여 카드 형태로 렌더링 */}
      <div className="grid gap-4">
        {clinics.map((clinic) => (
          <div
            key={clinic.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
          >
            <div className="flex justify-between items-start">
              {/* 병원 정보 영역 */}
              <div className="flex-1">
                {/* 병원명 + 인증 배지 */}
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{clinic.name}</h3>
                  {/* verified 여부에 따라 인증/미인증 배지를 조건부 렌더링 */}
                  {clinic.verified ? (
                    <span className="text-xs bg-blue-100 text-slate-700 px-2 py-0.5 rounded-full">
                      인증됨
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      미인증
                    </span>
                  )}
                </div>

                {/* 지역 · 전화번호 · 웹사이트 한 줄 요약 */}
                <p className="text-sm text-gray-500 mt-1">
                  {clinic.district} · {clinic.phone} · {clinic.website}
                </p>

                {/* 전문 시술 태그 목록 — specialties 배열을 작은 배지로 렌더링 */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {clinic.specialties.map((spec) => (
                    <span
                      key={spec}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* 최종 데이터 수정일 — 정보 최신성 확인용 */}
                <p className="text-xs text-gray-400 mt-2">
                  최종 수정: {clinic.updatedAt}
                </p>
              </div>

              {/* 수정/삭제 액션 버튼 영역 */}
              <div className="flex gap-2 ml-4">
                <button className="text-sm px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg hover:bg-blue-100 transition-colors">
                  수정
                </button>
                <button className="text-sm px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
