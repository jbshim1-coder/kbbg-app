// 심평원 데이터 일일 동기화 API
// 하루 1회 호출하여 심평원 데이터를 Supabase clinics 테이블에 저장
// 폐업 병원 자동 비활성화 포함
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
    const syncedYkihos = new Set<string>();

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
            syncedYkihos.add(clinic.ykiho);

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
              // 심평원 전용 필드
              ykiho: clinic.ykiho,
              cl_cd_nm: clinic.clCdNm,
              dgsbjt_cd: subjectCd,
              dgsbjt_cd_nm: clinic.dgsbjtCdNm,
              dr_tot_cnt: clinic.drTotCnt || 0,
              sdr_cnt: clinic.mdeptSdrCnt || clinic.sdrCnt || 0,
              sido_cd: sidoCd,
              sido_cd_nm: clinic.sidoCdNm,
              sggu_cd_nm: clinic.sgguCdNm,
              synced_at: new Date().toISOString(),
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

    // ── 마취과 전문의 수 업데이트 ──
    // 마취통증의학과(09) 데이터를 별도 수집하여, 이미 동기화된 병원에 마취과 전문의 수를 업데이트
    const ANESTHESIA_CODE = "09";
    for (const sidoCd of TARGET_REGIONS) {
      let pageNo = 1;
      let hasMore = true;
      while (hasMore) {
        const result = await fetchHiraClinics({
          dgsbjtCd: ANESTHESIA_CODE,
          sidoCd,
          numOfRows: 100,
          pageNo,
        });
        if (result.clinics.length === 0) { hasMore = false; break; }

        for (const clinic of result.clinics) {
          const sdrCount = clinic.mdeptSdrCnt || clinic.sdrCnt || 0;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from("clinics").update({
            anesthesia_sdr_count: sdrCount,
            safe_anesthesia_badge: sdrCount >= 1,
          }).eq("id", clinic.ykiho);
        }

        if (pageNo * 100 >= result.totalCount) {
          hasMore = false;
        } else {
          pageNo++;
        }
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    // ── 폐업 병원 비활성화 ──
    // 심평원에서 더이상 조회되지 않는 병원 = 폐업/휴업
    // is_active를 false로 변경 (데이터는 삭제하지 않음)
    let deactivatedCount = 0;
    if (syncedYkihos.size > 0) {
      // 현재 활성 상태인 병원 중, 이번 동기화에서 조회되지 않은 병원 찾기
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: activeClinics } = await (supabase as any)
        .from("clinics")
        .select("id")
        .eq("is_active", true)
        .eq("is_verified", true);

      if (activeClinics) {
        const toDeactivate = activeClinics
          .filter((c: { id: string }) => !syncedYkihos.has(c.id))
          .map((c: { id: string }) => c.id);

        if (toDeactivate.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from("clinics")
            .update({ is_active: false, synced_at: new Date().toISOString() })
            .in("id", toDeactivate);

          deactivatedCount = toDeactivate.length;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${totalSynced} clinics synced, ${deactivatedCount} deactivated`,
      totalSynced,
      deactivatedCount,
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
