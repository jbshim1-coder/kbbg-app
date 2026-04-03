import { HTMLAttributes, forwardRef } from "react";

// 카드 변형 타입 — shadow 강도로 구분
type CardVariant = "flat" | "raised" | "bordered";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
}

// 카드 하위 컴포넌트 props — HTMLDivElement 속성 그대로 확장
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}
interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

// Apple 스타일 변형별 스타일 맵
const variantStyles: Record<CardVariant, string> = {
  flat: "bg-white",
  raised: "bg-white apple-shadow-sm",
  bordered: "bg-white border border-[var(--border)]",
};

// 패딩 크기별 스타일 맵
const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
};

// 기본 카드 컨테이너 — forwardRef로 외부에서 ref 접근 가능
// hoverable=true 시 hover 시 그림자 강화 및 커서 포인터 적용
const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "raised",  // 기본 변형: raised (그림자 있음)
      padding = "md",      // 기본 패딩: 중간
      hoverable = false,   // 기본값: hover 효과 없음
      className = "",
      children,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={[
        "rounded-[var(--radius-md)] overflow-hidden",
        variantStyles[variant],
        paddingStyles[padding],
        hoverable
          ? "transition-shadow duration-200 hover:shadow-md cursor-pointer"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  )
);

Card.displayName = "Card";

// 카드 헤더 — 하단 구분선 포함
const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={["border-b border-[var(--border)] pb-4 mb-4", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = "CardHeader";

const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className = "", children, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
);

CardBody.displayName = "CardBody";

// 카드 푸터 — 상단 구분선 포함
const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={["border-t border-[var(--border)] pt-4 mt-4", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = "CardFooter";

export default Card;
export { CardHeader, CardBody, CardFooter };
export type { CardProps };
