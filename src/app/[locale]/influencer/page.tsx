"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";

// 한국 뷰티/의료 인플루언서 더미 데이터 8개
const INFLUENCERS = [
  {
    id: 1,
    name: "이수진",
    field: "beauty",
    followers: "2.4M",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    intro: "10년 경력 뷰티 크리에이터, K-스킨케어 루틴 전문",
    emoji: "💄",
  },
  {
    id: 2,
    name: "박민준",
    field: "plastic",
    followers: "890K",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    intro: "성형외과 전문의, 시술 정보와 리얼 후기 공유",
    emoji: "🏥",
  },
  {
    id: 3,
    name: "김하나",
    field: "skin",
    followers: "1.8M",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    intro: "피부과 전문의 출신, 피부 고민 솔루션 크리에이터",
    emoji: "✨",
  },
  {
    id: 4,
    name: "최유리",
    field: "beauty",
    followers: "3.2M",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    intro: "메이크업 아티스트, K-뷰티 트렌드 리포터",
    emoji: "🌸",
  },
  {
    id: 5,
    name: "정다은",
    field: "skin",
    followers: "560K",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    intro: "민감성 피부 전문 뷰티 블로거",
    emoji: "🍃",
  },
  {
    id: 6,
    name: "이준혁",
    field: "plastic",
    followers: "1.1M",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    intro: "성형 전후 비교 콘텐츠, 해외 환자 상담 경험 공유",
    emoji: "🔬",
  },
  {
    id: 7,
    name: "서아름",
    field: "beauty",
    followers: "4.5M",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    intro: "한국 1위 K-뷰티 인플루언서, 글로벌 협업 다수",
    emoji: "⭐",
  },
  {
    id: 8,
    name: "한지수",
    field: "skin",
    followers: "720K",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    intro: "천연 성분 스킨케어 전도사, 비건 뷰티 전문",
    emoji: "🌿",
  },
];

const FIELD_COLORS: Record<string, string> = {
  beauty: "bg-pink-50 text-pink-600",
  plastic: "bg-blue-50 text-blue-600",
  skin: "bg-green-50 text-green-600",
};

export default function InfluencerPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const fieldLabel = (field: string) =>
    t(`influencer.field_${field}` as Parameters<typeof t>[0]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* 헤더 */}
      <div className="bg-white border-b border-purple-100 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <Link href={`/${locale}`} className="text-xs text-gray-400 hover:text-purple-500 transition-colors mb-3 inline-block">
            ← {t("nav.home")}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t("influencer.title")}</h1>
          <p className="mt-2 text-gray-500">{t("influencer.subtitle")}</p>
        </div>
      </div>

      {/* 인플루언서 그리드 */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {INFLUENCERS.map((inf) => (
            <div
              key={inf.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3"
            >
              {/* 아바타 */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-3xl mx-auto">
                {inf.emoji}
              </div>

              {/* 이름 & 분야 */}
              <div className="text-center">
                <p className="font-bold text-gray-900">{inf.name}</p>
                <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${FIELD_COLORS[inf.field]}`}>
                  {fieldLabel(inf.field)}
                </span>
              </div>

              {/* 팔로워 */}
              <div className="text-center">
                <p className="text-xs text-gray-400">{t("influencer.followers_label")}</p>
                <p className="text-lg font-bold text-purple-600">{inf.followers}</p>
              </div>

              {/* 한줄 소개 */}
              <p className="text-xs text-gray-500 text-center leading-relaxed">{inf.intro}</p>

              {/* SNS 링크 */}
              <div className="flex gap-2 justify-center mt-auto">
                <a
                  href={inf.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-xs font-medium px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 transition-opacity"
                >
                  {t("influencer.instagram")}
                </a>
                <a
                  href={inf.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500 text-white hover:opacity-90 transition-opacity"
                >
                  {t("influencer.youtube")}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
