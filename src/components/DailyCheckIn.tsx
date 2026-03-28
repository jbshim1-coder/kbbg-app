"use client";

import { useState, useEffect } from "react";

// 출석 체크 컴포넌트 — 매일 1회, +1 포인트
export default function DailyCheckIn({ locale }: { locale: string }) {
  const isKo = locale === "ko";
  const [checked, setChecked] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showAnim, setShowAnim] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const lastCheck = localStorage.getItem("kbbg_checkin_date");
    const savedStreak = parseInt(localStorage.getItem("kbbg_checkin_streak") || "0");

    if (lastCheck === today) {
      setChecked(true);
      setStreak(savedStreak);
    } else {
      // 어제 체크했으면 연속, 아니면 리셋
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      setStreak(lastCheck === yesterdayStr ? savedStreak : 0);
    }
  }, []);

  const handleCheckIn = () => {
    if (checked) return;
    const today = new Date().toISOString().slice(0, 10);
    const newStreak = streak + 1;
    localStorage.setItem("kbbg_checkin_date", today);
    localStorage.setItem("kbbg_checkin_streak", String(newStreak));
    setChecked(true);
    setStreak(newStreak);
    setShowAnim(true);
    setTimeout(() => setShowAnim(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">
        📅 {isKo ? "출석 체크" : "Daily Check-in"}
      </h3>
      <button
        onClick={handleCheckIn}
        disabled={checked}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${
          checked
            ? "bg-green-50 text-green-600 border border-green-200"
            : "bg-pink-500 text-white hover:bg-pink-600"
        }`}
      >
        {checked
          ? `✅ ${isKo ? "오늘 출석 완료!" : "Checked in today!"}`
          : `🎯 ${isKo ? "출석 체크 (+1P)" : "Check in (+1P)"}`}
      </button>
      {showAnim && (
        <p className="mt-2 text-center text-pink-500 text-sm font-bold animate-bounce">+1P!</p>
      )}
      <p className="mt-2 text-center text-xs text-gray-400">
        🔥 {isKo ? `연속 ${streak}일째` : `${streak} day streak`}
      </p>
    </div>
  );
}
