import { MEASUREMENT_VERSION, SESSION_KEY, cleanCampaign, cleanSession, eventParameters, readAudience, safePath } from "./journey.mjs";
declare global { interface Window { gtag?: (...args: unknown[]) => void; } }
function session() {
  if (typeof window === "undefined") return null;
  try {
    const previous = cleanSession(JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"));
    if (previous) return previous;
  } catch { /* Requests still work without storage. */ }
  let referrer = "";
  try { referrer = new URL(document.referrer).hostname; } catch { /* Direct entry. */ }
  return { landing_path: safePath(location.href), ...cleanCampaign(location.search), referrer_host: referrer, entry_element: "", entry_path: "", last_seen: Date.now() };
}
function saveSession(value: ReturnType<typeof session>) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(value)); } catch { /* Optional analytics storage. */ }
}
export function auditMeasurement() {
  const value = session();
  if (!value) return {};
  saveSession(value);
  const { last_seen: _lastSeen, ...context } = value;
  const campaign = Object.fromEntries(Object.entries(context).filter(([key]) => key.startsWith("utm_")));
  return { measurement_version: MEASUREMENT_VERSION, ...context, campaign };
}
export function recordAuditEntry(element: string) {
  const value = session();
  if (value) saveSession({ ...value, entry_element: element, entry_path: safePath(location.href), last_seen: Date.now() });
}
export function auditEventParams(fallback: string) {
  const value = session();
  return { ui_element: value?.entry_element || `audit_${fallback}`, destination_path: "/audit" };
}
export function trackEvent(name: string, params?: Record<string, string>) {
  if (typeof window === "undefined" || location.hostname !== "www.getrecoscope.com") return;
  const value = session();
  if (value) saveSession(value);
  if (window.gtag) window.gtag("event", name, eventParameters(params, readAudience(document.cookie)));
}
