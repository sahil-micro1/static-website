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
    kimi: {
      alt: "Kimi",
      src: "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6a5a9a1a377f14a491e60444_kimi.png",
    },
    bm25: {
      alt: "BM25",
      src: "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6abd5e130437ca314d0a75d3_bm25.png",
    },
    "bge-dense": {
      alt: "BGE Dense",
      src: "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6abd5e130437ca314d0a75af_bge-dense.png",
    },
    local: {
      alt: "Local hybrid",
      src: "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6abd5e12e5e1c9562ef39209_local.png",
    },
    muse: {
      alt: "Muse",
      src: "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6ac965ffaf650a28033b1c1a_muse.png",
    },
    "grok-bot": {
      alt: "Grok Bot",
      src: "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6ac9660c2379790d5e8a29d2_grok-bot.png",
    },
    instinct: {
      alt: "Instinct",
      src: "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6ac9660b3065c35e77c84a39_instinct.png",
    },
    dots: {
      alt: "Dots",
      src: "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6acba266b4d5b0c81639d957_Rectangle%20828901%20(2).png",
    },
    hark: {
      alt: "Hark",
      src: "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6acba268d423991cbf7b0735_Rectangle%20828901%20(1).png",
    },
    deepseek: {
      alt: "DeepSeek",
      src: "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6ad7710aa9649e351fb19897_deepseek.png",
    },
    glm: {
      alt: "GLM",
      src: "https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6ad77482d06d7f0085c7129e_glm.png",
    },
  };

  const PREVIEW_COUNT = 3;
  const CARD_COUNT = 4;
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

  function isIndex(data) {
    return data?.kind === "index";
  }

  /** The one tab that carries the index overall score plus its benchmarks. */
  function indexSourceTab(data) {
    const tabs = data?.tabs || [];
    return tabs.find((tab) => tab && (tab.overall || tab.benchmarks)) || tabs[0] || null;
  }

  function indexViews(tab) {
    if (!tab) return [];
    const overall = tab.overall || { id: tab.id, label: tab.label };
    const benches = Array.isArray(tab.benchmarks) ? tab.benchmarks : [];
    return [
      {
        id: overall.id || tab.id || "overall",
        label: overall.label || tab.label || "Overall",
        metric: overall.metric || overall.label || "Composite",
        overall: true,
      },
      ...benches
        .filter((bench) => bench && bench.id)
        .map((bench) => ({
          id: bench.id,
          label: bench.label || bench.id,
          metric: bench.metric || bench.label || bench.id,
          url: bench.url || "",
          overall: false,
        })),
    ];
  }

  function scoreForView(row, view) {
    if (!row) return null;
    if (!view || view.overall) return row.score;
    const value = row.benchmarks ? row.benchmarks[view.id] : null;
    return value == null ? null : value;
  }

  function rowsForView(tab, view) {
    return (tab?.rows || [])
      .map((row) => ({ ...row, score: scoreForView(row, view) }))
      .filter((row) => Number.isFinite(Number(row.score)))
      .sort((a, b) => Number(b.score) - Number(a.score));
  }

  function indexTooltipLines(data, name, rank, view) {
    const source = indexSourceTab(data);
    const row = (source?.rows || []).find((item) => item.name === name);
    const active = view || indexViews(source)[0];
    return [
      {
        label: (active?.metric || active?.label || "Score") + ":",
        value: formatScore(scoreForView(row, active)),
      },
      { label: "Rank:", value: "Top " + rank },
    ];
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
      <img class="leaderboard-info-btn__icon" src="https://cdn.prod.website-files.com/6a04bd23eb9d40f76dac1249/6a5a8e801fc06019dc875cf2_Frame-hover.png" alt="" width="15" height="15" />
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

      const pad = 8;
      let left = anchor.right - panel.left + gap;
      let top = anchor.top - panel.top + (anchor.height - th) / 2;
      const fitsRight = left + tw <= panel.width - pad;
      const flipped = anchor.left - panel.left - tw - gap;

      if (!fitsRight && flipped >= pad) {
        left = flipped;
      } else if (!fitsRight) {
        left = Math.max(pad, Math.min(anchor.left - panel.left, panel.width - tw - pad));
        top = anchor.bottom - panel.top + gap;
      }

      root.tooltipEl.style.left = left + "px";
      root.tooltipEl.style.top = top + "px";
    }

    function show(rowEl, name, rank, animate) {
      const token = (showToken += 1);
      const lines =
        typeof root.tooltipLines === "function"
          ? root.tooltipLines(name, rank)
          : (root.data.tabs || [])
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

  function createLeaderboardFull(mountEl, data, options) {
    const cardMode = options?.card === true;
    const root = {
      toggleEl: mountEl.querySelector(".leaderboard-full__toggle"),
      updatedEl: mountEl.querySelector(".leaderboard-full__updated"),
      listEl: mountEl.querySelector(".leaderboard-full__list"),
      tooltipEl: mountEl.querySelector(".leaderboard-tooltip"),
      panelEl: mountEl.querySelector(".leaderboard-full__panel"),
      tabBarEl: mountEl.parentElement?.classList.contains("leaderboard-index")
        ? mountEl.parentElement.querySelector(":scope > .leaderboard-index__tabs")
        : null,
      data,
      activeTabId: null,
      hover: null,
    };

    if (!root.toggleEl || !root.listEl || !root.tooltipEl || !root.panelEl) return;
    if (!cardMode && !root.updatedEl) return;

    const indexMode = isIndex(data);
    const sourceTab = indexMode ? indexSourceTab(data) : null;
    const viewList = indexMode ? indexViews(sourceTab) : null;
    mountEl.classList.toggle("leaderboard-full--index", indexMode);

    if (!indexMode && !data?.tabs?.length) {
      root.listEl.innerHTML =
        '<li class="leaderboard-full__empty">No leaderboard data available.</li>';
      return;
    }

    if (indexMode && !viewList.length) {
      root.listEl.innerHTML =
        '<li class="leaderboard-full__empty">No leaderboard data available.</li>';
      return;
    }

    if (indexMode) {
      root.activeTabId =
        viewList.find((view) => view.id === data.defaultTab)?.id || viewList[0].id;
      root.tooltipLines = (name, rank) => {
        const view =
          viewList.find((item) => item.id === root.activeTabId) || viewList[0];
        return indexTooltipLines(data, name, rank, view);
      };
    } else {
      root.activeTabId = getDefaultTab(data)?.id || data.tabs[0].id;
    }

    function tabButtons() {
      return indexMode ? viewList : data.tabs;
    }

    function activeTab() {
      if (indexMode) {
        const view = viewList.find((item) => item.id === root.activeTabId) || viewList[0];
        return { ...view, rows: rowsForView(sourceTab, view) };
      }
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
      const allRows = activeTab()?.rows || [];
      const rows = cardMode ? allRows.slice(0, CARD_COUNT) : allRows;
      if (cardMode) {
        mountEl.style.setProperty("--model-count", String(rows.length));
      }

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
      const ranks = ranksForRows(allRows);
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

    function activeView() {
      return viewList.find((item) => item.id === root.activeTabId) || viewList[0];
    }

    function renderMetricChip() {
      const view = activeView();
      root.toggleEl.classList.add("leaderboard-full__toggle--static");
      root.toggleEl.innerHTML =
        `<span class="leaderboard-full__toggle-label">${escapeHtml(view?.metric || "")}</span>` +
        '<span class="leaderboard-full__toggle-thumb" aria-hidden="true"></span>';
    }

    function renderIndexTabs() {
      const bar = root.tabBarEl;
      if (!bar) return;
      bar.innerHTML = viewList
        .map(
          (view) =>
            `<button type="button" class="leaderboard-index__tab" role="tab" data-tab-id="${escapeHtml(view.id)}" aria-selected="${view.id === root.activeTabId}">${escapeHtml(view.label)}</button>`
        )
        .join("");
      bar.querySelectorAll(".leaderboard-index__tab").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (btn.dataset.tabId === root.activeTabId) return;
          root.activeTabId = btn.dataset.tabId;
          bar.querySelectorAll(".leaderboard-index__tab").forEach((tabBtn) => {
            tabBtn.setAttribute("aria-selected", String(tabBtn.dataset.tabId === root.activeTabId));
          });
          renderMetricChip();
          renderRows({ animate: true });
          syncIndexLink();
        });
      });
    }

    function renderTabs() {
      if (indexMode && !cardMode) return;
      const buttons = tabButtons();
      const single = buttons.length < 2;
      root.toggleEl.classList.toggle("leaderboard-full__toggle--static", single);

      if (single) {
        root.toggleEl.innerHTML =
          `<span class="leaderboard-full__toggle-label">${escapeHtml(buttons[0].label)}</span>` +
          '<span class="leaderboard-full__toggle-thumb" aria-hidden="true"></span>';
        return;
      }

      root.toggleEl.innerHTML =
        buttons
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

    function syncIndexLink() {
      if (!indexMode || cardMode) return;
      let link = mountEl.querySelector(":scope > .leaderboard-index__benchmark");
      if (!link) {
        link = document.createElement("a");
        link.className = "leaderboard-card__link leaderboard-index__benchmark";
        link.innerHTML = "<span>View full benchmark</span>";
        mountEl.appendChild(link);
      }
      const view = activeView();
      const url = view && !view.overall ? view.url : "";
      if (!url) {
        link.hidden = true;
        link.removeAttribute("href");
        return;
      }
      link.hidden = false;
      link.href = url;
    }

    if (!cardMode) {
      root.updatedEl.textContent = data.lastUpdated
        ? "Last updated " + data.lastUpdated
        : "";
    }
    if (indexMode && !cardMode) {
      renderIndexTabs();
      renderMetricChip();
      syncIndexLink();
    } else {
      renderTabs();
      paintTabs(false);
      thumbResizers.add(() => syncTabThumb(false));
    }
    renderRows({ animate: false });
  }

  function ensureCardShell(el) {
    el.classList.add("leaderboard-full", "leaderboard-card");
    if (!el.style.getPropertyValue("--model-count")) {
      el.style.setProperty("--model-count", String(CARD_COUNT));
    }
    if (el.querySelector(".leaderboard-full__list")) return;
    const url = el.getAttribute("data-benchmark-url") || "";
    const href = escapeHtml(url || "#");
    el.innerHTML = `<div class="leaderboard-full__header">
      <div class="leaderboard-full__toggle" role="group" aria-label="Score metric"></div>
    </div>
    <div class="leaderboard-full__panel">
      <ol class="leaderboard-full__list"></ol>
      <div class="leaderboard-tooltip" role="tooltip"></div>
    </div>
    <a class="leaderboard-card__link" href="${href}"><span>View full benchmark</span></a>`;
  }

  function createLeaderboardCard(mountEl, data) {
    ensureCardShell(mountEl);
    const url = mountEl.getAttribute("data-benchmark-url") || "";
    mountEl.querySelectorAll(".leaderboard-card__link").forEach((link) => {
      if (url) link.setAttribute("href", url);
      else link.hidden = true;
    });
    createLeaderboardFull(mountEl, data, { card: true });
  }

  function previewSource(data) {
    if (!isIndex(data)) {
      const tab = getDefaultTab(data);
      return { label: tab?.label || "", rows: tab?.rows || [] };
    }
    const source = indexSourceTab(data);
    const views = indexViews(source);
    const view = views.find((item) => item.id === data.defaultTab) || views[0] || null;
    return {
      label: view?.metric || view?.label || "",
      rows: view ? rowsForView(source, view) : [],
    };
  }

  /** Preview: default-tab label + top 3 rows + "View more". */
  function createLeaderboardPreview(mountEl, data) {
    const source = previewSource(data);
    const rows = source.rows;
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

    let labelEl = mountEl.querySelector(".leaderboard-preview__label");
    if (!labelEl) {
      labelEl = document.createElement("p");
      labelEl.className = "leaderboard-preview__label";
      mountEl.insertBefore(labelEl, listEl);
    } else if (labelEl.nextElementSibling !== listEl) {
      mountEl.insertBefore(labelEl, listEl);
    }
    const label = source.label || "";
    labelEl.textContent = label;
    labelEl.hidden = !label;

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
    moreEl.innerHTML = "<span>View more</span>";
    mountEl.appendChild(moreEl);

    const tooltipEl = document.createElement("div");
    tooltipEl.className = "leaderboard-tooltip";
    tooltipEl.setAttribute("role", "tooltip");
    mountEl.appendChild(tooltipEl);

    createHover(
      {
        listEl,
        tooltipEl,
        data: isIndex(data)
          ? { tabs: [{ id: "preview", label: source.label, rows }] }
          : data,
      },
      {
        rowSelector: ".leaderboard-preview__row",
        panelEl: mountEl,
        rows: preview,
      }
    );
  }

  function mount(selector, create) {
    document.querySelectorAll(selector).forEach((el) => {
      if (el.classList.contains("leaderboard-card")) return;
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

  function mountIndexes() {
    document.querySelectorAll(".leaderboard-index[data-benchmark-id]").forEach((wrap) => {
      const card = wrap.querySelector(":scope > .leaderboard-full");
      const id = wrap.getAttribute("data-benchmark-id");
      const data = getBenchmark(id);
      if (!card) return;
      if (!data) {
        const target = card.querySelector(".leaderboard-full__list") || card;
        target.innerHTML = `<p class="leaderboard-full__empty">No data found for benchmark id "${escapeHtml(id || "")}".</p>`;
        return;
      }
      createLeaderboardFull(card, data);
    });
  }

  function mountCards() {
    document.querySelectorAll(".leaderboard-card[data-benchmark-id]").forEach((el) => {
      const id = el.getAttribute("data-benchmark-id");
      const data = getBenchmark(id);
      if (!data) {
        ensureCardShell(el);
        const target = el.querySelector(".leaderboard-full__list") || el;
        target.innerHTML = `<p class="leaderboard-full__empty">No data found for benchmark id "${escapeHtml(id || "")}".</p>`;
        return;
      }
      createLeaderboardCard(el, data);
    });
  }

  function init() {
    mount(".leaderboard-full[data-benchmark-id]", createLeaderboardFull);
    mountIndexes();
    mountCards();
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
