# ezSearch

## Overview

ezSearch is the search bar and visual query builder of the lists. One query tree is edited live by the search bar and by the builder, and Apply reports the Gaia query string. It comes as three variants that take the same arguments and replace each other:

- **EzSearch**: the full toolbar with the saved-search menu, the bar, Apply and the builder.
- **EzSearchCompact (multi-row)**: the same controls in a compact block, used where space is short.
- **EzSearchCompact (linear)**: `@linear={{true}}`, one row with icon-only saved searches, used in the Task Board header.

Used in the Issue, Project, Idea, Gantt and Task Board screens, and on the Agent and Workflow lists.

## Arguments

Both components take the arguments of `EzSearchBase` (`components/ez-search/base.js`); `EzSearchCompact` adds `@linear`.

| Argument | Type | Default | Meaning |
|---|---|---|---|
| `@schema` | Schema | none | The fields the query is parsed and edited against |
| `@query` | String | empty | The Gaia query to load; reloaded when it changes |
| `@baseQuery` | String | none | A Gaia query ANDed in on apply and never shown |
| `@savedSearches` | Array | empty | The saved searches, `{id, name, query}` |
| `@activeSavedSearchId` | String or Number | none | The saved search to mark and, without `@query`, load |
| `@onApply` | Function | none | Called with the composed query string; may return a promise |
| `@onSave` | Function | none | Called with the current query to save it as a new search; the Save as new entry shows only when given |
| `@onUpdateSavedSearch` | Function | none | Called with the search and the edited query; the Update entry shows only when given |
| `@onSavedSearchChange` | Function | none | Called with the search, or null when it is deselected or cleared |
| `@aclContext` | String | none | The ACL context of the apply button |
| `@linear` | Boolean | false | EzSearchCompact only: one row instead of several |

### Metadata format

The schema comes from `views.<Module>.search` of the metadata, built by `services/query-schema.js`:

- `module` and `textField`: the module and the field that bare words search;
- `fields`: by Gaia field id, each `{label, type, aliases, values}`; `type` is `text`, `number`, `enum`, `user` or `date`;
- `extends` and `exclude`: take another view's fields and drop some of them; excluded fields are refused with a hint.

### Value sources

An `enum` or `user` field lists its values with `values: { source, ...params }`. The sources are registered in `utils/query/value-sources.js`: `translation` lists a translation key's values, `users` lists the project's members, and others read the store. The service loads each source once per schema and project.

## Blocks

None. Both components render their own layout.

## Events

| Callback | Payload |
|---|---|
| `@onApply` | The query string Gaia receives, with `@baseQuery` ANDed in |
| `@onSave` | The current query string |
| `@onSavedSearchChange` | The saved search, or null |
| `@onUpdateSavedSearch` | The saved search and the edited query string |

## Do and Avoid

### Keyboard

- Typing suggests fields, operators and values; Arrow Up and Down move in the suggestions, Tab or Enter picks one.
- Enter commits the typed text into the query; Ctrl or Cmd with Enter runs the search.
- Escape closes the suggestions.

### Do

- Join conditions with AND or OR, and put brackets around every group that mixes them.
- Pass the query exactly as Gaia stores it in `@query` and in saved searches.
- Use `@baseQuery` for filters the user must not see or remove, such as the project.

### Avoid

- Mixing AND and OR in one group without brackets: it is an error, never read one way.
- Expecting bare words to be separate terms: bare words form one phrase searched in the text field.
- Wrapping EzSearchCompact in another component or styling its rows; choose `@linear` instead.
- Changing the query format in the caller; the component writes the exact Gaia format.
