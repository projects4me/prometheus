## Overview

`AppUi::Icon` is one icon. Every icon in the app goes through it, so the icon set can be replaced later in one place.

Today it renders exactly the Font Awesome 4 markup written by hand before: an `i` element with the classes `fa fa-<name>`, plus `aria-hidden="true"` so screen readers skip it. Nothing changes visually.

- **Name**: the bare Font Awesome 4 name (`users`, `cog`). A name that starts with `fa-` (built for the old markup) has the prefix removed, so `fa-users` gives the same icon.
- **Label**: an icon that is the only content of a button or link needs `@label`. The icon is then not hidden, and holds a screen-reader-only span with the text.
- **Extra attributes**: classes (`text-danger`, `pull-right`), a title, `data-test-*` selectors and modifiers such as `on` go on the `i` element. A passed `aria-hidden` replaces the default.

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| @name | String | none | The bare Font Awesome 4 name; a leading `fa-` is removed |
| @fixedWidth | Boolean | false | Adds `fa-fw`, a fixed width so icons line up in lists and menus |
| @spin | Boolean | false | Adds `fa-spin` |
| @size | String | none | `lg`, `2x`, `3x`, `4x` or `5x`; any other value is ignored |
| @label | String | none | The text read by assistive technology; without it the icon is `aria-hidden` |

The classes always come in the order `fa fa-<name> fa-fw fa-spin fa-<size>`, then the passed classes.

## Blocks

None.

## Events

| Callback | Payload |
|---|---|
| none | none |

## Do and Avoid

- Use it for every new icon instead of writing an `i` element with `fa` classes by hand.
- Pass the bare name; the `fa-` prefix is accepted only for names computed by older code.
- Give `@label` to an icon that stands alone in a control; leave it out when text next to the icon already says the same.
- Use `@fixedWidth` for icons stacked in a list or menu so the text lines up.
- Avoid icons from any other set: Font Awesome 4 only.
