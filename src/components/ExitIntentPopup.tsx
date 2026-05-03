"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface RelatedPost {
  slug: string;
  title_ko: string;
  title_en: string;
  category: string;
  published_at: string;
  image_url?: string;
  [key: string]: string | undefined;
}

interface ExitIntentPopupProps {
  locale: string;
  relatedPosts: RelatedPost[];
}

const SESSION_KEY = "exit_intent_shown";
const MIN_PAGE_TIME_MS = 15_000;
const MOBILE_IDLE_MS = 30_000;
// Mouse Y threshold: trigger when cursor moves above this pixel value
const MOUSE_TOP_THRESHOLD = 50;

export default function ExitIntentPopup({ locale, relatedPosts }: ExitIntentPopupProps) {
  const [visible, setVisible] = useState(false);

  const displayPosts = relatedPosts.slice(0, 3);

  const tryShow = useCallback(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(true);
  }, []);

  const close = useCallback(() => setVisible(false), []);

  useEffect(() => {
    // Don't attach any listeners until the user has been here 15s
    let ready = false;
    const readyTimer = setTimeout(() => { ready = true; }, MIN_PAGE_TIME_MS);

    // --- Desktop: mouse exits toward top ---
    let prevY = 0;
    const onMouseMove = (e: MouseEvent) => {
      if (!ready) return;
      const movingUp = e.clientY < prevY;
      if (movingUp && e.clientY < MOUSE_TOP_THRESHOLD) tryShow();
      prevY = e.clientY;
    };

    // --- Mobile: fast upward scroll ---
    let lastScrollY = window.scrollY;
    let lastScrollTime = Date.now();
    const VELOCITY_THRESHOLD = 3; // px/ms — fast scroll up
    const onScroll = () => {
      if (!ready) return;
      const now = Date.now();
      const dy = window.scrollY - lastScrollY;
      const dt = now - lastScrollTime;
      if (dt > 0 && dy < 0) {
        const velocity = Math.abs(dy) / dt;
        if (velocity > VELOCITY_THRESHOLD) tryShow();
      }
      lastScrollY = window.scrollY;
      lastScrollTime = now;
    };

    // --- Mobile: idle for 30s ---
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    const resetIdle = () => {
      if (idleTimer) clearTimeout(idleTimer);
      if (!ready) return;
      idleTimer = setTimeout(tryShow, MOBILE_IDLE_MS);
    };
    const idleEvents = ["touchstart", "touchmove", "scroll"] as const;

    // Escape key closes
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("mousemove", onMouseMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    idleEvents.forEach((ev) => window.addEventListener(ev, resetIdle, { passive: true }));
    document.addEventListener("keydown", onKeyDown);

    return () => {
      clearTimeout(readyTimer);
      if (idleTimer) clearTimeout(idleTimer);
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      idleEvents.forEach((ev) => window.removeEventListener(ev, resetIdle));
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [tryShow, close]);

  if (!visible || displayPosts.length === 0) return null;

  const isKo = locale === "ko";
  const title = isKo ? "잠깐! 이런 글도 있어요" : "Wait! You might also like...";
  const noThanks = isKo ? "괜찮아요" : "No thanks";

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Panel — stop propagation so clicking inside doesn't close */}
      <div
        className="relative w-full max-w-md bg-[#1d1d1f] rounded-2xl shadow-[rgba(0,0,0,0.22)_3px_5px_30px_0px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={close}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors text-lg leading-none"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="px-6 pt-7 pb-6">
          <h2 className="text-white font-semibold text-lg leading-snug tracking-tight mb-5 pr-6">
            {title}
          </h2>

          <div className="flex flex-col gap-3">
            {displayPosts.map((post) => {
              const postTitle = post[`title_${locale}`] || post.title_en;
              return (
                <Link
                  key={post.slug}
                  href={`/${locale}/blog/${post.slug}`}
                  onClick={close}
                  className="flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-xl p-3 transition-colors group"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white/10">
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        alt={postTitle || ""}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-2xl">
                        ✦
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <p className="text-white/80 group-hover:text-white text-sm leading-snug tracking-tight transition-colors line-clamp-3">
                    {postTitle}
                  </p>
                </Link>
              );
            })}
          </div>

          {/* No thanks */}
          <button
            onClick={close}
            className="mt-5 w-full text-center text-white/30 hover:text-white/60 text-xs transition-colors py-1"
          >
            {noThanks}
          </button>
        </div>
      </div>
    </div>
  );
}
