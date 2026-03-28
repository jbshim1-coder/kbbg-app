// GA4 이벤트 헬퍼 — 페이지뷰 및 커스텀 이벤트 추적
// gtag.js는 GoogleAnalytics 컴포넌트에서 로드됨

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

// window.gtag 타입 선언
declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "js",
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

// 페이지뷰 추적 — next/navigation의 라우트 변경 시 호출
export function pageview(url: string) {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined") return;
  window.gtag("config", GA_MEASUREMENT_ID, { page_path: url });
}

// 커스텀 이벤트 추적
export function event(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined") return;
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
}

// 병원 검색 이벤트
export function trackHospitalSearch(query: string) {
  event("search", "hospital", query);
}

// AI 추천 요청 이벤트
export function trackAiRecommendation(query: string) {
  event("ai_recommendation", "engagement", query);
}

// 회원가입 완료 이벤트
export function trackSignUp(method: string) {
  event("sign_up", "authentication", method);
}

// 병원 상세 페이지 조회 이벤트
export function trackHospitalView(hospitalName: string) {
  event("view_hospital", "content", hospitalName);
}
