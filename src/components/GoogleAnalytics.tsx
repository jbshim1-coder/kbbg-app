"use client";

// GA4 스크립트 컴포넌트 — gtag.js 로드 및 초기화
// NEXT_PUBLIC_GA_MEASUREMENT_ID 환경변수가 없으면 렌더링 스킵
import Script from "next/script";
import { GA_MEASUREMENT_ID } from "@/lib/gtag";

export default function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
