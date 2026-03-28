// 일일 자동 동기화 Cron API
// Vercel Cron에서 매일 03:00 UTC에 GET으로 호출
// CRON_SECRET 환경변수로 무단 호출 차단

import { NextRequest, NextResponse } from "next/server";
import { fetchHiraClinics, SUBJECT_CODES, SIDO_CODES } from "@/lib/hira-api";
import { fetchGoogleRating } from "@/lib/google-places";
import { createServiceRoleClient } from "@/lib/supabase";

// 전체 진료과목 코드 (SUBJECT_CODES에 등록된 모든 코드)
const TARGET_SUBJECTS = Object.keys(SUBJECT_CODES);

// 전체 지역 코드
const TARGET_REGIONS = Object.keys(SIDO_CODES);

// 한의원/한방병원 종별코드 — dgsbjtCd 없이 clCd로 수집
const KOREAN_MEDICINE_CL_CDS = ["91", "92"]; // 91: 한방병원, 92: 한의원

export async function GET(request: NextRequest) {
  // CRON_SECRET 검증
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // region 파라미터 — 특정 지역만 동기화 가능 (Vercel 타임아웃 대응)
  const { searchParams } = new URL(request.url);
  const regionParam = searchParams.get("region");
  const regions = regionParam ? [regionParam] : TARGET_REGIONS;

  try {
    const supabase = createServiceRoleClient();
    let totalSynced = 0;
    const syncedAt = new Date().toISOString();

    // 1) 진료과목별 수집
    for (const subjectCd of TARGET_SUBJECTS) {
      for (const sidoCd of regions) {
        try {
          const result = await fetchHiraClinics({
            dgsbjtCd: subjectCd,
            sidoCd: sidoCd,
            numOfRows: 100,
            pageNo: 1,
          });

          if (result.clinics.length === 0) continue;

          const rows = result.clinics.map((c) => ({
            ykiho: c.ykiho,
            name: c.yadmNm,
            name_en: c.yadmNm,
            description: `${c.clCdNm} · ${c.dgsbjtCdNm}`,
            address: c.addr,
            city: c.sidoCdNm,
            phone: c.telno || null,
            website: c.hospUrl || null,
            cl_cd: null as string | null,
            cl_cd_nm: c.clCdNm,
            dgsbjt_cd: subjectCd,
            dgsbjt_cd_nm: c.dgsbjtCdNm,
            dr_tot_cnt: c.drTotCnt || 0,
            sdr_cnt: (c.mdeptSdrCnt || c.sdrCnt || 0) as number,
            sido_cd: sidoCd,
            sido_cd_nm: c.sidoCdNm,
            sggu_cd_nm: c.sgguCdNm,
            latitude: c.YPos ? parseFloat(c.YPos) : null,
            longitude: c.XPos ? parseFloat(c.XPos) : null,
            is_verified: true,
            is_active: true,
            synced_at: syncedAt,
          }));

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from("clinics").upsert(rows, { onConflict: "ykiho" });
          totalSynced += rows.length;
        } catch (err) {
          console.error(`[sync] subject=${subjectCd} region=${sidoCd} failed:`, err);
        }

        await new Promise((r) => setTimeout(r, 300));
      }
    }

    // 2) 한의원/한방병원 — 종별코드(clCd)로 수집
    for (const clCd of KOREAN_MEDICINE_CL_CDS) {
      for (const sidoCd of regions) {
        try {
          const result = await fetchHiraClinics({
            clCd: clCd,
            sidoCd: sidoCd,
            numOfRows: 100,
            pageNo: 1,
          });

          if (result.clinics.length === 0) continue;

          const rows = result.clinics.map((c) => ({
            ykiho: c.ykiho,
            name: c.yadmNm,
            name_en: c.yadmNm,
            description: `${c.clCdNm} · ${c.dgsbjtCdNm || "한방"}`,
            address: c.addr,
            city: c.sidoCdNm,
            phone: c.telno || null,
            website: c.hospUrl || null,
            cl_cd: clCd,
            cl_cd_nm: c.clCdNm,
            dgsbjt_cd: null as string | null,
            dgsbjt_cd_nm: c.dgsbjtCdNm || null,
            dr_tot_cnt: c.drTotCnt || 0,
            sdr_cnt: (c.mdeptSdrCnt || c.sdrCnt || 0) as number,
            sido_cd: sidoCd,
            sido_cd_nm: c.sidoCdNm,
            sggu_cd_nm: c.sgguCdNm,
            latitude: c.YPos ? parseFloat(c.YPos) : null,
            longitude: c.XPos ? parseFloat(c.XPos) : null,
            is_verified: true,
            is_active: true,
            synced_at: syncedAt,
          }));

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from("clinics").upsert(rows, { onConflict: "ykiho" });
          totalSynced += rows.length;
        } catch (err) {
          console.error(`[sync] clCd=${clCd} region=${sidoCd} failed:`, err);
        }

        await new Promise((r) => setTimeout(r, 300));
      }
    }

    // 3) 구글 별점 조회 — 별점 없는 전문의 많은 병원 상위 50개
    let ratingsSynced = 0;
    if (process.env.GOOGLE_PLACES_API_KEY) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: noRating } = await (supabase as any)
          .from("clinics")
          .select("ykiho, name, address")
          .is("google_rating", null)
          .order("sdr_cnt", { ascending: false })
          .limit(50);

        if (noRating && noRating.length > 0) {
          for (const clinic of noRating) {
            try {
              const rating = await fetchGoogleRating(clinic.name, clinic.address);
              if (rating) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (supabase as any)
                  .from("clinics")
                  .update({
                    google_rating: rating.rating,
                    google_review_count: rating.reviewCount,
                  })
                  .eq("ykiho", clinic.ykiho);
                ratingsSynced++;
              }
            } catch { /* 개별 실패 무시 */ }
            await new Promise((r) => setTimeout(r, 100));
          }
        }
      } catch (err) {
        console.error("[sync] Google rating sync failed:", err);
      }
    }

    console.log(`[cron/sync] ${totalSynced} clinics + ${ratingsSynced} ratings synced at ${syncedAt}`);

    return NextResponse.json({
      success: true,
      message: `${totalSynced} clinics + ${ratingsSynced} ratings synced`,
      syncedAt,
    });
  } catch (error) {
    console.error("[cron/sync] Sync failed:", error);
    return NextResponse.json(
      { success: false, error: "Sync failed" },
      { status: 500 }
    );
  }
}
