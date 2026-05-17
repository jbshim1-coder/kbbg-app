"use client";

// 3-Day Korea Medical Trip Planner — 3단계 위저드 UI
// Step1: 시술 선택 → Step2: 날짜+예산+관심사 → Step3: AI 일정 생성 + 공유

import { useState } from "react";
import { useTranslations } from "next-intl";

// 시술 카드 데이터
const PROCEDURES = [
  { id: "rhinoplasty", label: "Rhinoplasty", icon: "👃", category: "Plastic Surgery" },
  { id: "double-eyelid", label: "Double Eyelid", icon: "👁️", category: "Plastic Surgery" },
  { id: "botox", label: "Botox & Fillers", icon: "💉", category: "Skin" },
  { id: "laser", label: "Laser Treatment", icon: "✨", category: "Skin" },
  { id: "facelift", label: "Facelift", icon: "🌟", category: "Plastic Surgery" },
  { id: "liposuction", label: "Liposuction", icon: "💪", category: "Plastic Surgery" },
  { id: "dental", label: "Dental", icon: "🦷", category: "Dental" },
  { id: "hair", label: "Hair Transplant", icon: "💆", category: "Hair" },
];

const BUDGETS = [
  { id: "budget", label: "Budget", range: "< $1,000" },
  { id: "standard", label: "Standard", range: "$1,000 - $3,000" },
  { id: "premium", label: "Premium", range: "$3,000 - $7,000" },
  { id: "luxury", label: "Luxury", range: "$7,000+" },
];

const INTERESTS = [
  { id: "shopping", label: "Shopping" },
  { id: "sightseeing", label: "Sightseeing" },
  { id: "food", label: "Food & Dining" },
  { id: "kpop", label: "K-pop & Entertainment" },
];

// AI 응답 타입
interface ItineraryItem {
  time: string;
  type: string;
  title: string;
  detail: string;
}
interface ItineraryDay {
  day: number;
  date_label: string;
  items: ItineraryItem[];
}
interface Itinerary {
  summary: string;
  days: ItineraryDay[];
  tips: string[];
  estimated_cost: string;
}

// type별 아이콘
function typeIcon(type: string): string {
  switch (type) {
    case "transport": return "🚌";
    case "hotel": return "🏨";
    case "clinic": return "🏥";
    case "food": return "🍽️";
    case "activity": return "🎯";
    default: return "📍";
  }
}

