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

### D-004 — Relationship state stays unique and local edits are never overwritten by a payload

| | |
|---|---|
| Status | Accepted |
| Decision | Code that adds to a `hasMany` goes through `utils/array/record-list.js` (or `utils/live/collection.js` for live updates), whose add helpers are idempotent: a record the list already holds, or one given twice, is added once. Payloads (Gaia and Mirage) list each related id once. A response that carries relationship linkage carries the state the request set; Mirage derives belongsTo links from the foreign-key attributes the way Gaia does (for example `issue.assignee` → `issue.assignedTo`). |
| Rationale | Ember Data 5.3 deprecates duplicate hasMany entries (`ember-data:deprecate-many-array-duplicates`, `ember-data:deprecate-non-unique-relationship-entries`) and the remote update that silently clears a local relationship edit (`ember-data:deprecate-relationship-remote-update-clearing-local-state`); 6.0 throws on duplicates and keeps the local edit. Saving a record often adds it to the inverse hasMany already (`project.memberships`, `issue.spent`), so a blind push after the save duplicated it. |
| Implications | Do not push into a ManyArray directly; use the helpers. Do not silence these deprecations in `app/deprecation-workflow.js`. Before reloading a record from a live event, save or roll back any unsaved relationship edit on it; today's reload paths (`idea.updated`, `comment.updated`) reload records the screen edits only through attributes. A Mirage handler that returns a relationship must return what the request set, not the factory default. |
