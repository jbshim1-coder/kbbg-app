"use client";

import {
  useState,
  useRef,
  useEffect,
  ReactNode,
  KeyboardEvent,
} from "react";
import { ChevronDown } from "lucide-react";

// 드롭다운 개별 항목 타입
interface DropdownItem {
  key: string;           // 리스트 렌더링 key
  label: ReactNode;      // 항목 표시 내용
  onClick?: () => void;  // 항목 클릭 핸들러
  disabled?: boolean;    // 비활성화 여부
  // 구분선을 아이템 위에 표시
  divider?: boolean;     // true 시 이 항목 위에 수평 구분선 렌더링
}

// Dropdown 컴포넌트 props
interface DropdownProps {
  trigger: ReactNode;          // 드롭다운을 여는 트리거 요소
  items: DropdownItem[];       // 드롭다운 항목 목록
  align?: "left" | "right";   // 메뉴 정렬 방향 (기본: left)
  // 트리거 옆에 화살표 아이콘 표시 여부
  showChevron?: boolean;
  className?: string;          // 컨테이너 추가 클래스
  menuClassName?: string;      // 메뉴 패널 추가 클래스
}

// Dropdown 컴포넌트 — 외부 클릭 감지 및 키보드 접근성(ESC) 지원
export default function Dropdown({
  trigger,
  items,
  align = "left",
  showChevron = false,
  className = "",
  menuClassName = "",
}: DropdownProps) {
  // 드롭다운 메뉴 열림/닫힘 상태
  const [open, setOpen] = useState(false);
  // 컨테이너 DOM 참조 — 외부 클릭 감지에 사용
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 키보드 접근성 — ESC로 닫기
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={["relative inline-block", className].filter(Boolean).join(" ")}
      onKeyDown={handleKeyDown}
    >
      {/* 트리거 영역 */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 cursor-pointer"
        role="button"
        aria-haspopup="true"
        aria-expanded={open}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOpen((prev) => !prev)}
      >
        {trigger}
        {showChevron && (
          <ChevronDown
            size={14}
            className={[
              "text-gray-500 transition-transform duration-150",
              open ? "rotate-180" : "",
            ].join(" ")}
          />
        )}
      </div>

      {/* 드롭다운 메뉴 */}
      {open && (
        <div
          role="menu"
          className={[
            "absolute z-40 mt-2 min-w-[10rem] bg-white rounded-xl shadow-lg",
            "border border-gray-100 py-1 animate-in fade-in slide-in-from-top-1",
            align === "right" ? "right-0" : "left-0",
            menuClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {items.map((item) => (
            <div key={item.key}>
              {/* 구분선 */}
              {item.divider && <hr className="my-1 border-gray-100" />}
              <button
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick?.();
                    setOpen(false);
                  }
                }}
                className={[
                  "w-full text-left px-4 py-2 text-sm transition-colors",
                  item.disabled
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-700 hover:bg-slate-50 hover:text-slate-700",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {item.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export type { DropdownProps, DropdownItem };
