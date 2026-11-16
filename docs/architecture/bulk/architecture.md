# Bulk queries — Prometheus

`services/bulk.js` batches independent `store.query` calls into one
`POST /api/v1/bulk` request and still returns ordinary Ember Data records.

Gaia contract (limits, permissions, what it refuses): sibling repo
`gaia/docs/architecture/bulk/decisions.md`.

## When to use it

Use it when a route or service makes several **independent reads** whose
shape is known up front, for example the Task Board's lanes, Dashboard widgets
or the Gantt's milestones and issues. Each saved round trip matters most on
slow connections.

Don't use it for:

- a single query (plain `store.query` is simpler);
- a query that depends on another one's result (items can't refer to each
  other);
- writes (POST, PATCH, DELETE): out of scope for the client.

## Usage

```js
@service bulk;

let results = await this.bulk.query([
    { id: 'lane-new', modelName: 'issue', query: { query: '...', rels: 'assignedTo', limit: -1 } },
    { id: 'statuses', modelName: 'issuestatus', query: { sort: 'Issuestatus.sortOrder' } }
]);

results['lane-new'].records; // Ember Data records, already in the store
results['lane-new'].meta;    // the response meta, as on a store.query result
results.statuses.error;      // set instead of records when that item failed
```

`query` is the same options object the route would pass to `store.query`.
Ids must be unique within the call.

## How it works

| Step | Behaviour |
|---|---|
| URL | Each item's URL comes from the model's adapter (`buildURL(..., 'query')`, `sortQueryParams`, `ajaxOptions`), so it is exactly what `store.query` would send, made relative (`/api/v1/...`). |
| Transport | The batch goes through the application adapter's `ajax`, so token refresh, the 401 retry and the test waiter apply. |
| Results | Results are plain arrays of records plus the response `meta`, not live record arrays. A 2xx item is normalized by the model's serializer (`normalizeResponse(..., 'query')`) and pushed into the store. A non-2xx item becomes the adapter's error for that status (e.g. `ForbiddenError`) for that id only. |
| Limit | More items than `ENV.APP.bulkMaxRequests` (default 25, Gaia's `BULK_MAX_REQUESTS`) are split into several bulk requests, sent one after another (Gaia runs each batch sequentially under one PHP time limit), and the results merged. |
| Fallback | If a bulk request itself fails (403 because the role lacks `bulk.create`, a network error, a non-200 answer), its items and those of any later batch run as separate `store.query` calls in parallel and return the same shape; no further bulk request is tried in that call. One `console.warn` (with the error) per `query()` call. Errors while building the batch (before the request) propagate instead of falling back. |

The fallback keeps every screen working for roles without `bulk.create`; they
only lose the saved round trips. Each item is authorized by Gaia like a
direct call, so the service never widens what a user can read.

## Tests

- Unit: `tests/unit/services/bulk-test.js`.
- Mirage: `mirage/route-handlers/bulk.js` answers each GET item with the
  handler Mirage registered for its URL, so acceptance tests see the same data
  as separate calls.
