"use client";

// 광고관리 페이지 — 광고 등록/수정/삭제 및 활성 여부 관리
// 광고 데이터는 /api/admin/ads (파일 기반 저장)에서 관리
import { useEffect, useState } from "react";
import type { Ad } from "@/app/api/admin/ads/route";

// 빈 광고 폼 초기값
const EMPTY_FORM: Omit<Ad, "id" | "createdAt"> = {
  title: "",
  hospitalName: "",
  description: "",
  linkUrl: "",
  imageUrl: "",
  active: true,
};

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);

  // 전체 광고 목록 로드 (비활성 포함)
  const loadAds = () => {
    setLoading(true);
    fetch("/api/admin/ads?all=true")
      .then((r) => r.json())
      .then((d) => setAds(d.ads || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAds();
  }, []);

  // 폼 필드 변경 핸들러
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // 등록 폼 열기
  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  // 수정 폼 열기 — 기존 광고 데이터로 폼 채움
  const openEdit = (ad: Ad) => {
    setEditingId(ad.id);
    setForm({
      title: ad.title,
      hospitalName: ad.hospitalName,
      description: ad.description,
      linkUrl: ad.linkUrl,
      imageUrl: ad.imageUrl,
      active: ad.active,
    });
    setShowForm(true);
  };

  // 폼 제출 — 등록(POST) 또는 수정(PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        // 수정 요청
        await fetch("/api/admin/ads", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...form }),
        });
      } else {
        // 등록 요청
        await fetch("/api/admin/ads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      setShowForm(false);
      loadAds();
    } finally {
      setSubmitting(false);
    }
  };

  // 광고 삭제
  const handleDelete = async (id: string) => {
    if (!confirm("이 광고를 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/ads?id=${id}`, { method: "DELETE" });
    loadAds();
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">광고관리</h2>
        <button
          onClick={openCreate}
          className="text-sm px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          + 광고 등록
        </button>
      </div>

      {/* 광고 등록/수정 폼 — showForm이 true일 때만 표시 */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            {editingId ? "광고 수정" : "광고 등록"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  광고 제목 *
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  병원명 *
                </label>
                <input
                  name="hospitalName"
                  value={form.hospitalName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  광고 설명
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  링크 URL
                </label>
                <input
                  name="linkUrl"
                  value={form.linkUrl}
                  onChange={handleChange}
                  type="url"
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  이미지 URL
                </label>
                <input
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  type="url"
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* 활성 여부 토글 */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">활성화 (검색 결과에 노출)</span>
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:bg-blue-300 transition-colors"
              >
                {submitting ? "저장 중..." : editingId ? "수정 완료" : "등록"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 광고 목록 테이블 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-400">로딩 중...</div>
        ) : ads.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">
            등록된 광고가 없습니다.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 font-medium">제목</th>
                <th className="px-5 py-3 font-medium">병원명</th>
                <th className="px-5 py-3 font-medium">설명</th>
                <th className="px-5 py-3 font-medium">상태</th>
                <th className="px-5 py-3 font-medium">등록일</th>
                <th className="px-5 py-3 font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr key={ad.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{ad.title}</td>
                  <td className="px-5 py-3 text-gray-600">{ad.hospitalName}</td>
                  <td className="px-5 py-3 text-gray-500 max-w-xs truncate">
                    {ad.description}
                  </td>
                  <td className="px-5 py-3">
                    {/* 활성 여부 배지 */}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      ad.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {ad.active ? "활성" : "비활성"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{ad.createdAt}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(ad)}
                        className="text-xs px-2 py-1 bg-teal-50 text-teal-600 rounded hover:bg-blue-100 transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
