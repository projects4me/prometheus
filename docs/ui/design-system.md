# Prometheus UI and design system

Prometheus already has a finished look: **the `skin-black-light` look of AdminLTE 2 on Bootstrap 3, the
crimson Projects4Me palette, content grouped in boxes, and square edges.** Every UI change extends that look.
Nothing gets rebuilt from scratch, restyled to match current trends, or given a new visual language.

**Same look, new foundation.** Prometheus is moving off Bootstrap 3 and AdminLTE 2 onto its own CSS foundation
(aprom-4999). During that migration, Bootstrap/AdminLTE markup and CSS may be replaced by our own markup and CSS,
**as long as the page still looks the same**. Any visible change needs its own issue. How "looks the same" is
checked is in [section 1a](#1a-same-look-new-foundation-how-it-is-checked).

This document was written by walking through the running app (`https://app.local-projects4.me`, project
*A Prometheus*) and reading `app/styles/`. Screens for reference are in [`screens/`](screens/): the app shell in
[`screens/shell/`](screens/shell/), the page patterns at the top level and every Component Library entry, with its
documentation tabs, in [`screens/library/`](screens/library/). They were last taken on 20 Nov 2026 (aprom-4752).

## 1. Non-negotiable rules

1. **Square edges.** Never add `border-radius` to boxes, buttons, inputs, selects, labels, dropdowns, modals,
   cards, tabs or tables. The only round shapes allowed are avatars, status dots and timeline icons, which are
   already round (`50%`). The rounded corners in section 10 are legacy; don't copy them.
2. **Content lives in AdminLTE boxes.** Each block of related content is one `.box` with a `.box-header
   with-border` and a `.box-title`. Don't use cards, panels, bare `div`s with shadows, or custom containers.
3. **Reuse before creating.** Use the existing classes (Bootstrap 3 / AdminLTE until they are migrated, then
   our own foundation classes) and the components in `app/components/form-fields/`, `app/components/app-ui/` and
   `app/components/widgets/` first. Only add a class when nothing existing does the job, and then scope it under
   the module's class in `app/styles/modules/<module>.scss`.
4. **Colours come from `var(--p4m-...)` in `app/styles/tokens.scss`.** Use the semantic token when its role
   matches and the palette token otherwise; a new colour gets a palette token by the naming formula. No hex
   values or Sass colour functions in our files, alpha via `color-mix`. No new shades, gradients or shadows.
5. **Match the page pattern** in section 3 for the screen type: list, detail, create/edit or overview.
6. **Don't add a third-party UI library.** No Tailwind, Bootstrap 4/5, Material, CSS-in-JS or icon sets other
   than Font Awesome 4. Our own foundation CSS (the tokens in section 4a, base styles and component styles written
   in this repo) is allowed and is what replaces Bootstrap and AdminLTE.
7. **Check it in the browser.** Before calling a UI change done, open the screen next to a similar existing
   screen and compare spacing, colours, borders and typography.

### 1a. Same look, new foundation: how it is checked

Unchanged by the migration: square edges, the palette, Source Sans Pro, Font Awesome 4, the page patterns,
boxes as the visual grouping, and no third-party UI library.

A change to the foundation is "the same look" when the visual baseline shows no difference. The procedure is in
[`baseline/README.md`](baseline/README.md); its rule is: take a fresh "before" set on your own data with the
baseline tool, then the "after" set, and compare those two. The stored images in `baseline/` are the reference
for coverage (35 pages, desktop 1440 px and phone 390 px), not for a pixel comparison on another database.
The acceptance tests check behaviour and the DOM, not pixels, so they don't replace this comparison.

## 2. App shell (never rebuilt per page)

| Part | What it is | Source |
|---|---|---|
| Header | White navbar, a flex row. Left to right: logo "Projects4Me" (as wide as the sidebar); hamburger; **crimson project switcher** (`AppLayouts::ProjectSwitcher`: `AppUi::Select`, square, white text, project name in bold + short code, "All projects" link under the options); **global search** (`AppUi::Select`) centred, up to 42rem; then, on the right, the crimson **New ▾** dropdown (Issue / Thread / Project; Issue and Thread are greyed out until a project is selected), the bell (opens the notifications sidebar) and the user avatar (`AppUi::Avatar` `s`) + name with a green status dot; the user dropdown shows the avatar (`l`), an "Online" row, Profile and Sign out | `components/app-layouts/application-header`, `project-switcher`, `styles/modules/header.scss` |
| Sidebar | Light grey (`#f9fafc`), fixed, **200px** wide (`$sidebarWidth` in `modules/nav.scss`; logo, navbar, content and footer offsets follow it). No project selector: that lives in the header. Three groups (`AppUi::NavBar`, items from the `Navigation` metadata in `utils/metadata/metadata.js`): **Workspace** (Dashboard, Projects), **Project** (Issues, Task Board, Gantt Cal, Threads, Ideas; the group header shows the selected project's short code, and the items are dimmed and disabled until a project is selected) and **Admin** (Workflows, Agents, Settings, Developer; each shown only when the user's ACL allows it). Font Awesome icon + label per item; the active item has a crimson left bar; tree items use `fa-circle-o` bullets. When the sidebar is collapsed to icons, a divider separates the groups | `components/app-layouts/application-sidebar`, `components/app-ui/nav-bar`, `navbar-items` |
| Mobile (< 768px) | The header wraps: the project switcher fills the space between the hamburger and the right-hand menu (name truncated with an ellipsis), **New** becomes a `+` icon, the user name is hidden and the global search drops to its own full-width row. The sidebar slides in over a dimmed page and closes after each navigation (`close-sidebar-on-navigate`) | `modules/header.scss`, `components/sidebar-overlay.scss` |
| Content header | `<section class="content-header">`: page title as `<h1>` (24px/500), or the project name as a crimson `<small>` link inside a project; breadcrumb on the right (12px, Font Awesome icon + link per level, `>` separators) | `templates/app/project.hbs`, `<BreadCrumb/>` |
| Content | `<section class="content">` on `#ecf0f5`, then Bootstrap `.row` / `.col-md-*` | |
| Footer | "Copyright © 2026 **Projects4Me Inc.**" left, "Report Issue" link right | `components/app-layouts/application-footer` |

Screens of the shell:

| Screen | Shows |
|---|---|
| [Desktop, no project](screens/shell/desktop-no-project.png) | The whole shell on the dashboard before a project is picked |
| [Sidebar, no project](screens/shell/sidebar-no-project.png) / [with a project](screens/shell/sidebar-project.png) | The three groups; Project items disabled, then enabled with the short code in the group header |
| [Sidebar collapsed](screens/shell/sidebar-collapsed.png) | Icons only, with the dividers between the groups |
| [Project switcher](screens/shell/header-project-switcher.png) | The open switcher: name + code per project, "All projects" at the bottom |
| [Global search](screens/shell/header-global-search.png) | Issue results while typing |
| [New menu](screens/shell/header-new-menu.png) | The **New ▾** dropdown |
| [User menu](screens/shell/header-user-menu.png) | Avatar, "Online" row, Profile and Sign out |
| [Notifications sidebar](screens/shell/notifications-sidebar.png) | What the bell opens |
| [Mobile header](screens/shell/mobile-header.png) / [mobile sidebar](screens/shell/mobile-sidebar-open.png) | The wrapped header, and the sidebar over the dimmed page (390px wide) |

**Pages under `app.project` start directly with their `.row`.** They never render their own
`section.content-header`, page title row, `<BreadCrumb/>` or `section.content`: `templates/app/project.hbs`
already renders the project-name link, the single breadcrumb and the content section, so a second one nests
or duplicates them. Project pages have no page title (like Task Board and Gantt Cal). Breadcrumb labels come
from `services/breadcrumb.js`.

## 3. Page patterns

**Overview / detail page** ([project](screens/project-overview.png), [issue](screens/issue-detail.png))
- `.row` → `.col-md-8` main column + `.col-md-4` side column.
- Main column: the record box (`box-primary`), then full-width related boxes (thread, activities).
- Side column: a stack of small boxes (members, files, estimates, time logs, hierarchy, milestones, summary).
- Inside the record box: an avatar block on the left (avatar, bold name, grey role caption) and labelled facts
  as `<h4>` headings (18px/500), each followed by the plain value ("Priority", "Duration", "Type", "Milestone").
- The status label sits in the box header, next to the title or pulled right.

**List page** ([issues](screens/issue-list.png))
- One full-width `box box-primary list-view`.
- Top toolbar: crimson **Saved Searches ▾** button, then an underline search input with a search icon, a
  crimson **Search** button and a grey **Clear** button.
- Row toolbar: select-all checkbox and export button on the left as square `btn-default` icon buttons;
  `(Selected : 0) 1-20 / 20+` and square ‹ › pagination buttons on the right. Repeated under the table.
- Table: bold sortable headers with `fa-sort`, light row separators, a checkbox column, and a kebab (`⋮`)
  menu per row. The first column is `number - subject` with the status label underneath.
- Base controller: `controllers/prometheus/list.js` (search, export, mass update). Extend it; don't
  reimplement it.
- **New list pages** (Agents, Workflows) build this from components: `AppUi::ListToolbar` (search and actions in
  the box header, selection bar and pager below it; `@position="bottom"` closes the list), `AppUi::DataTable`
  (columns from descriptors, sorting, select-all, grouping, row actions) and `AppUi::Pager`, sharing one
  `Selection` from `utils/state/selection.js`. The ListToolbar entry in the Component Library (section 14) demos the whole list page.
  Screens: [agents](screens/list-agents.png), [workflows](screens/list-workflows.png),
  [projects](screens/list-projects.png).

**List + detail page (QuickList)** ([roles](screens/quicklist-roles.png), [ideas](screens/quicklist-ideas.png),
[threads](screens/quicklist-threads.png))
- `.row` → `.col-md-3` with `QuickList` in a `box box-primary`, + `.col-md-9` with the outlet for the detail.
- The detail is a `.col-md-8` record box (`box-primary`) + a `.col-md-4` info column of small boxes.
- The first row opens by default (the index route does `replaceWith` to it). The empty state shows only when
  nothing matches.
- QuickList box order, top to bottom:
  1. Header: title + the create button in `<:actions>` (`btn btn-primary btn-sm`, with ACL).
  2. `<:search>` with `EzSearchCompact`.
  3. Group / sort toolbar. It wraps when narrow and never overflows.
  4. The rows, with group headings when grouped.
  5. Pagination in the **box footer**: range `1-20 / 20+` and ‹ › buttons (ask Gaia for limit + 1). Never in
     the header.
- State lives in `utils/state/` (`UrlState` + `ListLoader`); the list reloads in place.
- Component reference: `public/ui-docs/quick-list.md`.

**Create / edit page** ([issue create](screens/issue-create.png))
- `.col-md-8`: one `box-primary` titled "Create Issue" holding the main fields in a single column.
- `.col-md-4`: supporting boxes such as "People" (`box-warning`) and "Parent" (`box-info`).
- **Save** (`btn btn-primary`) and **Cancel** (`btn btn-default`) sit *below* the boxes, left aligned, outside
  any box.
- Create and edit share one template (`layoutName` switch). Do the same for new forms.

**Dashboard-style / profile page** ([dashboard](screens/dashboard.png), [profile](screens/profile.png))
- A grid of equal-height boxes (`col-md-3` / `col-md-4` / `col-md-6`), each with one title and one widget:
  a stat, a small chart, a short list or a timeline.

## 4. Boxes

```hbs
<div class="box box-primary <module>-<section>-section">
  <div class="box-header with-border">
    <h3 class="box-title">{{t "views.app.<module>.<section>.title"}}</h3>
    <div class="box-tools pull-right">
      {{!-- optional: <button class="btn btn-box-tool"><i class="fa fa-pencil"></i></button> --}}
    </div>
  </div>
  <div class="box-body">…</div>
  <div class="box-footer text-center">
    {{!-- optional: "View all …" link --}}
  </div>
</div>
```

**New boxes use `AppUi::Box`** (`@variant`, blocks `<:header>`, `<:tools>`, `<:body>`, `<:footer>`; see
`public/ui-docs/app-ui-box.md`), which renders the markup above. The existing boxes are not migrated. New empty
states use `AppUi::EmptyState` (`@icon`, `@message`, `<:action>`).

- Every box has a **4px gradient bar on top** (`modules/document.scss`, `gradient-border-top`). The variant
  picks the start colour; every gradient ends in plum `#640c44`.
- Header: 10px padding, 1px `#f4f4f4` bottom border. Title: 18px/500, `#444`.
- Box tools are `btn btn-box-tool` icon buttons in `.box-tools.pull-right`.
- A "View all …" link goes in a `box-footer`, centred, as a plain blue link.
- Empty state: centred grey text with an `fa-info-circle` icon ("No child issue found for this issue"), or
  italic light-grey text ("No time estimated for this issue") followed by a centred action link
  ("⏱ Estimate the issue").

**Which variant to use** (based on existing screens):

| Variant | Gradient | Used for |
|---|---|---|
| `box-primary` | crimson → plum | The main record, forms, lists, activity timelines |
| `box-info` | cyan → plum | Related or secondary content: threads, files, milestones, hierarchy, parent, summary |
| `box-warning` | orange → plum | People: members, assignee/owner |
| `box-success` | green → plum | Issues overview, estimates |
| `box-danger` | red → plum | Time logs, distribution or ratio charts |
| `box-default` | grey → plum | Neutral charts (estimated vs spent) |

## 4a. Design tokens

CSS custom properties prefixed `--p4m-` (for example `--p4m-color-brand`), sizes in `rem` (the root is 10px, so
`1.4rem` is 14px). Each token below lists today's value and the SCSS variable or AdminLTE value it replaces.

**Where they live.** `app/styles/tokens.scss` defines every token in one `:root` block, imported in
`app/styles/app.scss` right after `variables.scss`. Migration issues only reference the tokens and never edit that
file. The Sass colour variables are gone; `app/styles/variables.scss` keeps only the non-colour ones.

**Two layers.** The *palette* has one token per distinct colour our own SCSS uses, at its exact value (see
"Palette scales" below). The *semantic* tokens in the tables here are `var()` references to palette tokens. A style
uses the semantic token when its role matches (a border uses `--p4m-color-border`) and the palette token otherwise
(`--p4m-grey-135` for a one-off `#ddd`). Later, merging near-identical shades means re-pointing tokens, each visible
change in its own issue.

**Derived colours.** Sass `lighten()`/`darken()` can't take a custom property, so every derived colour is computed
once at today's value, becomes a palette token by the same naming rule, and gets a role token where the role is
clear (table below).

**Alpha.** `rgba($var, a)` needs no token: write `color-mix(in srgb, var(--p4m-...) a%, transparent)`, for example
`color-mix(in srgb, var(--p4m-color-brand) 10%, transparent)` for `rgba($primaryColor, 0.1)`.

**Colour**

| Token | Value | Palette token | Replaces |
|---|---|---|---|
| `--p4m-color-brand` | `#B3244F` | `--p4m-crimson-580` | `$primaryColor` |
| `--p4m-color-brand-strong` | `#640c44` | `--p4m-plum-780` | `$highlightColor` |
| `--p4m-color-brand-subtle` | `#b3244f45` | `--p4m-crimson-580` at 27.0588% (`color-mix`) | `$primaryColorLight` |
| `--p4m-color-brand-pressed` | `#891b3c` | `--p4m-crimson-680` | `darken($primaryColor, 10%)` (`modules/issue.scss` divider handle) |
| `--p4m-color-link` | `#1B7BBA` | `--p4m-blue-580` | `$secondaryColor` |
| `--p4m-color-text` | `#333333` | `--p4m-grey-800` | `$darkColor` |
| `--p4m-color-text-muted` | `#999999` | `--p4m-grey-400` | `$mediumColor` |
| `--p4m-color-text-disabled` | `#CCCCCC` | `--p4m-grey-200` | `$lightColor` |
| `--p4m-color-border` | `#E5E5E5` | `--p4m-grey-100` | `$borderColor` |
| `--p4m-color-surface` | `#fff` | `--p4m-grey-0` | boxes and header (`$backgroundColor`) |
| `--p4m-color-surface-page` | `#ecf0f5` | `--p4m-slate-55` | AdminLTE page background |
| `--p4m-color-surface-sidebar` | `#f9fafc` | `--p4m-slate-20` | sidebar background |
| `--p4m-color-surface-muted` | `#f4f4f4` | `--p4m-grey-45` | box header border, `btn-default` background |
| `--p4m-color-success` | `#5fca4a` | `--p4m-green-460` | `$successColor` |
| `--p4m-color-info` | `#61c4b8` | `--p4m-teal-425` | `$infoColor` |
| `--p4m-color-warning` | `#db8b0b` | `--p4m-orange-550` | `$warningColor` |
| `--p4m-color-danger` | `#d33724` | `--p4m-red-515` | `$dangerColor` |
| `--p4m-color-error` | `#dd6a45` | `--p4m-red-430` | `$errorColor` |
| `--p4m-color-status-new`, `-in-review` | `#80b5d3` | `--p4m-blue-335` | `.new`, `.in_review` in `styles/issue/issue-status.scss` |
| `--p4m-color-status-in-progress` | `#B3244F` | `--p4m-color-brand` | `.in_progress` (`$primaryColor`) |
| `--p4m-color-status-feedback`, `-pending`, `-deferred` | `#f7bf65` | `--p4m-orange-320` | `.feedback`, `.pending`, `.deferred` |
| `--p4m-color-status-done` | `#5ac594` | `--p4m-green-435` | `.done`, `.complete` |
| `--p4m-color-status-closed` | `#e98a7e` | `--p4m-red-295` | `.closed` |

**Role tokens for derived colours**

| Token | Value | Palette token | Replaces |
|---|---|---|---|
| `--p4m-accordion-header-hover` | `#f4c8d6` | `--p4m-crimson-130` | `lighten($primaryColor, 45%)` (`components/accordion.scss`) |
| `--p4m-accordion-body-border` | `#f2f2f2` | `--p4m-grey-50` | `lighten($borderColor, 5%)` (`components/accordion.scss`) |
| `--p4m-conversation-comment-even` | `#ffffff` | `--p4m-grey-0` | `lighten($borderColor, 15%)` (`modules/conversation.scss`) |
| `--p4m-conversation-comment-odd` | `#f9f9f9` | `--p4m-grey-25` | `lighten($borderColor, 8%)` (`modules/conversation.scss`) |
| `--p4m-search-snippet-text` | `#666666` | `--p4m-grey-600` | `lighten($darkColor, 20%)` (`modules/header.scss`) |
| `--p4m-gantt-bar-new` | `#1b7bba` | `--p4m-color-link` | `$gantt-bar-colours` `new` (`modules/gantt.scss`) |
| `--p4m-gantt-bar-in-progress` | `#b3244f` | `--p4m-color-brand` | `in_progress` |
| `--p4m-gantt-bar-in-review` | `#640c44` | `--p4m-color-brand-strong` | `in_review` |
| `--p4m-gantt-bar-feedback` | `#976008` | `--p4m-orange-690` | `darken($warningColor, 14%)` |
| `--p4m-gantt-bar-done` | `#347f25` | `--p4m-green-680` | `darken($successColor, 22%)` |
| `--p4m-gantt-bar-closed` | `#d33724` | `--p4m-color-danger` | `closed` |
| `--p4m-gantt-bar-deferred` | `#707070` | `--p4m-grey-560` | `darken($mediumColor, 16%)` (also unknown statuses) |
| `--p4m-role-tier-high` | `#b3244f` | `--p4m-color-brand` | `$role-tiers` `high` (`modules/role.scss`) |
| `--p4m-role-tier-elevated` | `#be790a` | `--p4m-orange-610` | `darken($warningColor, 6%)` |
| `--p4m-role-tier-medium` | `#1b7bba` | `--p4m-color-link` | `medium` |
| `--p4m-role-tier-low` | `#7a7a7a` | `--p4m-grey-520` | `darken($mediumColor, 12%)` |
| `--p4m-role-tier-none` | `#999999` | `--p4m-color-text-muted` | `none` |

**Spacing**

| Token | Value | Replaces |
|---|---|---|
| `--p4m-space-xs` | `0.5rem` | AdminLTE 5px |
| `--p4m-space-sm` | `1rem` | AdminLTE 10px |
| `--p4m-space-md` | `1.5rem` | AdminLTE 15px |
| `--p4m-space-lg` | `2rem` | AdminLTE 20px |
| `--p4m-space-xl` | `3rem` | AdminLTE 30px |

**Radius.** Only two exist, in line with the square-edges rule: `--p4m-radius-none` (`0`) and `--p4m-radius-round`
(`50%`, avatars and dots). The legacy rounded corners in section 10 get no token.

**Type**

| Token | Value | Replaces |
|---|---|---|
| `--p4m-font-family` | `"Source Sans Pro", "Helvetica Neue", Helvetica, Arial, sans-serif` | AdminLTE `font-family` |
| `--p4m-font-size-xs` | `1.1rem` | small text, labels (about 10.5px today) |
| `--p4m-font-size-sm` | `1.2rem` | breadcrumb, meta text (12px) |
| `--p4m-font-size-md` | `1.4rem` | body text (14px) |
| `--p4m-font-size-lg` | `1.8rem` | box title, `<h4>` facts (18px) |
| `--p4m-font-size-xl` | `2.4rem` | page title (24px) |
| `--p4m-font-weight-regular` | `400` | body |
| `--p4m-font-weight-medium` | `500` | titles |
| `--p4m-font-weight-bold` | `700` | bold names, headers |
| `--p4m-line-height-base` | `1.42857143` | Bootstrap 3 `line-height` |

**Shadow**

| Token | Value | Replaces |
|---|---|---|
| `--p4m-shadow-none` | `none` | |
| `--p4m-shadow-box` | `0 1px 1px rgba(0, 0, 0, 0.1)` | AdminLTE `.box` shadow |
| `--p4m-shadow-overlay` | `0 8px 16px 0 rgba(0, 0, 0, 0.2)` | dropdown menus (`components/dropdown.scss`); modals use their own, stronger shadow today and move onto this token only if the baseline shows no difference |

**Palette scales**

Every colour value our own SCSS uses (`app/styles/**` without the vendored `messenger/`, `vendor/` and
`twemoji-awesome.scss`, and without box-shadow values) has exactly one palette token, at its exact value. Base
colours of `rgba()` literals are included; the alpha comes from `color-mix`.

- **Name:** `--p4m-<family>-<n>`, with **n = round((1 - HSL lightness) x 1000 / 5) x 5**: 0 is white, 1000 is
  black, so a higher number is darker (`#f4f4f4` = grey-45, `#e5e5e5` = grey-100, `#333` = grey-800).
- **Families:** `grey` (r = g = b, or HSL saturation under 3%), `slate` (bluish greys: hue 195-255 with HSL
  saturation under 35%, such as `#ecf0f5` = slate-55), and by hue for the rest: `red` 355-15, `orange` 15-45,
  `amber` 45-70, `green` 70-170, `teal` 170-195, `blue` 195-255, `plum` 290-330, `crimson` 330-355.
- **Ties:** when two colours get the same name, the one with a semantic role keeps the step, otherwise the one
  whose unrounded n is closest to it. The other takes its unrounded n as a whole number, one lighter if that is
  taken (`#e6e6e6` = grey-98 next to `#e5e5e5` = grey-100). These off-step names also mark the shades a later
  consolidation should merge.
- New colours aren't added here: use an existing token (section 1 rules).

| Token | Value | Used in (`app/styles`) |
|---|---|---|
| `--p4m-grey-0` | `#ffffff` | accordion, agent, app-ui-avatar, app-ui-tag, board, conversation +24 more |
| `--p4m-grey-25` | `#f9f9f9` | conversation (lighten $borderColor 8%), gantt, idea, skeleton |
| `--p4m-grey-30` | `#f7f7f7` | document, widgets |
| `--p4m-grey-40` | `#f5f5f5` | issue, issue-status, toolbar |
| `--p4m-grey-45` | `#f4f4f4` | agent, app-ui-data-table, app-ui-list-toolbar, board, dropdown, gantt +9 more |
| `--p4m-grey-50` | `#f2f2f2` | accordion (lighten $borderColor 5%) |
| `--p4m-grey-55` | `#f1f1f1` | gantt |
| `--p4m-grey-60` | `#f0f0f0` | gantt, infinite-scroll, toolbar |
| `--p4m-grey-65` | `#eeeeee` | board, conversation, document, infinite-scroll, pagination |
| `--p4m-grey-98` | `#e6e6e6` | role |
| `--p4m-grey-100` | `#e5e5e5` | dropdown, variables |
| `--p4m-grey-115` | `#e2e2e2` | role |
| `--p4m-grey-120` | `#e0e0e0` | gantt |
| `--p4m-grey-135` | `#dddddd` | agent, board, conversation, dropdown, gantt, group +3 more |
| `--p4m-grey-155` | `#d8d8d8` | role |
| `--p4m-grey-175` | `#d3d3d3` | role (lightgray) |
| `--p4m-grey-200` | `#cccccc` | developer-entry, gantt, pagination, power-select, search, signin +1 more |
| `--p4m-grey-335` | `#aaaaaa` | board, user |
| `--p4m-grey-400` | `#999999` | app-ui-data-table, board, document, form-fields, gantt, inline-editable +3 more |
| `--p4m-grey-465` | `#888888` | gantt, pagination |
| `--p4m-grey-500` | `#808080` | user |
| `--p4m-grey-520` | `#7a7a7a` | role (darken $mediumColor 12%) |
| `--p4m-grey-535` | `#777777` | gantt, idea, infinite-scroll, notifications-sidebar, profile, role |
| `--p4m-grey-555` | `#717171` | profile |
| `--p4m-grey-560` | `#707070` | gantt (darken $mediumColor 16%) |
| `--p4m-grey-600` | `#666666` | gantt, header (lighten $darkColor 20%), idea, inline-editable, toolbar, uploads |
| `--p4m-grey-610` | `#646262` | board |
| `--p4m-grey-665` | `#555555` | form-fields, gantt, milestone-overview, notifications-sidebar, pagination, role +1 more |
| `--p4m-grey-735` | `#444444` | document, dropdown, loader, notifications-sidebar, user-management |
| `--p4m-grey-800` | `#333333` | gantt, issue, notifications-sidebar, pagination, profile, role +2 more |
| `--p4m-grey-865` | `#222222` | issue |
| `--p4m-grey-1000` | `#000000` | board, gantt, header, inline-editable, notifications-sidebar, profile +4 more |
| `--p4m-slate-15` | `#fafbfc` | issue |
| `--p4m-slate-20` | `#f9fafc` | app-ui-data-table, quick-list, selection |
| `--p4m-slate-25` | `#f8f9fa` | board, infinite-scroll |
| `--p4m-slate-30` | `#f6f7f9` | board |
| `--p4m-slate-31` | `#f6f7f8` | board |
| `--p4m-slate-32` | `#f5f6f8` | board |
| `--p4m-slate-33` | `#f4f6f9` | profile |
| `--p4m-slate-35` | `#f5f6f7` | skeleton |
| `--p4m-slate-55` | `#ecf0f5` | gantt |
| `--p4m-slate-75` | `#e9ecef` | board, skeleton |
| `--p4m-slate-95` | `#e4e7ea` | project |
| `--p4m-slate-96` | `#e3e6ea` | board |
| `--p4m-slate-100` | `#e2e4e8` | board |
| `--p4m-slate-115` | `#dee2e6` | board |
| `--p4m-slate-130` | `#d8dde3` | board |
| `--p4m-slate-155` | `#d2d6de` | document, gantt, notifications-sidebar, profile |
| `--p4m-slate-160` | `#d0d5dd` | gantt |
| `--p4m-slate-355` | `#97a0b3` | app-ui-data-table, document, module |
| `--p4m-slate-385` | `#8aa4af` | nav |
| `--p4m-slate-465` | `#7c8794` | board |
| `--p4m-slate-485` | `#7f7f87` | document |
| `--p4m-slate-545` | `#6c757d` | board, infinite-scroll |
| `--p4m-slate-575` | `#626b76` | board |
| `--p4m-slate-660` | `#4b5563` | board |
| `--p4m-red-20` | `#fff5f5` | gantt |
| `--p4m-red-44` | `#fdeeea` | board |
| `--p4m-red-45` | `#fdeaea` | board |
| `--p4m-red-60` | `#fbe7e5` | board |
| `--p4m-red-145` | `#f4c7bf` | board |
| `--p4m-red-150` | `#edc4c4` | board |
| `--p4m-red-190` | `#e8bab5` | board |
| `--p4m-red-295` | `#e98a7e` | board, calendar, document, form-fields, issue, issue-status +2 more |
| `--p4m-red-420` | `#d9534f` | gantt |
| `--p4m-red-430` | `#dd6a45` | variables |
| `--p4m-red-440` | `#cf614e` | board |
| `--p4m-red-455` | `#dd4b39` | document, profile |
| `--p4m-red-500` | `#ff0000` | document, profile, role |
| `--p4m-red-515` | `#d33724` | board, calendar, document, form-fields, issue, power-select +2 more |
| `--p4m-red-540` | `#c0392b` | board |
| `--p4m-red-620` | `#a42a1f` | board |
| `--p4m-red-650` | `#912d21` | document |
| `--p4m-orange-40` | `#fef9ec` | role |
| `--p4m-orange-45` | `#fff8e8` | profile |
| `--p4m-orange-65` | `#fff4df` | board |
| `--p4m-orange-190` | `#f0d8ad` | board |
| `--p4m-orange-320` | `#f7bf65` | calendar, document, issue, issue-status, project |
| `--p4m-orange-375` | `#f0ad4e` | role |
| `--p4m-orange-490` | `#f39c12` | calendar, document, profile |
| `--p4m-orange-550` | `#db8b0b` | variables |
| `--p4m-orange-610` | `#be790a` | role (darken $warningColor 6%) |
| `--p4m-orange-615` | `#8a6d3b` | role |
| `--p4m-orange-635` | `#af700c` | document |
| `--p4m-orange-675` | `#a76700` | board |
| `--p4m-orange-690` | `#976008` | gantt (darken $warningColor 14%) |
| `--p4m-green-45` | `#eef9f0` | role |
| `--p4m-green-60` | `#e8f8f1` | board |
| `--p4m-green-180` | `#b9e8d2` | board |
| `--p4m-green-435` | `#5ac594` | board, calendar, document, form-fields, issue, issue-status +2 more |
| `--p4m-green-450` | `#66b396` | profile |
| `--p4m-green-459` | `#5cb85c` | role |
| `--p4m-green-460` | `#5fca4a` | variables |
| `--p4m-green-595` | `#28a745` | infinite-scroll |
| `--p4m-green-620` | `#2f9367` | board |
| `--p4m-green-650` | `#3c763d` | role |
| `--p4m-green-675` | `#00a65a` | board, calendar, document, form-fields, issue, power-select +2 more |
| `--p4m-green-680` | `#347f25` | gantt (darken $successColor 22%) |
| `--p4m-green-750` | `#008000` | document, form-fields, role |
| `--p4m-green-805` | `#006432` | document |
| `--p4m-teal-385` | `#5bc0de` | form-fields, role |
| `--p4m-teal-425` | `#61c4b8` | variables |
| `--p4m-teal-500` | `#5497ab` | form-fields |
| `--p4m-teal-530` | `#00c0ef` | document |
| `--p4m-teal-705` | `#007896` | document |
| `--p4m-blue-40` | `#eef6fb` | profile |
| `--p4m-blue-45` | `#e9f2ff` | board |
| `--p4m-blue-50` | `#eaf4fb` | role |
| `--p4m-blue-135` | `#bfd8fb` | board |
| `--p4m-blue-335` | `#80b5d3` | calendar, document, issue, issue-status, project |
| `--p4m-blue-515` | `#3c8dbc` | calendar, document, notifications-sidebar, profile |
| `--p4m-blue-530` | `#00aff0` | profile |
| `--p4m-blue-535` | `#2f6fbe` | board |
| `--p4m-blue-580` | `#1b7bba` | variables |
| `--p4m-blue-590` | `#146ebe` | profile |
| `--p4m-blue-625` | `#31708f` | role |
| `--p4m-blue-890` | `#0f172a` | gantt |
| `--p4m-plum-780` | `#640c44` | document, variables |
| `--p4m-crimson-130` | `#f4c8d6` | accordion (lighten $primaryColor 45%) |
| `--p4m-crimson-505` | `#d7263d` | gantt |
| `--p4m-crimson-530` | `#dc143c` | nav |
| `--p4m-crimson-580` | `#b3244f` | board, document, issue, variables, wiki |
| `--p4m-crimson-660` | `#8f1f3f` | board |
| `--p4m-crimson-680` | `#891b3c` | issue (darken $primaryColor 10%) |

## 5. Colour tokens (`app/styles/tokens.scss`)

| Token | Value | Use |
|---|---|---|
| `--p4m-color-brand` | `#B3244F` | Brand crimson: primary buttons, project selector, form labels, active nav bar, `in_progress` label |
| `--p4m-color-brand-strong` | `#640c44` | Plum: hover/active of primary buttons, end colour of every box gradient |
| `--p4m-color-link` | `#1B7BBA` | Links (issue numbers, names, breadcrumb links) |
| `--p4m-color-border` | `#E5E5E5` | Light borders, `.no-entry` text |
| `--p4m-color-text` / `-text-muted` / `-text-disabled` | `#333` / `#999` / `#CCC` | Body text / input underline and muted text / disabled |
| `--p4m-color-error`, `-success`, `-info`, `-warning`, `-danger` | `#dd6a45`, `#5fca4a`, `#61c4b8`, `#db8b0b`, `#d33724` | Feedback states |

Fixed surfaces: page background `#ecf0f5`, sidebar `#f9fafc`, boxes and header `#fff`.

**Issue status labels** (`styles/issue/issue-status.scss`; the CSS class is the status name):
`new` and `in_review` are blue `#80b5d3`; `in_progress` is crimson; `feedback`, `pending` and `deferred` are
amber `#f7bf65`; `done` is green `#5ac594`; `closed` is salmon `#e98a7e`. Use these classes, and don't
introduce new status colours.

**Gantt bar colours** (`$gantt-bar-colours` in `styles/modules/gantt.scss`): Gantt bars use their own, stronger
colours, derived from the palette (`new` link, `in_progress` brand, `in_review`
brand-strong, `feedback`/`done` darkened warning/success, `closed` danger,
`deferred` and unknown statuses a darkened muted text; see the `--p4m-gantt-bar-*` tokens). They are Gantt-only: status labels elsewhere keep
the classes above. Bar labels are white, 11px semibold, so every colour keeps at least 4.5:1 contrast with white
(checked by `tests/unit/gantt/bar-colours-test.js`).

**Priority** is shown as an icon and the word: use `AppUi::PriorityIcon` (for example, a red up arrow for
High, a crimson target for Medium).

## 6. Typography

- Font: **Source Sans Pro**, 14px, `#333`. No other font.
- Page title (`.content-header h1`): 24px/500. Box title: 18px/500. Facts inside a box: `<h4>` 18px/500.
- Form labels: 14px, **crimson** (`--p4m-color-brand`), shown above the field.
- Meta text (dates, roles, "created on …"): small grey, often italic.
- Labels/badges: AdminLTE `.label` (bold, about 10.5px, white text).
- Dates use the `utils/date` formats already in use (`date-format` / `format-date` helpers): `13 Oct '26` in tables, `13th Oct '26` in details,
  `2 minutes ago` in activity.

## 7. Forms

Use the `FormFields::*` components. Don't write raw `<input>` or `<select>`.

| Need | Component | Look |
|---|---|---|
| Text | `FormFields::FieldText` | No box: one 1px `#999` **bottom border**, 10px padding, crimson label above |
| Long text | `FormFields::FieldTextArea` | Same underline style |
| Rich text | `AppUi::Editor` (wraps `AppUi::ToastUi`) | Square bordered editor with the existing toolbar; label, ACL and validation message by composition; `@readonly` shows the viewer |
| Select / relate | `FormFields::FieldRelate` (`@relateType="relate-simple"`), `FieldRelateMulti`, `FieldMultiSelect` | ember-power-select, **square** 1px `#aaa` border, caret on the right; user options show an avatar |
| Date | `FormFields::FieldDate` | Underline input (`YYYY-MM-DD`) |
| Checkbox / switch | `FormFields::FieldCheckbox`, `FieldSwitch` | Existing awesome-bootstrap-checkbox styles |
| Upload | `FormFields::FieldUpload` | Dashed drop zone ("Drag and drop a file or **select a file to upload**") |
| Search | `FormFields::FieldSearch` | |
| Validation | `@validate` + `@message` on the field; `FormFields::ValidationMessages` | |

Pass `@data-field="<model>.<field>"` and `@aclContext` like the existing forms do, so field-level ACL keeps
working. Labels and placeholders come from `translations/en-us.json`.

### Translation message limits

Messages are formatted by `app/utils/intl/message-format.js`. It supports only `{arg}`, `plural` and `select`
(plus `offset:`, `#` and apostrophe quoting); HTML tags are plain text. `number`, `date`, `time`,
`selectordinal` and any other argument type throw "Unsupported argument type". Anyone adding them to a
translation, from the app or from Gaia, must extend the formatter first.

## 8. Buttons, labels, icons, avatars

- **Primary:** `btn btn-primary`, crimson, hover plum, square. One per action area (Save, Search, Post).
- **Secondary:** `btn btn-default`, grey `#f4f4f4` with a `#ddd` border (Cancel, Clear, toolbar icon buttons).
- Sizes `btn-sm` / `btn-xs`; `btn-flat` where AdminLTE uses it; `btn-box-tool` inside box headers.
- Use `AppUi::Button` when the button needs ACL (`@aclContext`).
- Dropdown buttons (`New ▾`, `Saved Searches ▾`, status label ▾) are Bootstrap dropdowns with a caret.
- Icons: **Font Awesome 4** (`fa fa-*`) only, placed before the text. Ionicons are loaded but only used
  where they already are.
- Avatars are round images with the user's name in bold beneath or beside them, truncated with an ellipsis.
  Member grids use `users-list`.
- **Every user picture is `AppUi::Avatar`** (people and agents), never a raw `<img>` of `/userimage/get`. The only
  other places that read that URL are the avatar component itself and the profile picture editor. Pick a standard
  size with `@size`: `xs` 20px (inline in a select option, chip or dense list), `s` 30px (header, comment
  composer, comment and notification rows), `m` 40px (default; table rows, member lists), `ml` 64px (member
  grids, the issue people box) and `l` 96px (profile and agent page heads). Do not size it with your own CSS.
- No small uppercase type or "eyebrow" label above a box title. The title is the `h3.box-title`.
- Issue statuses render with `AppUi::StatusLabel` (`@status`), which wraps the `status-label` + `status-style`
  helpers and the status class. Never print the raw value or repeat the helper markup.
- Tags render with `AppUi::Tag` (Task Board look: variant or palette colour, optionally removable).
- Information shown in a side box (for example a linked issue) is not repeated in the record header.

## 9. Other building blocks

| Need | Use |
|---|---|
| Activity feed | AdminLTE `timeline` (`AppUi::Timeline`, `activity-block`): crimson date label, round icon on the line, white item with a shadow, linked actor name, "⏱ 2 minutes ago" on the right |
| Milestones | `milestone-block`: solid colour tiles (green done, red overdue) with a large icon on the left |
| Stats | AdminLTE `info-box` / `small-box`, or a widget in `components/widgets/` |
| Charts | Existing chart components (`chart-issueratio`, `chart-estimatedspent`, `components/charts/`) |
| Tabs | `AppUi::Tabs` (AdminLTE `nav-tabs-custom` with panes, counts and tools; the active tab is an argument, a change is an event). Older screens use plain `nav nav-tabs` (gantt "Days / Weeks", board milestone tabs) |
| Select | `AppUi::Select`, the searchable single/multiple select behind every relate field, the global search and the project switcher. In forms, use the `FormFields::*` wrapper, not `AppUi::Select` directly |
| Dropdown menus | `AppUi::Dropdown` (button + floating menu, auto alignment, standard menu colours): saved searches, board filters, row actions |
| List pages | `AppUi::ListToolbar`, `AppUi::DataTable`, `AppUi::Pager` (section 3) |
| Narrow record lists | `QuickList` (section 3) |
| Search bar / query builder | `EzSearch`, `EzSearchCompact` |
| Loading | `<route>-loading.hbs` with `AppUi::Skeleton`; `AppUi::Loader` (crimson spinner) inline |
| Toasts | Messenger "air" theme through the notifications service; don't add another toast library |
| Inline edit | `AppUi::InlineEditable` |
| Tables | `AppUi::Table` and `components/table.scss` |
| Toolbars | `AppUi::Toolbar` and `components/toolbar.scss` |
| Modals | `AppUi::Modal` (native `<dialog>`, square) |
| Tooltips | `{{tooltip}}` modifier for a plain-text tooltip (see "Adding a tooltip" below); rich tooltips (Gantt bars) use `{{initialize-tooltip}}` with a tippy theme in `components/tooltip-themes.scss` |
| Reply / comment box | `AppUi::Editor` without label (bare box, with mentions, issue links and Ctrl/⌘+Enter `@onSubmit`) (the target for `ConversationUi::CommentComposer`, not yet migrated); never a plain textarea |
| Record boxes | Plain `box box-*`, with no extra shadow or border |
| Component docs | Markdown files in `public/ui-docs/` (format in its `README.md`), shown by `Developer::Docs` in the Component Library (section 14) |

### Adding a tooltip

Put the `{{tooltip}}` modifier on the element, with the translated text:

```hbs
<button type="button" class="btn btn-default" {{tooltip (t "views.app.project.list.add")}}>
  <i class="fa fa-plus"></i>
</button>
<span {{tooltip this.label placement="bottom"}}>…</span>
```

- The text is plain text, never HTML; it updates when the value changes, and an empty value shows no tooltip.
- `placement` is optional (`top` by default; `bottom`, `left`, `right`).
- It draws the standard dark tooltip (tippy theme `p4m` in `components/tooltip.scss`, the look of the Bootstrap 3
  tooltip with square corners). Don't add `data-toggle="tooltip"` to new markup: those tooltips are being moved to
  the modifier.
- For HTML content or a shared element (Gantt bar details), use `{{initialize-tooltip}}` with its own theme.

## 10. Rounded corners already in the code (don't copy)

Square is the standard. These exceptions exist and **must not be used as precedent**:

- AdminLTE defaults that leak through: `.box` 3px, `.box-body` bottom 3px, `.label` ≈2.6px,
  `.breadcrumb` 2px, `.popover` 0.2rem.
- Local SCSS: `modules/board.scss` (4px), `modules/gantt.scss` (4px, 6px), `modules/issue.scss` (3px, 4px,
  6px), `modules/atwho.scss` (3px), `modules/role.scss` (1rem), `modules/profile.scss` (2rem),
  `modules/form-fields.scss` (2rem toggle).

New code sets no `border-radius` except `50%` on avatars and dots. Making the exceptions above square is a
separate task with its own issue.

## 11. Where styles go

- Module styles: `app/styles/modules/<module>.scss`. Shared components: `app/styles/components/<name>.scss`.
  Import new files in `app/styles/app.scss` in the matching section.
- Nest rules under the module's root class (for example `.create-issue …`) so nothing leaks globally.
- Use `var(--p4m-...)` tokens and the mixins in `mixins.scss`. No hex literals, Sass colour functions or `!important`, unless you are
  overriding AdminLTE the way `document.scss` does.
- `custom/` is for customer-specific overrides, not product UI.

## 12. Checklist for every UI change

- [ ] Uses the page pattern from section 3 and AdminLTE boxes with the right variant
- [ ] Before/after comparison with the baseline tool shows no difference, or the visible change has its own issue (section 1a)
- [ ] No `border-radius` added; colours only from `var(--p4m-...)` tokens, no hex; no new fonts, shadows or gradients
- [ ] Uses existing components and classes; any new class is scoped and justified in the PR
- [ ] Form fields use `FormFields::*` with crimson labels and underline inputs
- [ ] All strings in `translations/en-us.json`; ACL contexts set
- [ ] A `-loading.hbs` skeleton for new routes; empty states match section 4
- [ ] Project pages render no own content-header, title, breadcrumb or `section.content`
- [ ] List + detail pages follow the QuickList order (create in the header, pagination in the footer)
- [ ] Issue statuses use `status-label`; the comment input is the `CommentComposer`
- [ ] Every user picture is `AppUi::Avatar` with a standard size (section 8)
- [ ] Checked the Component Library (section 14) first; a new or changed shared component has its library entry
- [ ] Compared side by side in the browser with an existing screen of the same type

## 13. Composing views from components

- **R1 Rule of three.** Extract a shared component only when the same markup and behaviour exists in 3+ places. Two copies stay copies.
- **R2 Blocks before arguments.** Optional or variable content is a named block or a yielded contextual component (like QuickList). Args are for data and simple switches; more than ~10 args triggers a design review.
- **R3 Data in, events out.** Components take records, descriptors and callbacks; they never inject a controller or load route data. Services are fine for cross-cutting concerns (intl, acl, notifications).
- **R4 Change only with a benefit.** Pages move to shared components when they are a pilot target or are being edited anyway.
- **R5 Test selectors are `data-test-*` only.** `ember-test-selectors` strips them from production builds; CSS and app JS never use them. The existing `data-field`, `data-btn` and `data-column` stay (4 stylesheets, `form-fields/label.js`, `controllers/app/project/board.js` and `modifiers/initialize-sortable.js` depend on them) and are replaced only when a page is touched.
- **R6 Ship the whole set.** Every shared component ships with a ui-docs page, a contract manifest and integration tests.
- **R7 Where components live.** Generic UI lives in `app-ui/`, domain UI in `<domain>/`. No new top-level components.

## 14. Developer Component Library

The live reference for the shared components: **Admin → Developer** in the sidebar, route
`/app/developer/components` (`app.developer.*`, ACL `setting.read`). Look here before writing UI; if a component
does the job, use it (CLAUDE.md: "use the existing component, always").

**Layout.** The page follows the QuickList pattern: a `col-md-3` **Components** box (`Developer::ComponentNav`:
entries by group, with a filter box) and a `col-md-9` entry page. Each entry page has:

1. A header box (`Developer::EntryHeader`, `box-primary`): name, status label (`stable` / `experimental`),
   summary and "Used in" links to the screens that use it.
2. A **Demo** box (`col-md-7`) with a Reset button, rendering the component live.
3. A **Controls** box (`col-md-5`) to switch arguments and states (form controls, or `Developer::StateSwitch`
   for loading / empty / error states), and an **Event log** (`Developer::EventLog`) showing every callback the
   demo fires.
4. The docs (`Developer::Docs`), rendering the component's `public/ui-docs/<name>.md` as tabs: Overview,
   Arguments, Blocks, Events, Do and Avoid.

**Entries** (`utils/developer/component-registry.js`, grouped as the Components box shows them):

| Group | Entry | Component | Status | Docs | Manifest | Screens |
|---|---|---|---|---|---|---|
| Lists | QuickList | `QuickList` | stable | [quick-list.md](../../public/ui-docs/quick-list.md) | [quick-list.json](../../public/ui-docs/quick-list.json) | [entry](screens/library/quick-list.png), [docs](screens/library/quick-list-docs.png) |
| Lists | ListToolbar | `AppUi::ListToolbar` | experimental | [list-toolbar.md](../../public/ui-docs/list-toolbar.md) | [list-toolbar.json](../../public/ui-docs/list-toolbar.json) | [entry](screens/library/list-toolbar.png), [docs](screens/library/list-toolbar-docs.png) |
| Lists | DataTable | `AppUi::DataTable` | experimental | [data-table.md](../../public/ui-docs/data-table.md) | [data-table.json](../../public/ui-docs/data-table.json) | [entry](screens/library/data-table.png), [docs](screens/library/data-table-docs.png) |
| Lists | Pager | `AppUi::Pager` | experimental | [pager.md](../../public/ui-docs/pager.md) | [pager.json](../../public/ui-docs/pager.json) | [entry](screens/library/pager.png), [docs](screens/library/pager-docs.png) |
| Search | ezSearch | `EzSearch`, `EzSearchCompact` | stable | [ez-search.md](../../public/ui-docs/ez-search.md) | none yet | [entry](screens/library/ez-search.png), [docs](screens/library/ez-search-docs.png) |
| Forms | Form fields | `FormFields::*` | stable | [form-fields.md](../../public/ui-docs/form-fields.md) | none yet | [entry](screens/library/form-fields.png), [docs](screens/library/form-fields-docs.png) |
| Forms | Select | `AppUi::Select` | stable | [select.md](../../public/ui-docs/select.md) | none yet | [entry](screens/library/select.png), [docs](screens/library/select-docs.png) |
| Forms | Editor | `AppUi::Editor` | experimental | [app-ui-editor.md](../../public/ui-docs/app-ui-editor.md) | [app-ui-editor.json](../../public/ui-docs/app-ui-editor.json) | [entry](screens/library/editor.png), [docs](screens/library/editor-docs.png) |
| Overlays | Modal | `AppUi::Modal` | stable | [modal.md](../../public/ui-docs/modal.md) | none yet | [entry](screens/library/modal.png), [docs](screens/library/modal-docs.png) |
| Menus | Dropdown | `AppUi::Dropdown` | stable | [dropdown.md](../../public/ui-docs/dropdown.md) | [dropdown.json](../../public/ui-docs/dropdown.json) | [entry](screens/library/dropdown.png), [docs](screens/library/dropdown-docs.png) |
| Navigation | Tabs | `AppUi::Tabs` | stable | [tabs.md](../../public/ui-docs/tabs.md) | [tabs.json](../../public/ui-docs/tabs.json) | [entry](screens/library/tabs.png), [docs](screens/library/tabs-docs.png) |
| Display | Box | `AppUi::Box` | stable | [app-ui-box.md](../../public/ui-docs/app-ui-box.md) | [app-ui-box.json](../../public/ui-docs/app-ui-box.json) | [entry](screens/library/box.png), [docs](screens/library/box-docs.png) |
| Display | EmptyState | `AppUi::EmptyState` | stable | [app-ui-empty-state.md](../../public/ui-docs/app-ui-empty-state.md) | [app-ui-empty-state.json](../../public/ui-docs/app-ui-empty-state.json) | [entry](screens/library/empty-state.png), [docs](screens/library/empty-state-docs.png) |
| Display | Avatar | `AppUi::Avatar` | stable | [app-ui-avatar.md](../../public/ui-docs/app-ui-avatar.md) | [app-ui-avatar.json](../../public/ui-docs/app-ui-avatar.json) | [entry](screens/library/avatar.png), [docs](screens/library/avatar-docs.png) |
| Display | Status | `AppUi::StatusLabel` | stable | [app-ui-status-label.md](../../public/ui-docs/app-ui-status-label.md) | [app-ui-status-label.json](../../public/ui-docs/app-ui-status-label.json) | [entry](screens/library/status-label.png), [docs](screens/library/status-label-docs.png) |
| Display | Tag | `AppUi::Tag` | stable | [app-ui-tag.md](../../public/ui-docs/app-ui-tag.md) | [app-ui-tag.json](../../public/ui-docs/app-ui-tag.json) | [entry](screens/library/tag.png), [docs](screens/library/tag-docs.png) |

The ListToolbar demo is a whole list page (ListToolbar, DataTable and Pager together). `AppUi::UserChip` has
its docs ([app-ui-user-chip.md](../../public/ui-docs/app-ui-user-chip.md)) but no library entry yet. Each **entry** screen shows the header, demo, controls and event log; each **docs** screen
stacks every documentation tab of the entry, as `Developer::Docs` renders it.

**Adding an entry.** A new shared component (R6), or an existing one the first time it is changed (R4), gets:

- a registry entry in `ENTRIES`: `name` (URL segment), `label`, `group` (one of `GROUPS`; add a group only
  when none fits), `status`, `summary`, `usedIn`, `demo`, `doc` and optional `variants`;
- a demo component in `components/developer/demos/<name>` that wraps its content in `Developer::Entry`
  (blocks `<:demo>`, `<:controls>`, `<:docs>`) and logs every event to the event log;
- the docs page `public/ui-docs/<name>.md` and, for a shared component, its contract manifest
  `<name>.json` (format and the contract test: `public/ui-docs/README.md`);
- tests for the demo like any other component.

The library itself follows this design system: AdminLTE boxes, square edges, Font Awesome 4, no new colours.

## 15. Prototypes

Clickable prototypes of features still being designed live in [`prototypes/<feature>/`](prototypes/), one folder
each, with a `README.md` listing the screens (PNGs in `screens/`, the prototype's own markup in `html/`), what is new
and what is still open. Current: [Workspaces](prototypes/workspaces/README.md).

A prototype decides **layout, content and flow**; this document and the existing components decide **how it is
built**. Prototypes are drawn with their own CSS, so never copy their markup, classes, icons or colours: map each
part to the page pattern, box and component above. Where a prototype needs something the design system doesn't
have (a new colour, a new component), treat it as a proposal and ask before building it.
