export const SITE_URL = "https://www.getrecoscope.com";

// Actual substantial page/template revision, never the current request time.
export const CONTENT_UPDATED_AT = "2026-10-28";

export function canonicalUrl(path = "/") {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error("Canonical paths must be local to RecoScope");
  }
  return new URL(path, SITE_URL).href;
}

/** A dated snapshot is the citation target even when reached via the latest page. */
export function reportUrl(slug, period) {
  return canonicalUrl(
    `/tracker/${encodeURIComponent(slug)}?${new URLSearchParams({ period })}`,
  );
}

/** Keep dates valid and omit unknown dates rather than inventing freshness. */
export function isoDate(value) {
  if (!(value instanceof Date) && typeof value !== "string") return undefined;
  if (typeof value === "string" && !value.trim()) return undefined;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return undefined;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return date.toISOString().slice(0, 10) === value ? value : undefined;
  }
  return date.toISOString();
}

export function latestDate(...values) {
  return values
    .map(isoDate)
    .filter(Boolean)
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0];
}

export const PUBLISHER = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "RecoScope",
  url: SITE_URL,
  logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.svg` },
};

export const ROBERT_HU = {
  "@type": "Person",
  "@id": `${SITE_URL}/about#person`,
  name: "Robert Hu",
  url: `${SITE_URL}/about`,
  sameAs: [
    "https://theroberthu.com",
    "https://www.linkedin.com/in/theroberthu",
  ],
};

export function articleSchemaData({
  headline,
  description,
  datePublished,
  dateModified,
  url,
  authorName = "RecoScope",
}) {
  const published = isoDate(datePublished);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    datePublished: published,
    dateModified: latestDate(dateModified, published),
    author: authorName === "Robert Hu" ? ROBERT_HU : PUBLISHER,
    publisher: PUBLISHER,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}

export function jsonLd(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
