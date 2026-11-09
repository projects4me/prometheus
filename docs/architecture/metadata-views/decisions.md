# Metadata-driven views decisions (Prometheus)

These are the agreed decisions on building views from the view metadata in `app/utils/metadata/metadata.js`.

| Field | Value |
|-------|-------|
| Status | Accepted |
| Scope | View metadata and the views built from it: navigation, dashboard widgets, list columns, ezSearch |
| Primary code | `app/utils/metadata/metadata.js`, `app/services/query-schema.js`, `app/utils/query/value-sources.js` |

---

## How to use this file

- Add a decision whenever we agree on or change how a view is described by metadata.
- Keep the format reference in [architecture.md](architecture.md). This file records why.
- Mark open questions separately so nobody treats them as settled policy.

---

## Architecture decisions

### D-001: Finish partly metadata-driven features as metadata

Where a feature is already partly metadata-driven and the change is small, we make it fully
metadata-driven instead of adding code for one page. A full metadata-driven architecture is the
direction. We take it step by step, one feature at a time, and do not rewrite everything at once.

### D-002: List search is declared in `views.<Module>.search`

A list view (the generic `app.module` list, or a module list on `controllers/prometheus/list.js`) gets
ezSearch only by declaring `views.<Module>.search`. Controllers and routes do not define search fields
or filters. `query-schema.load` returns `null` for a module without search, and the page renders no
search. The hard-coded `utils/query/schemas/issue.js` and `project.js` (aprom-4295) moved into the
metadata unchanged and were deleted (aprom-4323).

### D-003: Values come from named value sources, never literal lists

An `enum` or `user` field lists its values with `values: { source, ...params }`. The source is an entry
in the `VALUE_SOURCES` registry that loads through the store with the load context (e.g. `projectId`).
Static lists come from translations (`source: 'translation'`), so we never write a list of values in code.
Adding a value source is the only part of search that needs code.

### D-004: An unknown value source fails loudly in development

When a field names a source that is not registered, the load fails with a clear error (an Ember
`assert`) in development and tests. Production builds strip the assertion, and the field shows no values
instead of breaking the page.

### D-005: Metadata labels are translation keys

Labels in the metadata stay translation keys. They are translated where they are shown; for search,
that is in the `query-schema` service when it builds the schema. `getViewMeta` no longer translates the
`filters` view in place. That branch mutated the shared metadata, and no module declared `filters`.

### D-006: Field order is metadata order

The order of `fields` in `views.<Module>.search` is the order of the builder and of the suggestions.
Field ids are non-numeric string keys, so JavaScript keeps their insertion order.

### D-007: Relation fields that hold a user id use the user sources with `value: 'id'`

A field such as `votes.createdUser` stores a user id, not a name. Rather than a new field type or a
thread-specific source, the `members` and `users` sources take `value: 'id'`: the value is the id, the
label the name. The schema already resolves a label to its value, so nothing in ez-search knows about
the field. Two members with the same name are ambiguous when typed; the builder's value picker still
tells them apart.

---

## Open questions

- Loading the metadata from the server (`@todo` in `metadata.js`) is out of scope for now.
- Moving the Project and generic admin lists onto ezSearch is separate work. The generic list's old
  `setupQuery` still reads `views.<Module>.filters`, which no module declares.
