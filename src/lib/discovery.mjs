export function todayCentral() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function formatSnapshotDate(value) {
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00Z`);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en-US", {
        timeZone: "UTC",
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
}

/** This describes the age of a publication, never whether collection is running. */
export function snapshotAge(value, today = todayCentral()) {
  const age =
    (Date.parse(`${today}T12:00:00Z`) -
      Date.parse(`${String(value).slice(0, 10)}T12:00:00Z`)) /
    86400000;
  return Number.isFinite(age) && age >= 0 && age <= 45
    ? "Recent snapshot"
    : "Historical snapshot";
}

export function auditHref(category, source = "report") {
  return `/audit?${new URLSearchParams({ category, source })}`;
}

export function resolveCategory(value, categories) {
  return categories.find((c) => c.slug === value)?.name ?? "";
}
