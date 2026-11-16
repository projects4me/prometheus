## Overview

`AppUi::Tabs` is the AdminLTE `nav-tabs-custom` box (the markup of the task board and role permissions) with its tab panes. It replaces hand-written tab markup. It holds no state: the caller passes the name of the active tab and changes it in `@onChange`. It is used by the Component Library documentation viewer and the role permissions.

The `:tabs` block yields `t.tab` for each header; the `:panes` block yields `t.pane` for each content. Both take `@name`; `t.tab` also takes an optional `@count`, shown as a count label (0 is shown). A pane is rendered only while its name is the active one.

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| `@active` | string | none | The name of the active tab |
| `...attributes` | HTML attributes | none | Applied to the wrapping `.nav-tabs-custom.app-tabs` element; on `t.tab` they go on the link, on `t.pane` on the pane |

## Blocks

| Block | Yields | Meaning |
|---|---|---|
| `:tabs` | `t` with `tab` and `pane` | The headers. Each `t.tab` takes `@name` and yields its label |
| `:tools` | none | Optional. Tools shown on the right of the tab bar |
| `:panes` | `t` with `tab` and `pane` | The contents. Each `t.pane` takes `@name` and yields its content |

## Events

| Callback | Payload |
|---|---|
| `@onChange` | The `name` of the tab that was clicked |

## Do and Avoid

### Do

- Keep the active name in the caller and update it in `@onChange`.
- Give each `t.tab` and its `t.pane` the same `@name`.
- Use `data-test-*` attributes on tabs and panes for tests.

### Avoid

- Do not add `data-toggle="tab"` or Bootstrap tab JavaScript: the component switches panes itself.
- Do not build a second copy of the nav-tabs markup in a page.
