"use client";
import { useState } from "react";
import { formatSnapshotDate, snapshotAge } from "@/lib/discovery.mjs";
import { TrackedLink } from "@/components/TrackedLink";

export interface DiscoveryCategory {
  name: string;
  slug: string;
  latest_run_date: string;
  finding: string;
  coverage: { eligible: number; captured: number; models: string[] };
}
export function CategoryFinder({
  categories,
  today,
  compact = false,
}: {
  categories: DiscoveryCategory[];
  today: string;
  compact?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const sorted = [...categories].sort(
    (a, b) =>
      b.latest_run_date.localeCompare(a.latest_run_date) ||
      a.name.localeCompare(b.name),
  );
  const matches = sorted.filter(
    (c) =>
      c.name.toLowerCase().includes(query.trim().toLowerCase()) &&
      (filter === "all" ||
        (snapshotAge(c.latest_run_date, today) === "Recent snapshot") ===
          (filter === "recent")),
  );
  const visible = compact ? matches.slice(0, 6) : matches;
  return (
    <div>
      <div className="finder-controls">
        <div className="flex-1">
          <label
            htmlFor="category-search"
            className="block text-sm font-medium mb-2"
          >
            Find your category
          </label>
          <input
            id="category-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search categories"
            className="field"
          />
        </div>
        {!compact && (
          <div>
            <label
              htmlFor="snapshot-filter"
              className="block text-sm font-medium mb-2"
            >
              Publication age
            </label>
            <select
              id="snapshot-filter"
              className="field"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All published reports</option>
              <option value="recent">Recent snapshots</option>
              <option value="historical">Historical snapshots</option>
            </select>
          </div>
        )}
      </div>
      <p className="mt-3 mb-5 text-sm text-[var(--secondary)]" role="status">
        {matches.length} {matches.length === 1 ? "category" : "categories"}{" "}
        found
        {compact && matches.length > 6
          ? " · showing the six most recently published"
          : ""}
      </p>
      <div className="category-grid">
        {visible.map((c) => (
          <TrackedLink
            key={c.slug}
            href={`/tracker/${c.slug}`}
            event="benchmark_category_open"
            source={compact ? "homepage" : "tracker"}
            className="category-card"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3>{c.name}</h3>
              <span className="snapshot-status">
                {snapshotAge(c.latest_run_date, today)}
              </span>
            </div>
            <p className="my-4 leading-relaxed">{c.finding}</p>
            <div className="mt-auto">
              <p className="text-sm text-[var(--secondary)]">
                <time dateTime={c.latest_run_date}>
                  {formatSnapshotDate(c.latest_run_date)}
                </time>
              </p>
              <p className="mt-2 text-sm text-[var(--secondary)]">
                {c.coverage.eligible}/{c.coverage.captured} usable answers ·{" "}
                {c.coverage.models.length} models
              </p>
              {c.coverage.eligible < c.coverage.captured && (
                <p className="mt-2 text-sm text-[var(--secondary)]">
                  Reduced coverage · see report notes
                </p>
              )}
              <p className="mt-5 font-semibold text-[var(--brand)]">
                View report →
              </p>
            </div>
          </TrackedLink>
        ))}
      </div>
      {!visible.length && (
        <div className="empty-state">
          <p>No matching published category.</p>
          <a href="/request-category" className="text-link">
            Request a category →
          </a>
        </div>
      )}
      <p className="mt-6 text-sm text-[var(--secondary)]">
        “Recent” means published within 45 days. Dates show when answers were
        collected; reports are snapshots, not continuous monitoring.
      </p>
      {compact && (
        <a href="/tracker" className="button-secondary mt-6">
          Browse all categories →
        </a>
      )}
    </div>
  );
}
