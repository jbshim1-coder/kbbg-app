// 일일 자동 동기화 Cron API
// Vercel Cron에서 매일 03:00 UTC에 GET으로 호출
// CRON_SECRET 환경변수로 무단 호출 차단

import { NextRequest, NextResponse } from "next/server";
import { fetchHiraClinics } from "@/lib/hira-api";
import { createServiceRoleClient } from "@/lib/supabase";

// 수집 대상 진료과 코드 (성형, 피부, 치과, 안과)
const TARGET_SUBJECTS = ["08", "14", "49", "12"];

// 수집 대상 지역 코드 (서울, 부산, 대구, 인천, 제주)
const TARGET_REGIONS = ["110000", "210000", "220000", "230000", "500000"];

export async function GET(request: NextRequest) {
  // CRON_SECRET 검증 — Authorization: Bearer <secret>
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

          for (const clinic of result.clinics) {
            const clinicData = {
              name: clinic.yadmNm,
              name_en: clinic.yadmNm,
              description: `${clinic.clCdNm} · ${clinic.dgsbjtCdNm}`,
              address: clinic.addr,
              city: clinic.sidoCdNm,
              phone: clinic.telno || null,
              website: clinic.hospUrl || null,
              latitude: clinic.YPos ? parseFloat(clinic.YPos) : null,
              longitude: clinic.XPos ? parseFloat(clinic.XPos) : null,
              is_verified: true,
              is_active: true,
              supports_english: false,
              supports_chinese: false,
              supports_japanese: false,
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from("clinics").upsert(
              { ...clinicData, id: clinic.ykiho },
              { onConflict: "id" }
            );

            totalSynced++;
          }

          if (pageNo * 100 >= result.totalCount) {
            hasMore = false;
          } else {
            pageNo++;
          }

          // API rate limit 방지
          await new Promise((r) => setTimeout(r, 200));
        }
      }
    }

    console.log(`[cron/sync] ${totalSynced} clinics synced at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: `${totalSynced} clinics synced`,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[cron/sync] Sync failed:", error);
    return NextResponse.json(
      { success: false, error: "Sync failed" },
      { status: 500 }
    );
  }
}
