# List paging decisions (Prometheus)

How Prometheus pages lists. Gaia's list endpoints are out of scope here.

| Field | Value |
|-------|-------|
| Status | Accepted |
| Scope | Lists paged with `QuickList` |
| Primary code | `app/utils/quick-list/page-window.js`, `app/components/quick-list/pagination.*`, `app/routes/app/project/idea.js` |

---

## How to use this file

- Add a decision whenever list paging behaviour is agreed or changed.
- Record Prometheus-owned choices only.

---

## Architecture decisions

### D-001 — Page without totals: Gaia reports the next page

| | |
|---|---|
| Status | Accepted (2026-11-08) |
| Context | Gaia's list response has no total (`meta.count` is the rows of the page). The idea browser counted the loaded ideas, so `@total` never passed 20 and the pagination stayed hidden. |
| Decision | Prometheus never asks for totals and runs no count queries to page. (The one remaining count, the archived-ideas footer toggle, is not a paging count.) It sends `page` and a plain `limit` (20). Gaia reads `limit + 1` rows itself, computes the offset from the original limit, drops the extra row and adds `meta.links.next` only when it came back. `hasNextPage(meta)` reads that link. |
| Why not totals | A count query (with joins) is wasted work for a ‹ › control. |
| Why not send `limit + 1` | Gaia derives the offset from the limit it receives (`(page - 1) * limit`), so `limit=21` would skip rows between pages and Gaia would add its own extra row. |
| How to use | Keep `hasNext = hasNextPage(response.meta)` in the controller and pass it to `QuickList` with `@page` and `@limit`, and leave `@total` out. Without a total the range reads `1-20 / 20+` while a next page exists and `21-25 / 25` on the last page. With `@total` the behaviour is unchanged. |
