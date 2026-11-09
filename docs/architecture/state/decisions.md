# Page state decisions (Prometheus)

Agreed decisions for how pages keep and load their state. The wiring is in [architecture.md](architecture.md).

| Field | Value |
|-------|-------|
| Status | Accepted |
| Scope | Pages with list, view or filter state (QuickLists, Task Board, Gantt Cal) |
| Primary code | `app/utils/state/async-resource.js`, `app/utils/state/list-loader.js`, `app/utils/state/url-state.js` |

---

## How to use this file

- Add a decision whenever page-state behaviour is agreed or changed.
- Record Prometheus-owned choices only.

---

## Architecture decisions

### D-001 — List and view params never refresh the route

| | |
|---|---|
| Status | Accepted |
| Decision | Query params of list and view state (`page`, `query`, filters, an open quick view) are declared with `refreshModel: false` (`UrlState.queryParamsConfig`). The controller's `UrlState.onChange` reloads the data in place. |
| Rationale | A route refresh re-runs the model hooks and re-renders the page; the list would flash and lose scroll and focus on every keystroke or page click. The URL stays bookmarkable and back/forward works through `onChange`. |
| Implications | The route seeds only the first load, with the same `buildRequest` as the controller. `resetController` returns the params to defaults silently on exit and project switch. |

### D-002 — The newest request wins

| | |
|---|---|
| Status | Accepted |
| Decision | Every `AsyncResource.run` takes a token; a response whose token is no longer the latest is dropped, as is anything after the owner is destroyed. `seed` and `reset` also drop loads still running. |
| Rationale | Quick successive changes (typing, paging) can answer out of order; the older answer must never replace the newer one. |
| Implications | Errors keep the previous value so the page shows old data with the error and `retry()`. Pages do not write their own loading flags or guard against late responses. |

### D-003 — Page by `limit + 1`, without totals

| | |
|---|---|
| Status | Accepted |
| Decision | `ListLoader` sends a plain `limit` (the page size); Gaia reads one extra row and links `meta.links.next`; `hasNext` reads that link. No count queries. |
| Rationale | Full reasoning and rejected options: [docs/architecture/lists/decisions.md](../lists/decisions.md), D-001 (aprom-4360). |
| Implications | Pass `@page`, `@limit` and `hasNext` to `QuickList`, and leave `@total` out. |
