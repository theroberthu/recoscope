"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export function ReportViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    trackEvent("report_view", { category_slug: slug });
  }, [slug]);
  return null;
}
