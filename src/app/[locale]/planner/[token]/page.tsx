"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface ItineraryItem { time: string; type: string; title: string; detail: string; }
interface ItineraryDay { day: number; date_label: string; items: ItineraryItem[]; }
interface Itinerary { summary: string; days: ItineraryDay[]; tips: string[]; estimated_cost: string; }
interface TripPlan {
  procedures: string[];
  arrival_date: string;
  departure_date: string;
  itinerary: Itinerary;
  preferences: Record<string, unknown>;
}

function typeLabel(type: string): string {
  switch (type) {
    case "transport": return "Transit";
    case "hotel": return "Hotel";
    case "clinic": return "Clinic";
    case "food": return "Dining";
    case "activity": return "Activity";
    default: return "Stop";
  }
}

const SF = "'SF Pro Display','SF Pro Icons','Helvetica Neue',Helvetica,Arial,sans-serif";
const SFT = "'SF Pro Text','SF Pro Icons','Helvetica Neue',Helvetica,Arial,sans-serif";

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
    return () => { cancelled = true; };
  }, [params.token]);

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f5f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            display: "inline-block", width: 40, height: 40,
            border: "3px solid rgba(0,113,227,0.2)", borderTopColor: "#0071e3",
            borderRadius: "50%", animation: "spin 0.8s linear infinite",
          }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ fontFamily: SFT, marginTop: 16, fontSize: 17, color: "rgba(0,0,0,0.6)" }}>Loading...</p>
        </div>
      </main>
    );
  }

  if (errorMsg || !plan) {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f5f7", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: SFT, fontSize: 17, color: "rgba(0,0,0,0.7)", marginBottom: 24 }}>
            {errorMsg || "Trip plan not found"}
          </p>
          <button
            onClick={() => router.push(`/${params.locale}/planner`)}
            style={{ fontFamily: SFT, background: "#0071e3", color: "#ffffff", border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 17, cursor: "pointer", letterSpacing: "-0.374px" }}
          >
            Plan Your Own Trip
          </button>
        </div>
      </main>
    );
  }

  const { itinerary } = plan;

  return (
    <main style={{ minHeight: "100vh", fontFamily: SF }}>

      {/* Black hero */}
      <section style={{ background: "#000000", color: "#ffffff", textAlign: "center", padding: "64px 24px 56px" }}>
        <p style={{ fontFamily: SFT, fontSize: 12, letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)", marginBottom: 12, textTransform: "uppercase" }}>
          Korea Medical Trip
        </p>
        <h1 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: 600, lineHeight: 1.07, letterSpacing: "-0.28px", margin: "0 0 12px" }}>
          Your 4-Day Itinerary
        </h1>
        <p style={{ fontFamily: SFT, fontSize: 17, lineHeight: 1.47, color: "rgba(255,255,255,0.6)", letterSpacing: "-0.374px", margin: 0 }}>
          {plan.arrival_date} – {plan.departure_date}
        </p>
        {plan.procedures.length > 0 && (
          <p style={{ fontFamily: SFT, fontSize: 14, color: "rgba(255,255,255,0.45)", marginTop: 8, letterSpacing: "-0.224px" }}>
            {plan.procedures.join(" · ")}
          </p>
        )}
      </section>

      {/* Content */}
      <section style={{ background: "#f5f5f7", padding: "48px 24px 80px" }}>
        <div style={{ maxWidth: 660, margin: "0 auto" }}>

          {/* Summary */}
          <div style={{ background: "#ffffff", borderRadius: 8, padding: "20px 24px", marginBottom: 20, boxShadow: "rgba(0,0,0,0.1) 0px 2px 16px 0px" }}>
            <p style={{ fontFamily: SFT, fontSize: 17, lineHeight: 1.47, color: "#1d1d1f", letterSpacing: "-0.374px", marginBottom: 8 }}>
              {itinerary.summary}
            </p>
            <p style={{ fontFamily: SFT, fontSize: 14, color: "rgba(0,0,0,0.6)", letterSpacing: "-0.224px" }}>
              Estimated cost: <span style={{ fontWeight: 600, color: "#1d1d1f" }}>{itinerary.estimated_cost}</span>
            </p>
          </div>

          {/* Day cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {itinerary.days.map((d) => (
              <div key={d.day} style={{ background: "#ffffff", borderRadius: 8, padding: "20px 24px" }}>
                <h3 style={{ fontSize: 21, fontWeight: 600, lineHeight: 1.19, letterSpacing: "0.231px", color: "#1d1d1f", marginBottom: 16 }}>
                  Day {d.day}
                  <span style={{ fontFamily: SFT, fontSize: 14, fontWeight: 400, color: "rgba(0,0,0,0.48)", marginLeft: 10 }}>
                    {d.date_label}
                  </span>
                </h3>
                <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                  {d.items.map((it, idx) => (
                    <li key={idx} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ fontFamily: SFT, flexShrink: 0, width: 48, fontSize: 12, color: "rgba(0,0,0,0.4)", letterSpacing: "-0.12px", paddingTop: 2, fontVariantNumeric: "tabular-nums" }}>
                        {it.time}
                      </span>
                      <span style={{
                        fontFamily: SFT, flexShrink: 0, width: 52, fontSize: 10, fontWeight: 600,
                        letterSpacing: "0.05em", textTransform: "uppercase",
                        color: it.type === "clinic" ? "#0071e3" : "rgba(0,0,0,0.4)",
                        paddingTop: 3,
                      }}>
                        {typeLabel(it.type)}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3, color: "#1d1d1f" }}>{it.title}</div>
                        <div style={{ fontFamily: SFT, fontSize: 14, lineHeight: 1.43, color: "rgba(0,0,0,0.6)", letterSpacing: "-0.224px" }}>{it.detail}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>

          {/* Tips */}
          {itinerary.tips?.length > 0 && (
            <div style={{ background: "#ffffff", borderRadius: 8, padding: "20px 24px", marginTop: 12 }}>
              <h3 style={{ fontFamily: SFT, fontSize: 14, fontWeight: 600, color: "#1d1d1f", letterSpacing: "-0.224px", marginBottom: 12 }}>
                Travel Tips
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {itinerary.tips.map((tip, i) => (
                  <li key={i} style={{ fontFamily: SFT, fontSize: 14, lineHeight: 1.43, color: "rgba(0,0,0,0.8)", letterSpacing: "-0.224px", paddingLeft: 16, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, color: "#0071e3", fontWeight: 700 }}>—</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          <div style={{ marginTop: 48, textAlign: "center" }}>
            <p style={{ fontFamily: SFT, fontSize: 14, color: "rgba(0,0,0,0.48)", letterSpacing: "-0.224px", marginBottom: 16 }}>
              Want to create your own personalized plan?
            </p>
            <button
              onClick={() => router.push(`/${params.locale}/planner`)}
              style={{ fontFamily: SFT, background: "#0071e3", color: "#ffffff", border: "none", borderRadius: 8, padding: "14px 36px", fontSize: 17, letterSpacing: "-0.374px", cursor: "pointer" }}
            >
              Plan Your Own Trip
            </button>
          </div>

        </div>
      </section>
    </main>
  );
}
