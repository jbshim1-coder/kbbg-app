import { getLevelColor } from "@/lib/level-system";

interface LevelBadgeProps {
  level: number | "M";
  size?: "sm" | "md";
}

// 레벨 뱃지 — 회원 아이콘 옆에 작은 원형 뱃지로 레벨 표시
// 마스터(M)는 빨간색, 일반 레벨은 레벨별 색상 적용
export default function LevelBadge({ level, size = "sm" }: LevelBadgeProps) {
  const colorClass = getLevelColor(level);
  const sizeClass = size === "sm"
    ? "w-5 h-5 text-[10px]"
    : "w-6 h-6 text-xs";

  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-full font-bold leading-none flex-shrink-0",
        colorClass,
        sizeClass,
      ].join(" ")}
      aria-label={`Level ${level}`}
    >
      {level}
    </span>
  );
}
