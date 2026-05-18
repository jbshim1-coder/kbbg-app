"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

const PROCEDURES = [
  { id: "rhinoplasty", label: "Rhinoplasty", category: "Plastic Surgery" },
  { id: "double-eyelid", label: "Double Eyelid", category: "Plastic Surgery" },
  { id: "botox", label: "Botox & Fillers", category: "Skin" },
  { id: "laser", label: "Laser Treatment", category: "Skin" },
  { id: "facelift", label: "Facelift", category: "Plastic Surgery" },
  { id: "liposuction", label: "Liposuction", category: "Plastic Surgery" },
  { id: "dental", label: "Dental", category: "Dental" },
  { id: "hair", label: "Hair Transplant", category: "Hair" },
];

const BUDGETS = [
  { id: "budget", label: "Budget", range: "< $1,000" },
  { id: "standard", label: "Standard", range: "$1,000–$3,000" },
  { id: "premium", label: "Premium", range: "$3,000–$7,000" },
  { id: "luxury", label: "Luxury", range: "$7,000+" },
];

const INTERESTS = [
  { id: "shopping", label: "Shopping" },
  { id: "sightseeing", label: "Sightseeing" },
  { id: "food", label: "Food & Dining" },
  { id: "kpop", label: "K-pop & Entertainment" },
];

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

interface ItineraryItem { time: string; type: string; title: string; detail: string; }
interface ItineraryDay { day: number; date_label: string; items: ItineraryItem[]; }
interface Itinerary { summary: string; days: ItineraryDay[]; tips: string[]; estimated_cost: string; }

const SF = "'SF Pro Display','SF Pro Icons','Helvetica Neue',Helvetica,Arial,sans-serif";
const SFT = "'SF Pro Text','SF Pro Icons','Helvetica Neue',Helvetica,Arial,sans-serif";

