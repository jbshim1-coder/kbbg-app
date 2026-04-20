"use client";

import { useState, useRef } from "react";
import { uploadImage } from "@/lib/cloudinary";

const MAX_FILES = 3;
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

interface ImageUploadProps {
  // 업로드 완료 시 URL 배열을 부모로 전달
  onUploadComplete: (urls: string[]) => void;
}

interface FileEntry {
  file: File;
  preview: string;
  url: string | null;   // null = 아직 업로드 중
  error: string | null;
  progress: number;     // 0~100 (fetch는 스트림 없으므로 0 → 100 두 단계)
}

export default function ImageUpload({ onUploadComplete, locale = "en" }: ImageUploadProps & { locale?: string }) {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // 파일 선택 → 유효성 검사 → 미리보기 생성 → 업로드 시작
  async function handleFiles(files: FileList | null) {
    if (!files) return;

    const remaining = MAX_FILES - entries.length;
    const selected = Array.from(files).slice(0, remaining);

    const validated = selected.filter((f) => {
      if (f.size > MAX_SIZE_BYTES) {
        const sizeMsg: Record<string, string> = {
          ko: '파일 크기가 5MB를 초과합니다.',
          en: 'File size exceeds 5MB.',
          ja: 'ファイルサイズが5MBを超えています。',
          zh: '文件大小超过5MB。',
          vi: 'Kích thước tệp vượt quá 5MB.',
          th: 'ขนาดไฟล์เกิน 5MB',
          ru: 'Размер файла превышает 5МБ.',
          mn: 'Файлын хэмжээ 5MB-ээс хэтэрсэн.',
        };
        alert(`${f.name}: ${sizeMsg[locale] || sizeMsg.en}`);
        return false;
      }
      return true;
    });

    if (validated.length === 0) return;

    // 미리보기 URL 생성 후 entries에 추가
    const newEntries: FileEntry[] = validated.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      url: null,
      error: null,
      progress: 0,
    }));

    setEntries((prev) => {
      const updated = [...prev, ...newEntries];
      return updated;
    });

    // 각 파일 병렬 업로드
    const uploadPromises = newEntries.map((entry) => uploadSingle(entry));
    await Promise.all(uploadPromises);
  }

  async function uploadSingle(entry: FileEntry) {
    // 업로드 시작 — progress 0 → 50
    setEntries((prev) =>
      prev.map((e) => (e.file === entry.file ? { ...e, progress: 50 } : e))
    );

    try {
      const url = await uploadImage(entry.file);

      setEntries((prev) => {
        const updated = prev.map((e) =>
          e.file === entry.file ? { ...e, url, progress: 100 } : e
        );
        // 완료된 URL만 부모로 전달
        onUploadComplete(updated.filter((e) => e.url).map((e) => e.url as string));
        return updated;
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setEntries((prev) =>
        prev.map((e) =>
          e.file === entry.file ? { ...e, error: message, progress: 0 } : e
        )
      );
    }
  }

  function removeEntry(index: number) {
    setEntries((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      onUploadComplete(updated.filter((e) => e.url).map((e) => e.url as string));
      return updated;
    });
  }

  const canAddMore = entries.length < MAX_FILES;

  return (
    <div className="space-y-3">
      {/* 업로드된 이미지 미리보기 목록 */}
      {entries.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {entries.map((entry, idx) => (
            <div key={idx} className="relative w-24 h-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={entry.preview}
                alt={`preview-${idx}`}
                className="w-24 h-24 rounded-xl object-cover border border-gray-200"
              />

              {/* 업로드 진행 오버레이 */}
              {entry.progress > 0 && entry.progress < 100 && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
                  <div className="w-12 h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all"
                      style={{ width: `${entry.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* 에러 오버레이 */}
              {entry.error && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-red-500/70">
                  <span className="text-white text-xs text-center px-1">{entry.error}</span>
                </div>
              )}

              {/* 완료 배지 */}
              {entry.progress === 100 && !entry.error && (
                <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              )}

              {/* 삭제 버튼 */}
              <button
                type="button"
                onClick={() => removeEntry(idx)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-700 text-white text-xs flex items-center justify-center hover:bg-red-500"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 파일 추가 영역 — 최대 3장 미만일 때만 표시 */}
      {canAddMore && (
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 px-4 py-4 text-sm text-gray-500 hover:border-pink-300 hover:bg-slate-50">
          <span>📎</span>
          <span>
            {({
              ko: '이미지 추가', en: 'Add image', ja: '画像を追加', zh: '添加图片',
              vi: 'Thêm hình ảnh', th: 'เพิ่มรูปภาพ', ru: 'Добавить', mn: 'Зураг нэмэх',
            } as Record<string, string>)[locale] || 'Add image'} ({entries.length}/{MAX_FILES}) — {({
              ko: '최대 5MB', en: 'Max 5MB', ja: '最大5MB', zh: '最大5MB',
              vi: 'Tối đa 5MB', th: 'สูงสุด 5MB', ru: 'Макс. 5МБ', mn: 'Дээд тал нь 5MB',
            } as Record<string, string>)[locale] || 'Max 5MB'}
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            // 같은 파일 재선택 허용을 위해 값 초기화
            onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
          />
        </label>
      )}
    </div>
  );
}
