// Run before the first Google tag event, including automatic page views.
export function bootstrapAnalytics() {
  if (window.location.hostname !== "www.getrecoscope.com") return;
  const requested = new URLSearchParams(window.location.search).get("rs_traffic");
  if (["visitor", "staff", "qa"].includes(requested)) {
    document.cookie = `recoscope_audience=${requested}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
  }
  const saved = document.cookie.split(";").map(s => s.trim()).find(s => s.startsWith("recoscope_audience="))?.split("=")[1];
  const audience = ["visitor", "staff", "qa"].includes(saved) ? saved : "visitor";
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("set", { audience_type: audience, measurement_version: "journey_v1", ...(audience === "qa" ? { debug_mode: true } : {}) });
  window.gtag("js", new Date());
  window.gtag("config", "G-NWNHPKNGBB");
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-NWNHPKNGBB";
  document.head.appendChild(script);
}
export const analyticsBootstrapScript = `(${bootstrapAnalytics.toString()})();`;
