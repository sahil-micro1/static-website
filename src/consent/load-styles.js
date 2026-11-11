(async function loadConsentStyles() {
  const sheets = await Promise.all(
    [
      "http://127.0.0.1:8080/src/consent/consent.css",
      "http://127.0.0.1:8080/src/consent/consent-light.css",
    ].map((url) =>
      fetch(url).then((r) => {
        if (!r.ok) throw new Error("Failed to load " + url);
        return r.text();
      })
    )
  );
  document.getElementById("dg-consent-custom-style").textContent = sheets.join("\n");
  if (!document.querySelector('script[src*="consent-loader.js"]')) {
    const script = document.createElement("script");
    script.src =
      "https://api.consentjs.datagrail.io/a48e8743-7d84-41e8-a072-095c984aad86/7ca70b74-55ae-43cd-8cac-a68284ed23c4/consent-loader.js";
    script.async = true;
    document.head.appendChild(script);
  }

  document.addEventListener("click", (event) => {
    const path = event.composedPath ? event.composedPath() : [event.target];
    const trigger = path.find((el) => el.matches?.("[data-datagrall='open-customize']"));
    if (!trigger) return;
    event.preventDefault();
    window.DG_BANNER_API?.showLayer("categories-layer");
  });

  function syncCustomizeScroll() {
    const banner = document.querySelector(".dg-consent-banner");
    const app = banner?.shadowRoot?.querySelector(".dg-app");
    if (!app) return;
    const open =
      (banner.classList.contains("dg-left") || banner.classList.contains("dg-right")) &&
      banner.style.display !== "none" &&
      banner.getAttribute("aria-hidden") !== "true" &&
      getComputedStyle(banner).display !== "none";
    const scroller = app.querySelector(":scope > .dg-scroll-body");
    if (!open) {
      if (!scroller) return;
      while (scroller.firstChild) app.insertBefore(scroller.firstChild, scroller);
      scroller.remove();
      return;
    }
    const explanation = app.querySelector(":scope > .dg-main-content-explanation");
    const policies = app.querySelector(":scope > .dg-main-content-policies");
    if (!explanation || !policies) return;
    const body = scroller || document.createElement("div");
    body.className = "dg-scroll-body";
    if (!scroller) explanation.before(body);
    body.append(explanation, policies);
  }

  // Lock page scroll while customize panel is open
  let scrollLocked = false;
  let lockedScrollY = 0;

  function isCustomizeOpen() {
    const banner = document.querySelector(
      ".dg-consent-banner.dg-left, .dg-consent-banner.dg-right"
    );
    if (!banner) return false;
    // DataGrail keeps dg-left/right classes after close; check visibility
    if (banner.style.display === "none") return false;
    if (banner.getAttribute("aria-hidden") === "true") return false;
    if (!banner.classList.contains("visible") && getComputedStyle(banner).display === "none") {
      return false;
    }
    return getComputedStyle(banner).display !== "none";
  }

  function setScrollLock(lock) {
    if (lock === scrollLocked) return;
    scrollLocked = lock;
    if (lock) {
      lockedScrollY = window.scrollY;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${lockedScrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, lockedScrollY);
    }
  }

  const scrollLockObserver = new MutationObserver(() => {
    syncCustomizeScroll();
    setScrollLock(isCustomizeOpen());
  });
  scrollLockObserver.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["class", "style", "aria-hidden"],
  });
})();



