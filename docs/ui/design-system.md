# Prometheus UI and design system

Prometheus already has a finished look: **AdminLTE 2 on Bootstrap 3, the `skin-black-light` skin, the
crimson Projects4Me palette, content grouped in boxes, and square edges.** Every UI change extends that look.
Nothing gets rebuilt from scratch, restyled to match current trends, or given a new visual language.

This document was written by walking through the running app (`https://app.local-projects4.me`, project
*A Prometheus*) and reading `app/styles/`. Screens for reference are in [`screens/`](screens/).

## 1. Non-negotiable rules

1. **Square edges.** Never add `border-radius` to boxes, buttons, inputs, selects, labels, dropdowns, modals,
   cards, tabs or tables. The only round shapes allowed are avatars, status dots and timeline icons, which are
   already round (`50%`). The rounded corners in section 10 are legacy; don't copy them.
2. **Content lives in AdminLTE boxes.** Each block of related content is one `.box` with a `.box-header
   with-border` and a `.box-title`. Don't use cards, panels, bare `div`s with shadows, or custom containers.
3. **Reuse before creating.** Use the existing Bootstrap 3 / AdminLTE classes and the components in
   `app/components/form-fields/`, `app/components/app-ui/` and `app/components/widgets/` first. Only add a
   class when nothing existing does the job, and then scope it under the module's class in
   `app/styles/modules/<module>.scss`.
4. **Colours come from `app/styles/variables.scss`.** Don't use new hex values, new shades, gradients or
   shadows.
5. **Match the page pattern** in section 3 for the screen type: list, detail, create/edit or overview.
6. **Don't add a UI library.** No Tailwind, Bootstrap 4/5, Material, CSS-in-JS or icon sets other than
   Font Awesome 4.
7. **Check it in the browser.** Before calling a UI change done, open the screen next to a similar existing
   screen and compare spacing, colours, borders and typography.

## 2. App shell (never rebuilt per page)

| Part | What it is | Source |
|---|---|---|
| Header | White navbar. Logo "Projects4Me" top left; hamburger; global search (power-select, square); crimson **New ▾** dropdown (Issue / Thread / Project); bell; user avatar + name | `components/app-layouts/application-header` |
| Sidebar | Light grey (`#f9fafc`), fixed. User block with "Online" dot; **crimson project selector** (power-select, full width, white text); sections "Main Navigation" and "Admin"; Font Awesome icon + label per item; active item has a crimson left bar; tree items use `fa-circle-o` bullets | `components/app-layouts/application-sidebar` |
| Content header | `<section class="content-header">`: page title as `<h1>` (24px/500), or the project name as a crimson `<small>` link inside a project; breadcrumb on the right (12px, Font Awesome icon + link per level, `>` separators) | `templates/app/project.hbs`, `<BreadCrumb/>` |
| Content | `<section class="content">` on `#ecf0f5`, then Bootstrap `.row` / `.col-md-*` | |
| Footer | "Copyright © 2026 **Projects4Me Inc.**" left, "Report Issue" link right | `components/app-layouts/application-footer` |

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

**Create / edit page** ([issue create](screens/issue-create.png))
- `.col-md-8`: one `box-primary` titled "Create Issue" holding the main fields in a single column.
- `.col-md-4`: supporting boxes such as "People" (`box-warning`) and "Parent" (`box-info`).
- **Save** (`btn btn-primary`) and **Cancel** (`btn btn-default`) sit *below* the boxes, left aligned, outside
  any box.
- Create and edit share one template (`layoutName` switch). Do the same for new forms.

**Dashboard-style / profile page** ([profile](screens/profile.png))
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

## 5. Colour tokens (`app/styles/variables.scss`)

| Token | Value | Use |
|---|---|---|
| `$primaryColor` | `#B3244F` | Brand crimson: primary buttons, project selector, form labels, active nav bar, `in_progress` label |
| `$highlightColor` | `#640c44` | Plum: hover/active of primary buttons, end colour of every box gradient |
| `$secondaryColor` | `#1B7BBA` | Links (issue numbers, names, breadcrumb links) |
| `$borderColor` | `#E5E5E5` | Light borders, `.no-entry` text |
| `$darkColor` / `$mediumColor` / `$lightColor` | `#333` / `#999` / `#CCC` | Body text / input underline and muted text / disabled |
| `$errorColor`, `$successColor`, `$infoColor`, `$warningColor`, `$dangerColor` | `#dd6a45`, `#5fca4a`, `#61c4b8`, `#db8b0b`, `#d33724` | Feedback states |

Fixed surfaces: page background `#ecf0f5`, sidebar `#f9fafc`, boxes and header `#fff`.

