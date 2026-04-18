"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

// 출석 체크 컴포넌트 — 매일 1회, +1 포인트
export default function DailyCheckIn({ locale: _locale }: { locale: string }) {
  const t = useTranslations();
  const [checked, setChecked] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showAnim, setShowAnim] = useState(false);

  // 한국시간(KST, UTC+9) 기준 날짜 반환
  const getKSTDate = (date: Date) => {
    const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().slice(0, 10);
  };

  useEffect(() => {
    const today = getKSTDate(new Date());
    const lastCheck = localStorage.getItem("kbbg_checkin_date");
    const savedStreak = parseInt(localStorage.getItem("kbbg_checkin_streak") || "0");

    if (lastCheck === today) {
      setChecked(true);
      setStreak(savedStreak);
    } else {
      // 어제(KST) 체크했으면 연속, 아니면 리셋
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getKSTDate(yesterday);
      setStreak(lastCheck === yesterdayStr ? savedStreak : 0);
    }
  }, []);

  const handleCheckIn = () => {
    if (checked) return;
    const today = getKSTDate(new Date());
    const newStreak = streak + 1;
    localStorage.setItem("kbbg_checkin_date", today);
    localStorage.setItem("kbbg_checkin_streak", String(newStreak));
    setChecked(true);
    setStreak(newStreak);
    setShowAnim(true);
    setTimeout(() => setShowAnim(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">
        📅 {t("ui.daily_checkin")}
      </h3>
      <button
        onClick={handleCheckIn}
        disabled={checked}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${
          checked
            ? "bg-green-50 text-green-600 border-2 border-green-400"
            : "bg-slate-800 text-white hover:bg-slate-900"
        }`}
      >
        {checked
          ? `✅ ${t("ui.checked_in")}`
          : `🎯 ${t("ui.checkin_btn")}`}
      </button>
      {showAnim && (
        <div className="mt-2 text-center animate-bounce">
          <p className="text-slate-700 text-sm font-bold">
            🎉 {t("ui.congrats_checkin")}
          </p>
          <p className="text-slate-700 text-xs font-semibold mt-0.5">+1P 획득!</p>
        </div>
      )}
      <p className="mt-2 text-center text-xs text-gray-400">
        🔥 {t("ui.streak_days").replace("{count}", String(streak))}
      </p>
    </div>
  );
}
