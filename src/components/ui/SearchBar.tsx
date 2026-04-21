"use client";

import { useState, FormEvent, ChangeEvent, KeyboardEvent } from "react";
import { Search, X } from "lucide-react";

// SearchBar 컴포넌트 props
interface SearchBarProps {
  placeholder?: string;              // 입력창 안내 텍스트
  defaultValue?: string;             // 초기 검색어 값
  onSearch?: (query: string) => void; // 검색 실행 콜백 (엔터·폼 제출 시 호출)
  onClear?: () => void;              // 검색어 지우기 콜백
  className?: string;                // 폼 컨테이너 추가 클래스
  autoFocus?: boolean;               // 마운트 시 자동 포커스 여부
  size?: "sm" | "md" | "lg";        // 입력창 크기
}

const sizeStyles = {
  sm: { input: "py-1.5 text-sm", icon: 14 },
  md: { input: "py-2 text-base", icon: 16 },
  lg: { input: "py-3 text-lg", icon: 18 },
};

// SearchBar 컴포넌트 — form 기반으로 엔터/버튼 제출 모두 처리
export default function SearchBar({
  placeholder = "검색어를 입력하세요...",
  defaultValue = "",
  onSearch,
  onClear,
  className = "",
  autoFocus = false,
  size = "md",
}: SearchBarProps) {
  // 현재 검색어 상태 (controlled input)
  const [query, setQuery] = useState(defaultValue);
  // 선택된 크기에 맞는 input 및 아이콘 크기 추출
  const { input: inputSize, icon: iconSize } = sizeStyles[size];

  // 입력값 변경 핸들러 — query 상태 업데이트
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // 폼 제출 핸들러 — 공백 제거 후 onSearch 호출
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch?.(query.trim());
  };

  // 검색어 초기화 핸들러 — 상태 비우고 onClear 콜백 호출
  const handleClear = () => {
    setQuery("");
    onClear?.();
  };

  // 엔터 키 검색 지원 (form submit으로 처리되지만 명시적으로도 처리)
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearch?.(query.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={["flex items-center w-full", className].filter(Boolean).join(" ")}
      role="search"
    >
      <div className="relative flex items-center w-full">
        {/* 검색 아이콘 */}
        <Search
          size={iconSize}
          className="absolute left-3 text-gray-400 pointer-events-none"
          aria-hidden="true"
        />

        <input
          type="search"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-label="Search"
          className={[
            "w-full pl-9 pr-9 rounded-[var(--radius-md)] border-[3px] border-[rgba(0,0,0,0.04)] bg-[#fafafc]",
            "text-[var(--foreground)] placeholder-[var(--foreground-tertiary)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent focus:bg-white",
            "transition-all duration-200",
            inputSize,
          ].join(" ")}
        />

        {/* 입력값이 있을 때만 지우기 버튼 표시 */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3 p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={iconSize - 2} />
          </button>
        )}
      </div>

      {/* 접근성을 위한 숨김 제출 버튼 */}
      <button type="submit" className="sr-only">
        검색
      </button>
    </form>
  );
}

export type { SearchBarProps };
