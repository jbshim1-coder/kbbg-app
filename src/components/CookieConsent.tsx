"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "kbbg_cookie_consent";

interface Props {
  locale: string;
}

export default function CookieConsent({ locale }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  }

  const t = useTranslations("ui");

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-800 text-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
      <p className="text-sm text-slate-200 text-center sm:text-left">
        {t("cookie_msg")}
      </p>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={accept}
          className="px-4 py-1.5 bg-white text-slate-800 text-sm font-medium rounded hover:bg-slate-100 transition-colors"
        >
          {t("cookie_accept")}
        </button>
        <button
          onClick={decline}
          className="px-4 py-1.5 border border-slate-500 text-slate-300 text-sm rounded hover:border-slate-300 hover:text-white transition-colors"
        >
          {t("cookie_decline")}
        </button>
      </div>
    </div>
  );
}
