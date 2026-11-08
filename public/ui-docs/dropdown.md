## Overview

`AppUi::Dropdown` is a button that opens a floating menu below it. It closes on a second click of the button or a click outside. It is used for the Saved Searches menu of ezSearch and for the Task Board filters.

The menu is right-aligned to the button by default (`right: 0`), so it grows to the left. Near the left edge of a screen or box this can push it off-screen: see Do and Avoid.

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| `@isPrimary` | boolean | `false` | Renders the button as `btn-primary` instead of `btn-default` |
| `...attributes` | HTML attributes | none | Applied to the wrapping `.app-dropdown` element |

## Blocks

| Block | Yields | Meaning |
|---|---|---|
| `:button` | nothing | The content of the button; the caret icon is added after it |
| `:content` | nothing | The menu items. Each direct child (a `button` or `a`) is styled as a menu row |

## Events

| Callback | Payload |
|---|---|
| none | The dropdown has no callbacks. The demo logs open and close by watching the menu, and item choices from its own handlers |

## Do and Avoid

### Do

- Make every menu item a direct child of the `:content` block: the row styles apply to direct children only.
- Mark the selected item with the `active` class and a check icon.
- Align the menu with a rule scoped under your own root class (for example `.ez-search-saved .app-dropdown-content { left: 0; right: auto; }`) when the button sits near the left edge.
- Let long labels wrap in your scoped rule (`white-space: normal`, `max-width`) and cap the height with `max-height` and `overflow-y: auto` for many items.
- Keep hover and selected colours from the theme variables.

### Avoid

- Do not restyle `.app-dropdown-content` globally: the Saved Searches menu, the board filters and every other user share it (see aprom-4309 and aprom-4346).
- Do not wrap items in extra elements, they lose the row styles.
- Do not use hard-coded colours for hover or selected states.
