## Overview

`AppUi::Select` is the searchable single or multiple select of the app. It is the only component that renders ember-power-select: the `FormFields::FieldRelate`, `FieldRelateMulti` and `FieldMultiSelect` fields, the header's global search and the sidebar's project switcher all go through it.

In a form, use the FormFields fields, not `AppUi::Select`: they add the label, validation and access control. Use `AppUi::Select` directly only for a switcher or search outside a form.

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| `@options` | array | none | The options to choose from (omit when `@search` loads them) |
| `@selected` | object or array | none | The selected option, or options when `@multiple` |
| `@onChange` | function | required | Called with the new selection (`(selection, select, event)`) |
| `@multiple` | boolean | `false` | Lets the user choose several options |
| `@search` | function | none | Loads options for the typed text; return a promise or task |
| `@searchEnabled` | boolean | `false` | Shows the search box |
| `@searchField` | string | none | The option field the built-in search matches against |
| `@matcher` | function | none | Custom matcher for the built-in search |
| `@placeholder` | string | none | Text shown when nothing is selected |
| `@noMatchesMessage` | string | power-select default | Text shown when the search finds nothing |
| `@allowClear` | boolean | `false` | Shows a clear button on a single select |
| `@disabled` | boolean | `false` | Disables the select |
| `@closeOnSelect` | boolean | `true` | Closes the list after a choice (set `false` for multiple) |
| `@renderInPlace` | boolean | `false` | Renders the list next to the trigger instead of at the document root. Required inside `AppUi::Modal`, whose dialog sits in the top layer |
| `...attributes` | HTML attributes | none | Applied to the trigger, e.g. `class` or `data-test-*` hooks |

## Blocks

| Block | Yields | Meaning |
|---|---|---|
| default | `option`, `select` | Renders one option, in the list and as the selected item |

## Events

| Callback | Payload |
|---|---|
| `@onOpen` | `(select, event)`; return `false` to keep it closed |
| `@onClose` | `(select, event)` |
| `@onFocus` | `(select, event)` |
| `@onBlur` | `(select, event)` |
| `@onKeydown` | `(select, event)`; return `false` to stop the default handling |

## Do and Avoid

### Do

- Use `FormFields::FieldRelate` (`@relateType="relate-simple"` and friends) for form inputs.
- Set `@renderInPlace={{true}}` inside a modal.
- Add an argument to `AppUi::Select` when a caller needs a new power-select feature, and document it here.

### Avoid

- Do not render `<PowerSelect>` or `<PowerSelectMultiple>` anywhere else: `git grep -E "PowerSelect|power-select" app/components app/templates` should only find `app/components/app-ui/select*`.
- Do not pass every power-select argument through; keep the API small.
