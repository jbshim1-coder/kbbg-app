// 클리닉 텍스트 리뷰 API
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase";
import { verifyAdminFromRequest } from "@/lib/admin-auth";

const stripHtml = (s: string) => s.replace(/<[^>]*>/g, "").trim();

export async function GET(req: NextRequest) {
  const entityId = req.nextUrl.searchParams.get("entityId");
  if (!entityId) return NextResponse.json({ reviews: [] });

  try {
    const supabase = createServiceRoleClient();
    const { data } = await (supabase as any)
      .from("clinic_reviews")
      .select("id, author_name, rating, content, created_at")
      .eq("entity_id", entityId)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(20);
    return NextResponse.json({ reviews: data || [] });
  } catch {
    return NextResponse.json({ reviews: [] });
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { entityId, entityName, rating, content: rawContent, authorName: rawAuthor } = body as Record<string, string | number>;
  const content = stripHtml(String(rawContent ?? ""));
  const authorName = stripHtml(String(rawAuthor ?? ""));

  if (!entityId || !rating || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }
  if (content.length < 10 || content.length > 1000) {
    return NextResponse.json({ error: "Content must be 10–1000 characters" }, { status: 400 });
  }

  const serviceClient = createServiceRoleClient();
  const { error } = await (serviceClient as any).from("clinic_reviews").insert({
    entity_id: entityId,
    entity_name: entityName || entityId,
    user_id: user.id,
    author_name: authorName || user.email?.split("@")[0] || "Anonymous",
    rating,
    content,
    status: "pending",
  });

  if (error) return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  return NextResponse.json({ success: true });
}

// 관리자 전용: 리뷰 상태 변경 (approve / reject)
export async function PATCH(req: NextRequest) {
  const adminEmail = await verifyAdminFromRequest();
  if (!adminEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status } = await req.json();
  if (!id || !["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { error } = await (supabase as any)
    .from("clinic_reviews")
    .update({ status })
    .eq("id", id);

  if (error) return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  return NextResponse.json({ success: true });
}
