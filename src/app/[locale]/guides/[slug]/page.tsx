// guides/[slug] → procedures/[slug] 리디렉션
// 같은 데이터(procedure-guides.ts)를 사용하므로 리디렉션으로 처리
import { redirect } from "next/navigation";
import { procedureGuides } from "@/data/procedure-guides";

export function generateStaticParams() {
  return procedureGuides.map((g) => ({ slug: g.slug }));
}

export default async function GuideSlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  redirect(`/${locale}/procedures/${slug}`);
}
