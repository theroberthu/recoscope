"use client";

import { useEffect, useRef } from "react";

export function ScrollFade({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => {
      el.classList.add("visible");
    };

    // Opt into the animation (content is visible by default without this)
    el.classList.add("fade-ready");

    // If already in viewport, show immediately
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 100) {
      // Use rAF to ensure fade-ready is painted before visible is added
      requestAnimationFrame(() => show());
      return;
    }

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
      show();
    }

    // Safety net
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