export default function PlannerPage() {
  const t = useTranslations("planner");
  const { locale } = useParams<{ locale: string }>();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [arrivalDate, setArrivalDate] = useState("");
  const [budget, setBudget] = useState("standard");
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  function toggleProcedure(id: string) {
    setSelectedProcedures((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function toggleInterest(id: string) {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  async function generate() {
    setLoading(true);
    setErrorMsg("");
    setItinerary(null);
    try {
      const res = await fetch("/api/planner/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ procedures: selectedProcedures, arrivalDate, preferences: { budget, interests } }),
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

  async function saveAndShare() {
    if (!itinerary) return;
    setSaving(true);
    try {
      const res = await fetch("/api/planner/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ procedures: selectedProcedures, arrivalDate, itinerary, preferences: { budget, interests } }),
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

  async function copyShareLink() {
    if (!shareToken) return;
    const url = `${window.location.origin}/${locale}/planner/${shareToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unsupported */ }
  }

  const canStep2 = selectedProcedures.length > 0;
  const canStep3 = arrivalDate.length > 0;

  return (
    <main style={{ minHeight: "100vh", fontFamily: SF }}>

      {/* Black hero */}
      <section style={{ background: "#000000", color: "#ffffff", textAlign: "center", padding: "64px 24px 56px" }}>
        <p style={{ fontFamily: SFT, fontSize: 12, letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)", marginBottom: 12, textTransform: "uppercase" }}>
          Step {step} of 3
        </p>
        <h1 style={{ fontSize: "clamp(32px,5vw,48px)", fontWeight: 600, lineHeight: 1.07, letterSpacing: "-0.28px", margin: 0 }}>
          {t("title")}
        </h1>
        <p style={{ fontFamily: SFT, fontSize: 17, lineHeight: 1.47, letterSpacing: "-0.374px", color: "rgba(255,255,255,0.7)", marginTop: 12, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
          {t("subtitle")}
        </p>
      </section>

      {/* Content area */}
      <section style={{ background: "#f5f5f7", padding: "48px 24px 80px" }}>
        <div style={{ maxWidth: 660, margin: "0 auto" }}>

          {/* ── Step 1: Procedures ── */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.14, letterSpacing: "0.196px", color: "#1d1d1f", marginBottom: 32 }}>
                {t("step1_title")}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                {PROCEDURES.map((p) => {
                  const active = selectedProcedures.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleProcedure(p.id)}
                      style={{
                        background: active ? "#ffffff" : "#ebebeb",
                        border: `2px solid ${active ? "#0071e3" : "transparent"}`,
                        borderRadius: 8,
                        padding: "16px 14px",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "border-color 0.15s, box-shadow 0.15s",
                        boxShadow: active ? "rgba(0,0,0,0.12) 0px 2px 12px 0px" : "none",
                        outline: "none",
                      }}
                    >
                      <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.2, color: active ? "#0071e3" : "#1d1d1f", marginBottom: 4 }}>
                        {p.label}
                      </div>
                      <div style={{ fontFamily: SFT, fontSize: 12, letterSpacing: "-0.12px", color: "rgba(0,0,0,0.48)" }}>
                        {p.category}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: 40, display: "flex", justifyContent: "flex-end" }}>
                <button
                  disabled={!canStep2}
                  onClick={() => setStep(2)}
                  style={{
                    fontFamily: SFT,
                    background: canStep2 ? "#0071e3" : "rgba(0,0,0,0.12)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 8,
                    padding: "12px 28px",
                    fontSize: 17,
                    letterSpacing: "-0.374px",
                    cursor: canStep2 ? "pointer" : "default",
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Date + Budget + Interests ── */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.14, letterSpacing: "0.196px", color: "#1d1d1f", marginBottom: 32 }}>
                {t("step2_title")}
              </h2>

              <div style={{ marginBottom: 32 }}>
                <label style={{ fontFamily: SFT, display: "block", fontSize: 14, fontWeight: 600, letterSpacing: "-0.224px", color: "#1d1d1f", marginBottom: 8 }}>
                  Arrival Date
                </label>
                <input
                  type="date"
                  value={arrivalDate}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  style={{
                    fontFamily: SFT,
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 11,
                    border: "3px solid rgba(0,0,0,0.04)",
                    background: "#fafafc",
                    fontSize: 17,
                    color: "#1d1d1f",
                    letterSpacing: "-0.374px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: 32 }}>
                <label style={{ fontFamily: SFT, display: "block", fontSize: 14, fontWeight: 600, letterSpacing: "-0.224px", color: "#1d1d1f", marginBottom: 8 }}>
                  Budget
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
                  {BUDGETS.map((b) => {
                    const active = budget === b.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() => setBudget(b.id)}
                        style={{
                          background: active ? "#ffffff" : "#ebebeb",
                          border: `2px solid ${active ? "#0071e3" : "transparent"}`,
                          borderRadius: 8,
                          padding: "14px 16px",
                          textAlign: "left",
                          cursor: "pointer",
                          boxShadow: active ? "rgba(0,0,0,0.12) 0px 2px 12px 0px" : "none",
                          outline: "none",
                        }}
                      >
                        <div style={{ fontSize: 15, fontWeight: 600, color: active ? "#0071e3" : "#1d1d1f", marginBottom: 2 }}>
                          {b.label}
                        </div>
                        <div style={{ fontFamily: SFT, fontSize: 12, color: "rgba(0,0,0,0.48)" }}>{b.range}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 40 }}>
                <label style={{ fontFamily: SFT, display: "block", fontSize: 14, fontWeight: 600, letterSpacing: "-0.224px", color: "#1d1d1f", marginBottom: 8 }}>
                  Interests
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
                  {INTERESTS.map((i) => {
                    const active = interests.includes(i.id);
                    return (
                      <label
                        key={i.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          background: active ? "#ffffff" : "#ebebeb",
                          border: `2px solid ${active ? "#0071e3" : "transparent"}`,
                          borderRadius: 8,
                          padding: "14px 16px",
                          cursor: "pointer",
                          boxShadow: active ? "rgba(0,0,0,0.12) 0px 2px 12px 0px" : "none",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => toggleInterest(i.id)}
                          style={{ accentColor: "#0071e3", width: 16, height: 16, flexShrink: 0 }}
                        />
                        <span style={{ fontFamily: SFT, fontSize: 15, color: active ? "#0071e3" : "#1d1d1f", fontWeight: active ? 600 : 400 }}>
                          {i.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  onClick={() => setStep(1)}
                  style={{ fontFamily: SFT, background: "none", border: "none", color: "#0066cc", fontSize: 14, letterSpacing: "-0.224px", cursor: "pointer", padding: 0 }}
                >
                  ← Back
                </button>
                <button
                  disabled={!canStep3}
                  onClick={() => setStep(3)}
                  style={{
                    fontFamily: SFT,
                    background: canStep3 ? "#0071e3" : "rgba(0,0,0,0.12)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 8,
                    padding: "12px 28px",
                    fontSize: 17,
                    letterSpacing: "-0.374px",
                    cursor: canStep3 ? "pointer" : "default",
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Generate + Itinerary ── */}
          {step === 3 && (
            <div>
              {!itinerary && !loading && (
                <div style={{ textAlign: "center", paddingTop: 40, paddingBottom: 40 }}>
                  <h2 style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.14, color: "#1d1d1f", marginBottom: 12 }}>
                    Ready to plan your trip?
                  </h2>
                  <p style={{ fontFamily: SFT, fontSize: 17, lineHeight: 1.47, letterSpacing: "-0.374px", color: "rgba(0,0,0,0.7)", marginBottom: 32, maxWidth: 440, margin: "0 auto 32px" }}>
                    Your personalized 4-day Korea medical itinerary will be generated in seconds.
                  </p>
                  <button
                    onClick={generate}
                    style={{
                      fontFamily: SFT,
                      background: "#0071e3",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 8,
                      padding: "14px 36px",
                      fontSize: 17,
                      letterSpacing: "-0.374px",
                      cursor: "pointer",
                    }}
                  >
                    {t("generate_btn")}
                  </button>
                  {errorMsg && (
                    <p style={{ fontFamily: SFT, marginTop: 16, fontSize: 14, color: "#d70015" }}>{errorMsg}</p>
                  )}
                  <div style={{ marginTop: 24 }}>
                    <button
                      onClick={() => setStep(2)}
                      style={{ fontFamily: SFT, background: "none", border: "none", color: "#0066cc", fontSize: 14, letterSpacing: "-0.224px", cursor: "pointer" }}
                    >
                      ← Edit preferences
                    </button>
                  </div>
                </div>
              )}

              {loading && (
                <div style={{ textAlign: "center", padding: "80px 0" }}>
                  <div style={{
                    display: "inline-block",
                    width: 40,
                    height: 40,
                    border: "3px solid rgba(0,113,227,0.2)",
                    borderTopColor: "#0071e3",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }} />
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  <p style={{ fontFamily: SFT, marginTop: 16, fontSize: 17, lineHeight: 1.47, color: "rgba(0,0,0,0.6)" }}>
                    {t("generating")}
                  </p>
                </div>
              )}

              {itinerary && (
                <div>
                  {/* Summary card */}
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
                                fontFamily: SFT,
                                flexShrink: 0,
                                width: 52,
                                fontSize: 10,
                                fontWeight: 600,
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
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

                  {/* Save & Share */}
                  <div style={{ marginTop: 36, textAlign: "center" }}>
                    {!shareToken && (
                      <button
                        onClick={saveAndShare}
                        disabled={saving}
                        style={{
                          fontFamily: SFT,
                          background: saving ? "rgba(0,0,0,0.12)" : "#0071e3",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: 8,
                          padding: "14px 36px",
                          fontSize: 17,
                          letterSpacing: "-0.374px",
                          cursor: saving ? "default" : "pointer",
                        }}
                      >
                        {saving ? "Saving..." : t("save_share")}
                      </button>
                    )}

                    {shareToken && (
                      <div style={{ background: "#ffffff", borderRadius: 8, padding: "24px 28px", boxShadow: "rgba(0,0,0,0.1) 0px 2px 16px 0px", textAlign: "left" }}>
                        <p style={{ fontFamily: SFT, fontSize: 14, color: "rgba(0,0,0,0.6)", letterSpacing: "-0.224px", marginBottom: 10 }}>
                          Your trip plan is ready to share
                        </p>
                        <code style={{ display: "block", fontFamily: "monospace", background: "#f5f5f7", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#1d1d1f", wordBreak: "break-all", marginBottom: 16 }}>
                          {typeof window !== "undefined"
                            ? `${window.location.origin}/${locale}/planner/${shareToken}`
                            : `/${locale}/planner/${shareToken}`}
                        </code>
                        <button
                          onClick={copyShareLink}
                          style={{
                            fontFamily: SFT,
                            background: "#0071e3",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: 8,
                            padding: "10px 20px",
                            fontSize: 14,
                            letterSpacing: "-0.224px",
                            cursor: "pointer",
                          }}
                        >
                          {copied ? t("copied") : t("copy_link")}
                        </button>
                      </div>
                    )}

                    {errorMsg && (
                      <p style={{ fontFamily: SFT, marginTop: 16, fontSize: 14, color: "#d70015" }}>{errorMsg}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </section>
    </main>
  );
}