export default function PlannerPage() {
  const t = useTranslations("planner");

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [arrivalDate, setArrivalDate] = useState<string>("");
  const [budget, setBudget] = useState<string>("standard");
  const [interests, setInterests] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [shareToken, setShareToken] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // 시술 선택 토글
  function toggleProcedure(id: string) {
    setSelectedProcedures((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  // 관심사 토글
  function toggleInterest(id: string) {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  // AI 일정 생성
  async function generate() {
    setLoading(true);
    setErrorMsg("");
    setItinerary(null);
    try {
      const res = await fetch("/api/planner/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          procedures: selectedProcedures,
          arrivalDate,
          preferences: { budget, interests },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.itinerary) {
        setErrorMsg(data.error || "Generation failed");
      } else {
        setItinerary(data.itinerary as Itinerary);
      }
    } catch {
      setErrorMsg("Network error");
    } finally {
      setLoading(false);
    }
  }

  // 일정 저장 + 공유 토큰 발급
  async function saveAndShare() {
    if (!itinerary) return;
    setSaving(true);
    try {
      const res = await fetch("/api/planner/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          procedures: selectedProcedures,
          arrivalDate,
          itinerary,
          preferences: { budget, interests },
        }),
      });
      const data = await res.json();
      if (data.shareToken) {
        setShareToken(data.shareToken as string);
      } else {
        setErrorMsg(data.error || "Save unavailable");
      }
    } catch {
      setErrorMsg("Network error");
    } finally {
      setSaving(false);
    }
  }

  // 공유 링크 복사
  async function copyShareLink() {
    if (!shareToken) return;
    const url = `${window.location.origin}/planner/${shareToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unsupported — no-op
    }
  }

  const canStep2 = selectedProcedures.length > 0;
  const canStep3 = arrivalDate.length > 0;

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{t("title")}</h1>
          <p className="mt-2 text-gray-600">{t("subtitle")}</p>
        </header>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-16 rounded-full ${
                step >= s ? "bg-[#0066FF]" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Procedures */}
        {step === 1 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {t("step1_title")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PROCEDURES.map((p) => {
                const active = selectedProcedures.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleProcedure(p.id)}
                    className={`p-4 rounded-xl border-2 shadow-sm transition text-left ${
                      active
                        ? "border-[#0066FF] bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="text-3xl mb-2">{p.icon}</div>
                    <div className="font-medium text-gray-900 text-sm">{p.label}</div>
                    <div className="text-xs text-gray-500">{p.category}</div>
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex justify-end">
              <button
                disabled={!canStep2}
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl bg-[#0066FF] text-white font-medium disabled:bg-gray-300"
              >
                Next →
              </button>
            </div>
          </section>
        )}

        {/* Step 2: Date + Budget + Interests */}
        {step === 2 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {t("step2_title")}
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arrival date
              </label>
              <input
                type="date"
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0066FF] outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {BUDGETS.map((b) => {
                  const active = budget === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setBudget(b.id)}
                      className={`p-3 rounded-xl border-2 text-left ${
                        active
                          ? "border-[#0066FF] bg-blue-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="font-medium text-gray-900 text-sm">{b.label}</div>
                      <div className="text-xs text-gray-500">{b.range}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interests
              </label>
              <div className="grid grid-cols-2 gap-2">
                {INTERESTS.map((i) => {
                  const active = interests.includes(i.id);
                  return (
                    <label
                      key={i.id}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer ${
                        active ? "border-[#0066FF] bg-blue-50" : "border-gray-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleInterest(i.id)}
                        className="accent-[#0066FF]"
                      />
                      <span className="text-sm text-gray-900">{i.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700"
              >
                ← Back
              </button>
              <button
                disabled={!canStep3}
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-[#0066FF] text-white font-medium disabled:bg-gray-300"
              >
                Next →
              </button>
            </div>
          </section>
        )}

        {/* Step 3: Generate + Display */}
        {step === 3 && (
          <section>
            {!itinerary && !loading && (
              <div className="text-center py-10">
                <p className="text-gray-700 mb-6">
                  Ready to create your personalized 4-day Korea medical trip?
                </p>
                <button
                  onClick={generate}
                  className="px-8 py-4 rounded-xl bg-[#0066FF] text-white font-semibold shadow-lg"
                >
                  {t("generate_btn")}
                </button>
                {errorMsg && (
                  <p className="mt-4 text-sm text-red-600">{errorMsg}</p>
                )}
                <div className="mt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="text-sm text-gray-500 underline"
                  >
                    ← Edit preferences
                  </button>
                </div>
              </div>
            )}

            {loading && (
              <div className="text-center py-16">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#0066FF] border-t-transparent" />
                <p className="mt-4 text-gray-700">{t("generating")}</p>
              </div>
            )}

            {itinerary && (
              <div>
                {/* Summary */}
                <div className="bg-blue-50 rounded-xl p-5 mb-6">
                  <p className="text-gray-900 font-medium">{itinerary.summary}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Estimated cost: <span className="font-semibold">{itinerary.estimated_cost}</span>
                  </p>
                </div>

                {/* Days */}
                <div className="space-y-6">
                  {itinerary.days.map((d) => (
                    <div key={d.day} className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
                      <h3 className="text-lg font-semibold text-[#0066FF] mb-4">
                        Day {d.day} — {d.date_label}
                      </h3>
                      <ol className="space-y-3">
                        {d.items.map((it, idx) => (
                          <li key={idx} className="flex gap-3">
                            <div className="flex-shrink-0 w-16 text-sm text-gray-500 font-mono pt-1">
                              {it.time}
                            </div>
                            <div className="flex-shrink-0 text-xl">{typeIcon(it.type)}</div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{it.title}</div>
                              <div className="text-sm text-gray-600">{it.detail}</div>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>

                {/* Tips */}
                {itinerary.tips && itinerary.tips.length > 0 && (
                  <div className="mt-6 bg-gray-50 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">💡 Tips</h3>
                    <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                      {itinerary.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Save + Share */}
                <div className="mt-8 text-center">
                  {!shareToken && (
                    <button
                      onClick={saveAndShare}
                      disabled={saving}
                      className="px-8 py-4 rounded-xl bg-[#0066FF] text-white font-semibold shadow-lg disabled:bg-gray-300"
                    >
                      {saving ? "Saving..." : t("save_share")}
                    </button>
                  )}

                  {shareToken && (
                    <div className="bg-green-50 rounded-xl p-5">
                      <p className="text-sm text-gray-700 mb-3">Share link ready:</p>
                      <code className="block bg-white rounded p-2 text-xs text-gray-800 break-all mb-3">
                        {typeof window !== "undefined"
                          ? `${window.location.origin}/planner/${shareToken}`
                          : `/planner/${shareToken}`}
                      </code>
                      <button
                        onClick={copyShareLink}
                        className="px-4 py-2 rounded-lg bg-[#0066FF] text-white text-sm font-medium"
                      >
                        {copied ? t("copied") : t("copy_link")}
                      </button>
                    </div>
                  )}

                  {errorMsg && (
                    <p className="mt-4 text-sm text-red-600">{errorMsg}</p>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
