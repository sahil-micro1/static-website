(() => {
  const ICONS = {
    claude: {
      alt: "Claude",
      src: "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6a5a7819fac77315251cefb0_claude.png",
    },
    openai: {
      alt: "OpenAI",
      src: "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6a5a7819c48f94fa5d90c96f_openai.png",
    },
    grok: {
      alt: "Grok",
      src: "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6a5a78198dc59e6cbd29fdd1_grok.png",
    },
    gemini: {
      alt: "Gemini",
      src: "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6a5a781990ac587600afee57_gemini.png",
    },
    meta: {
      alt: "Meta",
      src: "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6a5a78197846ac25a02e18ff_meta.png",
    },
    "thinking-machine": {
      alt: "Thinking Machines",
      src: "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6a5a7819a64b43f419713e14_thinking-machine.png",
    },
    reducto: {
      alt: "Reducto",
      src: "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6a5a7819970524ed10cde9fd_reducto.png",
    },
    extend: {
      alt: "Extend",
      src: "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6a5a781958dae98040648f58_extend.png",
    },
    "llama-extract": {
      alt: "LlamaExtract",
      src: "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6a5a78197687f41471c817e2_llama-extract.png",
    },
    "datalab-extract": {
      alt: "Datalab Extract",
      src: "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6a5a78193bf080de9d939f0c_datalab-extract.png",
    },
  };

  const PREVIEW_COUNT = 3;
  const BAR_EASE = "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)";
  const HOVER = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  let outsideBound = false;
  const thumbResizers = new Set();
  const hoverClears = new Set();

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatScore(score) {
    const n = Number(score);
    return Number.isFinite(n) ? n.toFixed(1) + "%" : "—";
  }

  function barWidth(score) {
    const n = Number(score);
    return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
  }

  function barTransform(score) {
    return "scaleX(" + barWidth(score) / 100 + ")";
  }

  function setBarFill(el, score) {
    if (!el) return;
    el.style.transition = "none";
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

  /** Competition ranks: ties share a rank, next skips (1, 2, 2, 4). */
  function ranksForRows(rows) {
    const ranks = new Array(rows.length);
    for (let i = 0; i < rows.length; ) {
      const key = formatScore(rows[i].score);
      let j = i + 1;
      while (j < rows.length && formatScore(rows[j].score) === key) j++;
      for (let k = i; k < j; k++) ranks[k] = i + 1;
      i = j;
    }
    return ranks;
  }

  function getIcon(style) {
    return ICONS[style] || null;
  }

  function getBenchmark(id) {
    return (window.benchmarks_data || {})[id] || null;
  }

  function getDefaultTab(data) {
    const tabs = data?.tabs || [];
    return tabs.find((t) => t.id === data.defaultTab) || tabs[0] || null;
  }

  function scoreByName(tab, name) {
    const row = (tab?.rows || []).find((r) => r.name === name);
    return row ? row.score : null;
  }

  function htmlToEl(html) {
    const wrap = document.createElement("div");
    wrap.innerHTML = html.trim();
    return wrap.firstElementChild;
  }

  function infoBtn(label) {
    return `<button type="button" class="leaderboard-info-btn" aria-label="Details for ${escapeHtml(label || "model")}">
      <svg class="leaderboard-info-btn__icon leaderboard-info-btn__icon--default" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="0.5" y="0.5" width="14" height="14" rx="7" stroke="white" stroke-opacity="0.1"/>
        <path d="M5.91406 4.33545L9.07859 7.49998L5.91406 10.6645" stroke="white" stroke-opacity="0.6" stroke-width="0.632906" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg class="leaderboard-info-btn__icon leaderboard-info-btn__icon--hover" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="15" height="15" rx="7.5" fill="white" fill-opacity="0.8"/>
        <rect x="0.5" y="0.5" width="14" height="14" rx="7" stroke="white" stroke-opacity="0.2"/>
        <path d="M5.91406 4.33545L9.07859 7.49998L5.91406 10.6645" stroke="#121212" stroke-width="0.632906" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>`;
  }

  function rowHtml(row, index, { block, lead, rank }) {
    const icon = getIcon(row.iconStyle);
    const r = Number(rank) || index + 1;
    const name = row.name || "";
    const rowClass = block + "__row";
    const iconMod = icon ? ` ${block}__icon--${row.iconStyle}` : "";
    const leadClass = lead && r === 1 ? ` ${rowClass}--lead` : "";

    return `<li class="${rowClass}${leadClass}" data-index="${index}" data-rank="${r}" data-name="${escapeHtml(name)}" data-score="${Number(row.score)}">
      <div class="${block}__meta">
        <div class="${block}__identity">
          <div class="${block}__icon${iconMod}">
            ${icon ? `<img src="${escapeHtml(icon.src)}" alt="${escapeHtml(icon.alt)}" width="20" height="20" />` : ""}
          </div>
          <p class="${block}__name">${escapeHtml(name)}</p>
          ${infoBtn(name)}
        </div>
        <p class="${block}__score">${formatScore(row.score)}</p>
      </div>
      <div class="${block}__track" aria-hidden="true">
        <div class="${block}__fill" style="transform: ${barTransform(row.score)}"></div>
      </div>
    </li>`;
  }

  function createHover(root, { rowSelector, panelEl, rows }) {
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
      root.listEl.querySelectorAll(rowSelector + ".is-active").forEach((el) => {
        el.classList.remove("is-active");
        el.querySelector(".leaderboard-info-btn")?.blur();
      });
      root.listEl.classList.remove("has-active");
      root.tooltipEl.classList.remove("is-visible");
    }

    function position(rowEl) {
      const panel = panelEl.getBoundingClientRect();
      const btn = rowEl.querySelector(".leaderboard-info-btn");
      const anchor = (btn || rowEl).getBoundingClientRect();
      const tw = root.tooltipEl.offsetWidth;
      const th = root.tooltipEl.offsetHeight;
      const gap = 4;

      let left = anchor.right - panel.left + gap;
      let top = anchor.top - panel.top + (anchor.height - th) / 2;

      if (left + tw > panel.width - 8) {
        left = anchor.left - panel.left - tw - gap;
      }

      left = Math.max(8, Math.min(left, panel.width - tw - 8));

      root.tooltipEl.style.left = left + "px";
      root.tooltipEl.style.top = top + "px";
    }

    function show(rowEl, name, rank, animate) {
      const token = (showToken += 1);
      const lines = (root.data.tabs || [])
        .map((tab) => ({
          label: tab.label + ":",
          value: formatScore(scoreByName(tab, name)),
        }))
        .concat([{ label: "Rank:", value: "Top " + rank }]);

      const wasVisible = root.tooltipEl.classList.contains("is-visible");
      root.tooltipEl.innerHTML = lines
        .map(
          (line) => `<div class="leaderboard-tooltip__row">
            <p class="leaderboard-tooltip__label">${escapeHtml(line.label)}</p>
            <p class="leaderboard-tooltip__value">${escapeHtml(line.value)}</p>
          </div>`
        )
        .join("");

      position(rowEl);
      // Avoid deferred show on touch — a later clear() can race with rAF and leave
      // the tooltip visible without the dimmed-row state.
      if (wasVisible || !animate || !HOVER) {
        if (token === showToken) root.tooltipEl.classList.add("is-visible");
      } else {
        requestAnimationFrame(() => {
          if (token !== showToken) return;
          root.tooltipEl.classList.add("is-visible");
        });
      }
    }

    function activate(rowEl, name, rank) {
      clearTimeout(leaveTimer);
      leaveTimer = null;
      const prev = root.listEl.querySelector(rowSelector + ".is-active");
      if (prev === rowEl) return;
      root.listEl.querySelectorAll(rowSelector + ".is-active").forEach((el) => {
        el.classList.remove("is-active");
      });
      rowEl.classList.add("is-active");
      root.listEl.classList.add("has-active");
      show(rowEl, name, rank, !prev);
    }

    function scheduleClear() {
      clearTimeout(leaveTimer);
      leaveTimer = setTimeout(clear, 60);
    }

    function openRow(rowEl) {
      const index = Number(rowEl.dataset.index);
      const row = rows[index];
      if (!row) return;
      const rank = Number(rowEl.dataset.rank) || index + 1;
      activate(rowEl, row.name, rank);
    }

    function toggleRow(rowEl) {
      if (rowEl.classList.contains("is-active")) clear();
      else openRow(rowEl);
    }

    hoverClears.add(clear);
    signal.addEventListener("abort", () => {
      hoverClears.delete(clear);
      clearTimeout(leaveTimer);
      leaveTimer = null;
    });

    root.listEl.querySelectorAll(rowSelector).forEach((rowEl) => {
      const btn = rowEl.querySelector(".leaderboard-info-btn");
      if (!btn) return;

      if (HOVER) {
        btn.addEventListener("mouseenter", () => openRow(rowEl), { signal });
        btn.addEventListener("mouseleave", scheduleClear, { signal });
        btn.addEventListener("focus", () => openRow(rowEl), { signal });
        btn.addEventListener("blur", scheduleClear, { signal });
      } else {
        btn.addEventListener(
          "click",
          (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleRow(rowEl);
          },
          { signal }
        );
      }
    });

    if (!HOVER && !outsideBound) {
      outsideBound = true;
      document.addEventListener("click", (e) => {
        if (e.target.closest(".leaderboard-info-btn")) return;
        hoverClears.forEach((fn) => fn());
      });
    }

    return { clear };
  }

  function createLeaderboardFull(mountEl, data) {
    const root = {
      toggleEl: mountEl.querySelector(".leaderboard-full__toggle"),
      updatedEl: mountEl.querySelector(".leaderboard-full__updated"),
      listEl: mountEl.querySelector(".leaderboard-full__list"),
      tooltipEl: mountEl.querySelector(".leaderboard-tooltip"),
      panelEl: mountEl.querySelector(".leaderboard-full__panel"),
      data,
      activeTabId: null,
      hover: null,
    };

    if (!root.toggleEl || !root.updatedEl || !root.listEl || !root.tooltipEl || !root.panelEl) {
      return;
    }

    if (!data?.tabs?.length) {
      root.listEl.innerHTML =
        '<li class="leaderboard-full__empty">No leaderboard data available.</li>';
      return;
    }

    root.activeTabId = getDefaultTab(data)?.id || data.tabs[0].id;

    function activeTab() {
      return data.tabs.find((t) => t.id === root.activeTabId) || data.tabs[0];
    }

    function syncTabThumb(animate = true) {
      const thumb = root.toggleEl.querySelector(".leaderboard-full__toggle-thumb");
      const active =
        root.toggleEl.querySelector(
          '.leaderboard-full__toggle-btn[aria-pressed="true"]'
        ) || root.toggleEl.querySelector(".leaderboard-full__toggle-label");
      if (!thumb || !active) return;

      if (!animate) thumb.style.transition = "none";
      thumb.style.width = active.offsetWidth + "px";
      thumb.style.transform = "translateX(" + active.offsetLeft + "px)";
      if (!animate) {
        void thumb.offsetWidth;
        thumb.style.transition = "";
      }
    }

    function paintTabs(animate = true) {
      root.toggleEl.querySelectorAll(".leaderboard-full__toggle-btn").forEach((btn) => {
        btn.setAttribute("aria-pressed", String(btn.dataset.tabId === root.activeTabId));
      });
      syncTabThumb(animate);
    }

    function renderRows({ animate = false } = {}) {
      root.hover?.clear();
      const rows = activeTab()?.rows || [];

      if (!rows.length) {
        root.listEl.innerHTML =
          '<li class="leaderboard-full__empty">No ranking data for this tab.</li>';
        return;
      }

      const existing = new Map(
        [...root.listEl.querySelectorAll(".leaderboard-full__row")].map((el) => [
          el.dataset.name,
          el,
        ])
      );
      const canAnimate = animate && existing.size > 0;
      const ranks = ranksForRows(rows);
      const pendingFills = [];

      const orderedEls = rows.map((row, i) => {
        let el = existing.get(row.name);
        if (!el) {
          el = htmlToEl(
            rowHtml(row, i, {
              block: "leaderboard-full",
              lead: true,
              rank: ranks[i],
            })
          );
        }

        const prevScore = Number(el.dataset.score);
        const nextScore = Number(row.score);
        el.dataset.index = String(i);
        el.dataset.rank = String(ranks[i]);
        el.dataset.score = String(nextScore);
        el.classList.toggle("leaderboard-full__row--lead", ranks[i] === 1);

        el.querySelector(".leaderboard-full__score").textContent =
          formatScore(nextScore);
        const fillEl = el.querySelector(".leaderboard-full__fill");
        setBarFill(fillEl, canAnimate ? prevScore : nextScore);
        if (canAnimate) pendingFills.push({ el: fillEl, score: nextScore });

        return el;
      });

      root.listEl.replaceChildren(...orderedEls);
      if (canAnimate) playBarFills(pendingFills);

      root.hover = createHover(root, {
        rowSelector: ".leaderboard-full__row",
        panelEl: root.panelEl,
        rows,
      });
    }

    function renderTabs() {
      const single = data.tabs.length < 2;
      root.toggleEl.classList.toggle("leaderboard-full__toggle--static", single);

      if (single) {
        root.toggleEl.innerHTML =
          `<span class="leaderboard-full__toggle-label">${escapeHtml(data.tabs[0].label)}</span>` +
          '<span class="leaderboard-full__toggle-thumb" aria-hidden="true"></span>';
        return;
      }

      root.toggleEl.innerHTML =
        data.tabs
          .map(
            (tab) =>
              `<button type="button" class="leaderboard-full__toggle-btn" data-tab-id="${escapeHtml(tab.id)}" aria-pressed="${tab.id === root.activeTabId}">${escapeHtml(tab.label)}</button>`
          )
          .join("") +
        '<span class="leaderboard-full__toggle-thumb" aria-hidden="true"></span>';

      root.toggleEl.querySelectorAll(".leaderboard-full__toggle-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (btn.dataset.tabId === root.activeTabId) return;
          root.activeTabId = btn.dataset.tabId;
          paintTabs(true);
          renderRows({ animate: true });
        });
      });
    }

    root.updatedEl.textContent = data.lastUpdated
      ? "Last updated " + data.lastUpdated
      : "";
    renderTabs();
    paintTabs(false);
    renderRows({ animate: false });
    thumbResizers.add(() => syncTabThumb(false));
  }

  /** Preview: top 3 rows + "+ N more" only (no title/description). */
  function createLeaderboardPreview(mountEl, data) {
    const tab = getDefaultTab(data);
    const rows = tab?.rows || [];
    const preview = rows.slice(0, PREVIEW_COUNT);
    const more = Math.max(0, rows.length - PREVIEW_COUNT);
    let listEl = mountEl.querySelector(".leaderboard-preview__list");

    if (!rows.length) {
      mountEl.innerHTML =
        '<p class="leaderboard-full__empty">No ranking data available.</p>';
      return;
    }

    if (!listEl) {
      listEl = document.createElement("ol");
      listEl.className = "leaderboard-preview__list";
      mountEl.appendChild(listEl);
    }

    const ranks = ranksForRows(rows);
    listEl.innerHTML = preview
      .map((row, i) =>
        rowHtml(row, i, {
          block: "leaderboard-preview",
          lead: true,
          rank: ranks[i],
        })
      )
      .join("");

    mountEl.querySelector(".leaderboard-preview__more")?.remove();
    mountEl.querySelector(".leaderboard-tooltip")?.remove();

    const moreEl = document.createElement("div");
    moreEl.className = "leaderboard-preview__more";
    if (!more) moreEl.hidden = true;
    moreEl.innerHTML = `<span>+ ${more} more</span>`;
    mountEl.appendChild(moreEl);

    const tooltipEl = document.createElement("div");
    tooltipEl.className = "leaderboard-tooltip";
    tooltipEl.setAttribute("role", "tooltip");
    mountEl.appendChild(tooltipEl);

    createHover(
      { listEl, tooltipEl, data },
      {
        rowSelector: ".leaderboard-preview__row",
        panelEl: mountEl,
        rows: preview,
      }
    );
  }

  function mount(selector, create) {
    document.querySelectorAll(selector).forEach((el) => {
      const id = el.getAttribute("data-benchmark-id");
      const data = getBenchmark(id);
      if (!data) {
        const target =
          el.querySelector(".leaderboard-full__list, .leaderboard-preview__list") ||
          el;
        target.innerHTML = `<p class="leaderboard-full__empty">No data found for benchmark id "${escapeHtml(id || "")}".</p>`;
        return;
      }
      create(el, data);
    });
  }

  function mountPreviews() {
    document.querySelectorAll("[data-benchmark-id]").forEach((wrap) => {
      if (wrap.classList.contains("leaderboard-full")) return;

      const mountEl = wrap.classList.contains("leaderboard-preview")
        ? wrap
        : wrap.querySelector(":scope > .leaderboard-preview");
      if (!mountEl) return;

      const id = wrap.getAttribute("data-benchmark-id");
      const data = getBenchmark(id);
      if (!data) {
        const target = mountEl.querySelector(".leaderboard-preview__list") || mountEl;
        target.innerHTML = `<p class="leaderboard-full__empty">No data found for benchmark id "${escapeHtml(id || "")}".</p>`;
        return;
      }
      createLeaderboardPreview(mountEl, data);
    });
  }

  function init() {
    mount(".leaderboard-full[data-benchmark-id]", createLeaderboardFull);
    mountPreviews();

    const syncThumbs = () => thumbResizers.forEach((fn) => fn());
    window.addEventListener("resize", syncThumbs);
    if (document.fonts?.ready) document.fonts.ready.then(syncThumbs);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
