"use client";

import { useState } from "react";

// 공유 버튼 — SNS 공유 시 +2P, 하루 최대 3회
export default function ShareButton({ locale }: { locale: string }) {
  const [showToast, setShowToast] = useState(false);
  const [copied, setCopied] = useState(false);

  const getShareCount = () => {
    const today = new Date().toISOString().slice(0, 10);
    const key = `kbbg_share_${today}`;
    return parseInt(localStorage.getItem(key) || "0");
  };

  const addSharePoint = () => {
    const today = new Date().toISOString().slice(0, 10);
    const key = `kbbg_share_${today}`;
    const count = getShareCount();
    if (count >= 3) return false;
    localStorage.setItem(key, String(count + 1));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
    return true;
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = "K-Beauty Buyers Guide";

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    addSharePoint();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, "_blank");
    addSharePoint();
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
    addSharePoint();
  };

  return (
    <div className="relative inline-flex items-center gap-1.5">
      <button onClick={handleCopyLink}
        className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
        {copied ? t("ui.copied") : t("ui.copy_link")}
      </button>
      <button onClick={handleShareTwitter}
        className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
        𝕏
      </button>
      <button onClick={handleShareFacebook}
        className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
        f
      </button>
      {showToast && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-1 rounded-full animate-bounce whitespace-nowrap">
          +2P!
        </span>
      )}
    </div>
  );
}
