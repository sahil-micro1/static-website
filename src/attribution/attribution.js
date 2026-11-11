/**
 * Static marketing attribution — m1_attr cookie, written only after DataGrail
 * confirms the Performance category. Nothing is stored before that.
 * See Cookies final.pdf (Static scope).
 */
const COOKIE_NAME = "m1_attr";
const TTL_DAYS = 90;
const OWN_HOST_RE = /(^|\.)micro1\.ai$|(^|\.)webflow\.io$|meetings|staging/i;
const APP_HOSTS = [
  "intelligence.micro1.ai",
  "new-stage.intelligence.micro1.ai",
  "talent.micro1.ai",
  "new-stage.talent.micro1.ai",
  "company.micro1.ai",
  "new-stage.company.micro1.ai",
  "interview.micro1.ai",
  "jobs.micro1.ai",
  "dev.d3k2dall9o449y.amplifyapp.com",
  "refer.micro1.ai",
  "new-stage.refer.micro1.ai",
];

const STAGING_HOSTS = {
  "zara.micro1.ai": "new-stage.client.micro1.ai",
  "talent.micro1.ai": "new-stage.talent.micro1.ai",
  "intelligence.micro1.ai": "new-stage.intelligence.micro1.ai",
  "company.micro1.ai": "new-stage.company.micro1.ai",
  "jobs.micro1.ai": "dev.d3k2dall9o449y.amplifyapp.com",
  "refer.micro1.ai": "new-stage.refer.micro1.ai",
};

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
];

function emptyTouch() {
  return {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    ref_site: null,
    ref: null,
    page: null,
    ts: null,
  };
}

function emptyAttr() {
  return { first: emptyTouch(), last: emptyTouch() };
}

function getCookie(name) {
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)"),
  );
  return match ? match[1] : "";
}

