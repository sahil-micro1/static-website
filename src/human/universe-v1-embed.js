import * as THREE from "three";

/**
 * Universe v1 embed — photographic marquee starfield for Webflow.
 * Needs a hosted universe.jpg (set data-image to absolute https URL).
 */

const container =
  document.querySelector(".universe-v1-embed:not([data-v1-init])") ||
  document.querySelector(".universe-v1-embed") ||
  document.querySelector(".universe-embed:not([data-v1-init])");

if (!container) {
  console.error("[universe-v1-embed] Missing .universe-v1-embed container");
  throw new Error("[universe-v1-embed] Missing container");
}

// Script can load twice in Webflow (Designer + publish, or duplicate embeds)
if (container.dataset.v1Init === "1") {
  console.warn("[universe-v1-embed] Already initialized — skipping duplicate load");
  throw new Error("[universe-v1-embed] Already initialized");
}
container.dataset.v1Init = "1";

/**
 * Always use a fresh canvas. Webflow / other scripts may have already called
 * getContext('2d') on a markup <canvas>, which blocks WebGL forever.
 */
function ensureWebGLCanvas(host) {
  host.querySelectorAll("canvas").forEach((el) => el.remove());
  const el = document.createElement("canvas");
  el.className = "universe-v1-canvas";
  el.setAttribute("aria-hidden", "true");
  host.appendChild(el);
  return el;
}

const canvas = ensureWebGLCanvas(container);

function hostSize() {
  const w = container.clientWidth || window.innerWidth;
  const h = container.clientHeight || window.innerHeight;
  return { width: Math.max(1, w), height: Math.max(1, h) };
}

/** Image URL: prefer absolute https URL (required on Webflow). */
function resolveImageUrl() {
  const raw = (container.getAttribute("data-image") || "").trim();

  // Absolute URL — always use this on Webflow (Assets / Netlify CDN link)
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  // Relative / missing — resolve next to this JS module (local preview only)
  const rel = raw && !raw.startsWith("#") ? raw : "./universe.jpg";
  try {
    const resolved = new URL(rel, import.meta.url).href;
    if (raw && !/^https?:\/\//i.test(raw)) {
      console.warn(
        "[universe-v1-embed] data-image should be a full https:// CDN URL in Webflow. " +
          "Relative paths break because Webflow Assets use hashed filenames. Using:",
        resolved
      );
    }
    return resolved;
  } catch {
    return "universe.jpg";
  }
}

const IMAGE_URL = resolveImageUrl();
console.info("[universe-v1-embed] loading image:", IMAGE_URL);

/** Deterministic RNG so stars don't reshuffle every page load. */
function mulberry32(seed) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const rand = mulberry32(hashString(IMAGE_URL + "|v1"));

let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
} catch (err) {
  console.error("[universe-v1-embed] WebGL init failed:", err);
  container.innerHTML =
    "<div style='color:#ccc;padding:2rem;font:14px system-ui'>WebGL failed to start. Remove duplicate embeds and republish.</div>";
  throw err;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
{
  const { width, height } = hostSize();
  renderer.setSize(width, height, false);
}
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.92;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const _init = hostSize();
const camera = new THREE.PerspectiveCamera(
  42,
  _init.width / _init.height,
  0.1,
  2000
);
camera.position.set(0, 0, 40);

const clock = new THREE.Clock();
const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const SCROLL_X = reduceMotion ? 0.004 : 0.008;
const SCROLL_Y = reduceMotion ? 0.0008 : 0.0016;

function createPointSprite(core = 1) {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  if (core > 0.7) {
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.08, "rgba(255,255,255,0.95)");
    g.addColorStop(0.2, "rgba(220,230,255,0.35)");
    g.addColorStop(0.45, "rgba(160,180,255,0.08)");
    g.addColorStop(1, "rgba(0,0,0,0)");
  } else {
    g.addColorStop(0, "rgba(255,255,255,0.95)");
    g.addColorStop(0.12, "rgba(240,245,255,0.55)");
    g.addColorStop(0.35, "rgba(180,200,255,0.08)");
    g.addColorStop(1, "rgba(0,0,0,0)");
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const softSprite = createPointSprite(0.4);
const brightSprite = createPointSprite(1);

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`[universe-v1-embed] Failed to load ${url}`));
    img.src = url;
  });
}

