"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect, useState, useCallback } from "react";

const CONSENT_COOKIE = "recoscope_consent";

function getConsent(): "accepted" | "declined" | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  if (!match) return null;
  return match[1] === "accepted" ? "accepted" : "declined";
}

function setConsent(value: "accepted" | "declined") {
  const maxAge = 365 * 24 * 60 * 60; // 1 year
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function initPostHog() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || posthog.__loaded) return;

  posthog.init(key, {
    api_host: "https://us.i.posthog.com",
    capture_pageview: true,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
  });
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsentState] = useState<"accepted" | "declined" | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = getConsent();
    setConsentState(stored);
    setLoaded(true);

    // Only init if previously accepted
    if (stored === "accepted") {
      initPostHog();
    }
  }, []);

  const handleAccept = useCallback(() => {
    setConsent("accepted");
    setConsentState("accepted");
    initPostHog();
  }, []);

  const handleDecline = useCallback(() => {
    setConsent("declined");
    setConsentState("declined");
  }, []);

  // Don't show banner until we've checked the cookie (prevents flash)
  const showBanner = loaded && consent === null;

  return (
    <PHProvider client={posthog}>
      {children}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/10 bg-surface/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-3">
            <p className="text-[13px] text-white/40">
              We use cookies to improve your experience.
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={handleDecline}
                className="rounded-full px-4 py-1.5 font-mono text-[12px] font-medium text-white/30 transition-colors hover:text-white/50"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="rounded-full bg-cyan/20 px-4 py-1.5 font-mono text-[12px] font-medium text-cyan transition-colors hover:bg-cyan/30"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </PHProvider>
  );
}

/** Fire a PostHog event (only works after consent + init). */
export function trackPostHog(event: string, properties?: Record<string, string | number | boolean>) {
  if (typeof window !== "undefined" && posthog.__loaded) {
    posthog.capture(event, properties);
  }
}
