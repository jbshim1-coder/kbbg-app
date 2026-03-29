"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

// 여러 곳에 삽입 가능한 뷰티 분위기 배너
export default function BeautyMoodBanner({
  image = "/hero/skincare.jpg",
  titleKo = "피부가 달라지는 경험",
  titleEn = "Experience the Difference",
  subKo = "한국 피부과 전문의가 추천하는 맞춤 시술",
  subEn = "Personalized treatments recommended by Korean dermatologists",
  height = "h-[200px] sm:h-[240px]",
}: {
  image?: string;
  titleKo?: string;
  titleEn?: string;
  subKo?: string;
  subEn?: string;
  height?: string;
}) {
  const pathname = usePathname();
  const isKo = (pathname.split("/")[1] || "en") === "ko";

  return (
    <section className={`relative w-full ${height} overflow-hidden`}>
      <Image src={image} alt="K-Beauty" fill className="object-cover" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/20" />
      <div className="relative z-10 flex flex-col justify-center h-full px-8 sm:px-16">
        <p className="text-xl sm:text-2xl font-bold text-white">{isKo ? titleKo : titleEn}</p>
        <p className="mt-1 text-sm text-white/70">{isKo ? subKo : subEn}</p>
      </div>
    </section>
  );
}
