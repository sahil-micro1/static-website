// Splits ivo.html into Webflow HTML-embed snippets that each stay under Webflow's 50,000-character limit.
// Only the content inside .container is exported; body background and container width/padding are left to Webflow.
// Usage: node build-embeds.js   (writes ./webflow-embeds/)
const fs = require("fs");
const path = require("path");

const LIMIT = 45000; // headroom under Webflow's 50,000-character cap
const SCOPE = ".icb";
const OUT = path.join(__dirname, "webflow-embeds");
const WEBFLOW_CSS = "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/css/micro1-stage.shared.f6f125eea.min.css";

const src = fs.readFileSync(path.join(__dirname, "ivo.html"), "utf8");

// ── CSS: scope every rule under .icb and drop page-level rules ──
const rawCss = src.match(/<style>([\s\S]*?)<\/style>/)[1].replace(/\/\*[\s\S]*?\*\//g, "");

function splitTop(str, sep = ",") {
  const out = []; let depth = 0, cur = "";
  for (const ch of str) {
    if (ch === "(" || ch === "[") depth++;
    if (ch === ")" || ch === "]") depth--;
    if (ch === sep && depth === 0) { out.push(cur); cur = ""; } else cur += ch;
  }
  out.push(cur);
  return out;
}

function scopeSelector(sel) {
  sel = sel.trim();
  if (/^(html|body)\b/.test(sel) || /^\.container\b/.test(sel)) return null;
  // the tooltip is moved to <body> at runtime, so it needs the tokens and its own rules outside .icb
  if (/^:root\b/.test(sel)) { const rest = sel.replace(/^:root(\[[^\]]*\])?/, ""); return `${SCOPE}${rest},.icb-tip${rest}`; }
  if (/^\.icb-tip(?![\w-])/.test(sel)) return sel;
  return `${SCOPE} ${sel}`;
}

function scopeBlock(css) {
  let out = "", i = 0;
  while (i < css.length) {
    const open = css.indexOf("{", i);
    if (open === -1) break;
    const prelude = css.slice(i, open).trim();
    if (prelude.startsWith("@")) {
      let depth = 1, j = open + 1;
      for (; j < css.length && depth; j++) { if (css[j] === "{") depth++; else if (css[j] === "}") depth--; }
      const inner = scopeBlock(css.slice(open + 1, j - 1));
      if (inner.trim()) out += `${prelude}{${inner}}`;
      i = j;
    } else {
      const close = css.indexOf("}", open);
      const decl = css.slice(open + 1, close);
      const sels = splitTop(prelude).map(scopeSelector).filter(Boolean);
      if (sels.length && decl.trim()) out += `${sels.join(",")}{${decl}}`;
      i = close + 1;
    }
  }
  return out;
}

const minifyCss = css => css
  .replace(/\s+/g, " ")
  .replace(/\s*([{};,>])\s*/g, "$1")
  .replace(/:\s+/g, ":")
  .replace(/;}/g, "}")
  .replace(/\(\s+/g, "(").replace(/\s+\)/g, ")")
  .replace(/@media\(/g, "@media (").replace(/\)and\(/g, ") and (")
  .trim();

// base text styles the page used to inherit from body; pre.tree must not pick up a host pre-wrap
const baseCss = `${SCOPE}{font-family:Outfit,system-ui,sans-serif;font-size:16px;line-height:1.5;color:var(--icb-white-100);text-align:left;}`
  + `${SCOPE} pre.icb-tree{white-space:pre;}`;
const css = minifyCss(scopeBlock(rawCss) + baseCss);
// ── HTML pieces ──
const body = src.slice(src.indexOf("<body>") + 6, src.lastIndexOf("</body>"));
const containerStart = body.indexOf("<div class='container'>");
const scriptsStart = body.indexOf("<script>");
const tip = body.match(/<div id="icb-tip"[^>]*><\/div>/)[0];
let content = body.slice(containerStart + "<div class='container'>".length, scriptsStart).replace(tip, "");
content = content.replace(/<\/div>\s*$/, ""); // closing tag of .container

// logos: Webflow asset URLs from logo-urls.json; empty entries fall back to the local logos/ folder
const logoUrls = JSON.parse(fs.readFileSync(path.join(__dirname, "logo-urls.json"), "utf8"));
const missingLogos = new Set();
content = content.replace(/src="logos\/([\w-]+)\.png"/g, (m, k) => {
  if (logoUrls[k]) return `src="${logoUrls[k]}"`;
  missingLogos.add(k);
  return m;
});

const scripts = body.slice(scriptsStart);

const minifyHtml = html => html.replace(/>\s+</g, "><").trim();

// top-level blocks: each .icb-section div
function topLevelBlocks(html) {
  const blocks = []; let i = 0;
  const tagRe = /<(\/?)div\b[^>]*>/g;
  while (i < html.length) {
    const start = html.indexOf("<", i);
    if (start === -1) break;
    tagRe.lastIndex = start;
    let depth = 0, m, end = -1;
    while ((m = tagRe.exec(html))) {
      depth += m[1] ? -1 : 1;
      if (depth === 0) { end = tagRe.lastIndex; break; }
    }
    if (end === -1) throw new Error("unbalanced markup near " + html.slice(start, start + 80));
    blocks.push(html.slice(start, end));
    i = end;
  }
  return blocks;
}

// the tooltip has to sit inside .icb, where its scoped styles apply
const wrap = (inner, last) => `<div class="icb">${inner}${last ? tip : ""}</div>${last ? scripts.trim() : ""}`;
const blocks = topLevelBlocks(content).map(minifyHtml);

const embeds = [{ name: "styles", html: `<style>${css}</style>` }];
let cur = [];
const flush = last => {
  const html = wrap(cur.join(""), last);
  const first = (cur[0].match(/<h[23][^>]*>([^<]*)/) || [, "content"])[1].replace(/^[\d.\s]+/, "");
  embeds.push({ name: first.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), html });
  cur = [];
};
blocks.forEach((b, idx) => {
  const isLast = idx === blocks.length - 1;
  const projected = wrap([...cur, b].join(""), isLast).length;
  if (cur.length && projected > LIMIT) flush(false);
  cur.push(b);
  if (isLast) flush(true);
});

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT);
embeds.forEach((e, i) => {
  if (e.html.length > LIMIT) throw new Error(`embed ${i + 1} is ${e.html.length} chars`);
  fs.writeFileSync(path.join(OUT, `${String(i + 1).padStart(2, "0")}-${e.name}.html`), e.html);
  console.log(`${String(i + 1).padStart(2, "0")}-${e.name}.html  ${e.html.length.toLocaleString()} chars`);
});
fs.cpSync(path.join(__dirname, "logos"), path.join(OUT, "logos"), { recursive: true });
if (missingLogos.size) console.warn(`\nNo Webflow URL yet for: ${[...missingLogos].join(", ")} (fill in logo-urls.json; embeds point at logos/*.png until then)`);

// preview: Webflow's own site CSS + a stand-in page background and container, embeds pasted in order
fs.writeFileSync(path.join(OUT, "preview.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>ContractBench embeds preview</title>
<link href="${WEBFLOW_CSS}" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>body{margin:0;background:#121212;}.preview-container{max-width:824px;margin:0 auto;padding:24px 16px;}
@media (min-width:880px){.preview-container{padding:32px 0 48px;}}</style>
</head><body><div class="preview-container">
${embeds.map(e => `<div class="w-embed">${e.html}</div>`).join("\n")}
</div></body></html>`);
