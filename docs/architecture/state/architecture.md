# Page state architecture (Prometheus)

How a page keeps its state, so Task Board, Gantt Cal and every QuickList page use the same toolkit the same way.
The toolkit lives in `app/utils/state/`. Decisions and their reasons: [decisions.md](decisions.md).

## The toolkit

| Class | File | Owns |
|-------|------|------|
| `AsyncResource` | `app/utils/state/async-resource.js` | One async load: `value`, `error`, `isLoading`, `params`. `run(params)`, `retry()`, `reset()`, `seed(value, params)`. Only the newest `run` writes; no writes once the `owner` is destroying or destroyed. An error keeps the previous value. |
| `ListLoader` | `app/utils/state/list-loader.js` | One page of a list on top of `AsyncResource`: `items`, `hasNext`, `isLoading`, `error`, `params`, plus `run`, `retry`, `reset`, `seed`. `request(params)` is `buildRequest(params)` plus `limit`; it sends no totals (see [lists decisions](../lists/decisions.md), D-001). |
| `UrlState` | `app/utils/state/url-state.js` | Typed controller query params from a schema `{ default, type, resetOnChange }`: `values`, `set(changes)`, `isDefault(name)`, `resetToDefaults()`, `onChange((values, changedNames) => ...)`. Static helpers `queryParamsConfig(schema)` and `resetController(controller)`. |
| `Selection` | `app/utils/state/selection.js` | The selected rows of a list, kept across page changes: `ids`, `count`, `has(id)`, `toggle(id)`, `set(ids, on)`, `clear()`, `countIn(rows)`, `stateFor(rows)` (`none`/`some`/`all` of the rows given). Ids are strings. |

## URL or controller?

- **In the URL (`UrlState`)**: anything a user would bookmark, reload or go back to: list params (`query`, `page`,
  filters, sort, archived toggle) and view params such as an open quick view.
- **In the controller**: transient UI state that nobody expects to come back: hover, collapsed groups, open menus,
  draft input not yet applied.
- Loaded data is neither: it lives in an `AsyncResource` or `ListLoader` owned by the controller, derived from the URL state.

## How a page wires them

1. **Schema**: one schema object, shared by route and controller, declares the params, their types and defaults.
2. **Route**: `queryParams = UrlState.queryParamsConfig(schema)` (no route refresh). `model`/`setupController`
   seeds the first load: read the params, call `loader.request(params)` (the same `buildRequest` the controller uses), run
   the query, and `loader.seed(records, params)` in `setupController`. The first paint then needs no second request.
3. **Controller**: declares `queryParams` and defaults, owns the loaders (`owner: this`), builds
   `urlState = new UrlState(this, { schema, routeName })`, and registers
   `urlState.onChange((values) => this.loader.run(values))`. Templates and actions call `urlState.set({ page: 2 })`; they never
   call the loader for a param change.
4. **Reset**: the route's `resetController` calls `UrlState.resetController(controller)` (silent, so no load), and
   resets the loaders (`loader.reset()`). Ember calls `resetController` both on exit and when the model changes,
   which covers leaving the page and switching project.
5. **Template**: reads `loader.items`, `loader.hasNext`, `loader.isLoading`, `loader.error`, and offers
   `loader.retry()`. While loading, the previous page stays visible (in-place loading); an error shows next to the old data.

```javascript
// route
queryParams = UrlState.queryParamsConfig(SCHEMA);
async model() { /* project */ }
async setupController(controller, model) {
	super.setupController(controller, model);
	let params = controller.urlState.values;
	let records = await this.store.query('idea', controller.ideas.request(params));
	controller.ideas.seed(records, params);
}
resetController(controller, isExiting, transition) {
	super.resetController(controller, isExiting, transition);
	UrlState.resetController(controller);
	controller.ideas.reset();
}
```

## Selection across pages

A list page's controller owns one `Selection` (`selection = new Selection()`) and hands it to everything that shows or
acts on the selection: `AppUi::DataTable @selection={{this.selection}}` toggles rows and the select-all box through it,
and the toolbar reads `selection.count` and `selection.ids` from the same object. It lives in the controller, not the
URL: it is transient and nobody expects it back after a reload. It is kept while `page`, sort or filters change, so a
user can pick rows on several pages and act on them together; the select-all box covers the rows shown. Lists send no
totals (see [lists decisions](../lists/decisions.md), D-001), so there is no "select all matching". Call `clear()` after a
bulk action and in the route's `resetController`, so the selection does not outlive the page or the project.

## Rules of thumb

- One loader per independent request; do not share a loader between two lists.
- Never refresh the route for a list or view param; the loader reloads in place.
- Do not await loads in a component without checking `isDestroying`/`isDestroyed`; `AsyncResource` with an
  `owner` already does it for its own writes.
- Paging: `page` in `UrlState` with `resetOnChange: true`, `hasNext` from the loader, no totals.
