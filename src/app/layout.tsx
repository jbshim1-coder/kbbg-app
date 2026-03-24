// 루트 레이아웃 - next-intl을 사용하므로 최소한의 래퍼만 유지
// 실제 html/body는 [locale]/layout.tsx에서 처리
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
