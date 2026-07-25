# Update Benchmarks CMS

Copy this prompt (or `@src/research/prompts/update-benchmarks-cms.md`) when updating leaderboard data in Webflow Benchmarks CMS.

---

## Prompt (paste / adapt)

```
Update Benchmarks CMS using the local snapshot workflow.

CSV / score mapping:
- prospera → tax
- quantis → finance
- warren → legal
- spectra → medical

Scores in CSV are 0–1 (e.g. 0.541 → 54.1%). Use Best@3 = best_at_3, Mean = mean_of_task_means (or mean).

Do this:
1. Fetch live CMS (or use benchmarks-cms.original.json if fresh) as the baseline.
2. Edit only src/research/benchmarks-cms.json — fields: idd, code, disclaimer, models.
3. In each affected item’s `code` field: update rows, keep sorted by score desc, set lastUpdated to today (e.g. "July 19, 2026").
4. Update `models` to match row count on the default tab. Update `disclaimer` only if asked (e.g. add a new model name to the “new evaluations” list).
5. Write compare copies for manual review:
   - src/research/benchmarks-cms.original.json  (live / before)
   - src/research/benchmarks-cms.json           (after)
6. Diff and share a short summary (lastUpdated, Inkling/name changes, scores, models, disclaimer).
7. Do NOT push to Webflow until I say “push” / “publish”.
8. When I say push: update_collection_items (code, disclaimer, models-2) then publish_collection_items for changed idds only.
```

---

## Workflow checklist

1. **Baseline** — pull live Benchmarks CMS → `benchmarks-cms.original.json`
2. **Edit** — apply changes in `benchmarks-cms.json` only (`idd`, `code`, `disclaimer`, `models`)
3. **Code field rules**
   - Embed shape: `<div data-rt-embed-type='true'><script>…</script></div>`
   - Key = `idd` (`window.benchmarks_data["tax"]`, etc.)
   - Sort rows highest score first
   - Bump `lastUpdated` to **today** for changed benches
4. **Models** — CMS field slug is `models-2`; local JSON key is `models`
5. **Compare** — summarize before/after; wait for approval
6. **Push** — Webflow MCP update + publish (CMS items only, not full site publish)

---

## Webflow IDs

| | |
|---|---|
| Site | `6a04bd23eb9d40f76dac1249` |
| Collection (Benchmarks) | `6a157a0ef62f4dbfc505b3de` |

### Item IDs by `idd`

| idd | item id |
|---|---|
| tax | `6a15c874a30db54e4610ca6b` |
| finance | `6a15c84b319dd74f358fb072` |
| legal | `6a15c860c76a18782f75926b` |
| medical | `6a39165461c6379b785ab77e` |
| contract | `6a32956112e57de9e6022849` |
| long-extraction | `6a43e020e6705e12239033cf` |

### Field slugs

| Local / display | CMS slug |
|---|---|
| IDD | `idd` |
| Code | `code` |
| Disclaimer | `disclaimer` |
| Models | `models-2` |

---

## Example one-liners

```
tax — replace Inkling (xhigh) with Inkling (medium): mean 0.202, best 0.266. Update lastUpdated to today. Diff then wait for push.
```

```
legal — add Kimi K3 (max) best 0.621 mean 0.541, bump models, add Inkling to disclaimer if missing. Diff then wait for push.
```

```
Push the benchmarks-cms.json changes to live Webflow CMS and publish those items.
```

---

## Files

| File | Role |
|---|---|
| `src/research/benchmarks-cms.json` | Working copy (source of truth for push) |
| `src/research/benchmarks-cms.original.json` | Live baseline for diffs |
| `src/research/research-inline.js` | Local/CDN leaderboard data — update only if asked |

---

## Notes

- Prefer editing **`benchmarks-cms.json`** for CMS work; don’t silently rewrite `research-inline.js` unless requested.
- Contract / long-extraction often stay untouched.
- CMS item publish ≠ full domain site publish.
- After push, confirm published item IDs in the reply.
