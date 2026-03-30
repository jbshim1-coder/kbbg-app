"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

// 버튼 변형 및 크기 타입 정의
type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

// 변형별 스타일 맵
const variantStyles: Record<Variant, string> = {
  primary:
    "bg-slate-800 text-white hover:bg-slate-900 active:bg-blue-800 disabled:bg-blue-300",
  secondary:
    "bg-slate-700 text-white hover:bg-slate-800 active:bg-slate-900 disabled:bg-slate-300",
  outline:
    "border border-slate-600 text-slate-700 hover:bg-slate-50 active:bg-blue-100 disabled:border-slate-300 disabled:text-blue-200",
  ghost:
    "text-gray-700 hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-300",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300",
};

// 크기별 스타일 맵
const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

// Button 컴포넌트 — forwardRef로 외부에서 ref 접근 가능
// variant, size, loading, fullWidth props로 다양한 스타일 조합 지원
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",  // 기본 변형: primary (파란 배경)
      size = "md",          // 기본 크기: 중간
      loading = false,      // 로딩 스피너 표시 여부
      fullWidth = false,    // 전체 너비 사용 여부
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    // disabled prop 또는 loading 중일 때 버튼 비활성화
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
          "transition-colors duration-150 cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2",
          "disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? "w-full" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {/* 로딩 스피너 */}
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
export type { ButtonProps, Variant as ButtonVariant, Size as ButtonSize };
