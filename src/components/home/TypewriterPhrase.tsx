"use client";

import { useEffect, useState } from "react";

const phrase = "first choice.";

export function TypewriterPhrase() {
  const [length, setLength] = useState(0);
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let interval: ReturnType<typeof setInterval> | undefined;
    let cursorTimeout: ReturnType<typeof setTimeout> | undefined;
    let startTimeout: ReturnType<typeof setTimeout> | undefined;
    const clear = () => {
      clearTimeout(startTimeout);
      clearInterval(interval);
      clearTimeout(cursorTimeout);
    };
    const finish = () => { clear(); setLength(phrase.length); setCursor(false); };
    if (motion.matches) finish();
    else startTimeout = setTimeout(() => {
      let typed = 0;
      interval = setInterval(() => {
        typed += 1;
        setLength(typed);
        if (typed === phrase.length) {
          clearInterval(interval);
          cursorTimeout = setTimeout(() => setCursor(false), 1100);
        }
      }, 90);
    }, 350);
    const onMotionChange = () => { if (motion.matches) finish(); };
    motion.addEventListener("change", onMotionChange);
    return () => { clear(); motion.removeEventListener("change", onMotionChange); };
  }, []);

  return <em className="editorial-typewriter">
    <span className="sr-only">{phrase}</span>
    <span className="editorial-typing-measure" aria-hidden="true">{phrase}</span>
    <span className="editorial-typing-visual" aria-hidden="true">{phrase.slice(0, length)}{cursor && <i className="editorial-typing-cursor" />}</span>
    <noscript><style>{`.editorial-typing-measure { visibility: visible; }.editorial-typing-visual { display: none; }`}</style></noscript>
  </em>;
}
