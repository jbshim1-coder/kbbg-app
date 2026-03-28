// Cloudinary unsigned upload — API 키 불필요, upload preset만 사용
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export interface UploadResult {
  url: string;
  publicId: string;
}

// 이미지를 Cloudinary에 업로드하고 최적화된 URL을 반환
// 최대 1200px 너비, quality auto 적용
export async function uploadImage(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary environment variables are not configured");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  // 자동 리사이즈: 최대 1200px 너비 유지하며 비율 보존
  formData.append("transformation", JSON.stringify([
    { width: 1200, crop: "limit", quality: "auto", fetch_format: "auto" },
  ]));

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Upload failed: ${res.status}`);
  }

  const data = await res.json();
  return data.secure_url as string;
}
