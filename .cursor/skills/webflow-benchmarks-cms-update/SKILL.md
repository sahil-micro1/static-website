---
name: webflow-benchmarks-cms-update
description: >-
  Update Webflow Benchmarks CMS via site skill benchmarks-cms-update. Use for
  score/CSV updates, adding/updating/removing model rows, disclaimer, or
  push/publish Benchmarks items.
---

# Benchmarks CMS

Load site skill **`benchmarks-cms-update`** (site `6a04bd23eb9d40f76dac1249`) via `search_instructions`. Follow it. Use the Webflow MCP for all CMS fetch, update, and publish. Obey `publish-safety` + `benchmarks-cms`.

```
Load site skill **benchmarks-cms-update** (site `6a04bd23eb9d40f76dac1249`) via `search_instructions`. Follow it. Use the Webflow MCP for all CMS fetch, update, and publish. Obey `publish-safety` + `benchmarks-cms`.
Diff in chat; push only when I say push.
```

## Example prompts

### 1. Add a new model from CSV

```
Load site skill **benchmarks-cms-update** (site `6a04bd23eb9d40f76dac1249`) via `search_instructions`. Follow it. Use the Webflow MCP for all CMS fetch, update, and publish. Obey `publish-safety` + `benchmarks-cms`.

Add Grok 4.7 (xhigh). Ignore spectra-v2; add results to tax, finance, and legal.
Update lastUpdated to today, bump models, add Grok 4.7 to the disclaimer if missing.
Diff then wait for push.
```

### 2. Update an existing model's scores from CSV

```
Load site skill **benchmarks-cms-update** (site `6a04bd23eb9d40f76dac1249`) via `search_instructions`. Follow it. Use the Webflow MCP for all CMS fetch, update, and publish. Obey `publish-safety` + `benchmarks-cms`.

Update existing Grok 4.7 (xhigh) scores. Do not add a new row. Ignore spectra-v2; update tax, finance, and legal only.
Keep the current name and icon. Re-sort by score desc. Update lastUpdated to today.
Do not change models or disclaimer unless a row is added or removed.
Diff then wait for push.
```

### 3. Remove a specific model

```
Load site skill **benchmarks-cms-update** (site `6a04bd23eb9d40f76dac1249`) via `search_instructions`. Follow it. Use the Webflow MCP for all CMS fetch, update, and publish. Obey `publish-safety` + `benchmarks-cms`.

Remove Grok 4.7 (xhigh) from tax, finance, and legal. Do not add or update any other rows.
Drop it from both Best@3 and Mean tabs, re-sort by score desc, and decrement models to match the default tab.
Remove Grok 4.7 from the disclaimer new-evaluations list if present. Update lastUpdated to today on changed benches only.
Diff then wait for push.
```
