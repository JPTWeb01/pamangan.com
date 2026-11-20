// Google Analytics 4 with consent. Nothing loads and nothing is tracked until
// REACT_APP_GA_ID is set at build time AND the visitor accepts analytics cookies.
// Admin pages (/manage) are never tracked.

export const GA_ID = (process.env.REACT_APP_GA_ID || "").trim();
const CONSENT_KEY = "pmConsent"; // "granted" | "denied"

let loaded = false;

const store = {
  get() {
    try { return localStorage.getItem(CONSENT_KEY); } catch { return null; }
  },
  set(v) {
    try { localStorage.setItem(CONSENT_KEY, v); } catch { /* private mode */ }
  },
};

export const analyticsEnabled = () => Boolean(GA_ID);
export const getConsent = () => store.get();
const isAdminPath = () => window.location.pathname.startsWith("/manage");

function gtag() {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

function load() {
  if (loaded || !GA_ID) return;
  loaded = true;
  window.gtag = gtag;
  gtag("consent", "default", {
    ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
    analytics_storage: "granted",
  });
  gtag("js", new Date());
  // Page views are sent manually on route changes (single-page app)
  gtag("config", GA_ID, { send_page_view: false, anonymize_ip: true });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(s);
  document.addEventListener("click", trackOutboundClick, true);
  pageView();
}

export function setConsent(granted) {
  store.set(granted ? "granted" : "denied");
  if (granted) load();
  else if (loaded) window.gtag?.("consent", "update", { analytics_storage: "denied" });
}

export function initAnalytics() {
  if (GA_ID && store.get() === "granted") load();
}

export function pageView() {
  if (!loaded || isAdminPath()) return;
  window.gtag("event", "page_view", {
    page_location: window.location.href,
    page_path: window.location.pathname + window.location.search,
    page_title: document.title,
  });
}

/** Track a custom event, e.g. track("generate_recipe", { dish: "adobo" }). */
export function track(name, params = {}) {
  if (!loaded || isAdminPath()) return;
  window.gtag("event", name, params);
}

// Messenger, Facebook, phone and text links anywhere on the site
function trackOutboundClick(e) {
  const a = e.target.closest?.("a[href]");
  if (!a) return;
  const href = a.getAttribute("href") || "";
  const where = window.location.pathname;
  if (href.includes("m.me/")) track("contact_messenger", { link_page: where });
  else if (href.includes("facebook.com")) track("contact_facebook", { link_page: where });
  else if (href.startsWith("tel:")) track("contact_phone", { link_page: where });
  else if (href.startsWith("sms:")) track("contact_text", { link_page: where });
}