function readJsonCookie(name) {
  const raw = getCookie(name);
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

function cookieDomain() {
  const host = location.hostname;
  if (host === "localhost" || host.endsWith(".webflow.io") || !host.includes("micro1.ai")) {
    return "";
  }
  return "; domain=.micro1.ai";
}

function writeAttrCookie(attr) {
  const expire = new Date();
  expire.setDate(expire.getDate() + TTL_DAYS);
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(attr))}` +
    `; path=/; expires=${expire.toUTCString()}; SameSite=Lax${secure}${cookieDomain()}`;
}

function nowTs() {
  return new Date().toISOString();
}

function stripWww(host) {
  return (host || "").replace(/^www\./i, "").toLowerCase();
}

function isOwnHost(host) {
  if (!host) return true;
  return OWN_HOST_RE.test(host);
}

function hasAnyUtm(touch) {
  return UTM_KEYS.some((k) => touch && touch[k]);
}

function touchIsEmptyUtms(touch) {
  return !hasAnyUtm(touch);
}

function firstUtmsEmpty(attr) {
  return touchIsEmptyUtms(attr.first);
}

function urlTouchFromLocation(search = location.search) {
  const params = new URLSearchParams(search);
  const touch = emptyTouch();
  let has = false;
  for (const k of UTM_KEYS) {
    const v = params.get(k);
    if (v) {
      touch[k] = v;
      has = true;
    }
  }
  const ref = params.get("ref");
  if (ref) {
    touch.ref = ref;
    has = true;
  }
  touch.page = location.href;
  touch.ts = nowTs();
  return has ? touch : null;
}

const REFERERS_URL = "https://static-website.sahil-773.workers.dev/referers.json";

let referersPromise;
function loadReferers() {
  if (!referersPromise) {
    referersPromise = fetch(REFERERS_URL)
      .then((r) => {
        if (!r.ok) throw new Error("referers " + r.status);
        return r.json();
      })
      .catch((err) => {
        console.error(err);
        return null;
      });
  }
  return referersPromise;
}

function lookupReferer(referers, host) {
  const h = stripWww(host);
  if (!h || !referers) return null;
  if (referers.exact[h]) return referers.exact[h];
  for (const p of referers.prefixes || []) {
    if (h === p.prefix || h.startsWith(p.prefix + ".")) {
      return { medium: p.medium, source: p.source };
    }
  }
  for (const s of referers.suffixes || []) {
    if (h !== s.suffix && h.endsWith("." + s.suffix)) {
      return { medium: s.medium, source: s.source };
    }
  }
  return null;
}

async function inferUtmsFromReferrer(referrerUrl) {
  if (!referrerUrl) return null;
  let host;
  try {
    host = stripWww(new URL(referrerUrl).hostname);
  } catch {
    return null;
  }
  if (isOwnHost(host)) return null;

  const hit = lookupReferer(await loadReferers(), host);
  if (hit) {
    if (hit.medium === "paid") return null;
    return {
      utm_source: hit.source,
      utm_medium: hit.medium,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
    };
  }
  return {
    utm_source: host,
    utm_medium: "inbound",
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
  };
}

function setFirstIfEmpty(target, patch) {
  for (const [k, v] of Object.entries(patch)) {
    if (v == null || v === "") continue;
    if (target[k] == null || target[k] === "") target[k] = v;
  }
}

function applyLast(attr, patch) {
  for (const [k, v] of Object.entries(patch)) {
    if (v == null || v === "") continue;
    attr.last[k] = v;
  }
  attr.last.ts = nowTs();
}

function migrateLegacy(attr) {
  const utm = readJsonCookie("utm_cookie_contact");
  if (utm && typeof utm === "object") {
    if (!hasAnyUtm(attr.last)) {
      applyLast(attr, {
        utm_source: utm.utm_source || null,
        utm_medium: utm.utm_medium || null,
        utm_campaign: utm.utm_campaign || null,
        utm_content: utm.utm_content || null,
        utm_term: utm.utm_term || null,
      });
    }
    if (firstUtmsEmpty(attr)) {
      setFirstIfEmpty(attr.first, {
        utm_source: utm.utm_source || null,
        utm_medium: utm.utm_medium || null,
        utm_campaign: utm.utm_campaign || null,
        utm_content: utm.utm_content || null,
        utm_term: utm.utm_term || null,
        ts: nowTs(),
      });
    }
  }

  let cusRef = getCookie("cus_ref_site");
  if (cusRef) {
    try {
      cusRef = decodeURIComponent(cusRef);
    } catch {
      /* keep raw */
    }
    if (cusRef && !isOwnHost(cusRef) && !attr.last.ref_site) {
      attr.last.ref_site = cusRef;
    }
    if (cusRef && !isOwnHost(cusRef) && !attr.first.ref_site) {
      attr.first.ref_site = cusRef;
    }
  }

  let firstPage = getCookie("first_page");
  let lastPage = getCookie("last_page");
  try {
    if (firstPage) firstPage = decodeURIComponent(firstPage);
    if (lastPage) lastPage = decodeURIComponent(lastPage);
  } catch {
    /* ignore */
  }
  if (firstPage && !attr.first.page) attr.first.page = firstPage;
  if (lastPage && !attr.last.page) attr.last.page = lastPage;

  let legacyRef = getCookie("ref");
  if (legacyRef) {
    try {
      legacyRef = decodeURIComponent(legacyRef);
    } catch {
      /* ignore */
    }
    if (legacyRef && !attr.last.ref) attr.last.ref = legacyRef;
    if (legacyRef && !attr.first.ref) attr.first.ref = legacyRef;
  }

  return attr;
}

async function captureAttribution(attr) {
  const page = location.href;
  attr.last.page = page;
  if (!attr.first.page) attr.first.page = page;
  attr.last.ts = nowTs();
  if (!attr.first.ts) attr.first.ts = nowTs();

  // External referrer
  const referrer = document.referrer;
  if (referrer) {
    try {
      const host = stripWww(new URL(referrer).hostname);
      if (host && !isOwnHost(host)) {
        attr.last.ref_site = host;
        if (!attr.first.ref_site) attr.first.ref_site = host;
      }
    } catch {
      /* ignore */
    }
  }

  const urlTouch = urlTouchFromLocation();
  const urlHasUtms = urlTouch && UTM_KEYS.some((k) => urlTouch[k]);

  // A new campaign link replaces all five latest-visit fields.
  // Fields the new link does not include are cleared.
  if (urlHasUtms) {
    for (const k of UTM_KEYS) attr.last[k] = null;
    const utmPatch = {};
    for (const k of UTM_KEYS) {
      if (urlTouch[k]) utmPatch[k] = urlTouch[k];
    }
    applyLast(attr, utmPatch);
    if (firstUtmsEmpty(attr)) {
      setFirstIfEmpty(attr.first, { ...utmPatch, ts: nowTs() });
    }
  }

  // Infer from referrer only if no URL UTMs and last has no UTMs yet
  if (!urlHasUtms && !hasAnyUtm(attr.last)) {
    const inferred = await inferUtmsFromReferrer(referrer);
    if (inferred) {
      applyLast(attr, inferred);
      if (firstUtmsEmpty(attr)) {
        setFirstIfEmpty(attr.first, { ...inferred, ts: nowTs() });
      }
    }
  }

  // ?ref=
  const refParam = new URLSearchParams(location.search).get("ref");
  if (refParam) {
    attr.last.ref = refParam;
    if (!attr.first.ref) attr.first.ref = refParam;
    if (!hasAnyUtm(attr.last)) {
      const fallback = {
        utm_source: refParam,
        utm_medium: "inbound",
      };
      applyLast(attr, fallback);
      if (firstUtmsEmpty(attr)) {
        setFirstIfEmpty(attr.first, { ...fallback, ts: nowTs() });
      }
    }
  }

  return attr;
}

function updateInputs(selector, value) {
  if (value == null) value = "";
  document.querySelectorAll(selector).forEach((el) => {
    el.value = value;
  });
}

function resolveFormTouch(attr, analyticsOn) {
  if (analyticsOn && attr) return { last: attr.last, first: attr.first };

  // No consent yet: use only what is in this page's URL, held in memory.
  const url = urlTouchFromLocation();
  const last = emptyTouch();
  const first = emptyTouch();

  if (url) {
    for (const k of UTM_KEYS) {
      if (url[k]) {
        last[k] = url[k];
        first[k] = url[k];
      }
    }
    if (url.ref) {
      last.ref = url.ref;
      first.ref = url.ref;
    }
  }
  last.page = location.href;
  first.page = location.href;
  return { last, first };
}

export function fillAttributionInputs(attr, { analyticsOn = true } = {}) {
  const { last, first } = resolveFormTouch(attr, analyticsOn);

  updateInputs(".utm_source_input", last.utm_source);
  updateInputs(".utm_medium_input", last.utm_medium);
  updateInputs(".utm_campaign_input", last.utm_campaign);
  updateInputs(".utm_content_input", last.utm_content);
  updateInputs(".utm_term_input", last.utm_term);
  updateInputs(".ref_site_input", last.ref_site);
  updateInputs(".ref_input", last.ref);
  updateInputs(".last_page_name", last.page);
  updateInputs(".first_page_name", first.page);
  updateInputs(".current_page_name", location.href);

  // First touch → HubSpot: original_utm_*, original_ref_site, original_ref ("Original ref"), first_page_seen
  updateInputs(".first_utm_source_input", first.utm_source);
  updateInputs(".first_utm_medium_input", first.utm_medium);
  updateInputs(".first_utm_campaign_input", first.utm_campaign);
  updateInputs(".first_utm_content_input", first.utm_content);
  updateInputs(".first_utm_term_input", first.utm_term);
  updateInputs(".first_ref_site_input", first.ref_site);
  updateInputs(".first_ref_input", first.ref);

  return { last, first };
}

function fillConsentFromDataGrail() {
  const api = window.DG_BANNER_API;
  if (!api?.categoryEnabled) return;

  const marketing = !!api.categoryEnabled("marketing");
  const performance = !!api.categoryEnabled("performance");
  let consentStr;
  if (marketing && performance) consentStr = "All";
  else {
    consentStr = "Essentials";
    if (marketing) consentStr += ", Marketing";
    if (performance) consentStr += ", Performance";
  }
  updateInputs(".input_cookie-consent", consentStr);
}

function carryParams(touch, { includeRefSite = false } = {}) {
  if (!touch) return {};
  const params = {};
  for (const k of UTM_KEYS) {
    if (touch[k]) params[k] = touch[k];
  }
  if (touch.ref) params.ref = touch.ref;
  if (includeRefSite && touch.ref_site) params.ref_site = touch.ref_site;
  return params;
}

function isAppHost(hostname) {
  const host = (hostname || "").toLowerCase();
  return APP_HOSTS.some((h) => host === h || host.endsWith("." + h));
}

function isMarketingHost(hostname) {
  const host = (hostname || "").toLowerCase();
  if (isAppHost(host)) return false;
  if (host === location.hostname.toLowerCase()) return true;
  if (host === "micro1.ai" || host === "www.micro1.ai") return true;
  if (host.endsWith(".webflow.io")) return true;
  return false;
}

/**
 * The page defines `const customTrackData` inline. A const is not a window property,
 * so `window.customTrackData` would be a different object. Use the bare global when it exists.
 */
function getTrack() {
  /* eslint-disable no-undef */
  if (typeof customTrackData !== "undefined" && customTrackData) {
    if (customTrackData.portalParams == null) customTrackData.portalParams = "";
    return customTrackData;
  }
  /* eslint-enable no-undef */
  window.customTrackData = window.customTrackData || { utm: {}, user: {} };
  if (window.customTrackData.portalParams == null) {
    window.customTrackData.portalParams = "";
  }
  return window.customTrackData;
}

function writePortalParams(params) {
  const paramsStr = decodeURIComponent(new URLSearchParams(params).toString());
  getTrack().portalParams = paramsStr;
  updateInputs(".portal_params", paramsStr);
}

function refreshJobLinks() {
  if (typeof window.setUTM !== "function" || !window.state?.jobs?.result) return;
  try {
    window.setUTM();
    window.renderJobs?.();
  } catch (err) {
    console.error(err);
  }
}

/**
 * One pass over links.
 * App hosts get UTMs, ref, and ref_site when allowed.
 * Analytics off also copies UTMs and ref onto marketing-site links for this tab.
 */
function stampCarryLinks(touch, { internal = false, includeRefSite = false } = {}) {
  const params = carryParams(touch, { includeRefSite });
  const entries = Object.entries(params);
  writePortalParams(params);
  if (!entries.length && !location.hostname.includes("webflow.io")) return;

  const rewriteStaging = location.hostname.includes("webflow.io");

  document.querySelectorAll("a[href]:not([href='#'])").forEach((link) => {
    let url;
    try {
      url = new URL(link.href, location.href);
    } catch {
      return;
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") return;

    const app = isAppHost(url.hostname);
    const marketing = internal && isMarketingHost(url.hostname);
    if (!app && !marketing) return;

    let changed = false;
    if (app && rewriteStaging && STAGING_HOSTS[url.hostname]) {
      url.hostname = STAGING_HOSTS[url.hostname];
      changed = true;
    }
    for (const [k, v] of entries) {
      if (!url.searchParams.has(k)) {
        url.searchParams.set(k, v);
        changed = true;
      }
    }
    if (changed) link.href = url.toString();
  });
  refreshJobLinks();
}

function syncSessionTrack(touch, hutk) {
  const c = getTrack();
  const params = carryParams(touch);
  c.utm = {
    utm_source: params.utm_source || null,
    utm_medium: params.utm_medium || null,
    utm_campaign: params.utm_campaign || null,
    utm_content: params.utm_content || null,
    utm_term: params.utm_term || null,
  };
  c.ref = params.ref || null;
  c.cusRef = null;
  c.current_page = location.href;
  if (hutk) c.hutk = hutk;
}

function performanceAllowed() {
  try {
    return window.DG_BANNER_API?.categoryEnabled("performance") === true;
  } catch {
    return false;
  }
}

/**
 * DataGrail runs these callbacks whenever it loads or the visitor changes a choice,
 * whichever script loads first.
 */
function onDataGrailConsent(handler) {
  window.dgEvent = window.dgEvent || [];
  window.dgEvent.push({
    event: "initial_preference_callback",
    params: () => handler(),
  });
  window.dgEvent.push({
    event: "preference_callback",
    params: () => handler(),
  });
  if (window.DG_BANNER_API?.categoryEnabled) handler();
}

function pollHutk({ deskTimeout = 10000, mobTimeout = 15000, interval = 1000 } = {}) {
  const timeout = window.innerWidth < 992 ? mobTimeout : deskTimeout;
  const start = Date.now();
  return new Promise((resolve) => {
    const tick = () => {
      const hutk = getCookie("hubspotutk");
      if (hutk) return resolve(hutk);
      if (Date.now() - start > timeout) return resolve("");
      setTimeout(tick, interval);
    };
    tick();
  });
}

function syncCustomTrackData(attr, hutk) {
  const c = getTrack();
  const last = attr?.last || emptyTouch();
  const first = attr?.first || emptyTouch();

  c.utm = {
    utm_source: last.utm_source,
    utm_medium: last.utm_medium,
    utm_campaign: last.utm_campaign,
    utm_content: last.utm_content,
    utm_term: last.utm_term,
  };
  c.cusRef = last.ref_site;
  c.ref = last.ref;
  c.first_page = first.page;
  c.last_page = last.page;
  c.current_page = location.href;
  if (hutk) c.hutk = hutk;
  c.m1_attr = attr;
}

let cookieWritten = false;

function fillHutk() {
  pollHutk().then((hutk) => {
    updateInputs(".hutk_input", hutk);
    if (hutk) getTrack().hutk = hutk;
  });
}

/**
 * Runs from the DataGrail callbacks.
 * Performance on: read, update and write m1_attr, then add UTMs, ref and ref_site to app links.
 * Performance off: store nothing; add this page's UTMs and ref to app and internal links.
 */
async function applyConsent() {
  fillConsentFromDataGrail();

  if (!performanceAllowed()) {
    const urlTouch = urlTouchFromLocation();
    fillAttributionInputs(null, { analyticsOn: false });
    syncSessionTrack(urlTouch, "");
    stampCarryLinks(urlTouch, { internal: true });
    return;
  }
  if (cookieWritten) {
    return;
  }
  cookieWritten = true;

  let attr = readJsonCookie(COOKIE_NAME) || emptyAttr();
  if (!attr.first) attr.first = emptyTouch();
  if (!attr.last) attr.last = emptyTouch();

  attr = migrateLegacy(attr);
  attr = await captureAttribution(attr);
  writeAttrCookie(attr);

  fillAttributionInputs(attr, { analyticsOn: true });
  syncCustomTrackData(attr, "");
  stampCarryLinks(attr.last, { includeRefSite: true });
  fillHutk();
}

/**
 * Boot static attribution. Page load does nothing except give the jobs embed an empty
 * portalParams (its setUTM runs on window load). Everything else runs from the
 * DataGrail listener once DataGrail has loaded.
 */
export async function bootStaticAttribution() {
  writePortalParams({});
  onDataGrailConsent(applyConsent);
}

export default { bootStaticAttribution, fillAttributionInputs };
