"use client";
import { useCallback, useEffect } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!;

export function useRecaptcha() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.querySelector(`script[src*="recaptcha"]`)) return;
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const executeRecaptcha = useCallback(async (action: string): Promise<string> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !(window as any).grecaptcha) {
        resolve("");
        return;
      }
      (window as any).grecaptcha.ready(() => {
        (window as any).grecaptcha
          .execute(SITE_KEY, { action })
          .then((token: string) => resolve(token));
      });
    });
  }, []);

  const verifyRecaptcha = useCallback(async (action: string): Promise<boolean> => {
    const token = await executeRecaptcha(action);
    if (!token) return false;
    const res = await fetch("/api/recaptcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    return data.success;
  }, [executeRecaptcha]);

  return { executeRecaptcha, verifyRecaptcha };
}
