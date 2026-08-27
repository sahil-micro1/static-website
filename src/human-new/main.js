
  /**
 * Webflow → GSAP ScrollTriggers
 *
 * 0) .s_hb_h — human hero section (desk + mob/tablet)
 * 1) .s_hb_m — human intro section
 * 2) .s_hb_b — scroll interaction 4 (text + img list)
 * 3) .s_hb_bs — circle expand + name fade + wrap hide → spot scale-out → unmask/thanks
 */

  (() => {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      console.error("[main] Load GSAP + ScrollTrigger before main.js");
      return;
    }
  
    gsap.registerPlugin(ScrollTrigger);

    const HB_DEBUG_MARKERS =
      new URLSearchParams(location.search).has("scrollMarkers") ||
      localStorage.getItem("hb-scroll-markers") === "1";

    /** Visual ScrollTrigger labels at timeline progress points (0–1). */
    function addProgressMarkers(trigger, id, phases) {
      if (!HB_DEBUG_MARKERS) return;
      phases.forEach(({ p, label }, i) => {
        ScrollTrigger.create({
          id: `${id}-${label}`,
          trigger,
          start: () => {
            const st = ScrollTrigger.getById(id);
            if (!st) return "top top";
            return st.start + (st.end - st.start) * p;
          },
          end: "+=1",
          markers: {
            startColor: "#6cf",
            endColor: "#6cf",
            fontSize: "11px",
            indent: 20 + i * 18,
            startLabel: `${Math.round(p * 100)}% ${label}`,
          },
        });
      });
    }
  
    /** Split element text into word <span>s (Webflow "Split text → Word"). */
    function splitWords(el, wordClass = "hb_b_word") {
      if (!el || el.dataset.splitWords === "1") {
        return el ? el.querySelectorAll(`.${wordClass}`) : [];
      }
  
      const text = el.textContent ?? "";
      el.textContent = "";
      el.dataset.splitWords = "1";
  
      const words = [];
      text.split(/(\s+)/).forEach((token) => {
        if (!token) return;
        if (/^\s+$/.test(token)) {
          el.appendChild(document.createTextNode(token));
          return;
        }
        const span = document.createElement("span");
        span.className = wordClass;
        span.textContent = token;
        el.appendChild(span);
        words.push(span);
      });
  
    return words;
  }

  /** Split all paragraphs inside a rich-text container into word spans. */
  function splitRichWords(container, wordClass = "hb_m_word") {
    if (!container) return [];
    const words = [];
    container.querySelectorAll("p").forEach((p) => {
      words.push(...splitWords(p, wordClass));
    });
    return words;
  }

  const flyClamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const flySmooth = (t) => t * t * (3 - 2 * t);

  /** Root rem → px (scroll spacers are rem in Webflow/CSS). */
  function remPx(rem) {
    const root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return rem * root;
  }

  /** Prefer measured spacer height; fall back to rem constant. */
  function scrollPadHeight(pad, fallbackRem) {
    return pad?.offsetHeight > 0 ? pad.offsetHeight : remPx(fallbackRem);
  }

  const FLY_MORPH_FALLBACK_REM = { desktop: 220, mobile: 175 };
  const INTRO_SCROLL_FALLBACK_REM = { desktop: 300, mobile: 260 };

  function introScrollFallbackRem() {
    return window.innerWidth <= 991
      ? INTRO_SCROLL_FALLBACK_REM.mobile
      : INTRO_SCROLL_FALLBACK_REM.desktop;
  }

  function flyMorphFallbackRem() {
    return window.innerWidth <= 991
      ? FLY_MORPH_FALLBACK_REM.mobile
      : FLY_MORPH_FALLBACK_REM.desktop;
  }

  /** Morph scroll distance — reads .hb_b_morph_scroll, CSS var, or .hb_b_scroll − strip. */
  function flyLead(scene) {
    const root = scene || document.querySelector(".s_hb_b.is-flythrough");

    const morphPad = root?.querySelector(".hb_b_morph_scroll");
    if (morphPad?.offsetHeight > 0) return morphPad.offsetHeight;

    if (root) {
      const morphVar = getComputedStyle(root).getPropertyValue("--hb-b-morph-scroll").trim();
      if (morphVar.endsWith("rem")) return remPx(parseFloat(morphVar));
      if (morphVar.endsWith("px")) return parseFloat(morphVar);
    }

    const scrollPad = root?.querySelector(".hb_b_scroll");
    if (scrollPad?.offsetHeight > 0 && root) {
      const stripVar = getComputedStyle(root).getPropertyValue("--hb-b-strip-scroll").trim();
      if (stripVar.endsWith("rem")) {
        const morph = scrollPad.offsetHeight - remPx(parseFloat(stripVar));
        if (morph > 0) return morph;
      }
    }

    return remPx(flyMorphFallbackRem());
  }
  const FLY_FOCAL = 620;
  const FLY_DEPTH = 2600;
  const FLY_TRAVEL_MUL = 2.6;
  const FLY_LOCK_END = 0.52;
  const FLY_PLATE_IN_START = 0.48;
  const FLY_PLATE_IN_END = 0.60;
  const FLY_STAR_FADE_START = 0.60;
  const FLY_STAR_FADE_END = 0.72;
  const FLY_MORPH_CARD_START = 0.68;
  const FLY_MORPH_CARD_END = 0.88;
  const FLY_CONTENT_START = 0.70;
  const FLY_CONTENT_END = 0.86;
  const FLY_CARD_IMG_START = 0.82;
  const HB_M_HANDOFF = 1;
  const HB_M_INTRO_DONE = 0.82;

  /** Scroll Y when .s_hb_m intro timeline finishes. Uses ST end, not section geometry. */
  function getIntroHandoffScroll() {
    const st = ScrollTrigger.getById("hb-m-intro");
    if (st) return st.start + (st.end - st.start) * HB_M_INTRO_DONE;
    const intro = document.querySelector(".s_hb_m");
    if (!intro) return 0;
    const pad = intro.querySelector(".hb_m_scroll");
    const top = intro.getBoundingClientRect().top + window.scrollY;
    return top + scrollPadHeight(pad, introScrollFallbackRem());
  }

  /** Softer stars while .hb_m_rich is on screen; full brightness before/after. */
  function introStarDim(progress) {
    const p = progress;
    if (p < 0.43) return 1;
    if (p < 0.45) return 1 - flySmooth(flyClamp((p - 0.43) / 0.02)) * 0.42;
    if (p <= 0.66) return 0.58;
    if (p < 0.72) return 0.58 + flySmooth(flyClamp((p - 0.66) / 0.06)) * 0.42;
    return 1;
  }

  function flyMorphStart() {
    return getIntroHandoffScroll();
  }

  function flyMorphEnd(scene) {
    return getIntroHandoffScroll() + flyLead(scene);
  }

  function flyEnsureCanvas() {
    let canvas = document.querySelector(".hb_flythrough-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.className = "hb_flythrough-canvas";
      canvas.setAttribute("aria-hidden", "true");
      document.body.prepend(canvas);
    }
    return canvas;
  }

  function flyEnsurePlate(src) {
    let plate = document.querySelector(".hb_b_reveal-plate");
    if (!plate) {
      plate = document.createElement("img");
      plate.className = "hb_b_reveal-plate";
      plate.alt = "";
      plate.setAttribute("aria-hidden", "true");
      plate.style.pointerEvents = "none";
      document.body.appendChild(plate);
    }
    plate.style.pointerEvents = "none";
    if (src) plate.src = src;
    return plate;
  }

  function flyResolveTargetImage(scene) {
    const plate = document.querySelector(".hb_b_reveal-plate");
    const fromPlate = plate?.getAttribute("src") || plate?.src;
    if (fromPlate) return fromPlate;

    const firstImg = scene.querySelector(
      ".hb_b_img-item:first-child .hb_b_img.is-main"
    );
    return firstImg?.currentSrc || firstImg?.src || "";
  }

  /** Fly-through star field for .s_hb_b.is-flythrough */
  function initFlythrough(scene, { stripTween, applyRotateText, textBlock, imgListWrap }) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = flyEnsureCanvas();
    const sticky = scene.querySelector(".hb_b_main");
    const firstCard = scene.querySelector(".hb_b_img-item:first-child");
    const firstCardImg = firstCard?.querySelector(".hb_b_img.is-main");
    const targetUrl = flyResolveTargetImage(scene);

    if (!sticky || !firstCard || !targetUrl) {
      console.warn("[flythrough] Missing .hb_b_main, first card, or target image URL");
      return;
    }

    // Opacity handoff targets the item; clear any leftover inline opacity on the inner img.
    firstCard.style.opacity = "0";
    if (firstCardImg) firstCardImg.style.opacity = "";

    const plate = flyEnsurePlate(targetUrl);
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    let pts = [];
    let img = null;
    let home = null;
    const state = { travel: 0, lock: 0, fade: 1, preTextDim: 1 };

    const size = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /** Viewport-centered plate rect (fixed overlay, same space as star canvas). */
    function layoutPlate(ref) {
      size();
      const nw = ref?.naturalWidth;
      const nh = ref?.naturalHeight;
      if (!nw || !nh) return;

      const ar = nw / nh;
      const bw = Math.min(H * 0.62 * ar, W * 0.84);
      const bh = bw / ar;
      const ox = (W - bw) / 2;
      const oy = (H - bh) / 2;

      home = { x: ox, y: oy, w: bw, h: bh };
      Object.assign(plate.style, {
        width: `${bw}px`,
        height: `${bh}px`,
        left: `${ox}px`,
        top: `${oy}px`,
      });
    }

    function buildStars(ref) {
      if (!ref?.naturalWidth || !home) return;

      const bw = home.w;
      const bh = home.h;
      const ox = home.x;
      const oy = home.y;

      const step = 3;
      const cols = Math.max(1, Math.floor(bw / step));
      const rows = Math.max(1, Math.floor(bh / step));
      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const o = off.getContext("2d", { willReadFrequently: true });

      try {
        o.drawImage(ref, 0, 0, cols, rows);
        const d = o.getImageData(0, 0, cols, rows).data;

        pts = [];
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const i = (y * cols + x) * 4;
            const l = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) / 255;
            if (l < 0.1) continue;
            if (Math.random() > l * 0.7 + 0.3) continue;
            pts.push({
              x: ox + x * step - W / 2,
              y: oy + y * step - H / 2,
              l,
              z: Math.random() * FLY_DEPTH,
              sx: (Math.random() - 0.5) * 2.2,
              sy: (Math.random() - 0.5) * 2.2,
            });
          }
        }
      } catch (err) {
        console.warn("[flythrough] Star sampling skipped:", err);
      }
    }

    function updatePlateMorph(p) {
      if (!home) return;

      const c = firstCard.getBoundingClientRect();
      const to = c.width
        ? { x: c.left, y: c.top, w: c.width, h: c.height }
        : home;
      const t = flySmooth(
        flyClamp((p - FLY_MORPH_CARD_START) / (FLY_MORPH_CARD_END - FLY_MORPH_CARD_START))
      );

      plate.style.left = `${home.x + (to.x - home.x) * t}px`;
      plate.style.top = `${home.y + (to.y - home.y) * t}px`;
      plate.style.width = `${home.w + (to.w - home.w) * t}px`;
      plate.style.height = `${home.h + (to.h - home.h) * t}px`;
      plate.style.opacity = String(
        flyClamp((p - FLY_PLATE_IN_START) / (FLY_PLATE_IN_END - FLY_PLATE_IN_START)) *
          (1 - flyClamp((p - 0.94) / 0.06))
      );

      firstCard.style.opacity = String(
        flyClamp((p - FLY_CARD_IMG_START) / (FLY_MORPH_CARD_END - FLY_CARD_IMG_START))
      );
    }

    plate.onload = () => {
      layoutPlate(plate);
      ScrollTrigger.refresh();
    };
    if (plate.complete && plate.naturalWidth) layoutPlate(plate);

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      img = image;
      layoutPlate(image);
      buildStars(image);
      ScrollTrigger.refresh();
    };
    image.onerror = () => {
      if (plate.complete) layoutPlate(plate);
      ScrollTrigger.refresh();
    };
    image.src = targetUrl;

    addEventListener("resize", () => {
      const ref = img || (plate.complete ? plate : null);
      layoutPlate(ref);
      if (img) buildStars(img);
    });
    size();

    const travelRoot =
      document.querySelector(".page-wrapper") || document.documentElement;

    gsap.to(state, {
      travel: 1,
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: travelRoot,
        start: "top top",
        end: () => getIntroHandoffScroll(),
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });

    const intro = document.querySelector(".s_hb_m");
    if (intro) {
      const introProg = { p: 0 };
      gsap.to(introProg, {
        p: 1,
        ease: "none",
        scrollTrigger: {
          trigger: intro,
          start: "top top",
          end: () => ScrollTrigger.getById("hb-m-intro")?.end ?? "bottom top",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          const p = Math.min(1, introProg.p / HB_M_INTRO_DONE);
          state.preTextDim = introStarDim(p);
        },
      });
    }

    if (stripTween) {
      ScrollTrigger.create({
        animation: stripTween,
        trigger: scene,
        start: () => flyMorphStart() + flyLead(scene) * FLY_MORPH_CARD_END,
        end: "bottom bottom",
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => applyRotateText?.(self.progress),
      });
    }

    gsap.fromTo(
      [textBlock, imgListWrap].filter(Boolean),
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: scene,
          start: () => flyMorphStart() + flyLead(scene) * FLY_CONTENT_START,
          end: () => flyMorphStart() + flyLead(scene) * FLY_CONTENT_END,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      }
    );

    const morph = { p: 0 };
    gsap.to(morph, {
      p: 1,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: scene,
        start: () => flyMorphStart(),
        end: () => flyMorphEnd(scene),
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
      onUpdate: () => {
        const p = morph.p;
        state.lock = flySmooth(flyClamp(p / FLY_LOCK_END));
        state.fade =
          1 -
          flyClamp((p - FLY_STAR_FADE_START) / (FLY_STAR_FADE_END - FLY_STAR_FADE_START));

        if (!home) return;

        updatePlateMorph(p);
      },
    });

    ScrollTrigger.create({
      trigger: scene,
      start: () => flyMorphEnd(scene),
      onToggle: (self) => {
        if (self.isActive) {
          state.fade = 0;
          plate.style.opacity = "0";
          firstCard.style.opacity = "1";
        }
      },
    });

    gsap.ticker.add(() => {
      if (!pts.length) return;
      ctx.clearRect(0, 0, W, H);
      if (state.fade <= 0.01) return;

      const lock = state.lock;
      const cz = state.travel * FLY_DEPTH * FLY_TRAVEL_MUL * (1 - lock * 0.65);
      const spread = 1 - lock;

      for (let i = 0; i < pts.length; i++) {
        const pt = pts[i];
        let z = pt.z - cz;
        z = ((z % FLY_DEPTH) + FLY_DEPTH) % FLY_DEPTH;
        z = Math.max(24, z + (FLY_FOCAL - z) * lock);
        const k = FLY_FOCAL / z;
        const x = W / 2 + (pt.x + pt.x * pt.sx * spread) * k;
        const y = H / 2 + (pt.y + pt.y * pt.sy * spread) * k;
        if (x < -40 || x > W + 40 || y < -40 || y > H + 40) continue;
        const near = flyClamp(1 - z / FLY_DEPTH);
        const a = (0.06 + pt.l * 0.8) * (0.22 + near * 0.78) * state.fade * state.preTextDim;
        if (a <= 0.012) continue;
        const sz = 0.85 + near * 1.15;
        ctx.fillStyle = `rgba(${182 + pt.l * 58},${190 + pt.l * 52},255,${a})`;
        ctx.fillRect(x, y, sz, sz);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 0) .s_hb_h — human hero section
  //    start: top / top | end: bottom / top | scrub: 0.8s
  //
  //    desk (≥992px):
  //    0–18%   .hb_h_p                opacity 1 → 0
  //    4–22%   .hb_h_head             opacity 1 → 0
  //    16–32%  .hb_logo                opacity 1 → 0
  //    0–100%  .hb_h_zoom.is-desk     scale 1 → 6
  //    32–100% .hb_h_zoom.is-desk     opacity 1 → 0
  //    32–100% .hb_h_stars            opacity 0 → 1 (crossfade with eye)
  //
  //    mob/tablet (<992px):
  //    0–28%   .hb_logo                opacity 1 → 0
  //    0–55%   .hb_h_text             opacity 1 → 0 (stagger from end)
  //    0–100%  .hb_h_zoom.is-mob      scale 1 → 6
  //    32–100% .hb_h_zoom.is-mob      opacity 1 → 0
  //    32–100% .hb_h_stars            opacity 0 → 1 (crossfade with eye)
  // ---------------------------------------------------------------------------
  ScrollTrigger.matchMedia({
    "(min-width: 992px)": () => {
      const trigger = document.querySelector(".s_hb_h");
      if (!trigger) {
        console.warn("[main] Missing .s_hb_h");
        return;
      }

      const wrapper = trigger.closest(".main-wrapper") || document;
      const desc = trigger.querySelector(".hb_h_p");
      const head = trigger.querySelector(".hb_h_head");
      const logo = trigger.querySelector(".hb_logo");
      const zoom = wrapper.querySelector(".hb_h_zoom.is-desk");
      const stars = wrapper.querySelector(".hb_h_stars");

      if (desc) gsap.set(desc, { opacity: 1 });
      if (head) gsap.set(head, { opacity: 1 });
      if (logo) gsap.set(logo, { opacity: 1 });
      if (zoom) gsap.set(zoom, { scale: 1, opacity: 1, transformOrigin: "50% 50%" });
      if (stars) gsap.set(stars, { opacity: 0, visibility: "visible" });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger,
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      if (desc) {
        tl.fromTo(desc, { opacity: 1 }, { opacity: 0, duration: 0.18 }, 0);
      }
      if (head) {
        tl.fromTo(head, { opacity: 1 }, { opacity: 0, duration: 0.18 }, 0.04);
      }
      if (logo) {
        tl.fromTo(logo, { opacity: 1 }, { opacity: 0, duration: 0.16 }, 0.16);
      }
      if (zoom) {
        tl.fromTo(zoom, { scale: 1 }, { scale: 6, duration: 1 }, 0);
        tl.fromTo(zoom, { opacity: 1 }, { opacity: 0, duration: 0.68 }, 0.32);
      }
      if (stars) {
        tl.fromTo(stars, { opacity: 0 }, { opacity: 1, duration: 0.68 }, 0.32);
      }
    },
    "(max-width: 991px)": () => {
      const trigger = document.querySelector(".s_hb_h");
      if (!trigger) {
        console.warn("[main] Missing .s_hb_h (mob)");
        return;
      }

      const wrapper = trigger.closest(".main-wrapper") || document;
      const main = trigger.querySelector(".hb_h_main");
      const text = trigger.querySelector(".hb_h_text");
      const logo = trigger.querySelector(".hb_logo");
      const zoom =
        wrapper.querySelector(".hb_h_zoom.is-mob") ||
        wrapper.querySelector(".hb_h_zoom:not(.is-desk)");
      const stars = wrapper.querySelector(".hb_h_stars");

      const head = text?.querySelector(".hb_h_head");
      const desc = text?.querySelector(".hb_h_p");
      const textParts = [head, desc].filter(Boolean);

      if (logo) gsap.set(logo, { opacity: 1 });
      if (textParts.length) gsap.set(textParts, { opacity: 1 });
      if (zoom) gsap.set(zoom, { scale: 1, opacity: 1, transformOrigin: "50% 50%" });
      if (stars) gsap.set(stars, { opacity: 0, visibility: "visible" });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger,
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
          pin: main || true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      if (logo) {
        tl.fromTo(logo, { opacity: 1 }, { opacity: 0, duration: 0.28 }, 0);
      }

      if (textParts.length) {
        const blockText = 0.55;
        const staggerText = Math.min(0.2, blockText * 0.6);
        tl.to(
          textParts,
          {
            opacity: 0,
            duration: blockText - staggerText,
            stagger: { amount: staggerText, from: "end", ease: "none" },
          },
          0
        );
      }

      if (zoom) {
        // Scale only — do not lock opacity here (competes with the fade tween below).
        tl.fromTo(zoom, { scale: 1 }, { scale: 6, duration: 1 }, 0);
        // Match desktop crossfade window so stars ease in with the eye (not a late pop).
        tl.fromTo(zoom, { opacity: 1 }, { opacity: 0, duration: 0.68 }, 0.32);
      }
      if (stars) {
        tl.fromTo(stars, { opacity: 0 }, { opacity: 1, duration: 0.68 }, 0.32);
      }
    },
  });

  // ---------------------------------------------------------------------------
  // 1) .s_hb_m — human intro section
  //    start: top / top | end: += .hb_m_scroll | scrub: 0.8s | sticky .hb_m_main
  //    Markers: add ?scrollMarkers=1 to URL (or localStorage hb-scroll-markers=1)
  //
  //    0%      p1-in
  //    0–16%   .hb_m_p.is-1        opacity 0 → 1, scale 0.8 → 1
  //    16–22%  .hb_m_p.is-1        opacity → 0
  //    22–37%  .hb_m_p.is-2        split words in, stagger
  //    38–44%  .hb_m_p.is-2        opacity → 0
  //    45–66%  .hb_m_rich          split words in, stagger  (stars dimmer)
  //    66–75%  .hb_m_rich          opacity → 0              (stars brighten)
  //    76–88%  .hb_m_p.is-3        split words in, stagger
  //    88–100% .hb_m_p.is-3        opacity → 0
  //    100%    fly-handoff         stars → image morph starts
  // ---------------------------------------------------------------------------
  {
    const trigger = document.querySelector(".s_hb_m");
    if (!trigger) {
      console.warn("[main] Missing .s_hb_m");
    } else {
      const main = trigger.querySelector(".hb_m_main");
      const p1 = trigger.querySelector(".hb_m_p.is-1");
      const p2 = trigger.querySelector(".hb_m_p.is-2");
      const p3 = trigger.querySelector(".hb_m_p.is-3");
      const rich = trigger.querySelector(".hb_m_rich");

      const words2 = p2 ? splitWords(p2, "hb_m_word") : [];
      const words3 = p3 ? splitWords(p3, "hb_m_word") : [];
      const richWords = splitRichWords(rich, "hb_m_word");

      if (p1) gsap.set(p1, { opacity: 0, scale: 0.8, transformOrigin: "50% 50%" });
      if (words2.length) gsap.set(words2, { opacity: 0 });
      else if (p2) gsap.set(p2, { opacity: 0 });
      if (richWords.length) gsap.set(richWords, { opacity: 0 });
      else if (rich) gsap.set(rich, { opacity: 0 });
      if (words3.length) gsap.set(words3, { opacity: 0 });
      else if (p3) gsap.set(p3, { opacity: 0 });

      const scrollPad = trigger.querySelector(".hb_m_scroll");
      const introScrollDistance = () =>
        scrollPadHeight(scrollPad, introScrollFallbackRem());
      // Timeline finishes at 82% scroll; last 18% holds final frame while sticky
      // keeps text fixed (avoids unpin drift on fast scroll).

      const tl = gsap.timeline({ defaults: { ease: "none" }, paused: true });

      const driver = { p: 0 };
      gsap.to(driver, {
        p: 1,
        ease: "none",
        scrollTrigger: {
          id: "hb-m-intro",
          trigger,
          start: "top top",
          end: () => "+=" + introScrollDistance(),
          scrub: 0.8,
          invalidateOnRefresh: true,
          markers: HB_DEBUG_MARKERS
            ? {
                startColor: "#0f0",
                endColor: "#f00",
                fontSize: "12px",
                indent: 0,
                startLabel: "m-start",
                endLabel: "m-end",
              }
            : false,
        },
        onUpdate: () => {
          tl.progress(Math.min(1, driver.p / HB_M_INTRO_DONE));
        },
      });

      addProgressMarkers(trigger, "hb-m-intro", [
        { p: 0, label: "p1-in" },
        { p: 0.16, label: "p1-out" },
        { p: 0.22, label: "p2-in" },
        { p: 0.37, label: "p2-hold-end" },
        { p: 0.38, label: "p2-out" },
        { p: 0.45, label: "rich-in" },
        { p: 0.66, label: "rich-out" },
        { p: 0.75, label: "rich-gone" },
        { p: 0.76, label: "p3-in" },
        { p: 0.88, label: "p3-out" },
        { p: HB_M_INTRO_DONE, label: "p3-gone" },
        { p: 1, label: "fly-handoff" },
      ]);

      if (p1) {
        tl.fromTo(
          p1,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.16 },
          0
        );
        tl.to(p1, { opacity: 0, duration: 0.06 }, 0.16);
      }

      if (words2.length) {
        const block2 = 0.15;
        const stagger2 = Math.min(0.2, block2 * 0.6);
        tl.fromTo(
          words2,
          { opacity: 0 },
          {
            opacity: 1,
            duration: block2 - stagger2,
            stagger: { amount: stagger2, from: "start", ease: "none" },
          },
          0.22
        );
        tl.to(words2, { opacity: 0, duration: 0.06 }, 0.38);
      } else if (p2) {
        tl.fromTo(p2, { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.22);
        tl.to(p2, { opacity: 0, duration: 0.06 }, 0.38);
      }

      if (richWords.length) {
        const blockRich = 0.21;
        const staggerRich = Math.min(0.2, blockRich * 0.6);
        tl.fromTo(
          richWords,
          { opacity: 0 },
          {
            opacity: 1,
            duration: blockRich - staggerRich,
            stagger: { amount: staggerRich, from: "start", ease: "none" },
          },
          0.45
        );
        tl.to(richWords, { opacity: 0, duration: 0.09 }, 0.66);
      } else if (rich) {
        tl.fromTo(rich, { opacity: 0 }, { opacity: 1, duration: 0.21 }, 0.45);
        tl.to(rich, { opacity: 0, duration: 0.09 }, 0.66);
      }

      if (words3.length) {
        const block3 = 0.15;
        const stagger3 = Math.min(0.2, block3 * 0.6);
        tl.fromTo(
          words3,
          { opacity: 0 },
          {
            opacity: 1,
            duration: block3 - stagger3,
            stagger: { amount: stagger3, from: "start", ease: "none" },
          },
          0.76
        );
        tl.to(words3, { opacity: 0, duration: 0.12 }, 0.88);
      } else if (p3) {
        tl.fromTo(p3, { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.76);
        tl.to(p3, { opacity: 0, duration: 0.12 }, 0.88);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 2) .s_hb_b
    //    start: top / -20% | end: bottom / bottom | scrub: 0.8s
    //    0–15%   .hb_b_head          opacity, split words + stagger
    //    15–20%  .hb_b_head-wrap     opacity
    //    20–30%  .hb_b_img-list-wrap opacity
    //    30–100% .hb_b_img-list      x: ≥768 −(5000−vw) | <768 −(189rem−100vw) | ≤479 −5.78×vw
    //    0–30%   .hb_b_head.is-rotate initial text (hold)
    //    30–35%  initial | 35–50% expression | 50–55% creativity
    //    63–68%  guidance | 99–100% calculation (shared)
    //    precision / ingenuity (desktop & tablet, >479px): 78% / 91%
    //    precision / ingenuity (mobile ≤479px, same breakpoint as imgListSlideX): 76% / 88%
    //    (gaps 55–63; holds between phases until next breakpoint; calculation always at 99%)
    // ---------------------------------------------------------------------------
    {
      const trigger = document.querySelector(".s_hb_b");
      if (!trigger) {
        console.warn("[main] Missing .s_hb_b");
      } else {
        const head = trigger.querySelector(".hb_b_head:not(.is-rotate)");
        const rotateHead = trigger.querySelector(".hb_b_head.is-rotate");
        const headWrap = trigger.querySelector(".hb_b_head-wrap");
        const imgListWrap = trigger.querySelector(".hb_b_img-list-wrap");
        const imgList = trigger.querySelector(".hb_b_img-list");
  
        function imgListSlideX() {
          const vw = window.innerWidth;
          if (vw <= 479) return -(5.78 * vw); // −5.78×vw
          if (vw < 768) {
            const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
            return -((189 * remPx) - vw); // −(189rem − 100vw)
          }
          return -(5000 - vw);
        }
  
        const words = head ? splitWords(head) : [];
  
        const rotateTexts = [
          "expression.",
          "creativity.",
          "guidance.",
          "precision.",
          "ingenuity.",
          "calculation.",
        ];
        const rotateInitial = rotateHead ? (rotateHead.textContent || "").trim() : "";
        const rotateBreakpointsShared = [
          { at: 0.30, text: rotateInitial },
          { at: 0.35, text: rotateTexts[0] },
          { at: 0.50, text: rotateTexts[1] },
          { at: 0.63, text: rotateTexts[2] },
        ];
        const rotateBreakpointsMobile = [
          ...rotateBreakpointsShared,
          { at: 0.76, text: rotateTexts[3] },
          { at: 0.88, text: rotateTexts[4] },
          { at: 0.99, text: rotateTexts[5] },
        ];
        const rotateBreakpointsDesktop = [
          ...rotateBreakpointsShared,
          { at: 0.78, text: rotateTexts[3] },
          { at: 0.91, text: rotateTexts[4] },
          { at: 0.99, text: rotateTexts[5] },
        ];
        let lastRotateText = rotateInitial;

        function getRotateBreakpoints() {
          return window.innerWidth <= 479 ? rotateBreakpointsMobile : rotateBreakpointsDesktop;
        }

        function rotateTextForProgress(progress) {
          if (progress < 0.30) return rotateInitial;
          let text = rotateInitial;
          for (const bp of getRotateBreakpoints()) {
            if (progress >= bp.at) text = bp.text;
            else break;
          }
          return text;
        }
  
        function applyRotateText(progress) {
          if (!rotateHead) return;
          const next = rotateTextForProgress(progress);
          if (next === lastRotateText) return;
          lastRotateText = next;
          rotateHead.textContent = next;
        }

        const isFlythrough = trigger.classList.contains("is-flythrough");
        const textBlock = trigger.querySelector(".hb_b_text");

        if (isFlythrough) {
          if (textBlock) gsap.set(textBlock, { autoAlpha: 0 });
          if (imgListWrap) gsap.set(imgListWrap, { autoAlpha: 0 });
          if (imgList) gsap.set(imgList, { x: 0 });

          const stripTween = imgList
            ? gsap.to(imgList, { x: imgListSlideX, ease: "none" })
            : null;

          initFlythrough(trigger, {
            stripTween,
            applyRotateText,
            textBlock,
            imgListWrap,
          });
        } else {
          if (words.length) gsap.set(words, { opacity: 0 });
          else if (head) gsap.set(head, { opacity: 0 });
          if (headWrap) gsap.set(headWrap, { opacity: 0 });
          if (imgListWrap) gsap.set(imgListWrap, { opacity: 0 });
          if (imgList) gsap.set(imgList, { x: 0 });

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger,
              start: "top -20%",
              end: "bottom bottom",
              scrub: 0.8,
              invalidateOnRefresh: true,
              onUpdate: (self) => applyRotateText(self.progress),
            },
          });

          if (words.length) {
            const block = 0.15;
            const staggerAmount = Math.min(0.2, block * 0.6);
            const wordDur = block - staggerAmount;
            tl.fromTo(
              words,
              { opacity: 0 },
              {
                opacity: 1,
                duration: wordDur,
                stagger: { amount: staggerAmount, from: "start", ease: "none" },
              },
              0
            );
          } else if (head) {
            tl.fromTo(head, { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0);
          }

          if (headWrap) {
            tl.fromTo(headWrap, { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.15);
          }

          if (imgListWrap) {
            tl.fromTo(imgListWrap, { opacity: 0 }, { opacity: 1, duration: 0.10 }, 0.20);
          }

          if (imgList) {
            tl.fromTo(
              imgList,
              { x: 0 },
              {
                x: imgListSlideX,
                duration: 0.70,
              },
              0.30
            );
          }
        }
      }
    }
  
    // ---------------------------------------------------------------------------
    // 2) .s_hb_bs → .hb_bs_img-circ + .hb_bs_name + wrap hide → spot scale → unmask
    //    start: top / top | end: bottom / bottom | scrub: 0.8s
    //    0–50%:   circle expand
    //    50–70%:  name fade + img-inner scale
    //    70–86%:  wrap hide (overview stays visible underneath)
    //    82–100%: grow --spot-radius (longer scrub)
    //    100–130%: overview-thanks-bg scale + fade
    //    106–125%: overview-thanks-text split-word fade (overlaps bg)
    // ---------------------------------------------------------------------------
    {
      const WRAP_HIDE_START = 0.7;
      const WRAP_HIDE_DUR = 0.12; // → 0.82
      const CIRCLE_EXPAND_DUR = 0.5; // circle full screen at 0.5
      const SPOT_SCALE_START = 0.82;
      const SPOT_SCALE_DUR = 0.18; // → 1.0 (longer radius grow)
      const SPOT_SCALE_END = SPOT_SCALE_START + SPOT_SCALE_DUR;
      const THANKS_BG_START = SPOT_SCALE_END; // 1.0
      const THANKS_BG_DUR = 0.3; // → 1.3
      const THANKS_TEXT_START = 1.06;
      const THANKS_TEXT_DUR = 0.19; // → 1.25
      const REVEAL_AT = 1.3;
  
      const SPOT_RADIUS_START = 190;
      const SPOT_FEATHER_START = 135;
  
      function overviewRoot() {
        return (
          document.querySelector(".overview-embed[data-overview]") ||
          document.querySelector(".overview-embed")
        );
      }
  
      function findThanksEls(trigger, root) {
        const pick = (sel) =>
          (trigger && trigger.querySelector(sel)) ||
          (root && root.querySelector(sel)) ||
          (trigger && trigger.parentElement?.querySelector(sel)) ||
          (trigger && trigger.closest("section")?.querySelector(sel)) ||
          (trigger && trigger.closest(".s_hb_bs")?.parentElement?.querySelector(sel)) ||
          document.querySelector(sel);
  
        const bg = pick(".overview-thanks-bg");
        const text = pick(".overview-thanks-text");
        const wrapper =
          pick(".overview-thanks") ||
          pick(".overview__thanks") ||
          bg?.closest(".overview-thanks") ||
          text?.closest(".overview-thanks") ||
          null;
  
        return { wrapper, bg, text };
      }
  
      function overviewEls(trigger) {
        const root = overviewRoot();
        const thanks = findThanksEls(trigger, root);
        if (!root) {
          return {
            root: null,
            spot: null,
            content: null,
            ...thanks,
            thanksWords: thanks.text ? splitWords(thanks.text, "overview_thanks_word") : [],
          };
        }
        const thanksWords = thanks.text
          ? splitWords(thanks.text, "overview_thanks_word")
          : [];
        return {
          root,
          spot: root.querySelector(".overview__spot"),
          content: root.querySelector(".overview__content"),
          ...thanks,
          thanksWords,
        };
      }
  
      /**
       * idle     — hover spotlight owns opacity/mask
       * hiding   — wrap fading; overview stays masked; hover STILL active
       * scaling  — root --spot-radius grows to cover viewport; hover off
       * thanks     — bg then text (after radius done); hover off
       * revealed   — end state locked; hover off
       */
      function setOverviewPhase(phase) {
        const root = overviewRoot();
        if (!root) return;
        const lockHover =
          phase === "scaling" || phase === "thanks" || phase === "revealed";
        root.classList.toggle("is-revealing", phase === "scaling");
        root.classList.toggle("is-thanks", phase === "thanks");
        root.classList.toggle("is-revealed", phase === "revealed");
        root.classList.toggle("is-full", phase === "revealed");
        root.classList.remove("is-waiting");
        if (lockHover) root.classList.remove("is-spot-active");
      }
  
      function resetSpotVars(root) {
        if (!root) return;
        root.style.setProperty("--spot-radius", `${SPOT_RADIUS_START}px`);
        root.style.setProperty("--spot-feather", `${SPOT_FEATHER_START}px`);
      }
  
      function clearSpotLocalVars(spot) {
        if (!spot) return;
        spot.style.removeProperty("--spot-radius");
        spot.style.removeProperty("--spot-feather");
      }
  
      /** Diagonal of viewport + margin — always larger than fixed 2000px on big screens. */
      function spotCoverRadiusPx() {
        return Math.max(2000, Math.hypot(window.innerWidth, window.innerHeight) * 1.15);
      }
  
      /**
       * Scrubbed mask open: grow root --spot-radius only (thanks comes later).
       */
      function applyMaskProgress(root, spot, content, t) {
        if (!root) return;
        const cover = spotCoverRadiusPx();
        const r = SPOT_RADIUS_START + (cover - SPOT_RADIUS_START) * t;
        const f = SPOT_FEATHER_START + (cover * 0.28 - SPOT_FEATHER_START) * t;
        root.style.setProperty("--spot-radius", `${r}px`);
        root.style.setProperty("--spot-feather", `${f}px`);
        clearSpotLocalVars(spot);
  
        if (content) gsap.set(content, { opacity: 1 });
  
        if (spot) {
          gsap.set(spot, {
            opacity: Math.max(0, 1 - t),
            pointerEvents: "none",
          });
        }
      }
  
      function resetThanksEls(bg, text, thanksWords, wrapper) {
        if (wrapper) gsap.set(wrapper, { clearProps: "opacity,visibility" });
        if (bg) gsap.set(bg, { clearProps: "opacity,scale,visibility" });
        if (thanksWords.length) gsap.set(thanksWords, { clearProps: "opacity" });
        else if (text) gsap.set(text, { clearProps: "opacity,visibility" });
      }
  
      function initThanksEls(bg, text, thanksWords, wrapper) {
        if (wrapper) gsap.set(wrapper, { visibility: "visible" });
        if (bg) gsap.set(bg, { opacity: 0, scale: 0.88 });
        if (thanksWords.length) gsap.set(thanksWords, { opacity: 0 });
        else if (text) gsap.set(text, { opacity: 0 });
      }
  
      function applyThanksEndState(bg, text, thanksWords, wrapper) {
        if (wrapper) gsap.set(wrapper, { visibility: "visible" });
        if (bg) gsap.set(bg, { opacity: 1, scale: 1 });
        if (thanksWords.length) gsap.set(thanksWords, { opacity: 1 });
        else if (text) gsap.set(text, { opacity: 1 });
      }
  
      /** Hand control back to CSS hover (only when fully below wrap hide). */
      function restoreOverviewInline(root, spot, content, bg, text, thanksWords, wrapper) {
        if (spot) {
          gsap.set(spot, { clearProps: "opacity,pointerEvents" });
          clearSpotLocalVars(spot);
        }
        if (content) gsap.set(content, { clearProps: "opacity" });
        if (root) resetSpotVars(root);
        resetThanksEls(bg, text, thanksWords, wrapper);
      }
  
      /** Lock end state once thanks sequence completes. */
      function applyRevealSync(root, spot, content, bg, text, thanksWords, wrapper) {
        applyMaskProgress(root, spot, content, 1);
        applyThanksEndState(bg, text, thanksWords, wrapper);
        setOverviewPhase("revealed");
      }
  
      function applyOverviewEndState(root, spot, content, bg, text, thanksWords, wrapper) {
        applyRevealSync(root, spot, content, bg, text, thanksWords, wrapper);
      }
  
      function syncOverviewPhase(next) {
        if (next === "scaling") setOverviewPhase("scaling");
        else if (next === "thanks") setOverviewPhase("thanks");
        else if (next === "revealed") setOverviewPhase("revealed");
        else setOverviewPhase("idle");
      }
  
      function initHbBs() {
        const trigger = document.querySelector(".s_hb_bs");
        const circ =
          trigger?.querySelector(".hb_bs_img-circ") ||
          document.querySelector(".hb_bs_img-circ");
        const name =
          trigger?.querySelector(".hb_bs_name") ||
          document.querySelector(".hb_bs_name");
        const imgWrap =
          trigger?.querySelector(".hb_bs_img-wrap") ||
          document.querySelector(".hb_bs_img-wrap");
        const imgInner =
          trigger?.querySelector(".hb_bs_img-inner") ||
          document.querySelector(".hb_bs_img-inner");
        const stars =
          trigger?.querySelector(".hb_h_stars") ||
          trigger?.querySelector(".hb_bs_stars") ||
          document.querySelector(".hb_h_stars");
        let { root, spot, content, bg, text, thanksWords, wrapper } = overviewEls(trigger);
  
        if (!trigger) {
          console.warn("[main] Missing .s_hb_bs");
          return;
        }
        if (!circ) {
          console.warn("[main] Missing .hb_bs_img-circ");
          return;
        }
        if (!root) {
          console.warn("[main] Missing .overview-embed — reveal/mask will no-op");
        }
        if (!bg && !text && !initHbBs._warnedThanks) {
          initHbBs._warnedThanks = true;
          console.warn(
            "[main] Missing .overview-thanks-bg / .overview-thanks-text"
          );
        }
  
        if (name) gsap.set(name, { opacity: 0 });
        if (imgWrap) gsap.set(imgWrap, { opacity: 1 });
        if (imgInner) gsap.set(imgInner, { scale: 1 });
        setOverviewPhase("idle");
        resetSpotVars(root);
        restoreOverviewInline(root, spot, content, bg, text, thanksWords, wrapper);
        initThanksEls(bg, text, thanksWords, wrapper);
  
        let phase = "idle";
        const spotScale = { t: 0 };
  
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate(self) {
              if (!root || !content) {
                ({ root, spot, content, bg, text, thanksWords, wrapper } =
                  overviewEls(trigger));
              }
  
              const p = self.animation ? self.animation.progress() : self.progress;
  
              // Timeline owns thanks/bg/text scrub — only sync mask + phase classes here.
              if (p >= SPOT_SCALE_START) {
                applyMaskProgress(root, spot, content, Math.min(1, spotScale.t));
              }
  
              let next = "idle";
              if (p >= REVEAL_AT - 1e-4) next = "revealed";
              else if (p >= THANKS_BG_START) next = "thanks";
              else if (p >= SPOT_SCALE_START) next = "scaling";
              else if (p >= WRAP_HIDE_START) next = "hiding";
  
              if (next === phase) return;
  
              const prev = phase;
              phase = next;
              syncOverviewPhase(next);
  
              // Hard reset only when scrolling back out of the overview sequence.
              if (
                (prev === "scaling" || prev === "thanks" || prev === "revealed") &&
                (next === "idle" || next === "hiding")
              ) {
                restoreOverviewInline(
                  root,
                  spot,
                  content,
                  bg,
                  text,
                  thanksWords,
                  wrapper
                );
                initThanksEls(bg, text, thanksWords, wrapper);
              }
  
              // First entry into scaling (after wrap hide) — hide thanks, prep mask.
              if (next === "scaling" && (prev === "idle" || prev === "hiding")) {
                if (content) gsap.set(content, { opacity: 1 });
                initThanksEls(bg, text, thanksWords, wrapper);
                if (spot) gsap.set(spot, { opacity: 1, pointerEvents: "none" });
              }
            },
          },
        });
  
        tl.fromTo(
          circ,
          {
            width: 150,
            height: 150,
            borderRadius: "500px",
          },
          {
            width: "100vw",
            height: "100vh",
            borderRadius: "0px",
            duration: CIRCLE_EXPAND_DUR,
          },
          0
        );

        // Scrubbed stars hide as circle finishes expanding (avoids hard autoAlpha pop).
        if (stars) {
          gsap.set(stars, { visibility: "visible" });
          tl.fromTo(
            stars,
            { opacity: 1 },
            { opacity: 0, duration: 0.12 },
            CIRCLE_EXPAND_DUR - 0.06
          );
        }
  
        if (name) {
          tl.fromTo(name, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.5);
        }
  
        if (imgInner) {
          tl.fromTo(imgInner, { scale: 1 }, { scale: 1.1, duration: 0.2 }, 0.5);
        }
  
        if (imgWrap) {
          tl.fromTo(
            imgWrap,
            { opacity: 1 },
            { opacity: 0, duration: WRAP_HIDE_DUR },
            WRAP_HIDE_START
          );
        }
  
        // Grow root --spot-radius — scrubbed mask open (thanks only after this).
        if (root) {
          tl.fromTo(
            spotScale,
            { t: 0 },
            {
              t: 1,
              duration: SPOT_SCALE_DUR,
              immediateRender: false,
              onUpdate: () => applyMaskProgress(root, spot, content, spotScale.t),
            },
            SPOT_SCALE_START
          );
        }
  
        // Thanks bg: scale + fade (after radius fully open).
        if (bg) {
          tl.fromTo(
            bg,
            { opacity: 0, scale: 0.88 },
            {
              opacity: 1,
              scale: 1,
              duration: THANKS_BG_DUR,
              immediateRender: false,
            },
            THANKS_BG_START
          );
        }
  
        // Body bg → #121212 once circle is fully scaled (separate ST; does not alter tl).
        ScrollTrigger.create({
          trigger,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8, // match main bs scrub so updates track the visual
          onUpdate() {
            // tl.time() uses the same units as CIRCLE_EXPAND_DUR / stars hide.
            if (tl.time() >= CIRCLE_EXPAND_DUR) {
              document.body.style.backgroundColor = "#121212";
            } else {
              document.body.style.backgroundColor = "";
            }
          },
        });
  
        // Thanks text: split-word stagger fade.
        if (thanksWords.length) {
          const staggerAmount = Math.min(0.045, THANKS_TEXT_DUR * 0.55);
          const wordDur = THANKS_TEXT_DUR - staggerAmount;
          tl.fromTo(
            thanksWords,
            { opacity: 0 },
            {
              opacity: 1,
              duration: wordDur,
              stagger: { amount: staggerAmount, from: "start", ease: "none" },
              immediateRender: false,
            },
            THANKS_TEXT_START
          );
        } else if (text) {
          tl.fromTo(
            text,
            { opacity: 0 },
            {
              opacity: 1,
              duration: THANKS_TEXT_DUR,
              immediateRender: false,
            },
            THANKS_TEXT_START
          );
        }
      }
  
      // Defer so overview embed can build .overview__spot / .overview__content first.
      const startHbBs = () => {
        // Two frames: microtask alone can still race the overview IIFE build.
        requestAnimationFrame(() => {
          requestAnimationFrame(initHbBs);
        });
      };
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startHbBs, { once: true });
      } else {
        startHbBs();
      }
    }
  })();
  /**
   * Overview spotlight — Webflow embed (names marquee + soft dark cursor spot)
   * No background image: set the photo on the Webflow Section behind this embed.
   */
  (() => {
    const ROOT_SEL = ".overview-embed[data-overview]";
  
    const NAME_ROWS = [
      {
        size: "sm",
        names: [
          "Francesca Saccani, BFA",
          "Mahesh Pokhrel, MEng",
          "Jon Clark, MBA",
          "Mohamed Mahmoud, MPH",
          "Deniz Isimtekin, MA",
          "Evan Price, MBA",
          "Gonzalo Alvarado",
          "Mihael Galperin",
          "Joan Cortés",
          "Nishant Dubey, BBA",
        ],
      },
      {
        size: "md",
        names: [
          "Hemal Kanji",
          "Habib Habib, BA",
          "Stacy Parrish Whitehead",
          "Sebastián Valenzuela, BEng",
          "Wael Joudeh, BFA",
          "Mohd abu Jubbeh, MBA",
          "Prajjwal Biswas, MSc",
          "Vanshika Gupta, BA",
          "Vutomi Hlabangwani, BA",
        ],
      },
      {
        size: "lg",
        names: [
          "Eudes Benítez",
          "Ezequiel Alarcon",
          "Alan Davis",
          "Mark Esposito, PhD",
          "Yohaan D'Monte",
          "Onyekachi Ndugbu",
          "Felix Sereti",
          "Wycliffe Magani, MBA",
          "Ariana Cueva",
          "Bruno Wafula, MS",
        ],
      },
      {
        size: "lg",
        names: [
          "Charles Osei-Kuffour",
          "Malefa Moloi",
          "Delyan Georgiev",
          "Liz Mboya",
          "Dávid György",
          "Alina de Groot, MA",
          "Evan Price, MBA",
          "Dan Heffernan, BA",
          "Alex Hill-Knight, BMus",
          "Gabriel Ott, MD",
        ],
      },
      {
        size: "md",
        names: [
          "Bernard Viloria, BSc",
          "Pablo Orellana, BBA",
          "Adam Finkelstein, BA",
          "Sohyun Park, MA",
          "Rahul Varandani, MBA",
          "Alexis Komarov, MS",
          "Shrey Gosalia, MBA",
          "Annika Bryant, BA",
          "Muminat Adekunle, MBA",
        ],
      },
      {
        size: "md",
        names: [
          "Stephen Annor",
          "Luz Entivero",
          "David Angeles, MBA",
          "Sanjaya Weerasekara",
          "Evan Price, MBA",
          "Karamage Obes, BE",
          "Nikola Djordjevic, ME",
          "David Osho, BS",
          "Rebekkah Smith, BMus",
          "Arooba Ghani, BS",
        ],
      },
    ];
  
    const BLOCK_COUNT = 3;
    const SCRAMBLE_CHARS =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const PRESERVE_RE = /[ ,.'’]/;
  
    function shuffle(indices) {
      const order = indices.slice();
      for (let i = order.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = order[i];
        order[i] = order[j];
        order[j] = tmp;
      }
      return order;
    }
  
    function randomChar() {
      return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    }
  
    function scrambleText(el) {
      const original = el.dataset.text || el.textContent;
      const live = el.querySelector(".overview__name-live");
      if (!live) return;
  
      if (el._scrambleFrame) cancelAnimationFrame(el._scrambleFrame);
  
      el.classList.add("is-scrambling");
  
      const length = original.length;
      const display = original.split("");
      const scrambleIndices = [];
      for (let i = 0; i < length; i += 1) {
        if (!PRESERVE_RE.test(original[i])) scrambleIndices.push(i);
      }
  
      const order = shuffle(scrambleIndices);
      let frame = 0;
      const totalFrames = Math.max(16, Math.floor(order.length * 1.25));
      const windowSize = Math.min(3, order.length);
  
      for (let i = 0; i < windowSize; i += 1) {
        display[order[i]] = randomChar();
      }
      live.textContent = display.join("");
  
      const tick = () => {
        frame += 1;
        if (frame % 3 !== 0 && frame < totalFrames) {
          el._scrambleFrame = requestAnimationFrame(tick);
          return;
        }
  
        const progress = frame / totalFrames;
        const revealCount = Math.floor(progress * order.length);
  
        for (let i = 0; i < order.length; i += 1) {
          const idx = order[i];
          if (i < revealCount) {
            display[idx] = original[idx];
          } else if (i < revealCount + windowSize) {
            if (display[idx] === original[idx] || Math.random() < 0.45) {
              display[idx] = randomChar();
            }
          } else {
            display[idx] = original[idx];
          }
        }
  
        live.textContent = display.join("");
  
        if (frame < totalFrames) {
          el._scrambleFrame = requestAnimationFrame(tick);
        } else {
          live.textContent = original;
          el.classList.remove("is-scrambling");
          el._scrambleFrame = null;
        }
      };
  
      el._scrambleFrame = requestAnimationFrame(tick);
    }
  
    function restoreText(el) {
      if (el._scrambleFrame) {
        cancelAnimationFrame(el._scrambleFrame);
        el._scrambleFrame = null;
      }
      el.classList.remove("is-scrambling");
      const live = el.querySelector(".overview__name-live");
      if (live) live.textContent = el.dataset.text || live.textContent;
    }
  
    function createNameButton(text) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "overview__name";
      button.dataset.text = text;
      button.setAttribute("aria-label", text);
  
      const sizer = document.createElement("span");
      sizer.className = "overview__name-sizer";
      sizer.textContent = text;
      sizer.setAttribute("aria-hidden", "true");
  
      const live = document.createElement("span");
      live.className = "overview__name-live";
      live.textContent = text;
  
      button.append(sizer, live);
      button.addEventListener("pointerenter", () => scrambleText(button));
      button.addEventListener("pointerleave", () => restoreText(button));
      button.addEventListener("focus", () => scrambleText(button));
      button.addEventListener("blur", () => restoreText(button));
      return button;
    }
  
    function createNameGroup(names) {
      const group = document.createElement("div");
      group.className = "overview__group";
      group.setAttribute("aria-hidden", "true");
  
      names.forEach((name) => {
        group.appendChild(createNameButton(name));
        const sep = document.createElement("span");
        sep.className = "overview__sep";
        sep.setAttribute("aria-hidden", "true");
        group.appendChild(sep);
      });
  
      return group;
    }
  
    function createRow(row) {
      const rowEl = document.createElement("div");
      rowEl.className = "overview__row";
      rowEl.dataset.size = row.size;
  
      const track = document.createElement("div");
      track.className = "overview__track";
      track.appendChild(createNameGroup(row.names));
      track.appendChild(createNameGroup(row.names));
      rowEl.appendChild(track);
      return rowEl;
    }
  
    function createBlock() {
      const block = document.createElement("div");
      block.className = "overview__block";
      NAME_ROWS.forEach((row) => block.appendChild(createRow(row)));
      return block;
    }
  
    function ensureSpot(root) {
      let spot = root.querySelector(".overview__spot");
      if (!spot) {
        spot = document.createElement("div");
        spot.className = "overview__spot";
        spot.setAttribute("aria-hidden", "true");
        root.prepend(spot);
      }
      return spot;
    }
  
    function ensureContentMask(content) {
      let mask = content.querySelector(":scope > .overview__content-mask");
      if (mask) return mask;
  
      mask = document.createElement("div");
      mask.className = "overview__content-mask";
      while (content.firstChild) {
        mask.appendChild(content.firstChild);
      }
      content.appendChild(mask);
      return mask;
    }
  
    function buildNames(root) {
      let content = root.querySelector(".overview__content");
      if (!content) {
        content = document.createElement("div");
        content.className = "overview__content";
        root.appendChild(content);
      }
  
      const mask = ensureContentMask(content);
      if (mask.querySelector(".overview__block")) return;
  
      for (let i = 0; i < BLOCK_COUNT; i += 1) {
        mask.appendChild(createBlock());
      }
    }
  
    function initSpotlight(root) {
      const COARSE = window.matchMedia("(pointer: coarse)").matches;
      if (COARSE) {
        root.classList.add("is-spot-active");
        return;
      }
  
      let raf = 0;
      let nextX = 0;
      let nextY = 0;
  
      /** Hover spotlight until spot scale / revealed owns the stage. */
      const spotLocked = () =>
        root.classList.contains("is-revealed") ||
        root.classList.contains("is-revealing") ||
        root.classList.contains("is-thanks");
  
      const applySpot = () => {
        raf = 0;
        if (spotLocked()) return;
        const rect = root.getBoundingClientRect();
        root.style.setProperty("--spot-x", `${nextX - rect.left}px`);
        root.style.setProperty("--spot-y", `${nextY - rect.top}px`);
      };
  
      const setSpot = (clientX, clientY) => {
        if (spotLocked()) return;
        nextX = clientX;
        nextY = clientY;
        if (!raf) raf = requestAnimationFrame(applySpot);
      };
  
      root.addEventListener("pointerenter", (event) => {
        if (spotLocked()) return;
        root.classList.add("is-spot-active");
        setSpot(event.clientX, event.clientY);
      });
  
      root.addEventListener("pointermove", (event) => {
        if (spotLocked()) return;
        root.classList.add("is-spot-active");
        setSpot(event.clientX, event.clientY);
      });
  
      root.addEventListener("pointerleave", () => {
        if (spotLocked()) return;
        root.classList.remove("is-spot-active");
      });
    }
  
    function init() {
      const root = document.querySelector(ROOT_SEL);
      if (!root) return;
      ensureSpot(root);
      buildNames(root);
      initSpotlight(root);
    }
  
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
      init();
    }
  })();
  
  