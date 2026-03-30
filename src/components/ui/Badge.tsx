import { HTMLAttributes } from "react";

// 배지 변형 타입 — 의미별 색상 구분
type BadgeVariant =
  | "default"    // 기본: 회색
  | "primary"    // 주요: 파란색
  | "secondary"  // 보조: 핑크색
  | "success"    // 성공: 초록색
  | "warning"    // 경고: 노란색
  | "danger"     // 위험: 빨간색
  | "outline";   // 아웃라인: 테두리만

// 배지 크기 타입
type BadgeSize = "sm" | "md";

// Badge 컴포넌트 props
interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean; // 왼쪽 상태 점 표시 여부
}

// 변형별 배경색·텍스트 색상 스타일 맵
const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  primary: "bg-blue-100 text-slate-700",
  secondary: "bg-pink-100 text-pink-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-700",
  outline: "border border-gray-300 text-gray-600 bg-transparent",
};

// 점 색상은 배경색 계열과 맞춤
const dotStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-500",
  primary: "bg-slate-800",
  secondary: "bg-slate-800",
  success: "bg-green-600",
  warning: "bg-yellow-500",
  danger: "bg-red-600",
  outline: "bg-gray-500",
};

// 크기별 패딩·폰트 크기 스타일 맵
const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

// Badge 컴포넌트 — 상태·카테고리 표시용 인라인 라벨
export default function Badge({
  variant = "default",
  size = "sm",
  dot = false,
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        variantStyles[variant],
        sizeStyles[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {dot && (
        <span
          className={["w-1.5 h-1.5 rounded-full flex-shrink-0", dotStyles[variant]].join(" ")}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export type { BadgeProps, BadgeVariant };
