"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    posthog.init(key, {
      api_host: "https://us.i.posthog.com",
      capture_pageview: true,
      capture_pageleave: true,
      persistence: "localStorage+cookie",
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

/** Fire a PostHog event (safe to call before init). */
export function trackPostHog(event: string, properties?: Record<string, string | number | boolean>) {
  if (typeof window !== "undefined" && posthog.__loaded) {
    posthog.capture(event, properties);
  }
}
