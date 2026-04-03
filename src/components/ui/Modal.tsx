"use client";

import { useEffect, useCallback, ReactNode } from "react";
import { X } from "lucide-react";

// 모달 크기 타입 — sm~xl 고정폭, full은 화면 너비에 맞춤
type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

// Modal 컴포넌트 props
interface ModalProps {
  open: boolean;           // 모달 표시 여부
  onClose: () => void;     // 모달 닫기 콜백
  title?: string;          // 모달 헤더 타이틀 (없으면 헤더 타이틀 영역 생략)
  size?: ModalSize;        // 모달 너비 크기
  // 오버레이 클릭 시 닫기 비활성화 옵션
  closeOnOverlay?: boolean; // false 시 오버레이 클릭으로 닫기 불가
  children: ReactNode;     // 모달 본문 내용
  footer?: ReactNode;      // 모달 하단 영역 (확인/취소 버튼 등)
}

// 크기별 max-width 스타일 맵
const sizeStyles: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full mx-4",
};

// Modal 컴포넌트 — 접근성(role, aria) 및 키보드(ESC) 지원 포함
export default function Modal({
  open,
  onClose,
  title,
  size = "md",
  closeOnOverlay = true,
  children,
  footer,
}: ModalProps) {
  // ESC 키 입력 시 모달 닫기
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    // 모달 열린 동안 배경 스크롤 방지
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    // 오버레이
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* 반투명 배경 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeOnOverlay ? onClose : undefined}
        aria-hidden="true"
      />

      {/* 모달 패널 */}
      <div
        className={[
          "relative z-10 w-full bg-white rounded-[var(--radius-lg)] apple-shadow",
          "flex flex-col max-h-[90vh]",
          sizeStyles[size],
        ].join(" ")}
      >
        {/* 헤더 */}
        {(title || true) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-[var(--foreground)]"
              >
                {title}
              </h2>
            )}
            <button
              onClick={onClose}
              className="ml-auto p-1.5 rounded-[var(--radius-sm)] text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-all duration-200"
              aria-label="모달 닫기"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* 본문 — 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

        {/* 푸터 (선택) */}
        {footer && (
          <div className="px-6 py-4 border-t border-[var(--border)]">{footer}</div>
        )}
      </div>
    </div>
  );
}

export type { ModalProps };
