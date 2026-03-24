"use client";

import { InputHTMLAttributes, forwardRef, ReactNode } from "react";

// Input 컴포넌트 props — 기본 input 속성에 추가 기능 확장
// prefix/suffix는 HTMLInputElement의 내장 속성명과 충돌을 피하기 위해 startSlot/endSlot으로 명명
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;       // 입력 필드 위에 표시할 레이블 텍스트
  error?: string;       // 유효성 검사 실패 시 표시할 에러 메시지
  hint?: string;        // 에러가 없을 때 표시할 도움말 텍스트
  startSlot?: ReactNode; // 입력창 왼쪽 내부에 표시 (예: 검색 아이콘)
  endSlot?: ReactNode;   // 입력창 오른쪽 내부에 표시 (예: 단위 텍스트)
  fullWidth?: boolean;  // true 시 부모 너비 100% 차지
}

// Input 컴포넌트 — forwardRef로 외부에서 ref 접근 가능
// 레이블, 에러 메시지, 힌트, prefix/suffix 슬롯을 통합 제공
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      startSlot,
      endSlot,
      fullWidth = false,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    // id가 없으면 label과의 연결을 위해 name 기반으로 생성
    const inputId = id ?? (props.name ? `input-${props.name}` : undefined);

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {/* 레이블 */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}

        {/* 입력 래퍼 — startSlot/endSlot 배치 */}
        <div className="relative flex items-center">
          {startSlot && (
            <span className="absolute left-3 text-gray-400 pointer-events-none">
              {startSlot}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={[
              "w-full rounded-lg border bg-white text-gray-900 placeholder-gray-400",
              "text-sm transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed",
              error
                ? "border-red-400 focus:ring-red-400"
                : "border-gray-300 hover:border-gray-400",
              startSlot ? "pl-9" : "pl-3",
              endSlot ? "pr-9" : "pr-3",
              "py-2",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />

          {endSlot && (
            <span className="absolute right-3 text-gray-400">{endSlot}</span>
          )}
        </div>

        {/* 에러 메시지 — 힌트보다 우선 표시 */}
        {error && (
          <p className="mt-1 text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p className="mt-1 text-xs text-gray-400">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
export type { InputProps };
