"use client";

import { useEffect, useRef } from "react";

export function ScrollFade({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Show immediately — don't wait for observer
    const show = () => el.classList.add("visible");

    // If already in viewport, show now
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 100) {
      show();
      return;
    }

    // Observe for scroll into view
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            show();
            observer?.disconnect();
          }
        },
        { threshold: 0, rootMargin: "0px 0px 100px 0px" },
      );
      observer.observe(el);
    } else {
      // No IntersectionObserver support — show immediately
      show();
    }

    // Safety net: always show after 2 seconds no matter what
    const timeout = setTimeout(show, 2000);

    return () => {
      observer?.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div ref={ref} className={`fade-section ${className}`}>
      {children}
    </div>
  );
}
