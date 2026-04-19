// 광고 API 라우트 — GET: 활성 광고 목록, POST/PUT/DELETE: 관리자 전용
// Supabase ads 테이블 사용 (파일 기반에서 이전)
// 테이블이 없으면 빈 배열 반환 (Supabase Dashboard에서 테이블 생성 필요)

import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { verifyAdminFromRequest } from "@/lib/admin-auth";

// 광고 데이터 구조 (Supabase 컬럼명: snake_case)
export interface Ad {
  id: string;
  title: string;
  hospital_name: string;
  description: string;
  link_url: string;
  image_url: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// GET — 활성 광고 목록 (공개), ?all=true면 전체 (관리자용)
export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "true";

  if (all) {
    const adminEmail = await verifyAdminFromRequest();
    if (!adminEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const supabase = createServiceRoleClient();
    let query = (supabase as any).from("ads").select("*").order("created_at", { ascending: false });

    if (!all) {
      query = query.eq("active", true);
    }

    const { data, error } = await query;

    if (error) {
      // 테이블이 없으면 빈 배열 반환
      console.error("ads GET error:", error.message);
      return NextResponse.json({ ads: [] });
    }

    return NextResponse.json({ ads: data || [] });
  } catch {
    return NextResponse.json({ ads: [] });
  }
}

// POST — 광고 등록 (관리자 전용)
export async function POST(req: NextRequest) {
  const adminEmail = await verifyAdminFromRequest();
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const supabase = createServiceRoleClient();

    const { data, error } = await (supabase as any)
      .from("ads")
      .insert({
        title: body.title || "",
        hospital_name: body.hospitalName || body.hospital_name || "",
        description: body.description || "",
        link_url: body.linkUrl || body.link_url || "",
        image_url: body.imageUrl || body.image_url || "",
        active: body.active !== false,
      })
      .select()
      .single();

    if (error) {
      console.error("ads POST error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ad: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// PUT — 광고 수정 (관리자 전용)
export async function PUT(req: NextRequest) {
  const adminEmail = await verifyAdminFromRequest();
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // 프론트에서 camelCase로 보내도 snake_case로 변환
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.title !== undefined) updateData.title = body.title;
    if (body.hospitalName !== undefined || body.hospital_name !== undefined)
      updateData.hospital_name = body.hospitalName ?? body.hospital_name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.linkUrl !== undefined || body.link_url !== undefined)
      updateData.link_url = body.linkUrl ?? body.link_url;
    if (body.imageUrl !== undefined || body.image_url !== undefined)
      updateData.image_url = body.imageUrl ?? body.image_url;
    if (body.active !== undefined) updateData.active = body.active;

    const { data, error } = await (supabase as any)
      .from("ads")
      .update(updateData)
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      console.error("ads PUT error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    return NextResponse.json({ ad: data });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// DELETE — 광고 삭제 (관리자 전용)
export async function DELETE(req: NextRequest) {
  const adminEmail = await verifyAdminFromRequest();
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { error } = await (supabase as any).from("ads").delete().eq("id", id);

  if (error) {
    console.error("ads DELETE error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
