"use client";

// 공유된 Trip Plan 표시 페이지 — 읽기 전용 타임라인

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
interface TripPlan {
  procedures: string[];
  arrival_date: string;
  departure_date: string;
  itinerary: Itinerary;
  preferences: Record<string, unknown>;
  locale: string;
  created_at: string;
}

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

export default function SharedPlannerPage() {
  const params = useParams<{ token: string; locale: string }>();
  const router = useRouter();
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/planner/${params.token}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.plan) {
          setErrorMsg(data.error || "Not found");
        } else {
          setPlan(data.plan as TripPlan);
        }
      } catch {
        if (!cancelled) setErrorMsg("Network error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [params.token]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#0066FF] border-t-transparent" />
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  if (errorMsg || !plan) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 mb-4">{errorMsg || "Trip plan not found"}</p>
          <button
            onClick={() => router.push(`/${params.locale}/planner`)}
            className="px-6 py-3 rounded-xl bg-[#0066FF] text-white font-medium"
          >
            Plan Your Own Trip
          </button>
        </div>
      </main>
    );
  }

  const itinerary = plan.itinerary;

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Korea Medical Trip Plan
          </h1>
          <p className="mt-2 text-gray-600">
            {plan.arrival_date} → {plan.departure_date}
          </p>
        </header>

        {/* Summary */}
        <div className="bg-blue-50 rounded-xl p-5 mb-6">
          <p className="text-gray-900 font-medium">{itinerary.summary}</p>
          <p className="text-sm text-gray-600 mt-1">
            Estimated cost:{" "}
            <span className="font-semibold">{itinerary.estimated_cost}</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Procedures: {plan.procedures.join(", ")}
          </p>
        </div>

        {/* Days */}
        <div className="space-y-6">
          {itinerary.days.map((d) => (
            <div
              key={d.day}
              className="bg-white rounded-xl shadow-md p-5 border border-gray-100"
            >
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

        {/* CTA */}
        <div className="mt-10 text-center">
          <button
            onClick={() => router.push(`/${params.locale}/planner`)}
            className="px-8 py-4 rounded-xl bg-[#0066FF] text-white font-semibold shadow-lg"
          >
            Plan Your Own Trip
          </button>
        </div>
      </div>
    </main>
  );
}
