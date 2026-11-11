# Data model decisions (Prometheus)

Agreed decisions for how Ember Data models declare relationships.

| Field | Value |
|-------|-------|
| Status | Accepted |
| Scope | Every `belongsTo` / `hasMany` in `app/models` |
| Primary code | `app/models/*.js`, `tests/unit/models/relationship-options-test.js` |

---

## How to use this file

- Add a decision whenever relationship behaviour is agreed or changed.
- Record Prometheus-owned choices only.

---

## Architecture decisions

### D-001 — Every relationship declares `async` and `inverse` explicitly

| | |
|---|---|
| Status | Accepted |
| Decision | Every `belongsTo` and `hasMany` passes both options: `{ async: true\|false, inverse: '<name>'\|null }`. Nothing is left to Ember Data's implicit inverse discovery. |
| Rationale | Ember Data 4.x deprecates implicit inverses and the default `async`, and 5.x removes them. Implicit discovery silently pairs relationships (or fails to) when a model gains a second relationship to the same type. Explicit options make the graph readable from the model file and stable. |
| Implications | A new relationship is not done until both options are set. A unit test (`relationship-options-test.js`) checks every model; it fails on a missing option or an inverse that does not point back. |

### D-002 — `async: true` is the default; `async: false` only for data always side-loaded

| | |
|---|---|
| Status | Accepted |
| Decision | Use `async: true` (the relationship returns a promise proxy, loaded on demand). Use `async: false` only when the API always includes the related records in the same response (today: `agent.user`, `agent.sponsor`, `milestone.issues`, `user.aclPermissions`). |
| Rationale | A sync relationship throws if the record is not in the store. That is acceptable only where the load is guaranteed by the request (`rels`/include). |
| Implications | Code reading a sync relationship must have requested it with `rels`. Do not switch a relationship to sync to avoid awaiting. |

### D-003 — Inverses are declared as pairs; `inverse: null` for one-way links

| | |
|---|---|
| Status | Accepted |
| Decision | When both sides exist, each names the other (`project.members` ↔ `user.projects`). When the other side has no matching relationship (for example `createdBy`, `modifiedBy`), use `inverse: null`. |
| Rationale | A one-sided inverse makes Ember Data update a relationship that does not exist, or leave the other side stale after a save or a Hermes live update. |
| Implications | Renaming a relationship means updating its inverse's option in the same change. |