**Issue status labels** (`styles/issue/issue-status.scss`; the CSS class is the status name):
`new` and `in_review` are blue `#80b5d3`; `in_progress` is crimson; `feedback`, `pending` and `deferred` are
amber `#f7bf65`; `done` is green `#5ac594`; `closed` is salmon `#e98a7e`. Use these classes, and don't
introduce new status colours.

**Priority** is shown as an icon and the word: use `AppUi::PriorityIcon` (for example, a red up arrow for
High, a crimson target for Medium).

## 6. Typography

- Font: **Source Sans Pro**, 14px, `#333`. No other font.
- Page title (`.content-header h1`): 24px/500. Box title: 18px/500. Facts inside a box: `<h4>` 18px/500.
- Form labels: 14px, **crimson** (`$primaryColor`), shown above the field.
- Meta text (dates, roles, "created on …"): small grey, often italic.
- Labels/badges: AdminLTE `.label` (bold, about 10.5px, white text).
- Dates use `ember-moment` formats already in use: `13 Oct '26` in tables, `13th Oct '26` in details,
  `2 minutes ago` in activity.

## 7. Forms

Use the `FormFields::*` components. Don't write raw `<input>` or `<select>`.

| Need | Component | Look |
|---|---|---|
| Text | `FormFields::FieldText` | No box: one 1px `#999` **bottom border**, 10px padding, crimson label above |
| Long text | `FormFields::FieldTextArea` | Same underline style |
| Rich text | `AppUi::ToastUi` (`@editType='wysiwyg'`) | Square bordered editor with the existing toolbar |
| Select / relate | `FormFields::FieldRelate` (`@relateType="relate-simple"`), `FieldRelateMulti`, `FieldMultiSelect` | ember-power-select, **square** 1px `#aaa` border, caret on the right; user options show an avatar |
| Date | `FormFields::FieldDate` | Underline input (`YYYY-MM-DD`) |
| Checkbox / switch | `FormFields::FieldCheckbox`, `FieldSwitch` | Existing awesome-bootstrap-checkbox styles |
| Upload | `FormFields::FieldUpload` | Dashed drop zone ("Drag and drop a file or **select a file to upload**") |
| Search | `FormFields::FieldSearch` | |
| Validation | `@validate` + `@message` on the field; `FormFields::ValidationMessages` | |

Pass `@data-field="<model>.<field>"` and `@aclContext` like the existing forms do, so field-level ACL keeps
working. Labels and placeholders come from `translations/en-us.json`.

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

## 9. Other building blocks

| Need | Use |
|---|---|
| Activity feed | AdminLTE `timeline` (`AppUi::Timeline`, `activity-block`): crimson date label, round icon on the line, white item with a shadow, linked actor name, "⏱ 2 minutes ago" on the right |
| Milestones | `milestone-block`: solid colour tiles (green done, red overdue) with a large icon on the left |
| Stats | AdminLTE `info-box` / `small-box`, or a widget in `components/widgets/` |
| Charts | Existing chart components (`chart-issueratio`, `chart-estimatedspent`, `components/charts/`) |
| Tabs | Bootstrap `nav nav-tabs` (gantt "Days / Weeks"; board milestone tabs) |
| Loading | `<route>-loading.hbs` with `AppUi::Skeleton`; `AppUi::Loader` (crimson spinner) inline |
| Toasts | Messenger "air" theme through the notifications service; don't add another toast library |
| Inline edit | `AppUi::InlineEditable` |
| Tables | `AppUi::Table` and `components/table.scss` |
| Toolbars | `AppUi::Toolbar` and `components/toolbar.scss` |
| Modals | `bootstrap-modal` (Bootstrap 3 modal, square) |
| Tooltips | tippy.js themes in `components/tooltip-themes.scss` |

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
- Use `$variables` and the mixins in `mixins.scss`. No hex literals and no `!important`, unless you are
  overriding AdminLTE the way `document.scss` does.
- `custom/` is for customer-specific overrides, not product UI.

## 12. Checklist for every UI change

- [ ] Uses the page pattern from section 3 and AdminLTE boxes with the right variant
- [ ] No `border-radius` added; no new colours, fonts, shadows or gradients
- [ ] Uses existing components and classes; any new class is scoped and justified in the PR
- [ ] Form fields use `FormFields::*` with crimson labels and underline inputs
- [ ] All strings in `translations/en-us.json`; ACL contexts set
- [ ] A `-loading.hbs` skeleton for new routes; empty states match section 4
- [ ] Compared side by side in the browser with an existing screen of the same type
