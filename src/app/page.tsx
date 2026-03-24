// 루트 경로(/) 접속 시 기본 언어(/en)로 리다이렉트
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/en");
}
