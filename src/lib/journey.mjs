export const MEASUREMENT_VERSION = "journey_v1";
export const AUDIENCE_COOKIE = "recoscope_audience";
export const AUDIENCES = ["visitor", "staff", "qa"];
export const SESSION_KEY = "recoscope_journey_v1";
const MAX_AGE = 30 * 60 * 1000;
export function safeLabel(value, max = 100) {
  return typeof value === "string" && /^[a-zA-Z0-9 _./:#?&=%+–-]+$/.test(value) ? value.slice(0, max) : "";
}
export function safePath(value) {
  if (typeof value !== "string" || !value) return "";
  try {
    const url = new URL(value, "https://www.getrecoscope.com");
    if (url.origin !== "https://www.getrecoscope.com") return "";
    if (!/^[a-zA-Z0-9/-]{1,180}$/.test(url.pathname)) return "";
    const period = url.searchParams.get("period");
    return url.pathname + (period && /^\d{4}-\d{2}-[A-Z]$/.test(period) ? `?period=${period}` : "");
  } catch { return ""; }
}
export function readAudience(cookie = "") {
  const value = cookie.split(";").map(s => s.trim()).find(s => s.startsWith(AUDIENCE_COOKIE + "="))?.split("=")[1];
  return value && AUDIENCES.includes(value) ? value : "visitor";
}
export function cleanCampaign(search) {
  const query = new URLSearchParams(search);
  return Object.fromEntries(["utm_source", "utm_medium", "utm_campaign", "utm_content"].flatMap(key => {
    const value = query.get(key);
    return value && /^[a-zA-Z0-9_-]{1,100}$/.test(value) ? [[key, value]] : [];
  }));
}
export function cleanSession(value, now = Date.now()) {
  if (!value || typeof value !== "object" || !Number.isFinite(value.last_seen) || now - value.last_seen > MAX_AGE || now < value.last_seen) return null;
  return {
    landing_path: safePath(value.landing_path),
    ...cleanCampaign(new URLSearchParams(value).toString()),
    referrer_host: typeof value.referrer_host === "string" && /^[a-z0-9.-]{1,100}$/.test(value.referrer_host) ? value.referrer_host : "",
    entry_element: safeLabel(value.entry_element), entry_path: safePath(value.entry_path), last_seen: now,
  };
}
export function sanitizeLeadMeasurement(value, audience = "visitor") {
  const input = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {
    measurement_version: input.measurement_version === MEASUREMENT_VERSION ? MEASUREMENT_VERSION : "unavailable",
    audience_type: AUDIENCES.includes(audience) ? audience : "visitor",
    landing_path: safePath(input.landing_path), entry_element: safeLabel(input.entry_element), entry_path: safePath(input.entry_path),
    referrer_host: typeof input.referrer_host === "string" && /^[a-z0-9.-]{1,100}$/.test(input.referrer_host) ? input.referrer_host : "",
    campaign: cleanCampaign(new URLSearchParams(input.campaign || {}).toString()),
  };
}
export function eventParameters(params = {}, audience = "visitor") {
  const allowed = ["ui_element", "destination_path", "section_id", "category_slug", "period", "video_id", "poll_id", "category", "field"];
  // UI context must not overwrite acquisition source or medium.
  const input = { ...params, ui_element: params.ui_element || params.source };
  const clean = Object.fromEntries(allowed.flatMap(key => {
    const value = key === "destination_path" ? safePath(input[key]) : safeLabel(input[key]);
    return value ? [[key, value]] : [];
  }));
  return { ...clean, measurement_version: MEASUREMENT_VERSION, audience_type: AUDIENCES.includes(audience) ? audience : "visitor", ...(audience === "qa" ? { debug_mode: true } : {}) };
}
