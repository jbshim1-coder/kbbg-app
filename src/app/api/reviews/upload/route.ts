// 리뷰 시술 후 사진 업로드 (애프터 사진만 허용 — 의료법 준수)
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 3;

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const entityId = String(formData.get("entityId") || "").trim();
  if (!entityId) return NextResponse.json({ error: "entityId required" }, { status: 400 });

  const files = formData.getAll("files") as File[];
  if (!files.length) return NextResponse.json({ error: "No files" }, { status: 400 });
  if (files.length > MAX_FILES) return NextResponse.json({ error: `Max ${MAX_FILES} photos` }, { status: 400 });

  const service = createServiceRoleClient();
  const urls: string[] = [];

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, WebP allowed" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Max file size is 5MB" }, { status: 400 });
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${entityId}/${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await (service as any).storage
      .from("review-photos")
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (error) return NextResponse.json({ error: "Upload failed" }, { status: 500 });

    const { data: { publicUrl } } = (service as any).storage
      .from("review-photos")
      .getPublicUrl(path);

    urls.push(publicUrl);
  }

  return NextResponse.json({ urls });
}
