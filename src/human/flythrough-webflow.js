/* Fly-through star field for Webflow human page (.s_hb_b.is-flythrough).
   Points are sampled from the first billboard card image; scroll drives travel
   until the section pins, then they lock into the photo and morph to the card. */

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (t) => t * t * (3 - 2 * t);

const FOCAL = 620;
const DEPTH = 2600;
const LEAD = () => window.innerHeight * 2.6;

if (!gsap || !ScrollTrigger) {
  console.warn("[flythrough] Load GSAP + ScrollTrigger before flythrough-webflow.js");
} else {
  gsap.registerPlugin(ScrollTrigger);
  if (!reduced) start();
}

function ensureCanvas() {
  let canvas = document.querySelector(".hb_flythrough-canvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.className = "hb_flythrough-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);
  }
  return canvas;
}

function ensurePlate(sticky, src) {
  let plate = sticky.querySelector(".hb_b_reveal-plate");
  if (!plate) {
    plate = document.createElement("img");
    plate.className = "hb_b_reveal-plate";
    plate.alt = "";
    plate.setAttribute("aria-hidden", "true");
    sticky.insertBefore(plate, sticky.firstChild);
  }
  if (src) plate.src = src;
  return plate;
}

function resolveTargetImage(scene) {
  const plate = scene.querySelector(".hb_b_reveal-plate");
  const fromPlate = plate?.getAttribute("src") || plate?.src;
  if (fromPlate) return fromPlate;

  const firstImg = scene.querySelector(
    ".hb_b_img-item:first-child .hb_b_img.is-main"
  );
  return firstImg?.currentSrc || firstImg?.src || "";
}

function start() {
  const scene = document.querySelector(".s_hb_b.is-flythrough");
  if (!scene) return;

  const canvas = ensureCanvas();
  const sticky = scene.querySelector(".hb_b_main");
  const firstCard = scene.querySelector(".hb_b_img-item:first-child");
  const firstCardImg = firstCard?.querySelector(".hb_b_img.is-main");
  const targetUrl = resolveTargetImage(scene);

  if (!sticky || !firstCard || !targetUrl) {
    console.warn("[flythrough] Missing .hb_b_main, first card, or target image URL");
    return;
  }

  const plate = ensurePlate(sticky, targetUrl);
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let W = 0;
  let H = 0;
  let pts = [];
  let img = null;
  let home = null;
  const state = { travel: 0, lock: 0, fade: 1 };

  const size = () => {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  function build() {
    size();
    if (!img) return;

    const ar = img.naturalWidth / img.naturalHeight;
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

    const step = 3;
    const cols = Math.max(1, Math.floor(bw / step));
    const rows = Math.max(1, Math.floor(bh / step));
    const off = document.createElement("canvas");
    off.width = cols;
    off.height = rows;
    const o = off.getContext("2d", { willReadFrequently: true });
    o.drawImage(img, 0, 0, cols, rows);
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
          z: Math.random() * DEPTH,
          sx: (Math.random() - 0.5) * 2.2,
          sy: (Math.random() - 0.5) * 2.2,
        });
      }
    }
  }

  const image = new Image();
  image.crossOrigin = "anonymous";
  image.onload = () => {
    img = image;
    build();
    ScrollTrigger.refresh();
  };
  image.onerror = () => {
    console.error("[flythrough] Failed to load target image:", targetUrl);
  };
  image.src = targetUrl;

  addEventListener("resize", build);
  size();

  const travelRoot =
    document.querySelector(".page-wrapper") || document.documentElement;

  ScrollTrigger.create({
    trigger: travelRoot,
    start: "top top",
    endTrigger: scene,
    end: "top top",
    scrub: 0.8,
    onUpdate: (self) => {
      state.travel = self.progress;
    },
  });

  const hb = window.__hb_b;
  if (hb?.stripTween?.scrollTrigger) {
    hb.stripTween.scrollTrigger.kill();
    ScrollTrigger.create({
      animation: hb.stripTween,
      trigger: scene,
      start: () => scene.offsetTop + LEAD(),
      end: "bottom bottom",
      scrub: 0.8,
      invalidateOnRefresh: true,
      onUpdate: (self) => hb.applyRotateText?.(self.progress),
    });
  }

  gsap.fromTo(
    [scene.querySelector(".hb_b_text"), scene.querySelector(".hb_b_img-list-wrap")].filter(
      Boolean
    ),
    { autoAlpha: 0 },
    {
      autoAlpha: 1,
      ease: "none",
      scrollTrigger: {
        trigger: scene,
        start: () => scene.offsetTop + LEAD() * 0.72,
        end: () => scene.offsetTop + LEAD(),
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    }
  );

  ScrollTrigger.create({
    trigger: scene,
    start: "top top",
    end: () => scene.offsetTop + LEAD(),
    scrub: 0.6,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const p = self.progress;
      state.lock = smooth(clamp(p / 0.52));
      state.fade = 1 - clamp((p - 0.54) / 0.14);

      if (!home) return;

      const c = firstCard.getBoundingClientRect();
      const s = sticky.getBoundingClientRect();
      const to = c.width
        ? { x: c.left - s.left, y: c.top - s.top, w: c.width, h: c.height }
        : home;
      const t = smooth(clamp((p - 0.58) / 0.34));

      plate.style.left = `${home.x + (to.x - home.x) * t}px`;
      plate.style.top = `${home.y + (to.y - home.y) * t}px`;
      plate.style.width = `${home.w + (to.w - home.w) * t}px`;
      plate.style.height = `${home.h + (to.h - home.h) * t}px`;
      plate.style.opacity = String(
        clamp((p - 0.4) / 0.12) * (1 - clamp((p - 0.94) / 0.06))
      );

      if (firstCardImg) {
        firstCardImg.style.opacity = p >= 0.94 ? "1" : "0";
      }
    },
  });

  ScrollTrigger.create({
    trigger: scene,
    start: () => scene.offsetTop + LEAD(),
    onToggle: (self) => {
      if (self.isActive) {
        state.fade = 0;
        plate.style.opacity = "0";
        if (firstCardImg) firstCardImg.style.opacity = "1";
      }
    },
  });

  gsap.ticker.add(() => {
    if (!pts.length) return;
    ctx.clearRect(0, 0, W, H);
    if (state.fade <= 0.01) return;

    const cz = state.travel * DEPTH * 3.2;
    const lock = state.lock;
    const spread = 1 - lock;

    for (let i = 0; i < pts.length; i++) {
      const pt = pts[i];
      let z = pt.z - cz;
      z = ((z % DEPTH) + DEPTH) % DEPTH;
      z = Math.max(24, z + (FOCAL - z) * lock);
      const k = FOCAL / z;
      const x = W / 2 + (pt.x + pt.x * pt.sx * spread) * k;
      const y = H / 2 + (pt.y + pt.y * pt.sy * spread) * k;
      if (x < -40 || x > W + 40 || y < -40 || y > H + 40) continue;
      const near = clamp(1 - z / DEPTH);
      const a = (0.06 + pt.l * 0.8) * (0.22 + near * 0.78) * state.fade;
      if (a <= 0.012) continue;
      const sz = 0.85 + near * 1.15;
      ctx.fillStyle = `rgba(${182 + pt.l * 58},${190 + pt.l * 52},255,${a})`;
      ctx.fillRect(x, y, sz, sz);
    }
  });
}
