# Foundation stylesheet

Phase 3 of aprom-4999. The foundation replaces Bootstrap and AdminLTE rule by rule. Each area has its own
file so many issues can work in parallel without touching the same file.

## Layout

`app/styles/foundation/_index.scss` is imported in `app/styles/app.scss` right after the AdminLTE skin. While
Bootstrap and AdminLTE still load, the foundation's rules repeat their values, so nothing changes.

| File | Filled by |
|---|---|
| `base/_reset.scss` | the reset issue of aprom-4999 phase 3 |
| `base/_typography.scss` | the typography issue of aprom-4999 phase 3 |
| `shell/_layout.scss` | the layout issue of aprom-4999 phase 3 |
| `shell/_sidebar.scss` | the sidebar issue of aprom-4999 phase 3 |
| `grid/_grid.scss` | aprom-5060 |
| `components/_box.scss` | aprom-5061 |
| `components/_buttons.scss` | aprom-5062 |
| `components/_forms.scss` | aprom-5063 |
| `components/_tables.scss` | aprom-5064 |
| `components/_labels.scss` | aprom-5065 |
| `components/_nav.scss` | aprom-5066 |
| `components/_dropdown.scss` | aprom-5067 |
| `components/_modal.scss` | aprom-5068 |
| `components/_utilities.scss` | aprom-5069 |
| `components/_widgets.scss` | a widgets issue of aprom-4999 phase 3 |
| `vendor/_third-party.scss` | a third-party issue of aprom-4999 phase 3 |

Each empty partial names its owning issue in its header comment; update it when the issue is known.
Import order in `_index.scss`: base/reset, base/typography, shell/layout, shell/sidebar, then grid, components (box, buttons, forms, tables, labels, nav, dropdown, modal, utilities, widgets) and vendor/third-party.

## The build flag

`$p4m-foundation-only` in `app/styles/_build-flags.scss` (imported first in `app.scss`), default `false`.
When `true`, `app.scss` skips bootstrap-sass, AdminLTE, the skin and awesome-bootstrap-checkbox. Set it to
`true` locally only; the committed value is always `false`.

## Comparing an area

1. Before: build normally (flag `false`) and capture the pages and states the inventory lists for the area,
   on desktop and on phone.
2. After: set the flag to `true`, rebuild and capture the same pages and states.
3. Compare. Only the pages and states the inventory lists for the area need checking.

Reset the flag to `false` before committing.
