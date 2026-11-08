# Metadata-driven views — Prometheus

Prometheus builds part of its UI from view metadata instead of code written for each page.
The metadata lives in one place, `app/utils/metadata/metadata.js`, under `views.<Module>.<view>`.
Code reads it with `MD.create().getViewMeta(module, view)`. Labels in the metadata are
translation keys; they are translated where they are shown, never in the metadata.

The aim is to build every view from metadata. We get there step by step (see
[decisions.md](decisions.md), D-001).

```
utils/metadata/metadata.js  views.<Module>.<view>
        │  getViewMeta(module, view)
        ▼
  route / service / component reading it
  (nav-bar, dashboard route, app.module route, query-schema service)
        │
        ▼
  rendered view (navigation, widgets, list columns, ezSearch)
```

## What is metadata-driven today

| Feature | Metadata | Read by |
|---|---|---|
| Sidebar and admin navigation | `views.Navigation.items`, `adminItems` | `components/app-ui/nav-bar.js`, `helpers/nav-icon.js` |
| Settings menu | `views.Navigation.settingsItems` | `routes/app/settings.js` |
| Dashboard widgets | `views.Dashboard.widgets` | `routes/app/index.js` |
| List columns of the generic list | `views.<Module>.list` (e.g. `views.Project.list`) | `routes/app/module.js` |
| ezSearch fields | `views.<Module>.search` (`Issue`, `Project`) | `services/query-schema.js` |

## The rule for list search

A list view gets ezSearch only by declaring `views.<Module>.search`. This covers the generic
`app.module` list and the module lists built on `controllers/prometheus/list.js`. Controllers and routes
do not define search fields or filters. They ask the `query-schema` service for the module's schema:

```js
let schema = await this.querySchema.load('Issue', { projectId });
```

`load` returns `null` when the module declares no search, and the page then renders no search. The
service caches the schema per module and project and shares one load between concurrent callers.
Call `clear()` when the values change, e.g. after a project's members change.

## The search metadata format

```js
Issue: {
    search: {
        module: 'Issue',              // the Gaia module; unknown words become `Issue.<word>`
        textField: 'Issue.subject',   // the field free text searches
        fields: {
            // key: the Gaia field id; order here is the order in the builder and the suggestions
            'Issue.issueNumber': {
                label: 'views.app.issue.fields.issueNumber', // translation key
                type: 'number',                              // text | number | enum | user | date
                aliases: ['number', '#'],                    // other words it can be typed as
            },
            'Issue.priority': {
                label: 'views.app.issue.fields.priority',
                type: 'enum',
                aliases: ['priority', 'prio'],
                values: { source: 'translation', key: 'views.app.issue.lists.priority' },
            },
            'assignedTo.name': {
                label: 'views.app.issue.fields.assignee',
                type: 'user',
                aliases: ['assignee'],
                values: { source: 'members' },
            },
        },
    },
},
```

- `type` is a type of the operator registry (`app/utils/query/operators.js`), which picks the
  operators the field offers.
- `values` is needed only for `enum` and `user` fields. It names a value source and gives that source's
  parameters. It is never a list of values written in code. Fields with the same `values` share one load.
- A word typed in the search bar resolves, without case, to: the field id, the id without its module
  prefix, an alias or the translated label, and then a unique prefix of an alias or label
  (`app/utils/query/schema.js`).

## Extending another view: `extends` and `exclude`

A view that needs the search fields of another module, minus a few, declares that instead of copying the
fields or hard-coding exceptions:

```js
TaskBoard: {
    search: {
        extends: 'Issue',                                   // start from Issue's search metadata
        exclude: ['issuemilestone.name'],                   // field ids removed from it
        excludeReason: 'views.app.board.searchExcludedMilestone', // optional hint shown with the error
    },
},
```

- The view starts from the named module's `module`, `textField` and `fields` (and so its value sources);
  keys the view declares itself win.
- An excluded field is not suggested and not in the builder. If it is typed, or arrives through `@query`
  or a saved search, parsing reports `excludedField` ("Milestone can't be searched here. Use the milestone
  tabs.") and applies nothing. `excludeReason` is the translation key of the second sentence.
- An unknown `extends` or an `exclude` id that is not a field of the base is an error in development and
  tests (`QuerySchemaService.searchMeta`).
- The Task Board is the example: the milestone is chosen with the milestone tabs, so the board loads
  `load('TaskBoard', {projectId})` rather than `load('Issue', …)`.

## Value sources

The value sources live in `app/utils/query/value-sources.js`, in the `VALUE_SOURCES` registry. Each one
is `async (params, context) => [{ value, label, ... }]`, where `params` is the field's `values` entry. The
`context` holds `store`, `intl`, `owner`, the `projectId` the schema was loaded for, and `once(key, fn)`,
which lets sources share one request within a load.

| Source | Parameters | Values |
|---|---|---|
| `translation` | `key` | The entries of a translation list, e.g. `views.app.issue.lists.priority` |
| `issueStatuses` | none | The project's issue statuses, or the system statuses when it has none |
| `milestones` | none | The project's milestones, newest first |
| `issueTypes` | none | The project's issue types |
| `members` | none | The project's members, with `id` and `profilePicture` |
| `users` | none | All users, with `id` and `profilePicture` |

`issueStatuses`, `issueTypes` and `members` share one project request. A field that names an unknown
source fails the load with `Unknown search value source "<name>"` in development and tests. Production
builds strip that assertion, and the field then has no values.

## How to add search to a module

1. Add `views.<Module>.search` to `metadata.js` with `module`, `textField` and `fields`.
2. Add the label translation keys to `translations/`.
3. Load the schema with `querySchema.load('<Module>', { projectId })` in the list's route and pass it to
   `<EzSearch @schema=…>`. No other code is needed.

## How to add a value source

1. Add an entry to `VALUE_SOURCES` in `app/utils/query/value-sources.js`. Load through `context.store`,
   using `context.projectId` when the values belong to a project, and use `context.once` for requests
   other sources share.
2. Add a unit test in `tests/unit/utils/query/value-sources-test.js` that loads its values from Mirage.
3. Name it in the metadata: `values: { source: '<name>', ...params }`.

## Ownership in this repo

| Piece | Job |
|---|---|
| `app/utils/metadata/metadata.js` | The view metadata, read with `getViewMeta(module, view)` |
| `app/services/query-schema.js` | Builds and caches a module's ezSearch schema from `views.<Module>.search` |
| `app/utils/query/value-sources.js` | The value-source registry, the only search code that grows per module |
| `app/utils/query/schema.js` | Pure schema: field and value resolution |
| `app/utils/query/operators.js` | Operators per field type |
