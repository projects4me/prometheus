## Overview

`AppUi::Dropdown` is a button that opens a floating menu below it. It closes on a second click of the button, a click outside or Escape; Escape returns the focus to the button. It is used for the Saved Searches menu of ezSearch and for the Task Board filters.

The menu looks like a Bootstrap `dropdown-menu`: white, a 1px `#ddd` border, square edges, `#444` items with a `#f4f4f4` hover. A selected item (`.active` or `aria-selected="true"`) shows crimson text and a check, with no fill.

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| `@align` | `auto`, `start`, `end` | `auto` | `start` puts the menu's left edge on the button's left edge, `end` aligns the right edges. `auto` measures on open: start when the menu fits in the viewport to the right, otherwise end, and it opens upward when there is no room below. It measures again on window resize while open |
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
- Mark the selected item with the `active` class (or `aria-selected`) and a check icon.
- Leave `@align` on `auto`; set `start` or `end` only when the placement is fixed. A scoped rule such as ezSearch's `.ez-search-saved .app-dropdown-content { left: 0; right: auto; }` still wins over the alignment.
- Let long labels wrap in your scoped rule (`white-space: normal`, `max-width`) and cap the height with `max-height` and `overflow-y: auto` for many items.

### Avoid

- Do not restyle `.app-dropdown-content` in a page or feature: the Saved Searches menu, the board filters and every other user share it (see aprom-4309 and aprom-4346). Change the shared look in `dropdown.scss` only.
- Do not wrap items in extra elements, they lose the row styles.
- Do not add a fill to the selected item or a crimson hover: the menu colours are standard.
