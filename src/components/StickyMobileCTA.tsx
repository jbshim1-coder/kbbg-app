"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  // 로케일 추출: pathname의 첫 번째 세그먼트
  const locale = pathname.split("/")[1] || "en";

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY >= 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{ backgroundColor: "#1d1d1f" }}
    >
      <Link
        href={`/${locale}/ai-search`}
        className="flex items-center justify-center w-full text-white text-sm font-semibold"
        style={{ height: "56px" }}
      >
        Find Your Clinic → AI Search
      </Link>
    </div>
  );
}
