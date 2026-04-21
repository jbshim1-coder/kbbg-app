// 커뮤니티 공통 유틸 — FLAIR_STYLE, formatRelativeTime 등

export type FlairType = "review" | "question" | "info" | "before_after" | "cost" | "recommend";

export const FLAIR_STYLE: Record<FlairType, { bg: string; text: string; label: string; labelEn: string }> = {
  review:       { bg: "bg-blue-100",   text: "text-blue-700",   label: "후기",        labelEn: "Review" },
  question:     { bg: "bg-yellow-100", text: "text-yellow-700", label: "질문",        labelEn: "Question" },
  info:         { bg: "bg-gray-100",   text: "text-gray-700",   label: "정보",        labelEn: "Info" },
  before_after: { bg: "bg-purple-100", text: "text-purple-700", label: "Before/After", labelEn: "Before/After" },
  cost:         { bg: "bg-green-100",  text: "text-green-700",  label: "비용공유",     labelEn: "Cost" },
  recommend:    { bg: "bg-rose-100",   text: "text-rose-700",   label: "병원추천",     labelEn: "Recommend" },
};

// ISO 시간 → 상대 시간 문자열 (예: "3h ago", "2d ago")
export function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
