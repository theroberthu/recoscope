"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { HomeBrandLeader } from "@/lib/home-brand-leaders.mjs";
import { formatSnapshotDate, snapshotAge } from "@/lib/discovery.mjs";
import { TrackedLink } from "@/components/TrackedLink";
import marks from "@/lib/home-brand-marks.json";

function LeaderLogo({ brand }: { brand: string }) {
  const mark = (marks as Record<string, { src: string; dark?: boolean }>)[
    brand
  ];
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={`home-brand-logo ${mark?.dark && !failed ? "home-brand-logo-dark" : ""}`}
      aria-hidden="true"
    >
      {mark && !failed ? (
        <Image
          src={mark.src}
          width={144}
          height={64}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>
          {brand
            .split(/\s+/)
            .slice(0, 2)
            .map((s) => s[0])
            .join("")}
        </span>
      )}
    </div>
  );
}

export function BrandScroller({
  leaders,
  today,
}: {
  leaders: HomeBrandLeader[];
  today: string;
}) {
  const rail = useRef<HTMLUListElement>(null);
  const [bounds, setBounds] = useState({ start: true, end: true });
  const updateBounds = () => {
    const el = rail.current;
    if (el)
      setBounds({
        start: el.scrollLeft <= 6,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2,
      });
  };
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    updateBounds();
    const observer = new ResizeObserver(updateBounds);
    observer.observe(el);
    return () => observer.disconnect();
  }, [leaders]);
  if (!leaders.length) return null;
  const scroll = (direction: number) => {
    const el = rail.current;
    if (el)
      el.scrollBy({
        left: direction * el.clientWidth * 0.8,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  };
  return (
    <section
      id="brand-leaders"
      className="page-shell home-brand-strip"
      aria-labelledby="brand-leaders-title"
    >
      <div className="home-brand-heading">
        <div>
          <p className="eyebrow">Across our latest benchmarks</p>
          <h2 id="brand-leaders-title">Most-mentioned brands</h2>
        </div>
        <div
          className="home-brand-controls"
          aria-label="Browse category leaders"
        >
          <button
            type="button"
            aria-label="Previous brands"
            aria-controls="home-brand-list"
            onClick={() => scroll(-1)}
            disabled={bounds.start}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            aria-label="Next brands"
            aria-controls="home-brand-list"
            onClick={() => scroll(1)}
            disabled={bounds.end}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
      <ul
        id="home-brand-list"
        ref={rail}
        className="home-brand-list"
        tabIndex={0}
        aria-label="Category leaders. Scroll horizontally to explore all brands."
        onScroll={updateBounds}
      >
        {leaders.map((item) => (
          <li key={`${item.slug}-${item.brand}`} className="home-brand-item">
            <TrackedLink
              href={item.href}
              event="benchmark_category_open"
              source="homepage-brand-scroller"
              className="home-brand-link"
            >
              <LeaderLogo brand={item.brand} />
              <h3>{item.brand}</h3>
              <p className="home-brand-category">{item.category}</p>
              <p className="home-brand-count">
                <strong>
                  {item.mentionCount}/{item.eligibleAnswers}
                </strong>{" "}
                usable answers
              </p>
              <p className="home-brand-date">
                <time dateTime={item.runDate}>
                  {formatSnapshotDate(item.runDate)}
                </time>
                {snapshotAge(item.runDate, today) === "Historical snapshot" && (
                  <span>Historical snapshot</span>
                )}
              </p>
              <span className="home-brand-report">
                {item.tied ? "Tied most mentioned" : "Most mentioned"}{" "}
                <span aria-hidden="true">↗</span>
              </span>
            </TrackedLink>
          </li>
        ))}
      </ul>
      <p className="home-brand-description">
        Leaders in each category’s latest public snapshot, including ties.
        Mention frequency measures visibility, not product quality.
      </p>
      <p className="home-brand-footnote">
        Scroll or swipe to explore all {leaders.length} brands. Each opens its
        dated report with collection notes and coverage.
      </p>
    </section>
  );
}
