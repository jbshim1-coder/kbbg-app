// 심평원 데이터 일일 동기화 API
// 하루 1회 호출하여 심평원 데이터를 Supabase clinics 테이블에 저장
// Vercel Cron 또는 수동 호출로 트리거

import { NextResponse } from "next/server";
import { fetchHiraClinics } from "@/lib/hira-api";
import { createServiceRoleClient } from "@/lib/supabase";

// 수집 대상 진료과 코드 (성형, 피부, 치과, 안과)
const TARGET_SUBJECTS = ["08", "14", "49", "12"];

// 수집 대상 지역 코드 (서울, 부산, 대구, 인천, 제주)
const TARGET_REGIONS = ["110000", "210000", "220000", "230000", "500000"];

export async function POST() {
  try {
    const supabase = createServiceRoleClient();
    let totalSynced = 0;

    // 진료과 × 지역 조합으로 수집
    for (const subjectCd of TARGET_SUBJECTS) {
      for (const sidoCd of TARGET_REGIONS) {
        let pageNo = 1;
        let hasMore = true;

        while (hasMore) {
          const result = await fetchHiraClinics({
            dgsbjtCd: subjectCd,
            sidoCd: sidoCd,
            numOfRows: 100,
            pageNo: pageNo,
          });

          if (result.clinics.length === 0) {
            hasMore = false;
            break;
          }

          // Supabase clinics 테이블에 upsert
          for (const clinic of result.clinics) {
            const clinicData = {
              name: clinic.yadmNm,
              name_en: clinic.yadmNm, // 영문명은 추후 번역
              description: `${clinic.clCdNm} · ${clinic.dgsbjtCdNm}`,
              address: clinic.addr,
              city: clinic.sidoCdNm,
              phone: clinic.telno || null,
              website: clinic.hospUrl || null,
              latitude: clinic.YPos ? parseFloat(clinic.YPos) : null,
              longitude: clinic.XPos ? parseFloat(clinic.XPos) : null,
              is_verified: true,
              is_active: true,
              // 외국어 지원은 홈페이지 크롤링으로 추후 보강
              supports_english: false,
              supports_chinese: false,
              supports_japanese: false,
            };

            // ykiho(요양기관기호)를 고유 키로 사용하여 upsert
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from("clinics").upsert(
              { ...clinicData, id: clinic.ykiho },
              { onConflict: "id" }
            );

            totalSynced++;
          }

          // 다음 페이지 확인
          if (pageNo * 100 >= result.totalCount) {
            hasMore = false;
          } else {
            pageNo++;
          }

          // API 호출 간격 (rate limit 방지)
          await new Promise((r) => setTimeout(r, 200));
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${totalSynced} clinics synced`,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("HIRA sync error:", error);
    return NextResponse.json(
      { success: false, error: "Sync failed" },
      { status: 500 }
    );
  }
}
