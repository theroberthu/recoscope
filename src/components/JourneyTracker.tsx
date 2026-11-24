"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { auditMeasurement, trackEvent } from "@/lib/analytics";
import { readAudience, safePath } from "@/lib/journey.mjs";

export function JourneyTracker() {
  const pathname = usePathname();
  const search = useSearchParams();
  const lastPage = useRef("");
  const [audience, setAudience] = useState("visitor");
  useEffect(() => {
    setAudience(readAudience(document.cookie));
    const page = safePath(location.href);
    if (page === lastPage.current) return;
    lastPage.current = page;
    auditMeasurement();
    trackEvent("journey_page_view", { destination_path: page });
  }, [pathname, search]);

  useEffect(() => {
    if (pathname !== "/" || !window.IntersectionObserver) return;
    const viewed = new Set<Element>();
    const timers = new Map<Element, ReturnType<typeof setTimeout>>();
    const elements = [...document.querySelectorAll<HTMLElement>("[data-journey-section]")];
    function visible(element: Element) {
      const rect = element.getBoundingClientRect();
      const pixels = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
      return rect.height > 0 && rect.width > 0 && document.visibilityState === "visible" && pixels >= Math.min(rect.height * 0.5, 200);
    }
    function update() {
      for (const element of elements) {
        if (viewed.has(element)) continue;
        if (!visible(element)) {
          clearTimeout(timers.get(element)); timers.delete(element); continue;
        }
        if (timers.has(element)) continue;
        timers.set(element, setTimeout(() => {
          timers.delete(element);
          if (!visible(element) || viewed.has(element)) return;
          viewed.add(element);
          trackEvent("homepage_section_view", { section_id: element.dataset.journeySection || "unknown" });
        }, 1000));
      }
    }
    const observer = new IntersectionObserver(update, { threshold: [0, 0.1, 0.25, 0.5, 1] });
    elements.forEach(element => observer.observe(element));
    // Tall sections may cross the pixel threshold between observer thresholds.
    window.addEventListener("scroll", update, { passive: true });
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect(); timers.forEach(clearTimeout);
      window.removeEventListener("scroll", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [pathname]);
  if (audience === "visitor") return null;
  return <aside aria-label="Measurement visit type" style={{ position: "fixed", bottom: 8, left: 8, zIndex: 99, background: "var(--ink)", color: "var(--paper, #f3efe6)", padding: "6px 10px", fontSize: 12 }}>
    {audience === "qa" ? "Test visit" : "Staff visit"} · labelled for visitor-analysis filters
    {" · "}<a href="/?rs_traffic=visitor" style={{ color: "inherit", textDecoration: "underline" }}>Use visitor mode</a>
  </aside>;
}