function extractStars(img, maxStars = 3200) {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const sample = document.createElement("canvas");
  const sw = Math.min(w, 900);
  const sh = Math.round((h / w) * sw);
  sample.width = sw;
  sample.height = sh;
  const ctx = sample.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, sw, sh);
  const { data } = ctx.getImageData(0, 0, sw, sh);

  const candidates = [];
  const step = 2;

  for (let y = 2; y < sh - 2; y += step) {
    for (let x = 2; x < sw - 2; x += step) {
      const i = (y * sw + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      if (lum < 42) continue;

      let isPeak = true;
      for (let dy = -1; dy <= 1 && isPeak; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const j = ((y + dy) * sw + (x + dx)) * 4;
          const nl =
            0.2126 * data[j] + 0.7152 * data[j + 1] + 0.0722 * data[j + 2];
          if (nl > lum) {
            isPeak = false;
            break;
          }
        }
      }
      if (!isPeak) continue;

      candidates.push({
        u: x / sw,
        v: 1 - y / sh,
        lum,
        r: r / 255,
        g: g / 255,
        b: b / 255,
      });
    }
  }

  candidates.sort((a, b) => b.lum - a.lum);
  return candidates.slice(0, maxStars);
}

function makeStarField(
  stars,
  planeW,
  planeH,
  depthNear,
  depthFar,
  sprite,
  sizeScale,
  tileCopies = 2
) {
  const perTile = stars.length;
  const n = perTile * tileCopies;
  const positions = new Float32Array(n * 3);
  const colors = new Float32Array(n * 3);
  const sizes = new Float32Array(n);
  const phases = new Float32Array(n);
  const speeds = new Float32Array(n);
  const baseX = new Float32Array(n);
  const baseY = new Float32Array(n);

  for (let copy = 0; copy < tileCopies; copy++) {
    for (let i = 0; i < perTile; i++) {
      const s = stars[i];
      const idx = copy * perTile + i;
      const depthT = 1 - Math.pow(s.lum / 255, 0.55);
      const z = -(
        depthNear +
        depthT * (depthFar - depthNear) +
        (rand() - 0.5) * 8
      );

      const x = (s.u - 0.5 + copy) * planeW;
      const y = (s.v - 0.5) * planeH;

      baseX[idx] = x;
      baseY[idx] = y;
      positions[idx * 3] = x;
      positions[idx * 3 + 1] = y;
      positions[idx * 3 + 2] = z;

      const boost = 1.15;
      colors[idx * 3] = Math.min(1, s.r * boost);
      colors[idx * 3 + 1] = Math.min(1, s.g * boost);
      colors[idx * 3 + 2] = Math.min(1, s.b * boost);

      const mag = s.lum / 255;
      sizes[idx] = (0.35 + mag * mag * 2.8) * sizeScale;
      phases[idx] = rand() * Math.PI * 2;
      speeds[idx] =
        mag > 0.55 ? 0.4 + rand() * 1.1 : 0.05 + rand() * 0.2;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  geo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMap: { value: sprite },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uOpacity: { value: 1 },
    },
    vertexShader: /* glsl */ `
      attribute float aSize;
      attribute float aPhase;
      attribute float aSpeed;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uTime;
      uniform float uPixelRatio;

      void main() {
        vColor = color;
        float tw =
          0.82
          + 0.12 * sin(uTime * aSpeed + aPhase)
          + 0.06 * sin(uTime * aSpeed * 2.37 + aPhase * 1.7);
        vAlpha = clamp(tw, 0.55, 1.0);

        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float atten = 280.0 / max(0.001, -mv.z);
        gl_PointSize = aSize * uPixelRatio * atten * (0.9 + 0.1 * vAlpha);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform float uOpacity;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vec4 tex = texture2D(uMap, gl_PointCoord);
        float a = tex.a * vAlpha * uOpacity;
        if (a < 0.015) discard;
        gl_FragColor = vec4(vColor * tex.rgb, a);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geo, mat);
  points.userData.baseX = baseX;
  points.userData.baseY = baseY;
  points.userData.planeW = planeW;
  points.userData.planeH = planeH;
  points.userData.tileCopies = tileCopies;
  return points;
}

function scrollStarField(points, scrollX, scrollY) {
  if (!points) return;
  const { baseX, baseY, planeW, planeH, tileCopies } = points.userData;
  const pos = points.geometry.attributes.position;
  const spanX = planeW * tileCopies;
  const spanY = planeH;

  for (let i = 0; i < baseX.length; i++) {
    let x = baseX[i] - scrollX * planeW;
    let y = baseY[i] - scrollY * planeH;
    x = ((((x + spanX * 0.5) % spanX) + spanX) % spanX) - spanX * 0.5;
    y = ((((y + spanY * 0.5) % spanY) + spanY) % spanY) - spanY * 0.5;
    pos.setXYZ(i, x, y, pos.getZ(i));
  }
  pos.needsUpdate = true;
}

function makePhotoPlane(texture, width, height, z, opacity, blur = 0) {
  const geo = new THREE.PlaneGeometry(width, height);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: texture },
      uOpacity: { value: opacity },
      uBlur: { value: blur },
      uScroll: { value: new THREE.Vector2(0, 0) },
      uTiles: { value: new THREE.Vector2(2, 1) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform float uOpacity;
      uniform float uBlur;
      uniform vec2 uScroll;
      uniform vec2 uTiles;
      varying vec2 vUv;

      vec4 sampleWrapped(vec2 uv) {
        float fx = fract(uv.x);
        float fy = fract(uv.y);
        vec4 col = texture2D(uMap, vec2(fx, fy));
        float feather = 0.035;
        if (fx < feather) {
          float t = fx / feather;
          vec4 other = texture2D(uMap, vec2(1.0 - feather + fx, fy));
          col = mix(other, col, smoothstep(0.0, 1.0, t));
        } else if (fx > 1.0 - feather) {
          float t = (1.0 - fx) / feather;
          vec4 other = texture2D(uMap, vec2(fx - (1.0 - feather), fy));
          col = mix(other, col, smoothstep(0.0, 1.0, t));
        }
        return col;
      }

      void main() {
        vec2 uv = vUv * uTiles + uScroll;
        vec4 col = sampleWrapped(uv);
        float dim = mix(1.0, 0.92, uBlur);
        vec2 d = vUv - 0.5;
        float vig = 1.0 - dot(d, d) * 0.35;
        gl_FragColor = vec4(col.rgb * vig * dim, col.a * uOpacity);
      }
    `,
    transparent: true,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.z = z;
  return mesh;
}

const root = new THREE.Group();
scene.add(root);
const midLayer = new THREE.Group();
const nearLayer = new THREE.Group();
root.add(midLayer);
root.add(nearLayer);

let photoFar = null;
let photoMid = null;
let farStars = null;
let nearStars = null;
let scrollUV = new THREE.Vector2(0, 0);

async function build() {
  const img = await loadImage(IMAGE_URL);
  const aspect = img.naturalWidth / img.naturalHeight;

  const texture = new THREE.Texture(img);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  const planeH = 100;
  const planeW = planeH * aspect;
  const stripW = planeW * 2.05;

  photoFar = makePhotoPlane(texture, stripW, planeH * 1.12, -120, 0.95, 0);
  photoFar.material.uniforms.uTiles.value.set(2.05, 1.12);
  root.add(photoFar);

  photoMid = makePhotoPlane(texture, stripW * 0.98, planeH * 1.06, -70, 0.22, 1);
  photoMid.material.uniforms.uTiles.value.set(2.0, 1.06);
  midLayer.add(photoMid);

  const stars = extractStars(img, 3600);
  const bright = stars.filter((s) => s.lum > 90);
  const dimmer = stars.filter((s) => s.lum <= 90);

  farStars = makeStarField(
    dimmer.length ? dimmer : stars.slice(800),
    planeW,
    planeH,
    55,
    115,
    softSprite,
    0.85,
    2
  );
  farStars.material.uniforms.uOpacity.value = 0.55;
  midLayer.add(farStars);

  nearStars = makeStarField(
    bright.length ? bright : stars.slice(0, 600),
    planeW,
    planeH,
    18,
    58,
    brightSprite,
    1.15,
    2
  );
  nearStars.material.uniforms.uOpacity.value = 0.9;
  nearLayer.add(nearStars);
}

build().catch((err) => {
  console.error(err);
  if (container && container.style) {
    container.dataset.error = "image-load-failed";
  }
  const msg = document.createElement("div");
  msg.setAttribute("role", "alert");
  msg.style.cssText =
    "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;" +
    "padding:1.5rem;color:#ccc;font:14px/1.4 system-ui,sans-serif;text-align:center;background:#000";
  msg.textContent =
    "Starfield image failed to load. In Webflow, set data-image to the full https:// CDN URL of universe.jpg (Assets → file → copy URL).";
  (container && !container.matches?.("canvas") ? container : canvas.parentElement)?.appendChild(
    msg
  );
});

function onPointerMove(e) {
  const rect = container.getBoundingClientRect();
  pointer.tx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.ty = ((e.clientY - rect.top) / rect.height) * 2 - 1;
}

container.addEventListener("pointermove", onPointerMove);
container.addEventListener(
  "pointerleave",
  () => {
    pointer.tx = 0;
    pointer.ty = 0;
  },
  { passive: true }
);

function resize() {
  const { width, height } = hostSize();
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const pr = renderer.getPixelRatio();
  if (farStars) farStars.material.uniforms.uPixelRatio.value = pr;
  if (nearStars) nearStars.material.uniforms.uPixelRatio.value = pr;
}

window.addEventListener("resize", resize);
if (typeof ResizeObserver !== "undefined") {
  new ResizeObserver(resize).observe(container);
}

function animate() {
  requestAnimationFrame(animate);
  clock.getDelta();
  const t = clock.elapsedTime;

  pointer.x += (pointer.tx - pointer.x) * 0.035;
  pointer.y += (pointer.ty - pointer.y) * 0.035;
  const mx = pointer.x;
  const my = pointer.y;

  scrollUV.x = SCROLL_X * t;
  scrollUV.y = SCROLL_Y * t;

  if (photoFar) {
    photoFar.material.uniforms.uScroll.value.set(scrollUV.x, scrollUV.y * 0.6);
  }
  if (photoMid) {
    photoMid.material.uniforms.uScroll.value.set(
      scrollUV.x * 1.12,
      scrollUV.y * 0.75
    );
  }

  scrollStarField(farStars, scrollUV.x * 1.12, scrollUV.y * 0.75);
  scrollStarField(nearStars, scrollUV.x * 1.35, scrollUV.y * 0.9);

  if (photoFar) {
    photoFar.position.x = mx * -0.5;
    photoFar.position.y = my * 0.3;
  }
  midLayer.position.x = mx * -1.4;
  midLayer.position.y = my * 0.8;
  nearLayer.position.x = mx * -2.75;
  nearLayer.position.y = my * 1.6;

  camera.position.x = Math.sin(t * 0.07) * 0.25 + mx * 0.225;
  camera.position.y = Math.cos(t * 0.055) * 0.18 - my * 0.15;
  camera.lookAt(0, -my * 0.2, -80);

  if (farStars) farStars.material.uniforms.uTime.value = t;
  if (nearStars) nearStars.material.uniforms.uTime.value = t;

  renderer.render(scene, camera);
}

animate();
