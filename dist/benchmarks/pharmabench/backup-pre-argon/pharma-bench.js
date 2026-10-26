(function(){
const EXT = 'https://static-website.sahil-773.workers.dev/benchmarks/pharmabench/ext/';
const D = {};
document.querySelectorAll('textarea.phb-scores').forEach(el => Object.assign(D, JSON.parse(el.value)));
const $ = (s, r=document) => r.querySelector(s);
const viewerMount = document.getElementById('phb-viewer');
if (viewerMount && viewerMount.parentElement !== document.body) document.body.appendChild(viewerMount);
const el = (tag, attrs={}, html) => { const e=document.createElement(tag); for (const [k,v] of Object.entries(attrs)) { if (k==='class') e.className=v; else if (k==='text') e.textContent=v; else e.setAttribute(k,v);} if (html!==undefined) e.innerHTML=html; return e; };
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const f3 = x => x.toFixed(3), f2 = x => x.toFixed(2);
const MC = m => { const o = {'Fable 5.1':1,'Sonnet 5.5':.8,'Opus 5.5':.6,'Opus 5':.45,'Muse Wonder':1,'Muse Spark 1.3':.75,'Muse Spark 1.1':.5,'Grok 4.6':1,'Gemini 3.8 Flash':1,'GPT 6 Astra':1}[m] ?? 1;
  const fam = /Fable|Opus|Sonnet/.test(m) ? 'claude' : /Muse/.test(m) ? 'muse' : /Grok/.test(m) ? 'grok' : /Gemini/.test(m) ? 'gemini' : /GPT/.test(m) ? 'gpt' : null;
  return fam ? {bg:`var(--phb-m-${fam})`, o} : null; };
const LOGOS = {"claude": "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6a5a7819fac77315251cefb0_claude.png", "gemini": "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6a5a781990ac587600afee57_gemini.png", "gpt": "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6a5a7819c48f94fa5d90c96f_openai.png", "grok": "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6a5a78198dc59e6cbd29fdd1_grok.png", "muse": "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6ac965ffaf650a28033b1c1a_muse.png"};
const mvars = m => { const c = MC(m); return c ? `--phb-mbg:${c.bg};--phb-mo:${c.o}` : ''; };
function scrollHint(el, dir, arrows){
  if (!el || el.closest('.phb-sc')) return;
  const w = document.createElement('div'); w.className = 'phb-sc'; w.dataset.phbDir = dir;
  el.parentNode.insertBefore(w, el); w.appendChild(el);
  let prev = null, next = null;
  if (dir === 'x' && arrows && window.matchMedia('(min-width:641px)').matches) {
    const arrow = (cls, d, label) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'phb-sc-btn ' + cls; b.setAttribute('aria-label', label); b.innerHTML = d < 0 ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7.5 2.5L4 6l3.5 3.5"/></svg>' : '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 2.5L8 6l-3.5 3.5"/></svg>'; b.addEventListener('click', () => el.scrollBy({left: d * Math.max(120, el.clientWidth * 0.6), behavior: 'smooth'})); w.appendChild(b); return b; };
    prev = arrow('phb-sc-prev', -1, 'Scroll left'); next = arrow('phb-sc-next', 1, 'Scroll right');
  }
  const upd = () => {
    const can = dir === 'x' ? el.scrollWidth > el.clientWidth + 16 : el.scrollHeight > el.clientHeight + 16;
    const end = dir === 'x' ? el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 : el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
    w.classList.toggle('phb-sc-end', !can || end);
    w.classList.toggle('phb-sc-start', dir !== 'x' || !can || el.scrollLeft <= 2);
    w.classList.toggle('phb-sc-prev-on', dir === 'x' && can && el.scrollLeft > 2);
    w.classList.toggle('phb-sc-next-on', dir === 'x' && can && el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };
  el.addEventListener('scroll', upd, {passive:true});
  new ResizeObserver(upd).observe(el);
  new MutationObserver(upd).observe(el, {childList:true, subtree:true});
  document.fonts.ready.then(upd);
  upd();
}
const mstyle = m => { const c = MC(m); return c ? `background:${c.bg};opacity:${c.o}` : ''; };
const mlogo = m => { const c = MC(m); const fam = c ? c.bg.match(/--phb-m-(\w+)/)[1] : null; return fam && LOGOS[fam] ? `<img class="phb-mlogo" src="${LOGOS[fam]}" alt="">` : ''; };
const pct = x => (x*100).toFixed(1)+'%';
const pct0 = x => Math.round(x*100)+'%';
const GC = {'Data Analysis':'var(--phb-g-da)','Document Structure':'var(--phb-g-ds)','Medical Writing':'var(--phb-g-mw)','Regulatory Review':'var(--phb-g-rr)'};
const sentence = g => g.charAt(0)+g.slice(1).toLowerCase();
const sw = g => `<span class="phb-sw-dot" style="background:${GC[g]}"></span>`;
const quote = x => esc(x.replace(/^"|"$/g,''));
const csvTable = (head, rows) => `<table><tr>${head.map(h=>`<th>${esc(h)}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table>`;
const PDFJS_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.4.299/build/pdf.min.mjs';
const PDFJS_WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.4.299/build/pdf.worker.min.mjs';
const PDFJS_FONTS = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.4.299/standard_fonts/';
const PDFJS_WASM = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.4.299/wasm/';
let pdfjsReady = null;
const pdfDocs = new Map();
const pdfShown = { preview: null, viewer: null };
const pdfJobs = new WeakMap();
function withTimeout(promise, ms){
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('PDF viewer took too long to load')), ms);
    promise.then(value => { clearTimeout(timer); resolve(value); }, err => { clearTimeout(timer); reject(err); });
  });
}
function ensurePdfjs(){
  if (!pdfjsReady) {
    const pending = withTimeout(import(PDFJS_URL), 15000).then(lib => {
      lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      return lib;
    });
    pdfjsReady = pending;
    pending.catch(() => { if (pdfjsReady === pending) pdfjsReady = null; });
  }
  return pdfjsReady;
}
function pdfHref(t){ return new URL(t.src, document.baseURI).href; }
function evictPdfs(){
  const keep = new Set(Object.values(pdfShown).filter(Boolean));
  for (const url of [...pdfDocs.keys()]) {
    if (pdfDocs.size <= 4) break;
    if (keep.has(url)) continue;
    const pending = pdfDocs.get(url);
    pdfDocs.delete(url);
    pending.then(doc => doc.destroy()).catch(() => {});
  }
}
async function loadPdfDoc(url){
  if (pdfDocs.has(url)) { const pending = pdfDocs.get(url); pdfDocs.delete(url); pdfDocs.set(url, pending); return pending; }
  const pending = (async () => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Document failed to load (' + res.status + ')');
    const data = new Uint8Array(await res.arrayBuffer());
    const lib = await ensurePdfjs();
    return lib.getDocument({
      data,
      disableRange: true,
      disableStream: true,
      standardFontDataUrl: PDFJS_FONTS,
      wasmUrl: PDFJS_WASM
    }).promise;
  })();
  pdfDocs.set(url, pending);
  pending.catch(() => { if (pdfDocs.get(url) === pending) pdfDocs.delete(url); });
  evictPdfs();
  return pending;
}
function mountPdf(host, t, opts){
  const prev = pdfJobs.get(host);
  const gen = (prev ? prev.gen : 0) + 1;
  if (prev && prev.task) { try { prev.task.cancel(); } catch (e) {} }
  const job = { gen, task: null };
  pdfJobs.set(host, job);
  host._phbPdfStep = null;
  pdfShown[opts.slot] = null;
  host.innerHTML = '<div class="phb-pdf"><p class="phb-pdf-status">Loading document…</p></div>';
  const root = host.querySelector('.phb-pdf');
  let url;
  try { url = pdfHref(t); }
  catch (err) {
    root.innerHTML = '<p class="phb-pdf-status">This document could not be opened.</p>';
    return;
  }
  const cancelled = err => err && err.name === 'RenderingCancelledException';
  (async () => {
    try {
      const doc = await loadPdfDoc(url);
      if (job.gen !== pdfJobs.get(host)?.gen || !root.isConnected) return;
      pdfShown[opts.slot] = url;
      let pageNo = 1;
      const bar = doc.numPages > 1
        ? '<div class="phb-pdf-bar"><button type="button" class="phb-btn phb-pdf-prev" aria-label="Previous page"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 2.5L4 6l3.5 3.5"/></svg></button><span class="phb-pdf-count"></span><button type="button" class="phb-btn phb-pdf-next" aria-label="Next page"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 2.5L8 6l-3.5 3.5"/></svg></button></div>'
        : '';
      root.innerHTML = bar + '<canvas role="img"></canvas>';
      const canvas = root.querySelector('canvas');
      const count = root.querySelector('.phb-pdf-count');
      const prevBtn = root.querySelector('.phb-pdf-prev');
      const nextBtn = root.querySelector('.phb-pdf-next');
      const paint = async () => {
        if (job.gen !== pdfJobs.get(host)?.gen || !root.isConnected) return;
        if (count) count.textContent = pageNo + ' / ' + doc.numPages;
        if (prevBtn) prevBtn.disabled = pageNo <= 1;
        if (nextBtn) nextBtn.disabled = pageNo >= doc.numPages;
        canvas.setAttribute('aria-label', 'Page ' + pageNo + ' of ' + doc.numPages + ' of ' + t.name);
        if (opts.onPage) opts.onPage(pageNo, doc.numPages);
        const page = await doc.getPage(pageNo);
        if (job.gen !== pdfJobs.get(host)?.gen || !root.isConnected) return;
        const base = page.getViewport({ scale: 1 });
        const avail = root.clientWidth || opts.maxWidth || 520;
        const cssW = Math.max(160, Math.min(avail, opts.maxWidth || avail));
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale: (cssW / base.width) * dpr });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = cssW + 'px';
        canvas.style.height = Math.floor(viewport.height / dpr) + 'px';
        if (job.task) { try { job.task.cancel(); } catch (e) {} }
        const task = page.render({ canvas, viewport });
        job.task = task;
        await task.promise;
        if (job.task === task) job.task = null;
      };
      const step = d => { const n = pageNo + d; if (n < 1 || n > doc.numPages) return; pageNo = n; paint().catch(err => { if (!cancelled(err)) console.error(err); }); };
      if (prevBtn) prevBtn.onclick = () => step(-1);
      if (nextBtn) nextBtn.onclick = () => step(1);
      host._phbPdfStep = step;
      await paint();
    } catch (err) {
      if (cancelled(err) || job.gen !== pdfJobs.get(host)?.gen || !root.isConnected) return;
      console.error(err);
      pdfShown[opts.slot] = null;
      root.innerHTML = '<p class="phb-pdf-status">This document could not be opened.</p>';
    }
  })();
}
const NW = n => ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'][n] || String(n);

const T = D.task, SCs = D.showcase;
const V = D.views, ORDER = D.order, RANK = D.rank, dec = D.decomp, PASS = D.pass, F = D.facts, Cc = D.ceiling;
const LEVEL = PASS.level || [PASS.order[0]];
const KINDS = ['Data Analysis','Document Structure','Medical Writing','Regulatory Review'];
let SM = 'pass', curCase = 0, curStep = 0, curProg = 0, curModel = 0;


/* Hero score card: leaderboard-full from src/research/research.js.
   Pass rate is PASS.views.Overall[model].s (same field as the scoreboard).
   Mean score is V.Overall[model].s (D.views.Overall). Bars use that value on a 0–1 scale. */
(function mountHeroBoard(){
  const mountEl = document.getElementById('phb-hero-board');
  if (!mountEl) return;
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const iso = Object.values((D.meta && D.meta.added) || {}).map(String).filter(v => /^\d{4}-\d{2}-\d{2}$/.test(v)).sort().pop();
  let lastUpdated = 'October 2026';
  if (iso) {
    const parts = iso.split('-').map(Number);
    lastUpdated = months[parts[1] - 1] + ' ' + parts[2] + ', ' + parts[0];
  }
  const iconFor = m => {
    const c = MC(m);
    const fam = c ? (c.bg.match(/--phb-m-(\w+)/) || [])[1] : null;
    if (!fam || !LOGOS[fam]) return null;
    const style = fam === 'gpt' ? 'openai' : fam;
    const alt = fam === 'gpt' ? 'OpenAI' : fam.charAt(0).toUpperCase() + fam.slice(1);
    return { style, alt, src: LOGOS[fam] };
  };
  const rowsFor = pick => [...ORDER].sort((a, b) => (pick(b) - pick(a)) || (ORDER.indexOf(a) - ORDER.indexOf(b))).map(name => ({
    name,
    score: pick(name) * 100,
    icon: iconFor(name)
  }));
  const data = {
    lastUpdated,
    defaultTab: 'pass',
    tabs: [
      { id: 'pass', label: 'Pass rate', format: n => Number(n).toFixed(1) + '%', rows: rowsFor(m => PASS.views.Overall[m].s) },
      { id: 'mean', label: 'Mean score', format: n => (Number(n) / 100).toFixed(3), rows: rowsFor(m => V.Overall[m].s) }
    ]
  };
  const BAR_EASE = 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)';
  const HOVER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = {
    toggleEl: mountEl.querySelector('.phb-leaderboard-full__toggle'),
    updatedEl: mountEl.querySelector('.phb-leaderboard-full__updated'),
    listEl: mountEl.querySelector('.phb-leaderboard-full__list'),
    tooltipEl: mountEl.querySelector('.phb-leaderboard-tooltip'),
    panelEl: mountEl.querySelector('.phb-leaderboard-full__panel'),
    data,
    activeTabId: data.defaultTab,
    hover: null
  };
  if (!root.toggleEl || !root.updatedEl || !root.listEl || !root.tooltipEl || !root.panelEl) return;

  function formatScore(tab, score) {
    const n = Number(score);
    return Number.isFinite(n) ? tab.format(n) : '—';
  }
  function barTransform(score) {
    const n = Number(score);
    const w = Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
    return 'scaleX(' + (w / 100) + ')';
  }
  function setBarFill(el, score) {
    if (!el) return;
    el.style.transition = 'none';
    el.style.transform = barTransform(score);
  }
  function playBarFills(fills) {
    if (!fills.length) return;
    void fills[0].el.offsetWidth;
    requestAnimationFrame(() => {
      fills.forEach(({ el, score }) => {
        el.style.transition = BAR_EASE;
        el.style.transform = barTransform(score);
      });
    });
  }
  function activeTab() {
    return data.tabs.find(t => t.id === root.activeTabId) || data.tabs[0];
  }
  function scoreByName(tab, name) {
    const row = (tab.rows || []).find(r => r.name === name);
    return row ? row.score : null;
  }
  function ranksForRows(tab, rows) {
    const ranks = new Array(rows.length);
    for (let i = 0; i < rows.length; ) {
      const key = formatScore(tab, rows[i].score);
      let j = i + 1;
      while (j < rows.length && formatScore(tab, rows[j].score) === key) j++;
      for (let k = i; k < j; k++) ranks[k] = i + 1;
      i = j;
    }
    return ranks;
  }
  function htmlToEl(html) {
    const wrap = document.createElement('div');
    wrap.innerHTML = html.trim();
    return wrap.firstElementChild;
  }
  function infoBtn(label) {
    return `<button type="button" class="phb-leaderboard-info-btn" aria-label="Details for ${esc(label || 'model')}"><svg class="phb-leaderboard-info-btn__icon" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true" focusable="false"><path d="M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.5 7.5C7.63261 7.5 7.75979 7.55268 7.85355 7.64645C7.94732 7.74021 8 7.86739 8 8V10.5C8 10.6326 8.05268 10.7598 8.14645 10.8536C8.24021 10.9473 8.36739 11 8.5 11" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.75 6C8.16421 6 8.5 5.66421 8.5 5.25C8.5 4.83579 8.16421 4.5 7.75 4.5C7.33579 4.5 7 4.83579 7 5.25C7 5.66421 7.33579 6 7.75 6Z" fill="currentColor"/></svg></button>`;
  }
  function rowHtml(row, index, rank) {
    const icon = row.icon;
    const leadClass = rank === 1 ? ' phb-leaderboard-full__row--lead' : '';
    const iconMod = icon ? ` phb-leaderboard-full__icon--${icon.style}` : '';
    return `<li class="phb-leaderboard-full__row${leadClass}" data-phb-index="${index}" data-phb-rank="${rank}" data-phb-name="${esc(row.name)}" data-phb-score="${Number(row.score)}">
      <div class="phb-leaderboard-full__meta">
        <div class="phb-leaderboard-full__identity">
          <div class="phb-leaderboard-full__icon${iconMod}">${icon ? `<img src="${icon.src}" alt="${esc(icon.alt)}" width="20" height="20">` : ''}</div>
          <p class="phb-leaderboard-full__name">${esc(row.name)}</p>
          ${infoBtn(row.name)}
        </div>
        <p class="phb-leaderboard-full__score">${formatScore(activeTab(), row.score)}</p>
      </div>
      <div class="phb-leaderboard-full__track" aria-hidden="true"><div class="phb-leaderboard-full__fill" style="transform: ${barTransform(row.score)}"></div></div>
    </li>`;
  }
  function createHover(rows) {
    root.hoverAbort?.abort();
    const ac = new AbortController();
    root.hoverAbort = ac;
    const { signal } = ac;
    let leaveTimer = null;
    let showToken = 0;
    function clear() {
      showToken += 1;
      clearTimeout(leaveTimer);
      leaveTimer = null;
      root.listEl.querySelectorAll('.phb-leaderboard-full__row.phb-is-active').forEach(el => {
        el.classList.remove('phb-is-active');
        el.querySelector('.phb-leaderboard-info-btn')?.blur();
      });
      root.listEl.classList.remove('phb-has-active');
      root.tooltipEl.classList.remove('phb-is-visible');
    }
    function position(rowEl) {
      const panel = root.panelEl.getBoundingClientRect();
      const btn = rowEl.querySelector('.phb-leaderboard-info-btn');
      const anchor = (btn || rowEl).getBoundingClientRect();
      const tw = root.tooltipEl.offsetWidth;
      const th = root.tooltipEl.offsetHeight;
      const gap = 4;
      const pad = 8;
      let left = anchor.right - panel.left + gap;
      let top = anchor.top - panel.top + (anchor.height - th) / 2;
      const fitsRight = left + tw <= panel.width - pad;
      const flipped = anchor.left - panel.left - tw - gap;
      if (!fitsRight && flipped >= pad) left = flipped;
      else if (!fitsRight) {
        left = Math.max(pad, Math.min(anchor.left - panel.left, panel.width - tw - pad));
        top = anchor.bottom - panel.top + gap;
      }
      root.tooltipEl.style.left = left + 'px';
      root.tooltipEl.style.top = top + 'px';
    }
    function show(rowEl, name, rank, animate) {
      const token = (showToken += 1);
      const lines = data.tabs.map(tab => ({ label: tab.label + ':', value: formatScore(tab, scoreByName(tab, name)) }))
        .concat([{ label: 'Rank:', value: 'Top ' + rank }]);
      const wasVisible = root.tooltipEl.classList.contains('phb-is-visible');
      root.tooltipEl.innerHTML = lines.map(line => `<div class="phb-leaderboard-tooltip__row"><p class="phb-leaderboard-tooltip__label">${esc(line.label)}</p><p class="phb-leaderboard-tooltip__value">${esc(line.value)}</p></div>`).join('');
      position(rowEl);
      if (wasVisible || !animate || !HOVER) {
        if (token === showToken) root.tooltipEl.classList.add('phb-is-visible');
      } else {
        requestAnimationFrame(() => { if (token === showToken) root.tooltipEl.classList.add('phb-is-visible'); });
      }
    }
    function activate(rowEl, name, rank) {
      clearTimeout(leaveTimer);
      leaveTimer = null;
      const prev = root.listEl.querySelector('.phb-leaderboard-full__row.phb-is-active');
      if (prev === rowEl) return;
      root.listEl.querySelectorAll('.phb-leaderboard-full__row.phb-is-active').forEach(el => el.classList.remove('phb-is-active'));
      rowEl.classList.add('phb-is-active');
      root.listEl.classList.add('phb-has-active');
      show(rowEl, name, rank, !prev);
    }
    function scheduleClear() {
      clearTimeout(leaveTimer);
      leaveTimer = setTimeout(clear, 60);
    }
    function openRow(rowEl) {
      const index = Number(rowEl.dataset.phbIndex);
      const row = rows[index];
      if (!row) return;
      activate(rowEl, row.name, Number(rowEl.dataset.phbRank) || index + 1);
    }
    root.listEl.querySelectorAll('.phb-leaderboard-full__row').forEach(rowEl => {
      const btn = rowEl.querySelector('.phb-leaderboard-info-btn');
      if (!btn) return;
      if (HOVER) {
        btn.addEventListener('mouseenter', () => openRow(rowEl), { signal });
        btn.addEventListener('mouseleave', scheduleClear, { signal });
        btn.addEventListener('focus', () => openRow(rowEl), { signal });
        btn.addEventListener('blur', scheduleClear, { signal });
      } else {
        btn.addEventListener('click', e => {
          e.preventDefault();
          e.stopPropagation();
          if (rowEl.classList.contains('phb-is-active')) clear();
          else openRow(rowEl);
        }, { signal });
      }
    });
    return { clear };
  }
  function syncTabThumb(animate) {
    const thumb = root.toggleEl.querySelector('.phb-leaderboard-full__toggle-thumb');
    const active = root.toggleEl.querySelector('.phb-leaderboard-full__toggle-btn[aria-pressed="true"]');
    if (!thumb || !active) return;
    if (!animate) thumb.style.transition = 'none';
    thumb.style.width = active.offsetWidth + 'px';
    thumb.style.transform = 'translateX(' + active.offsetLeft + 'px)';
    if (!animate) { void thumb.offsetWidth; thumb.style.transition = ''; }
  }
  function paintTabs(animate) {
    root.toggleEl.querySelectorAll('.phb-leaderboard-full__toggle-btn').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.phbTabId === root.activeTabId));
    });
    syncTabThumb(animate);
  }
  function renderRows(opts) {
    const animate = !!(opts && opts.animate);
    root.hover?.clear();
    const tab = activeTab();
    const rows = tab.rows || [];
    mountEl.style.setProperty('--phb-model-count', String(rows.length));
    const existing = new Map([...root.listEl.querySelectorAll('.phb-leaderboard-full__row')].map(el => [el.dataset.phbName, el]));
    const canAnimate = animate && existing.size > 0;
    const ranks = ranksForRows(tab, rows);
    const pending = [];
    const ordered = rows.map((row, i) => {
      let el = existing.get(row.name);
      if (!el) el = htmlToEl(rowHtml(row, i, ranks[i]));
      const prevScore = Number(el.dataset.phbScore);
      const nextScore = Number(row.score);
      el.dataset.phbIndex = String(i);
      el.dataset.phbRank = String(ranks[i]);
      el.dataset.phbScore = String(nextScore);
      el.classList.toggle('phb-leaderboard-full__row--lead', ranks[i] === 1);
      el.querySelector('.phb-leaderboard-full__score').textContent = formatScore(tab, nextScore);
      const fillEl = el.querySelector('.phb-leaderboard-full__fill');
      setBarFill(fillEl, canAnimate ? prevScore : nextScore);
      if (canAnimate) pending.push({ el: fillEl, score: nextScore });
      return el;
    });
    root.listEl.replaceChildren(...ordered);
    if (canAnimate) playBarFills(pending);
    root.hover = createHover(rows);
  }
  function renderTabs() {
    root.toggleEl.innerHTML = data.tabs.map(tab =>
      `<button type="button" class="phb-leaderboard-full__toggle-btn" data-phb-tab-id="${esc(tab.id)}" aria-pressed="${tab.id === root.activeTabId}">${esc(tab.label)}</button>`
    ).join('') + '<span class="phb-leaderboard-full__toggle-thumb" aria-hidden="true"></span>';
    root.toggleEl.querySelectorAll('.phb-leaderboard-full__toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.phbTabId === root.activeTabId) return;
        root.activeTabId = btn.dataset.phbTabId;
        paintTabs(true);
        renderRows({ animate: true });
      });
    });
  }
  root.updatedEl.textContent = data.lastUpdated ? 'Last updated ' + data.lastUpdated : '';
  renderTabs();
  paintTabs(false);
  renderRows({ animate: false });
  window.addEventListener('resize', () => syncTabThumb(false));
})();


/* hero: four runs, each linked to its failure-mode case */
const caseIdx = g => Math.max(0, SCs.findIndex(s => s.group === g));
document.addEventListener('click', e => { const a = e.target.closest('a[data-phb-case]'); if (a) showCase(+a.dataset.phbCase); });

/* evidence explorer: file list loads on its own */
fetch(EXT + 'pharma-bench-wall.json').then(r => {
  if (!r.ok) throw new Error('PharmaBench files failed to load (' + r.status + ')');
  return r.json();
}).then(tiles => {
  /* evidence explorer */
  const NUM = ['zero','one','two','three','four','five','six'];
  const IC = {
    pdf:'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 1.75h5.25l3.75 3.75v8.75h-9z"/><path d="M8.5 1.75V5.75h4"/></svg>',
    csv:'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="12" height="10" rx="1"/><path d="M2 6.5h12M2 9.75h12M6.5 3v10"/></svg>'
  };
  const keyIdx = tiles.map((t,i) => i).filter(i => tiles[i].key);
  $('#phb-xp-intro').textContent = `Task ${T.pb}: ${T.pdf} PDF documents and ${T.csv} CSV datasets from ${T.studies} studies in the ${T.program} program. Nothing in the request says which of them matter; ${NUM[T.nkey] || T.nkey} carry the answer. The two that carry the answer are marked Key. Pick a file to preview it, or search the whole set.`;
  const studies = [...new Set(tiles.map(t => t.study))];
  let xpMode = 'all', xpType = 'all', xpStudy = 'all', xpQ = '', xpSel = -1; const xpOpen = new Set();
  const xpNarrow = () => window.matchMedia('(max-width:760px)').matches;
  if (!xpNarrow()) xpOpen.add(tiles[0].study);
  const xpList = $('#phb-xp-list'), xpPrev = $('#phb-xp-prev'), xpTools = $('#phb-xp-tools'), xpNote = $('#phb-xp-note');
  $('#phb-xp-n-all').textContent = tiles.length;
  $('#phb-xp-study').innerHTML = '<option value="all">All studies</option>' + studies.map(st => `<option value="${esc(st)}">${esc(st)} (${tiles.filter(t => t.study===st).length})</option>`).join('');
  const sizeOf = t => t.kind==='pdf' ? `${t.pages} page${t.pages === 1 ? '' : 's'}` : `${t.rows.toLocaleString()} rows`;
  function xpIndices(){
    const q = xpQ.trim().toLowerCase();
    return tiles.map((t,i) => i).filter(i => {
      const t = tiles[i];
      if (xpType === 'key' ? !t.key : (xpType !== 'all' && t.kind !== xpType)) return false;
      if (xpStudy !== 'all' && t.study !== xpStudy) return false;
      return !q || `${t.name} ${t.label} ${t.study}`.toLowerCase().includes(q);
    });
  }
  function renderList(){
    const idx = xpIndices();
    const withStudy = xpStudy === 'all';
    const filtered = idx.length !== tiles.length;
    const grouped = xpStudy === 'all' && !xpQ.trim();
    const grpOf = t => t.study;
    let last = null, html = '';
    if (filtered && idx.length && (xpQ.trim() || xpStudy !== 'all')) html += `<div class="phb-xp-res">${idx.length} of ${tiles.length} files <button class="phb-xp-clear" id="phb-xp-clear">Clear</button></div>`;
    if (grouped && idx.length && !xpNarrow() && !idx.some(k => xpOpen.has(grpOf(tiles[k])))) xpOpen.add(grpOf(tiles[idx.includes(xpSel) ? xpSel : idx[0]]));
    idx.forEach(i => {
      const t = tiles[i];
      if (grouped) { const g = grpOf(t); if (g !== last) { const n = idx.filter(k => grpOf(tiles[k]) === g).length; html += `${last!==null?'</details>':''}<details class="phb-xp-sec" data-phb-g="${esc(g)}"${xpOpen.has(g)?' open':''}><summary class="phb-xp-grp">${esc(g)}<span>${n}</span></summary>`; last = g; } }
      html += `<button class="phb-xp-item" data-phb-i="${i}" title="${esc(t.name)}"${i===xpSel?' aria-current="true"':''}>${IC[t.kind]}<span class="phb-xp-nm">${esc(t.name)}</span><span class="phb-xp-mt">${t.key ? '<i class="phb-xp-key" title="Needed for the answer">Key</i> ' : ''}${withStudy && !grouped ? esc(t.study)+' · ' : ''}${esc(t.label)} · ${sizeOf(t)}</span></button>`;
    });
    if (grouped && last !== null) html += '</details>';
    xpList.innerHTML = idx.length ? html : `<div class="phb-xp-empty">No files match.<br><button class="phb-close" id="phb-xp-clear">Clear filters</button></div>`;
    xpList.querySelectorAll('.phb-xp-sec').forEach(d => d.classList.toggle('phb-has-sel', !!d.querySelector('[aria-current="true"]')));
    xpList.querySelectorAll('.phb-xp-sec').forEach(d => d.addEventListener('toggle', () => { if (d.open) xpOpen.add(d.dataset.phbG); else xpOpen.delete(d.dataset.phbG); }));
    xpNote.textContent = `${idx.length===tiles.length ? 'All '+tiles.length : 'Showing '+idx.length+' of '+tiles.length} files from ${T.studies} studies in the ${T.program} program. The ${NUM[T.nkey] || T.nkey} marked Key carry the answer.`;
    return idx;
  }
  function xpPreview(i){
    const t = tiles[i];
    const meta = t.kind==='pdf' ? `${esc(t.study)} · ${esc(t.label)} · ${t.pages} page${t.pages === 1 ? '' : 's'} · ${t.kb.toLocaleString()} KB` : `${esc(t.study)} · ${t.rows.toLocaleString()} rows × ${t.cols} columns`;
    const body = t.kind==='pdf' ? '' : `<div class="phb-xp-tbl">${csvTable(t.view.head, t.view.rows)}</div>`;
    xpPrev.innerHTML = `<div class="phb-xp-ph"><div class="phb-xp-pt"><b>${esc(t.name)}</b><span>${t.key?'<i class="phb-xp-key">Key file</i> ':''}${meta}</span></div><div class="phb-xp-nav"><button class="phb-btn phb-xp-step" data-phb-d="-1" aria-label="Previous file" title="Previous file (↑)"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 2.5L4 6l3.5 3.5"/></svg></button><button class="phb-btn phb-xp-step" data-phb-d="1" aria-label="Next file" title="Next file (↓)"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 2.5L8 6l-3.5 3.5"/></svg></button><button class="phb-btn" id="phb-xp-expand">${t.kind==='pdf'?'Open document':'Open dataset'}</button></div></div><div class="phb-xp-pb">${body}</div>`;
    if (t.kind==='pdf') mountPdf(xpPrev.querySelector('.phb-xp-pb'), t, { slot: 'preview', maxWidth: 560 });
    xpPrev.querySelectorAll('.phb-xp-tbl').forEach(e => scrollHint(e, 'x'));
    scrollHint(xpPrev.querySelector('.phb-xp-pb'), 'y');
    $('#phb-xp-expand').onclick = () => openViewer(i);
    xpPrev.querySelectorAll('.phb-xp-step').forEach(b => b.onclick = () => { const idx = xpIndices(), k = idx.indexOf(i), n = idx[k + +b.dataset.phbD]; if (n !== undefined) xpSelect(n, true); });
  }
  document.addEventListener('keydown', e => { if (e.key === '/' && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName) && !viewer.classList.contains('phb-open')) { const q = $('#phb-xp-q'); if (q && q.getBoundingClientRect().top < window.innerHeight && q.getBoundingClientRect().bottom > 0) { e.preventDefault(); q.focus(); } } });
  function xpSelect(i, byUser){
    xpSel = i;
    xpList.querySelectorAll('.phb-xp-item').forEach(b => { if (+b.dataset.phbI === i) b.setAttribute('aria-current','true'); else b.removeAttribute('aria-current'); });
    const cur = xpList.querySelector('[aria-current="true"]'); const sec = cur?.closest('.phb-xp-sec'); if (sec && !sec.open && (byUser || !xpNarrow())) sec.open = true;
    xpList.querySelectorAll('.phb-xp-sec').forEach(d => d.classList.toggle('phb-has-sel', d === sec));
    if (byUser) cur?.scrollIntoView({block:'nearest'});
    xpPreview(i);
  }
  function xpSetMode(m){
    xpMode = m;
    document.querySelectorAll('.phb-xp-tab').forEach(b => b.setAttribute('aria-selected', b.dataset.phbM === m));
    xpTools.hidden = m !== 'all';
    const idx = renderList();
    if (idx.length && !idx.includes(xpSel)) xpSelect(idx[0]);
    xpList.querySelector('[aria-current="true"]')?.scrollIntoView({block:'nearest'});
  }
  xpList.addEventListener('click', e => {
    if (e.target.closest('#phb-xp-clear')) { xpType = 'all'; xpStudy = 'all'; xpQ = ''; $('#phb-xp-q').value = ''; $('#phb-xp-study').value = 'all'; $('#phb-xp-type').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x.dataset.phbT==='all')); renderList(); return; }
    const b = e.target.closest('.phb-xp-item'); if (!b) return;
    xpSelect(+b.dataset.phbI, true);
    if (window.matchMedia('(max-width:760px)').matches) { e.preventDefault(); openViewer(+b.dataset.phbI); }
  });
  xpList.addEventListener('keydown', e => {
    if (!['ArrowDown','ArrowUp','Home','End'].includes(e.key)) return;
    const items = [...xpList.querySelectorAll('.phb-xp-item')].filter(b => b.offsetParent !== null), k = items.indexOf(document.activeElement);
    if (k < 0) return;
    e.preventDefault();
    const n = Math.max(0, Math.min(items.length-1, e.key==='ArrowDown' ? k+1 : e.key==='ArrowUp' ? k-1 : e.key==='Home' ? 0 : items.length-1));
    items[n].focus(); xpSelect(+items[n].dataset.phbI, true);
  });
  $('#phb-xp-q').addEventListener('input', e => { xpQ = e.target.value; renderList(); });
  $('#phb-xp-study').addEventListener('change', e => { xpStudy = e.target.value; renderList(); });
  $('#phb-xp-type').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    xpType = b.dataset.phbT;
    $('#phb-xp-type').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x===b));
    renderList();
  });
  renderList();
  if (!xpNarrow()) xpSelect(xpIndices()[0] ?? 0);
  const viewer = $('#phb-viewer'); let lastFocus = null;
  function closeViewer(){ if (!viewer.classList.contains('phb-open')) return; viewer.classList.remove('phb-open'); viewer.setAttribute('aria-hidden','true'); viewer.inert = true; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  function openViewer(i){
    const t = tiles[i];
    $('#phb-viewer-title').textContent = t.name;
    $('#phb-viewer-meta').textContent = t.kind==='pdf' ? `${t.label} · opening` : `First ${t.view.rows.length} of ${t.rows.toLocaleString()} rows · ${t.view.head.length} of ${t.cols} columns`;
    const viewerBody = $('#phb-viewer-body');
    if (t.kind==='pdf') mountPdf(viewerBody, t, { slot: 'viewer', maxWidth: 600, onPage: (n, total) => { $('#phb-viewer-meta').textContent = `${t.label} · page ${n} of ${total}`; } });
    else { viewerBody._phbPdfStep = null; viewerBody.innerHTML = csvTable(t.view.head, t.view.rows); }
    lastFocus = document.activeElement; viewer.inert = false; viewer.setAttribute('aria-hidden','false'); viewer.classList.add('phb-open'); $('#phb-viewer-close').focus();
  }
  $('#phb-viewer-close').onclick = closeViewer;
  viewer.addEventListener('click', e => { if (e.target === viewer) closeViewer(); });
  document.addEventListener('keydown', e => {
    if (!viewer.classList.contains('phb-open')) return;
    if (e.key === 'Escape') { closeViewer(); return; }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { const step = $('#phb-viewer-body')._phbPdfStep; if (step) { e.preventDefault(); step(e.key === 'ArrowLeft' ? -1 : 1); } return; }
    if (e.key === 'Tab') { const f = [...viewer.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(x => !x.disabled); if (!f.length) return; const first = f[0], last = f[f.length-1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
  });
  const list = document.getElementById('phb-xp-list');
  if (list) list.removeAttribute('aria-busy');
}).catch(err => {
  console.error(err);
  const list = document.getElementById('phb-xp-list');
  if (list) { list.removeAttribute('aria-busy'); list.innerHTML = '<p class="phb-async-loading">The file list could not be loaded.</p>'; }
});

/* scoreboard: pass rate (headline) and mean score */
const mseg = () => `<div class="phb-seg phb-mseg" role="group" aria-label="Score shown"><button data-phb-m="pass" aria-pressed="${SM==='pass'}">Pass rate</button><button data-phb-m="mean" aria-pressed="${SM==='mean'}">Mean score</button></div>`;
document.addEventListener('click', e => { const b = e.target.closest('.phb-mseg button'); if (!b) return;
  if (b.dataset.phbM===SM) return; SM = b.dataset.phbM; showCase(curCase); });
const VIEWS = ['Overall', ...KINDS];
const PHI = Math.max(0.3, Math.ceil(Math.max(...Object.values(PASS.views.Overall).map(v=>v.ci[1]))*10)/10);
const AXES = {pass:{lo:0, hi:PHI, ticks:Array.from({length:Math.round(PHI*10)+1},(_,i)=>i/10), fmt:t=>Math.round(t*100)+'%'}, mean:{lo:0.5, hi:0.9, ticks:[0.5,0.6,0.7,0.8,0.9], fmt:t=>t.toFixed(1)}};
let metric = 'pass', curView = 'Overall';
const rowsWrap = $('#phb-lb-rows'); const rows = {};
ORDER.forEach(m => {
  const r = el('div', {class:'phb-lb-row'});
  r.innerHTML = `<div class="phb-lb-rank"></div><div class="phb-lb-name">${mlogo(m)}${esc(m)}</div><div class="phb-lb-track"><span class="phb-grids"></span><i class="phb-lb-ci" style="${mstyle(m)}"></i><i class="phb-lb-dot" style="${mstyle(m)}"></i></div><div class="phb-lb-score"></div>`;
  rowsWrap.append(r); rows[m] = r;
});
const rowH = () => parseFloat(getComputedStyle(rowsWrap).getPropertyValue('--phb-row')) || 52;
function render(){
  const ax = AXES[metric], xp = v => ((Math.max(ax.lo, Math.min(ax.hi, v)) - ax.lo) / (ax.hi-ax.lo) * 100);
  $('#phb-lb-axis').innerHTML = ax.ticks.map(t => `<span style="left:${xp(t)}%">${ax.fmt(t)}</span>`).join('');
  const data = metric==='pass' ? PASS.views[curView] : V[curView];
  const ord = [...ORDER].sort((a,b) => data[b].s - data[a].s);
  rowsWrap.style.height = (rowH()*ord.length)+'px';
  ord.forEach((m,i) => {
    const r = rows[m]; const d = data[m];
    r.style.transform = `translateY(${i*rowH()}px)`;
    r.querySelector('.phb-lb-rank').textContent = i+1;
    r.querySelector('.phb-grids').innerHTML = ax.ticks.map(t=>`<i class="phb-lb-grid" style="left:${xp(t)}%"></i>`).join('');
    const ci = r.querySelector('.phb-lb-ci'); ci.style.left = xp(d.ci[0])+'%'; ci.style.width = (xp(d.ci[1])-xp(d.ci[0]))+'%';
    r.querySelector('.phb-lb-dot').style.left = xp(d.s)+'%';
    r.querySelector('.phb-lb-score').innerHTML = metric==='pass' ? `${pct(d.s)}<small>mean ${f3(V[curView][m].s)}</small>` : `${f3(d.s)}<small>${f3(d.ci[0])} to ${f3(d.ci[1])}</small>`;
  });
  const scope = curView==='Overall' ? 'all 120 tasks' : `${sentence(curView).toLowerCase()} tasks`;
  $('#phb-metric-note').textContent = metric==='pass' ? 'Share of runs that earn full marks, with each model’s mean score below' : 'Average share of rubric points earned';
  $('#phb-lb-cap').innerHTML = metric==='pass'
    ? `<b>Figure 1.</b> Pass rate by model over ${scope}, three runs per task, with mean score in small type. Mean score is on a 0 to 1 scale, where 1.000 is a pass. Bars are 95% bootstrap intervals over tasks; the axis runs to ${Math.round(PHI*100)}%.`
    : `<b>Figure 1.</b> Mean score by model over ${scope}. Bars are 95% bootstrap intervals over tasks.`;
}
const tabs = $('#phb-lb-tabs');
VIEWS.forEach((v,i) => { const b = el('button', {class:'phb-tab', role:'tab', 'aria-selected': i===0, text: v==='Overall'?'All 120 tasks':v}); b.onclick = () => { tabs.querySelectorAll('.phb-tab').forEach(x=>x.setAttribute('aria-selected', x===b)); curView = v; render(); }; tabs.append(b); });
$('#phb-metric').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $('#phb-metric').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed', x===b)); metric = b.dataset.phbM; render(); });
render();
window.addEventListener('resize', render);

/* headline findings: figures */
const lead = PASS.order[0];
$('#phb-fig-full').innerHTML = `<div class="phb-big2 phb-big3 phb-acc"><div><b>${pct(PASS.views.Overall[lead].s)}</b><span>of ${esc(lead)}'s runs earned full marks, the most of any model</span></div><div><b>${pct(PASS.overall)}</b><span>of all ${D.meta.n_runs.toLocaleString()} runs earned full marks, across all ${NW(D.meta.n_models)} models</span></div><div><b>${PASS.never}</b><span>of the 120 tasks were never fully solved by any run</span></div></div>`;
const top7 = ORDER.filter(m => m !== D.meta.top_credit).slice(0,7);
const bySc = [...ORDER].sort((a,b)=>dec[b].score-dec[a].score);
$('#phb-fig-stack').innerHTML = `<div class="phb-stack">${bySc.map(m => { const d = dec[m]; const x = v => (v-0.55)/(0.9-0.55)*100; return `<div class="phb-stack-row"><span>${mlogo(m)}${esc(m)}</span><div class="phb-bars" title="${esc(m)}: required criteria ${f3(d.credit)}, penalties ${f3(d.penalty)}, score ${f3(d.score)}"><i class="phb-s" style="width:${x(d.score)}%;${mstyle(m)}"></i><i class="phb-p" style="left:${x(d.score)}%;width:${x(d.credit)-x(d.score)}%"></i></div><span class="phb-v">${f3(d.score)} <b>−${f3(d.penalty)}</b></span></div>`;}).join('')}<p class="phb-cap"><b>Figure 2.</b> The bar is the final score. Red is the amount lost to penalties. Together they are the credit for required criteria met, which is highest for ${esc(D.meta.top_credit)} (${f3(dec[D.meta.top_credit].credit)}) and ranges only from ${f3(Math.min(...top7.map(m=>dec[m].credit)))} to ${f3(Math.max(...top7.map(m=>dec[m].credit)))} across the next seven models. The axis starts at 0.55.</p></div>`;
const kRows = KINDS.map(g => { const v = F.by_group[g]; const vals = ORDER.map(m => [m, v[m]]).sort((a,b)=>b[1]-a[1]); return {g, all:v.all_models, vals, gap: vals[0][1]-vals[vals.length-1][1]}; }).sort((a,b)=>b.all-a.all);
const kx = v => (v-0.5)/(0.9-0.5)*100;
$('#phb-fig-kind').innerHTML = `<div class="phb-kdots">${kRows.map(r => `<div class="phb-kd-row"><span>${sw(r.g)}${esc(sentence(r.g))}<small>${pct(PASS.by_group_all[r.g])} of runs pass</small></span>
    <div class="phb-kd-track"><i class="phb-kd-range" style="left:${kx(r.vals[r.vals.length-1][1])}%;width:${kx(r.vals[0][1])-kx(r.vals[r.vals.length-1][1])}%;background:${GC[r.g]}"></i>${r.vals.map(([m,v]) => `<i class="phb-kd-dot" data-phb-m="${esc(m)} · ${f3(v)}" style="left:${kx(v)}%;${mvars(m)}"></i>`).join('')}<span class="phb-kd-end phb-lo" style="left:${kx(r.vals[r.vals.length-1][1])}%">${esc(r.vals[r.vals.length-1][0])}</span><span class="phb-kd-end phb-hi" style="left:${kx(r.vals[0][1])}%">${esc(r.vals[0][0])}</span></div>
    <span class="phb-v">${f3(r.gap)}<small>gap</small></span></div>`).join('')}
  <div class="phb-kd-row phb-kd-axis"><span></span><div>${[0.5,0.6,0.7,0.8,0.9].map(t=>`<span style="left:${kx(t)}%">${t.toFixed(1)}</span>`).join('')}</div><span></span></div><p class="phb-cap"><b>Figure 3.</b> Mean score of each model by kind of work, one dot per model. The band runs from the worst model to the best; the gap between them is at right. Hover a dot for the model.</p></div>`;
$('#phb-fig-fmt').innerHTML = `<div class="phb-big2"><div><b>${pct0(F.fmt.compliance_rate_combined)}</b><span>of runs wrote continuous prose without bullets when asked to, across ${F.fmt.n_tasks} tasks</span></div><div><b>${pct0(F.wl.compliance_rate_combined)}</b><span>of runs stayed within a stated word limit, across ${F.wl.n_tasks} tasks</span></div></div>`;
$('#phb-fig-files').innerHTML = `<div class="phb-files123" aria-label="9 of 123 files opened">${Array.from({length:123},(_,i)=>`<i class="${i<9?'phb-on':''}"></i>`).join('')}<p class="phb-cap"><b>Figure 5.</b> A typical run opens 9 of the 123 files in a typical task.</p></div>`;
$('#phb-fig-hard').innerHTML = `<div class="phb-cmp"><div class="phb-keyline phb-top"><span><i style="background:var(--phb-accent)"></i>The ${Cc.n} tasks where no model averages above 0.70</span><span><i style="background:var(--phb-line)"></i>All 120 tasks</span></div>${Cc.cats.map(c => `<div class="phb-cmp-row ${c.pen?'phb-pen':''}"><span>${esc(c.label)}</span><div class="phb-b"><i class="phb-h" style="width:${c.hard/0.3*100}%"></i><i class="phb-a" style="width:${c.all/0.3*100}%"></i></div><span class="phb-v"><b>${Math.round(c.hard*100)}%</b> vs ${Math.round(c.all*100)}%</span></div>`).join('')}<p class="phb-cap"><b>Figure 6.</b> Share of lost rubric points by category on those ${Cc.n} tasks, compared with all tasks.</p></div>`;

/* task set: taxonomy */
const SKILLS = {'Data Analysis':['Biostatistics','Data Consistency'],'Medical Writing':['Scientific Synthesis','Safety Synthesis'],'Document Structure':['Document Structure','Document Compliance'],'Regulatory Review':['Regulatory Review','Regulatory Response']};
$('#phb-taxonomy').innerHTML = `<table class="phb-mini"><tr><th>Kind of work</th><th>Skills covered</th><th class="phb-n">Tasks</th><th class="phb-n">Pass rate</th><th class="phb-n">Mean score</th><th class="phb-n">Best model minus worst</th></tr>${kRows.map(r => `<tr><td><b>${sw(r.g)}${esc(sentence(r.g))}</b></td><td class="phb-skills">${SKILLS[r.g].map(s=>`<span>${esc(sentence(s))} <small>${f3(F.by_skill[s])}</small></span>`).join('')}</td><td class="phb-n">${F.by_group[r.g].n_tasks}</td><td class="phb-n">${pct(PASS.by_group_all[r.g])}</td><td class="phb-n">${f3(r.all)}</td><td class="phb-n">${f3(r.gap)}</td></tr>`).join('')}</table>`;

/* task set: programs table + atlas */
const A = D.atlas, pv = $('#phb-prog-view');
const maxFiles = Math.max(...A.flatMap(a=>a.phases.map(ph=>ph.files[1])));
const pdd = $('#phb-prog-dd'), pbtn = $('#phb-prog-sel'), pmenu = $('#phb-prog-menu'), pval = pdd.querySelector('.phb-prog-dd-val');
const progLabel = a => `${a.name} · ${a.product.split(', ')[0]}`;
pmenu.innerHTML = A.map((a,k) => `<li role="option" tabindex="-1" id="phb-prog-opt-${k}" data-phb-k="${k}" aria-selected="false">${esc(progLabel(a))}</li>`).join('');
function closeProg(){ pbtn.setAttribute('aria-expanded','false'); pmenu.hidden = true; pdd.removeAttribute('data-phb-open'); }
function openProg(){ pbtn.setAttribute('aria-expanded','true'); pmenu.hidden = false; pdd.setAttribute('data-phb-open',''); }
pbtn.addEventListener('click', () => pbtn.getAttribute('aria-expanded')==='true' ? closeProg() : openProg());
pmenu.addEventListener('click', e => { const li = e.target.closest('[role="option"]'); if (!li) return; showProg(+li.dataset.phbK); closeProg(); });
document.addEventListener('click', e => { if (!pdd.contains(e.target)) closeProg(); });
pbtn.addEventListener('keydown', e => {
  if (!['ArrowDown','ArrowUp','Enter',' '].includes(e.key)) return;
  e.preventDefault(); openProg();
  (pmenu.querySelector('[aria-selected="true"]') || pmenu.querySelector('[role="option"]')).focus();
});
pmenu.addEventListener('keydown', e => {
  const items = [...pmenu.querySelectorAll('[role="option"]')];
  const i = items.indexOf(document.activeElement);
  if (e.key==='ArrowDown') { e.preventDefault(); items[Math.min(items.length-1, i+1)].focus(); }
  else if (e.key==='ArrowUp') { e.preventDefault(); items[Math.max(0, i-1)].focus(); }
  else if (e.key==='Home') { e.preventDefault(); items[0].focus(); }
  else if (e.key==='End') { e.preventDefault(); items.at(-1).focus(); }
  else if (e.key==='Enter' || e.key===' ') { e.preventDefault(); document.activeElement.click(); }
  else if (e.key==='Escape' || e.key==='Tab') { closeProg(); if (e.key==='Escape') { e.preventDefault(); pbtn.focus(); } }
});
function showProg(k){
  curProg = k;
  pval.textContent = progLabel(A[k]);
  pmenu.querySelectorAll('[role="option"]').forEach(li => li.setAttribute('aria-selected', String(+li.dataset.phbK===k)));
  pbtn.setAttribute('aria-activedescendant', `phb-prog-opt-${k}`);
  const p = A[k];
  pv.innerHTML = `<div class="phb-prog-stats phb-prog-sum"><span class="phb-prog-stat"><small>Product</small>${esc(p.product)}</span><span class="phb-prog-stat"><small>Indication</small>${esc(p.indication)}</span><span class="phb-prog-stat"><small>Area</small>${esc(p.area)}</span><span class="phb-prog-stat"><small>Sponsor</small>${esc(p.sponsor)}</span><span class="phb-prog-stat"><small>Studies by phase</small>${p.phases.map(ph=>ph.studies.length).join(' / ')}</span><span class="phb-prog-stat"><small>Tasks</small>${p.phases.reduce((t,ph)=>t+ph.tasks.length,0)}</span></div>
  <div class="phb-atlas-legend">${Object.entries(GC).map(([g,c])=>`<span><i style="background:${c}"></i>${g}</span>`).join('')}</div>
  <div class="phb-phases">${p.phases.map((ph,pi) => `<details class="phb-phase"><summary class="phb-phase-sum"><span><h4>${ph.phase}</h4><div class="phb-studies">${ph.studies.length} ${ph.studies.length>1?'studies':'study'}: ${ph.studies.join(', ')}</div></span><span class="phb-phase-n">${ph.tasks.length} tasks</span></summary><div class="phb-phase-body">
    <div class="phb-ev-meter"><div class="phb-lab"><span>Files each task gets</span><b>${ph.files[0]===ph.files[1]?ph.files[0]:ph.files[0]+' to '+ph.files[1]}</b></div><div class="phb-track"><i style="left:${ph.files[0]/maxFiles*100}%;width:${Math.max(2,(ph.files[1]-ph.files[0])/maxFiles*100)}%"></i></div></div>
    <div class="phb-tgrid">${ph.tasks.map(t => `<div class="phb-tcard"><span class="phb-sw" style="background:${GC[t.group]}"></span><span class="phb-nm">${esc(t.skill)}<small>${esc(t.subgroup)}</small><span class="phb-tmeta"><b>${esc(t.pb)}</b> · ${esc(t.role)} · ${t.files} files</span></span></div>`).join('')}</div>
  </div></details>`).join('')}</div>`;
}
showProg(Math.max(0, A.findIndex(a => a.name==='Zeltravi')));

/* aggregates: performance summary */
const nm = m => LEVEL.includes(m) ? `<b>${mlogo(m)}${esc(m)}</b>` : mlogo(m)+esc(m);
$('#phb-perf').innerHTML = `<table class="phb-mini phb-wide"><tr><th>Model</th><th class="phb-n">Pass rate</th><th class="phb-n">95% interval</th><th class="phb-n">Mean score</th><th class="phb-n">95% interval</th><th class="phb-n">Credit for required criteria</th><th class="phb-n">Lost to penalties</th><th class="phb-n">Runs with a penalty</th></tr>${PASS.order.map(m => { const p = PASS.views.Overall[m], s = V.Overall[m], d = dec[m]; return `<tr><td>${nm(m)}</td><td class="phb-n"><b>${pct(p.s)}</b></td><td class="phb-n phb-muted">${pct(p.ci[0])} to ${pct(p.ci[1])}</td><td class="phb-n"><b>${f3(s.s)}</b></td><td class="phb-n phb-muted">${f3(s.ci[0])} to ${f3(s.ci[1])}</td><td class="phb-n">${f3(d.credit)}</td><td class="phb-n">${f3(d.penalty)}</td><td class="phb-n">${pct0(d.penalised)}</td></tr>`; }).join('')}</table>`;

/* aggregates: by kind of work */
let KM = 'pass';
function renderKind(){
  const get = (g,m) => KM==='pass' ? PASS.views[g][m].s : V[g][m].s;
  const shade = v => KM==='pass' ? Math.min(1, v/0.30) : Math.max(0, Math.min(1, (v-0.5)/0.4));
  $('#phb-bykind').innerHTML = `<table class="phb-mini phb-heat"><tr><th>Model</th>${KINDS.map(g=>`<th class="phb-n">${sw(g)}${esc(sentence(g))}</th>`).join('')}</tr>${PASS.order.map(m => `<tr><td>${nm(m)}</td>${KINDS.map(g => { const v = get(g,m); return `<td class="phb-n phb-c" style="background:color-mix(in srgb, var(--phb-accent) ${Math.round(4+30*shade(v))}%, transparent)">${KM==='pass'?pct(v):f3(v)}</td>`; }).join('')}</tr>`).join('')}</table>`;
  $('#phb-bykind-cap').innerHTML = KM==='pass' ? '<b>Table 4.</b> Share of runs that pass, by model and kind of work.' : '<b>Table 4.</b> Mean score by model and kind of work.';
}
$('#phb-kseg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $('#phb-kseg').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed', x===b)); KM = b.dataset.phbM; renderKind(); });
renderKind();

/* checks: where points are lost */
const L = Object.entries(D.failures).sort((a,b)=>b[1]-a[1]); const mx = L[0][1];
$('#phb-loss').insertAdjacentHTML('afterbegin', L.map(([k,v]) => `<div class="phb-loss-row ${k.startsWith('Penalty')?'phb-pen':''}"><span>${esc(k)}</span><div class="phb-bars"><i style="width:${v/mx*100}%"></i></div><span class="phb-v">${Math.round(v*100)}%</span></div>`).join(''));

/* walkthrough: traces and evidence images load on their own */
Promise.all([
  fetch(EXT + 'pharma-bench-traces.json').then(r => { if (!r.ok) throw new Error('PharmaBench traces failed to load (' + r.status + ')'); return r.json(); }),
  fetch(EXT + 'pharma-bench-keydocs.json').then(r => { if (!r.ok) throw new Error('PharmaBench evidence images failed to load (' + r.status + ')'); return r.json(); })
]).then(([TRACES, K]) => {
  /* walkthrough: one task, all models */
  const P = D.walkpick, W = D.walk;
  const clean = c => c.replace(/^(cd\s+[^;&]+(;|&&)\s*)+/, '').replace(/\/app\/attachments\/[0-9]{2}-[A-Z-]+\//g,'');
  const act = (fn,c) => fn==='todowrite'?'Plan':(fn==='write'||/cat >|response\.md/.test(c))?'Write':/diff /.test(c)?'Compare':/pdftotext|pypdf|PdfReader|sed -n/.test(c)?'Read':/pandas|import pd|lifelines|numpy|statsmodels|\.py/.test(c)?'Analyze':/grep|find |ls /.test(c)?'Search':'Run';
  const nStrong = W.filter(w=>w.strong).length;
  const nCalls = i => TRACES[i].filter(x=>x.fn).length;
  const STEPS = [
    ['01','The request', () => `<p class="phb-request">${esc(T.prompt)}</p><p class="phb-prose" style="font-size:17px">Quoted as written. ${T.files} files come with it, and nothing in the request says which of them carry the answer.</p>`],
    ['02','The evidence', () => `<p class="phb-prose" style="margin:0 0 20px;font-size:16.5px">These are the ${T.nkey} files marked Key in the explorer above, out of the ${T.files} the agent receives. The prescriber guide and patient card are not among them.</p>
      <div class="phb-ev-grid"><div><div class="phb-doc phb-crop"><img alt="Page 12 of the kelvaparib risk management plan, listing the important identified risks" src="${K.rmp_risks}"></div><div class="phb-doc-cap"><code>risk-management-plan-kelvaparib.pdf</code>, page 12 of ${K.rmp_pages}. The three important identified risks, with how often each occurred across the program and how severe the cases were.</div></div>
      <div><div class="phb-doc phb-crop phb-full"><img alt="Page 15 of the risk management plan, Part V on risk minimization measures" src="${K.rmp_part5}"></div><div class="phb-doc-cap">Page 15 of the same plan. Extra measures are proposed only where routine measures would be insufficient, and each must come with a way to measure whether it works.</div>
      <div class="phb-doc phb-crop" style="margin-top:18px"><img alt="Section 4.4 of the kelvaparib product information" src="${K.pi_warn}"></div><div class="phb-doc-cap"><code>product-information-kelvaparib.pdf</code>, page 3 of ${K.pi_pages}. The routine measures: blood count monitoring, dose rules and when to stop treatment. The MDS/AML count is given as a percentage with no denominator.</div></div></div>`],
    ['03','The runs', () => `<p class="phb-prose" style="margin:0 0 18px;font-size:16.5px">Each model ran the task 3 times. ${nStrong} of ${W.length} models average 0.70 or higher, which we mark strong; ${W.length-nStrong} fall below and are marked weak. ${(n => n ? `${n} of the ${W.length*3} runs earn full marks and pass.` : `None of the ${W.length*3} runs earns full marks.`)(W.reduce((a,w)=>a+w.runs.filter(r=>r>=0.999).length,0))} Pick a model to see its run closest to its average. Click any step to see the full tool call and what it returned.</p>
      <div class="phb-mrow phb-mrow-head" aria-hidden="true"><span class="phb-nm">Model</span><span>Result</span><span class="phb-dots-h"><span>0</span><span class="phb-th">0.70 = strong</span><span>1.0</span></span><span class="phb-sc">Average</span><span></span></div>
      <div class="phb-models" id="phb-models">${W.map((w,i)=>[w,i]).sort((a,b)=> b[0].mean-a[0].mean).map(([w,i])=>`<button class="phb-mrow" data-phb-i="${i}" aria-pressed="false"><span class="phb-nm">${mlogo(w.model)}${esc(w.model)}</span><span class="phb-tag ${w.strong?'phb-strong':'phb-weak'}">${w.strong?'Strong':'Weak'}</span><span class="phb-dots" title="3 runs: ${w.runs.map(f2).join(', ')}">${w.runs.map(r=>`<i class="${r<0.7?'phb-w':''}" style="left:${r*100}%" title="${f2(r)}"></i>`).join('')}</span><span class="phb-sc">${f2(w.mean)}<small>${w.runs.filter(r=>r>=0.999).length} of 3 pass</small></span><span class="phb-go"></span></button>`).join('')}</div>
      <p class="phb-cap">Each square is one run, scored 0 to 1; green is 0.70 or higher. The average is over the three runs.</p>`],
    ['04','The grade', () => `<p class="phb-prose" style="margin:0 0 18px;font-size:16.5px">The table shows, for each model, its three scores and the grading of the run closest to its average: how many of the ${W[0].pos_total} required criteria it met and how many of the ${W[0].pen_total} penalties it triggered. Only a run with every requirement met and no penalty passes. The most common miss on this task: ${P.guide_n} of the ${P.n_runs} runs describe what the prescriber guide or patient card contains, though neither was supplied.</p>
      <div style="overflow-x:auto"><table class="phb-gtable"><tr><th>Model</th><th class="phb-r">Average</th><th>Three runs</th><th>Required criteria met</th><th>Penalties triggered</th><th class="phb-r">Tool calls</th><th class="phb-r">Minutes</th></tr>${W.map((w,i)=>`<tr><td>${mlogo(w.model)}<b>${esc(w.model)}</b></td><td class="phb-r">${f2(w.mean)}</td><td class="phb-runs3">${w.runs.map(r=>`<span class="phb-run ${r<0.7?'phb-w':''}">${f2(r)}</span>`).join('')}</td><td><span class="phb-pipcell"><span class="phb-pips">${Array.from({length:w.pos_total},(_,k)=>`<i class="${k<w.pos_met?'phb-on':''}"></i>`).join('')}</span><b>${w.pos_met}</b><small>/${w.pos_total}</small></span></td><td><span class="phb-pipcell"><span class="phb-pips">${Array.from({length:w.pen_total},(_,k)=>`<i class="${k<w.pen_hit?'phb-pen':''}"></i>`).join('')}</span><b>${w.pen_hit}</b><small>/${w.pen_total}</small></span></td><td class="phb-r phb-plain">${nCalls(i)}</td><td class="phb-r phb-plain">${w.minutes.toFixed(1)}</td></tr>`).join('')}</table></div>
      <p class="phb-cap"><b>Table 6.</b> Task ${T.pb}, all ten models. Criteria, penalties, tool calls and minutes are for the run closest to each model's average.</p>
      <div class="phb-quotes"><div class="phb-qcard phb-strong"><div class="phb-who"><span class="phb-tag phb-strong">Strong</span>${esc(P.strong.model)}, run scoring ${f2(P.strong.reward)}</div><blockquote class="phb-q">${esc(P.strong.quote)}</blockquote></div>
      <div class="phb-qcard phb-weak"><div class="phb-who"><span class="phb-tag phb-weak">Weak</span>${esc(P.weak.model)}, run scoring ${f2(P.weak.reward)}</div><blockquote class="phb-q">${esc(P.weak.quote)}</blockquote></div></div>
      <details class="phb-rubric"><summary class="phb-rubric-sum"><span>What the rubric checks</span></summary><div class="phb-checks2"><div><h4 class="phb-checks-h">What the answer must contain</h4><ul class="phb-checks">${P.checks.filter(c=>!/^Penaliz/.test(c)).map(c => `<li><i>+</i><span>${esc(c)}</span></li>`).join('')}</ul></div>
      <div><h4 class="phb-checks-h">What is penalized</h4><ul class="phb-checks">${P.checks.filter(c=>/^Penaliz/.test(c)).map(c => `<li class="phb-pen"><i>−</i><span>${esc(c.replace(/^Penalized:\s*/,''))}</span></li>`).join('')}</ul></div></div></details>`],
  ];
  const stepsEl = $('#phb-steps'), stage = $('#phb-stage');
  function renderReplay(i){
    const w = W[i], tr = TRACES[i], term = $('#phb-term');
    $('#phb-rp-title').textContent = `${w.model}, run scoring ${f2(w.rep)}`;
    $('#phb-rp-sum').textContent = `${nCalls(i)} tool calls · ${w.minutes} min · ${Math.round(w.answer_chars/1000)}k-character answer`;
    const sumLine = (fn,c) => { if (fn==='todowrite'){ try { const td=JSON.parse(c).todos||[]; return `${td.length} items: ${td.map(t=>t.content).join('; ')}`; } catch(e){} } const ls=c.split('\n').map(l=>l.trim()).filter(l=>l && !/^[{}\[\]]$/.test(l)); return ls[0] && ls[1] && /(-c\s*["']|<<\s*['"]?\w+['"]?)$/.test(ls[0]) ? `${ls[0]} ${ls[1]}` : (ls[0]||c); };
    const ts = t => t==null ? '' : Math.floor(t/60)+':'+String(t%60).padStart(2,'0');
    term.innerHTML = tr.map(x => {
      if (!x.fn) return `<div class="phb-tr-note"><span class="phb-t">${ts(x.t)}</span><p>${esc(x.note)}</p></div>`;
      const c = clean(x.call);
      return `<details class="phb-tr"><summary><span class="phb-t">${ts(x.t)}</span><span class="phb-fn">${act(x.fn,c)}</span><span class="phb-cmd">${esc(sumLine(x.fn,c))}</span></summary>
        ${x.note?`<p class="phb-tr-msg">${esc(x.note)}</p>`:''}<div class="phb-tr-lab">Call · ${esc(x.fn)}</div><pre>${esc(c)}</pre><div class="phb-tr-lab">Result</div><pre class="phb-out">${esc(x.out)||'<i>(no output)</i>'}</pre></details>`;
    }).join('');
    term.scrollTop = 0;
  }
  function showRuns(){
    stage.innerHTML = STEPS[2][2]();
    stage.scrollTop = 0;
    $('#phb-models').addEventListener('click', e => { const b = e.target.closest('.phb-mrow'); if(!b) return; showRun(+b.dataset.phbI); });
  }
  function showRun(i){
    curModel = i;
    stage.innerHTML = `<div class="phb-replay" id="phb-replay"><div class="phb-replay-top"><button type="button" class="phb-btn-s" id="phb-view-all">← Back</button></div><div class="phb-replay-head"><h4 id="phb-rp-title"></h4><span id="phb-rp-sum"></span></div><div class="phb-trace" id="phb-term"></div></div>`;
    renderReplay(i);
    stage.scrollTop = 0;
    $('#phb-view-all').addEventListener('click', showRuns);
  }
  function showStep(i){
    curStep = i;
    stepsEl.querySelectorAll('.phb-step-btn').forEach((b,j)=>b.setAttribute('aria-selected', i===j));
    if (i===2) showRuns();
    else stage.innerHTML = STEPS[i][2]();
    stage.querySelectorAll('.phb-doc.phb-crop:not(.phb-full)').forEach(d => { const b = document.createElement('button'); b.type = 'button'; b.className = 'phb-doc-x'; b.textContent = 'Expand document'; b.onclick = () => { const o = d.classList.toggle('phb-open'); b.textContent = o ? 'Collapse document' : 'Expand document'; }; d.append(b); });
    stage.querySelectorAll('.phb-datatable,.phb-term,.phb-tablewrap').forEach(e => scrollHint(e, 'x'));
  }
  STEPS.forEach((s,i) => { const b = el('button', {class:'phb-step-btn', role:'tab', 'aria-selected': i===0}, s[1]); b.onclick = () => showStep(i); stepsEl.append(b); });
  showStep(0);
  const panel = document.getElementById('phb-stage');
  if (panel) panel.removeAttribute('aria-busy');
}).catch(err => {
  console.error(err);
  const panel = document.getElementById('phb-stage');
  if (panel) { panel.removeAttribute('aria-busy'); panel.innerHTML = '<p class="phb-async-loading">This task could not be loaded.</p>'; }
});

/* failure modes: strong and weak runs */
const ct = $('#phb-case-tabs'), cv = $('#phb-case-view');
const trialName = t => (D.atlas.find(a => a.id===t)||{}).name || t;
const ROLE = {'Biostatistician':'a biostatistician','Clinical Reviewer':'a clinical reviewer','Regulatory Affairs':'a regulatory affairs specialist','Medical Writer':'a medical writer','Safety Physician':'a safety physician'};
function showCase(k){
  curCase = k;
  ct.querySelectorAll('.phb-ctab').forEach((b,j)=>b.setAttribute('aria-selected', j===k));
  const p = SCs[k], s = p.strong, w = p.weak;
  const means = Object.entries(p.model_means).sort((a,b)=>b[1]-a[1]);
  const nRuns = Object.keys(p.model_pass).length*3;
  const nPass = Math.round(Object.values(p.model_pass).reduce((a,v)=>a+v*3,0));
  const at = p.attachments;
  const statusLabel = nPass ? `${nPass} of ${nRuns} pass` : 'No run passes';
  const resultDetail = `${nPass} of ${nRuns} runs earn full marks. Model averages run from ${f2(means[means.length-1][1])} to ${f2(means[0][1])}.`;
  const resultInfo = resultDetail ? `<button type="button" class="phb-info-i" aria-label="More about ${statusLabel}" aria-expanded="false" aria-controls="phb-result-tip" aria-describedby="phb-result-tip"><svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="8" cy="5" r="1" fill="currentColor"/><path d="M8 7.4V11.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></button><span class="phb-result-tip" id="phb-result-tip" role="tooltip">${resultDetail}</span>` : '';
  document.querySelectorAll('body>.phb-result-tip').forEach(n => n.remove());
  cv.innerHTML = `<article class="phb-case"><div class="phb-case-top phb-case-lead"><div><div class="phb-label" style="color:var(--phb-accent)">${esc(p.group)}${p.skill!==p.group?' · '+esc(p.skill):''} · ${esc(p.phase)}</div><h3 style="margin-top:8px">${esc(p.pb)} · ${esc(trialName(p.trial))}, study ${esc(p.study.split(' (')[0])}</h3>
      <div class="phb-case-meta"><span class="phb-pill">${at.total} files: ${at.pdf} PDFs and ${at.csv} datasets</span><span class="phb-pill">Written by ${esc(ROLE[p.expert_role]||p.expert_role)}</span></div>
      <p class="phb-sum">${esc(p.summary)}</p>
      </div>
    <div class="phb-case-right"><p class="phb-result-line"><span class="phb-tag ${nPass?'phb-strong':'phb-weak'}">${statusLabel}</span>${resultInfo}</p><div class="phb-runs-head"><span class="phb-label" style="color:var(--phb-muted)">All ${NW(Object.keys(p.model_means).length)} models, 3 runs each</span>${nPass?mseg():''}</div>${SM==='pass' && nPass
      ? (`<div class="phb-mlist phb-pass">${Object.entries(p.model_pass).sort((a,b)=>(b[1]-a[1])||(p.model_means[b[0]]-p.model_means[a[0]])).map(([m,v])=>`<div><span>${mlogo(m)}${esc(m)}</span><span class="phb-bar"><i class="phb-p" style="width:${v*100}%;${mstyle(m)}"></i></span><span class="phb-s">${Math.round(v*3)} of 3</span></div>`).join('')}</div><p class="phb-cap">Runs that earn full marks, out of 3.</p>`)
      : `<div class="phb-mlist">${means.map(([m,v])=>`<div><span>${mlogo(m)}${esc(m)}</span><span class="phb-bar"><i style="width:${v*100}%;${mstyle(m)}"></i></span><span class="phb-s">${f2(v)}</span><span class="phb-tag ${+f2(v)>=0.7?'phb-strong':'phb-weak'}">${+f2(v)>=0.7?'Strong':'Weak'}</span></div>`).join('')}</div><p class="phb-cap">Average score over 3 runs. Strong means 0.70 or higher.</p>`}</div></div><details class="phb-case-fold"><summary class="phb-case-fold-sum">Documents and why they differ</summary>
    <div class="phb-pair"><div class="phb-strong"><div class="phb-who"><span class="phb-tag phb-strong">Strong run</span><b>${esc(s.model)}</b><span>${f2(s.reward)}</span></div><p class="phb-what">${esc(s.what_it_did)}</p>${s.excerpts.slice(0,2).map(x=>`<blockquote class="phb-q">${quote(x)}</blockquote>`).join('')}</div>
    <div class="phb-weak"><div class="phb-who"><span class="phb-tag phb-weak">Weak run</span><b>${mlogo(w.model)}${esc(w.model)}</b><span>${f2(w.reward)}</span></div><p class="phb-what">${esc(w.judge_paraphrase)}</p>${w.excerpts.slice(0,2).map(x=>`<blockquote class="phb-q">${quote(x)}</blockquote>`).join('')}</div></div>
    <div class="phb-case-top"><div class="phb-case-docs"><div class="phb-label phb-docs-h">Documents the answer depends on</div><ul class="phb-docs-needed">${p.documents_needed.map(d=>`<li>${esc(d)}</li>`).join('')}</ul></div></div>
    <div class="phb-diff"><b>Why the scores differ</b>${esc(p.contrast)}</div>
    <div class="phb-checks-d"><h4>What the rubric checks on this task (paraphrased)</h4><div class="phb-rubric-grid"><div><div class="phb-rubric-h">Required</div><ul class="phb-checks">${p.what_experts_check.filter(c=>!/^Penaliz/.test(c)).map(c=>`<li><i>✓</i><span>${esc(c)}</span></li>`).join('')}</ul></div><div><div class="phb-rubric-h phb-pen">Penalized</div><ul class="phb-checks">${p.what_experts_check.filter(c=>/^Penaliz/.test(c)).map(c=>`<li class="phb-pen"><i>−</i><span>${esc(c.replace(/^Penalized:\s*/,''))}</span></li>`).join('')}</ul></div></div></div></details></article>`;
  const tipNode = cv.querySelector('.phb-result-tip');
  if (tipNode) document.body.appendChild(tipNode);
}
let tipBtn = null, tipPin = false;
const tipEl = btn => document.getElementById(btn.getAttribute('aria-controls'));
function tipPlace(btn){
  const tip = tipEl(btn);
  if (!tip || !btn.isConnected) return;
  const card = btn.closest('.phb-case');
  const r = btn.getBoundingClientRect();
  if (card) {
    const c = card.getBoundingClientRect();
    if (r.bottom < c.top + 4 || r.top > c.bottom - 4) { tip.classList.remove('phb-on'); btn.setAttribute('aria-expanded', 'false'); return; }
  }
  if (tip.parentElement !== document.body) document.body.appendChild(tip);
  const w = tip.offsetWidth, h = tip.offsetHeight;
  let left = r.left + r.width / 2 - w / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
  let top = r.top - h - 8;
  if (top < 8) top = r.bottom + 8;
  tip.style.left = Math.round(left) + 'px';
  tip.style.top = Math.round(top) + 'px';
  tip.classList.add('phb-on');
  btn.setAttribute('aria-expanded', 'true');
  tipBtn = btn;
}
function tipHide(force){
  if (!tipBtn) return;
  if (tipPin && !force) return;
  const tip = tipEl(tipBtn);
  if (tip) tip.classList.remove('phb-on');
  if (tipBtn.isConnected) tipBtn.setAttribute('aria-expanded', 'false');
  tipBtn = null;
  tipPin = false;
}
cv.addEventListener('mouseover', e => { const b = e.target.closest('.phb-info-i'); if (b) tipPlace(b); });
cv.addEventListener('mouseout', e => { const b = e.target.closest('.phb-info-i'); if (!b || b.contains(e.relatedTarget) || tipPin) return; if (b === tipBtn) tipHide(true); });
cv.addEventListener('focusin', e => { const b = e.target.closest('.phb-info-i'); if (b) tipPlace(b); });
cv.addEventListener('focusout', e => { const b = e.target.closest('.phb-info-i'); if (b && b === tipBtn) tipHide(true); });
cv.addEventListener('click', e => { const b = e.target.closest('.phb-info-i'); if (!b) return; if (tipPin && tipBtn === b) tipHide(true); else { tipPin = true; tipPlace(b); } });
document.addEventListener('click', e => { if (!tipPin || e.target.closest('.phb-info-i')) return; tipHide(true); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && tipBtn) tipHide(true); });
window.addEventListener('resize', () => { if (tipBtn && tipBtn.isConnected) tipPlace(tipBtn); else tipHide(true); });
document.addEventListener('scroll', () => { if (tipBtn) tipHide(true); }, {passive:true, capture:true});
SCs.forEach((p,k) => { const b = el('button', {class:'phb-ctab', role:'tab', 'aria-selected': k===0}, `<span class="phb-g">${esc(sentence(p.group))}</span><b>${esc(p.short_title)}</b><span class="phb-g" style="display:block;margin-top:6px">${esc(p.pb)}</span>`); b.onclick = () => showCase(k); ct.append(b); });
showCase(0);

/* usability: answer length and penalties */
const maxC = Math.max(...ORDER.map(m=>dec[m].chars)), maxP = Math.max(...ORDER.map(m=>dec[m].penalty));
$('#phb-usab').innerHTML = `<table class="phb-mini"><tr><th>Model</th><th>Median answer length</th><th class="phb-n">Runs with a penalty</th><th>Lost to penalties</th></tr>${PASS.order.map(m => { const d = dec[m]; return `<tr><td>${nm(m)}</td><td><span class="phb-bv"><span class="phb-ubar"><i style="width:${d.chars/maxC*100}%;${mstyle(m)}"></i></span><span>${Math.round(d.chars/1000)}k characters</span></span></td><td class="phb-n">${pct0(d.penalised)}</td><td><span class="phb-bv"><span class="phb-ubar"><i class="phb-pen" style="width:${d.penalty/maxP*100}%"></i></span><span>${f3(d.penalty)}</span></span></td></tr>`; }).join('')}</table>`;

/* scroll hints: gradient edge instead of scrollbars */
document.querySelectorAll('.phb-tablewrap,.phb-tbl-scroll').forEach(e => scrollHint(e, 'x'));
document.querySelectorAll('.phb-tabs,.phb-steps').forEach(e => scrollHint(e, 'x', true));
document.querySelectorAll('#phb-xp-list,.phb-stage,.phb-case').forEach(e => scrollHint(e, 'y'));
if (window.matchMedia('(max-width:640px)').matches) document.querySelectorAll('.phb-case-top:not(.phb-case-lead)').forEach(e => scrollHint(e, 'y'));
})();
