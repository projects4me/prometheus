# Foundation inventory: Bootstrap and AdminLTE classes and base styles in use

Phase 3 of aprom-4999 replaces `bootstrap-sass` (3.4.1) and the AdminLTE 2.3.7 CSS with our own foundation, with no
visual change. This file is the scope list every Phase 3 issue works from: each Bootstrap/AdminLTE class the app uses
is listed once, with the issue key that re-creates it, where the app uses it and the vendor rules it gets today.

Issue keys: `foundation-base`, `shell-layout`, `shell-sidebar`, `grid-compat`, `fc-box`, `fc-buttons`, `fc-forms`,
`fc-tables`, `fc-labels`, `fc-nav`, `fc-dropdown`, `fc-modal`, `fc-utilities`, `fc-widgets`, `fc-third-party`.

Out of scope here: writing any CSS.

## Contents

1. [Method (re-run)](#method-re-run)
2. [Classes by issue key](#classes-by-issue-key)
3. [Unassigned, name-only matches and false positives](#unassigned-name-only-matches-and-false-positives)
4. [Element-level rules (`foundation-base`)](#element-level-rules-foundation-base)
5. [Third-party widgets](#third-party-widgets)
6. [Value lists for the tokens issue](#value-lists-for-the-tokens-issue)
7. [Grid and float dependencies](#grid-and-float-dependencies)
8. [Class detail: files and vendor rules](#class-detail-files-and-vendor-rules)

## Method (re-run)

The lists were produced by a throwaway script (not committed). To re-run it:

1. **Vendor CSS.** In an empty scratch folder outside the repo, `npm i bootstrap-sass@3.4.1 sass
   awesome-bootstrap-checkbox@0.3.7`, then compile:
   - `bs.scss` = `@import "bootstrap-sass/assets/stylesheets/_bootstrap";` → `npx sass --load-path=node_modules bs.scss bs.css`
     (`app/styles/variables.scss` overrides no Bootstrap variable, so the defaults are today's values);
   - `abc.scss` = Bootstrap `variables` + `mixins` + `awesome-bootstrap-checkbox/awesome-bootstrap-checkbox` → `abc.css`.

   The other vendor sheets are read as they are: `vendor/AdminLTE/dist/css/AdminLTE.min.scss` and
   `vendor/AdminLTE/dist/css/skins/skin-black-light.min.scss` (both plain minified CSS, imported by `app/styles/app.scss`).
2. **Parse** each sheet into rules (selector list, declarations, enclosing `@media`), and index every class that
   appears in a selector (1170 vendor classes).
3. **Scan usage** (only class names that are vendor classes count):
   - `app/**/*.hbs` and `app/index.html`: the value of every attribute or named argument whose name contains `class`
     (`class=`, `@class=`, `@boxClass=`, `classNames=` …), including string literals inside mustaches in that value
     (`{{if x "active"}}`); plus multi-word or hyphenated string literals in any mustache (`(hash class="…")`).
   - `app/**/*.js` and `lib/**/*.js`: string literals on lines that build classes (`class`, `classList`, `classNames`,
     `toggle`, `btn`, `icon` …), any hyphenated or multi-word string literal, template-literal text, and `.class` names in
     `querySelector`/`closest`/`matches` strings.
   - Dynamic names: `prefix-{{…}}` and `(concat "prefix-" …)` in templates, `` `prefix-${…}` `` and `'prefix-' + …` in JS.
     The prefixes that hit vendor classes (`box-`, `col-md-`) were resolved by hand from the code (see `.box-*` and
     `.col-md-4/8/12` below).
   - Addons: no `node_modules` markup is scanned. ember-power-select / ember-basic-dropdown render only their own
     `ember-power-select-*` / `ember-basic-dropdown-*` classes; no in-repo addon renders markup (`lib/` holds build
     helpers only).
4. **Live rules.** A rule's selector part counts only when every class in it (outside `:not(…)`) is used somewhere in
   the app. Classes with no live rule are listed as name-only matches; generic words picked up from non-class strings
   were checked by hand and listed as false positives.
5. **Keys** come from class-name patterns (the issue's key list), with the hand-assigned state and context classes
   noted on their entries.
6. **Structure.** Templates are parsed as HTML after replacing mustaches with their string literals; component tags
   (`<AppUi::…>`, `<AccessControl>`) are treated as transparent when finding an element's parent. Flex parents are
   classes whose own block in `app/styles/**/*.scss` declares `display: flex|inline-flex` (a crude check: nested and
   compound selectors can be missed).

Re-running after template changes: repeat steps 3–6 and diff the key table and the structure lists against this file.

Exact and best-effort: the class list, the key table and the element-level and vendor rules come from a full parse and are exact for the scanned sources. Classes built at runtime from strings the scan can't resolve, the "parent is flex" column (step 6) and the `.col-*`-outside-`.row` list (component tags are treated as transparent) are best-effort: `grid-compat` and `fc-utilities` should re-check them in the code rather than treat them as complete.

## Classes by issue key

Each class in use appears once. Detail (files, vendor rules) is in the last section.

| Key | Classes |
|---|---|
| `foundation-base` | `.sr-only` |
| `shell-layout` | `.content`, `.content-header`, `.content-wrapper`, `.fixed`, `.hold-transition`, `.logo`, `.logo-lg`, `.logo-mini`, `.main-footer`, `.main-header`, `.navbar`, `.navbar-custom-menu`, `.navbar-nav`, `.navbar-static-top`, `.notifications-menu`, `.skin-black-light`, `.user`, `.user-footer`, `.user-header`, `.user-image`, `.user-menu`, `.wrapper` |
| `shell-sidebar` | `.header`, `.main-sidebar`, `.pull-right-container`, `.sidebar`, `.sidebar-collapse`, `.sidebar-menu`, `.sidebar-mini`, `.sidebar-open`, `.sidebar-toggle`, `.treeview`, `.treeview-menu` |
| `grid-compat` | `.clearfix`, `.col-lg-10`, `.col-md-1`, `.col-md-10`, `.col-md-12`, `.col-md-2`, `.col-md-3`, `.col-md-4`, `.col-md-5`, `.col-md-6`, `.col-md-7`, `.col-md-8`, `.col-md-9`, `.col-md-pull-4`, `.col-md-push-8`, `.col-sm-1`, `.col-sm-10`, `.col-sm-12`, `.col-sm-2`, `.col-sm-3`, `.col-sm-4`, `.col-sm-6`, `.col-sm-pull-1`, `.col-sm-push-8`, `.col-xs-1`, `.col-xs-10`, `.col-xs-12`, `.col-xs-2`, `.col-xs-3`, `.col-xs-6`, `.col-xs-9`, `.hidden-sm`, `.hidden-xs`, `.row`, `.visible-xs-inline` |
| `fc-box` | `.box`, `.box-body`, `.box-danger`, `.box-default`, `.box-footer`, `.box-header`, `.box-info`, `.box-primary`, `.box-solid`, `.box-success`, `.box-title`, `.box-tools`, `.box-warning`, `.btn-box-tool`, `.collapsed-box`, `.overlay`, `.with-border` |
| `fc-buttons` | `.btn`, `.btn-block`, `.btn-danger`, `.btn-default`, `.btn-flat`, `.btn-group`, `.btn-group-sm`, `.btn-group-xs`, `.btn-link`, `.btn-primary`, `.btn-sm`, `.btn-success`, `.btn-xs`, `.disabled` |
| `fc-forms` | `.checkbox`, `.checkbox-inline`, `.form-control`, `.form-control-feedback`, `.form-group`, `.form-inline`, `.has-feedback`, `.help-block`, `.input-group`, `.input-group-addon`, `.input-group-btn`, `.input-sm` |
| `fc-tables` | `.table`, `.table-bordered`, `.table-condensed`, `.table-hover`, `.table-responsive`, `.table-striped` |
| `fc-labels` | `.alert`, `.alert-danger`, `.alert-warning`, `.badge`, `.callout`, `.callout-danger`, `.callout-info`, `.callout-success`, `.callout-warning`, `.info-box`, `.info-box-content`, `.info-box-icon`, `.info-box-number`, `.info-box-text`, `.label`, `.label-danger`, `.label-default`, `.label-info`, `.label-primary`, `.label-success`, `.label-warning`, `.progress`, `.progress-bar`, `.progress-description` |
| `fc-nav` | `.active`, `.breadcrumb`, `.nav`, `.nav-divider`, `.nav-pills`, `.nav-stacked`, `.nav-tabs`, `.nav-tabs-custom`, `.pagination`, `.tab-content`, `.tab-pane` |
| `fc-dropdown` | `.divider`, `.dropdown`, `.dropdown-header`, `.dropdown-menu`, `.dropdown-menu-right`, `.dropdown-toggle`, `.open` |
| `fc-modal` | `.modal`, `.modal-body`, `.modal-content`, `.modal-dialog`, `.modal-footer`, `.modal-header`, `.modal-title` |
| `fc-utilities` | `.bg-aqua`, `.bg-blue`, `.bg-gray`, `.bg-green`, `.bg-orange`, `.bg-primary`, `.bg-purple`, `.bg-red`, `.bg-yellow`, `.caret`, `.close`, `.hidden`, `.img-responsive`, `.lead`, `.list-inline`, `.list-unstyled`, `.margin-bottom`, `.no-padding`, `.pull-left`, `.pull-right`, `.show`, `.small`, `.text-aqua`, `.text-bold`, `.text-center`, `.text-danger`, `.text-green`, `.text-info`, `.text-muted`, `.text-red`, `.text-right`, `.text-success`, `.text-teal`, `.text-warning`, `.text-yellow`, `.uppercase` |
| `fc-widgets` | `.box-comment`, `.box-comments`, `.comment-text`, `.description`, `.error-content`, `.error-page`, `.headline`, `.image`, `.item`, `.login-box`, `.login-box-body`, `.login-box-msg`, `.login-logo`, `.name`, `.product-list-in-box`, `.products-list`, `.time`, `.time-label`, `.timeline`, `.timeline-body`, `.timeline-header`, `.timeline-item`, `.user-block`, `.username`, `.users-list`, `.users-list-date`, `.users-list-name` |
| `fc-third-party` | `.checkbox-primary`, `.fa`, `.glyphicon`, `.glyphicon-envelope`, `.glyphicon-lock`, `.icheck`, `.ion` |

## Unassigned, name-only matches and false positives

### Unassigned

None: every class in use that gets a vendor rule fits one of the keys. Two placements are judgement calls the
Phase 3 issues should confirm:

- **Icon-font classes** `.fa`, `.ion`, `.glyphicon`, `.glyphicon-envelope`, `.glyphicon-lock` are under
  `fc-third-party`. Font Awesome and ionicons keep their own stylesheets; what moves is the AdminLTE/Bootstrap rules
  that reach them (`.main-header .navbar .nav > li.user > a > .fa`, `.box .overlay > .fa`, `.timeline > li > .fa`)
  and the `Glyphicons Halflings` `@font-face` used only by `app/templates/signin.hbs`.
- **State classes** `.active`, `.disabled`, `.open` each have one key here (`fc-nav`, `fc-buttons`, `fc-dropdown`), but
  their rules are compound (`.btn.active`, `.pagination > .active > a`, `.sidebar-menu > li.active > a`,
  `.btn-group.open .dropdown-toggle`): each key re-creates the compound rules for its own component, as listed in the
  class detail.

### Name-only matches (no key needed)

Used as a class, but no vendor rule reaches the element: every rule for the name needs a context the app never
renders. Nothing to re-create; the app's own styles (if any) keep applying.

| Class | Where | Why no vendor rule applies |
|---|---|---|
| `.has-img` | `components/issue/issue-details.hbs`, `templates/app/project/wiki/page.hbs` | only `.mailbox-attachment-icon.has-img` |
| `.img-push` | `components/conversation-ui/comment-composer.hbs` | only `.img-sm/.img-md/.img-lg + .img-push`; none of those is used |
| `.success` | `components/form-fields/validation-messages/success.hbs` (`<span class="success text-success">`) | only table-row contextual rules (`.table > tbody > tr.success`) |
| `.highlight` | `components/form-fields/field-*.hbs` (`<span class="highlight">`) | only `.callout .highlight` |

### False positives (not classes)

Strings the scan matched that are not class names; listed so a re-run can skip them.

| Name | What it is |
|---|---|
| `in` | OAuth/model/locale strings and JS `in` checks; no `fade in`/`collapse in` in templates |
| `top`, `left` | tippy placement / gantt edge-chip values (`utils/ui/delegated-tooltips.js`, `gantt-chart/task-row.js`) |
| `bottom` | `app-ui/list-toolbar.hbs` `@position` value and data attribute |
| `tooltip` | `role="tooltip"` / `data-toggle="tooltip"` values |
| `warning` | `task-board/milestones.hbs` compares a state to `"warning"`; the class is `is-warning` |
| `icon`, `footer`, `name`, `image` | data strings in `utils/developer/component-registry.js` and developer demos |

## Element-level rules (`foundation-base`)

The rules below apply without any class (element, attribute and universal selectors, `@font-face`, `@import`). All of
them belong to `foundation-base`. The points the app depends on most:

- **`html { font-size: 10px }`** (Bootstrap scaffolding). The app's own SCSS uses `rem` about 940 times
  (`$baseSize: 1rem` in `app/styles/variables.scss`), so `1rem = 10px` today; the foundation must keep it.
- **`* , *:before, *:after { box-sizing: border-box }`**. Every width in the app and in the third-party widgets
  (power-select, Messenger, Toast UI, Chart.js containers) assumes it.
- **body**: Bootstrap `font-size: 14px; line-height: 1.428571429; color: #333; background-color: #fff`, then AdminLTE
  `font-family: 'Source Sans Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 400;
  -webkit-font-smoothing: antialiased; overflow-x: hidden; overflow-y: auto` and `html, body { min-height: 100% }`.
- **The Source Sans Pro import**: `@import url(https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,700,300italic,400italic,600italic)`
  at the top of `vendor/AdminLTE/dist/css/AdminLTE.min.scss` is the only place that font is loaded. (The Messenger air
  theme separately imports Raleway in `app/styles/messenger/messenger-theme-air.scss`; that stays with Messenger.)
- **Headings, links, `hr`, `img`, lists, `code/pre/kbd`, tables, forms**: Bootstrap type scale (`h1` 36px … `h6`
  12px, `font-weight: 500; line-height: 1.1`, `h1–h3` margin-top 20px), overridden by AdminLTE to
  `font-family: 'Source Sans Pro', sans-serif`; links: Bootstrap `#337ab7` / hover `#23527c` + underline, overridden by
  AdminLTE to `a { color: #3c8dbc }`, hover/active/focus `#72afd2`, no underline, no outline; `hr` 20px margins
  with `#eee` top border, `img { vertical-align: middle }`, `label { font-weight: 700; max-width: 100%;
  margin-bottom: 5px }`, `input, button, select, textarea { font-family/size/line-height: inherit }`, `fieldset`,
  `legend`, `input[type=search]`, `[role=button]` and `[hidden]`.
- **`.sr-only`** is a class but belongs here (listed under `foundation-base` in the key table).
- **skin-black-light** has no class-less rules: everything in it is under `.skin-black-light …` (see that class).
- **Print**: Bootstrap's `@media print` element rules are in the list below.


#### All element-level rules (as compiled; colours converted to hex)

#### bootstrap (113 rules)

```css
html { font-family: sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
body { margin: 0; }
article, aside, details, figcaption, figure, footer, header, hgroup, main, menu, nav, section, summary { display: block; }
audio, canvas, progress, video { display: inline-block; vertical-align: baseline; }
audio:not([controls]) { display: none; height: 0; }
[hidden], template { display: none; }
a { background-color: transparent; }
a:active, a:hover { outline: 0; }
abbr[title] { border-bottom: none; text-decoration: underline; text-decoration: underline dotted; }
b, strong { font-weight: bold; }
dfn { font-style: italic; }
h1 { font-size: 2em; margin: 0.67em 0; }
mark { background: #ff0; color: #000; }
small { font-size: 80%; }
sub, sup { font-size: 75%; line-height: 0; position: relative; vertical-align: baseline; }
sup { top: -0.5em; }
sub { bottom: -0.25em; }
img { border: 0; }
svg:not(:root) { overflow: hidden; }
figure { margin: 1em 40px; }
hr { box-sizing: content-box; height: 0; }
pre { overflow: auto; }
code, kbd, pre, samp { font-family: monospace, monospace; font-size: 1em; }
button, input, optgroup, select, textarea { color: inherit; font: inherit; margin: 0; }
button { overflow: visible; }
button, select { text-transform: none; }
button, html input[type=button], input[type=reset], input[type=submit] { -webkit-appearance: button; cursor: pointer; }
button[disabled], html input[disabled] { cursor: default; }
button::-moz-focus-inner, input::-moz-focus-inner { border: 0; padding: 0; }
input { line-height: normal; }
input[type=checkbox], input[type=radio] { box-sizing: border-box; padding: 0; }
input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { height: auto; }
input[type=search] { -webkit-appearance: textfield; box-sizing: content-box; }
input[type=search]::-webkit-search-cancel-button, input[type=search]::-webkit-search-decoration { -webkit-appearance: none; }
fieldset { border: 1px solid #c0c0c0; margin: 0 2px; padding: 0.35em 0.625em 0.75em; }
legend { border: 0; padding: 0; }
textarea { overflow: auto; }
optgroup { font-weight: bold; }
table { border-collapse: collapse; border-spacing: 0; }
td, th { padding: 0; }
@media print { *, *:before, *:after { color: #000 !important; text-shadow: none !important; background: transparent !important; box-shadow: none !important; } }
@media print { a, a:visited { text-decoration: underline; } }
@media print { a[href]:after { content: " (" attr(href) ")"; } }
@media print { abbr[title]:after { content: " (" attr(title) ")"; } }
@media print { a[href^="#"]:after, a[href^="javascript:"]:after { content: ""; } }
@media print { pre, blockquote { border: 1px solid #999; page-break-inside: avoid; } }
@media print { thead { display: table-header-group; } }
@media print { tr, img { page-break-inside: avoid; } }
@media print { img { max-width: 100% !important; } }
@media print { p, h2, h3 { orphans: 3; widows: 3; } }
@media print { h2, h3 { page-break-after: avoid; } }
@font-face { font-family: "Glyphicons Halflings";
  src: url("../fonts/bootstrap/glyphicons-halflings-regular.eot");
  src: url("../fonts/bootstrap/glyphicons-halflings-regular.eot?#iefix") format("embedded-openty }
* { -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; }
*:before, *:after { -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; }
html { font-size: 10px; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); }
body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.428571429; color: #333333; background-color: #fff; }
input, button, select, textarea { font-family: inherit; font-size: inherit; line-height: inherit; }
a { color: #337ab7; text-decoration: none; }
a:hover, a:focus { color: #23527c; text-decoration: underline; }
a:focus { outline: 5px auto -webkit-focus-ring-color; outline-offset: -2px; }
figure { margin: 0; }
img { vertical-align: middle; }
hr { margin-top: 20px; margin-bottom: 20px; border: 0; border-top: 1px solid #eeeeee; }
[role=button] { cursor: pointer; }
h1, h2, h3, h4, h5, h6 { font-family: inherit; font-weight: 500; line-height: 1.1; color: inherit; }
h1 small, h2 small, h3 small, h4 small, h5 small, h6 small { font-weight: 400; line-height: 1; color: #777777; }
h1, h2, h3 { margin-top: 20px; margin-bottom: 10px; }
h1 small, h2 small, h3 small { font-size: 65%; }
h4, h5, h6 { margin-top: 10px; margin-bottom: 10px; }
h4 small, h5 small, h6 small { font-size: 75%; }
h1 { font-size: 36px; }
h2 { font-size: 30px; }
h3 { font-size: 24px; }
h4 { font-size: 18px; }
h5 { font-size: 14px; }
h6 { font-size: 12px; }
p { margin: 0 0 10px; }
small { font-size: 85%; }
mark { padding: 0.2em; background-color: #fcf8e3; }
ul, ol { margin-top: 0; margin-bottom: 10px; }
ul ul, ul ol, ol ul, ol ol { margin-bottom: 0; }
dl { margin-top: 0; margin-bottom: 20px; }
dt, dd { line-height: 1.428571429; }
dt { font-weight: 700; }
dd { margin-left: 0; }
abbr[title], abbr[data-original-title] { cursor: help; }
blockquote { padding: 10px 20px; margin: 0 0 20px; font-size: 17.5px; border-left: 5px solid #eeeeee; }
blockquote p:last-child, blockquote ul:last-child, blockquote ol:last-child { margin-bottom: 0; }
blockquote footer, blockquote small { display: block; font-size: 80%; line-height: 1.428571429; color: #777777; }
blockquote footer:before, blockquote small:before { content: "— "; }
address { margin-bottom: 20px; font-style: normal; line-height: 1.428571429; }
code, kbd, pre, samp { font-family: Menlo, Monaco, Consolas, "Courier New", monospace; }
code { padding: 2px 4px; font-size: 90%; color: #c7254e; background-color: #f9f2f4; border-radius: 4px; }
kbd { padding: 2px 4px; font-size: 90%; color: #fff; background-color: #333; border-radius: 3px; box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.25); }
kbd kbd { padding: 0; font-size: 100%; font-weight: 700; box-shadow: none; }
pre { display: block; padding: 9.5px; margin: 0 0 10px; font-size: 13px; line-height: 1.428571429; color: #333333; word-break: break-all; word-wrap: break-word; background-color: #f5f5f5; border: 1px solid #ccc; border-radius: 4px; }
pre code { padding: 0; font-size: inherit; color: inherit; white-space: pre-wrap; background-color: transparent; border-radius: 0; }
table { background-color: transparent; }
table col[class*=col-] { position: static; display: table-column; float: none; }
table td[class*=col-], table th[class*=col-] { position: static; display: table-cell; float: none; }
caption { padding-top: 8px; padding-bottom: 8px; color: #777777; text-align: left; }
th { text-align: left; }
fieldset { min-width: 0; padding: 0; margin: 0; border: 0; }
legend { display: block; width: 100%; padding: 0; margin-bottom: 20px; font-size: 21px; line-height: inherit; color: #333333; border: 0; border-bottom: 1px solid #e5e5e5; }
label { display: inline-block; max-width: 100%; margin-bottom: 5px; font-weight: 700; }
input[type=search] { -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; -webkit-appearance: none; appearance: none; }
input[type=radio], input[type=checkbox] { margin: 4px 0 0; margin-top: 1px \9 ; line-height: normal; }
input[type=radio][disabled], fieldset[disabled] input[type=radio], input[type=checkbox][disabled], fieldset[disabled] input[type=checkbox] { cursor: not-allowed; }
input[type=file] { display: block; }
input[type=range] { display: block; width: 100%; }
select[multiple], select[size] { height: auto; }
input[type=file]:focus, input[type=radio]:focus, input[type=checkbox]:focus { outline: 5px auto -webkit-focus-ring-color; outline-offset: -2px; }
output { display: block; padding-top: 7px; font-size: 14px; line-height: 1.428571429; color: #555555; }
```

#### adminlte (7 rules)

```css
@import url(https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,700,300italic,400italic,600italic) {  }
html, body { min-height:100% }
body { -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;font-family:'Source Sans Pro','Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:400;overflow-x:hidden;overflow-y:auto }
h1, h2, h3, h4, h5, h6 { font-family:'Source Sans Pro',sans-serif }
a { color:#3c8dbc }
a:hover, a:active, a:focus { outline:none;text-decoration:none;color:#72afd2 }
#add-new-event { -webkit-transition:all linear .3s;-o-transition:all linear .3s;transition:all linear .3s }
```

## Third-party widgets

What each third-party widget relies on from the Bootstrap/AdminLTE base. Their own stylesheets stay; the foundation
must keep giving them these. Key: `fc-third-party` unless a row says otherwise.

| Widget | Stylesheet | Relies on |
|---|---|---|
| Toast UI editor / viewer 2.5.1 | `vendor/@toast-ui/toastui-editor.scss`, `codemirror.scss` | Sets its own fonts ('Open Sans' stack, not loaded, so it falls back to Helvetica/Arial) and `box-sizing` on its own parts; inherits body `color` and the global `box-sizing: border-box` for the parts it does not set; toolbar buttons and inputs get the normalize `button`/`input` resets (`font: inherit`, `overflow`, `text-transform`). Viewer content (`h1`–`h6`, `a`, `hr`, `img`, `table`) is styled by Toast UI's own `.tui-editor-contents` rules, but anything they leave unset falls through to the element-level rules (heading `font-family`, link colour). The app wraps it in `.box` / `.form-group` (see those classes). |
| tippy.js 6 | `vendor/tippy.js/tippy.scss`, `app/styles/components/tooltip*.scss` | Own `font-size: 14px; line-height: 1.4`; inherits `font-family` (Source Sans Pro) from body. No Bootstrap tooltip classes are used (`data-toggle="tooltip"` is only a selector for `utils/ui/delegated-tooltips.js`). |
| ember-power-select / ember-basic-dropdown 9 | `app/styles/components/power-select.scss` (imports both default themes) | The default themes size the trigger and search input assuming `box-sizing: border-box`; text inherits body font/size; the search `<input type="search">` relies on normalize's `input[type=search]` (`-webkit-appearance: textfield; box-sizing: content-box` then Bootstrap's `border-box`) and `input { font: inherit }`. The dropdown z-index 2000 is the app's own. |
| Messenger (air theme) | `app/styles/messenger/messenger*.scss` | Own `box-sizing`, fonts (imports Raleway itself) and positioning; uses `.messenger-*` classes only. Relies on `body` being the positioning context and on the global `*:before/*:after` box-sizing for its spinner. No Bootstrap class. |
| Pace | `app/styles/pace.scss`, `vendor/pace/` | Fully self-contained (`.pace*` fixed bar); only depends on the z-index scale (its own `z-index: 2000` sits above `.main-header` at 1030). |
| twemoji-awesome | `app/styles/twemoji-awesome.scss` | `em`-based sizing of `.twa*` inline backgrounds: depends on the inherited `font-size` (body 14px and the type scale). |
| Gantt chart (app's own SVG/HTML, `app/components/app-ui/gantt-chart*`) | `app/styles/modules/gantt.scss` | Uses Bootstrap/AdminLTE classes directly: `.box*`, `.btn`, `.btn-group(-sm)`, `.btn-link`, `.btn-box-tool`, `.label-*`, `.nav-tabs-custom`, `.progress`, `.text-*`, `.sr-only` (each re-created by its own key). The task grid relies on `box-sizing: border-box` for its fixed column widths. |
| Chart.js canvases (`chart-estimatedspent`, `chart-issueratio`, `vendor/custom-charts/doughnut-chart.js`) | none | Canvases size to their `.box-body` parent: depend on `.box-body` padding and `box-sizing` (key `fc-box`). Chart fonts are set in JS, not from CSS. |
| awesome-bootstrap-checkbox 0.3.7 | `node_modules/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.scss` | **Compiles against bootstrap-sass variables and mixins**: `$input-border` (#ccc), `$input-bg-disabled` (#eee), `$input-color` (#555), `$brand-primary/success/info/warning/danger`, the `transition` mixin, and Font Awesome's `$fa-var-check` / `FontAwesome` family. Without bootstrap-sass the import fails to compile, so the foundation (or this key) must provide those variables or a compiled copy. It also builds on Bootstrap's `.checkbox` / `.checkbox-inline` layout (`fc-forms`). Used by `components/form-fields/field-checkbox.hbs`, `templates/app/agent/create.hbs`, `templates/signin.hbs` (`.checkbox-primary`, `.icheck`). |
| ionicons 4 | `node_modules/ionicons/dist/scss/ionicons.scss` | Own font and `ion-*` classes, used as `<ion class="ion-md-…">`. AdminLTE rules that reach `.ion` (header user menu, `.timeline > li > .ion`, `.info-box-icon > .ion`) are listed under `.ion`. |
| Font Awesome 4.7 | `node_modules/font-awesome/scss/font-awesome.scss` | Own font and `fa-*` classes; AdminLTE rules that reach `.fa` (box overlay spinner, header user menu, timeline, `.btn-box-tool`) are listed under `.fa`. Its `$fa-var-check` is also used by awesome-bootstrap-checkbox. |
| Glyphicons (Bootstrap) | Bootstrap's `@font-face { font-family: "Glyphicons Halflings" }`, fonts in `public/fonts/bootstrap/` | Used only by `templates/signin.hbs` (`.glyphicon-envelope`, `.glyphicon-lock` with `.form-control-feedback`). Needs the `@font-face` (path `../fonts/bootstrap/`), `.glyphicon` and the two icon `:before` rules. |


## Value lists for the tokens issue

Every distinct value in the live vendor rules (rules for the classes in use plus the element-level rules). IE hacks (`\9`) and `!important` are as in the vendor CSS.

- **spacing** (81 distinct): `-20px`, `-16.5px`, `-15px`, `-8px`, `-7px`, `-5px`, `-3px`, `-2px`, `-1px`, `0`, `0 0 0 0`, `0 0 10px`, `0 0 20px`, `0 0 20px 0`, `0 0 30px 0`, `0 10px`, `0 15px`, `0 20px 20px 20px`, `0 2px`, `0 5px`, `0.2em`, `0.2em 0.6em 0.3em`, `0.35em 0.625em 0.75em`, `0.67em 0`, `1em 40px`, `1px`, `1px 0 0 0`, `1px 5px`, `1px \9`, `2px`, `2px 0 0`, `2px 3px`, `2px 4px`, `3px`, `3px 20px`, `3px 7px`, `4px`, `4px 0 0`, `4px \9`, `5px`, `5px -10px 5px -10px`, `5px 0`, `5px 10px`, `5px 15px 5px 25px`, `5px 5px 5px 15px`, `6px 12px`, `7% auto`, `7px`, `7px 10px`, `7px 5px`, `7.5px -15px`, `8px`, `8px 0`, `8px 15px`, `9px 0`, `9.5px`, `10px`, `10px 0`, `10px 15px`, `10px 20px`, `10px 25px 10px 15px`, `12px 5px 12px 15px`, `12px 5px 12px 20px`, `15px`, `15px 15px`, `15px 15px 0 15px`, `15px 30px 15px 15px`, `20px`, `20px 0`, `20px auto 0 auto`, `25px`, `30px auto`, `40px`, `42.5px`, `50px`, `60px`, `90px`, `100px`, `190px`, `230px`, `auto`
- **font-size** (30 distinct): `0`, `1em`, `2em`, `9px`, `10px`, `11px`, `12px`, `13px`, `14px`, `15px`, `16px`, `17px`, `17.5px`, `18px`, `20px`, `21px`, `24px`, `25px`, `30px`, `35px`, `36px`, `45px`, `65%`, `75%`, `80%`, `85%`, `90%`, `100%`, `100px`, `inherit`
- **line-height** (16 distinct): `0`, `.9`, `1`, `1.1`, `1.4`, `1.428571429`, `1.5`, `10px`, `20px`, `30px`, `34px`, `35px`, `50px`, `90px`, `inherit`, `normal`
- **font-weight** (7 distinct): `300`, `400`, `500`, `600`, `700`, `bold`, `normal`
- **font-family** (11 distinct): `"FontAwesome"`, `"Glyphicons Halflings"`, `"Helvetica Neue", Helvetica, Arial, sans-serif`, `"Helvetica Neue",Helvetica,Arial,sans-serif`, `'Source Sans Pro','Helvetica Neue',Helvetica,Arial,sans-serif`, `'Source Sans Pro',sans-serif`, `Menlo, Monaco, Consolas, "Courier New", monospace`, `fontAwesome`, `inherit`, `monospace, monospace`, `sans-serif`
- **border-width** (9 distinct): `0`, `0 0 1px`, `1px`, `1px 0 0 0 0`, `2px`, `3px`, `4px`, `5px`, `none`
- **radius** (10 distinct): `0`, `0.25em`, `1px`, `2px`, `3px`, `4px`, `4px 4px 0 0`, `6px`, `10px`, `50%`
- **shadow** (15 distinct): `0 1px 1px rgba(0,0,0,0.05)`, `0 1px 1px rgba(0,0,0,0.1)`, `0 2px 3px rgba(0,0,0,0.125)`, `0 3px 9px rgba(0, 0, 0, 0.5)`, `0 5px 15px rgba(0, 0, 0, 0.5)`, `0 6px 12px rgba(0, 0, 0, 0.175)`, `inset 0 -1px 0 rgba(0, 0, 0, 0.15)`, `inset 0 -1px 0 rgba(0, 0, 0, 0.25)`, `inset 0 0 100px rgba(0,0,0,0.2)`, `inset 0 1px 1px rgba(0, 0, 0, 0.075)`, `inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6)`, `inset 0 1px 2px rgba(0, 0, 0, 0.1)`, `inset 0 3px 5px rgba(0, 0, 0, 0.125)`, `inset 0 3px 5px rgba(0,0,0,0.125)`, `none`
- **z-index** (13 distinct): `1`, `2`, `3`, `5`, `50`, `800`, `810`, `820`, `840`, `850`, `1000`, `1030`, `1050`
- **breakpoints** (media queries on live rules): `(max-width: 991px)`, `(max-width:991px)`, `(max-width:768px)`, `(min-width: 1200px)`, `(min-width: 768px)`, `(max-width: 767px)`, `(min-width: 992px)`, `(max-width:767px)`, `(min-width:768px)`

## Grid and float dependencies

### `.col-*` not directly inside `.row` (`grid-compat`)

Component wrappers are looked through. Cells at a template root get their parent from the caller:
`issue/issue-tags.hbs` is rendered by `issue/issue-details.hbs:185` inside the `.row` of `col-xs-6 col-md-4` cells (fine); `app-ui/skeleton/role-detail.hbs` is rendered by `templates/app/role/page-loading.hbs` with no `.row` (its cells float with no negative gutter); `widgets.hbs` puts two `.col-md-6` directly in `.widgets-container`.

| Where | Element | Parent |
|---|---|---|
| `app/components/widgets.hbs:2` | `<div class="col-md-6">` | `<div class="widgets-container">` |
| `app/components/widgets.hbs:15` | `<div class="col-md-6">` | `<div class="widgets-container">` |
| `app/components/app-ui/skeleton/role-detail.hbs:1` | `<div class="col-lg-10 col-md-12 col-sm-12 col-xs-12 role-details role-detail-skeleton">` | `<(template root) class="">` |
| `app/components/issue/issue-tags.hbs:1` | `<div class="col-xs-6 col-md-4 issue-tags">` | `<(template root) class="">` |

### `.clearfix` uses (`grid-compat`)

| Where | Element | Parent |
|---|---|---|
| `app/components/idea/created-issues-box.hbs:13` | `<div class="idea-created-group clearfix">` | `<div class="box-body no-padding">` |
| `app/components/issue/issue-details.hbs:280` | `<ul class="users-list clearfix">` | `<div class="box-body no-padding">` |
| `app/components/issue/issue-details.hbs:329` | `<ul class="attachments clearfix">` | `<div class="box-footer">` |
| `app/components/issue/issue-details.hbs:342` | `<div class="attachment-name clearfix">` | `<div class="attachment-info">` |
| `app/templates/reset-password.hbs:16` | `<div class="clearfix">` | `<a class="">` |
| `app/templates/signin.hbs:17` | `<div class="clearfix">` | `<a class="">` |
| `app/templates/signin.hbs:59` | `<div class="clearfix">` | `<a class="">` |
| `app/templates/app/module.hbs:4` | `<div class="list-view-header clearfix">` | `<div class="module-view">` |
| `app/templates/app/project/index.hbs:144` | `<ul class="issue-overview show-5 clearfix slim-scroll slim-scroll-wide">` | `<div class="box-body no-padding">` |
| `app/templates/app/project/index.hbs:277` | `<ul class="users-list clearfix">` | `<div class="box-body no-padding">` |
| `app/templates/app/project/index.hbs:523` | `<ul class="users-list clearfix">` | `<div class="box-body no-padding">` |
| `app/templates/app/project/wiki/index.hbs:5` | `<div class="clearfix">` | `<div class="wiki-no-home">` |
| `app/templates/app/project/wiki/index.hbs:7` | `<div class="clearfix">` | `<div class="wiki-no-home">` |
| `app/templates/app/project/wiki/index.hbs:9` | `<div class="clearfix">` | `<div class="wiki-no-home">` |
| `app/templates/app/project/wiki/page.hbs:74` | `<div class="clearfix">` | `<(template root) class="">` |
| `app/templates/app/project/wiki/page.hbs:92` | `<ul class="attachments clearfix">` | `<div class="box-footer">` |
| `app/templates/app/project/wiki/page.hbs:103` | `<div class="attachment-name clearfix">` | `<div class="attachment-info">` |
| `app/templates/app/role/page.hbs:126` | `<ul class="users-list clearfix">` | `<div class="box-body no-padding">` |
| `app/templates/app/workspace/index.hbs:181` | `<ul class="users-list clearfix">` | `<div (through appui--box, accesscontrol) class="col-md-4">` |

### `.pull-left` / `.pull-right` uses (`fc-utilities`)

All 88 uses. `float` only works when the parent is a block box; the "Parent is flex" column marks parents whose class is `display: flex` in the app SCSS: there the float is ignored today, and the re-created `.pull-*` must not change that (no `margin-left: auto` or similar). Every other row depends on float behaviour (and on a clearing parent: `.box-header`, `.clearfix`, `.modal-footer` …).

| Where | Element | Parent | Parent is flex | Element is flex |
|---|---|---|---|---|
| `app/components/app-layouts/application-footer.hbs:3` | `<div class="pull-right hidden-xs">` | `<footer class="main-footer">` |  |  |
| `app/components/app-layouts/application-header.hbs:87` | `<div class="pull-left">` | `<li class="user-footer">` |  |  |
| `app/components/app-layouts/application-header.hbs:90` | `<div class="pull-right">` | `<li class="user-footer">` |  |  |
| `app/components/app-ui/box.hbs:6` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/components/app-ui/list-toolbar.hbs:45` | `<div class="pull-right">` | `<div class="list-controls bottom list-controls-bottom">` | list-controls |  |
| `app/components/app-ui/modal.hbs:13` | `<appui::button class="btn btn-default pull-left">` | `<div class="modal-footer">` | modal-footer |  |
| `app/components/app-ui/navbar-items.hbs:17` | `<appui::icon class="pull-right">` | `<span class="pull-right-container">` |  |  |
| `app/components/app-ui/table.hbs:18` | `<div class="box-tools pull-right filters">` | `<div class="box-header with-border">` |  |  |
| `app/components/app-ui/table.hbs:33` | `<appui::icon class="pull-right">` | `<a class="">` |  |  |
| `app/components/app-ui/tabs.hbs:5` | `<li class="app-tabs-tools pull-right">` | `<ul class="nav nav-tabs">` |  |  |
| `app/components/app-ui/skeleton/wiki-article.hbs:12` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/components/conversation-ui/comment-frame.hbs:12` | `<span class="text-muted pull-right">` | `<span class="username">` |  |  |
| `app/components/conversation-ui/message-box.hbs:9` | `<div class="pull-right">` | `<(template root) class="">` |  |  |
| `app/components/developer/component-nav.hbs:4` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/components/developer/component-nav.hbs:25` | `<span class="label label-warning pull-right">` | `<li (through linkto) class="active">` |  |  |
| `app/components/developer/docs.hbs:4` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/components/developer/entry-header.hbs:4` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/components/developer/entry.hbs:7` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/components/developer/event-log.hbs:4` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/components/ez-search/group.hbs:14` | `<button class="btn btn-box-tool pull-right">` | `<div class="ez-search-group-header">` |  |  |
| `app/components/ez-search/index.hbs:36` | `<appui::icon class="pull-right">` | `<button class="active">` |  |  |
| `app/components/ez-search-compact/index.hbs:30` | `<appui::icon class="pull-right">` | `<button class="active">` |  |  |
| `app/components/form-fields/field-text.hbs:20` | `<span class="count pull-right">` | `<div (through formfields--label) class="">` |  |  |
| `app/components/idea/conversation-box.hbs:24` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/components/idea/created-issues-box.hbs:4` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/components/idea/created-issues-box.hbs:16` | `<span class="text-muted pull-right">` | `<div class="idea-created-group clearfix">` |  |  |
| `app/components/idea/plan-box.hbs:4` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/components/issue/issue-details.hbs:211` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/components/issue/issue-details.hbs:275` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/components/issue/issue-details.hbs:321` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/components/issue/issue-details.hbs:348` | `<a class="btn btn-default btn-xs pull-right">` | `<span class="attachment-size">` |  |  |
| `app/components/issue/issue-details.hbs:349` | `<a class="btn btn-default btn-xs pull-right">` | `<span class="attachment-size">` |  |  |
| `app/components/issue/issue-details.hbs:389` | `<span class="log-edit pull-right">` | `<div (through agent--usertag) class="log-info">` |  |  |
| `app/components/issue/issue-details.hbs:393` | `<span class="log-entry pull-right">` | `<div (through agent--usertag) class="log-info">` |  |  |
| `app/components/issue/issue-details.hbs:498` | `<span class="log-edit pull-right">` | `<div (through agent--usertag) class="log-info">` |  |  |
| `app/components/issue/issue-details.hbs:502` | `<span class="log-entry pull-right">` | `<div (through agent--usertag) class="log-info">` |  |  |
| `app/components/issue/issue-planning.hbs:20` | `<span class="pull-right">` | `<h4 class="">` |  |  |
| `app/components/issue/linked-issues.hbs:4` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/components/project/milestones.hbs:11` | `<span class="pull-right">` | `<(template root, inside appui--milestoneblock, linkto) class="">` |  |  |
| `app/components/project/milestones.hbs:26` | `<span class="pull-right">` | `<span class="progress-description">` |  |  |
| `app/components/quick-list/header.hbs:8` | `<div class="box-tools pull-right">` | `<div class="box-header with-border quick-list__header">` |  |  |
| `app/components/related-fields/relate-user.hbs:7` | `<span class="pull-right text-muted agent-sponsor">` | `<span class="relate-user relate-agent">` |  |  |
| `app/components/tags/rename-panel.hbs:36` | `<button class="btn btn-link text-red pull-right">` | `<div class="tags-rename-panel-actions">` |  |  |
| `app/components/widgets/weekly-conversations.hbs:66` | `<span class="text-muted pull-right">` | `<span class="username">` |  |  |
| `app/components/workflow/canvas-node.hbs:28` | `<appui::icon class="text-red pull-right">` | `<div (through appui--icon) class="workflow-node-header">` |  |  |
| `app/components/workflow/case-list.hbs:6` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/components/workflow/condition-list.hbs:4` | `<div class="box-tools pull-right">` | `<div class="workflow-condition">` |  |  |
| `app/components/workflow/flow-canvas.hbs:9` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/components/workflow/header-box.hbs:11` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/components/workflow/properties-box.hbs:5` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/components/workflow/runs-box.hbs:4` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/components/workflow/test-run-box.hbs:4` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/templates/auth-status.hbs:39` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/templates/app/module.hbs:24` | `<span class="list-view-count pull-left">` | `<div class="btn-group col-sm-2">` |  |  |
| `app/templates/app/agent/page.hbs:34` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/templates/app/agent/page.hbs:122` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/templates/app/agent/page.hbs:145` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/templates/app/agent/page.hbs:172` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/templates/app/agent/skills.hbs:16` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/templates/app/agent/skills.hbs:30` | `<span class="pull-right text-muted small">` | `<a class="">` |  |  |
| `app/templates/app/agent/skills.hbs:57` | `<div class="box-tools pull-right text-muted small">` | `<div class="box-header with-border">` |  |  |
| `app/templates/app/agent/tools.hbs:17` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/templates/app/project/idea.hbs:55` | `<span class="pull-right">` | `<div (through item, quicklist) class="col-md-3">` |  |  |
| `app/templates/app/project/index.hbs:17` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/templates/app/project/index.hbs:95` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/templates/app/project/index.hbs:137` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/templates/app/project/issue/index.hbs:55` | `<div class="pull-right">` | `<div class="list-controls">` | list-controls |  |
| `app/templates/app/project/issue/index.hbs:123` | `<td class="pull-right list-item-actions">` | `<tr class="issue">` |  |  |
| `app/templates/app/project/issue/index.hbs:183` | `<div class="pull-right">` | `<div class="list-controls">` | list-controls |  |
| `app/templates/app/project/wiki/edit.hbs:56` | `<div class="pull-right wiki-tags">` | `<div class="box-footer">` |  |  |
| `app/templates/app/project/wiki/page.hbs:35` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/templates/app/project/wiki/page.hbs:59` | `<div class="pull-right">` | `<div class="box-footer">` |  |  |
| `app/templates/app/project/wiki/page.hbs:84` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/templates/app/project/wiki/page.hbs:109` | `<a class="btn btn-default btn-xs pull-right">` | `<span class="attachment-size">` |  |  |
| `app/templates/app/project/wiki/page.hbs:110` | `<a class="btn btn-default btn-xs pull-right">` | `<span class="attachment-size">` |  |  |
| `app/templates/app/projects/index.hbs:66` | `<div class="pull-right">` | `<div class="list-controls">` | list-controls |  |
| `app/templates/app/projects/index.hbs:176` | `<div class="pull-right">` | `<div class="list-controls">` | list-controls |  |
| `app/templates/app/role/page.hbs:7` | `<div class="box-tools pull-right">` | `<div class="box-header with-border box-header-flex box-header-no-content">` |  |  |
| `app/templates/app/settings/issue-statuses.hbs:8` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/templates/app/settings/issue-types.hbs:8` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/templates/app/settings/services.hbs:8` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/templates/app/settings/services.hbs:76` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/templates/app/settings/services.hbs:136` | `<div class="box-tools pull-right">` | `<div class="box-header with-border">` |  |  |
| `app/templates/app/user/management.hbs:56` | `<div class="pull-right">` | `<div class="list-controls">` | list-controls |  |
| `app/templates/app/user/management.hbs:129` | `<td class="pull-right actions">` | `<tr class="">` |  |  |
| `app/templates/app/user/management.hbs:172` | `<div class="pull-right">` | `<div class="list-controls">` | list-controls |  |
| `app/templates/app/workspace/index.hbs:287` | `<span class="pull-right">` | `<span class="progress-description">` |  |  |
| `app/templates/app/workspace/settings/agents.hbs:11` | `<span class="pull-right badge bg-blue">` | `<li (through linkto) class="">` |  |  |

## Class detail: files and vendor rules

Paths: `c/` = `app/components/`, `t/` = `app/templates/`. Source: `hbs` (class attribute), `hbs-literal` (string in a mustache), `js`, `js-template`, `js-selector`, `dynamic`.

### `foundation-base`

#### `.sr-only`

- Key: `foundation-base`
- Source: hbs/hbs-literal; 9 file(s): `c/app-layouts/application-header.hbs`, `c/app-ui/gantt-chart/gantt-bar.hbs`, `c/app-ui/icon.hbs`, `c/app-ui/table.hbs`, `c/ez-search-compact/index.hbs`, `c/ez-search/index.hbs`, `t/app/loading-assets.hbs`, `t/app/module.hbs`, `t/app/project/idea.hbs`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0; }   /* bootstrap */
.has-feedback label.sr-only ~ .form-control-feedback { top: 0; }   /* bootstrap */
```


### `shell-layout`

#### `.content`

- Key: `shell-layout`
- Source: hbs; 34 file(s): `c/app-ui/skeleton/conversation-grid.hbs`, `c/app-ui/skeleton/page-loading.hbs`, `c/app-ui/skeleton/user-management.hbs`, `c/app-ui/skeleton/user-profile.hbs`, `c/app-ui/skeleton/widget-grid.hbs`, `app/index.html`, `t/app/agent/create.hbs`, `t/app/agent/index.hbs`, `t/app/agent/page.hbs`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`, `t/app/developer.hbs`, `t/app/error.hbs`, `t/app/index.hbs`, `t/app/project.hbs`, `t/app/projects/create-loading.hbs`, `t/app/projects/create.hbs`, `t/app/projects/edit-loading.hbs`, `t/app/projects/index-loading.hbs`, `t/app/projects/index.hbs`, `t/app/role.hbs`, `t/app/settings-loading.hbs`, `t/app/settings.hbs`, `t/app/user/create.hbs`, `t/app/user/management.hbs`, `t/app/user/page.hbs`, `t/app/workflow/index.hbs`, `t/app/workspace/index.hbs`, `t/app/workspace/settings.hbs`, `t/app/workspaces/create.hbs`, `t/app/workspaces/index.hbs`, `t/auth-status.hbs`, `t/reset-password.hbs`, `t/signin.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.content { min-height:250px;padding:15px;margin-right:auto;margin-left:auto;padding-left:15px;padding-right:15px }   /* adminlte */
```

#### `.content-header`

- Key: `shell-layout`
- Source: hbs; 30 file(s): `c/app-ui/skeleton/page-loading.hbs`, `c/app-ui/skeleton/user-management.hbs`, `c/app-ui/skeleton/user-profile.hbs`, `c/app-ui/skeleton/widget-grid.hbs`, `app/index.html`, `t/app/agent/create.hbs`, `t/app/agent/index.hbs`, `t/app/agent/page.hbs`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`, `t/app/developer.hbs`, `t/app/index.hbs`, `t/app/project.hbs`, `t/app/projects/create-loading.hbs`, `t/app/projects/create.hbs`, `t/app/projects/edit-loading.hbs`, `t/app/projects/index-loading.hbs`, `t/app/projects/index.hbs`, `t/app/role.hbs`, `t/app/settings-loading.hbs`, `t/app/settings.hbs`, `t/app/user/create.hbs`, `t/app/user/management.hbs`, `t/app/user/page.hbs`, `t/app/workflow/index.hbs`, `t/app/workspace/index.hbs`, `t/app/workspace/settings.hbs`, `t/app/workspaces/create.hbs`, `t/app/workspaces/index.hbs`, `t/auth-status.hbs`
- Vendor: adminlte, skin; states: before; breakpoints: @media (max-width:991px); @media print

```css
.content-header { position:relative;padding:15px 15px 0 15px }   /* adminlte */
.content-header>h1 { margin:0;font-size:24px }   /* adminlte */
.content-header>h1>small { font-size:15px;display:inline-block;padding-left:4px;font-weight:300 }   /* adminlte */
.content-header>.breadcrumb { float:right;background:transparent;margin-top:0;margin-bottom:0;font-size:12px;padding:7px 5px;position:absolute;top:15px;right:10px;border-radius:2px }   /* adminlte */
.content-header>.breadcrumb>li>a { color:#444;text-decoration:none;display:inline-block }   /* adminlte */
.content-header>.breadcrumb>li>a>.fa, .content-header>.breadcrumb>li>a>.glyphicon, .content-header>.breadcrumb>li>a>.ion { margin-right:5px }   /* adminlte */
.content-header>.breadcrumb>li+li:before { content:'>\00a0' }   /* adminlte */
@media (max-width:991px) { .content-header>.breadcrumb { position:relative;margin-top:5px;top:0;right:0;float:none;background:#d2d6de;padding-left:10px } }   /* adminlte */
@media (max-width:991px) { .content-header>.breadcrumb li:before { color:#97a0b3 } }   /* adminlte */
@media print { .content-header { display:none !important } }   /* adminlte */
.skin-black-light .content-header { background:transparent;box-shadow:none }   /* skin */
```

#### `.content-wrapper`

- Key: `shell-layout`
- Source: hbs/js-template; 3 file(s): `c/app-layouts/application-content.hbs`, `c/app-layouts/application-content.js`, `app/index.html`
- Vendor: adminlte, skin; states: none; breakpoints: @media (max-width:767px); @media (min-width:768px); @media print

```css
.content-wrapper { -webkit-transition:-webkit-transform .3s ease-in-out,margin .3s ease-in-out;-moz-transition:-moz-transform .3s ease-in-out,margin .3s ease-in-out;-o-transition:-o-transform .3s ease-in-out,margin .3s ease-in-out;transition:transform .3s ease-in-out,margin .3s ease-in-out;margin-left:230px;z-index:820 }   /* adminlte */
@media (max-width:767px) { .content-wrapper { margin-left:0 } }   /* adminlte */
@media (min-width:768px) { .sidebar-collapse .content-wrapper { margin-left:0 } }   /* adminlte */
@media (max-width:767px) { .sidebar-open .content-wrapper { -webkit-transform:translate(230px, 0);-ms-transform:translate(230px, 0);-o-transform:translate(230px, 0);transform:translate(230px, 0) } }   /* adminlte */
.content-wrapper { min-height:100%;background-color:#ecf0f5;z-index:800 }   /* adminlte */
.fixed .content-wrapper { padding-top:50px }   /* adminlte */
@media (max-width:767px) { .fixed .content-wrapper { padding-top:100px } }   /* adminlte */
body.hold-transition .content-wrapper { -webkit-transition:none;-o-transition:none;transition:none }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .content-wrapper { margin-left:50px !important;z-index:840 } }   /* adminlte */
@media print { .content-wrapper { margin-left:0 !important;min-height:0 !important;-webkit-transform:translate(0, 0) !important;-ms-transform:translate(0, 0) !important;-o-transform:translate(0, 0) !important;transform:translate(0, 0) !important } }   /* adminlte */
@media print { .fixed .content-wrapper { padding-top:0 !important } }   /* adminlte */
.skin-black-light .content-wrapper { border-left:1px solid #d2d6de }   /* skin */
```

#### `.fixed`

- Key: `shell-layout`
- Source: hbs; 1 file(s): `app/index.html`
- Vendor: adminlte; states: none; breakpoints: @media (max-width:767px); @media print

```css
.fixed .main-header, .fixed .main-sidebar { position:fixed }   /* adminlte */
.fixed .main-header { top:0;right:0;left:0 }   /* adminlte */
.fixed .content-wrapper { padding-top:50px }   /* adminlte */
@media (max-width:767px) { .fixed .content-wrapper { padding-top:100px } }   /* adminlte */
@media print { .fixed .content-wrapper { padding-top:0 !important } }   /* adminlte */
```

#### `.hold-transition`

- Key: `shell-layout`
- Source: hbs; 1 file(s): `app/index.html`
- Vendor: adminlte; states: none; breakpoints: none

```css
body.hold-transition .content-wrapper, body.hold-transition .main-footer, body.hold-transition .main-sidebar, body.hold-transition .main-header .navbar, body.hold-transition .main-header .logo { -webkit-transition:none;-o-transition:none;transition:none }   /* adminlte */
```

#### `.logo`

- Key: `shell-layout`
- Source: hbs; 2 file(s): `c/app-layouts/application-header.hbs`, `app/index.html`
- Vendor: adminlte, skin; states: hover; breakpoints: @media (max-width:767px); @media (min-width:768px)

```css
body.hold-transition .main-header .logo { -webkit-transition:none;-o-transition:none;transition:none }   /* adminlte */
.main-header .logo { -webkit-transition:width .3s ease-in-out;-o-transition:width .3s ease-in-out;transition:width .3s ease-in-out;display:block;float:left;height:50px;font-size:20px;line-height:50px;text-align:center;width:230px;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;padding:0 15px;font-weight:300;overflow:hidden }   /* adminlte */
.main-header .logo .logo-lg { display:block }   /* adminlte */
.main-header .logo .logo-mini { display:none }   /* adminlte */
@media (max-width:767px) { .main-header .logo { width:100%;float:none } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .main-header .logo { width:50px } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .main-header .logo>.logo-mini { display:block;margin-left:-15px;margin-right:-15px;font-size:18px } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .main-header .logo>.logo-lg { display:none } }   /* adminlte */
.skin-black-light .main-header>.logo { background-color:#fff;color:#333;border-bottom:0 solid transparent;border-right:1px solid #eee }   /* skin */
.skin-black-light .main-header>.logo:hover { background-color:#fcfcfc }   /* skin */
@media (max-width:767px) { .skin-black-light .main-header>.logo { background-color:#222;color:#fff;border-bottom:0 solid transparent;border-right:none } }   /* skin */
@media (max-width:767px) { .skin-black-light .main-header>.logo:hover { background-color:#1f1f1f } }   /* skin */
```

#### `.logo-lg`

- Key: `shell-layout`
- Source: hbs; 1 file(s): `c/app-layouts/application-header.hbs`
- Vendor: adminlte; states: none; breakpoints: @media (min-width:768px)

```css
.main-header .logo .logo-lg { display:block }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .main-header .logo>.logo-lg { display:none } }   /* adminlte */
```

#### `.logo-mini`

- Key: `shell-layout`
- Source: hbs; 1 file(s): `c/app-layouts/application-header.hbs`
- Vendor: adminlte; states: none; breakpoints: @media (min-width:768px)

```css
.main-header .logo .logo-mini { display:none }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .main-header .logo>.logo-mini { display:block;margin-left:-15px;margin-right:-15px;font-size:18px } }   /* adminlte */
```

#### `.main-footer`

- Key: `shell-layout`
- Source: hbs; 1 file(s): `c/app-layouts/application-footer.hbs`
- Vendor: adminlte, skin; states: none; breakpoints: @media (max-width:767px); @media (min-width:768px); @media print

```css
.main-footer { -webkit-transition:-webkit-transform .3s ease-in-out,margin .3s ease-in-out;-moz-transition:-moz-transform .3s ease-in-out,margin .3s ease-in-out;-o-transition:-o-transform .3s ease-in-out,margin .3s ease-in-out;transition:transform .3s ease-in-out,margin .3s ease-in-out;margin-left:230px;z-index:820 }   /* adminlte */
@media (max-width:767px) { .main-footer { margin-left:0 } }   /* adminlte */
@media (min-width:768px) { .sidebar-collapse .main-footer { margin-left:0 } }   /* adminlte */
@media (max-width:767px) { .sidebar-open .main-footer { -webkit-transform:translate(230px, 0);-ms-transform:translate(230px, 0);-o-transform:translate(230px, 0);transform:translate(230px, 0) } }   /* adminlte */
.main-footer { background:#fff;padding:15px;color:#444;border-top:1px solid #d2d6de }   /* adminlte */
body.hold-transition .main-footer { -webkit-transition:none;-o-transition:none;transition:none }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .main-footer { margin-left:50px !important;z-index:840 } }   /* adminlte */
@media print { .main-footer { margin-left:0 !important;min-height:0 !important;-webkit-transform:translate(0, 0) !important;-ms-transform:translate(0, 0) !important;-o-transform:translate(0, 0) !important;transform:translate(0, 0) !important } }   /* adminlte */
.skin-black-light .main-footer { border-left:1px solid #d2d6de }   /* skin */
```

#### `.main-header`

- Key: `shell-layout`
- Source: hbs/js-selector; 3 file(s): `c/app-layouts/application-header.hbs`, `app/index.html`, `app/modifiers/sticky-lane-headers.js`
- Vendor: adminlte, skin; states: -moz-placeholder, -ms-input-placeholder, -webkit-input-placeholder, .active, .open, active, before, focus, hover; breakpoints: @media (max-width:767px); @media (max-width:991px); @media (min-width:768px); @media print

```css
.fixed .main-header { position:fixed }   /* adminlte */
.fixed .main-header { top:0;right:0;left:0 }   /* adminlte */
body.hold-transition .main-header .navbar, body.hold-transition .main-header .logo { -webkit-transition:none;-o-transition:none;transition:none }   /* adminlte */
.main-header { position:relative;max-height:100px;z-index:1030 }   /* adminlte */
.main-header .navbar { -webkit-transition:margin-left .3s ease-in-out;-o-transition:margin-left .3s ease-in-out;transition:margin-left .3s ease-in-out;margin-bottom:0;margin-left:230px;border:none;min-height:50px;border-radius:0 }   /* adminlte */
.main-header #navbar-search-input.form-control { background:rgba(255,255,255,0.2);border-color:transparent }   /* adminlte */
.main-header #navbar-search-input.form-control:focus, .main-header #navbar-search-input.form-control:active { border-color:rgba(0,0,0,0.1);background:rgba(255,255,255,0.9) }   /* adminlte */
.main-header #navbar-search-input.form-control::-moz-placeholder { color:#ccc;opacity:1 }   /* adminlte */
.main-header #navbar-search-input.form-control:-ms-input-placeholder { color:#ccc }   /* adminlte */
.main-header #navbar-search-input.form-control::-webkit-input-placeholder { color:#ccc }   /* adminlte */
.main-header .navbar-custom-menu { float:right }   /* adminlte */
@media (max-width:991px) { .main-header .navbar-custom-menu a { color:inherit;background:transparent } }   /* adminlte */
.main-header .sidebar-toggle { float:left;background-color:transparent;background-image:none;padding:15px 15px;font-family:fontAwesome }   /* adminlte */
.main-header .sidebar-toggle:before { content:"\f0c9" }   /* adminlte */
.main-header .sidebar-toggle:hover { color:#fff }   /* adminlte */
.main-header .sidebar-toggle:focus, .main-header .sidebar-toggle:active { background:transparent }   /* adminlte */
.main-header .navbar .nav>li.user>a>.fa, .main-header .navbar .nav>li.user>a>.glyphicon, .main-header .navbar .nav>li.user>a>.ion { margin-right:5px }   /* adminlte */
.main-header .navbar .nav>li>a>.label { position:absolute;top:9px;right:7px;text-align:center;font-size:9px;padding:2px 3px;line-height:.9 }   /* adminlte */
.main-header .logo { -webkit-transition:width .3s ease-in-out;-o-transition:width .3s ease-in-out;transition:width .3s ease-in-out;display:block;float:left;height:50px;font-size:20px;line-height:50px;text-align:center;width:230px;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;padding:0 15px;font-weight:300;overflow:hidden }   /* adminlte */
.main-header .logo .logo-lg { display:block }   /* adminlte */
.main-header .logo .logo-mini { display:none }   /* adminlte */
@media (max-width:767px) { .main-header { position:relative } }   /* adminlte */
@media (max-width:767px) { .main-header .logo, .main-header .navbar { width:100%;float:none } }   /* adminlte */
@media (max-width:767px) { .main-header .navbar { margin:0 } }   /* adminlte */
@media (max-width:767px) { .main-header .navbar-custom-menu { float:right } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .main-header .logo { width:50px } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .main-header .logo>.logo-mini { display:block;margin-left:-15px;margin-right:-15px;font-size:18px } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .main-header .logo>.logo-lg { display:none } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .main-header .navbar { margin-left:50px } }   /* adminlte */
@media print { .main-header { display:none !important } }   /* adminlte */
.skin-black-light .main-header { -webkit-box-shadow:0 1px 1px rgba(0,0,0,0.05);box-shadow:0 1px 1px rgba(0,0,0,0.05) }   /* skin */
.skin-black-light .main-header .navbar { background-color:#fff }   /* skin */
.skin-black-light .main-header .navbar .nav>li>a { color:#333 }   /* skin */
.skin-black-light .main-header .navbar .nav>li>a:hover, .skin-black-light .main-header .navbar .nav>li>a:active, .skin-black-light .main-header .navbar .nav>li>a:focus, .skin-black-light .main-header .navbar .nav .open>a, .skin-black-light .main-header .navbar .nav .open>a:hover, .skin-black-light .main-header .navbar .nav .open>a:focus, .skin-black-light .main-header .navbar .nav>.active>a { background:#fff;color:#999 }   /* skin */
.skin-black-light .main-header .navbar .sidebar-toggle { color:#333 }   /* skin */
.skin-black-light .main-header .navbar .sidebar-toggle:hover { color:#999;background:#fff }   /* skin */
.skin-black-light .main-header .navbar>.sidebar-toggle { color:#333;border-right:1px solid #eee }   /* skin */
.skin-black-light .main-header .navbar .navbar-nav>li>a { border-right:1px solid #eee }   /* skin */
.skin-black-light .main-header .navbar .navbar-custom-menu .navbar-nav>li>a { border-left:1px solid #eee;border-right-width:0 }   /* skin */
.skin-black-light .main-header>.logo { background-color:#fff;color:#333;border-bottom:0 solid transparent;border-right:1px solid #eee }   /* skin */
.skin-black-light .main-header>.logo:hover { background-color:#fcfcfc }   /* skin */
@media (max-width:767px) { .skin-black-light .main-header>.logo { background-color:#222;color:#fff;border-bottom:0 solid transparent;border-right:none } }   /* skin */
@media (max-width:767px) { .skin-black-light .main-header>.logo:hover { background-color:#1f1f1f } }   /* skin */
.skin-black-light .main-header li.user-header { background-color:#222 }   /* skin */
```

#### `.navbar`

- Key: `shell-layout`
- Source: hbs; 2 file(s): `c/app-layouts/application-header.hbs`, `app/index.html`
- Vendor: adminlte, bootstrap, skin; states: .active, .open, active, after, before, focus, hover; breakpoints: @media (max-width:767px); @media (min-width: 768px); @media (min-width:768px); @media print

```css
@media print { .navbar { display: none; } }   /* bootstrap */
.navbar { position: relative; min-height: 50px; margin-bottom: 20px; border: 1px solid transparent; }   /* bootstrap */
.navbar:before, .navbar:after { display: table; content: " "; }   /* bootstrap */
.navbar:after { clear: both; }   /* bootstrap */
@media (min-width: 768px) { .navbar { border-radius: 4px; } }   /* bootstrap */
body.hold-transition .main-header .navbar { -webkit-transition:none;-o-transition:none;transition:none }   /* adminlte */
.main-header .navbar { -webkit-transition:margin-left .3s ease-in-out;-o-transition:margin-left .3s ease-in-out;transition:margin-left .3s ease-in-out;margin-bottom:0;margin-left:230px;border:none;min-height:50px;border-radius:0 }   /* adminlte */
.main-header .navbar .nav>li.user>a>.fa, .main-header .navbar .nav>li.user>a>.glyphicon, .main-header .navbar .nav>li.user>a>.ion { margin-right:5px }   /* adminlte */
.main-header .navbar .nav>li>a>.label { position:absolute;top:9px;right:7px;text-align:center;font-size:9px;padding:2px 3px;line-height:.9 }   /* adminlte */
@media (max-width:767px) { .main-header .navbar { width:100%;float:none } }   /* adminlte */
@media (max-width:767px) { .main-header .navbar { margin:0 } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .main-header .navbar { margin-left:50px } }   /* adminlte */
.skin-black-light .main-header .navbar { background-color:#fff }   /* skin */
.skin-black-light .main-header .navbar .nav>li>a { color:#333 }   /* skin */
.skin-black-light .main-header .navbar .nav>li>a:hover, .skin-black-light .main-header .navbar .nav>li>a:active, .skin-black-light .main-header .navbar .nav>li>a:focus, .skin-black-light .main-header .navbar .nav .open>a, .skin-black-light .main-header .navbar .nav .open>a:hover, .skin-black-light .main-header .navbar .nav .open>a:focus, .skin-black-light .main-header .navbar .nav>.active>a { background:#fff;color:#999 }   /* skin */
.skin-black-light .main-header .navbar .sidebar-toggle { color:#333 }   /* skin */
.skin-black-light .main-header .navbar .sidebar-toggle:hover { color:#999;background:#fff }   /* skin */
.skin-black-light .main-header .navbar>.sidebar-toggle { color:#333;border-right:1px solid #eee }   /* skin */
.skin-black-light .main-header .navbar .navbar-nav>li>a { border-right:1px solid #eee }   /* skin */
.skin-black-light .main-header .navbar .navbar-custom-menu .navbar-nav>li>a { border-left:1px solid #eee;border-right-width:0 }   /* skin */
```

#### `.navbar-custom-menu`

- Key: `shell-layout`
- Source: hbs; 2 file(s): `c/app-layouts/application-header.hbs`, `app/index.html`
- Vendor: adminlte, skin; states: none; breakpoints: @media (max-width:767px); @media (max-width:991px)

```css
.main-header .navbar-custom-menu { float:right }   /* adminlte */
@media (max-width:991px) { .main-header .navbar-custom-menu a { color:inherit;background:transparent } }   /* adminlte */
@media (max-width:991px) { .navbar-custom-menu .navbar-nav>li { float:left } }   /* adminlte */
@media (max-width:991px) { .navbar-custom-menu .navbar-nav { margin:0;float:left } }   /* adminlte */
@media (max-width:991px) { .navbar-custom-menu .navbar-nav>li>a { padding-top:15px;padding-bottom:15px;line-height:20px } }   /* adminlte */
@media (max-width:767px) { .main-header .navbar-custom-menu { float:right } }   /* adminlte */
.navbar-custom-menu>.navbar-nav>li { position:relative }   /* adminlte */
.navbar-custom-menu>.navbar-nav>li>.dropdown-menu { position:absolute;right:0;left:auto }   /* adminlte */
@media (max-width:991px) { .navbar-custom-menu>.navbar-nav { float:right } }   /* adminlte */
@media (max-width:991px) { .navbar-custom-menu>.navbar-nav>li { position:static } }   /* adminlte */
@media (max-width:991px) { .navbar-custom-menu>.navbar-nav>li>.dropdown-menu { position:absolute;right:5%;left:auto;border:1px solid #ddd;background:#fff } }   /* adminlte */
.skin-black-light .main-header .navbar .navbar-custom-menu .navbar-nav>li>a { border-left:1px solid #eee;border-right-width:0 }   /* skin */
```

#### `.navbar-nav`

- Key: `shell-layout`
- Source: hbs; 2 file(s): `c/app-layouts/application-header.hbs`, `app/index.html`
- Vendor: adminlte, bootstrap, skin; states: .open, after, before, focus, hover; breakpoints: @media (max-width: 767px); @media (max-width:767px); @media (max-width:991px); @media (min-width: 768px)

```css
.navbar-nav { margin: 7.5px -15px; }   /* bootstrap */
.navbar-nav > li > a { padding-top: 10px; padding-bottom: 10px; line-height: 20px; }   /* bootstrap */
@media (max-width: 767px) { .navbar-nav .open .dropdown-menu { position: static; float: none; width: auto; margin-top: 0; background-color: transparent; border: 0; box-shadow: none; } }   /* bootstrap */
@media (max-width: 767px) { .navbar-nav .open .dropdown-menu > li > a, .navbar-nav .open .dropdown-menu .dropdown-header { padding: 5px 15px 5px 25px; } }   /* bootstrap */
@media (max-width: 767px) { .navbar-nav .open .dropdown-menu > li > a { line-height: 20px; } }   /* bootstrap */
@media (max-width: 767px) { .navbar-nav .open .dropdown-menu > li > a:hover, .navbar-nav .open .dropdown-menu > li > a:focus { background-image: none; } }   /* bootstrap */
@media (min-width: 768px) { .navbar-nav { float: left; margin: 0; } }   /* bootstrap */
@media (min-width: 768px) { .navbar-nav > li { float: left; } }   /* bootstrap */
@media (min-width: 768px) { .navbar-nav > li > a { padding-top: 15px; padding-bottom: 15px; } }   /* bootstrap */
.navbar-nav > li > .dropdown-menu { margin-top: 0; border-top-left-radius: 0; border-top-right-radius: 0; }   /* bootstrap */
@media (max-width:991px) { .navbar-custom-menu .navbar-nav>li { float:left } }   /* adminlte */
@media (max-width:991px) { .navbar-custom-menu .navbar-nav { margin:0;float:left } }   /* adminlte */
@media (max-width:991px) { .navbar-custom-menu .navbar-nav>li>a { padding-top:15px;padding-bottom:15px;line-height:20px } }   /* adminlte */
.navbar-nav>.notifications-menu>.dropdown-menu { width:280px;padding:0 0 0 0;margin:0;top:100% }   /* adminlte */
.navbar-nav>.notifications-menu>.dropdown-menu>li { position:relative }   /* adminlte */
.navbar-nav>.notifications-menu>.dropdown-menu>li.header { border-top-left-radius:4px;border-top-right-radius:4px;border-bottom-right-radius:0;border-bottom-left-radius:0;background-color:#ffffff;padding:7px 10px;border-bottom:1px solid #f4f4f4;color:#444444;font-size:14px }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu { border-top-right-radius:0;border-top-left-radius:0;padding:1px 0 0 0;border-top-width:0;width:280px }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu { border-bottom-right-radius:4px;border-bottom-left-radius:4px }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>li.user-header { height:175px;padding:10px;text-align:center }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>li.user-header>img { z-index:5;height:90px;width:90px;border:3px solid;border-color:transparent;border-color:rgba(255,255,255,0.2) }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>li.user-header>p { z-index:5;color:#fff;color:rgba(255,255,255,0.8);font-size:17px;margin-top:10px }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>li.user-header>p>small { display:block;font-size:12px }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>.user-footer { background-color:#f9f9f9;padding:10px }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>.user-footer:before, .navbar-nav>.user-menu>.dropdown-menu>.user-footer:after { content:" ";display:table }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>.user-footer:after { clear:both }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>.user-footer .btn-default { color:#666666 }   /* adminlte */
@media (max-width:991px) { .navbar-nav>.user-menu>.dropdown-menu>.user-footer .btn-default:hover { background-color:#f9f9f9 } }   /* adminlte */
.navbar-nav>.user-menu .user-image { float:left;width:25px;height:25px;border-radius:50%;margin-right:10px;margin-top:-2px }   /* adminlte */
@media (max-width:767px) { .navbar-nav>.user-menu .user-image { float:none;margin-right:0;margin-top:-8px;line-height:10px } }   /* adminlte */
.navbar-custom-menu>.navbar-nav>li { position:relative }   /* adminlte */
.navbar-custom-menu>.navbar-nav>li>.dropdown-menu { position:absolute;right:0;left:auto }   /* adminlte */
@media (max-width:991px) { .navbar-custom-menu>.navbar-nav { float:right } }   /* adminlte */
@media (max-width:991px) { .navbar-custom-menu>.navbar-nav>li { position:static } }   /* adminlte */
@media (max-width:991px) { .navbar-custom-menu>.navbar-nav>li>.dropdown-menu { position:absolute;right:5%;left:auto;border:1px solid #ddd;background:#fff } }   /* adminlte */
.skin-black-light .main-header .navbar .navbar-nav>li>a { border-right:1px solid #eee }   /* skin */
.skin-black-light .main-header .navbar .navbar-custom-menu .navbar-nav>li>a { border-left:1px solid #eee;border-right-width:0 }   /* skin */
```

#### `.navbar-static-top`

- Key: `shell-layout`
- Source: hbs; 2 file(s): `c/app-layouts/application-header.hbs`, `app/index.html`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 768px)

```css
.navbar-static-top { z-index: 1000; border-width: 0 0 1px; }   /* bootstrap */
@media (min-width: 768px) { .navbar-static-top { border-radius: 0; } }   /* bootstrap */
```

#### `.notifications-menu`

- Key: `shell-layout`
- Source: hbs; 1 file(s): `c/app-layouts/application-header.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.navbar-nav>.notifications-menu>.dropdown-menu { width:280px;padding:0 0 0 0;margin:0;top:100% }   /* adminlte */
.navbar-nav>.notifications-menu>.dropdown-menu>li { position:relative }   /* adminlte */
.navbar-nav>.notifications-menu>.dropdown-menu>li.header { border-top-left-radius:4px;border-top-right-radius:4px;border-bottom-right-radius:0;border-bottom-left-radius:0;background-color:#ffffff;padding:7px 10px;border-bottom:1px solid #f4f4f4;color:#444444;font-size:14px }   /* adminlte */
```

#### `.skin-black-light`

- Key: `shell-layout`
- Source: hbs; 1 file(s): `app/index.html`
- Vendor: skin; states: .active, .open, active, focus, hover; breakpoints: @media (max-width:767px); @media (min-width:768px)

```css
.skin-black-light .main-header { -webkit-box-shadow:0 1px 1px rgba(0,0,0,0.05);box-shadow:0 1px 1px rgba(0,0,0,0.05) }   /* skin */
.skin-black-light .main-header .navbar { background-color:#fff }   /* skin */
.skin-black-light .main-header .navbar .nav>li>a { color:#333 }   /* skin */
.skin-black-light .main-header .navbar .nav>li>a:hover, .skin-black-light .main-header .navbar .nav>li>a:active, .skin-black-light .main-header .navbar .nav>li>a:focus, .skin-black-light .main-header .navbar .nav .open>a, .skin-black-light .main-header .navbar .nav .open>a:hover, .skin-black-light .main-header .navbar .nav .open>a:focus, .skin-black-light .main-header .navbar .nav>.active>a { background:#fff;color:#999 }   /* skin */
.skin-black-light .main-header .navbar .sidebar-toggle { color:#333 }   /* skin */
.skin-black-light .main-header .navbar .sidebar-toggle:hover { color:#999;background:#fff }   /* skin */
.skin-black-light .main-header .navbar>.sidebar-toggle { color:#333;border-right:1px solid #eee }   /* skin */
.skin-black-light .main-header .navbar .navbar-nav>li>a { border-right:1px solid #eee }   /* skin */
.skin-black-light .main-header .navbar .navbar-custom-menu .navbar-nav>li>a { border-left:1px solid #eee;border-right-width:0 }   /* skin */
.skin-black-light .main-header>.logo { background-color:#fff;color:#333;border-bottom:0 solid transparent;border-right:1px solid #eee }   /* skin */
.skin-black-light .main-header>.logo:hover { background-color:#fcfcfc }   /* skin */
@media (max-width:767px) { .skin-black-light .main-header>.logo { background-color:#222;color:#fff;border-bottom:0 solid transparent;border-right:none } }   /* skin */
@media (max-width:767px) { .skin-black-light .main-header>.logo:hover { background-color:#1f1f1f } }   /* skin */
.skin-black-light .main-header li.user-header { background-color:#222 }   /* skin */
.skin-black-light .content-header { background:transparent;box-shadow:none }   /* skin */
.skin-black-light .wrapper, .skin-black-light .main-sidebar { background-color:#f9fafc }   /* skin */
.skin-black-light .content-wrapper, .skin-black-light .main-footer { border-left:1px solid #d2d6de }   /* skin */
.skin-black-light .sidebar-menu>li { -webkit-transition:border-left-color .3s ease;-o-transition:border-left-color .3s ease;transition:border-left-color .3s ease }   /* skin */
.skin-black-light .sidebar-menu>li.header { color:#848484;background:#f9fafc }   /* skin */
.skin-black-light .sidebar-menu>li>a { border-left:3px solid transparent;font-weight:600 }   /* skin */
.skin-black-light .sidebar-menu>li:hover>a, .skin-black-light .sidebar-menu>li.active>a { color:#000;background:#f4f4f5 }   /* skin */
.skin-black-light .sidebar-menu>li.active { border-left-color:#fff }   /* skin */
.skin-black-light .sidebar-menu>li.active>a { font-weight:600 }   /* skin */
.skin-black-light .sidebar-menu>li>.treeview-menu { background:#f4f4f5 }   /* skin */
.skin-black-light .sidebar a { color:#444 }   /* skin */
.skin-black-light .sidebar a:hover { text-decoration:none }   /* skin */
.skin-black-light .treeview-menu>li>a { color:#777 }   /* skin */
.skin-black-light .treeview-menu>li.active>a, .skin-black-light .treeview-menu>li>a:hover { color:#000 }   /* skin */
.skin-black-light .treeview-menu>li.active>a { font-weight:600 }   /* skin */
@media (min-width:768px) { .skin-black-light.sidebar-mini.sidebar-collapse .sidebar-menu>li>.treeview-menu { border-left:1px solid #d2d6de } }   /* skin */
```

#### `.user`

- Key: `shell-layout` (`.navbar-custom-menu > .navbar-nav > li.user`)
- Source: hbs/js; 5 file(s): `c/app-layouts/application-header.hbs`, `c/developer/demos/dropdown.js`, `c/role/permissions.js`, `app/locales/en-us/translations.js`, `app/services/breadcrumb.js`
- Vendor: adminlte; states: none; breakpoints: none

```css
.main-header .navbar .nav>li.user>a>.fa, .main-header .navbar .nav>li.user>a>.glyphicon, .main-header .navbar .nav>li.user>a>.ion { margin-right:5px }   /* adminlte */
```

#### `.user-footer`

- Key: `shell-layout`
- Source: hbs; 1 file(s): `c/app-layouts/application-header.hbs`
- Vendor: adminlte; states: after, before, hover; breakpoints: @media (max-width:991px)

```css
.navbar-nav>.user-menu>.dropdown-menu>.user-footer { background-color:#f9f9f9;padding:10px }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>.user-footer:before, .navbar-nav>.user-menu>.dropdown-menu>.user-footer:after { content:" ";display:table }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>.user-footer:after { clear:both }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>.user-footer .btn-default { color:#666666 }   /* adminlte */
@media (max-width:991px) { .navbar-nav>.user-menu>.dropdown-menu>.user-footer .btn-default:hover { background-color:#f9f9f9 } }   /* adminlte */
```

#### `.user-header`

- Key: `shell-layout`
- Source: hbs; 2 file(s): `c/app-layouts/application-header.hbs`, `t/app/user/create.hbs`
- Vendor: adminlte, skin; states: none; breakpoints: none

```css
.navbar-nav>.user-menu>.dropdown-menu>li.user-header { height:175px;padding:10px;text-align:center }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>li.user-header>img { z-index:5;height:90px;width:90px;border:3px solid;border-color:transparent;border-color:rgba(255,255,255,0.2) }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>li.user-header>p { z-index:5;color:#fff;color:rgba(255,255,255,0.8);font-size:17px;margin-top:10px }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>li.user-header>p>small { display:block;font-size:12px }   /* adminlte */
.skin-black-light .main-header li.user-header { background-color:#222 }   /* skin */
```

#### `.user-image`

- Key: `shell-layout`
- Source: hbs; 1 file(s): `c/app-ui/notifications/notification.hbs`
- Vendor: adminlte; states: none; breakpoints: @media (max-width:767px)

```css
.navbar-nav>.user-menu .user-image { float:left;width:25px;height:25px;border-radius:50%;margin-right:10px;margin-top:-2px }   /* adminlte */
@media (max-width:767px) { .navbar-nav>.user-menu .user-image { float:none;margin-right:0;margin-top:-8px;line-height:10px } }   /* adminlte */
```

#### `.user-menu`

- Key: `shell-layout`
- Source: hbs; 1 file(s): `c/app-layouts/application-header.hbs`
- Vendor: adminlte; states: after, before, hover; breakpoints: @media (max-width:767px); @media (max-width:991px)

```css
.navbar-nav>.user-menu>.dropdown-menu { border-top-right-radius:0;border-top-left-radius:0;padding:1px 0 0 0;border-top-width:0;width:280px }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu { border-bottom-right-radius:4px;border-bottom-left-radius:4px }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>li.user-header { height:175px;padding:10px;text-align:center }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>li.user-header>img { z-index:5;height:90px;width:90px;border:3px solid;border-color:transparent;border-color:rgba(255,255,255,0.2) }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>li.user-header>p { z-index:5;color:#fff;color:rgba(255,255,255,0.8);font-size:17px;margin-top:10px }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>li.user-header>p>small { display:block;font-size:12px }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>.user-footer { background-color:#f9f9f9;padding:10px }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>.user-footer:before, .navbar-nav>.user-menu>.dropdown-menu>.user-footer:after { content:" ";display:table }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>.user-footer:after { clear:both }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>.user-footer .btn-default { color:#666666 }   /* adminlte */
@media (max-width:991px) { .navbar-nav>.user-menu>.dropdown-menu>.user-footer .btn-default:hover { background-color:#f9f9f9 } }   /* adminlte */
.navbar-nav>.user-menu .user-image { float:left;width:25px;height:25px;border-radius:50%;margin-right:10px;margin-top:-2px }   /* adminlte */
@media (max-width:767px) { .navbar-nav>.user-menu .user-image { float:none;margin-right:0;margin-top:-8px;line-height:10px } }   /* adminlte */
```

#### `.wrapper`

- Key: `shell-layout`
- Source: hbs/js-template; 4 file(s): `c/app-layouts/application-wrapper.hbs`, `c/app-layouts/application-wrapper.js`, `app/index.html`, `app/modifiers/sidebar-body-classes.js`
- Vendor: adminlte, skin; states: after, before; breakpoints: none

```css
.wrapper { min-height:100%;position:relative;overflow:hidden }   /* adminlte */
.wrapper:before, .wrapper:after { content:" ";display:table }   /* adminlte */
.wrapper:after { clear:both }   /* adminlte */
.skin-black-light .wrapper { background-color:#f9fafc }   /* skin */
```


### `shell-sidebar`

#### `.header`

- Key: `shell-sidebar` (`.sidebar-menu > li.header`, `.user-header`-adjacent rules in header menus)
- Source: hbs; 2 file(s): `c/app-ui/nav-bar.hbs`, `t/app/user/management.hbs`
- Vendor: adminlte, skin; states: none; breakpoints: @media (min-width:768px)

```css
.sidebar-menu li.header { padding:10px 25px 10px 15px;font-size:12px }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu li.header { display:none !important;-webkit-transform:translateZ(0) } }   /* adminlte */
.sidebar-menu>li.header { white-space:nowrap;overflow:hidden }   /* adminlte */
.sidebar-menu>li.header { overflow:hidden;text-overflow:clip }   /* adminlte */
.navbar-nav>.notifications-menu>.dropdown-menu>li.header { border-top-left-radius:4px;border-top-right-radius:4px;border-bottom-right-radius:0;border-bottom-left-radius:0;background-color:#ffffff;padding:7px 10px;border-bottom:1px solid #f4f4f4;color:#444444;font-size:14px }   /* adminlte */
.nav-stacked>li.header { border-bottom:1px solid #ddd;color:#777;margin-bottom:10px;padding:5px 10px;text-transform:uppercase }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li.header { line-height:35px;padding:0 10px;font-size:20px;color:#444 }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li.header>.fa, .nav-tabs-custom>.nav-tabs>li.header>.glyphicon, .nav-tabs-custom>.nav-tabs>li.header>.ion { margin-right:5px }   /* adminlte */
.skin-black-light .sidebar-menu>li.header { color:#848484;background:#f9fafc }   /* skin */
```

#### `.main-sidebar`

- Key: `shell-sidebar`
- Source: hbs; 2 file(s): `c/app-layouts/application-sidebar.hbs`, `app/index.html`
- Vendor: adminlte, skin; states: none; breakpoints: @media (max-width:767px); @media (min-width:768px); @media print

```css
.fixed .main-sidebar { position:fixed }   /* adminlte */
body.hold-transition .main-sidebar { -webkit-transition:none;-o-transition:none;transition:none }   /* adminlte */
.main-sidebar { position:absolute;top:0;left:0;padding-top:50px;min-height:100%;width:230px;z-index:810;-webkit-transition:-webkit-transform .3s ease-in-out,width .3s ease-in-out;-moz-transition:-moz-transform .3s ease-in-out,width .3s ease-in-out;-o-transition:-o-transform .3s ease-in-out,width .3s ease-in-out;transition:transform .3s ease-in-out,width .3s ease-in-out }   /* adminlte */
@media (max-width:767px) { .main-sidebar { padding-top:100px } }   /* adminlte */
@media (max-width:767px) { .main-sidebar { -webkit-transform:translate(-230px, 0);-ms-transform:translate(-230px, 0);-o-transform:translate(-230px, 0);transform:translate(-230px, 0) } }   /* adminlte */
@media (min-width:768px) { .sidebar-collapse .main-sidebar { -webkit-transform:translate(-230px, 0);-ms-transform:translate(-230px, 0);-o-transform:translate(-230px, 0);transform:translate(-230px, 0) } }   /* adminlte */
@media (max-width:767px) { .sidebar-open .main-sidebar { -webkit-transform:translate(0, 0);-ms-transform:translate(0, 0);-o-transform:translate(0, 0);transform:translate(0, 0) } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .main-sidebar { -webkit-transform:translate(0, 0);-ms-transform:translate(0, 0);-o-transform:translate(0, 0);transform:translate(0, 0);width:50px !important;z-index:850 } }   /* adminlte */
@media print { .main-sidebar { display:none !important } }   /* adminlte */
.skin-black-light .main-sidebar { background-color:#f9fafc }   /* skin */
```

#### `.pull-right-container`

- Key: `shell-sidebar`
- Source: hbs; 1 file(s): `c/app-ui/navbar-items.hbs`
- Vendor: adminlte; states: first-of-type, hover, not; breakpoints: @media (min-width:768px)

```css
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li:hover>a>.pull-right-container { float:right;width:auto!important;left:200px!important;top:10px!important } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li:hover>a>.pull-right-container>.label:not(:first-of-type) { display:none } }   /* adminlte */
.sidebar-menu li>a>.pull-right-container { position:absolute;right:10px;top:50%;margin-top:-7px }   /* adminlte */
```

#### `.sidebar`

- Key: `shell-sidebar`
- Source: hbs; 2 file(s): `c/app-layouts/application-sidebar.hbs`, `app/index.html`
- Vendor: adminlte, skin; states: hover; breakpoints: none

```css
.sidebar { padding-bottom:10px }   /* adminlte */
.skin-black-light .sidebar a { color:#444 }   /* skin */
.skin-black-light .sidebar a:hover { text-decoration:none }   /* skin */
```

#### `.sidebar-collapse`

- Key: `shell-sidebar`
- Source: js/js-template; 1 file(s): `app/modifiers/sidebar-body-classes.js`
- Vendor: adminlte, skin; states: first-of-type, hover, not; breakpoints: @media (min-width:768px)

```css
@media (min-width:768px) { .sidebar-collapse .content-wrapper, .sidebar-collapse .main-footer { margin-left:0 } }   /* adminlte */
@media (min-width:768px) { .sidebar-collapse .main-sidebar { -webkit-transform:translate(-230px, 0);-ms-transform:translate(-230px, 0);-o-transform:translate(-230px, 0);transform:translate(-230px, 0) } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .content-wrapper, .sidebar-mini.sidebar-collapse .main-footer { margin-left:50px !important;z-index:840 } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .main-sidebar { -webkit-transform:translate(0, 0);-ms-transform:translate(0, 0);-o-transform:translate(0, 0);transform:translate(0, 0);width:50px !important;z-index:850 } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li { position:relative } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li>a { margin-right:0 } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li>a>span { border-top-right-radius:4px } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li:not(.treeview)>a>span { border-bottom-right-radius:4px } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li>.treeview-menu { padding-top:5px;padding-bottom:5px;border-bottom-right-radius:4px } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li:hover>a>span:not(.pull-right), .sidebar-mini.sidebar-collapse .sidebar-menu>li:hover>.treeview-menu { display:block !important;position:absolute;width:180px;left:50px } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li:hover>a>span { top:0;margin-left:-3px;padding:12px 5px 12px 20px;background-color:inherit } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li:hover>a>.pull-right-container { float:right;width:auto!important;left:200px!important;top:10px!important } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li:hover>a>.pull-right-container>.label:not(:first-of-type) { display:none } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li:hover>.treeview-menu { top:44px;margin-left:0 } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li>a>span, .sidebar-mini.sidebar-collapse .sidebar-menu>li>.treeview-menu, .sidebar-mini.sidebar-collapse .sidebar-menu>li>a>.pull-right, .sidebar-mini.sidebar-collapse .sidebar-menu li.header { display:none !important;-webkit-transform:translateZ(0) } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .main-header .logo { width:50px } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .main-header .logo>.logo-mini { display:block;margin-left:-15px;margin-right:-15px;font-size:18px } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .main-header .logo>.logo-lg { display:none } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .main-header .navbar { margin-left:50px } }   /* adminlte */
@media (min-width:768px) { .skin-black-light.sidebar-mini.sidebar-collapse .sidebar-menu>li>.treeview-menu { border-left:1px solid #d2d6de } }   /* skin */
```

#### `.sidebar-menu`

- Key: `shell-sidebar`
- Source: hbs/js-template; 3 file(s): `c/app-ui/nav-bar.hbs`, `c/app-ui/navbar-items.js`, `app/index.html`
- Vendor: adminlte, skin; states: .active, first-of-type, hover, not; breakpoints: @media (min-width:768px)

```css
.sidebar-menu { list-style:none;margin:0;padding:0 }   /* adminlte */
.sidebar-menu>li { position:relative;margin:0;padding:0 }   /* adminlte */
.sidebar-menu>li>a { padding:12px 5px 12px 15px;display:block }   /* adminlte */
.sidebar-menu>li>a>.fa, .sidebar-menu>li>a>.glyphicon, .sidebar-menu>li>a>.ion { width:20px }   /* adminlte */
.sidebar-menu>li .label, .sidebar-menu>li .badge { margin-right:5px }   /* adminlte */
.sidebar-menu>li .badge { margin-top:3px }   /* adminlte */
.sidebar-menu li.header { padding:10px 25px 10px 15px;font-size:12px }   /* adminlte */
.sidebar-menu li.active>.treeview-menu { display:block }   /* adminlte */
.sidebar-menu .treeview-menu { display:none;list-style:none;padding:0;margin:0;padding-left:5px }   /* adminlte */
.sidebar-menu .treeview-menu .treeview-menu { padding-left:20px }   /* adminlte */
.sidebar-menu .treeview-menu>li { margin:0 }   /* adminlte */
.sidebar-menu .treeview-menu>li>a { padding:5px 5px 5px 15px;display:block;font-size:14px }   /* adminlte */
.sidebar-menu .treeview-menu>li>a>.fa, .sidebar-menu .treeview-menu>li>a>.glyphicon, .sidebar-menu .treeview-menu>li>a>.ion { width:20px }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li { position:relative } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li>a { margin-right:0 } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li>a>span { border-top-right-radius:4px } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li:not(.treeview)>a>span { border-bottom-right-radius:4px } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li>.treeview-menu { padding-top:5px;padding-bottom:5px;border-bottom-right-radius:4px } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li:hover>a>span:not(.pull-right), .sidebar-mini.sidebar-collapse .sidebar-menu>li:hover>.treeview-menu { display:block !important;position:absolute;width:180px;left:50px } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li:hover>a>span { top:0;margin-left:-3px;padding:12px 5px 12px 20px;background-color:inherit } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li:hover>a>.pull-right-container { float:right;width:auto!important;left:200px!important;top:10px!important } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li:hover>a>.pull-right-container>.label:not(:first-of-type) { display:none } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li:hover>.treeview-menu { top:44px;margin-left:0 } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li>a>span, .sidebar-mini.sidebar-collapse .sidebar-menu>li>.treeview-menu, .sidebar-mini.sidebar-collapse .sidebar-menu>li>a>.pull-right, .sidebar-mini.sidebar-collapse .sidebar-menu li.header { display:none !important;-webkit-transform:translateZ(0) } }   /* adminlte */
.sidebar-menu, .sidebar-menu>li.header { white-space:nowrap;overflow:hidden }   /* adminlte */
.sidebar-menu:hover { overflow:visible }   /* adminlte */
.sidebar-menu>li.header { overflow:hidden;text-overflow:clip }   /* adminlte */
.sidebar-menu li>a { position:relative }   /* adminlte */
.sidebar-menu li>a>.pull-right-container { position:absolute;right:10px;top:50%;margin-top:-7px }   /* adminlte */
.skin-black-light .sidebar-menu>li { -webkit-transition:border-left-color .3s ease;-o-transition:border-left-color .3s ease;transition:border-left-color .3s ease }   /* skin */
.skin-black-light .sidebar-menu>li.header { color:#848484;background:#f9fafc }   /* skin */
.skin-black-light .sidebar-menu>li>a { border-left:3px solid transparent;font-weight:600 }   /* skin */
.skin-black-light .sidebar-menu>li:hover>a, .skin-black-light .sidebar-menu>li.active>a { color:#000;background:#f4f4f5 }   /* skin */
.skin-black-light .sidebar-menu>li.active { border-left-color:#fff }   /* skin */
.skin-black-light .sidebar-menu>li.active>a { font-weight:600 }   /* skin */
.skin-black-light .sidebar-menu>li>.treeview-menu { background:#f4f4f5 }   /* skin */
@media (min-width:768px) { .skin-black-light.sidebar-mini.sidebar-collapse .sidebar-menu>li>.treeview-menu { border-left:1px solid #d2d6de } }   /* skin */
```

#### `.sidebar-mini`

- Key: `shell-sidebar`
- Source: hbs; 1 file(s): `app/index.html`
- Vendor: adminlte, skin; states: first-of-type, hover, not; breakpoints: @media (min-width:768px)

```css
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .content-wrapper, .sidebar-mini.sidebar-collapse .main-footer { margin-left:50px !important;z-index:840 } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .main-sidebar { -webkit-transform:translate(0, 0);-ms-transform:translate(0, 0);-o-transform:translate(0, 0);transform:translate(0, 0);width:50px !important;z-index:850 } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li { position:relative } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li>a { margin-right:0 } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li>a>span { border-top-right-radius:4px } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li:not(.treeview)>a>span { border-bottom-right-radius:4px } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li>.treeview-menu { padding-top:5px;padding-bottom:5px;border-bottom-right-radius:4px } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li:hover>a>span:not(.pull-right), .sidebar-mini.sidebar-collapse .sidebar-menu>li:hover>.treeview-menu { display:block !important;position:absolute;width:180px;left:50px } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li:hover>a>span { top:0;margin-left:-3px;padding:12px 5px 12px 20px;background-color:inherit } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li:hover>a>.pull-right-container { float:right;width:auto!important;left:200px!important;top:10px!important } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li:hover>a>.pull-right-container>.label:not(:first-of-type) { display:none } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li:hover>.treeview-menu { top:44px;margin-left:0 } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li>a>span, .sidebar-mini.sidebar-collapse .sidebar-menu>li>.treeview-menu, .sidebar-mini.sidebar-collapse .sidebar-menu>li>a>.pull-right, .sidebar-mini.sidebar-collapse .sidebar-menu li.header { display:none !important;-webkit-transform:translateZ(0) } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .main-header .logo { width:50px } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .main-header .logo>.logo-mini { display:block;margin-left:-15px;margin-right:-15px;font-size:18px } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .main-header .logo>.logo-lg { display:none } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .main-header .navbar { margin-left:50px } }   /* adminlte */
@media (min-width:768px) { .skin-black-light.sidebar-mini.sidebar-collapse .sidebar-menu>li>.treeview-menu { border-left:1px solid #d2d6de } }   /* skin */
```

#### `.sidebar-open`

- Key: `shell-sidebar`
- Source: js/js-template; 1 file(s): `app/modifiers/sidebar-body-classes.js`
- Vendor: adminlte; states: none; breakpoints: @media (max-width:767px)

```css
@media (max-width:767px) { .sidebar-open .content-wrapper, .sidebar-open .main-footer { -webkit-transform:translate(230px, 0);-ms-transform:translate(230px, 0);-o-transform:translate(230px, 0);transform:translate(230px, 0) } }   /* adminlte */
@media (max-width:767px) { .sidebar-open .main-sidebar { -webkit-transform:translate(0, 0);-ms-transform:translate(0, 0);-o-transform:translate(0, 0);transform:translate(0, 0) } }   /* adminlte */
```

#### `.sidebar-toggle`

- Key: `shell-sidebar`
- Source: hbs; 1 file(s): `c/app-layouts/application-header.hbs`
- Vendor: adminlte, skin; states: active, before, focus, hover; breakpoints: none

```css
.main-header .sidebar-toggle { float:left;background-color:transparent;background-image:none;padding:15px 15px;font-family:fontAwesome }   /* adminlte */
.main-header .sidebar-toggle:before { content:"\f0c9" }   /* adminlte */
.main-header .sidebar-toggle:hover { color:#fff }   /* adminlte */
.main-header .sidebar-toggle:focus, .main-header .sidebar-toggle:active { background:transparent }   /* adminlte */
.skin-black-light .main-header .navbar .sidebar-toggle { color:#333 }   /* skin */
.skin-black-light .main-header .navbar .sidebar-toggle:hover { color:#999;background:#fff }   /* skin */
.skin-black-light .main-header .navbar>.sidebar-toggle { color:#333;border-right:1px solid #eee }   /* skin */
```

#### `.treeview`

- Key: `shell-sidebar` (only in `:not(.treeview)` of the collapsed mini-sidebar rule: an `li.treeview` keeps its label visible)
- Source: hbs; 1 file(s): `c/app-ui/navbar-items.hbs`
- Vendor: ; states: none; breakpoints: none

```css
```

#### `.treeview-menu`

- Key: `shell-sidebar`
- Source: hbs; 1 file(s): `c/app-ui/navbar-items.hbs`
- Vendor: adminlte, skin; states: .active, hover; breakpoints: @media (min-width:768px)

```css
.sidebar-menu li.active>.treeview-menu { display:block }   /* adminlte */
.sidebar-menu .treeview-menu { display:none;list-style:none;padding:0;margin:0;padding-left:5px }   /* adminlte */
.sidebar-menu .treeview-menu .treeview-menu { padding-left:20px }   /* adminlte */
.sidebar-menu .treeview-menu>li { margin:0 }   /* adminlte */
.sidebar-menu .treeview-menu>li>a { padding:5px 5px 5px 15px;display:block;font-size:14px }   /* adminlte */
.sidebar-menu .treeview-menu>li>a>.fa, .sidebar-menu .treeview-menu>li>a>.glyphicon, .sidebar-menu .treeview-menu>li>a>.ion { width:20px }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li>.treeview-menu { padding-top:5px;padding-bottom:5px;border-bottom-right-radius:4px } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li:hover>.treeview-menu { display:block !important;position:absolute;width:180px;left:50px } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li:hover>.treeview-menu { top:44px;margin-left:0 } }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li>.treeview-menu { display:none !important;-webkit-transform:translateZ(0) } }   /* adminlte */
.skin-black-light .sidebar-menu>li>.treeview-menu { background:#f4f4f5 }   /* skin */
.skin-black-light .treeview-menu>li>a { color:#777 }   /* skin */
.skin-black-light .treeview-menu>li.active>a, .skin-black-light .treeview-menu>li>a:hover { color:#000 }   /* skin */
.skin-black-light .treeview-menu>li.active>a { font-weight:600 }   /* skin */
@media (min-width:768px) { .skin-black-light.sidebar-mini.sidebar-collapse .sidebar-menu>li>.treeview-menu { border-left:1px solid #d2d6de } }   /* skin */
```


### `grid-compat`

#### `.clearfix`

- Key: `grid-compat`
- Source: hbs; 10 file(s): `c/idea/created-issues-box.hbs`, `c/issue/issue-details.hbs`, `t/app/module.hbs`, `t/app/project/index.hbs`, `t/app/project/wiki/index.hbs`, `t/app/project/wiki/page.hbs`, `t/app/role/page.hbs`, `t/app/workspace/index.hbs`, `t/reset-password.hbs`, `t/signin.hbs`
- Vendor: bootstrap; states: after, before; breakpoints: none

```css
.clearfix:before, .clearfix:after { display: table; content: " "; }   /* bootstrap */
.clearfix:after { clear: both; }   /* bootstrap */
```

#### `.col-lg-10`

- Key: `grid-compat`
- Source: hbs; 1 file(s): `c/app-ui/skeleton/role-detail.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 1200px)

```css
.col-lg-10 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
@media (min-width: 1200px) { .col-lg-10 { float: left; } }   /* bootstrap */
@media (min-width: 1200px) { .col-lg-10 { width: 83.3333333333%; } }   /* bootstrap */
```

#### `.col-md-1`

- Key: `grid-compat`
- Source: hbs; 1 file(s): `t/app/agent/tools.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 992px)

```css
.col-md-1 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
@media (min-width: 992px) { .col-md-1 { float: left; } }   /* bootstrap */
@media (min-width: 992px) { .col-md-1 { width: 8.3333333333%; } }   /* bootstrap */
```

#### `.col-md-10`

- Key: `grid-compat`
- Source: hbs; 3 file(s): `c/app-ui/skeleton/issue-detail.hbs`, `c/app-ui/skeleton/project-dashboard.hbs`, `t/app/project/wiki.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 992px)

```css
.col-md-10 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
@media (min-width: 992px) { .col-md-10 { float: left; } }   /* bootstrap */
@media (min-width: 992px) { .col-md-10 { width: 83.3333333333%; } }   /* bootstrap */
```

#### `.col-md-12`

- Key: `grid-compat`
- Source: dynamic/hbs/hbs-literal/js; 25 file(s): `c/app-ui/skeleton/calendar.hbs`, `c/app-ui/skeleton/issue-detail.hbs`, `c/app-ui/skeleton/kanban-board.hbs`, `c/app-ui/skeleton/project-dashboard.hbs`, `c/app-ui/skeleton/role-detail.hbs`, `c/app-ui/skeleton/user-management.hbs`, `c/developer/entry.hbs`, `c/issue/issue-details.hbs`, `app/controllers/app/project/board.js`, `app/controllers/app/project/issue/index.js`, `t/app/agent/index.hbs`, `t/app/agent/tools.hbs`, `t/app/index.hbs`, `t/app/project/calendar.hbs`, `t/app/project/idea.hbs`, `t/app/project/index.hbs`, `t/app/project/issue/index.hbs`, `t/app/projects/index.hbs`, `t/app/settings/issue-statuses.hbs`, `t/app/settings/issue-types.hbs`, `t/app/settings/services.hbs`, `t/app/user/management.hbs`, `t/app/workflow/index.hbs`, `t/app/workflow/page.hbs`, `t/app/workspaces/index.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 992px)

```css
.col-md-12 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
@media (min-width: 992px) { .col-md-12 { float: left; } }   /* bootstrap */
@media (min-width: 992px) { .col-md-12 { width: 100%; } }   /* bootstrap */
```

#### `.col-md-2`

- Key: `grid-compat`
- Source: hbs; 5 file(s): `c/app-ui/skeleton/issue-detail.hbs`, `c/app-ui/skeleton/project-dashboard.hbs`, `t/app/agent/tools.hbs`, `t/app/project/wiki.hbs`, `t/app/workflow/page.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 992px)

```css
.col-md-2 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
@media (min-width: 992px) { .col-md-2 { float: left; } }   /* bootstrap */
@media (min-width: 992px) { .col-md-2 { width: 16.6666666667%; } }   /* bootstrap */
```

#### `.col-md-3`

- Key: `grid-compat`
- Source: hbs; 12 file(s): `c/app-ui/skeleton/user-profile.hbs`, `c/workflow/header-box.hbs`, `t/app/agent/tools.hbs`, `t/app/developer.hbs`, `t/app/project/conversation.hbs`, `t/app/project/idea.hbs`, `t/app/role.hbs`, `t/app/settings-loading.hbs`, `t/app/settings.hbs`, `t/app/settings/services.hbs`, `t/app/user/page.hbs`, `t/app/workflow/page.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 992px)

```css
.col-md-3 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
@media (min-width: 992px) { .col-md-3 { float: left; } }   /* bootstrap */
@media (min-width: 992px) { .col-md-3 { width: 25%; } }   /* bootstrap */
```

#### `.col-md-4`

- Key: `grid-compat`
- Source: dynamic/hbs/js; 27 file(s): `c/app-ui/skeleton/form.hbs`, `c/app-ui/skeleton/issue-detail.hbs`, `c/app-ui/skeleton/kanban-board.hbs`, `c/app-ui/skeleton/project-dashboard.hbs`, `c/app-ui/skeleton/user-profile.hbs`, `c/developer/demos/list-page.js`, `c/issue/issue-details.hbs`, `c/issue/issue-tags.hbs`, `c/workflow/header-box.hbs`, `app/controllers/app/project/board.js`, `app/controllers/app/project/idea/page.js`, `app/controllers/app/project/issue/index.js`, `t/app/agent/create.hbs`, `t/app/agent/page.hbs`, `t/app/agent/skills.hbs`, `t/app/project/conversation/page.hbs`, `t/app/project/index.hbs`, `t/app/project/issue/create.hbs`, `t/app/projects/create.hbs`, `t/app/settings/services.hbs`, `t/app/user/create.hbs`, `t/app/user/page.hbs`, `t/app/workflow/page.hbs`, `t/app/workspace/index.hbs`, `t/app/workspace/settings/projects.hbs`, `t/auth-status.hbs`, `t/signin.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 992px)

```css
.col-md-4 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
@media (min-width: 992px) { .col-md-4 { float: left; } }   /* bootstrap */
@media (min-width: 992px) { .col-md-4 { width: 33.3333333333%; } }   /* bootstrap */
```

#### `.col-md-5`

- Key: `grid-compat`
- Source: hbs; 4 file(s): `c/developer/entry.hbs`, `c/workflow/header-box.hbs`, `t/app/agent/tools.hbs`, `t/app/settings/services.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 992px)

```css
.col-md-5 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
@media (min-width: 992px) { .col-md-5 { float: left; } }   /* bootstrap */
@media (min-width: 992px) { .col-md-5 { width: 41.6666666667%; } }   /* bootstrap */
```

#### `.col-md-6`

- Key: `grid-compat`
- Source: hbs; 8 file(s): `c/app-ui/skeleton/project-dashboard.hbs`, `c/app-ui/skeleton/user-profile.hbs`, `c/app-ui/skeleton/widget-grid.hbs`, `c/widgets.hbs`, `t/app/project/index.hbs`, `t/app/user/page.hbs`, `t/reset-password.hbs`, `t/signin.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 992px)

```css
.col-md-6 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
@media (min-width: 992px) { .col-md-6 { float: left; } }   /* bootstrap */
@media (min-width: 992px) { .col-md-6 { width: 50%; } }   /* bootstrap */
```

#### `.col-md-7`

- Key: `grid-compat`
- Source: hbs; 3 file(s): `c/developer/entry.hbs`, `t/app/agent/tools.hbs`, `t/app/workflow/page.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 992px)

```css
.col-md-7 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
@media (min-width: 992px) { .col-md-7 { float: left; } }   /* bootstrap */
@media (min-width: 992px) { .col-md-7 { width: 58.3333333333%; } }   /* bootstrap */
```

#### `.col-md-8`

- Key: `grid-compat`
- Source: dynamic/hbs/js; 24 file(s): `c/app-ui/skeleton/form.hbs`, `c/app-ui/skeleton/issue-detail.hbs`, `c/app-ui/skeleton/project-dashboard.hbs`, `c/app-ui/skeleton/user-profile.hbs`, `c/issue/issue-details.hbs`, `app/controllers/app/project/board.js`, `app/controllers/app/project/idea/page.js`, `t/app/agent/create.hbs`, `t/app/agent/page.hbs`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`, `t/app/project/conversation/page.hbs`, `t/app/project/index.hbs`, `t/app/project/issue/create.hbs`, `t/app/project/issue/index.hbs`, `t/app/projects/create.hbs`, `t/app/user/create.hbs`, `t/app/user/page.hbs`, `t/app/workflow/page.hbs`, `t/app/workspace/index.hbs`, `t/app/workspace/settings/projects.hbs`, `t/app/workspaces/create.hbs`, `t/auth-status.hbs`, `t/signin.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 992px)

```css
.col-md-8 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
@media (min-width: 992px) { .col-md-8 { float: left; } }   /* bootstrap */
@media (min-width: 992px) { .col-md-8 { width: 66.6666666667%; } }   /* bootstrap */
```

#### `.col-md-9`

- Key: `grid-compat`
- Source: hbs/hbs-literal; 8 file(s): `c/app-ui/skeleton/user-profile.hbs`, `t/app/developer.hbs`, `t/app/project/conversation.hbs`, `t/app/project/idea.hbs`, `t/app/role.hbs`, `t/app/settings-loading.hbs`, `t/app/settings.hbs`, `t/app/user/page.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 992px)

```css
.col-md-9 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
@media (min-width: 992px) { .col-md-9 { float: left; } }   /* bootstrap */
@media (min-width: 992px) { .col-md-9 { width: 75%; } }   /* bootstrap */
```

#### `.col-md-pull-4`

- Key: `grid-compat`
- Source: js; 1 file(s): `app/controllers/app/project/idea/page.js`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 992px)

```css
@media (min-width: 992px) { .col-md-pull-4 { right: 33.3333333333%; } }   /* bootstrap */
```

#### `.col-md-push-8`

- Key: `grid-compat`
- Source: js; 1 file(s): `app/controllers/app/project/idea/page.js`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 992px)

```css
@media (min-width: 992px) { .col-md-push-8 { left: 66.6666666667%; } }   /* bootstrap */
```

#### `.col-sm-1`

- Key: `grid-compat`
- Source: hbs; 1 file(s): `c/ez-search/condition.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 768px)

```css
.col-sm-1 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
@media (min-width: 768px) { .col-sm-1 { float: left; } }   /* bootstrap */
@media (min-width: 768px) { .col-sm-1 { width: 8.3333333333%; } }   /* bootstrap */
```

#### `.col-sm-10`

- Key: `grid-compat`
- Source: hbs; 1 file(s): `t/app/module.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 768px)

```css
.col-sm-10 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
@media (min-width: 768px) { .col-sm-10 { float: left; } }   /* bootstrap */
@media (min-width: 768px) { .col-sm-10 { width: 83.3333333333%; } }   /* bootstrap */
```

#### `.col-sm-12`

- Key: `grid-compat`
- Source: hbs; 8 file(s): `c/app-ui/skeleton/role-detail.hbs`, `t/app/agent/create.hbs`, `t/app/agent/page.hbs`, `t/app/project/issue/create.hbs`, `t/app/projects/create.hbs`, `t/app/settings/email.hbs`, `t/app/user/create.hbs`, `t/signin.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 768px)

```css
.col-sm-12 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
@media (min-width: 768px) { .col-sm-12 { float: left; } }   /* bootstrap */
@media (min-width: 768px) { .col-sm-12 { width: 100%; } }   /* bootstrap */
```

#### `.col-sm-2`

- Key: `grid-compat`
- Source: hbs; 2 file(s): `c/ez-search/condition.hbs`, `t/app/module.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 768px)

```css
.col-sm-2 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
@media (min-width: 768px) { .col-sm-2 { float: left; } }   /* bootstrap */
@media (min-width: 768px) { .col-sm-2 { width: 16.6666666667%; } }   /* bootstrap */
```

#### `.col-sm-3`

- Key: `grid-compat`
- Source: hbs; 4 file(s): `c/app-ui/skeleton/conversation-grid.hbs`, `c/app-ui/skeleton/user-profile.hbs`, `c/ez-search/condition.hbs`, `t/app/user/page.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 768px)

```css
.col-sm-3 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
@media (min-width: 768px) { .col-sm-3 { float: left; } }   /* bootstrap */
@media (min-width: 768px) { .col-sm-3 { width: 25%; } }   /* bootstrap */
```

#### `.col-sm-4`

- Key: `grid-compat`
- Source: hbs; 2 file(s): `t/app/agent/page.hbs`, `t/app/role/page.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 768px)

```css
.col-sm-4 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
@media (min-width: 768px) { .col-sm-4 { float: left; } }   /* bootstrap */
@media (min-width: 768px) { .col-sm-4 { width: 33.3333333333%; } }   /* bootstrap */
```

#### `.col-sm-6`

- Key: `grid-compat`
- Source: hbs; 3 file(s): `c/app-ui/skeleton/conversation-grid.hbs`, `c/conversation/vote-body.hbs`, `c/ez-search/condition.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 768px)

```css
.col-sm-6 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
@media (min-width: 768px) { .col-sm-6 { float: left; } }   /* bootstrap */
@media (min-width: 768px) { .col-sm-6 { width: 50%; } }   /* bootstrap */
```

#### `.col-sm-pull-1`

- Key: `grid-compat`
- Source: hbs; 1 file(s): `c/ez-search/condition.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 768px)

```css
@media (min-width: 768px) { .col-sm-pull-1 { right: 8.3333333333%; } }   /* bootstrap */
```

#### `.col-sm-push-8`

- Key: `grid-compat`
- Source: hbs; 1 file(s): `c/ez-search/condition.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 768px)

```css
@media (min-width: 768px) { .col-sm-push-8 { left: 66.6666666667%; } }   /* bootstrap */
```

#### `.col-xs-1`

- Key: `grid-compat`
- Source: hbs; 1 file(s): `c/app-ui/skeleton/calendar.hbs`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.col-xs-1 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
.col-xs-1 { float: left; }   /* bootstrap */
.col-xs-1 { width: 8.3333333333%; }   /* bootstrap */
```

#### `.col-xs-10`

- Key: `grid-compat`
- Source: hbs; 1 file(s): `c/ez-search/condition.hbs`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.col-xs-10 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
.col-xs-10 { float: left; }   /* bootstrap */
.col-xs-10 { width: 83.3333333333%; }   /* bootstrap */
```

#### `.col-xs-12`

- Key: `grid-compat`
- Source: hbs; 4 file(s): `c/app-ui/skeleton/role-detail.hbs`, `c/ez-search/condition.hbs`, `t/app/project/index.hbs`, `t/signin.hbs`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.col-xs-12 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
.col-xs-12 { float: left; }   /* bootstrap */
.col-xs-12 { width: 100%; }   /* bootstrap */
```

#### `.col-xs-2`

- Key: `grid-compat`
- Source: hbs; 1 file(s): `c/ez-search/condition.hbs`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.col-xs-2 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
.col-xs-2 { float: left; }   /* bootstrap */
.col-xs-2 { width: 16.6666666667%; }   /* bootstrap */
```

#### `.col-xs-3`

- Key: `grid-compat`
- Source: hbs; 2 file(s): `c/app-ui/skeleton/issue-detail.hbs`, `c/app-ui/skeleton/project-dashboard.hbs`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.col-xs-3 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
.col-xs-3 { float: left; }   /* bootstrap */
.col-xs-3 { width: 25%; }   /* bootstrap */
```

#### `.col-xs-6`

- Key: `grid-compat`
- Source: hbs/js; 7 file(s): `c/app-ui/skeleton/issue-detail.hbs`, `c/app-ui/skeleton/project-dashboard.hbs`, `c/issue/issue-details.hbs`, `c/issue/issue-tags.hbs`, `t/app/project/index.hbs`, `t/app/workspace/index.hbs`, `app/utils/metadata/metadata.js`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.col-xs-6 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
.col-xs-6 { float: left; }   /* bootstrap */
.col-xs-6 { width: 50%; }   /* bootstrap */
```

#### `.col-xs-9`

- Key: `grid-compat`
- Source: hbs; 2 file(s): `c/app-ui/skeleton/issue-detail.hbs`, `c/app-ui/skeleton/project-dashboard.hbs`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.col-xs-9 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }   /* bootstrap */
.col-xs-9 { float: left; }   /* bootstrap */
.col-xs-9 { width: 75%; }   /* bootstrap */
```

#### `.hidden-sm`

- Key: `grid-compat`
- Source: hbs; 2 file(s): `t/reset-password.hbs`, `t/signin.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 768px) and (max-width: 991px)

```css
@media (min-width: 768px) and (max-width: 991px) { .hidden-sm { display: none !important; } }   /* bootstrap */
```

#### `.hidden-xs`

- Key: `grid-compat`
- Source: hbs; 6 file(s): `c/app-layouts/application-footer.hbs`, `c/app-layouts/application-header.hbs`, `c/ez-search/group.hbs`, `c/ez-search/index.hbs`, `t/reset-password.hbs`, `t/signin.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (max-width: 767px)

```css
@media (max-width: 767px) { .hidden-xs { display: none !important; } }   /* bootstrap */
```

#### `.row`

- Key: `grid-compat`
- Source: hbs/js; 55 file(s): `c/app-ui/skeleton/calendar.hbs`, `c/app-ui/skeleton/conversation-grid.hbs`, `c/app-ui/skeleton/form.hbs`, `c/app-ui/skeleton/issue-detail.hbs`, `c/app-ui/skeleton/kanban-board.hbs`, `c/app-ui/skeleton/project-dashboard.hbs`, `c/app-ui/skeleton/user-management.hbs`, `c/app-ui/skeleton/user-profile.hbs`, `c/app-ui/skeleton/widget-grid.hbs`, `c/conversation/vote-body.hbs`, `c/developer/entry.hbs`, `c/ez-search/condition.hbs`, `c/issue/issue-details.hbs`, `c/workflow/header-box.hbs`, `app/services/issue-relations.js`, `t/app/agent/create.hbs`, `t/app/agent/index.hbs`, `t/app/agent/page.hbs`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`, `t/app/developer.hbs`, `t/app/index.hbs`, `t/app/module.hbs`, `t/app/project/board.hbs`, `t/app/project/calendar.hbs`, `t/app/project/conversation.hbs`, `t/app/project/conversation/page.hbs`, `t/app/project/idea.hbs`, `t/app/project/idea/page.hbs`, `t/app/project/index.hbs`, `t/app/project/issue/create.hbs`, `t/app/project/issue/index.hbs`, `t/app/project/wiki.hbs`, `t/app/projects/create.hbs`, `t/app/projects/index.hbs`, `t/app/role.hbs`, `t/app/role/page.hbs`, `t/app/settings-loading.hbs`, `t/app/settings.hbs`, `t/app/settings/email.hbs`, `t/app/settings/issue-statuses.hbs`, `t/app/settings/issue-types.hbs`, `t/app/settings/services.hbs`, `t/app/user/create.hbs`, `t/app/user/management.hbs`, `t/app/user/page.hbs`, `t/app/workflow/index.hbs`, `t/app/workflow/page.hbs`, `t/app/workspace/index.hbs`, `t/app/workspace/settings/projects.hbs`, `t/app/workspaces/create.hbs`, `t/app/workspaces/index.hbs`, `t/auth-status.hbs`, `t/reset-password.hbs`, `t/signin.hbs`
- Vendor: bootstrap; states: after, before; breakpoints: none

```css
.row { margin-right: -15px; margin-left: -15px; }   /* bootstrap */
.row:before, .row:after { display: table; content: " "; }   /* bootstrap */
.row:after { clear: both; }   /* bootstrap */
```

#### `.visible-xs-inline`

- Key: `grid-compat`
- Source: hbs; 2 file(s): `c/app-layouts/application-header.hbs`, `c/ez-search/index.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (max-width: 767px)

```css
.visible-xs-inline { display: none !important; }   /* bootstrap */
@media (max-width: 767px) { .visible-xs-inline { display: inline !important; } }   /* bootstrap */
```


### `fc-box`

#### `.box`

- Key: `fc-box`
- Source: hbs/hbs-literal/js/js-selector; 92 file(s): `c/agent/credentials.hbs`, `c/agent/workflows.hbs`, `c/app-ui/box.hbs`, `c/app-ui/gantt-chart.hbs`, `c/app-ui/gantt-chart/edit-sheet.hbs`, `c/app-ui/modal.hbs`, `c/app-ui/skeleton/calendar.hbs`, `c/app-ui/skeleton/conversation-grid.hbs`, `c/app-ui/skeleton/form.hbs`, `c/app-ui/skeleton/gantt.hbs`, `c/app-ui/skeleton/issue-detail.hbs`, `c/app-ui/skeleton/kanban-board.hbs`, `c/app-ui/skeleton/list-view.hbs`, `c/app-ui/skeleton/page-loading-body.hbs`, `c/app-ui/skeleton/project-dashboard.hbs`, `c/app-ui/skeleton/role-detail.hbs`, `c/app-ui/skeleton/user-management.hbs`, `c/app-ui/skeleton/user-profile.hbs`, `c/app-ui/skeleton/widget-grid.hbs`, `c/app-ui/skeleton/wiki-article.hbs`, `c/app-ui/table.hbs`, `c/app-ui/task-board/milestones.hbs`, `c/app-ui/task-board/milestones.js`, `c/conversation/activity-box.hbs`, `c/conversation/linked-issue-box.hbs`, `c/conversation/participants-box.hbs`, `c/conversation/result-box.hbs`, `c/conversation/tags-box.hbs`, `c/conversation/thread-box.hbs`, `c/developer/component-nav.hbs`, `c/developer/demos/empty-state.hbs`, `c/developer/docs.hbs`, `c/developer/entry-header.hbs`, `c/developer/entry.hbs`, `c/developer/event-log.hbs`, `c/idea/conversation-box.hbs`, `c/idea/created-issues-box.hbs`, `c/idea/plan-box.hbs`, `c/idea/summary-box.hbs`, `c/issue/issue-details.hbs`, `c/issue/link-issue-modal.hbs`, `c/issue/linked-issues.hbs`, `c/quick-list/index.hbs`, `c/user-profile/identities.hbs`, `c/user-profile/qualification.hbs`, `c/user-profile/skills.hbs`, `c/widgets/weekly-activities.hbs`, `c/widgets/weekly-conversations.hbs`, `c/workflow/case-list.hbs`, `c/workflow/flow-canvas.hbs`, `c/workflow/header-box.hbs`, `c/workflow/node-palette.hbs`, `c/workflow/properties-box.hbs`, `c/workflow/run-steps-box.hbs`, `c/workflow/runs-box.hbs`, `c/workflow/test-run-box.hbs`, `app/index.html`, `app/locales/en-us/translations.js`, `t/app/agent/create.hbs`, `t/app/agent/index.hbs`, `t/app/agent/page.hbs`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`, `t/app/developer/component.hbs`, `t/app/project/board.hbs`, `t/app/project/calendar.hbs`, `t/app/project/conversation/index.hbs`, `t/app/project/idea/create.hbs`, `t/app/project/idea/index.hbs`, `t/app/project/index.hbs`, `t/app/project/issue/create.hbs`, `t/app/project/issue/index.hbs`, `t/app/project/wiki.hbs`, `t/app/project/wiki/create.hbs`, `t/app/project/wiki/edit.hbs`, `t/app/project/wiki/page.hbs`, `t/app/projects/create.hbs`, `t/app/projects/index.hbs`, `t/app/role/index.hbs`, `t/app/role/page.hbs`, `t/app/settings-loading.hbs`, `t/app/settings.hbs`, `t/app/settings/email.hbs`, `t/app/settings/issue-statuses.hbs`, `t/app/settings/issue-types.hbs`, `t/app/settings/services.hbs`, `t/app/user/create.hbs`, `t/app/user/management.hbs`, `t/app/user/page.hbs`, `t/app/workflow/index.hbs`, `t/auth-status.hbs`, `app/utils/developer/component-registry.js`
- Vendor: adminlte; states: hover, last-of-type; breakpoints: none

```css
.box { position:relative;border-radius:3px;background:#ffffff;border-top:3px solid #d2d6de;margin-bottom:20px;width:100%;box-shadow:0 1px 1px rgba(0,0,0,0.1) }   /* adminlte */
.box.box-primary { border-top-color:#3c8dbc }   /* adminlte */
.box.box-info { border-top-color:#00c0ef }   /* adminlte */
.box.box-danger { border-top-color:#dd4b39 }   /* adminlte */
.box.box-warning { border-top-color:#f39c12 }   /* adminlte */
.box.box-success { border-top-color:#00a65a }   /* adminlte */
.box.box-default { border-top-color:#d2d6de }   /* adminlte */
.box.collapsed-box .box-body, .box.collapsed-box .box-footer { display:none }   /* adminlte */
.box .nav-stacked>li { border-bottom:1px solid #f4f4f4;margin:0 }   /* adminlte */
.box .nav-stacked>li:last-of-type { border-bottom:none }   /* adminlte */
.box.box-solid { border-top:0 }   /* adminlte */
.box.box-solid>.box-header .btn.btn-default { background:transparent }   /* adminlte */
.box.box-solid>.box-header .btn:hover, .box.box-solid>.box-header a:hover { background:rgba(0,0,0,0.1) }   /* adminlte */
.box.box-solid.box-default { border:1px solid #d2d6de }   /* adminlte */
.box.box-solid.box-default>.box-header { color:#444;background:#d2d6de;background-color:#d2d6de }   /* adminlte */
.box.box-solid.box-default>.box-header a, .box.box-solid.box-default>.box-header .btn { color:#444 }   /* adminlte */
.box.box-solid.box-primary { border:1px solid #3c8dbc }   /* adminlte */
.box.box-solid.box-primary>.box-header { color:#fff;background:#3c8dbc;background-color:#3c8dbc }   /* adminlte */
.box.box-solid.box-primary>.box-header a, .box.box-solid.box-primary>.box-header .btn { color:#fff }   /* adminlte */
.box.box-solid.box-info { border:1px solid #00c0ef }   /* adminlte */
.box.box-solid.box-info>.box-header { color:#fff;background:#00c0ef;background-color:#00c0ef }   /* adminlte */
.box.box-solid.box-info>.box-header a, .box.box-solid.box-info>.box-header .btn { color:#fff }   /* adminlte */
.box.box-solid.box-danger { border:1px solid #dd4b39 }   /* adminlte */
.box.box-solid.box-danger>.box-header { color:#fff;background:#dd4b39;background-color:#dd4b39 }   /* adminlte */
.box.box-solid.box-danger>.box-header a, .box.box-solid.box-danger>.box-header .btn { color:#fff }   /* adminlte */
.box.box-solid.box-warning { border:1px solid #f39c12 }   /* adminlte */
.box.box-solid.box-warning>.box-header { color:#fff;background:#f39c12;background-color:#f39c12 }   /* adminlte */
.box.box-solid.box-warning>.box-header a, .box.box-solid.box-warning>.box-header .btn { color:#fff }   /* adminlte */
.box.box-solid.box-success { border:1px solid #00a65a }   /* adminlte */
.box.box-solid.box-success>.box-header { color:#fff;background:#00a65a;background-color:#00a65a }   /* adminlte */
.box.box-solid.box-success>.box-header a, .box.box-solid.box-success>.box-header .btn { color:#fff }   /* adminlte */
.box.box-solid>.box-header>.box-tools .btn { border:0;box-shadow:none }   /* adminlte */
.box.box-solid[class*='bg']>.box-header { color:#fff }   /* adminlte */
.box>.overlay { position:absolute;top:0;left:0;width:100%;height:100% }   /* adminlte */
.box .overlay { z-index:50;background:rgba(255,255,255,0.7);border-radius:3px }   /* adminlte */
.box .overlay>.fa { position:absolute;top:50%;left:50%;margin-left:-15px;margin-top:-15px;color:#000;font-size:30px }   /* adminlte */
```

#### `.box-body`

- Key: `fc-box`
- Source: hbs/js/js-selector/js-template; 88 file(s): `c/agent/credentials.hbs`, `c/agent/workflows.hbs`, `c/app-ui/box.hbs`, `c/app-ui/gantt-chart/edit-sheet.hbs`, `c/app-ui/skeleton/calendar.hbs`, `c/app-ui/skeleton/issue-detail.hbs`, `c/app-ui/skeleton/kanban-board.hbs`, `c/app-ui/skeleton/project-dashboard.hbs`, `c/app-ui/skeleton/role-detail.hbs`, `c/app-ui/skeleton/user-management.hbs`, `c/app-ui/skeleton/user-profile.hbs`, `c/app-ui/skeleton/wiki-article.hbs`, `c/app-ui/table.hbs`, `c/app-ui/task-board/milestones.hbs`, `c/app-ui/task-board/milestones.js`, `c/conversation/activity-box.hbs`, `c/conversation/linked-issue-box.hbs`, `c/conversation/participants-box.hbs`, `c/conversation/result-box.hbs`, `c/conversation/tags-box.hbs`, `c/conversation/thread-box.hbs`, `c/developer/component-nav.hbs`, `c/developer/demos/empty-state.hbs`, `c/developer/demos/quick-list.hbs`, `c/developer/docs.hbs`, `c/developer/entry-header.hbs`, `c/developer/entry.hbs`, `c/developer/event-log.hbs`, `c/idea/created-issues-box.hbs`, `c/idea/plan-box.hbs`, `c/idea/summary-box.hbs`, `c/issue/issue-details.hbs`, `c/issue/link-issue-modal.hbs`, `c/issue/linked-issues.hbs`, `c/quick-list/index.hbs`, `c/user-profile/identities.hbs`, `c/user-profile/qualification.hbs`, `c/user-profile/skills.hbs`, `c/widgets/weekly-activities.hbs`, `c/widgets/weekly-conversations.hbs`, `c/workflow/case-list.hbs`, `c/workflow/flow-canvas.hbs`, `c/workflow/header-box.hbs`, `c/workflow/node-palette.hbs`, `c/workflow/properties-box.hbs`, `c/workflow/run-steps-box.hbs`, `c/workflow/runs-box.hbs`, `c/workflow/test-run-box.hbs`, `app/controllers/app/project/board.js`, `app/modifiers/initialize-sortable.js`, `app/modifiers/observe-active-lane.js`, `app/modifiers/sticky-lane-headers.js`, `t/app/agent/create.hbs`, `t/app/agent/index.hbs`, `t/app/agent/page.hbs`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`, `t/app/developer/component.hbs`, `t/app/project/board.hbs`, `t/app/project/calendar.hbs`, `t/app/project/conversation.hbs`, `t/app/project/conversation/index.hbs`, `t/app/project/idea.hbs`, `t/app/project/idea/create.hbs`, `t/app/project/idea/index.hbs`, `t/app/project/index.hbs`, `t/app/project/issue/create.hbs`, `t/app/project/issue/index.hbs`, `t/app/project/wiki.hbs`, `t/app/project/wiki/create.hbs`, `t/app/project/wiki/edit.hbs`, `t/app/project/wiki/page.hbs`, `t/app/projects/create.hbs`, `t/app/projects/index.hbs`, `t/app/role.hbs`, `t/app/role/index.hbs`, `t/app/role/page.hbs`, `t/app/settings-loading.hbs`, `t/app/settings.hbs`, `t/app/settings/email.hbs`, `t/app/settings/issue-statuses.hbs`, `t/app/settings/issue-types.hbs`, `t/app/settings/services.hbs`, `t/app/user/create.hbs`, `t/app/user/management.hbs`, `t/app/user/page.hbs`, `t/app/workflow/index.hbs`, `t/auth-status.hbs`
- Vendor: adminlte; states: after, before; breakpoints: none

```css
.box.collapsed-box .box-body { display:none }   /* adminlte */
.box-body:before, .box-body:after { content:" ";display:table }   /* adminlte */
.box-body:after { clear:both }   /* adminlte */
.box-body { border-top-left-radius:0;border-top-right-radius:0;border-bottom-right-radius:3px;border-bottom-left-radius:3px;padding:10px }   /* adminlte */
.box-body>.table { margin-bottom:0 }   /* adminlte */
```

#### `.box-danger`

- Key: `fc-box`
- Source: dynamic/hbs/js; 9 file(s): `c/app-ui/box.hbs`, `c/app-ui/skeleton/project-dashboard.hbs`, `c/conversation/activity-box.hbs`, `c/issue/issue-details.hbs`, `app/controllers/app/project/board.js`, `t/app/agent/page.hbs`, `t/app/developer/component.hbs`, `t/app/project/index.hbs`, `t/app/projects/create.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.box.box-danger { border-top-color:#dd4b39 }   /* adminlte */
.box.box-solid.box-danger { border:1px solid #dd4b39 }   /* adminlte */
.box.box-solid.box-danger>.box-header { color:#fff;background:#dd4b39;background-color:#dd4b39 }   /* adminlte */
.box.box-solid.box-danger>.box-header a, .box.box-solid.box-danger>.box-header .btn { color:#fff }   /* adminlte */
```

#### `.box-default`

- Key: `fc-box`
- Source: dynamic/hbs; 11 file(s): `c/app-ui/box.hbs`, `c/app-ui/gantt-chart/edit-sheet.hbs`, `c/app-ui/skeleton/form.hbs`, `c/app-ui/skeleton/page-loading-body.hbs`, `c/app-ui/skeleton/project-dashboard.hbs`, `c/developer/entry.hbs`, `c/developer/event-log.hbs`, `c/issue/link-issue-modal.hbs`, `c/workflow/case-list.hbs`, `app/index.html`, `t/app/project/index.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.box.box-default { border-top-color:#d2d6de }   /* adminlte */
.box.box-solid.box-default { border:1px solid #d2d6de }   /* adminlte */
.box.box-solid.box-default>.box-header { color:#444;background:#d2d6de;background-color:#d2d6de }   /* adminlte */
.box.box-solid.box-default>.box-header a, .box.box-solid.box-default>.box-header .btn { color:#444 }   /* adminlte */
```

#### `.box-footer`

- Key: `fc-box`
- Source: hbs; 24 file(s): `c/agent/workflows.hbs`, `c/app-ui/box.hbs`, `c/app-ui/skeleton/issue-detail.hbs`, `c/conversation-ui/comment-composer.hbs`, `c/conversation/activity-box.hbs`, `c/conversation/linked-issue-box.hbs`, `c/conversation/thread-comments.hbs`, `c/conversation/vote-body.hbs`, `c/idea/conversation-box.hbs`, `c/idea/plan-box.hbs`, `c/issue/issue-details.hbs`, `t/app/agent/page.hbs`, `t/app/project/idea.hbs`, `t/app/project/index.hbs`, `t/app/project/issue/index.hbs`, `t/app/project/wiki/create.hbs`, `t/app/project/wiki/edit.hbs`, `t/app/project/wiki/page.hbs`, `t/app/projects/index.hbs`, `t/app/role/page.hbs`, `t/app/user/management.hbs`, `t/app/workspace/index.hbs`, `t/app/workspace/settings/projects.hbs`, `t/auth-status.hbs`
- Vendor: adminlte; states: after, before; breakpoints: none

```css
.box.collapsed-box .box-footer { display:none }   /* adminlte */
.box-footer:before, .box-footer:after { content:" ";display:table }   /* adminlte */
.box-footer:after { clear:both }   /* adminlte */
.box-footer { border-top-left-radius:0;border-top-right-radius:0;border-bottom-right-radius:3px;border-bottom-left-radius:3px;border-top:1px solid #f4f4f4;padding:10px;background-color:#fff }   /* adminlte */
```

#### `.box-header`

- Key: `fc-box`
- Source: hbs; 75 file(s): `c/agent/credentials.hbs`, `c/agent/workflows.hbs`, `c/app-ui/box.hbs`, `c/app-ui/gantt-chart/edit-sheet.hbs`, `c/app-ui/list-toolbar.hbs`, `c/app-ui/skeleton/calendar.hbs`, `c/app-ui/skeleton/issue-detail.hbs`, `c/app-ui/skeleton/kanban-board.hbs`, `c/app-ui/skeleton/project-dashboard.hbs`, `c/app-ui/skeleton/role-detail.hbs`, `c/app-ui/skeleton/user-management.hbs`, `c/app-ui/skeleton/user-profile.hbs`, `c/app-ui/skeleton/wiki-article.hbs`, `c/app-ui/table.hbs`, `c/app-ui/task-board/milestones.hbs`, `c/conversation/activity-box.hbs`, `c/conversation/linked-issue-box.hbs`, `c/conversation/participants-box.hbs`, `c/conversation/result-box.hbs`, `c/conversation/tags-box.hbs`, `c/conversation/thread-box.hbs`, `c/developer/component-nav.hbs`, `c/developer/docs.hbs`, `c/developer/entry-header.hbs`, `c/developer/entry.hbs`, `c/developer/event-log.hbs`, `c/idea/conversation-box.hbs`, `c/idea/created-issues-box.hbs`, `c/idea/plan-box.hbs`, `c/idea/summary-box.hbs`, `c/issue/issue-details.hbs`, `c/issue/link-issue-modal.hbs`, `c/issue/linked-issues.hbs`, `c/quick-list/header.hbs`, `c/user-profile/identities.hbs`, `c/user-profile/qualification.hbs`, `c/user-profile/skills.hbs`, `c/widgets/weekly-activities.hbs`, `c/widgets/weekly-conversations.hbs`, `c/workflow/case-list.hbs`, `c/workflow/flow-canvas.hbs`, `c/workflow/header-box.hbs`, `c/workflow/node-palette.hbs`, `c/workflow/properties-box.hbs`, `c/workflow/run-steps-box.hbs`, `c/workflow/runs-box.hbs`, `c/workflow/test-run-box.hbs`, `t/app/agent/create.hbs`, `t/app/agent/page.hbs`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`, `t/app/developer/component.hbs`, `t/app/project/board.hbs`, `t/app/project/conversation/index.hbs`, `t/app/project/idea/create.hbs`, `t/app/project/idea/index.hbs`, `t/app/project/index.hbs`, `t/app/project/issue/create.hbs`, `t/app/project/issue/index.hbs`, `t/app/project/wiki.hbs`, `t/app/project/wiki/create.hbs`, `t/app/project/wiki/edit.hbs`, `t/app/project/wiki/page.hbs`, `t/app/projects/create.hbs`, `t/app/projects/index.hbs`, `t/app/role/page.hbs`, `t/app/settings.hbs`, `t/app/settings/email.hbs`, `t/app/settings/issue-statuses.hbs`, `t/app/settings/issue-types.hbs`, `t/app/settings/services.hbs`, `t/app/user/create.hbs`, `t/app/user/management.hbs`, `t/app/user/page.hbs`, `t/auth-status.hbs`
- Vendor: adminlte; states: after, before, hover; breakpoints: none

```css
.box.box-solid>.box-header .btn.btn-default { background:transparent }   /* adminlte */
.box.box-solid>.box-header .btn:hover, .box.box-solid>.box-header a:hover { background:rgba(0,0,0,0.1) }   /* adminlte */
.box.box-solid.box-default>.box-header { color:#444;background:#d2d6de;background-color:#d2d6de }   /* adminlte */
.box.box-solid.box-default>.box-header a, .box.box-solid.box-default>.box-header .btn { color:#444 }   /* adminlte */
.box.box-solid.box-primary>.box-header { color:#fff;background:#3c8dbc;background-color:#3c8dbc }   /* adminlte */
.box.box-solid.box-primary>.box-header a, .box.box-solid.box-primary>.box-header .btn { color:#fff }   /* adminlte */
.box.box-solid.box-info>.box-header { color:#fff;background:#00c0ef;background-color:#00c0ef }   /* adminlte */
.box.box-solid.box-info>.box-header a, .box.box-solid.box-info>.box-header .btn { color:#fff }   /* adminlte */
.box.box-solid.box-danger>.box-header { color:#fff;background:#dd4b39;background-color:#dd4b39 }   /* adminlte */
.box.box-solid.box-danger>.box-header a, .box.box-solid.box-danger>.box-header .btn { color:#fff }   /* adminlte */
.box.box-solid.box-warning>.box-header { color:#fff;background:#f39c12;background-color:#f39c12 }   /* adminlte */
.box.box-solid.box-warning>.box-header a, .box.box-solid.box-warning>.box-header .btn { color:#fff }   /* adminlte */
.box.box-solid.box-success>.box-header { color:#fff;background:#00a65a;background-color:#00a65a }   /* adminlte */
.box.box-solid.box-success>.box-header a, .box.box-solid.box-success>.box-header .btn { color:#fff }   /* adminlte */
.box.box-solid>.box-header>.box-tools .btn { border:0;box-shadow:none }   /* adminlte */
.box.box-solid[class*='bg']>.box-header { color:#fff }   /* adminlte */
.box-header:before, .box-header:after { content:" ";display:table }   /* adminlte */
.box-header:after { clear:both }   /* adminlte */
.box-header { color:#444;display:block;padding:10px;position:relative }   /* adminlte */
.box-header.with-border { border-bottom:1px solid #f4f4f4 }   /* adminlte */
.collapsed-box .box-header.with-border { border-bottom:none }   /* adminlte */
.box-header>.fa, .box-header>.glyphicon, .box-header>.ion, .box-header .box-title { display:inline-block;font-size:18px;margin:0;line-height:1 }   /* adminlte */
.box-header>.fa, .box-header>.glyphicon, .box-header>.ion { margin-right:5px }   /* adminlte */
.box-header>.box-tools { position:absolute;right:10px;top:5px }   /* adminlte */
.box-header>.box-tools [data-toggle="tooltip"] { position:relative }   /* adminlte */
.box-header>.box-tools.pull-right .dropdown-menu { right:0;left:auto }   /* adminlte */
```

#### `.box-info`

- Key: `fc-box`
- Source: dynamic/hbs/js; 24 file(s): `c/app-ui/box.hbs`, `c/app-ui/skeleton/issue-detail.hbs`, `c/app-ui/skeleton/project-dashboard.hbs`, `c/app-ui/skeleton/role-detail.hbs`, `c/conversation/linked-issue-box.hbs`, `c/developer/docs.hbs`, `c/idea/created-issues-box.hbs`, `c/idea/summary-box.hbs`, `c/issue/issue-details.hbs`, `c/issue/linked-issues.hbs`, `c/workflow/node-palette.hbs`, `c/workflow/properties-box.hbs`, `c/workflow/run-steps-box.hbs`, `c/workflow/runs-box.hbs`, `c/workflow/test-run-box.hbs`, `app/controllers/app/project/board.js`, `t/app/agent/create.hbs`, `t/app/agent/page.hbs`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`, `t/app/project/index.hbs`, `t/app/project/issue/create.hbs`, `t/app/project/wiki/page.hbs`, `t/app/role/page.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.box.box-info { border-top-color:#00c0ef }   /* adminlte */
.box.box-solid.box-info { border:1px solid #00c0ef }   /* adminlte */
.box.box-solid.box-info>.box-header { color:#fff;background:#00c0ef;background-color:#00c0ef }   /* adminlte */
.box.box-solid.box-info>.box-header a, .box.box-solid.box-info>.box-header .btn { color:#fff }   /* adminlte */
```

#### `.box-primary`

- Key: `fc-box`
- Source: dynamic/hbs/hbs-literal/js/js-template; 66 file(s): `c/agent/credentials.hbs`, `c/app-ui/box.hbs`, `c/app-ui/gantt-chart.hbs`, `c/app-ui/modal.hbs`, `c/app-ui/skeleton/calendar.hbs`, `c/app-ui/skeleton/form.hbs`, `c/app-ui/skeleton/gantt.hbs`, `c/app-ui/skeleton/issue-detail.hbs`, `c/app-ui/skeleton/kanban-board.hbs`, `c/app-ui/skeleton/list-view.hbs`, `c/app-ui/skeleton/page-loading-body.hbs`, `c/app-ui/skeleton/project-dashboard.hbs`, `c/app-ui/skeleton/user-management.hbs`, `c/app-ui/skeleton/user-profile.hbs`, `c/app-ui/skeleton/widget-grid.hbs`, `c/app-ui/skeleton/wiki-article.hbs`, `c/app-ui/table.hbs`, `c/conversation/tags-box.hbs`, `c/conversation/thread-box.hbs`, `c/developer/component-nav.hbs`, `c/developer/demos/empty-state.hbs`, `c/developer/entry-header.hbs`, `c/idea/conversation-box.hbs`, `c/issue/issue-details.hbs`, `c/quick-list/index.hbs`, `c/quick-list/index.js`, `c/user-profile/identities.hbs`, `c/user-profile/qualification.hbs`, `c/user-profile/skills.hbs`, `c/widgets/weekly-activities.hbs`, `c/widgets/weekly-conversations.hbs`, `c/workflow/flow-canvas.hbs`, `c/workflow/header-box.hbs`, `app/controllers/app/project/board.js`, `app/index.html`, `t/app/agent/create.hbs`, `t/app/agent/index.hbs`, `t/app/agent/page.hbs`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`, `t/app/project/board.hbs`, `t/app/project/calendar.hbs`, `t/app/project/conversation/index.hbs`, `t/app/project/idea/create.hbs`, `t/app/project/idea/index.hbs`, `t/app/project/index.hbs`, `t/app/project/issue/create.hbs`, `t/app/project/issue/index.hbs`, `t/app/project/wiki/create.hbs`, `t/app/project/wiki/edit.hbs`, `t/app/project/wiki/page.hbs`, `t/app/projects/create.hbs`, `t/app/projects/index.hbs`, `t/app/role/index.hbs`, `t/app/role/page.hbs`, `t/app/settings-loading.hbs`, `t/app/settings.hbs`, `t/app/settings/email.hbs`, `t/app/settings/issue-statuses.hbs`, `t/app/settings/issue-types.hbs`, `t/app/settings/services.hbs`, `t/app/user/create.hbs`, `t/app/user/management.hbs`, `t/app/user/page.hbs`, `t/app/workflow/index.hbs`, `t/auth-status.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.box.box-primary { border-top-color:#3c8dbc }   /* adminlte */
.box.box-solid.box-primary { border:1px solid #3c8dbc }   /* adminlte */
.box.box-solid.box-primary>.box-header { color:#fff;background:#3c8dbc;background-color:#3c8dbc }   /* adminlte */
.box.box-solid.box-primary>.box-header a, .box.box-solid.box-primary>.box-header .btn { color:#fff }   /* adminlte */
```

#### `.box-solid`

- Key: `fc-box`
- Source: hbs; 1 file(s): `t/app/project/wiki.hbs`
- Vendor: adminlte; states: hover; breakpoints: none

```css
.box.box-solid { border-top:0 }   /* adminlte */
.box.box-solid>.box-header .btn.btn-default { background:transparent }   /* adminlte */
.box.box-solid>.box-header .btn:hover, .box.box-solid>.box-header a:hover { background:rgba(0,0,0,0.1) }   /* adminlte */
.box.box-solid.box-default { border:1px solid #d2d6de }   /* adminlte */
.box.box-solid.box-default>.box-header { color:#444;background:#d2d6de;background-color:#d2d6de }   /* adminlte */
.box.box-solid.box-default>.box-header a, .box.box-solid.box-default>.box-header .btn { color:#444 }   /* adminlte */
.box.box-solid.box-primary { border:1px solid #3c8dbc }   /* adminlte */
.box.box-solid.box-primary>.box-header { color:#fff;background:#3c8dbc;background-color:#3c8dbc }   /* adminlte */
.box.box-solid.box-primary>.box-header a, .box.box-solid.box-primary>.box-header .btn { color:#fff }   /* adminlte */
.box.box-solid.box-info { border:1px solid #00c0ef }   /* adminlte */
.box.box-solid.box-info>.box-header { color:#fff;background:#00c0ef;background-color:#00c0ef }   /* adminlte */
.box.box-solid.box-info>.box-header a, .box.box-solid.box-info>.box-header .btn { color:#fff }   /* adminlte */
.box.box-solid.box-danger { border:1px solid #dd4b39 }   /* adminlte */
.box.box-solid.box-danger>.box-header { color:#fff;background:#dd4b39;background-color:#dd4b39 }   /* adminlte */
.box.box-solid.box-danger>.box-header a, .box.box-solid.box-danger>.box-header .btn { color:#fff }   /* adminlte */
.box.box-solid.box-warning { border:1px solid #f39c12 }   /* adminlte */
.box.box-solid.box-warning>.box-header { color:#fff;background:#f39c12;background-color:#f39c12 }   /* adminlte */
.box.box-solid.box-warning>.box-header a, .box.box-solid.box-warning>.box-header .btn { color:#fff }   /* adminlte */
.box.box-solid.box-success { border:1px solid #00a65a }   /* adminlte */
.box.box-solid.box-success>.box-header { color:#fff;background:#00a65a;background-color:#00a65a }   /* adminlte */
.box.box-solid.box-success>.box-header a, .box.box-solid.box-success>.box-header .btn { color:#fff }   /* adminlte */
.box.box-solid>.box-header>.box-tools .btn { border:0;box-shadow:none }   /* adminlte */
.box.box-solid[class*='bg']>.box-header { color:#fff }   /* adminlte */
```

#### `.box-success`

- Key: `fc-box`
- Source: dynamic/hbs/js; 9 file(s): `c/agent/workflows.hbs`, `c/app-ui/box.hbs`, `c/app-ui/skeleton/project-dashboard.hbs`, `c/conversation/participants-box.hbs`, `c/idea/plan-box.hbs`, `c/issue/issue-details.hbs`, `app/controllers/app/project/board.js`, `t/app/agent/page.hbs`, `t/app/project/index.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.box.box-success { border-top-color:#00a65a }   /* adminlte */
.box.box-solid.box-success { border:1px solid #00a65a }   /* adminlte */
.box.box-solid.box-success>.box-header { color:#fff;background:#00a65a;background-color:#00a65a }   /* adminlte */
.box.box-solid.box-success>.box-header a, .box.box-solid.box-success>.box-header .btn { color:#fff }   /* adminlte */
```

#### `.box-title`

- Key: `fc-box`
- Source: hbs; 69 file(s): `c/agent/credentials.hbs`, `c/agent/workflows.hbs`, `c/app-ui/gantt-chart/edit-sheet.hbs`, `c/app-ui/table.hbs`, `c/conversation/activity-box.hbs`, `c/conversation/linked-issue-box.hbs`, `c/conversation/participants-box.hbs`, `c/conversation/result-box.hbs`, `c/conversation/tags-box.hbs`, `c/conversation/thread-box.hbs`, `c/developer/component-nav.hbs`, `c/developer/demos/box.hbs`, `c/developer/docs.hbs`, `c/developer/entry-header.hbs`, `c/developer/entry.hbs`, `c/developer/event-log.hbs`, `c/idea/conversation-box.hbs`, `c/idea/created-issues-box.hbs`, `c/idea/plan-box.hbs`, `c/idea/summary-box.hbs`, `c/issue/issue-details.hbs`, `c/issue/link-issue-modal.hbs`, `c/issue/linked-issues.hbs`, `c/quick-list/header.hbs`, `c/user-profile/identities.hbs`, `c/user-profile/qualification.hbs`, `c/user-profile/skills.hbs`, `c/widgets/weekly-activities.hbs`, `c/widgets/weekly-conversations.hbs`, `c/workflow/case-list.hbs`, `c/workflow/flow-canvas.hbs`, `c/workflow/header-box.hbs`, `c/workflow/node-palette.hbs`, `c/workflow/properties-box.hbs`, `c/workflow/run-steps-box.hbs`, `c/workflow/runs-box.hbs`, `c/workflow/test-run-box.hbs`, `c/workspace/details-form.hbs`, `t/app/agent/create.hbs`, `t/app/agent/page.hbs`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`, `t/app/developer/component.hbs`, `t/app/project/board.hbs`, `t/app/project/conversation/index.hbs`, `t/app/project/idea/create.hbs`, `t/app/project/idea/index.hbs`, `t/app/project/index.hbs`, `t/app/project/issue/create.hbs`, `t/app/project/issue/index.hbs`, `t/app/project/wiki.hbs`, `t/app/project/wiki/create.hbs`, `t/app/project/wiki/edit.hbs`, `t/app/project/wiki/page.hbs`, `t/app/projects/create.hbs`, `t/app/role/page.hbs`, `t/app/settings.hbs`, `t/app/settings/email.hbs`, `t/app/settings/issue-statuses.hbs`, `t/app/settings/issue-types.hbs`, `t/app/settings/services.hbs`, `t/app/user/create.hbs`, `t/app/user/page.hbs`, `t/app/workspace/index.hbs`, `t/app/workspace/settings/agents.hbs`, `t/app/workspace/settings/delete.hbs`, `t/app/workspace/settings/environment.hbs`, `t/app/workspace/settings/projects.hbs`, `t/auth-status.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.box-header .box-title { display:inline-block;font-size:18px;margin:0;line-height:1 }   /* adminlte */
```

#### `.box-tools`

- Key: `fc-box`
- Source: hbs/js-template; 34 file(s): `c/app-ui/box.hbs`, `c/app-ui/skeleton/wiki-article.hbs`, `c/app-ui/table.hbs`, `c/conversation/tags-box.hbs`, `c/conversation/thread-box.hbs`, `c/developer/component-nav.hbs`, `c/developer/docs.hbs`, `c/developer/entry-header.hbs`, `c/developer/entry.hbs`, `c/developer/event-log.hbs`, `c/idea/conversation-box.hbs`, `c/idea/created-issues-box.hbs`, `c/idea/plan-box.hbs`, `c/issue/issue-details.hbs`, `c/issue/linked-issues.hbs`, `c/quick-list/header.hbs`, `c/quick-list/index.js`, `c/workflow/case-list.hbs`, `c/workflow/condition-list.hbs`, `c/workflow/flow-canvas.hbs`, `c/workflow/header-box.hbs`, `c/workflow/properties-box.hbs`, `c/workflow/runs-box.hbs`, `c/workflow/test-run-box.hbs`, `t/app/agent/page.hbs`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`, `t/app/project/index.hbs`, `t/app/project/wiki/page.hbs`, `t/app/role/page.hbs`, `t/app/settings/issue-statuses.hbs`, `t/app/settings/issue-types.hbs`, `t/app/settings/services.hbs`, `t/auth-status.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.box.box-solid>.box-header>.box-tools .btn { border:0;box-shadow:none }   /* adminlte */
.box-header>.box-tools { position:absolute;right:10px;top:5px }   /* adminlte */
.box-header>.box-tools [data-toggle="tooltip"] { position:relative }   /* adminlte */
.box-header>.box-tools.pull-right .dropdown-menu { right:0;left:auto }   /* adminlte */
```

#### `.box-warning`

- Key: `fc-box`
- Source: dynamic/hbs/js; 15 file(s): `c/app-ui/box.hbs`, `c/app-ui/skeleton/issue-detail.hbs`, `c/app-ui/skeleton/project-dashboard.hbs`, `c/app-ui/skeleton/role-detail.hbs`, `c/conversation/result-box.hbs`, `c/issue/issue-details.hbs`, `app/controllers/app/project/board.js`, `t/app/agent/create.hbs`, `t/app/agent/page.hbs`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`, `t/app/project/index.hbs`, `t/app/project/issue/create.hbs`, `t/app/projects/create.hbs`, `t/app/role/page.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.box.box-warning { border-top-color:#f39c12 }   /* adminlte */
.box.box-solid.box-warning { border:1px solid #f39c12 }   /* adminlte */
.box.box-solid.box-warning>.box-header { color:#fff;background:#f39c12;background-color:#f39c12 }   /* adminlte */
.box.box-solid.box-warning>.box-header a, .box.box-solid.box-warning>.box-header .btn { color:#fff }   /* adminlte */
```

#### `.btn-box-tool`

- Key: `fc-box`
- Source: hbs/js; 42 file(s): `c/app-ui/data-table.hbs`, `c/app-ui/gantt-chart/edit-sheet.hbs`, `c/app-ui/gantt-chart/issue-list.hbs`, `c/app-ui/gantt-chart/selection-bar.hbs`, `c/app-ui/gantt-chart/task-row.hbs`, `c/app-ui/task-board/milestones.hbs`, `c/app-ui/toolbar.hbs`, `c/conversation-ui/comment-item.hbs`, `c/conversation-ui/pending-comment.hbs`, `c/conversation/tags-box.hbs`, `c/conversation/thread-box.hbs`, `c/developer/demos/box.hbs`, `c/developer/demos/data-table.hbs`, `c/developer/demos/quick-list.hbs`, `c/developer/demos/tabs.hbs`, `c/developer/entry.hbs`, `c/developer/event-log.hbs`, `c/ez-search/condition.hbs`, `c/ez-search/group.hbs`, `c/idea/conversation-box.hbs`, `c/idea/plan-box.hbs`, `c/issue/issue-details.hbs`, `c/issue/issue-tags.hbs`, `c/issue/link-issue-modal.hbs`, `c/issue/linked-issues.hbs`, `c/project/milestones.hbs`, `c/quick-list/index.js`, `c/quick-list/item.js`, `c/tags/edit-modal.hbs`, `c/workflow/case-list.hbs`, `c/workflow/condition-list.hbs`, `c/workflow/flow-canvas.hbs`, `c/workflow/runs-box.hbs`, `c/workflow/test-run-box.hbs`, `t/app/agent/page.hbs`, `t/app/project/index.hbs`, `t/app/project/issue/index.hbs`, `t/app/projects/index.hbs`, `t/app/role/page.hbs`, `t/app/settings/issue-statuses.hbs`, `t/app/settings/issue-types.hbs`, `t/app/user/management.hbs`
- Vendor: adminlte; states: .open, active, hover; breakpoints: none

```css
.btn-box-tool { padding:5px;font-size:12px;background:transparent;color:#97a0b3 }   /* adminlte */
.open .btn-box-tool, .btn-box-tool:hover { color:#606c84 }   /* adminlte */
.btn-box-tool.btn:active { box-shadow:none }   /* adminlte */
```

#### `.collapsed-box`

- Key: `fc-box`
- Source: hbs/hbs-literal; 1 file(s): `c/app-ui/box.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.box.collapsed-box .box-body, .box.collapsed-box .box-footer { display:none }   /* adminlte */
.collapsed-box .box-header.with-border { border-bottom:none }   /* adminlte */
```

#### `.overlay`

- Key: `fc-box`
- Source: js; 1 file(s): `app/modifiers/lock-item.js`
- Vendor: adminlte; states: none; breakpoints: none

```css
.box>.overlay { position:absolute;top:0;left:0;width:100%;height:100% }   /* adminlte */
.box .overlay { z-index:50;background:rgba(255,255,255,0.7);border-radius:3px }   /* adminlte */
.box .overlay>.fa { position:absolute;top:50%;left:50%;margin-left:-15px;margin-top:-15px;color:#000;font-size:30px }   /* adminlte */
```

#### `.with-border`

- Key: `fc-box`
- Source: hbs; 76 file(s): `c/agent/credentials.hbs`, `c/agent/workflows.hbs`, `c/app-ui/box.hbs`, `c/app-ui/gantt-chart/edit-sheet.hbs`, `c/app-ui/list-toolbar.hbs`, `c/app-ui/skeleton/calendar.hbs`, `c/app-ui/skeleton/form.hbs`, `c/app-ui/skeleton/issue-detail.hbs`, `c/app-ui/skeleton/kanban-board.hbs`, `c/app-ui/skeleton/project-dashboard.hbs`, `c/app-ui/skeleton/user-management.hbs`, `c/app-ui/skeleton/user-profile.hbs`, `c/app-ui/skeleton/widget-grid.hbs`, `c/app-ui/skeleton/wiki-article.hbs`, `c/app-ui/table.hbs`, `c/app-ui/task-board/milestones.hbs`, `c/conversation/activity-box.hbs`, `c/conversation/linked-issue-box.hbs`, `c/conversation/participants-box.hbs`, `c/conversation/result-box.hbs`, `c/conversation/tags-box.hbs`, `c/conversation/thread-box.hbs`, `c/developer/component-nav.hbs`, `c/developer/docs.hbs`, `c/developer/entry-header.hbs`, `c/developer/entry.hbs`, `c/developer/event-log.hbs`, `c/idea/conversation-box.hbs`, `c/idea/created-issues-box.hbs`, `c/idea/plan-box.hbs`, `c/idea/summary-box.hbs`, `c/issue/issue-details.hbs`, `c/issue/link-issue-modal.hbs`, `c/issue/linked-issues.hbs`, `c/quick-list/header.hbs`, `c/user-profile/identities.hbs`, `c/user-profile/qualification.hbs`, `c/user-profile/skills.hbs`, `c/widgets/weekly-activities.hbs`, `c/widgets/weekly-conversations.hbs`, `c/workflow/case-list.hbs`, `c/workflow/flow-canvas.hbs`, `c/workflow/header-box.hbs`, `c/workflow/node-palette.hbs`, `c/workflow/properties-box.hbs`, `c/workflow/run-steps-box.hbs`, `c/workflow/runs-box.hbs`, `c/workflow/test-run-box.hbs`, `t/app/agent/create.hbs`, `t/app/agent/page.hbs`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`, `t/app/developer/component.hbs`, `t/app/project/board.hbs`, `t/app/project/conversation/index.hbs`, `t/app/project/idea/create.hbs`, `t/app/project/idea/index.hbs`, `t/app/project/index.hbs`, `t/app/project/issue/create.hbs`, `t/app/project/issue/index.hbs`, `t/app/project/wiki.hbs`, `t/app/project/wiki/create.hbs`, `t/app/project/wiki/edit.hbs`, `t/app/project/wiki/page.hbs`, `t/app/projects/create.hbs`, `t/app/projects/index.hbs`, `t/app/role/page.hbs`, `t/app/settings.hbs`, `t/app/settings/email.hbs`, `t/app/settings/issue-statuses.hbs`, `t/app/settings/issue-types.hbs`, `t/app/settings/services.hbs`, `t/app/user/create.hbs`, `t/app/user/management.hbs`, `t/app/user/page.hbs`, `t/auth-status.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.box-header.with-border { border-bottom:1px solid #f4f4f4 }   /* adminlte */
.collapsed-box .box-header.with-border { border-bottom:none }   /* adminlte */
```


### `fc-buttons`

#### `.btn`

- Key: `fc-buttons`
- Source: hbs/js; 115 file(s): `c/agent/credentials.hbs`, `c/agent/workflows.hbs`, `c/app-layouts/application-header.hbs`, `c/app-ui/data-table.hbs`, `c/app-ui/dropdown.hbs`, `c/app-ui/gantt-chart.hbs`, `c/app-ui/gantt-chart/edit-sheet.hbs`, `c/app-ui/gantt-chart/issue-list.hbs`, `c/app-ui/gantt-chart/selection-bar.hbs`, `c/app-ui/gantt-chart/task-row.hbs`, `c/app-ui/inline-editable.hbs`, `c/app-ui/list-toolbar.hbs`, `c/app-ui/modal.hbs`, `c/app-ui/pager.hbs`, `c/app-ui/table.hbs`, `c/app-ui/task-board/milestones.hbs`, `c/app-ui/toolbar.hbs`, `c/conversation-ui/comment-item.hbs`, `c/conversation-ui/message-box.hbs`, `c/conversation-ui/pending-comment.hbs`, `c/conversation/activity-box.hbs`, `c/conversation/linked-issue-box.hbs`, `c/conversation/tags-box.hbs`, `c/conversation/thread-box.hbs`, `c/conversation/thread-comments.hbs`, `c/conversation/voter-list.hbs`, `c/developer/demos/box.hbs`, `c/developer/demos/data-table.hbs`, `c/developer/demos/dropdown.hbs`, `c/developer/demos/empty-state.hbs`, `c/developer/demos/ez-search.hbs`, `c/developer/demos/icon.hbs`, `c/developer/demos/list-page.hbs`, `c/developer/demos/modal.hbs`, `c/developer/demos/quick-list.hbs`, `c/developer/demos/tabs.hbs`, `c/developer/entry.hbs`, `c/developer/event-log.hbs`, `c/developer/state-switch.hbs`, `c/ez-search-compact/actions.hbs`, `c/ez-search-compact/index.hbs`, `c/ez-search/applied-filters.hbs`, `c/ez-search/condition.hbs`, `c/ez-search/group.hbs`, `c/ez-search/index.hbs`, `c/idea/composer.hbs`, `c/idea/conversation-box.hbs`, `c/idea/message-item.hbs`, `c/idea/plan-box.hbs`, `c/infinite-scroll.hbs`, `c/issue/file-preview.hbs`, `c/issue/issue-details.hbs`, `c/issue/issue-plan-task-node.hbs`, `c/issue/issue-tags.hbs`, `c/issue/link-issue-modal.hbs`, `c/issue/linked-issues.hbs`, `c/project/milestones.hbs`, `c/quick-list/index.hbs`, `c/quick-list/index.js`, `c/quick-list/item.js`, `c/quick-list/select-all.hbs`, `c/quick-list/selection-bar.hbs`, `c/tags/edit-modal.hbs`, `c/tags/rename-panel.hbs`, `c/user-profile/identities.hbs`, `c/user-profile/qualification.hbs`, `c/user-profile/skills.hbs`, `c/widgets/weekly-activities.hbs`, `c/widgets/weekly-conversations.hbs`, `c/workflow/case-list.hbs`, `c/workflow/condition-list.hbs`, `c/workflow/flow-canvas.hbs`, `c/workflow/header-box.hbs`, `c/workflow/runs-box.hbs`, `c/workflow/step-form.hbs`, `c/workflow/test-run-box.hbs`, `c/workspace/details-form.hbs`, `c/workspace/remove-member-dialog.hbs`, `t/app/agent/create.hbs`, `t/app/agent/index.hbs`, `t/app/agent/page.hbs`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`, `t/app/index.hbs`, `t/app/module.hbs`, `t/app/project/conversation.hbs`, `t/app/project/idea.hbs`, `t/app/project/idea/create.hbs`, `t/app/project/index.hbs`, `t/app/project/issue/create.hbs`, `t/app/project/issue/index.hbs`, `t/app/project/wiki.hbs`, `t/app/project/wiki/create.hbs`, `t/app/project/wiki/edit.hbs`, `t/app/project/wiki/index.hbs`, `t/app/project/wiki/page.hbs`, `t/app/projects/create.hbs`, `t/app/projects/index.hbs`, `t/app/role.hbs`, `t/app/role/page.hbs`, `t/app/settings/email.hbs`, `t/app/settings/issue-statuses.hbs`, `t/app/settings/issue-types.hbs`, `t/app/settings/services.hbs`, `t/app/user/create.hbs`, `t/app/user/management.hbs`, `t/app/workflow/index.hbs`, `t/app/workspace/index.hbs`, `t/app/workspace/settings/delete.hbs`, `t/app/workspace/settings/environment.hbs`, `t/app/workspace/settings/projects.hbs`, `t/app/workspaces/index.hbs`, `t/auth-status.hbs`, `t/reset-password.hbs`, `t/signin.hbs`
- Vendor: adminlte, bootstrap; states: .active, .disabled, active, first-child, focus, hover, last-child, not; breakpoints: @media print

```css
@media print { .btn > .caret { border-top-color: #000 !important; } }   /* bootstrap */
.btn { display: inline-block; margin-bottom: 0; font-weight: normal; text-align: center; white-space: nowrap; vertical-align: middle; touch-action: manipulation; cursor: pointer; background-image: none; border: 1px solid transparent; padding: 6px 12px; font-size: 14px; line-height: 1.428571429; border-radius: 4px; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }   /* bootstrap */
.btn:focus, .btn:active:focus, .btn.active:focus { outline: 5px auto -webkit-focus-ring-color; outline-offset: -2px; }   /* bootstrap */
.btn:hover, .btn:focus { color: #333; text-decoration: none; }   /* bootstrap */
.btn:active, .btn.active { background-image: none; outline: 0; -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125); box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125); }   /* bootstrap */
.btn.disabled, .btn[disabled], fieldset[disabled] .btn { cursor: not-allowed; filter: alpha(opacity=65); opacity: 0.65; -webkit-box-shadow: none; box-shadow: none; }   /* bootstrap */
a.btn.disabled, fieldset[disabled] a.btn { pointer-events: none; }   /* bootstrap */
.btn-group-sm > .btn { padding: 5px 10px; font-size: 12px; line-height: 1.5; border-radius: 3px; }   /* bootstrap */
.btn-group-xs > .btn { padding: 1px 5px; font-size: 12px; line-height: 1.5; border-radius: 3px; }   /* bootstrap */
.btn-group > .btn { position: relative; float: left; }   /* bootstrap */
.btn-group > .btn:hover, .btn-group > .btn:focus, .btn-group > .btn:active, .btn-group > .btn.active { z-index: 2; }   /* bootstrap */
.btn-group .btn + .btn, .btn-group .btn + .btn-group, .btn-group .btn-group + .btn { margin-left: -1px; }   /* bootstrap */
.btn-group > .btn:not(:first-child):not(:last-child):not(.dropdown-toggle) { border-radius: 0; }   /* bootstrap */
.btn-group > .btn:first-child { margin-left: 0; }   /* bootstrap */
.btn-group > .btn:first-child:not(:last-child):not(.dropdown-toggle) { border-top-right-radius: 0; border-bottom-right-radius: 0; }   /* bootstrap */
.btn-group > .btn:last-child:not(:first-child) { border-top-left-radius: 0; border-bottom-left-radius: 0; }   /* bootstrap */
.btn-group > .btn-group:not(:first-child):not(:last-child) > .btn { border-radius: 0; }   /* bootstrap */
.btn-group > .btn-group:first-child:not(:last-child) > .btn:last-child { border-top-right-radius: 0; border-bottom-right-radius: 0; }   /* bootstrap */
.btn-group > .btn-group:last-child:not(:first-child) > .btn:first-child { border-top-left-radius: 0; border-bottom-left-radius: 0; }   /* bootstrap */
.btn-group > .btn + .dropdown-toggle { padding-right: 8px; padding-left: 8px; }   /* bootstrap */
.btn .caret { margin-left: 0; }   /* bootstrap */
[data-toggle=buttons] > .btn input[type=radio], [data-toggle=buttons] > .btn input[type=checkbox], [data-toggle=buttons] > .btn-group > .btn input[type=radio], [data-toggle=buttons] > .btn-group > .btn input[type=checkbox] { position: absolute; clip: rect(0, 0, 0, 0); pointer-events: none; }   /* bootstrap */
.input-group-btn:first-child > .btn, .input-group-btn:first-child > .btn-group > .btn, .input-group-btn:last-child > .btn:not(:last-child):not(.dropdown-toggle), .input-group-btn:last-child > .btn-group:not(:last-child) > .btn { border-top-right-radius: 0; border-bottom-right-radius: 0; }   /* bootstrap */
.input-group-btn:last-child > .btn, .input-group-btn:last-child > .btn-group > .btn, .input-group-btn:first-child > .btn:not(:first-child), .input-group-btn:first-child > .btn-group:not(:first-child) > .btn { border-top-left-radius: 0; border-bottom-left-radius: 0; }   /* bootstrap */
.input-group-btn > .btn { position: relative; }   /* bootstrap */
.input-group-btn > .btn + .btn { margin-left: -1px; }   /* bootstrap */
.input-group-btn > .btn:hover, .input-group-btn > .btn:focus, .input-group-btn > .btn:active { z-index: 2; }   /* bootstrap */
.input-group-btn:first-child > .btn { margin-right: -1px; }   /* bootstrap */
.input-group-btn:last-child > .btn { z-index: 2; margin-left: -1px; }   /* bootstrap */
.btn .label { position: relative; top: -1px; }   /* bootstrap */
.btn .badge { position: relative; top: -1px; }   /* bootstrap */
.btn-group-xs > .btn .badge { top: 0; padding: 1px 5px; }   /* bootstrap */
.modal-footer .btn + .btn { margin-bottom: 0; margin-left: 5px; }   /* bootstrap */
.modal-footer .btn-group .btn + .btn { margin-left: -1px; }   /* bootstrap */
.box.box-solid>.box-header .btn.btn-default { background:transparent }   /* adminlte */
.box.box-solid>.box-header .btn:hover { background:rgba(0,0,0,0.1) }   /* adminlte */
.box.box-solid.box-default>.box-header .btn { color:#444 }   /* adminlte */
.box.box-solid.box-primary>.box-header .btn { color:#fff }   /* adminlte */
.box.box-solid.box-info>.box-header .btn { color:#fff }   /* adminlte */
.box.box-solid.box-danger>.box-header .btn { color:#fff }   /* adminlte */
.box.box-solid.box-warning>.box-header .btn { color:#fff }   /* adminlte */
.box.box-solid.box-success>.box-header .btn { color:#fff }   /* adminlte */
.box.box-solid>.box-header>.box-tools .btn { border:0;box-shadow:none }   /* adminlte */
.btn-box-tool.btn:active { box-shadow:none }   /* adminlte */
.btn { border-radius:3px;-webkit-box-shadow:none;box-shadow:none;border:1px solid transparent }   /* adminlte */
.btn.uppercase { text-transform:uppercase }   /* adminlte */
.btn.btn-flat { border-radius:0;-webkit-box-shadow:none;-moz-box-shadow:none;box-shadow:none;border-width:1px }   /* adminlte */
.btn:active { -webkit-box-shadow:inset 0 3px 5px rgba(0,0,0,0.125);-moz-box-shadow:inset 0 3px 5px rgba(0,0,0,0.125);box-shadow:inset 0 3px 5px rgba(0,0,0,0.125) }   /* adminlte */
.btn:focus { outline:none }   /* adminlte */
.btn[class*='bg-']:hover { -webkit-box-shadow:inset 0 0 100px rgba(0,0,0,0.2);box-shadow:inset 0 0 100px rgba(0,0,0,0.2) }   /* adminlte */
```

#### `.btn-block`

- Key: `fc-buttons`
- Source: hbs; 2 file(s): `t/app/project/wiki.hbs`, `t/signin.hbs`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.btn-block { display: block; width: 100%; }   /* bootstrap */
.btn-block + .btn-block { margin-top: 5px; }   /* bootstrap */
input[type=submit].btn-block, input[type=reset].btn-block, input[type=button].btn-block { width: 100%; }   /* bootstrap */
.modal-footer .btn-block + .btn-block { margin-left: 0; }   /* bootstrap */
```

#### `.btn-danger`

- Key: `fc-buttons`
- Source: hbs; 5 file(s): `c/developer/demos/quick-list.hbs`, `c/tags/rename-panel.hbs`, `t/app/settings/services.hbs`, `t/app/workspace/settings/delete.hbs`, `t/auth-status.hbs`
- Vendor: adminlte, bootstrap; states: .active, .disabled, .open, active, focus, hover; breakpoints: none

```css
.btn-danger { color: #fff; background-color: #d9534f; border-color: #d43f3a; }   /* bootstrap */
.btn-danger:focus { color: #fff; background-color: #c9302c; border-color: #761c19; }   /* bootstrap */
.btn-danger:hover { color: #fff; background-color: #c9302c; border-color: #ac2925; }   /* bootstrap */
.btn-danger:active, .btn-danger.active, .open > .btn-danger.dropdown-toggle { color: #fff; background-color: #c9302c; background-image: none; border-color: #ac2925; }   /* bootstrap */
.btn-danger:active:hover, .btn-danger:active:focus, .btn-danger.active:hover, .btn-danger.active:focus, .open > .btn-danger.dropdown-toggle:hover, .open > .btn-danger.dropdown-toggle:focus { color: #fff; background-color: #ac2925; border-color: #761c19; }   /* bootstrap */
.btn-danger.disabled:hover, .btn-danger.disabled:focus, .btn-danger[disabled]:hover, .btn-danger[disabled]:focus, fieldset[disabled] .btn-danger:hover, fieldset[disabled] .btn-danger:focus { background-color: #d9534f; border-color: #d43f3a; }   /* bootstrap */
.btn-danger .badge { color: #d9534f; background-color: #fff; }   /* bootstrap */
.btn-danger { background-color:#dd4b39;border-color:#d73925 }   /* adminlte */
.btn-danger:hover, .btn-danger:active { background-color:#d73925 }   /* adminlte */
```

#### `.btn-default`

- Key: `fc-buttons`
- Source: hbs/hbs-literal; 66 file(s): `c/agent/credentials.hbs`, `c/app-layouts/application-header.hbs`, `c/app-ui/dropdown.hbs`, `c/app-ui/gantt-chart.hbs`, `c/app-ui/gantt-chart/edit-sheet.hbs`, `c/app-ui/gantt-chart/selection-bar.hbs`, `c/app-ui/list-toolbar.hbs`, `c/app-ui/modal.hbs`, `c/app-ui/pager.hbs`, `c/app-ui/table.hbs`, `c/conversation/activity-box.hbs`, `c/conversation/linked-issue-box.hbs`, `c/developer/demos/box.hbs`, `c/developer/demos/data-table.hbs`, `c/developer/demos/dropdown.hbs`, `c/developer/demos/ez-search.hbs`, `c/developer/demos/icon.hbs`, `c/developer/demos/list-page.hbs`, `c/developer/demos/modal.hbs`, `c/developer/demos/quick-list.hbs`, `c/developer/state-switch.hbs`, `c/ez-search-compact/actions.hbs`, `c/ez-search-compact/index.hbs`, `c/ez-search/applied-filters.hbs`, `c/ez-search/group.hbs`, `c/ez-search/index.hbs`, `c/issue/issue-details.hbs`, `c/issue/link-issue-modal.hbs`, `c/quick-list/select-all.hbs`, `c/quick-list/selection-bar.hbs`, `c/tags/rename-panel.hbs`, `c/user-profile/identities.hbs`, `c/user-profile/qualification.hbs`, `c/user-profile/skills.hbs`, `c/widgets/weekly-activities.hbs`, `c/widgets/weekly-conversations.hbs`, `c/workflow/case-list.hbs`, `c/workflow/condition-list.hbs`, `c/workflow/header-box.hbs`, `c/workflow/step-form.hbs`, `c/workspace/details-form.hbs`, `c/workspace/remove-member-dialog.hbs`, `t/app/agent/create.hbs`, `t/app/agent/index.hbs`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`, `t/app/module.hbs`, `t/app/project/idea/create.hbs`, `t/app/project/issue/create.hbs`, `t/app/project/issue/index.hbs`, `t/app/project/wiki/create.hbs`, `t/app/project/wiki/edit.hbs`, `t/app/project/wiki/page.hbs`, `t/app/projects/create.hbs`, `t/app/projects/index.hbs`, `t/app/settings/email.hbs`, `t/app/settings/services.hbs`, `t/app/user/create.hbs`, `t/app/user/management.hbs`, `t/app/workflow/index.hbs`, `t/app/workspace/index.hbs`, `t/app/workspace/settings/environment.hbs`, `t/app/workspace/settings/projects.hbs`, `t/auth-status.hbs`, `t/reset-password.hbs`, `t/signin.hbs`
- Vendor: adminlte, bootstrap; states: .active, .disabled, .open, active, focus, hover; breakpoints: @media (max-width:991px)

```css
.btn-default { color: #333; background-color: #fff; border-color: #ccc; }   /* bootstrap */
.btn-default:focus { color: #333; background-color: #e5e5e5; border-color: #8c8c8c; }   /* bootstrap */
.btn-default:hover { color: #333; background-color: #e5e5e5; border-color: #adadad; }   /* bootstrap */
.btn-default:active, .btn-default.active, .open > .btn-default.dropdown-toggle { color: #333; background-color: #e5e5e5; background-image: none; border-color: #adadad; }   /* bootstrap */
.btn-default:active:hover, .btn-default:active:focus, .btn-default.active:hover, .btn-default.active:focus, .open > .btn-default.dropdown-toggle:hover, .open > .btn-default.dropdown-toggle:focus { color: #333; background-color: #d4d4d4; border-color: #8c8c8c; }   /* bootstrap */
.btn-default.disabled:hover, .btn-default.disabled:focus, .btn-default[disabled]:hover, .btn-default[disabled]:focus, fieldset[disabled] .btn-default:hover, fieldset[disabled] .btn-default:focus { background-color: #fff; border-color: #ccc; }   /* bootstrap */
.btn-default .badge { color: #fff; background-color: #333; }   /* bootstrap */
.navbar-nav>.user-menu>.dropdown-menu>.user-footer .btn-default { color:#666666 }   /* adminlte */
@media (max-width:991px) { .navbar-nav>.user-menu>.dropdown-menu>.user-footer .btn-default:hover { background-color:#f9f9f9 } }   /* adminlte */
.box.box-solid>.box-header .btn.btn-default { background:transparent }   /* adminlte */
.btn-default { background-color:#f4f4f4;color:#444;border-color:#ddd }   /* adminlte */
.btn-default:hover, .btn-default:active { background-color:#e7e7e7 }   /* adminlte */
```

#### `.btn-flat`

- Key: `fc-buttons`
- Source: hbs; 2 file(s): `c/app-layouts/application-header.hbs`, `t/signin.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.btn.btn-flat { border-radius:0;-webkit-box-shadow:none;-moz-box-shadow:none;box-shadow:none;border-width:1px }   /* adminlte */
```

#### `.btn-group`

- Key: `fc-buttons`
- Source: hbs; 16 file(s): `c/app-ui/gantt-chart.hbs`, `c/app-ui/pager.hbs`, `c/developer/demos/box.hbs`, `c/developer/demos/data-table.hbs`, `c/developer/demos/dropdown.hbs`, `c/developer/demos/ez-search.hbs`, `c/developer/demos/icon.hbs`, `c/developer/demos/list-page.hbs`, `c/developer/state-switch.hbs`, `c/ez-search/group.hbs`, `t/app/agent/index.hbs`, `t/app/module.hbs`, `t/app/project/issue/index.hbs`, `t/app/projects/index.hbs`, `t/app/user/management.hbs`, `t/app/workflow/index.hbs`
- Vendor: bootstrap; states: .active, .open, active, first-child, focus, hover, last-child, not; breakpoints: none

```css
.btn-group { position: relative; display: inline-block; vertical-align: middle; }   /* bootstrap */
.btn-group > .btn { position: relative; float: left; }   /* bootstrap */
.btn-group > .btn:hover, .btn-group > .btn:focus, .btn-group > .btn:active, .btn-group > .btn.active { z-index: 2; }   /* bootstrap */
.btn-group .btn + .btn, .btn-group .btn + .btn-group, .btn-group .btn-group + .btn, .btn-group .btn-group + .btn-group { margin-left: -1px; }   /* bootstrap */
.btn-group > .btn:not(:first-child):not(:last-child):not(.dropdown-toggle) { border-radius: 0; }   /* bootstrap */
.btn-group > .btn:first-child { margin-left: 0; }   /* bootstrap */
.btn-group > .btn:first-child:not(:last-child):not(.dropdown-toggle) { border-top-right-radius: 0; border-bottom-right-radius: 0; }   /* bootstrap */
.btn-group > .btn:last-child:not(:first-child), .btn-group > .dropdown-toggle:not(:first-child) { border-top-left-radius: 0; border-bottom-left-radius: 0; }   /* bootstrap */
.btn-group > .btn-group { float: left; }   /* bootstrap */
.btn-group > .btn-group:not(:first-child):not(:last-child) > .btn { border-radius: 0; }   /* bootstrap */
.btn-group > .btn-group:first-child:not(:last-child) > .btn:last-child, .btn-group > .btn-group:first-child:not(:last-child) > .dropdown-toggle { border-top-right-radius: 0; border-bottom-right-radius: 0; }   /* bootstrap */
.btn-group > .btn-group:last-child:not(:first-child) > .btn:first-child { border-top-left-radius: 0; border-bottom-left-radius: 0; }   /* bootstrap */
.btn-group .dropdown-toggle:active, .btn-group.open .dropdown-toggle { outline: 0; }   /* bootstrap */
.btn-group > .btn + .dropdown-toggle { padding-right: 8px; padding-left: 8px; }   /* bootstrap */
.btn-group.open .dropdown-toggle { -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125); box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125); }   /* bootstrap */
.btn-group.open .dropdown-toggle.btn-link { -webkit-box-shadow: none; box-shadow: none; }   /* bootstrap */
[data-toggle=buttons] > .btn-group > .btn input[type=radio], [data-toggle=buttons] > .btn-group > .btn input[type=checkbox] { position: absolute; clip: rect(0, 0, 0, 0); pointer-events: none; }   /* bootstrap */
.input-group-btn:first-child > .btn-group > .btn, .input-group-btn:last-child > .btn-group:not(:last-child) > .btn { border-top-right-radius: 0; border-bottom-right-radius: 0; }   /* bootstrap */
.input-group-btn:last-child > .btn-group > .btn, .input-group-btn:first-child > .btn-group:not(:first-child) > .btn { border-top-left-radius: 0; border-bottom-left-radius: 0; }   /* bootstrap */
.input-group-btn:first-child > .btn-group { margin-right: -1px; }   /* bootstrap */
.input-group-btn:last-child > .btn-group { z-index: 2; margin-left: -1px; }   /* bootstrap */
.modal-footer .btn-group .btn + .btn { margin-left: -1px; }   /* bootstrap */
```

#### `.btn-group-sm`

- Key: `fc-buttons`
- Source: hbs; 1 file(s): `c/app-ui/gantt-chart.hbs`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.btn-group-sm > .btn { padding: 5px 10px; font-size: 12px; line-height: 1.5; border-radius: 3px; }   /* bootstrap */
```

#### `.btn-group-xs`

- Key: `fc-buttons`
- Source: hbs; 1 file(s): `c/ez-search/group.hbs`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.btn-group-xs > .btn { padding: 1px 5px; font-size: 12px; line-height: 1.5; border-radius: 3px; }   /* bootstrap */
.btn-group-xs > .btn .badge { top: 0; padding: 1px 5px; }   /* bootstrap */
```

#### `.btn-link`

- Key: `fc-buttons`
- Source: hbs; 15 file(s): `c/agent/workflows.hbs`, `c/app-ui/gantt-chart.hbs`, `c/app-ui/inline-editable.hbs`, `c/conversation/thread-comments.hbs`, `c/conversation/voter-list.hbs`, `c/developer/demos/empty-state.hbs`, `c/idea/message-item.hbs`, `c/issue/issue-plan-task-node.hbs`, `c/quick-list/index.hbs`, `c/tags/rename-panel.hbs`, `c/workflow/runs-box.hbs`, `t/app/agent/page.hbs`, `t/app/project/conversation.hbs`, `t/app/project/idea.hbs`, `t/app/project/index.hbs`
- Vendor: adminlte, bootstrap; states: .active, .open, active, focus, hover; breakpoints: none

```css
.btn-link { font-weight: 400; color: #337ab7; border-radius: 0; }   /* bootstrap */
.btn-link, .btn-link:active, .btn-link.active, .btn-link[disabled], fieldset[disabled] .btn-link { background-color: transparent; -webkit-box-shadow: none; box-shadow: none; }   /* bootstrap */
.btn-link, .btn-link:hover, .btn-link:focus, .btn-link:active { border-color: transparent; }   /* bootstrap */
.btn-link:hover, .btn-link:focus { color: #23527c; text-decoration: underline; background-color: transparent; }   /* bootstrap */
.btn-link[disabled]:hover, .btn-link[disabled]:focus, fieldset[disabled] .btn-link:hover, fieldset[disabled] .btn-link:focus { color: #777777; text-decoration: none; }   /* bootstrap */
.btn-group.open .dropdown-toggle.btn-link { -webkit-box-shadow: none; box-shadow: none; }   /* bootstrap */
.btn-link { -webkit-box-shadow:none;box-shadow:none }   /* adminlte */
```

#### `.btn-primary`

- Key: `fc-buttons`
- Source: hbs/hbs-literal; 50 file(s): `c/agent/credentials.hbs`, `c/app-layouts/application-header.hbs`, `c/app-ui/dropdown.hbs`, `c/app-ui/gantt-chart.hbs`, `c/app-ui/gantt-chart/selection-bar.hbs`, `c/app-ui/modal.hbs`, `c/conversation-ui/message-box.hbs`, `c/developer/demos/modal.hbs`, `c/ez-search-compact/actions.hbs`, `c/ez-search/group.hbs`, `c/ez-search/index.hbs`, `c/idea/composer.hbs`, `c/infinite-scroll.hbs`, `c/issue/file-preview.hbs`, `c/tags/rename-panel.hbs`, `c/user-profile/identities.hbs`, `c/user-profile/qualification.hbs`, `c/user-profile/skills.hbs`, `c/workflow/header-box.hbs`, `c/workflow/step-form.hbs`, `c/workflow/test-run-box.hbs`, `c/workspace/details-form.hbs`, `t/app/agent/create.hbs`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`, `t/app/index.hbs`, `t/app/project/conversation.hbs`, `t/app/project/idea.hbs`, `t/app/project/idea/create.hbs`, `t/app/project/issue/create.hbs`, `t/app/project/wiki.hbs`, `t/app/project/wiki/create.hbs`, `t/app/project/wiki/edit.hbs`, `t/app/project/wiki/index.hbs`, `t/app/project/wiki/page.hbs`, `t/app/projects/create.hbs`, `t/app/role.hbs`, `t/app/role/page.hbs`, `t/app/settings/email.hbs`, `t/app/settings/issue-statuses.hbs`, `t/app/settings/issue-types.hbs`, `t/app/settings/services.hbs`, `t/app/user/create.hbs`, `t/app/user/management.hbs`, `t/app/workspace/index.hbs`, `t/app/workspace/settings/environment.hbs`, `t/app/workspace/settings/projects.hbs`, `t/app/workspaces/index.hbs`, `t/reset-password.hbs`, `t/signin.hbs`
- Vendor: adminlte, bootstrap; states: .active, .disabled, .open, active, focus, hover; breakpoints: none

```css
.btn-primary { color: #fff; background-color: #337ab7; border-color: #2e6da4; }   /* bootstrap */
.btn-primary:focus { color: #fff; background-color: #286090; border-color: #122b40; }   /* bootstrap */
.btn-primary:hover { color: #fff; background-color: #286090; border-color: #204d74; }   /* bootstrap */
.btn-primary:active, .btn-primary.active, .open > .btn-primary.dropdown-toggle { color: #fff; background-color: #286090; background-image: none; border-color: #204d74; }   /* bootstrap */
.btn-primary:active:hover, .btn-primary:active:focus, .btn-primary.active:hover, .btn-primary.active:focus, .open > .btn-primary.dropdown-toggle:hover, .open > .btn-primary.dropdown-toggle:focus { color: #fff; background-color: #204d74; border-color: #122b40; }   /* bootstrap */
.btn-primary.disabled:hover, .btn-primary.disabled:focus, .btn-primary[disabled]:hover, .btn-primary[disabled]:focus, fieldset[disabled] .btn-primary:hover, fieldset[disabled] .btn-primary:focus { background-color: #337ab7; border-color: #2e6da4; }   /* bootstrap */
.btn-primary .badge { color: #337ab7; background-color: #fff; }   /* bootstrap */
.btn-primary { background-color:#3c8dbc;border-color:#367fa9 }   /* adminlte */
.btn-primary:hover, .btn-primary:active { background-color:#367fa9 }   /* adminlte */
```

#### `.btn-sm`

- Key: `fc-buttons`
- Source: hbs; 35 file(s): `c/app-ui/gantt-chart.hbs`, `c/app-ui/table.hbs`, `c/conversation/activity-box.hbs`, `c/conversation/linked-issue-box.hbs`, `c/developer/demos/data-table.hbs`, `c/developer/demos/icon.hbs`, `c/developer/demos/list-page.hbs`, `c/ez-search-compact/actions.hbs`, `c/ez-search-compact/index.hbs`, `c/idea/composer.hbs`, `c/issue/issue-details.hbs`, `c/user-profile/identities.hbs`, `c/user-profile/qualification.hbs`, `c/user-profile/skills.hbs`, `c/widgets/weekly-activities.hbs`, `c/widgets/weekly-conversations.hbs`, `c/workflow/header-box.hbs`, `c/workflow/step-form.hbs`, `c/workflow/test-run-box.hbs`, `t/app/agent/index.hbs`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`, `t/app/project/conversation.hbs`, `t/app/project/idea.hbs`, `t/app/project/issue/index.hbs`, `t/app/projects/index.hbs`, `t/app/role.hbs`, `t/app/settings/issue-statuses.hbs`, `t/app/settings/issue-types.hbs`, `t/app/user/management.hbs`, `t/app/workflow/index.hbs`, `t/app/workspace/index.hbs`, `t/app/workspace/settings/projects.hbs`, `t/app/workspaces/index.hbs`, `t/auth-status.hbs`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.btn-sm { padding: 5px 10px; font-size: 12px; line-height: 1.5; border-radius: 3px; }   /* bootstrap */
```

#### `.btn-success`

- Key: `fc-buttons`
- Source: hbs; 3 file(s): `c/idea/plan-box.hbs`, `c/issue/issue-details.hbs`, `t/app/settings/services.hbs`
- Vendor: adminlte, bootstrap; states: .active, .disabled, .open, active, focus, hover; breakpoints: none

```css
.btn-success { color: #fff; background-color: #5cb85c; border-color: #4cae4c; }   /* bootstrap */
.btn-success:focus { color: #fff; background-color: #449d44; border-color: #255625; }   /* bootstrap */
.btn-success:hover { color: #fff; background-color: #449d44; border-color: #398439; }   /* bootstrap */
.btn-success:active, .btn-success.active, .open > .btn-success.dropdown-toggle { color: #fff; background-color: #449d44; background-image: none; border-color: #398439; }   /* bootstrap */
.btn-success:active:hover, .btn-success:active:focus, .btn-success.active:hover, .btn-success.active:focus, .open > .btn-success.dropdown-toggle:hover, .open > .btn-success.dropdown-toggle:focus { color: #fff; background-color: #398439; border-color: #255625; }   /* bootstrap */
.btn-success.disabled:hover, .btn-success.disabled:focus, .btn-success[disabled]:hover, .btn-success[disabled]:focus, fieldset[disabled] .btn-success:hover, fieldset[disabled] .btn-success:focus { background-color: #5cb85c; border-color: #4cae4c; }   /* bootstrap */
.btn-success .badge { color: #5cb85c; background-color: #fff; }   /* bootstrap */
.btn-success { background-color:#00a65a;border-color:#008d4c }   /* adminlte */
.btn-success:hover, .btn-success:active { background-color:#008d4c }   /* adminlte */
```

#### `.btn-xs`

- Key: `fc-buttons`
- Source: hbs; 17 file(s): `c/app-ui/inline-editable.hbs`, `c/app-ui/list-toolbar.hbs`, `c/app-ui/pager.hbs`, `c/developer/demos/quick-list.hbs`, `c/ez-search/applied-filters.hbs`, `c/ez-search/group.hbs`, `c/idea/message-item.hbs`, `c/issue/issue-details.hbs`, `c/issue/issue-plan-task-node.hbs`, `c/quick-list/select-all.hbs`, `c/quick-list/selection-bar.hbs`, `c/workflow/case-list.hbs`, `c/workflow/condition-list.hbs`, `c/workflow/runs-box.hbs`, `t/app/project/wiki/page.hbs`, `t/app/settings/services.hbs`, `t/app/workspace/settings/projects.hbs`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.btn-xs { padding: 1px 5px; font-size: 12px; line-height: 1.5; border-radius: 3px; }   /* bootstrap */
.btn-xs .badge { top: 0; padding: 1px 5px; }   /* bootstrap */
```

#### `.disabled`

- Key: `fc-buttons` (state; `.btn.disabled`, `.dropdown-menu > .disabled`, `.pagination > .disabled`, forms: each owning key re-creates its own rules)
- Source: hbs/js-selector; 11 file(s): `c/app-layouts/application-header.hbs`, `c/pagination.hbs`, `c/workflow/node-palette.hbs`, `app/modifiers/dropdown-toggle.js`, `t/app/module.hbs`, `t/app/project/issue/index.hbs`, `t/app/project/wiki/page.hbs`, `t/app/projects/index.hbs`, `t/app/user/management.hbs`, `t/app/workspace/settings/delete.hbs`, `t/signin.hbs`
- Vendor: adminlte, bootstrap; states: .disabled, focus, hover; breakpoints: none

```css
input[type=radio].disabled, input[type=checkbox].disabled { cursor: not-allowed; }   /* bootstrap */
.checkbox.disabled label { cursor: not-allowed; }   /* bootstrap */
.checkbox-inline.disabled { cursor: not-allowed; }   /* bootstrap */
.btn.disabled { cursor: not-allowed; filter: alpha(opacity=65); opacity: 0.65; -webkit-box-shadow: none; box-shadow: none; }   /* bootstrap */
a.btn.disabled { pointer-events: none; }   /* bootstrap */
.btn-default.disabled:hover, .btn-default.disabled:focus { background-color: #fff; border-color: #ccc; }   /* bootstrap */
.btn-primary.disabled:hover, .btn-primary.disabled:focus { background-color: #337ab7; border-color: #2e6da4; }   /* bootstrap */
.btn-success.disabled:hover, .btn-success.disabled:focus { background-color: #5cb85c; border-color: #4cae4c; }   /* bootstrap */
.btn-danger.disabled:hover, .btn-danger.disabled:focus { background-color: #d9534f; border-color: #d43f3a; }   /* bootstrap */
.dropdown-menu > .disabled > a, .dropdown-menu > .disabled > a:hover, .dropdown-menu > .disabled > a:focus { color: #777777; }   /* bootstrap */
.dropdown-menu > .disabled > a:hover, .dropdown-menu > .disabled > a:focus { text-decoration: none; cursor: not-allowed; background-color: transparent; background-image: none; filter: progid:DXImageTransform.Microsoft.gradient(enabled = false); }   /* bootstrap */
.nav > li.disabled > a { color: #777777; }   /* bootstrap */
.nav > li.disabled > a:hover, .nav > li.disabled > a:focus { color: #777777; text-decoration: none; cursor: not-allowed; background-color: transparent; }   /* bootstrap */
.pagination > .disabled > span, .pagination > .disabled > span:hover, .pagination > .disabled > span:focus, .pagination > .disabled > a, .pagination > .disabled > a:hover, .pagination > .disabled > a:focus { color: #777777; cursor: not-allowed; background-color: #fff; border-color: #ddd; }   /* bootstrap */
[class^="bg-"].disabled { opacity:.65;filter:alpha(opacity=65) }   /* adminlte */
```


### `fc-forms`

#### `.checkbox`

- Key: `fc-forms`
- Source: hbs; 2 file(s): `c/form-fields/field-checkbox.hbs`, `t/signin.hbs`
- Vendor: abc, bootstrap; states: .disabled, after, before, checked, disabled, focus; breakpoints: @media (min-width: 768px)

```css
.checkbox { position: relative; display: block; margin-top: 10px; margin-bottom: 10px; }   /* bootstrap */
.checkbox.disabled label, fieldset[disabled] .checkbox label { cursor: not-allowed; }   /* bootstrap */
.checkbox label { min-height: 20px; padding-left: 20px; margin-bottom: 0; font-weight: 400; cursor: pointer; }   /* bootstrap */
.checkbox input[type=checkbox] { position: absolute; margin-top: 4px \9 ; margin-left: -20px; }   /* bootstrap */
.checkbox + .checkbox { margin-top: -5px; }   /* bootstrap */
@media (min-width: 768px) { .form-inline .checkbox { display: inline-block; margin-top: 0; margin-bottom: 0; vertical-align: middle; } }   /* bootstrap */
@media (min-width: 768px) { .form-inline .checkbox label { padding-left: 0; } }   /* bootstrap */
@media (min-width: 768px) { .form-inline .checkbox input[type=checkbox] { position: relative; margin-left: 0; } }   /* bootstrap */
.checkbox { padding-left: 20px; }   /* abc */
.checkbox label { display: inline-block; vertical-align: middle; position: relative; padding-left: 5px; }   /* abc */
.checkbox label::before { content: ""; display: inline-block; position: absolute; width: 17px; height: 17px; left: 0; margin-left: -20px; border: 1px solid #ccc; border-radius: 3px; background-color: #fff; -webkit-transition: border 0.15s ease-in-out, color 0.15s ease-in-out; -o-transition: border 0.15s ease-in-out, color 0.15s ease-in-out; transition: border 0.15s ease-in-out, color 0.15s ease-in-out; }   /* abc */
.checkbox label::after { display: inline-block; position: absolute; width: 16px; height: 16px; left: 0; top: 0; margin-left: -20px; padding-left: 3px; padding-top: 1px; font-size: 11px; color: #555555; }   /* abc */
.checkbox input[type=checkbox], .checkbox input[type=radio] { opacity: 0; z-index: 1; }   /* abc */
.checkbox input[type=checkbox]:focus + label::before, .checkbox input[type=radio]:focus + label::before { outline: 5px auto -webkit-focus-ring-color; outline-offset: -2px; }   /* abc */
.checkbox input[type=checkbox]:checked + label::after, .checkbox input[type=radio]:checked + label::after { font-family: "FontAwesome"; content: "\f00c"; }   /* abc */
.checkbox input[type=checkbox]:indeterminate + label::after, .checkbox input[type=radio]:indeterminate + label::after { display: block; content: ""; width: 10px; height: 3px; background-color: #555555; border-radius: 2px; margin-left: -16.5px; margin-top: 7px; }   /* abc */
.checkbox input[type=checkbox]:disabled + label, .checkbox input[type=radio]:disabled + label { opacity: 0.65; }   /* abc */
.checkbox input[type=checkbox]:disabled + label::before, .checkbox input[type=radio]:disabled + label::before { background-color: #eeeeee; cursor: not-allowed; }   /* abc */
.checkbox.checkbox-inline { margin-top: 0; }   /* abc */
```

#### `.checkbox-inline`

- Key: `fc-forms`
- Source: hbs; 1 file(s): `t/app/agent/create.hbs`
- Vendor: abc, bootstrap; states: .disabled; breakpoints: none

```css
.checkbox-inline input[type=checkbox] { position: absolute; margin-top: 4px \9 ; margin-left: -20px; }   /* bootstrap */
.checkbox-inline { position: relative; display: inline-block; padding-left: 20px; margin-bottom: 0; font-weight: 400; vertical-align: middle; cursor: pointer; }   /* bootstrap */
.checkbox-inline.disabled, fieldset[disabled] .checkbox-inline { cursor: not-allowed; }   /* bootstrap */
.checkbox-inline + .checkbox-inline { margin-top: 0; margin-left: 10px; }   /* bootstrap */
.checkbox.checkbox-inline { margin-top: 0; }   /* abc */
```

#### `.form-control`

- Key: `fc-forms`
- Source: hbs; 16 file(s): `c/agent/credentials.hbs`, `c/app-ui/table.hbs`, `c/app-ui/task-board/move-issue.hbs`, `c/developer/demos/avatar.hbs`, `c/developer/demos/form-fields.hbs`, `c/developer/demos/list-page.hbs`, `c/developer/demos/quick-list.hbs`, `c/form-fields/field-date.hbs`, `c/form-fields/field-day-month.hbs`, `c/form-fields/field-search.hbs`, `c/form-fields/field-text-area.hbs`, `c/form-fields/field-text.hbs`, `t/app/role/page.hbs`, `t/app/settings/email.hbs`, `t/app/settings/services.hbs`, `t/signin.hbs`
- Vendor: adminlte, bootstrap; states: -moz-placeholder, -ms-expand, -ms-input-placeholder, -webkit-input-placeholder, active, first-child, focus, last-child, not; breakpoints: @media (min-width: 768px); @media screen and (-webkit-min-device-pixel-ratio: 0)

```css
.form-control { display: block; width: 100%; height: 34px; padding: 6px 12px; font-size: 14px; line-height: 1.428571429; color: #555555; background-color: #fff; background-image: none; border: 1px solid #ccc; border-radius: 4px; -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); -webkit-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; -o-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; }   /* bootstrap */
.form-control:focus { border-color: #66afe9; outline: 0; -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6); box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6); }   /* bootstrap */
.form-control::-moz-placeholder { color: #999; opacity: 1; }   /* bootstrap */
.form-control:-ms-input-placeholder { color: #999; }   /* bootstrap */
.form-control::-webkit-input-placeholder { color: #999; }   /* bootstrap */
.form-control::-ms-expand { background-color: transparent; border: 0; }   /* bootstrap */
.form-control[disabled], .form-control[readonly], fieldset[disabled] .form-control { background-color: #eeeeee; opacity: 1; }   /* bootstrap */
.form-control[disabled], fieldset[disabled] .form-control { cursor: not-allowed; }   /* bootstrap */
textarea.form-control { height: auto; }   /* bootstrap */
@media screen and (-webkit-min-device-pixel-ratio: 0) { input[type=date].form-control, input[type=time].form-control, input[type=datetime-local].form-control, input[type=month].form-control { line-height: 34px; } }   /* bootstrap */
.has-feedback .form-control { padding-right: 42.5px; }   /* bootstrap */
@media (min-width: 768px) { .form-inline .form-control { display: inline-block; width: auto; vertical-align: middle; } }   /* bootstrap */
@media (min-width: 768px) { .form-inline .input-group .form-control { width: auto; } }   /* bootstrap */
@media (min-width: 768px) { .form-inline .input-group > .form-control { width: 100%; } }   /* bootstrap */
.input-group .form-control { position: relative; z-index: 2; float: left; width: 100%; margin-bottom: 0; }   /* bootstrap */
.input-group .form-control:focus { z-index: 3; }   /* bootstrap */
.input-group .form-control { display: table-cell; }   /* bootstrap */
.input-group .form-control:not(:first-child):not(:last-child) { border-radius: 0; }   /* bootstrap */
.input-group .form-control:first-child { border-top-right-radius: 0; border-bottom-right-radius: 0; }   /* bootstrap */
.input-group .form-control:last-child { border-top-left-radius: 0; border-bottom-left-radius: 0; }   /* bootstrap */
.main-header #navbar-search-input.form-control { background:rgba(255,255,255,0.2);border-color:transparent }   /* adminlte */
.main-header #navbar-search-input.form-control:focus, .main-header #navbar-search-input.form-control:active { border-color:rgba(0,0,0,0.1);background:rgba(255,255,255,0.9) }   /* adminlte */
.main-header #navbar-search-input.form-control::-moz-placeholder { color:#ccc;opacity:1 }   /* adminlte */
.main-header #navbar-search-input.form-control:-ms-input-placeholder { color:#ccc }   /* adminlte */
.main-header #navbar-search-input.form-control::-webkit-input-placeholder { color:#ccc }   /* adminlte */
.form-control { border-radius:0;box-shadow:none;border-color:#d2d6de }   /* adminlte */
.form-control:focus { border-color:#3c8dbc;box-shadow:none }   /* adminlte */
.form-control::-moz-placeholder, .form-control:-ms-input-placeholder, .form-control::-webkit-input-placeholder { color:#bbb;opacity:1 }   /* adminlte */
.form-control:not(select) { -webkit-appearance:none;-moz-appearance:none;appearance:none }   /* adminlte */
```

#### `.form-control-feedback`

- Key: `fc-forms`
- Source: hbs; 3 file(s): `c/form-fields/field-text-area.hbs`, `c/form-fields/field-text.hbs`, `t/signin.hbs`
- Vendor: adminlte, bootstrap; states: none; breakpoints: @media (min-width: 768px)

```css
.form-control-feedback { position: absolute; top: 0; right: 0; z-index: 2; display: block; width: 34px; height: 34px; line-height: 34px; text-align: center; pointer-events: none; }   /* bootstrap */
.input-sm + .form-control-feedback { width: 30px; height: 30px; line-height: 30px; }   /* bootstrap */
.has-feedback label ~ .form-control-feedback { top: 25px; }   /* bootstrap */
.has-feedback label.sr-only ~ .form-control-feedback { top: 0; }   /* bootstrap */
@media (min-width: 768px) { .form-inline .has-feedback .form-control-feedback { top: 0; } }   /* bootstrap */
.form-control-feedback.fa { line-height:34px }   /* adminlte */
.input-sm+.form-control-feedback.fa { line-height:30px }   /* adminlte */
.login-box-body .form-control-feedback { color:#777 }   /* adminlte */
```

#### `.form-group`

- Key: `fc-forms`
- Source: hbs; 27 file(s): `c/app-ui/task-board.hbs`, `c/app-ui/task-board/milestones.hbs`, `c/conversation/edit-thread-modal.hbs`, `c/developer/demos/avatar.hbs`, `c/developer/demos/box.hbs`, `c/developer/demos/data-table.hbs`, `c/developer/demos/dropdown.hbs`, `c/developer/demos/ez-search.hbs`, `c/developer/demos/form-fields.hbs`, `c/developer/demos/icon.hbs`, `c/developer/demos/list-page.hbs`, `c/developer/demos/modal.hbs`, `c/developer/demos/pager.hbs`, `c/developer/demos/quick-list.hbs`, `c/developer/demos/select.hbs`, `c/workspace/details-form.hbs`, `t/app/project/idea/create.hbs`, `t/app/project/index.hbs`, `t/app/project/issue/create.hbs`, `t/app/project/issue/index.hbs`, `t/app/project/wiki/create.hbs`, `t/app/project/wiki/edit.hbs`, `t/app/projects/create.hbs`, `t/app/projects/index.hbs`, `t/app/role/page.hbs`, `t/app/settings/email.hbs`, `t/signin.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 768px)

```css
.form-group { margin-bottom: 15px; }   /* bootstrap */
@media (min-width: 768px) { .form-inline .form-group { display: inline-block; margin-bottom: 0; vertical-align: middle; } }   /* bootstrap */
```

#### `.form-inline`

- Key: `fc-forms`
- Source: hbs; 1 file(s): `c/developer/demos/avatar.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 768px)

```css
@media (min-width: 768px) { .form-inline .form-group { display: inline-block; margin-bottom: 0; vertical-align: middle; } }   /* bootstrap */
@media (min-width: 768px) { .form-inline .form-control { display: inline-block; width: auto; vertical-align: middle; } }   /* bootstrap */
@media (min-width: 768px) { .form-inline .input-group { display: inline-table; vertical-align: middle; } }   /* bootstrap */
@media (min-width: 768px) { .form-inline .input-group .input-group-addon, .form-inline .input-group .input-group-btn, .form-inline .input-group .form-control { width: auto; } }   /* bootstrap */
@media (min-width: 768px) { .form-inline .input-group > .form-control { width: 100%; } }   /* bootstrap */
@media (min-width: 768px) { .form-inline .checkbox { display: inline-block; margin-top: 0; margin-bottom: 0; vertical-align: middle; } }   /* bootstrap */
@media (min-width: 768px) { .form-inline .checkbox label { padding-left: 0; } }   /* bootstrap */
@media (min-width: 768px) { .form-inline .checkbox input[type=checkbox] { position: relative; margin-left: 0; } }   /* bootstrap */
@media (min-width: 768px) { .form-inline .has-feedback .form-control-feedback { top: 0; } }   /* bootstrap */
```

#### `.has-feedback`

- Key: `fc-forms`
- Source: hbs; 2 file(s): `t/app/user/management.hbs`, `t/signin.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 768px)

```css
.has-feedback { position: relative; }   /* bootstrap */
.has-feedback .form-control { padding-right: 42.5px; }   /* bootstrap */
.has-feedback label ~ .form-control-feedback { top: 25px; }   /* bootstrap */
.has-feedback label.sr-only ~ .form-control-feedback { top: 0; }   /* bootstrap */
@media (min-width: 768px) { .form-inline .has-feedback .form-control-feedback { top: 0; } }   /* bootstrap */
```

#### `.help-block`

- Key: `fc-forms`
- Source: hbs; 2 file(s): `t/app/settings/email.hbs`, `t/app/user/create.hbs`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.help-block { display: block; margin-top: 5px; margin-bottom: 10px; color: #737373; }   /* bootstrap */
```

#### `.input-group`

- Key: `fc-forms`
- Source: hbs; 8 file(s): `c/agent/credentials.hbs`, `c/app-ui/table.hbs`, `c/form-fields/field-multi-select.hbs`, `c/form-fields/field-relate-multi.hbs`, `c/form-fields/field-relate.hbs`, `c/form-fields/field-search.hbs`, `t/app/role/page.hbs`, `t/app/settings/services.hbs`
- Vendor: adminlte, bootstrap; states: first-child, focus, last-child, not; breakpoints: @media (min-width: 768px)

```css
@media (min-width: 768px) { .form-inline .input-group { display: inline-table; vertical-align: middle; } }   /* bootstrap */
@media (min-width: 768px) { .form-inline .input-group .input-group-addon, .form-inline .input-group .input-group-btn, .form-inline .input-group .form-control { width: auto; } }   /* bootstrap */
@media (min-width: 768px) { .form-inline .input-group > .form-control { width: 100%; } }   /* bootstrap */
.input-group { position: relative; display: table; border-collapse: separate; }   /* bootstrap */
.input-group[class*=col-] { float: none; padding-right: 0; padding-left: 0; }   /* bootstrap */
.input-group .form-control { position: relative; z-index: 2; float: left; width: 100%; margin-bottom: 0; }   /* bootstrap */
.input-group .form-control:focus { z-index: 3; }   /* bootstrap */
.input-group .form-control { display: table-cell; }   /* bootstrap */
.input-group .form-control:not(:first-child):not(:last-child) { border-radius: 0; }   /* bootstrap */
.input-group .form-control:first-child { border-top-right-radius: 0; border-bottom-right-radius: 0; }   /* bootstrap */
.input-group .form-control:last-child { border-top-left-radius: 0; border-bottom-left-radius: 0; }   /* bootstrap */
.input-group .input-group-addon { border-radius:0;border-color:#d2d6de;background-color:#fff }   /* adminlte */
```

#### `.input-group-addon`

- Key: `fc-forms`
- Source: hbs; 3 file(s): `c/app-ui/table.hbs`, `c/form-fields/field-search.hbs`, `t/app/role/page.hbs`
- Vendor: adminlte, bootstrap; states: first-child, last-child, not; breakpoints: @media (min-width: 768px)

```css
@media (min-width: 768px) { .form-inline .input-group .input-group-addon { width: auto; } }   /* bootstrap */
.input-group-addon { display: table-cell; }   /* bootstrap */
.input-group-addon:not(:first-child):not(:last-child) { border-radius: 0; }   /* bootstrap */
.input-group-addon { width: 1%; white-space: nowrap; vertical-align: middle; }   /* bootstrap */
.input-group-addon { padding: 6px 12px; font-size: 14px; font-weight: 400; line-height: 1; color: #555555; text-align: center; background-color: #eeeeee; border: 1px solid #ccc; border-radius: 4px; }   /* bootstrap */
.input-group-addon.input-sm { padding: 5px 10px; font-size: 12px; border-radius: 3px; }   /* bootstrap */
.input-group-addon input[type=radio], .input-group-addon input[type=checkbox] { margin-top: 0; }   /* bootstrap */
.input-group-addon:first-child { border-top-right-radius: 0; border-bottom-right-radius: 0; }   /* bootstrap */
.input-group-addon:first-child { border-right: 0; }   /* bootstrap */
.input-group-addon:last-child { border-top-left-radius: 0; border-bottom-left-radius: 0; }   /* bootstrap */
.input-group-addon:last-child { border-left: 0; }   /* bootstrap */
.input-group .input-group-addon { border-radius:0;border-color:#d2d6de;background-color:#fff }   /* adminlte */
```

#### `.input-group-btn`

- Key: `fc-forms`
- Source: hbs; 2 file(s): `c/agent/credentials.hbs`, `t/app/settings/services.hbs`
- Vendor: bootstrap; states: active, first-child, focus, hover, last-child, not; breakpoints: @media (min-width: 768px)

```css
@media (min-width: 768px) { .form-inline .input-group .input-group-btn { width: auto; } }   /* bootstrap */
.input-group-btn { display: table-cell; }   /* bootstrap */
.input-group-btn:not(:first-child):not(:last-child) { border-radius: 0; }   /* bootstrap */
.input-group-btn { width: 1%; white-space: nowrap; vertical-align: middle; }   /* bootstrap */
.input-group-btn:first-child > .btn, .input-group-btn:first-child > .btn-group > .btn, .input-group-btn:first-child > .dropdown-toggle, .input-group-btn:last-child > .btn:not(:last-child):not(.dropdown-toggle), .input-group-btn:last-child > .btn-group:not(:last-child) > .btn { border-top-right-radius: 0; border-bottom-right-radius: 0; }   /* bootstrap */
.input-group-btn:last-child > .btn, .input-group-btn:last-child > .btn-group > .btn, .input-group-btn:last-child > .dropdown-toggle, .input-group-btn:first-child > .btn:not(:first-child), .input-group-btn:first-child > .btn-group:not(:first-child) > .btn { border-top-left-radius: 0; border-bottom-left-radius: 0; }   /* bootstrap */
.input-group-btn { position: relative; font-size: 0; white-space: nowrap; }   /* bootstrap */
.input-group-btn > .btn { position: relative; }   /* bootstrap */
.input-group-btn > .btn + .btn { margin-left: -1px; }   /* bootstrap */
.input-group-btn > .btn:hover, .input-group-btn > .btn:focus, .input-group-btn > .btn:active { z-index: 2; }   /* bootstrap */
.input-group-btn:first-child > .btn, .input-group-btn:first-child > .btn-group { margin-right: -1px; }   /* bootstrap */
.input-group-btn:last-child > .btn, .input-group-btn:last-child > .btn-group { z-index: 2; margin-left: -1px; }   /* bootstrap */
```

#### `.input-sm`

- Key: `fc-forms`
- Source: hbs; 6 file(s): `c/developer/demos/avatar.hbs`, `c/developer/demos/form-fields.hbs`, `c/developer/demos/quick-list.hbs`, `c/form-fields/field-date.hbs`, `c/form-fields/field-day-month.hbs`, `c/form-fields/field-text.hbs`
- Vendor: adminlte, bootstrap; states: none; breakpoints: @media screen and (-webkit-min-device-pixel-ratio: 0)

```css
@media screen and (-webkit-min-device-pixel-ratio: 0) { input[type=date].input-sm, input[type=time].input-sm, input[type=datetime-local].input-sm, input[type=month].input-sm { line-height: 30px; } }   /* bootstrap */
.input-sm { height: 30px; padding: 5px 10px; font-size: 12px; line-height: 1.5; border-radius: 3px; }   /* bootstrap */
select.input-sm { height: 30px; line-height: 30px; }   /* bootstrap */
textarea.input-sm, select[multiple].input-sm { height: auto; }   /* bootstrap */
.input-sm + .form-control-feedback { width: 30px; height: 30px; line-height: 30px; }   /* bootstrap */
.input-group-addon.input-sm { padding: 5px 10px; font-size: 12px; border-radius: 3px; }   /* bootstrap */
.input-sm+.form-control-feedback.fa { line-height:30px }   /* adminlte */
```


### `fc-tables`

#### `.table`

- Key: `fc-tables`
- Source: hbs/js; 21 file(s): `c/agent/workflows.hbs`, `c/app-ui/data-table.hbs`, `c/app-ui/table.js`, `c/app-ui/table/table-content.hbs`, `c/developer/demos/avatar.hbs`, `c/developer/demos/status-label.hbs`, `c/developer/event-log.hbs`, `c/workflow/runs-box.hbs`, `c/workspace/add-project-dialog.hbs`, `c/workspace/remove-member-dialog.hbs`, `t/app/agent/page.hbs`, `t/app/agent/tools.hbs`, `t/app/module.hbs`, `t/app/project/issue/index.hbs`, `t/app/projects/index.hbs`, `t/app/settings/issue-statuses.hbs`, `t/app/settings/issue-types.hbs`, `t/app/settings/services.hbs`, `t/app/user/management.hbs`, `t/app/workspace/index.hbs`, `t/auth-status.hbs`
- Vendor: adminlte, bootstrap; states: .active, first-child; breakpoints: @media print; @media screen and (max-width: 767px)

```css
@media print { .table { border-collapse: collapse !important; } }   /* bootstrap */
@media print { .table td, .table th { background-color: #fff !important; } }   /* bootstrap */
.table { width: 100%; max-width: 100%; margin-bottom: 20px; }   /* bootstrap */
.table > thead > tr > th, .table > thead > tr > td, .table > tbody > tr > th, .table > tbody > tr > td, .table > tfoot > tr > th, .table > tfoot > tr > td { padding: 8px; line-height: 1.428571429; vertical-align: top; border-top: 1px solid #ddd; }   /* bootstrap */
.table > thead > tr > th { vertical-align: bottom; border-bottom: 2px solid #ddd; }   /* bootstrap */
.table > caption + thead > tr:first-child > th, .table > caption + thead > tr:first-child > td, .table > colgroup + thead > tr:first-child > th, .table > colgroup + thead > tr:first-child > td, .table > thead:first-child > tr:first-child > th, .table > thead:first-child > tr:first-child > td { border-top: 0; }   /* bootstrap */
.table > tbody + tbody { border-top: 2px solid #ddd; }   /* bootstrap */
.table .table { background-color: #fff; }   /* bootstrap */
.table > thead > tr > td.active, .table > thead > tr > th.active, .table > thead > tr.active > td, .table > thead > tr.active > th, .table > tbody > tr > td.active, .table > tbody > tr > th.active, .table > tbody > tr.active > td, .table > tbody > tr.active > th, .table > tfoot > tr > td.active, .table > tfoot > tr > th.active, .table > tfoot > tr.active > td, .table > tfoot > tr.active > th { background-color: #f5f5f5; }   /* bootstrap */
.table > thead > tr > td.success, .table > thead > tr > th.success, .table > thead > tr.success > td, .table > thead > tr.success > th, .table > tbody > tr > td.success, .table > tbody > tr > th.success, .table > tbody > tr.success > td, .table > tbody > tr.success > th, .table > tfoot > tr > td.success, .table > tfoot > tr > th.success, .table > tfoot > tr.success > td, .table > tfoot > tr.success > th { background-color: #dff0d8; }   /* bootstrap */
@media screen and (max-width: 767px) { .table-responsive > .table { margin-bottom: 0; } }   /* bootstrap */
@media screen and (max-width: 767px) { .table-responsive > .table > thead > tr > th, .table-responsive > .table > thead > tr > td, .table-responsive > .table > tbody > tr > th, .table-responsive > .table > tbody > tr > td, .table-responsive > .table > tfoot > tr > th, .table-responsive > .table > tfoot > tr > td { white-space: nowrap; } }   /* bootstrap */
.table tr>td .progress { margin:0 }   /* adminlte */
.box-body>.table { margin-bottom:0 }   /* adminlte */
.table>thead>tr>th, .table>tbody>tr>th, .table>tfoot>tr>th, .table>thead>tr>td, .table>tbody>tr>td, .table>tfoot>tr>td { border-top:1px solid #f4f4f4 }   /* adminlte */
.table>thead>tr>th { border-bottom:2px solid #f4f4f4 }   /* adminlte */
.table tr td .progress { margin-top:5px }   /* adminlte */
.text-bold.table td, .text-bold.table th { font-weight:700 }   /* adminlte */
@media print { .table-responsive>.table tr th, .table-responsive>.table tr td { white-space:normal !important } }   /* adminlte */
```

#### `.table-bordered`

- Key: `fc-tables`
- Source: hbs; 3 file(s): `c/workspace/add-project-dialog.hbs`, `c/workspace/remove-member-dialog.hbs`, `t/app/module.hbs`
- Vendor: adminlte, bootstrap; states: first-child, last-child; breakpoints: @media print; @media screen and (max-width: 767px)

```css
@media print { .table-bordered th, .table-bordered td { border: 1px solid #ddd !important; } }   /* bootstrap */
.table-bordered { border: 1px solid #ddd; }   /* bootstrap */
.table-bordered > thead > tr > th, .table-bordered > thead > tr > td, .table-bordered > tbody > tr > th, .table-bordered > tbody > tr > td, .table-bordered > tfoot > tr > th, .table-bordered > tfoot > tr > td { border: 1px solid #ddd; }   /* bootstrap */
.table-bordered > thead > tr > th, .table-bordered > thead > tr > td { border-bottom-width: 2px; }   /* bootstrap */
@media screen and (max-width: 767px) { .table-responsive > .table-bordered { border: 0; } }   /* bootstrap */
@media screen and (max-width: 767px) { .table-responsive > .table-bordered > thead > tr > th:first-child, .table-responsive > .table-bordered > thead > tr > td:first-child, .table-responsive > .table-bordered > tbody > tr > th:first-child, .table-responsive > .table-bordered > tbody > tr > td:first-child, .table-responsive > .table-bordered > tfoot > tr > th:first-child, .table-responsive > .table-bordered > tfoot > tr > td:first-child { border-left: 0; } }   /* bootstrap */
@media screen and (max-width: 767px) { .table-responsive > .table-bordered > thead > tr > th:last-child, .table-responsive > .table-bordered > thead > tr > td:last-child, .table-responsive > .table-bordered > tbody > tr > th:last-child, .table-responsive > .table-bordered > tbody > tr > td:last-child, .table-responsive > .table-bordered > tfoot > tr > th:last-child, .table-responsive > .table-bordered > tfoot > tr > td:last-child { border-right: 0; } }   /* bootstrap */
@media screen and (max-width: 767px) { .table-responsive > .table-bordered > tbody > tr:last-child > th, .table-responsive > .table-bordered > tbody > tr:last-child > td, .table-responsive > .table-bordered > tfoot > tr:last-child > th, .table-responsive > .table-bordered > tfoot > tr:last-child > td { border-bottom: 0; } }   /* bootstrap */
.table-bordered { border:1px solid #f4f4f4 }   /* adminlte */
.table-bordered>thead>tr>th, .table-bordered>tbody>tr>th, .table-bordered>tfoot>tr>th, .table-bordered>thead>tr>td, .table-bordered>tbody>tr>td, .table-bordered>tfoot>tr>td { border:1px solid #f4f4f4 }   /* adminlte */
.table-bordered>thead>tr>th, .table-bordered>thead>tr>td { border-bottom-width:2px }   /* adminlte */
```

#### `.table-condensed`

- Key: `fc-tables`
- Source: hbs; 3 file(s): `c/developer/demos/avatar.hbs`, `c/developer/event-log.hbs`, `t/auth-status.hbs`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.table-condensed > thead > tr > th, .table-condensed > thead > tr > td, .table-condensed > tbody > tr > th, .table-condensed > tbody > tr > td, .table-condensed > tfoot > tr > th, .table-condensed > tfoot > tr > td { padding: 5px; }   /* bootstrap */
```

#### `.table-hover`

- Key: `fc-tables`
- Source: hbs; 11 file(s): `c/app-ui/data-table.hbs`, `c/app-ui/table/table-content.hbs`, `c/workflow/runs-box.hbs`, `t/app/agent/tools.hbs`, `t/app/module.hbs`, `t/app/project/issue/index.hbs`, `t/app/projects/index.hbs`, `t/app/settings/issue-statuses.hbs`, `t/app/settings/issue-types.hbs`, `t/app/settings/services.hbs`, `t/app/user/management.hbs`
- Vendor: bootstrap; states: .active, hover; breakpoints: none

```css
.table-hover > tbody > tr:hover { background-color: #f5f5f5; }   /* bootstrap */
.table-hover > tbody > tr > td.active:hover, .table-hover > tbody > tr > th.active:hover, .table-hover > tbody > tr.active:hover > td, .table-hover > tbody > tr:hover > .active, .table-hover > tbody > tr.active:hover > th { background-color: #e8e8e8; }   /* bootstrap */
.table-hover > tbody > tr > td.success:hover, .table-hover > tbody > tr > th.success:hover, .table-hover > tbody > tr.success:hover > td, .table-hover > tbody > tr:hover > .success, .table-hover > tbody > tr.success:hover > th { background-color: #d0e9c6; }   /* bootstrap */
```

#### `.table-responsive`

- Key: `fc-tables`
- Source: hbs; 7 file(s): `c/app-ui/data-table.hbs`, `c/app-ui/table.hbs`, `t/app/agent/tools.hbs`, `t/app/module.hbs`, `t/app/project/issue/index.hbs`, `t/app/projects/index.hbs`, `t/app/user/management.hbs`
- Vendor: adminlte, bootstrap; states: first-child, last-child; breakpoints: @media print; @media screen and (max-width: 767px)

```css
.table-responsive { min-height: 0.01%; overflow-x: auto; }   /* bootstrap */
@media screen and (max-width: 767px) { .table-responsive { width: 100%; margin-bottom: 15px; overflow-y: hidden; -ms-overflow-style: -ms-autohiding-scrollbar; border: 1px solid #ddd; } }   /* bootstrap */
@media screen and (max-width: 767px) { .table-responsive > .table { margin-bottom: 0; } }   /* bootstrap */
@media screen and (max-width: 767px) { .table-responsive > .table > thead > tr > th, .table-responsive > .table > thead > tr > td, .table-responsive > .table > tbody > tr > th, .table-responsive > .table > tbody > tr > td, .table-responsive > .table > tfoot > tr > th, .table-responsive > .table > tfoot > tr > td { white-space: nowrap; } }   /* bootstrap */
@media screen and (max-width: 767px) { .table-responsive > .table-bordered { border: 0; } }   /* bootstrap */
@media screen and (max-width: 767px) { .table-responsive > .table-bordered > thead > tr > th:first-child, .table-responsive > .table-bordered > thead > tr > td:first-child, .table-responsive > .table-bordered > tbody > tr > th:first-child, .table-responsive > .table-bordered > tbody > tr > td:first-child, .table-responsive > .table-bordered > tfoot > tr > th:first-child, .table-responsive > .table-bordered > tfoot > tr > td:first-child { border-left: 0; } }   /* bootstrap */
@media screen and (max-width: 767px) { .table-responsive > .table-bordered > thead > tr > th:last-child, .table-responsive > .table-bordered > thead > tr > td:last-child, .table-responsive > .table-bordered > tbody > tr > th:last-child, .table-responsive > .table-bordered > tbody > tr > td:last-child, .table-responsive > .table-bordered > tfoot > tr > th:last-child, .table-responsive > .table-bordered > tfoot > tr > td:last-child { border-right: 0; } }   /* bootstrap */
@media screen and (max-width: 767px) { .table-responsive > .table-bordered > tbody > tr:last-child > th, .table-responsive > .table-bordered > tbody > tr:last-child > td, .table-responsive > .table-bordered > tfoot > tr:last-child > th, .table-responsive > .table-bordered > tfoot > tr:last-child > td { border-bottom: 0; } }   /* bootstrap */
@media print { .table-responsive { overflow:auto } }   /* adminlte */
@media print { .table-responsive>.table tr th, .table-responsive>.table tr td { white-space:normal !important } }   /* adminlte */
```

#### `.table-striped`

- Key: `fc-tables`
- Source: hbs; 7 file(s): `c/agent/workflows.hbs`, `c/app-ui/table/table-content.hbs`, `t/app/module.hbs`, `t/app/project/issue/index.hbs`, `t/app/projects/index.hbs`, `t/app/user/management.hbs`, `t/auth-status.hbs`
- Vendor: bootstrap; states: nth-of-type; breakpoints: none

```css
.table-striped > tbody > tr:nth-of-type(odd) { background-color: #f9f9f9; }   /* bootstrap */
```


### `fc-labels`

#### `.alert`

- Key: `fc-labels`
- Source: hbs; 19 file(s): `c/agent/credentials.hbs`, `c/app-ui/task-board.hbs`, `c/conversation-ui/comment-item.hbs`, `c/idea/conversation-box.hbs`, `c/idea/created-issues-box.hbs`, `c/idea/plan-box.hbs`, `c/issue/file-preview.hbs`, `c/issue/issue-planning.hbs`, `c/tags/edit-modal.hbs`, `c/tags/rename-panel.hbs`, `c/workspace/add-project-dialog.hbs`, `c/workspace/invite-member-dialog.hbs`, `c/workspace/move-project-out-dialog.hbs`, `c/workspace/remove-member-dialog.hbs`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`, `t/app/settings/services.hbs`, `t/app/workspace/settings/delete.hbs`, `t/app/workspace/settings/environment.hbs`
- Vendor: adminlte, bootstrap; states: hover; breakpoints: none

```css
.alert { padding: 15px; margin-bottom: 20px; border: 1px solid transparent; border-radius: 4px; }   /* bootstrap */
.alert h4 { margin-top: 0; color: inherit; }   /* bootstrap */
.alert > p, .alert > ul { margin-bottom: 0; }   /* bootstrap */
.alert > p + p { margin-top: 5px; }   /* bootstrap */
.alert { border-radius:3px }   /* adminlte */
.alert h4 { font-weight:600 }   /* adminlte */
.alert .close { color:#000;opacity:.2;filter:alpha(opacity=20) }   /* adminlte */
.alert .close:hover { opacity:.5;filter:alpha(opacity=50) }   /* adminlte */
.alert a { color:#fff;text-decoration:underline }   /* adminlte */
```

#### `.alert-danger`

- Key: `fc-labels`
- Source: hbs; 14 file(s): `c/idea/created-issues-box.hbs`, `c/idea/plan-box.hbs`, `c/issue/file-preview.hbs`, `c/issue/issue-planning.hbs`, `c/tags/edit-modal.hbs`, `c/tags/rename-panel.hbs`, `c/workspace/add-project-dialog.hbs`, `c/workspace/invite-member-dialog.hbs`, `c/workspace/move-project-out-dialog.hbs`, `c/workspace/remove-member-dialog.hbs`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`, `t/app/workspace/settings/delete.hbs`, `t/app/workspace/settings/environment.hbs`
- Vendor: adminlte, bootstrap; states: none; breakpoints: none

```css
.alert-danger { color: #a94442; background-color: #f2dede; border-color: #ebccd1; }   /* bootstrap */
.alert-danger hr { border-top-color: #e4b9c0; }   /* bootstrap */
.alert-danger { border-color:#d73925 }   /* adminlte */
.alert-danger { color:#fff !important }   /* adminlte */
.alert-danger { background-color:#dd4b39 !important }   /* adminlte */
```

#### `.alert-warning`

- Key: `fc-labels`
- Source: hbs; 6 file(s): `c/agent/credentials.hbs`, `c/app-ui/task-board.hbs`, `c/conversation-ui/comment-item.hbs`, `c/idea/conversation-box.hbs`, `c/idea/plan-box.hbs`, `t/app/settings/services.hbs`
- Vendor: adminlte, bootstrap; states: none; breakpoints: none

```css
.alert-warning { color: #8a6d3b; background-color: #fcf8e3; border-color: #faebcc; }   /* bootstrap */
.alert-warning hr { border-top-color: #f7e1b5; }   /* bootstrap */
.alert-warning { border-color:#e08e0b }   /* adminlte */
.alert-warning { color:#fff !important }   /* adminlte */
.alert-warning { background-color:#f39c12 !important }   /* adminlte */
```

#### `.badge`

- Key: `fc-labels`
- Source: hbs/js-template; 13 file(s): `c/app-ui/data-table.hbs`, `c/app-ui/status-label.hbs`, `c/app-ui/table.hbs`, `c/app-ui/tag-parser.js`, `c/app-ui/task-board/milestones.hbs`, `c/idea/created-issues-box.hbs`, `c/issue/issue-details.hbs`, `c/quick-list/group.hbs`, `c/widgets/active-milestones.hbs`, `c/widgets/weekly-issue-timelogs.hbs`, `t/app/project/index.hbs`, `t/app/projects/index.hbs`, `t/app/workspace/settings/agents.hbs`
- Vendor: adminlte, bootstrap; states: .active, empty, focus, hover; breakpoints: none

```css
.btn-default .badge { color: #fff; background-color: #333; }   /* bootstrap */
.btn-primary .badge { color: #337ab7; background-color: #fff; }   /* bootstrap */
.btn-success .badge { color: #5cb85c; background-color: #fff; }   /* bootstrap */
.btn-danger .badge { color: #d9534f; background-color: #fff; }   /* bootstrap */
.badge { display: inline-block; min-width: 10px; padding: 3px 7px; font-size: 12px; font-weight: bold; line-height: 1; color: #fff; text-align: center; white-space: nowrap; vertical-align: middle; background-color: #777777; border-radius: 10px; }   /* bootstrap */
.badge:empty { display: none; }   /* bootstrap */
.btn .badge { position: relative; top: -1px; }   /* bootstrap */
.btn-xs .badge, .btn-group-xs > .btn .badge { top: 0; padding: 1px 5px; }   /* bootstrap */
.nav-pills > .active > a > .badge { color: #337ab7; background-color: #fff; }   /* bootstrap */
.nav-pills > li > a > .badge { margin-left: 3px; }   /* bootstrap */
a.badge:hover, a.badge:focus { color: #fff; text-decoration: none; cursor: pointer; }   /* bootstrap */
.sidebar-menu>li .badge { margin-right:5px }   /* adminlte */
.sidebar-menu>li .badge { margin-top:3px }   /* adminlte */
```

#### `.callout`

- Key: `fc-labels`
- Source: hbs; 9 file(s): `c/tags/rename-panel.hbs`, `c/workspace/move-project-out-dialog.hbs`, `t/app/developer/components.hbs`, `t/app/developer/index.hbs`, `t/app/project/wiki/edit.hbs`, `t/app/project/wiki/page.hbs`, `t/app/settings/email.hbs`, `t/app/settings/issue-types.hbs`, `t/app/workspace/settings/projects.hbs`
- Vendor: adminlte; states: hover, last-child; breakpoints: none

```css
.callout { border-radius:3px;margin:0 0 20px 0;padding:15px 30px 15px 15px;border-left:5px solid #eee }   /* adminlte */
.callout a { color:#fff;text-decoration:underline }   /* adminlte */
.callout a:hover { color:#eee }   /* adminlte */
.callout h4 { margin-top:0;font-weight:600 }   /* adminlte */
.callout p:last-child { margin-bottom:0 }   /* adminlte */
.callout code, .callout .highlight { background-color:#fff }   /* adminlte */
.callout.callout-danger { border-color:#c23321 }   /* adminlte */
.callout.callout-warning { border-color:#c87f0a }   /* adminlte */
.callout.callout-info { border-color:#0097bc }   /* adminlte */
.callout.callout-success { border-color:#00733e }   /* adminlte */
.callout.callout-danger, .callout.callout-warning, .callout.callout-info, .callout.callout-success { color:#fff !important }   /* adminlte */
.callout.callout-danger { background-color:#dd4b39 !important }   /* adminlte */
.callout.callout-warning { background-color:#f39c12 !important }   /* adminlte */
.callout.callout-info { background-color:#00c0ef !important }   /* adminlte */
.callout.callout-success { background-color:#00a65a !important }   /* adminlte */
```

#### `.callout-danger`

- Key: `fc-labels`
- Source: hbs/hbs-literal; 4 file(s): `c/tags/rename-panel.hbs`, `t/app/project/wiki/edit.hbs`, `t/app/project/wiki/page.hbs`, `t/app/settings/email.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.callout.callout-danger { border-color:#c23321 }   /* adminlte */
.callout.callout-danger { color:#fff !important }   /* adminlte */
.callout.callout-danger { background-color:#dd4b39 !important }   /* adminlte */
```

#### `.callout-info`

- Key: `fc-labels`
- Source: hbs; 4 file(s): `t/app/developer/components.hbs`, `t/app/developer/index.hbs`, `t/app/settings/issue-types.hbs`, `t/app/workspace/settings/projects.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.callout.callout-info { border-color:#0097bc }   /* adminlte */
.callout.callout-info { color:#fff !important }   /* adminlte */
.callout.callout-info { background-color:#00c0ef !important }   /* adminlte */
```

#### `.callout-success`

- Key: `fc-labels`
- Source: hbs/hbs-literal; 1 file(s): `t/app/settings/email.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.callout.callout-success { border-color:#00733e }   /* adminlte */
.callout.callout-success { color:#fff !important }   /* adminlte */
.callout.callout-success { background-color:#00a65a !important }   /* adminlte */
```

#### `.callout-warning`

- Key: `fc-labels`
- Source: hbs; 2 file(s): `c/tags/rename-panel.hbs`, `c/workspace/move-project-out-dialog.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.callout.callout-warning { border-color:#c87f0a }   /* adminlte */
.callout.callout-warning { color:#fff !important }   /* adminlte */
.callout.callout-warning { background-color:#f39c12 !important }   /* adminlte */
```

#### `.info-box`

- Key: `fc-labels`
- Source: hbs; 10 file(s): `c/conversation/vote-body.hbs`, `c/milestone-blocks/closed.hbs`, `c/milestone-blocks/complete.hbs`, `c/milestone-blocks/completed.hbs`, `c/milestone-blocks/deferred.hbs`, `c/milestone-blocks/failed.hbs`, `c/milestone-blocks/index.hbs`, `c/milestone-blocks/overdue.hbs`, `t/app/project/index.hbs`, `t/app/workspace/index.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.info-box { display:block;min-height:90px;background:#fff;width:100%;box-shadow:0 1px 1px rgba(0,0,0,0.1);border-radius:2px;margin-bottom:15px }   /* adminlte */
.info-box small { font-size:14px }   /* adminlte */
.info-box .progress { background:rgba(0,0,0,0.2);margin:5px -10px 5px -10px;height:2px }   /* adminlte */
.info-box .progress, .info-box .progress .progress-bar { border-radius:0 }   /* adminlte */
.info-box .progress .progress-bar { background:#fff }   /* adminlte */
```

#### `.info-box-content`

- Key: `fc-labels`
- Source: hbs; 10 file(s): `c/conversation/vote-body.hbs`, `c/milestone-blocks/closed.hbs`, `c/milestone-blocks/complete.hbs`, `c/milestone-blocks/completed.hbs`, `c/milestone-blocks/deferred.hbs`, `c/milestone-blocks/failed.hbs`, `c/milestone-blocks/index.hbs`, `c/milestone-blocks/overdue.hbs`, `t/app/project/index.hbs`, `t/app/workspace/index.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.info-box-content { padding:5px 10px;margin-left:90px }   /* adminlte */
```

#### `.info-box-icon`

- Key: `fc-labels`
- Source: hbs; 10 file(s): `c/conversation/vote-body.hbs`, `c/milestone-blocks/closed.hbs`, `c/milestone-blocks/complete.hbs`, `c/milestone-blocks/completed.hbs`, `c/milestone-blocks/deferred.hbs`, `c/milestone-blocks/failed.hbs`, `c/milestone-blocks/index.hbs`, `c/milestone-blocks/overdue.hbs`, `t/app/project/index.hbs`, `t/app/workspace/index.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.info-box-icon { border-top-left-radius:2px;border-top-right-radius:0;border-bottom-right-radius:0;border-bottom-left-radius:2px;display:block;float:left;height:90px;width:90px;text-align:center;font-size:45px;line-height:90px;background:rgba(0,0,0,0.2) }   /* adminlte */
.info-box-icon>img { max-width:100% }   /* adminlte */
```

#### `.info-box-number`

- Key: `fc-labels`
- Source: hbs; 4 file(s): `c/conversation/vote-body.hbs`, `c/project/milestones.hbs`, `t/app/project/index.hbs`, `t/app/workspace/index.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.info-box-number { display:block;font-weight:bold;font-size:18px }   /* adminlte */
```

#### `.info-box-text`

- Key: `fc-labels`
- Source: hbs; 10 file(s): `c/conversation/vote-body.hbs`, `c/milestone-blocks/closed.hbs`, `c/milestone-blocks/complete.hbs`, `c/milestone-blocks/completed.hbs`, `c/milestone-blocks/deferred.hbs`, `c/milestone-blocks/failed.hbs`, `c/milestone-blocks/index.hbs`, `c/milestone-blocks/overdue.hbs`, `t/app/project/index.hbs`, `t/app/workspace/index.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.info-box-text { display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis }   /* adminlte */
.info-box-text { text-transform:uppercase }   /* adminlte */
```

#### `.label`

- Key: `fc-labels`
- Source: hbs/js/js-template; 28 file(s): `c/agent/workflows.hbs`, `c/app-ui/data-table.js`, `c/app-ui/gantt-chart/gantt-row.hbs`, `c/app-ui/gantt-chart/task-row.hbs`, `c/app-ui/tabs/tab.hbs`, `c/app-ui/task-board.hbs`, `c/conversation/voter-list.hbs`, `c/developer/component-nav.hbs`, `c/developer/entry-header.hbs`, `c/ez-search-compact/index.hbs`, `c/idea/conversation-box.hbs`, `c/idea/plan-box.hbs`, `c/quick-list/item.js`, `c/user-profile/identities.hbs`, `c/user-profile/latest-issues.hbs`, `c/user-profile/latest-projects.hbs`, `c/workflow/step-form.hbs`, `c/workspace/remove-member-dialog.hbs`, `t/app/agent/index.hbs`, `t/app/agent/page.hbs`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`, `t/app/project/idea.hbs`, `t/app/project/wiki/page.hbs`, `t/app/role/page.hbs`, `t/app/settings/issue-statuses.hbs`, `t/app/settings/services.hbs`, `t/app/workflow/index.hbs`
- Vendor: adminlte, bootstrap; states: empty, first-of-type, focus, hover, not; breakpoints: @media (min-width:768px); @media print

```css
@media print { .label { border: 1px solid #000; } }   /* bootstrap */
.label { display: inline; padding: 0.2em 0.6em 0.3em; font-size: 75%; font-weight: 700; line-height: 1; color: #fff; text-align: center; white-space: nowrap; vertical-align: baseline; border-radius: 0.25em; }   /* bootstrap */
.label:empty { display: none; }   /* bootstrap */
.btn .label { position: relative; top: -1px; }   /* bootstrap */
a.label:hover, a.label:focus { color: #fff; text-decoration: none; cursor: pointer; }   /* bootstrap */
.main-header .navbar .nav>li>a>.label { position:absolute;top:9px;right:7px;text-align:center;font-size:9px;padding:2px 3px;line-height:.9 }   /* adminlte */
.sidebar-menu>li .label { margin-right:5px }   /* adminlte */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li:hover>a>.pull-right-container>.label:not(:first-of-type) { display:none } }   /* adminlte */
```

#### `.label-danger`

- Key: `fc-labels`
- Source: hbs/hbs-literal; 8 file(s): `c/agent/workflows.hbs`, `c/app-ui/gantt-chart/gantt-row.hbs`, `c/app-ui/gantt-chart/task-row.hbs`, `c/conversation/voter-list.hbs`, `t/app/agent/index.hbs`, `t/app/agent/page.hbs`, `t/app/role/page.hbs`, `t/app/workflow/index.hbs`
- Vendor: adminlte, bootstrap; states: focus, hover; breakpoints: none

```css
.label-danger { background-color: #d9534f; }   /* bootstrap */
.label-danger[href]:hover, .label-danger[href]:focus { background-color: #c9302c; }   /* bootstrap */
.label-danger { color:#fff !important }   /* adminlte */
.label-danger { background-color:#dd4b39 !important }   /* adminlte */
```

#### `.label-default`

- Key: `fc-labels`
- Source: hbs; 11 file(s): `c/agent/workflows.hbs`, `c/app-ui/tabs/tab.hbs`, `c/app-ui/task-board.hbs`, `c/user-profile/identities.hbs`, `c/workflow/step-form.hbs`, `c/workspace/remove-member-dialog.hbs`, `t/app/agent/index.hbs`, `t/app/agent/page.hbs`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`, `t/app/settings/services.hbs`
- Vendor: adminlte, bootstrap; states: focus, hover; breakpoints: none

```css
.label-default { background-color: #777777; }   /* bootstrap */
.label-default[href]:hover, .label-default[href]:focus { background-color: #5e5e5e; }   /* bootstrap */
.label-default { background-color:#d2d6de;color:#444 }   /* adminlte */
```

#### `.label-info`

- Key: `fc-labels`
- Source: hbs; 1 file(s): `t/app/settings/services.hbs`
- Vendor: adminlte, bootstrap; states: focus, hover; breakpoints: none

```css
.label-info { background-color: #5bc0de; }   /* bootstrap */
.label-info[href]:hover, .label-info[href]:focus { background-color: #31b0d5; }   /* bootstrap */
.label-info { color:#fff !important }   /* adminlte */
.label-info { background-color:#00c0ef !important }   /* adminlte */
```

#### `.label-primary`

- Key: `fc-labels`
- Source: hbs; 5 file(s): `c/developer/component-nav.hbs`, `c/ez-search-compact/index.hbs`, `c/user-profile/latest-issues.hbs`, `c/user-profile/latest-projects.hbs`, `t/app/project/wiki/page.hbs`
- Vendor: adminlte, bootstrap; states: focus, hover; breakpoints: none

```css
.label-primary { background-color: #337ab7; }   /* bootstrap */
.label-primary[href]:hover, .label-primary[href]:focus { background-color: #286090; }   /* bootstrap */
.label-primary { color:#fff !important }   /* adminlte */
.label-primary { background-color:#3c8dbc !important }   /* adminlte */
```

#### `.label-success`

- Key: `fc-labels`
- Source: hbs/hbs-literal/js; 9 file(s): `c/agent/workflows.hbs`, `c/app-ui/gantt-chart/gantt-row.hbs`, `c/conversation/voter-list.hbs`, `c/developer/entry-header.js`, `c/user-profile/identities.hbs`, `t/app/agent/index.hbs`, `t/app/agent/page.hbs`, `t/app/settings/services.hbs`, `t/app/workflow/index.hbs`
- Vendor: adminlte, bootstrap; states: focus, hover; breakpoints: none

```css
.label-success { background-color: #5cb85c; }   /* bootstrap */
.label-success[href]:hover, .label-success[href]:focus { background-color: #449d44; }   /* bootstrap */
.label-success { color:#fff !important }   /* adminlte */
.label-success { background-color:#00a65a !important }   /* adminlte */
```

#### `.label-warning`

- Key: `fc-labels`
- Source: hbs/hbs-literal/js; 4 file(s): `c/agent/workflows.hbs`, `c/developer/component-nav.hbs`, `c/developer/entry-header.js`, `t/app/workflow/index.hbs`
- Vendor: adminlte, bootstrap; states: focus, hover; breakpoints: none

```css
.label-warning { background-color: #f0ad4e; }   /* bootstrap */
.label-warning[href]:hover, .label-warning[href]:focus { background-color: #ec971f; }   /* bootstrap */
.label-warning { color:#fff !important }   /* adminlte */
.label-warning { background-color:#f39c12 !important }   /* adminlte */
```

#### `.progress`

- Key: `fc-labels`
- Source: hbs/js/js-template; 10 file(s): `c/app-ui/gantt-chart/gantt-bar.js`, `c/app-ui/milestone-block.js`, `c/app-ui/milestone-overview.hbs`, `c/app-ui/task-board/milestones.hbs`, `c/conversation/vote-body.hbs`, `c/project/milestones.hbs`, `app/models/issuestatus.js`, `app/models/project.js`, `t/app/workspace/index.hbs`, `app/utils/developer/ez-search-fixture.js`
- Vendor: adminlte, bootstrap; states: .active; breakpoints: none

```css
.progress { height: 20px; margin-bottom: 20px; overflow: hidden; background-color: #f5f5f5; border-radius: 4px; -webkit-box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1); box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1); }   /* bootstrap */
.progress.active .progress-bar { -webkit-animation: progress-bar-stripes 2s linear infinite; -o-animation: progress-bar-stripes 2s linear infinite; animation: progress-bar-stripes 2s linear infinite; }   /* bootstrap */
.progress, .progress>.progress-bar { -webkit-box-shadow:none;box-shadow:none }   /* adminlte */
.progress, .progress>.progress-bar, .progress .progress-bar, .progress>.progress-bar .progress-bar { border-radius:1px }   /* adminlte */
.table tr>td .progress { margin:0 }   /* adminlte */
.info-box .progress { background:rgba(0,0,0,0.2);margin:5px -10px 5px -10px;height:2px }   /* adminlte */
.info-box .progress, .info-box .progress .progress-bar { border-radius:0 }   /* adminlte */
.info-box .progress .progress-bar { background:#fff }   /* adminlte */
.table tr td .progress { margin-top:5px }   /* adminlte */
```

#### `.progress-bar`

- Key: `fc-labels`
- Source: hbs; 5 file(s): `c/app-ui/milestone-overview.hbs`, `c/app-ui/task-board/milestones.hbs`, `c/conversation/vote-body.hbs`, `c/project/milestones.hbs`, `t/app/workspace/index.hbs`
- Vendor: adminlte, bootstrap; states: .active; breakpoints: none

```css
.progress-bar { float: left; width: 0%; height: 100%; font-size: 12px; line-height: 20px; color: #fff; text-align: center; background-color: #337ab7; -webkit-box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.15); box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.15); -webkit-transition: width 0.6s ease; -o-transition: width 0.6s ease; transition: width 0.6s ease; }   /* bootstrap */
.progress.active .progress-bar, .progress-bar.active { -webkit-animation: progress-bar-stripes 2s linear infinite; -o-animation: progress-bar-stripes 2s linear infinite; animation: progress-bar-stripes 2s linear infinite; }   /* bootstrap */
.progress>.progress-bar { -webkit-box-shadow:none;box-shadow:none }   /* adminlte */
.progress>.progress-bar, .progress .progress-bar, .progress>.progress-bar .progress-bar { border-radius:1px }   /* adminlte */
.info-box .progress .progress-bar { border-radius:0 }   /* adminlte */
.info-box .progress .progress-bar { background:#fff }   /* adminlte */
```

#### `.progress-description`

- Key: `fc-labels`
- Source: hbs; 5 file(s): `c/app-ui/milestone-overview.hbs`, `c/app-ui/task-board/milestones.hbs`, `c/conversation/vote-body.hbs`, `c/project/milestones.hbs`, `t/app/workspace/index.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.progress-description { display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis }   /* adminlte */
.progress-description { margin:0 }   /* adminlte */
```


### `fc-nav`

#### `.active`

- Key: `fc-nav` (state; rules on .nav, .pagination, .sidebar-menu, .btn, .dropdown-menu, .table rows: each owning key re-creates its own `.active` rules)
- Source: hbs/js/js-selector; 30 file(s): `c/app-ui/accordion.hbs`, `c/app-ui/data-table.hbs`, `c/app-ui/gantt-chart.hbs`, `c/app-ui/gantt-chart/dependency-layer.hbs`, `c/app-ui/navbar-items.hbs`, `c/app-ui/tabs/pane.hbs`, `c/app-ui/tabs/tab.hbs`, `c/app-ui/task-board.hbs`, `c/bread-crumb-item.hbs`, `c/developer/component-nav.hbs`, `c/developer/demos/box.hbs`, `c/developer/demos/data-table.hbs`, `c/developer/demos/dropdown.hbs`, `c/developer/demos/ez-search.hbs`, `c/developer/demos/icon.hbs`, `c/developer/state-switch.hbs`, `c/ez-search-compact/index.hbs`, `c/ez-search/group.hbs`, `c/ez-search/index.hbs`, `c/ez-search/search-bar.hbs`, `c/idea/plan-box.hbs`, `c/issue/link-issue-modal.hbs`, `c/workflow/canvas-node.hbs`, `c/workflow/runs-box.hbs`, `app/modifiers/initialize-sortable.js`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`, `t/app/projects/index.hbs`, `t/app/settings.hbs`, `t/app/workspace/settings.hbs`
- Vendor: adminlte, bootstrap, skin; states: .active, first-of-type, focus, hover; breakpoints: none

```css
.table > thead > tr > td.active, .table > thead > tr > th.active, .table > thead > tr.active > td, .table > thead > tr.active > th, .table > tbody > tr > td.active, .table > tbody > tr > th.active, .table > tbody > tr.active > td, .table > tbody > tr.active > th, .table > tfoot > tr > td.active, .table > tfoot > tr > th.active, .table > tfoot > tr.active > td, .table > tfoot > tr.active > th { background-color: #f5f5f5; }   /* bootstrap */
.table-hover > tbody > tr > td.active:hover, .table-hover > tbody > tr > th.active:hover, .table-hover > tbody > tr.active:hover > td, .table-hover > tbody > tr:hover > .active, .table-hover > tbody > tr.active:hover > th { background-color: #e8e8e8; }   /* bootstrap */
.btn.active:focus { outline: 5px auto -webkit-focus-ring-color; outline-offset: -2px; }   /* bootstrap */
.btn.active { background-image: none; outline: 0; -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125); box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125); }   /* bootstrap */
.btn-default.active { color: #333; background-color: #e5e5e5; background-image: none; border-color: #adadad; }   /* bootstrap */
.btn-default.active:hover, .btn-default.active:focus { color: #333; background-color: #d4d4d4; border-color: #8c8c8c; }   /* bootstrap */
.btn-primary.active { color: #fff; background-color: #286090; background-image: none; border-color: #204d74; }   /* bootstrap */
.btn-primary.active:hover, .btn-primary.active:focus { color: #fff; background-color: #204d74; border-color: #122b40; }   /* bootstrap */
.btn-success.active { color: #fff; background-color: #449d44; background-image: none; border-color: #398439; }   /* bootstrap */
.btn-success.active:hover, .btn-success.active:focus { color: #fff; background-color: #398439; border-color: #255625; }   /* bootstrap */
.btn-danger.active { color: #fff; background-color: #c9302c; background-image: none; border-color: #ac2925; }   /* bootstrap */
.btn-danger.active:hover, .btn-danger.active:focus { color: #fff; background-color: #ac2925; border-color: #761c19; }   /* bootstrap */
.btn-link.active { background-color: transparent; -webkit-box-shadow: none; box-shadow: none; }   /* bootstrap */
.dropdown-menu > .active > a, .dropdown-menu > .active > a:hover, .dropdown-menu > .active > a:focus { color: #fff; text-decoration: none; background-color: #337ab7; outline: 0; }   /* bootstrap */
.btn-group > .btn.active { z-index: 2; }   /* bootstrap */
.nav-tabs > li.active > a, .nav-tabs > li.active > a:hover, .nav-tabs > li.active > a:focus { color: #555555; cursor: default; background-color: #fff; border: 1px solid #ddd; border-bottom-color: transparent; }   /* bootstrap */
.nav-pills > li.active > a, .nav-pills > li.active > a:hover, .nav-pills > li.active > a:focus { color: #fff; background-color: #337ab7; }   /* bootstrap */
.tab-content > .active { display: block; }   /* bootstrap */
.breadcrumb > .active { color: #777777; }   /* bootstrap */
.pagination > .active > a, .pagination > .active > a:hover, .pagination > .active > a:focus, .pagination > .active > span, .pagination > .active > span:hover, .pagination > .active > span:focus { z-index: 3; color: #fff; cursor: default; background-color: #337ab7; border-color: #337ab7; }   /* bootstrap */
.nav-pills > .active > a > .badge { color: #337ab7; background-color: #fff; }   /* bootstrap */
.progress.active .progress-bar, .progress-bar.active { -webkit-animation: progress-bar-stripes 2s linear infinite; -o-animation: progress-bar-stripes 2s linear infinite; animation: progress-bar-stripes 2s linear infinite; }   /* bootstrap */
.sidebar-menu li.active>.treeview-menu { display:block }   /* adminlte */
.nav-pills>li.active>a, .nav-pills>li.active>a:hover, .nav-pills>li.active>a:focus { border-top-color:#3c8dbc }   /* adminlte */
.nav-pills>li.active>a { font-weight:600 }   /* adminlte */
.nav-stacked>li.active>a, .nav-stacked>li.active>a:hover { background:transparent;color:#444;border-top:0;border-left-color:#3c8dbc }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li.active { border-top-color:#3c8dbc }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li.active>a, .nav-tabs-custom>.nav-tabs>li.active:hover>a { background-color:#fff;color:#444 }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li.active>a { border-top-color:transparent;border-left-color:#f4f4f4;border-right-color:#f4f4f4 }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li:first-of-type.active>a { border-left-color:transparent }   /* adminlte */
.nav-tabs-custom>.nav-tabs.pull-right>li:first-of-type.active>a { border-left-color:#f4f4f4;border-right-color:transparent }   /* adminlte */
.skin-black-light .main-header .navbar .nav>.active>a { background:#fff;color:#999 }   /* skin */
.skin-black-light .sidebar-menu>li.active>a { color:#000;background:#f4f4f5 }   /* skin */
.skin-black-light .sidebar-menu>li.active { border-left-color:#fff }   /* skin */
.skin-black-light .sidebar-menu>li.active>a { font-weight:600 }   /* skin */
.skin-black-light .treeview-menu>li.active>a { color:#000 }   /* skin */
.skin-black-light .treeview-menu>li.active>a { font-weight:600 }   /* skin */
```

#### `.breadcrumb`

- Key: `fc-nav`
- Source: hbs; 1 file(s): `c/bread-crumb.hbs`
- Vendor: adminlte, bootstrap; states: .active, before; breakpoints: @media (max-width:991px)

```css
.breadcrumb { padding: 8px 15px; margin-bottom: 20px; list-style: none; background-color: #f5f5f5; border-radius: 4px; }   /* bootstrap */
.breadcrumb > li { display: inline-block; }   /* bootstrap */
.breadcrumb > li + li:before { padding: 0 5px; color: #ccc; content: "/ "; }   /* bootstrap */
.breadcrumb > .active { color: #777777; }   /* bootstrap */
.content-header>.breadcrumb { float:right;background:transparent;margin-top:0;margin-bottom:0;font-size:12px;padding:7px 5px;position:absolute;top:15px;right:10px;border-radius:2px }   /* adminlte */
.content-header>.breadcrumb>li>a { color:#444;text-decoration:none;display:inline-block }   /* adminlte */
.content-header>.breadcrumb>li>a>.fa, .content-header>.breadcrumb>li>a>.glyphicon, .content-header>.breadcrumb>li>a>.ion { margin-right:5px }   /* adminlte */
.content-header>.breadcrumb>li+li:before { content:'>\00a0' }   /* adminlte */
@media (max-width:991px) { .content-header>.breadcrumb { position:relative;margin-top:5px;top:0;right:0;float:none;background:#d2d6de;padding-left:10px } }   /* adminlte */
@media (max-width:991px) { .content-header>.breadcrumb li:before { color:#97a0b3 } }   /* adminlte */
```

#### `.nav`

- Key: `fc-nav`
- Source: hbs; 14 file(s): `c/app-layouts/application-header.hbs`, `c/app-ui/gantt-chart.hbs`, `c/app-ui/skeleton/role-detail.hbs`, `c/app-ui/tabs.hbs`, `c/app-ui/task-board.hbs`, `c/developer/component-nav.hbs`, `c/idea/plan-box.hbs`, `c/workflow/node-palette.hbs`, `app/index.html`, `t/app/agent/skills.hbs`, `t/app/project/wiki.hbs`, `t/app/settings.hbs`, `t/app/workspace/settings.hbs`, `t/app/workspace/settings/agents.hbs`
- Vendor: adminlte, bootstrap, skin; states: .active, .disabled, .open, active, after, before, focus, hover; breakpoints: none

```css
.nav { padding-left: 0; margin-bottom: 0; list-style: none; }   /* bootstrap */
.nav:before, .nav:after { display: table; content: " "; }   /* bootstrap */
.nav:after { clear: both; }   /* bootstrap */
.nav > li { position: relative; display: block; }   /* bootstrap */
.nav > li > a { position: relative; display: block; padding: 10px 15px; }   /* bootstrap */
.nav > li > a:hover, .nav > li > a:focus { text-decoration: none; background-color: #eeeeee; }   /* bootstrap */
.nav > li.disabled > a { color: #777777; }   /* bootstrap */
.nav > li.disabled > a:hover, .nav > li.disabled > a:focus { color: #777777; text-decoration: none; cursor: not-allowed; background-color: transparent; }   /* bootstrap */
.nav .open > a, .nav .open > a:hover, .nav .open > a:focus { background-color: #eeeeee; border-color: #337ab7; }   /* bootstrap */
.nav .nav-divider { height: 1px; margin: 9px 0; overflow: hidden; background-color: #e5e5e5; }   /* bootstrap */
.nav > li > a > img { max-width: none; }   /* bootstrap */
.main-header .navbar .nav>li.user>a>.fa, .main-header .navbar .nav>li.user>a>.glyphicon, .main-header .navbar .nav>li.user>a>.ion { margin-right:5px }   /* adminlte */
.main-header .navbar .nav>li>a>.label { position:absolute;top:9px;right:7px;text-align:center;font-size:9px;padding:2px 3px;line-height:.9 }   /* adminlte */
.nav>li>a:hover, .nav>li>a:active, .nav>li>a:focus { color:#444;background:#f7f7f7 }   /* adminlte */
.skin-black-light .main-header .navbar .nav>li>a { color:#333 }   /* skin */
.skin-black-light .main-header .navbar .nav>li>a:hover, .skin-black-light .main-header .navbar .nav>li>a:active, .skin-black-light .main-header .navbar .nav>li>a:focus, .skin-black-light .main-header .navbar .nav .open>a, .skin-black-light .main-header .navbar .nav .open>a:hover, .skin-black-light .main-header .navbar .nav .open>a:focus, .skin-black-light .main-header .navbar .nav>.active>a { background:#fff;color:#999 }   /* skin */
```

#### `.nav-divider`

- Key: `fc-nav`
- Source: hbs; 1 file(s): `c/app-ui/nav-bar.hbs`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.nav .nav-divider { height: 1px; margin: 9px 0; overflow: hidden; background-color: #e5e5e5; }   /* bootstrap */
```

#### `.nav-pills`

- Key: `fc-nav`
- Source: hbs; 3 file(s): `c/developer/component-nav.hbs`, `t/app/project/wiki.hbs`, `t/app/settings.hbs`
- Vendor: adminlte, bootstrap; states: .active, focus, hover; breakpoints: none

```css
.nav-pills > li { float: left; }   /* bootstrap */
.nav-pills > li > a { border-radius: 4px; }   /* bootstrap */
.nav-pills > li + li { margin-left: 2px; }   /* bootstrap */
.nav-pills > li.active > a, .nav-pills > li.active > a:hover, .nav-pills > li.active > a:focus { color: #fff; background-color: #337ab7; }   /* bootstrap */
.nav-pills > .active > a > .badge { color: #337ab7; background-color: #fff; }   /* bootstrap */
.nav-pills > li > a > .badge { margin-left: 3px; }   /* bootstrap */
.nav-pills>li>a { border-radius:0;border-top:3px solid transparent;color:#444 }   /* adminlte */
.nav-pills>li>a>.fa, .nav-pills>li>a>.glyphicon, .nav-pills>li>a>.ion { margin-right:5px }   /* adminlte */
.nav-pills>li.active>a, .nav-pills>li.active>a:hover, .nav-pills>li.active>a:focus { border-top-color:#3c8dbc }   /* adminlte */
.nav-pills>li.active>a { font-weight:600 }   /* adminlte */
```

#### `.nav-stacked`

- Key: `fc-nav`
- Source: hbs; 6 file(s): `c/developer/component-nav.hbs`, `c/workflow/node-palette.hbs`, `t/app/agent/skills.hbs`, `t/app/project/wiki.hbs`, `t/app/settings.hbs`, `t/app/workspace/settings/agents.hbs`
- Vendor: adminlte, bootstrap; states: .active, hover, last-of-type; breakpoints: none

```css
.nav-stacked > li { float: none; }   /* bootstrap */
.nav-stacked > li + li { margin-top: 2px; margin-left: 0; }   /* bootstrap */
.box .nav-stacked>li { border-bottom:1px solid #f4f4f4;margin:0 }   /* adminlte */
.box .nav-stacked>li:last-of-type { border-bottom:none }   /* adminlte */
.nav-stacked>li>a { border-radius:0;border-top:0;border-left:3px solid transparent;color:#444 }   /* adminlte */
.nav-stacked>li.active>a, .nav-stacked>li.active>a:hover { background:transparent;color:#444;border-top:0;border-left-color:#3c8dbc }   /* adminlte */
.nav-stacked>li.header { border-bottom:1px solid #ddd;color:#777;margin-bottom:10px;padding:5px 10px;text-transform:uppercase }   /* adminlte */
```

#### `.nav-tabs`

- Key: `fc-nav`
- Source: hbs; 6 file(s): `c/app-ui/gantt-chart.hbs`, `c/app-ui/skeleton/role-detail.hbs`, `c/app-ui/tabs.hbs`, `c/app-ui/task-board.hbs`, `c/idea/plan-box.hbs`, `t/app/workspace/settings.hbs`
- Vendor: adminlte, bootstrap; states: .active, active, first-of-type, focus, hover, not; breakpoints: none

```css
.nav-tabs { border-bottom: 1px solid #ddd; }   /* bootstrap */
.nav-tabs > li { float: left; margin-bottom: -1px; }   /* bootstrap */
.nav-tabs > li > a { margin-right: 2px; line-height: 1.428571429; border: 1px solid transparent; border-radius: 4px 4px 0 0; }   /* bootstrap */
.nav-tabs > li > a:hover { border-color: #eeeeee #eeeeee #ddd; }   /* bootstrap */
.nav-tabs > li.active > a, .nav-tabs > li.active > a:hover, .nav-tabs > li.active > a:focus { color: #555555; cursor: default; background-color: #fff; border: 1px solid #ddd; border-bottom-color: transparent; }   /* bootstrap */
.nav-tabs .dropdown-menu { margin-top: -1px; border-top-left-radius: 0; border-top-right-radius: 0; }   /* bootstrap */
.nav-tabs-custom>.nav-tabs { margin:0;border-bottom-color:#f4f4f4;border-top-right-radius:3px;border-top-left-radius:3px }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li { border-top:3px solid transparent;margin-bottom:-2px;margin-right:5px }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li>a { color:#444;border-radius:0 }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li>a.text-muted { color:#999 }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li>a, .nav-tabs-custom>.nav-tabs>li>a:hover { background:transparent;margin:0 }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li>a:hover { color:#999 }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li:not(.active)>a:hover, .nav-tabs-custom>.nav-tabs>li:not(.active)>a:focus, .nav-tabs-custom>.nav-tabs>li:not(.active)>a:active { border-color:transparent }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li.active { border-top-color:#3c8dbc }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li.active>a, .nav-tabs-custom>.nav-tabs>li.active:hover>a { background-color:#fff;color:#444 }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li.active>a { border-top-color:transparent;border-left-color:#f4f4f4;border-right-color:#f4f4f4 }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li:first-of-type { margin-left:0 }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li:first-of-type.active>a { border-left-color:transparent }   /* adminlte */
.nav-tabs-custom>.nav-tabs.pull-right { float:none !important }   /* adminlte */
.nav-tabs-custom>.nav-tabs.pull-right>li { float:right }   /* adminlte */
.nav-tabs-custom>.nav-tabs.pull-right>li:first-of-type { margin-right:0 }   /* adminlte */
.nav-tabs-custom>.nav-tabs.pull-right>li:first-of-type>a { border-left-width:1px }   /* adminlte */
.nav-tabs-custom>.nav-tabs.pull-right>li:first-of-type.active>a { border-left-color:#f4f4f4;border-right-color:transparent }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li.header { line-height:35px;padding:0 10px;font-size:20px;color:#444 }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li.header>.fa, .nav-tabs-custom>.nav-tabs>li.header>.glyphicon, .nav-tabs-custom>.nav-tabs>li.header>.ion { margin-right:5px }   /* adminlte */
```

#### `.nav-tabs-custom`

- Key: `fc-nav`
- Source: hbs; 4 file(s): `c/app-ui/gantt-chart.hbs`, `c/app-ui/tabs.hbs`, `c/app-ui/task-board.hbs`, `t/app/workspace/settings.hbs`
- Vendor: adminlte; states: .active, .open, active, first-of-type, focus, hover, not; breakpoints: none

```css
.nav-tabs-custom { margin-bottom:20px;background:#fff;box-shadow:0 1px 1px rgba(0,0,0,0.1);border-radius:3px }   /* adminlte */
.nav-tabs-custom>.nav-tabs { margin:0;border-bottom-color:#f4f4f4;border-top-right-radius:3px;border-top-left-radius:3px }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li { border-top:3px solid transparent;margin-bottom:-2px;margin-right:5px }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li>a { color:#444;border-radius:0 }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li>a.text-muted { color:#999 }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li>a, .nav-tabs-custom>.nav-tabs>li>a:hover { background:transparent;margin:0 }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li>a:hover { color:#999 }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li:not(.active)>a:hover, .nav-tabs-custom>.nav-tabs>li:not(.active)>a:focus, .nav-tabs-custom>.nav-tabs>li:not(.active)>a:active { border-color:transparent }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li.active { border-top-color:#3c8dbc }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li.active>a, .nav-tabs-custom>.nav-tabs>li.active:hover>a { background-color:#fff;color:#444 }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li.active>a { border-top-color:transparent;border-left-color:#f4f4f4;border-right-color:#f4f4f4 }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li:first-of-type { margin-left:0 }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li:first-of-type.active>a { border-left-color:transparent }   /* adminlte */
.nav-tabs-custom>.nav-tabs.pull-right { float:none !important }   /* adminlte */
.nav-tabs-custom>.nav-tabs.pull-right>li { float:right }   /* adminlte */
.nav-tabs-custom>.nav-tabs.pull-right>li:first-of-type { margin-right:0 }   /* adminlte */
.nav-tabs-custom>.nav-tabs.pull-right>li:first-of-type>a { border-left-width:1px }   /* adminlte */
.nav-tabs-custom>.nav-tabs.pull-right>li:first-of-type.active>a { border-left-color:#f4f4f4;border-right-color:transparent }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li.header { line-height:35px;padding:0 10px;font-size:20px;color:#444 }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li.header>.fa, .nav-tabs-custom>.nav-tabs>li.header>.glyphicon, .nav-tabs-custom>.nav-tabs>li.header>.ion { margin-right:5px }   /* adminlte */
.nav-tabs-custom>.tab-content { background:#fff;padding:10px;border-bottom-right-radius:3px;border-bottom-left-radius:3px }   /* adminlte */
.nav-tabs-custom .dropdown.open>a:active, .nav-tabs-custom .dropdown.open>a:focus { background:transparent;color:#999 }   /* adminlte */
```

#### `.pagination`

- Key: `fc-nav`
- Source: hbs; 1 file(s): `t/app/module.hbs`
- Vendor: adminlte, bootstrap; states: .active, .disabled, first-child, focus, hover, last-child; breakpoints: none

```css
.pagination { display: inline-block; padding-left: 0; margin: 20px 0; border-radius: 4px; }   /* bootstrap */
.pagination > li { display: inline; }   /* bootstrap */
.pagination > li > a, .pagination > li > span { position: relative; float: left; padding: 6px 12px; margin-left: -1px; line-height: 1.428571429; color: #337ab7; text-decoration: none; background-color: #fff; border: 1px solid #ddd; }   /* bootstrap */
.pagination > li > a:hover, .pagination > li > a:focus, .pagination > li > span:hover, .pagination > li > span:focus { z-index: 2; color: #23527c; background-color: #eeeeee; border-color: #ddd; }   /* bootstrap */
.pagination > li:first-child > a, .pagination > li:first-child > span { margin-left: 0; border-top-left-radius: 4px; border-bottom-left-radius: 4px; }   /* bootstrap */
.pagination > li:last-child > a, .pagination > li:last-child > span { border-top-right-radius: 4px; border-bottom-right-radius: 4px; }   /* bootstrap */
.pagination > .active > a, .pagination > .active > a:hover, .pagination > .active > a:focus, .pagination > .active > span, .pagination > .active > span:hover, .pagination > .active > span:focus { z-index: 3; color: #fff; cursor: default; background-color: #337ab7; border-color: #337ab7; }   /* bootstrap */
.pagination > .disabled > span, .pagination > .disabled > span:hover, .pagination > .disabled > span:focus, .pagination > .disabled > a, .pagination > .disabled > a:hover, .pagination > .disabled > a:focus { color: #777777; cursor: not-allowed; background-color: #fff; border-color: #ddd; }   /* bootstrap */
.pagination>li>a { background:#fafafa;color:#666 }   /* adminlte */
```

#### `.tab-content`

- Key: `fc-nav`
- Source: hbs; 3 file(s): `c/app-ui/tabs.hbs`, `c/app-ui/task-board.hbs`, `t/app/workspace/settings.hbs`
- Vendor: adminlte, bootstrap; states: .active; breakpoints: none

```css
.tab-content > .tab-pane { display: none; }   /* bootstrap */
.tab-content > .active { display: block; }   /* bootstrap */
.nav-tabs-custom>.tab-content { background:#fff;padding:10px;border-bottom-right-radius:3px;border-bottom-left-radius:3px }   /* adminlte */
```

#### `.tab-pane`

- Key: `fc-nav`
- Source: hbs; 3 file(s): `c/app-ui/tabs/pane.hbs`, `c/app-ui/task-board.hbs`, `t/app/workspace/settings.hbs`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.tab-content > .tab-pane { display: none; }   /* bootstrap */
```


### `fc-dropdown`

#### `.divider`

- Key: `fc-dropdown`
- Source: hbs; 1 file(s): `c/app-ui/navbar-items.hbs`
- Vendor: adminlte, bootstrap; states: none; breakpoints: none

```css
.dropdown-menu .divider { height: 1px; margin: 9px 0; overflow: hidden; background-color: #e5e5e5; }   /* bootstrap */
.dropdown-menu>.divider { background-color:#eee }   /* adminlte */
```

#### `.dropdown`

- Key: `fc-dropdown`
- Source: hbs; 3 file(s): `c/app-layouts/application-header.hbs`, `c/issue/assignee-select.hbs`, `c/issue/issue-details.hbs`
- Vendor: adminlte, bootstrap; states: .open, active, focus; breakpoints: none

```css
.dropdown { position: relative; }   /* bootstrap */
.nav-tabs-custom .dropdown.open>a:active, .nav-tabs-custom .dropdown.open>a:focus { background:transparent;color:#999 }   /* adminlte */
```

#### `.dropdown-header`

- Key: `fc-dropdown`
- Source: hbs; 1 file(s): `c/ez-search/search-bar.hbs`
- Vendor: bootstrap; states: .open; breakpoints: @media (max-width: 767px)

```css
.dropdown-header { display: block; padding: 3px 20px; font-size: 12px; line-height: 1.428571429; color: #777777; white-space: nowrap; }   /* bootstrap */
@media (max-width: 767px) { .navbar-nav .open .dropdown-menu .dropdown-header { padding: 5px 15px 5px 25px; } }   /* bootstrap */
```

#### `.dropdown-menu`

- Key: `fc-dropdown`
- Source: hbs/js; 7 file(s): `c/app-layouts/application-header.hbs`, `c/ez-search/search-bar.hbs`, `c/issue/assignee-select.hbs`, `c/issue/issue-details.hbs`, `app/modifiers/initialize-toastui.js`, `t/app/module.hbs`, `t/app/project/issue/index.hbs`
- Vendor: adminlte, bootstrap; states: .active, .disabled, .open, after, before, focus, hover; breakpoints: @media (max-width: 767px); @media (max-width:991px)

```css
.dropdown-menu { position: absolute; top: 100%; left: 0; z-index: 1000; display: none; float: left; min-width: 160px; padding: 5px 0; margin: 2px 0 0; font-size: 14px; text-align: left; list-style: none; background-color: #fff; background-clip: padding-box; border: 1px solid #ccc; border: 1px solid rgba(0, 0, 0, 0.15); border-radius: 4px; -webkit-box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175); box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175); }   /* bootstrap */
.dropdown-menu.pull-right { right: 0; left: auto; }   /* bootstrap */
.dropdown-menu .divider { height: 1px; margin: 9px 0; overflow: hidden; background-color: #e5e5e5; }   /* bootstrap */
.dropdown-menu > li > a { display: block; padding: 3px 20px; clear: both; font-weight: 400; line-height: 1.428571429; color: #333333; white-space: nowrap; }   /* bootstrap */
.dropdown-menu > li > a:hover, .dropdown-menu > li > a:focus { color: #262626; text-decoration: none; background-color: #f5f5f5; }   /* bootstrap */
.dropdown-menu > .active > a, .dropdown-menu > .active > a:hover, .dropdown-menu > .active > a:focus { color: #fff; text-decoration: none; background-color: #337ab7; outline: 0; }   /* bootstrap */
.dropdown-menu > .disabled > a, .dropdown-menu > .disabled > a:hover, .dropdown-menu > .disabled > a:focus { color: #777777; }   /* bootstrap */
.dropdown-menu > .disabled > a:hover, .dropdown-menu > .disabled > a:focus { text-decoration: none; cursor: not-allowed; background-color: transparent; background-image: none; filter: progid:DXImageTransform.Microsoft.gradient(enabled = false); }   /* bootstrap */
.open > .dropdown-menu { display: block; }   /* bootstrap */
.pull-right > .dropdown-menu { right: 0; left: auto; }   /* bootstrap */
.nav-tabs .dropdown-menu { margin-top: -1px; border-top-left-radius: 0; border-top-right-radius: 0; }   /* bootstrap */
@media (max-width: 767px) { .navbar-nav .open .dropdown-menu { position: static; float: none; width: auto; margin-top: 0; background-color: transparent; border: 0; box-shadow: none; } }   /* bootstrap */
@media (max-width: 767px) { .navbar-nav .open .dropdown-menu > li > a, .navbar-nav .open .dropdown-menu .dropdown-header { padding: 5px 15px 5px 25px; } }   /* bootstrap */
@media (max-width: 767px) { .navbar-nav .open .dropdown-menu > li > a { line-height: 20px; } }   /* bootstrap */
@media (max-width: 767px) { .navbar-nav .open .dropdown-menu > li > a:hover, .navbar-nav .open .dropdown-menu > li > a:focus { background-image: none; } }   /* bootstrap */
.navbar-nav > li > .dropdown-menu { margin-top: 0; border-top-left-radius: 0; border-top-right-radius: 0; }   /* bootstrap */
.dropdown-menu { box-shadow:none;border-color:#eee }   /* adminlte */
.dropdown-menu>li>a { color:#777 }   /* adminlte */
.dropdown-menu>li>a>.glyphicon, .dropdown-menu>li>a>.fa, .dropdown-menu>li>a>.ion { margin-right:10px }   /* adminlte */
.dropdown-menu>li>a:hover { background-color:#e1e3e9;color:#333 }   /* adminlte */
.dropdown-menu>.divider { background-color:#eee }   /* adminlte */
.navbar-nav>.notifications-menu>.dropdown-menu { width:280px;padding:0 0 0 0;margin:0;top:100% }   /* adminlte */
.navbar-nav>.notifications-menu>.dropdown-menu>li { position:relative }   /* adminlte */
.navbar-nav>.notifications-menu>.dropdown-menu>li.header { border-top-left-radius:4px;border-top-right-radius:4px;border-bottom-right-radius:0;border-bottom-left-radius:0;background-color:#ffffff;padding:7px 10px;border-bottom:1px solid #f4f4f4;color:#444444;font-size:14px }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu { border-top-right-radius:0;border-top-left-radius:0;padding:1px 0 0 0;border-top-width:0;width:280px }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu { border-bottom-right-radius:4px;border-bottom-left-radius:4px }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>li.user-header { height:175px;padding:10px;text-align:center }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>li.user-header>img { z-index:5;height:90px;width:90px;border:3px solid;border-color:transparent;border-color:rgba(255,255,255,0.2) }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>li.user-header>p { z-index:5;color:#fff;color:rgba(255,255,255,0.8);font-size:17px;margin-top:10px }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>li.user-header>p>small { display:block;font-size:12px }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>.user-footer { background-color:#f9f9f9;padding:10px }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>.user-footer:before, .navbar-nav>.user-menu>.dropdown-menu>.user-footer:after { content:" ";display:table }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>.user-footer:after { clear:both }   /* adminlte */
.navbar-nav>.user-menu>.dropdown-menu>.user-footer .btn-default { color:#666666 }   /* adminlte */
@media (max-width:991px) { .navbar-nav>.user-menu>.dropdown-menu>.user-footer .btn-default:hover { background-color:#f9f9f9 } }   /* adminlte */
.navbar-custom-menu>.navbar-nav>li>.dropdown-menu { position:absolute;right:0;left:auto }   /* adminlte */
@media (max-width:991px) { .navbar-custom-menu>.navbar-nav>li>.dropdown-menu { position:absolute;right:5%;left:auto;border:1px solid #ddd;background:#fff } }   /* adminlte */
.box-header>.box-tools.pull-right .dropdown-menu { right:0;left:auto }   /* adminlte */
```

#### `.dropdown-menu-right`

- Key: `fc-dropdown`
- Source: hbs/hbs-literal; 1 file(s): `c/issue/assignee-select.hbs`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.dropdown-menu-right { right: 0; left: auto; }   /* bootstrap */
```

#### `.dropdown-toggle`

- Key: `fc-dropdown`
- Source: hbs/js; 4 file(s): `c/app-layouts/application-header.hbs`, `app/modifiers/dropdown-toggle.js`, `t/app/module.hbs`, `t/app/project/issue/index.hbs`
- Vendor: bootstrap; states: .open, active, first-child, focus, hover, last-child, not; breakpoints: none

```css
.open > .btn-default.dropdown-toggle { color: #333; background-color: #e5e5e5; background-image: none; border-color: #adadad; }   /* bootstrap */
.open > .btn-default.dropdown-toggle:hover, .open > .btn-default.dropdown-toggle:focus { color: #333; background-color: #d4d4d4; border-color: #8c8c8c; }   /* bootstrap */
.open > .btn-primary.dropdown-toggle { color: #fff; background-color: #286090; background-image: none; border-color: #204d74; }   /* bootstrap */
.open > .btn-primary.dropdown-toggle:hover, .open > .btn-primary.dropdown-toggle:focus { color: #fff; background-color: #204d74; border-color: #122b40; }   /* bootstrap */
.open > .btn-success.dropdown-toggle { color: #fff; background-color: #449d44; background-image: none; border-color: #398439; }   /* bootstrap */
.open > .btn-success.dropdown-toggle:hover, .open > .btn-success.dropdown-toggle:focus { color: #fff; background-color: #398439; border-color: #255625; }   /* bootstrap */
.open > .btn-danger.dropdown-toggle { color: #fff; background-color: #c9302c; background-image: none; border-color: #ac2925; }   /* bootstrap */
.open > .btn-danger.dropdown-toggle:hover, .open > .btn-danger.dropdown-toggle:focus { color: #fff; background-color: #ac2925; border-color: #761c19; }   /* bootstrap */
.dropdown-toggle:focus { outline: 0; }   /* bootstrap */
.btn-group > .dropdown-toggle:not(:first-child) { border-top-left-radius: 0; border-bottom-left-radius: 0; }   /* bootstrap */
.btn-group > .btn-group:first-child:not(:last-child) > .dropdown-toggle { border-top-right-radius: 0; border-bottom-right-radius: 0; }   /* bootstrap */
.btn-group .dropdown-toggle:active, .btn-group.open .dropdown-toggle { outline: 0; }   /* bootstrap */
.btn-group > .btn + .dropdown-toggle { padding-right: 8px; padding-left: 8px; }   /* bootstrap */
.btn-group.open .dropdown-toggle { -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125); box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125); }   /* bootstrap */
.btn-group.open .dropdown-toggle.btn-link { -webkit-box-shadow: none; box-shadow: none; }   /* bootstrap */
.input-group-btn:first-child > .dropdown-toggle { border-top-right-radius: 0; border-bottom-right-radius: 0; }   /* bootstrap */
.input-group-btn:last-child > .dropdown-toggle { border-top-left-radius: 0; border-bottom-left-radius: 0; }   /* bootstrap */
```

#### `.open`

- Key: `fc-dropdown` (state; `.open > .dropdown-menu`, `.btn-group.open`, `.nav .open > a`)
- Source: hbs/js; 6 file(s): `c/app-ui/accordion.hbs`, `c/app-ui/notifications/notification.js`, `c/developer/demos/modal.js`, `app/locales/en-us/translations.js`, `app/modifiers/dropdown-toggle.js`, `app/utils/developer/ez-search-fixture.js`
- Vendor: adminlte, bootstrap, skin; states: .open, active, focus, hover; breakpoints: @media (max-width: 767px)

```css
.open > .btn-default.dropdown-toggle { color: #333; background-color: #e5e5e5; background-image: none; border-color: #adadad; }   /* bootstrap */
.open > .btn-default.dropdown-toggle:hover, .open > .btn-default.dropdown-toggle:focus { color: #333; background-color: #d4d4d4; border-color: #8c8c8c; }   /* bootstrap */
.open > .btn-primary.dropdown-toggle { color: #fff; background-color: #286090; background-image: none; border-color: #204d74; }   /* bootstrap */
.open > .btn-primary.dropdown-toggle:hover, .open > .btn-primary.dropdown-toggle:focus { color: #fff; background-color: #204d74; border-color: #122b40; }   /* bootstrap */
.open > .btn-success.dropdown-toggle { color: #fff; background-color: #449d44; background-image: none; border-color: #398439; }   /* bootstrap */
.open > .btn-success.dropdown-toggle:hover, .open > .btn-success.dropdown-toggle:focus { color: #fff; background-color: #398439; border-color: #255625; }   /* bootstrap */
.open > .btn-danger.dropdown-toggle { color: #fff; background-color: #c9302c; background-image: none; border-color: #ac2925; }   /* bootstrap */
.open > .btn-danger.dropdown-toggle:hover, .open > .btn-danger.dropdown-toggle:focus { color: #fff; background-color: #ac2925; border-color: #761c19; }   /* bootstrap */
.open > .dropdown-menu { display: block; }   /* bootstrap */
.open > a { outline: 0; }   /* bootstrap */
.btn-group.open .dropdown-toggle { outline: 0; }   /* bootstrap */
.btn-group.open .dropdown-toggle { -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125); box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125); }   /* bootstrap */
.btn-group.open .dropdown-toggle.btn-link { -webkit-box-shadow: none; box-shadow: none; }   /* bootstrap */
.nav .open > a, .nav .open > a:hover, .nav .open > a:focus { background-color: #eeeeee; border-color: #337ab7; }   /* bootstrap */
@media (max-width: 767px) { .navbar-nav .open .dropdown-menu { position: static; float: none; width: auto; margin-top: 0; background-color: transparent; border: 0; box-shadow: none; } }   /* bootstrap */
@media (max-width: 767px) { .navbar-nav .open .dropdown-menu > li > a, .navbar-nav .open .dropdown-menu .dropdown-header { padding: 5px 15px 5px 25px; } }   /* bootstrap */
@media (max-width: 767px) { .navbar-nav .open .dropdown-menu > li > a { line-height: 20px; } }   /* bootstrap */
@media (max-width: 767px) { .navbar-nav .open .dropdown-menu > li > a:hover, .navbar-nav .open .dropdown-menu > li > a:focus { background-image: none; } }   /* bootstrap */
.open .btn-box-tool { color:#606c84 }   /* adminlte */
.nav-tabs-custom .dropdown.open>a:active, .nav-tabs-custom .dropdown.open>a:focus { background:transparent;color:#999 }   /* adminlte */
.skin-black-light .main-header .navbar .nav .open>a, .skin-black-light .main-header .navbar .nav .open>a:hover, .skin-black-light .main-header .navbar .nav .open>a:focus { background:#fff;color:#999 }   /* skin */
```


### `fc-modal`

#### `.modal`

- Key: `fc-modal`
- Source: js/js-template; 2 file(s): `app/utils/developer/component-registry.js`, `app/utils/ui/dialog-dropdown.js`
- Vendor: adminlte, bootstrap; states: none; breakpoints: none

```css
.modal { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 1050; display: none; overflow: hidden; -webkit-overflow-scrolling: touch; outline: 0; }   /* bootstrap */
.modal { background:rgba(0,0,0,0.3) }   /* adminlte */
```

#### `.modal-body`

- Key: `fc-modal`
- Source: hbs; 1 file(s): `c/app-ui/modal.hbs`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.modal-body { position: relative; padding: 15px; }   /* bootstrap */
```

#### `.modal-content`

- Key: `fc-modal`
- Source: hbs; 1 file(s): `c/app-ui/modal.hbs`
- Vendor: adminlte, bootstrap; states: none; breakpoints: @media (min-width: 768px); @media (min-width:768px)

```css
.modal-content { position: relative; background-color: #fff; background-clip: padding-box; border: 1px solid #999; border: 1px solid rgba(0, 0, 0, 0.2); border-radius: 6px; -webkit-box-shadow: 0 3px 9px rgba(0, 0, 0, 0.5); box-shadow: 0 3px 9px rgba(0, 0, 0, 0.5); outline: 0; }   /* bootstrap */
@media (min-width: 768px) { .modal-content { -webkit-box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5); } }   /* bootstrap */
.modal-content { border-radius:0;-webkit-box-shadow:0 2px 3px rgba(0,0,0,0.125);box-shadow:0 2px 3px rgba(0,0,0,0.125);border:0 }   /* adminlte */
@media (min-width:768px) { .modal-content { -webkit-box-shadow:0 2px 3px rgba(0,0,0,0.125);box-shadow:0 2px 3px rgba(0,0,0,0.125) } }   /* adminlte */
```

#### `.modal-dialog`

- Key: `fc-modal`
- Source: hbs/js-template; 2 file(s): `c/app-ui/modal.hbs`, `c/app-ui/modal.js`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 768px)

```css
.modal-dialog { position: relative; width: auto; margin: 10px; }   /* bootstrap */
@media (min-width: 768px) { .modal-dialog { width: 600px; margin: 30px auto; } }   /* bootstrap */
```

#### `.modal-footer`

- Key: `fc-modal`
- Source: hbs; 1 file(s): `c/app-ui/modal.hbs`
- Vendor: adminlte, bootstrap; states: after, before; breakpoints: none

```css
.modal-footer { padding: 15px; text-align: right; border-top: 1px solid #e5e5e5; }   /* bootstrap */
.modal-footer:before, .modal-footer:after { display: table; content: " "; }   /* bootstrap */
.modal-footer:after { clear: both; }   /* bootstrap */
.modal-footer .btn + .btn { margin-bottom: 0; margin-left: 5px; }   /* bootstrap */
.modal-footer .btn-group .btn + .btn { margin-left: -1px; }   /* bootstrap */
.modal-footer .btn-block + .btn-block { margin-left: 0; }   /* bootstrap */
.modal-footer { border-top-color:#f4f4f4 }   /* adminlte */
```

#### `.modal-header`

- Key: `fc-modal`
- Source: hbs; 1 file(s): `c/app-ui/modal.hbs`
- Vendor: adminlte, bootstrap; states: after, before; breakpoints: none

```css
.modal-header { padding: 15px; border-bottom: 1px solid #e5e5e5; }   /* bootstrap */
.modal-header:before, .modal-header:after { display: table; content: " "; }   /* bootstrap */
.modal-header:after { clear: both; }   /* bootstrap */
.modal-header .close { margin-top: -2px; }   /* bootstrap */
.modal-header { border-bottom-color:#f4f4f4 }   /* adminlte */
```

#### `.modal-title`

- Key: `fc-modal`
- Source: hbs; 1 file(s): `c/app-ui/modal.hbs`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.modal-title { margin: 0; line-height: 1.428571429; }   /* bootstrap */
```


### `fc-utilities`

#### `.bg-aqua`

- Key: `fc-utilities`
- Source: hbs; 2 file(s): `c/activity-blocks/index.hbs`, `t/app/project/index.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.bg-aqua { color:#fff !important }   /* adminlte */
.bg-aqua { background-color:#00c0ef !important }   /* adminlte */
```

#### `.bg-blue`

- Key: `fc-utilities`
- Source: hbs; 1 file(s): `t/app/workspace/settings/agents.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.bg-blue { color:#fff !important }   /* adminlte */
.bg-blue { background-color:#0073b7 !important }   /* adminlte */
```

#### `.bg-gray`

- Key: `fc-utilities`
- Source: hbs/hbs-literal; 4 file(s): `c/app-ui/timeline.hbs`, `c/milestone-blocks/closed.hbs`, `c/user-profile/recent-activities.hbs`, `t/app/workspace/index.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.bg-gray { color:#000;background-color:#d2d6de !important }   /* adminlte */
```

#### `.bg-green`

- Key: `fc-utilities`
- Source: hbs; 7 file(s): `c/activity-blocks/issue/closed.hbs`, `c/activity-blocks/issue/created.hbs`, `c/activity-blocks/project/closed.hbs`, `c/activity-blocks/project/created.hbs`, `c/conversation/vote-body.hbs`, `c/milestone-blocks/complete.hbs`, `c/milestone-blocks/completed.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.bg-green { color:#fff !important }   /* adminlte */
.bg-green { background-color:#00a65a !important }   /* adminlte */
```

#### `.bg-orange`

- Key: `fc-utilities`
- Source: hbs; 2 file(s): `c/activity-blocks/issue/mentioned.hbs`, `c/activity-blocks/issue/updated.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.bg-orange { color:#fff !important }   /* adminlte */
.bg-orange { background-color:#ff851b !important }   /* adminlte */
```

#### `.bg-primary`

- Key: `fc-utilities`
- Source: hbs; 1 file(s): `c/app-ui/timeline.hbs`
- Vendor: bootstrap; states: focus, hover; breakpoints: none

```css
.bg-primary { color: #fff; }   /* bootstrap */
.bg-primary { background-color: #337ab7; }   /* bootstrap */
a.bg-primary:hover, a.bg-primary:focus { background-color: #286090; }   /* bootstrap */
```

#### `.bg-purple`

- Key: `fc-utilities`
- Source: hbs; 6 file(s): `c/activity-blocks/related-attached.hbs`, `c/activity-blocks/related-completed.hbs`, `c/activity-blocks/related-created.hbs`, `c/activity-blocks/related-deleted.hbs`, `c/activity-blocks/related-updated.hbs`, `c/milestone-blocks/deferred.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.bg-purple { color:#fff !important }   /* adminlte */
.bg-purple { background-color:#605ca8 !important }   /* adminlte */
```

#### `.bg-red`

- Key: `fc-utilities`
- Source: hbs/js/js-template; 8 file(s): `c/activity-blocks/issue/deleted.hbs`, `c/activity-blocks/project/deleted.hbs`, `c/activity-blocks/related-overdue.hbs`, `c/app-ui/milestone-overview.js`, `c/app-ui/task-board/milestones.js`, `c/conversation/vote-body.hbs`, `c/milestone-blocks/failed.hbs`, `c/milestone-blocks/overdue.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.bg-red { color:#fff !important }   /* adminlte */
.bg-red { background-color:#dd4b39 !important }   /* adminlte */
```

#### `.bg-yellow`

- Key: `fc-utilities`
- Source: hbs/hbs-literal/js/js-template; 5 file(s): `c/activity-blocks/project/updated.hbs`, `c/app-ui/milestone-overview.js`, `c/app-ui/task-board/milestones.js`, `c/milestone-blocks/index.hbs`, `t/app/workspace/index.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.bg-yellow { color:#fff !important }   /* adminlte */
.bg-yellow { background-color:#f39c12 !important }   /* adminlte */
```

#### `.caret`

- Key: `fc-utilities`
- Source: hbs; 1 file(s): `t/app/module.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media print

```css
@media print { .btn > .caret { border-top-color: #000 !important; } }   /* bootstrap */
.caret { display: inline-block; width: 0; height: 0; margin-left: 2px; vertical-align: middle; border-top: 4px dashed; border-top: 4px solid \9 ; border-right: 4px solid transparent; border-left: 4px solid transparent; }   /* bootstrap */
.btn .caret { margin-left: 0; }   /* bootstrap */
```

#### `.close`

- Key: `fc-utilities`
- Source: hbs/js; 2 file(s): `c/app-ui/modal.hbs`, `c/developer/demos/modal.js`
- Vendor: adminlte, bootstrap; states: focus, hover; breakpoints: none

```css
.close { float: right; font-size: 21px; font-weight: bold; line-height: 1; color: #000; text-shadow: 0 1px 0 #fff; filter: alpha(opacity=20); opacity: 0.2; }   /* bootstrap */
.close:hover, .close:focus { color: #000; text-decoration: none; cursor: pointer; filter: alpha(opacity=50); opacity: 0.5; }   /* bootstrap */
button.close { padding: 0; cursor: pointer; background: transparent; border: 0; -webkit-appearance: none; appearance: none; }   /* bootstrap */
.modal-header .close { margin-top: -2px; }   /* bootstrap */
.alert .close { color:#000;opacity:.2;filter:alpha(opacity=20) }   /* adminlte */
.alert .close:hover { opacity:.5;filter:alpha(opacity=50) }   /* adminlte */
```

#### `.hidden`

- Key: `fc-utilities`
- Source: hbs; 1 file(s): `c/user/edit/profile-picture.hbs`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.hidden { display: none !important; }   /* bootstrap */
```

#### `.img-responsive`

- Key: `fc-utilities`
- Source: hbs; 2 file(s): `c/user/edit/profile-picture.hbs`, `t/app/index.hbs`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.img-responsive { display: block; max-width: 100%; height: auto; }   /* bootstrap */
```

#### `.lead`

- Key: `fc-utilities`
- Source: hbs; 1 file(s): `t/app/settings/services.hbs`
- Vendor: bootstrap; states: none; breakpoints: @media (min-width: 768px)

```css
.lead { margin-bottom: 20px; font-size: 16px; font-weight: 300; line-height: 1.4; }   /* bootstrap */
@media (min-width: 768px) { .lead { font-size: 21px; } }   /* bootstrap */
```

#### `.list-inline`

- Key: `fc-utilities`
- Source: hbs; 2 file(s): `c/idea/message-screens.hbs`, `c/idea/plan-box.hbs`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.list-inline { padding-left: 0; list-style: none; margin-left: -5px; }   /* bootstrap */
.list-inline > li { display: inline-block; padding-right: 5px; padding-left: 5px; }   /* bootstrap */
```

#### `.list-unstyled`

- Key: `fc-utilities`
- Source: hbs; 8 file(s): `c/conversation/activity-box.hbs`, `c/developer/demos/icon.hbs`, `c/idea/created-issues-box.hbs`, `c/idea/plan-box.hbs`, `c/issue/link-issue-modal.hbs`, `c/user-profile/identities.hbs`, `c/workflow/canvas-node.hbs`, `c/workflow/step-form.hbs`
- Vendor: adminlte, bootstrap; states: none; breakpoints: none

```css
.list-unstyled { padding-left: 0; list-style: none; }   /* bootstrap */
.list-unstyled { list-style:none;margin:0;padding:0 }   /* adminlte */
```

#### `.margin-bottom`

- Key: `fc-utilities` (AdminLTE `.margin-bottom`)
- Source: hbs; 2 file(s): `t/app/project/wiki.hbs`, `t/app/project/wiki/index.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.margin-bottom { margin-bottom:20px }   /* adminlte */
```

#### `.no-padding`

- Key: `fc-utilities`
- Source: hbs/hbs-literal; 37 file(s): `c/agent/workflows.hbs`, `c/app-ui/box.hbs`, `c/app-ui/skeleton/calendar.hbs`, `c/app-ui/skeleton/issue-detail.hbs`, `c/app-ui/skeleton/kanban-board.hbs`, `c/app-ui/skeleton/project-dashboard.hbs`, `c/app-ui/skeleton/user-management.hbs`, `c/app-ui/table.hbs`, `c/developer/event-log.hbs`, `c/idea/created-issues-box.hbs`, `c/issue/issue-details.hbs`, `c/issue/linked-issues.hbs`, `c/quick-list/index.hbs`, `c/workflow/flow-canvas.hbs`, `c/workflow/node-palette.hbs`, `c/workflow/runs-box.hbs`, `t/app/agent/index.hbs`, `t/app/agent/page.hbs`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`, `t/app/project/calendar.hbs`, `t/app/project/index.hbs`, `t/app/project/issue/create.hbs`, `t/app/project/issue/index.hbs`, `t/app/project/wiki/page.hbs`, `t/app/projects/create.hbs`, `t/app/projects/index.hbs`, `t/app/role/page.hbs`, `t/app/settings/issue-statuses.hbs`, `t/app/settings/issue-types.hbs`, `t/app/settings/services.hbs`, `t/app/user/create.hbs`, `t/app/user/management.hbs`, `t/app/workflow/index.hbs`, `t/app/workspace/index.hbs`, `t/app/workspace/settings/projects.hbs`, `t/auth-status.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.no-padding { padding:0 !important }   /* adminlte */
```

#### `.pull-left`

- Key: `fc-utilities`
- Source: hbs; 3 file(s): `c/app-layouts/application-header.hbs`, `c/app-ui/modal.hbs`, `t/app/module.hbs`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.pull-left { float: left !important; }   /* bootstrap */
```

#### `.pull-right`

- Key: `fc-utilities`
- Source: hbs; 58 file(s): `c/app-layouts/application-footer.hbs`, `c/app-layouts/application-header.hbs`, `c/app-ui/box.hbs`, `c/app-ui/list-toolbar.hbs`, `c/app-ui/navbar-items.hbs`, `c/app-ui/skeleton/wiki-article.hbs`, `c/app-ui/table.hbs`, `c/app-ui/tabs.hbs`, `c/conversation-ui/comment-frame.hbs`, `c/conversation-ui/message-box.hbs`, `c/developer/component-nav.hbs`, `c/developer/docs.hbs`, `c/developer/entry-header.hbs`, `c/developer/entry.hbs`, `c/developer/event-log.hbs`, `c/ez-search-compact/index.hbs`, `c/ez-search/group.hbs`, `c/ez-search/index.hbs`, `c/form-fields/field-text.hbs`, `c/idea/conversation-box.hbs`, `c/idea/created-issues-box.hbs`, `c/idea/plan-box.hbs`, `c/issue/issue-details.hbs`, `c/issue/issue-planning.hbs`, `c/issue/linked-issues.hbs`, `c/project/milestones.hbs`, `c/quick-list/header.hbs`, `c/related-fields/relate-user.hbs`, `c/tags/rename-panel.hbs`, `c/user-profile/identities.hbs`, `c/user-profile/qualification.hbs`, `c/user-profile/skills.hbs`, `c/widgets/weekly-conversations.hbs`, `c/workflow/canvas-node.hbs`, `c/workflow/case-list.hbs`, `c/workflow/condition-list.hbs`, `c/workflow/flow-canvas.hbs`, `c/workflow/header-box.hbs`, `c/workflow/properties-box.hbs`, `c/workflow/runs-box.hbs`, `c/workflow/test-run-box.hbs`, `t/app/agent/page.hbs`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`, `t/app/project/idea.hbs`, `t/app/project/index.hbs`, `t/app/project/issue/index.hbs`, `t/app/project/wiki/edit.hbs`, `t/app/project/wiki/page.hbs`, `t/app/projects/index.hbs`, `t/app/role/page.hbs`, `t/app/settings/issue-statuses.hbs`, `t/app/settings/issue-types.hbs`, `t/app/settings/services.hbs`, `t/app/user/management.hbs`, `t/app/workspace/index.hbs`, `t/app/workspace/settings/agents.hbs`, `t/auth-status.hbs`
- Vendor: adminlte, bootstrap; states: .active, after, before, first-of-type; breakpoints: @media (min-width:768px)

```css
blockquote.pull-right { padding-right: 15px; padding-left: 0; text-align: right; border-right: 5px solid #eeeeee; border-left: 0; }   /* bootstrap */
blockquote.pull-right footer:before, blockquote.pull-right small:before, blockquote.pull-right .small:before { content: ""; }   /* bootstrap */
blockquote.pull-right footer:after, blockquote.pull-right small:after, blockquote.pull-right .small:after { content: " —"; }   /* bootstrap */
.dropdown-menu.pull-right { right: 0; left: auto; }   /* bootstrap */
.pull-right > .dropdown-menu { right: 0; left: auto; }   /* bootstrap */
.pull-right { float: right !important; }   /* bootstrap */
@media (min-width:768px) { .sidebar-mini.sidebar-collapse .sidebar-menu>li>a>.pull-right { display:none !important;-webkit-transform:translateZ(0) } }   /* adminlte */
.box-header>.box-tools.pull-right .dropdown-menu { right:0;left:auto }   /* adminlte */
.nav-tabs-custom>.nav-tabs.pull-right { float:none !important }   /* adminlte */
.nav-tabs-custom>.nav-tabs.pull-right>li { float:right }   /* adminlte */
.nav-tabs-custom>.nav-tabs.pull-right>li:first-of-type { margin-right:0 }   /* adminlte */
.nav-tabs-custom>.nav-tabs.pull-right>li:first-of-type>a { border-left-width:1px }   /* adminlte */
.nav-tabs-custom>.nav-tabs.pull-right>li:first-of-type.active>a { border-left-color:#f4f4f4;border-right-color:transparent }   /* adminlte */
```

#### `.show`

- Key: `fc-utilities`
- Source: hbs/js/js-template; 5 file(s): `c/app-layouts/application-header.hbs`, `c/app-ui/dropdown.hbs`, `c/app-ui/dropdown.js`, `c/app-ui/toolbar.hbs`, `c/developer/demos/dropdown.js`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.show { display: block !important; }   /* bootstrap */
```

#### `.small`

- Key: `fc-utilities`
- Source: hbs; 5 file(s): `c/issue/link-issue-modal.hbs`, `c/issue/linked-issues.hbs`, `t/app/agent/page.hbs`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`
- Vendor: bootstrap; states: after, before; breakpoints: none

```css
h1 .small, h2 .small, h3 .small, h4 .small, h5 .small, h6 .small { font-weight: 400; line-height: 1; color: #777777; }   /* bootstrap */
h1 .small, h2 .small, h3 .small { font-size: 65%; }   /* bootstrap */
h4 .small, h5 .small, h6 .small { font-size: 75%; }   /* bootstrap */
.small { font-size: 85%; }   /* bootstrap */
blockquote .small { display: block; font-size: 80%; line-height: 1.428571429; color: #777777; }   /* bootstrap */
blockquote .small:before { content: "— "; }   /* bootstrap */
blockquote.pull-right .small:before { content: ""; }   /* bootstrap */
blockquote.pull-right .small:after { content: " —"; }   /* bootstrap */
```

#### `.text-aqua`

- Key: `fc-utilities`
- Source: js; 1 file(s): `app/utils/metadata/metadata.js`
- Vendor: adminlte; states: none; breakpoints: none

```css
.text-aqua { color:#00c0ef !important }   /* adminlte */
```

#### `.text-bold`

- Key: `fc-utilities` (AdminLTE `.text-bold`)
- Source: hbs; 2 file(s): `c/app-ui/gantt-chart/bar-tooltip.hbs`, `c/app-ui/gantt-chart/selection-bar.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.text-bold, .text-bold.table td, .text-bold.table th { font-weight:700 }   /* adminlte */
```

#### `.text-center`

- Key: `fc-utilities`
- Source: hbs; 23 file(s): `c/agent/workflows.hbs`, `c/idea/conversation-box.hbs`, `c/idea/created-issues-box.hbs`, `c/idea/message-item.hbs`, `c/idea/message-screen.hbs`, `c/idea/plan-box.hbs`, `c/issue/file-preview.hbs`, `c/issue/issue-details.hbs`, `c/issue/issue-planning.hbs`, `c/issue/linked-issues.hbs`, `c/workflow/properties-box.hbs`, `c/workflow/run-steps-box.hbs`, `c/workflow/runs-box.hbs`, `t/app/agent/page.hbs`, `t/app/index.hbs`, `t/app/project/idea.hbs`, `t/app/project/index.hbs`, `t/app/role/index.hbs`, `t/app/role/page.hbs`, `t/app/settings/services.hbs`, `t/app/workspace/index.hbs`, `t/reset-password.hbs`, `t/signin.hbs`
- Vendor: adminlte, bootstrap; states: none; breakpoints: none

```css
.text-center { text-align: center; }   /* bootstrap */
table.text-center, table.text-center td, table.text-center th { text-align:center }   /* adminlte */
```

#### `.text-danger`

- Key: `fc-utilities`
- Source: hbs; 7 file(s): `c/app-ui/gantt-chart/task-row.hbs`, `c/conversation/thread-comments.hbs`, `c/conversation/vote-body.hbs`, `c/developer/demos/icon.hbs`, `c/developer/docs.hbs`, `c/issue/issue-tags.hbs`, `c/issue/linked-issues.hbs`
- Vendor: bootstrap; states: focus, hover; breakpoints: none

```css
.text-danger { color: #a94442; }   /* bootstrap */
a.text-danger:hover, a.text-danger:focus { color: #843534; }   /* bootstrap */
```

#### `.text-green`

- Key: `fc-utilities`
- Source: hbs/hbs-literal; 3 file(s): `t/app/settings/issue-statuses.hbs`, `t/app/workspace/index.hbs`, `t/app/workspace/settings/environment.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.text-green { color:#00a65a !important }   /* adminlte */
```

#### `.text-info`

- Key: `fc-utilities`
- Source: hbs; 1 file(s): `c/issue/issue-planning.hbs`
- Vendor: bootstrap; states: focus, hover; breakpoints: none

```css
.text-info { color: #31708f; }   /* bootstrap */
a.text-info:hover, a.text-info:focus { color: #245269; }   /* bootstrap */
```

#### `.text-muted`

- Key: `fc-utilities`
- Source: hbs/hbs-literal; 71 file(s): `c/agent/credentials.hbs`, `c/agent/user-tag.hbs`, `c/agent/workflows.hbs`, `c/app-layouts/application-header.hbs`, `c/app-ui/data-table.hbs`, `c/app-ui/gantt-chart.hbs`, `c/app-ui/gantt-chart/bar-tooltip.hbs`, `c/app-ui/gantt-chart/edit-sheet.hbs`, `c/app-ui/gantt-chart/gantt-row.hbs`, `c/app-ui/gantt-chart/ghost-section.hbs`, `c/app-ui/gantt-chart/issue-list.hbs`, `c/app-ui/gantt-chart/selection-bar.hbs`, `c/app-ui/gantt-chart/task-row.hbs`, `c/app-ui/inline-editable.hbs`, `c/app-ui/list-toolbar.hbs`, `c/conversation-ui/comment-frame.hbs`, `c/conversation/activity-box.hbs`, `c/conversation/linked-issue-box.hbs`, `c/conversation/result-box.hbs`, `c/conversation/tags-box.hbs`, `c/conversation/thread-box.hbs`, `c/conversation/vote-body.hbs`, `c/developer/component-nav.hbs`, `c/developer/demos/modal.hbs`, `c/developer/demos/status-label.hbs`, `c/developer/demos/tabs.hbs`, `c/developer/demos/tag.hbs`, `c/developer/event-log.hbs`, `c/ez-search/condition.hbs`, `c/idea/composer.hbs`, `c/idea/conversation-box.hbs`, `c/idea/created-issues-box.hbs`, `c/idea/message-item.hbs`, `c/idea/message-screen.hbs`, `c/idea/plan-box.hbs`, `c/issue/issue-tags.hbs`, `c/issue/link-issue-modal.hbs`, `c/issue/linked-issues.hbs`, `c/related-fields/relate-user.hbs`, `c/tags/edit-modal.hbs`, `c/tags/rename-panel.hbs`, `c/user-profile/identities.hbs`, `c/user-profile/qualification.hbs`, `c/user-profile/skills.hbs`, `c/widgets/weekly-conversations.hbs`, `c/workflow/canvas-node.hbs`, `c/workflow/flow-canvas.hbs`, `c/workflow/properties-box.hbs`, `c/workflow/run-steps-box.hbs`, `c/workflow/runs-box.hbs`, `c/workflow/step-form.hbs`, `c/workflow/test-run-box.hbs`, `c/workspace/add-project-dialog.hbs`, `c/workspace/invite-member-dialog.hbs`, `c/workspace/move-project-out-dialog.hbs`, `c/workspace/remove-member-dialog.hbs`, `t/app/agent/page.hbs`, `t/app/agent/skills.hbs`, `t/app/agent/tools.hbs`, `t/app/project/conversation/index.hbs`, `t/app/project/idea/index.hbs`, `t/app/projects/index.hbs`, `t/app/role/index.hbs`, `t/app/role/page.hbs`, `t/app/settings/issue-statuses.hbs`, `t/app/settings/issue-types.hbs`, `t/app/settings/services.hbs`, `t/app/workspace/index.hbs`, `t/app/workspace/settings/delete.hbs`, `t/app/workspace/settings/environment.hbs`, `t/app/workspace/settings/projects.hbs`
- Vendor: adminlte, bootstrap; states: none; breakpoints: none

```css
.text-muted { color: #777777; }   /* bootstrap */
.box-comments .text-muted { font-weight:400;font-size:12px }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li>a.text-muted { color:#999 }   /* adminlte */
```

#### `.text-red`

- Key: `fc-utilities`
- Source: hbs/hbs-literal/js; 30 file(s): `c/agent/credentials.hbs`, `c/app-ui/editor.hbs`, `c/app-ui/gantt-chart/bar-tooltip.hbs`, `c/app-ui/gantt-chart/edit-sheet.hbs`, `c/app-ui/gantt-chart/selection-bar.hbs`, `c/app-ui/toast-ui.hbs`, `c/conversation-ui/pending-comment.hbs`, `c/errors/500.hbs`, `c/ez-search-compact/index.hbs`, `c/ez-search/condition.hbs`, `c/ez-search/index.hbs`, `c/ez-search/search-bar.hbs`, `c/form-fields/field-date.hbs`, `c/form-fields/field-day-month.hbs`, `c/form-fields/field-multi-select.hbs`, `c/form-fields/field-relate-multi.hbs`, `c/form-fields/field-relate.hbs`, `c/form-fields/field-text-area.hbs`, `c/form-fields/field-text.hbs`, `c/form-fields/validation-messages/failure.hbs`, `c/idea/composer.hbs`, `c/idea/message-item.hbs`, `c/issue/link-issue-modal.hbs`, `c/issue/linked-issues.hbs`, `c/tags/rename-panel.hbs`, `c/workflow/canvas-node.hbs`, `c/workflow/run-steps-box.hbs`, `c/workflow/step-form.hbs`, `t/app/agent/tools.hbs`, `app/utils/metadata/metadata.js`
- Vendor: adminlte; states: none; breakpoints: none

```css
.text-red { color:#dd4b39 !important }   /* adminlte */
```

#### `.text-right`

- Key: `fc-utilities`
- Source: hbs; 8 file(s): `c/ez-search/condition.hbs`, `c/ez-search/index.hbs`, `t/app/agent/tools.hbs`, `t/app/settings/issue-statuses.hbs`, `t/app/settings/issue-types.hbs`, `t/app/settings/services.hbs`, `t/app/workspace/index.hbs`, `t/signin.hbs`
- Vendor: bootstrap; states: none; breakpoints: none

```css
.text-right { text-align: right; }   /* bootstrap */
```

#### `.text-success`

- Key: `fc-utilities`
- Source: hbs; 2 file(s): `c/app-ui/inline-editable.hbs`, `c/form-fields/validation-messages/success.hbs`
- Vendor: bootstrap; states: focus, hover; breakpoints: none

```css
.text-success { color: #3c763d; }   /* bootstrap */
a.text-success:hover, a.text-success:focus { color: #2b542c; }   /* bootstrap */
```

#### `.text-teal`

- Key: `fc-utilities`
- Source: js; 1 file(s): `app/utils/metadata/metadata.js`
- Vendor: adminlte; states: none; breakpoints: none

```css
.text-teal { color:#39cccc !important }   /* adminlte */
```

#### `.text-warning`

- Key: `fc-utilities`
- Source: hbs; 2 file(s): `c/errors/403.hbs`, `c/errors/404.hbs`
- Vendor: bootstrap; states: focus, hover; breakpoints: none

```css
.text-warning { color: #8a6d3b; }   /* bootstrap */
a.text-warning:hover, a.text-warning:focus { color: #66512c; }   /* bootstrap */
```

#### `.text-yellow`

- Key: `fc-utilities`
- Source: hbs; 2 file(s): `c/errors/403.hbs`, `c/errors/404.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.text-yellow { color:#f39c12 !important }   /* adminlte */
```

#### `.uppercase`

- Key: `fc-utilities`
- Source: hbs; 2 file(s): `t/app/project/index.hbs`, `t/app/role/page.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.btn.uppercase { text-transform:uppercase }   /* adminlte */
```


### `fc-widgets`

#### `.box-comment`

- Key: `fc-widgets`
- Source: hbs; 2 file(s): `c/conversation-ui/comment-frame.hbs`, `c/widgets/weekly-conversations.hbs`
- Vendor: adminlte; states: after, before, first-of-type, last-of-type; breakpoints: none

```css
.box-comments .box-comment { padding:8px 0;border-bottom:1px solid #eee }   /* adminlte */
.box-comments .box-comment:before, .box-comments .box-comment:after { content:" ";display:table }   /* adminlte */
.box-comments .box-comment:after { clear:both }   /* adminlte */
.box-comments .box-comment:last-of-type { border-bottom:0 }   /* adminlte */
.box-comments .box-comment:first-of-type { padding-top:0 }   /* adminlte */
.box-comments .box-comment img { float:left }   /* adminlte */
.box-comments .box-comment img { float:left }   /* adminlte */
.box-comments .box-comment img { width:30px !important;height:30px !important }   /* adminlte */
```

#### `.box-comments`

- Key: `fc-widgets`
- Source: hbs; 5 file(s): `c/app-ui/skeleton/issue-detail.hbs`, `c/conversation/thread-comments.hbs`, `c/idea/conversation-box.hbs`, `c/issue/issue-details.hbs`, `c/widgets/weekly-conversations.hbs`
- Vendor: adminlte; states: after, before, first-of-type, last-of-type; breakpoints: none

```css
.box-comments { background:#f7f7f7 }   /* adminlte */
.box-comments .box-comment { padding:8px 0;border-bottom:1px solid #eee }   /* adminlte */
.box-comments .box-comment:before, .box-comments .box-comment:after { content:" ";display:table }   /* adminlte */
.box-comments .box-comment:after { clear:both }   /* adminlte */
.box-comments .box-comment:last-of-type { border-bottom:0 }   /* adminlte */
.box-comments .box-comment:first-of-type { padding-top:0 }   /* adminlte */
.box-comments .box-comment img { float:left }   /* adminlte */
.box-comments .comment-text { margin-left:40px;color:#555 }   /* adminlte */
.box-comments .username { color:#444;display:block;font-weight:600 }   /* adminlte */
.box-comments .text-muted { font-weight:400;font-size:12px }   /* adminlte */
.box-comments .box-comment img { float:left }   /* adminlte */
.box-comments .box-comment img { width:30px !important;height:30px !important }   /* adminlte */
```

#### `.comment-text`

- Key: `fc-widgets`
- Source: hbs; 2 file(s): `c/conversation-ui/comment-frame.hbs`, `c/widgets/weekly-conversations.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.box-comments .comment-text { margin-left:40px;color:#555 }   /* adminlte */
```

#### `.description`

- Key: `fc-widgets`
- Source: hbs/js; 4 file(s): `c/exceptions/nothing-found.hbs`, `c/user-profile/latest-projects.hbs`, `app/locales/en-us/translations.js`, `t/app/project/index.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.user-block .description { display:block;margin-left:50px }   /* adminlte */
.user-block .description { color:#999;font-size:13px }   /* adminlte */
```

#### `.error-content`

- Key: `fc-widgets`
- Source: hbs; 3 file(s): `c/errors/403.hbs`, `c/errors/404.hbs`, `c/errors/500.hbs`
- Vendor: adminlte; states: none; breakpoints: @media (max-width:991px)

```css
.error-page>.error-content { margin-left:190px;display:block }   /* adminlte */
@media (max-width:991px) { .error-page>.error-content { margin-left:0 } }   /* adminlte */
.error-page>.error-content>h3 { font-weight:300;font-size:25px }   /* adminlte */
@media (max-width:991px) { .error-page>.error-content>h3 { text-align:center } }   /* adminlte */
```

#### `.error-page`

- Key: `fc-widgets`
- Source: hbs; 3 file(s): `c/errors/403.hbs`, `c/errors/404.hbs`, `c/errors/500.hbs`
- Vendor: adminlte; states: none; breakpoints: @media (max-width:991px)

```css
.error-page { width:600px;margin:20px auto 0 auto }   /* adminlte */
@media (max-width:991px) { .error-page { width:100% } }   /* adminlte */
.error-page>.headline { float:left;font-size:100px;font-weight:300 }   /* adminlte */
@media (max-width:991px) { .error-page>.headline { float:none;text-align:center } }   /* adminlte */
.error-page>.error-content { margin-left:190px;display:block }   /* adminlte */
@media (max-width:991px) { .error-page>.error-content { margin-left:0 } }   /* adminlte */
.error-page>.error-content>h3 { font-weight:300;font-size:25px }   /* adminlte */
@media (max-width:991px) { .error-page>.error-content>h3 { text-align:center } }   /* adminlte */
```

#### `.headline`

- Key: `fc-widgets`
- Source: hbs; 3 file(s): `c/errors/403.hbs`, `c/errors/404.hbs`, `c/errors/500.hbs`
- Vendor: adminlte; states: none; breakpoints: @media (max-width:991px)

```css
.error-page>.headline { float:left;font-size:100px;font-weight:300 }   /* adminlte */
@media (max-width:991px) { .error-page>.headline { float:none;text-align:center } }   /* adminlte */
```

#### `.image`

- Key: `fc-widgets` (AdminLTE `.user-panel > .image`)
- Source: js; 1 file(s): `c/developer/demos/avatar.js`
- Vendor: ; states: none; breakpoints: none

```css
```

#### `.item`

- Key: `fc-widgets` (`.products-list > .item`; `.carousel .item` not in use)
- Source: hbs/js; 4 file(s): `c/developer/demos/dropdown.js`, `c/issue/issue-details.hbs`, `app/modifiers/initialize-sortable.js`, `app/modifiers/lock-item.js`
- Vendor: adminlte; states: after, before, last-of-type; breakpoints: none

```css
.products-list>.item { border-radius:3px;-webkit-box-shadow:0 1px 1px rgba(0,0,0,0.1);box-shadow:0 1px 1px rgba(0,0,0,0.1);padding:10px 0;background:#fff }   /* adminlte */
.products-list>.item:before, .products-list>.item:after { content:" ";display:table }   /* adminlte */
.products-list>.item:after { clear:both }   /* adminlte */
.product-list-in-box>.item { -webkit-box-shadow:none;box-shadow:none;border-radius:0;border-bottom:1px solid #f4f4f4 }   /* adminlte */
.product-list-in-box>.item:last-of-type { border-bottom-width:0 }   /* adminlte */
```

#### `.login-box`

- Key: `fc-widgets`
- Source: hbs; 2 file(s): `t/reset-password.hbs`, `t/signin.hbs`
- Vendor: adminlte; states: none; breakpoints: @media (max-width:768px)

```css
.login-box { width:360px;margin:7% auto }   /* adminlte */
@media (max-width:768px) { .login-box { width:90%;margin-top:20px } }   /* adminlte */
```

#### `.login-box-body`

- Key: `fc-widgets`
- Source: hbs; 2 file(s): `t/reset-password.hbs`, `t/signin.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.login-box-body { background:#fff;padding:20px;border-top:0;color:#666 }   /* adminlte */
.login-box-body .form-control-feedback { color:#777 }   /* adminlte */
```

#### `.login-box-msg`

- Key: `fc-widgets`
- Source: hbs; 1 file(s): `t/signin.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.login-box-msg { margin:0;text-align:center;padding:0 20px 20px 20px }   /* adminlte */
```

#### `.login-logo`

- Key: `fc-widgets`
- Source: hbs; 2 file(s): `t/reset-password.hbs`, `t/signin.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.login-logo { font-size:35px;text-align:center;margin-bottom:25px;font-weight:300 }   /* adminlte */
.login-logo a { color:#444 }   /* adminlte */
```

#### `.name`

- Key: `fc-widgets` (`.users-list-name`-adjacent; `.direct-chat-name` not in use)
- Source: js; 3 file(s): `c/developer/demos/avatar.js`, `c/developer/demos/dropdown.js`, `app/locales/en-us/translations.js`
- Vendor: ; states: none; breakpoints: none

```css
```

#### `.product-list-in-box`

- Key: `fc-widgets`
- Source: hbs; 1 file(s): `c/issue/issue-details.hbs`
- Vendor: adminlte; states: last-of-type; breakpoints: none

```css
.product-list-in-box>.item { -webkit-box-shadow:none;box-shadow:none;border-radius:0;border-bottom:1px solid #f4f4f4 }   /* adminlte */
.product-list-in-box>.item:last-of-type { border-bottom-width:0 }   /* adminlte */
```

#### `.products-list`

- Key: `fc-widgets`
- Source: hbs; 1 file(s): `c/issue/issue-details.hbs`
- Vendor: adminlte; states: after, before; breakpoints: none

```css
.products-list { list-style:none;margin:0;padding:0 }   /* adminlte */
.products-list>.item { border-radius:3px;-webkit-box-shadow:0 1px 1px rgba(0,0,0,0.1);box-shadow:0 1px 1px rgba(0,0,0,0.1);padding:10px 0;background:#fff }   /* adminlte */
.products-list>.item:before, .products-list>.item:after { content:" ";display:table }   /* adminlte */
.products-list>.item:after { clear:both }   /* adminlte */
```

#### `.time`

- Key: `fc-widgets`
- Source: hbs/js; 20 file(s): `c/activity-blocks/index.hbs`, `c/activity-blocks/issue/closed.hbs`, `c/activity-blocks/issue/created.hbs`, `c/activity-blocks/issue/deleted.hbs`, `c/activity-blocks/issue/mentioned.hbs`, `c/activity-blocks/issue/updated.hbs`, `c/activity-blocks/project/closed.hbs`, `c/activity-blocks/project/created.hbs`, `c/activity-blocks/project/deleted.hbs`, `c/activity-blocks/project/updated.hbs`, `c/activity-blocks/related-attached.hbs`, `c/activity-blocks/related-completed.hbs`, `c/activity-blocks/related-created.hbs`, `c/activity-blocks/related-deleted.hbs`, `c/activity-blocks/related-overdue.hbs`, `c/activity-blocks/related-updated.hbs`, `c/app-ui/gantt-chart/bar-tooltip.js`, `app/locales/en-us/translations.js`, `app/utils/data/modeltotree.js`, `app/utils/developer/component-registry.js`
- Vendor: adminlte; states: none; breakpoints: none

```css
.timeline>li>.timeline-item>.time { color:#999;float:right;padding:10px;font-size:12px }   /* adminlte */
```

#### `.time-label`

- Key: `fc-widgets`
- Source: hbs; 1 file(s): `c/app-ui/timeline.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.timeline>.time-label>span { font-weight:600;padding:5px;display:inline-block;background-color:#fff;border-radius:4px }   /* adminlte */
```

#### `.timeline`

- Key: `fc-widgets`
- Source: hbs; 3 file(s): `c/app-ui/gantt-chart.hbs`, `c/app-ui/timeline.hbs`, `c/user-profile/recent-activities.hbs`
- Vendor: adminlte; states: after, before; breakpoints: none

```css
.timeline { position:relative;margin:0 0 30px 0;padding:0;list-style:none }   /* adminlte */
.timeline:before { content:'';position:absolute;top:0;bottom:0;width:4px;background:#ddd;left:31px;margin:0;border-radius:2px }   /* adminlte */
.timeline>li { position:relative;margin-right:10px;margin-bottom:15px }   /* adminlte */
.timeline>li:before, .timeline>li:after { content:" ";display:table }   /* adminlte */
.timeline>li:after { clear:both }   /* adminlte */
.timeline>li>.timeline-item { -webkit-box-shadow:0 1px 1px rgba(0,0,0,0.1);box-shadow:0 1px 1px rgba(0,0,0,0.1);border-radius:3px;margin-top:0;background:#fff;color:#444;margin-left:60px;margin-right:15px;padding:0;position:relative }   /* adminlte */
.timeline>li>.timeline-item>.time { color:#999;float:right;padding:10px;font-size:12px }   /* adminlte */
.timeline>li>.timeline-item>.timeline-header { margin:0;color:#555;border-bottom:1px solid #f4f4f4;padding:10px;font-size:16px;line-height:1.1 }   /* adminlte */
.timeline>li>.timeline-item>.timeline-header>a { font-weight:600 }   /* adminlte */
.timeline>li>.timeline-item>.timeline-body { padding:10px }   /* adminlte */
.timeline>li>.fa, .timeline>li>.glyphicon, .timeline>li>.ion { width:30px;height:30px;font-size:15px;line-height:30px;position:absolute;color:#666;background:#d2d6de;border-radius:50%;text-align:center;left:18px;top:0 }   /* adminlte */
.timeline>.time-label>span { font-weight:600;padding:5px;display:inline-block;background-color:#fff;border-radius:4px }   /* adminlte */
```

#### `.timeline-body`

- Key: `fc-widgets`
- Source: hbs; 16 file(s): `c/activity-blocks/index.hbs`, `c/activity-blocks/issue/closed.hbs`, `c/activity-blocks/issue/created.hbs`, `c/activity-blocks/issue/deleted.hbs`, `c/activity-blocks/issue/mentioned.hbs`, `c/activity-blocks/issue/updated.hbs`, `c/activity-blocks/project/closed.hbs`, `c/activity-blocks/project/created.hbs`, `c/activity-blocks/project/deleted.hbs`, `c/activity-blocks/project/updated.hbs`, `c/activity-blocks/related-attached.hbs`, `c/activity-blocks/related-completed.hbs`, `c/activity-blocks/related-created.hbs`, `c/activity-blocks/related-deleted.hbs`, `c/activity-blocks/related-overdue.hbs`, `c/activity-blocks/related-updated.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.timeline>li>.timeline-item>.timeline-body { padding:10px }   /* adminlte */
```

#### `.timeline-header`

- Key: `fc-widgets`
- Source: hbs; 16 file(s): `c/activity-blocks/index.hbs`, `c/activity-blocks/issue/closed.hbs`, `c/activity-blocks/issue/created.hbs`, `c/activity-blocks/issue/deleted.hbs`, `c/activity-blocks/issue/mentioned.hbs`, `c/activity-blocks/issue/updated.hbs`, `c/activity-blocks/project/closed.hbs`, `c/activity-blocks/project/created.hbs`, `c/activity-blocks/project/deleted.hbs`, `c/activity-blocks/project/updated.hbs`, `c/activity-blocks/related-attached.hbs`, `c/activity-blocks/related-completed.hbs`, `c/activity-blocks/related-created.hbs`, `c/activity-blocks/related-deleted.hbs`, `c/activity-blocks/related-overdue.hbs`, `c/activity-blocks/related-updated.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.timeline>li>.timeline-item>.timeline-header { margin:0;color:#555;border-bottom:1px solid #f4f4f4;padding:10px;font-size:16px;line-height:1.1 }   /* adminlte */
.timeline>li>.timeline-item>.timeline-header>a { font-weight:600 }   /* adminlte */
```

#### `.timeline-item`

- Key: `fc-widgets`
- Source: hbs; 16 file(s): `c/activity-blocks/index.hbs`, `c/activity-blocks/issue/closed.hbs`, `c/activity-blocks/issue/created.hbs`, `c/activity-blocks/issue/deleted.hbs`, `c/activity-blocks/issue/mentioned.hbs`, `c/activity-blocks/issue/updated.hbs`, `c/activity-blocks/project/closed.hbs`, `c/activity-blocks/project/created.hbs`, `c/activity-blocks/project/deleted.hbs`, `c/activity-blocks/project/updated.hbs`, `c/activity-blocks/related-attached.hbs`, `c/activity-blocks/related-completed.hbs`, `c/activity-blocks/related-created.hbs`, `c/activity-blocks/related-deleted.hbs`, `c/activity-blocks/related-overdue.hbs`, `c/activity-blocks/related-updated.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.timeline>li>.timeline-item { -webkit-box-shadow:0 1px 1px rgba(0,0,0,0.1);box-shadow:0 1px 1px rgba(0,0,0,0.1);border-radius:3px;margin-top:0;background:#fff;color:#444;margin-left:60px;margin-right:15px;padding:0;position:relative }   /* adminlte */
.timeline>li>.timeline-item>.time { color:#999;float:right;padding:10px;font-size:12px }   /* adminlte */
.timeline>li>.timeline-item>.timeline-header { margin:0;color:#555;border-bottom:1px solid #f4f4f4;padding:10px;font-size:16px;line-height:1.1 }   /* adminlte */
.timeline>li>.timeline-item>.timeline-header>a { font-weight:600 }   /* adminlte */
.timeline>li>.timeline-item>.timeline-body { padding:10px }   /* adminlte */
```

#### `.user-block`

- Key: `fc-widgets`
- Source: hbs; 1 file(s): `t/app/project/index.hbs`
- Vendor: adminlte; states: after, before; breakpoints: none

```css
.user-block:before, .user-block:after { content:" ";display:table }   /* adminlte */
.user-block:after { clear:both }   /* adminlte */
.user-block img { width:40px;height:40px;float:left }   /* adminlte */
.user-block .username, .user-block .description { display:block;margin-left:50px }   /* adminlte */
.user-block .username { font-size:16px;font-weight:600 }   /* adminlte */
.user-block .description { color:#999;font-size:13px }   /* adminlte */
```

#### `.username`

- Key: `fc-widgets`
- Source: hbs/js; 5 file(s): `c/conversation-ui/comment-frame.hbs`, `c/related-fields/relate-actor.hbs`, `c/related-fields/relate-user.hbs`, `c/widgets/weekly-conversations.hbs`, `app/locales/en-us/translations.js`
- Vendor: adminlte; states: none; breakpoints: none

```css
.box-comments .username { color:#444;display:block;font-weight:600 }   /* adminlte */
.user-block .username { display:block;margin-left:50px }   /* adminlte */
.user-block .username { font-size:16px;font-weight:600 }   /* adminlte */
```

#### `.users-list`

- Key: `fc-widgets`
- Source: hbs; 4 file(s): `c/issue/issue-details.hbs`, `t/app/project/index.hbs`, `t/app/role/page.hbs`, `t/app/workspace/index.hbs`
- Vendor: adminlte; states: hover; breakpoints: none

```css
.users-list>li { width:25%;float:left;padding:10px;text-align:center }   /* adminlte */
.users-list>li img { border-radius:50%;max-width:100%;height:auto }   /* adminlte */
.users-list>li>a:hover, .users-list>li>a:hover .users-list-name { color:#999 }   /* adminlte */
.users-list { list-style:none;margin:0;padding:0 }   /* adminlte */
```

#### `.users-list-date`

- Key: `fc-widgets`
- Source: hbs; 3 file(s): `c/issue/issue-details.hbs`, `t/app/project/index.hbs`, `t/app/workspace/index.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.users-list-date { display:block }   /* adminlte */
.users-list-date { color:#999;font-size:12px }   /* adminlte */
```

#### `.users-list-name`

- Key: `fc-widgets`
- Source: hbs; 6 file(s): `c/app-ui/user-chip.hbs`, `c/issue/assignee-select.hbs`, `c/issue/issue-details.hbs`, `t/app/project/index.hbs`, `t/app/role/page.hbs`, `t/app/workspace/index.hbs`
- Vendor: adminlte; states: hover; breakpoints: none

```css
.users-list>li>a:hover .users-list-name { color:#999 }   /* adminlte */
.users-list-name { display:block }   /* adminlte */
.users-list-name { font-weight:600;color:#444;overflow:hidden;white-space:nowrap;text-overflow:ellipsis }   /* adminlte */
```


### `fc-third-party`

#### `.checkbox-primary`

- Key: `fc-third-party`
- Source: hbs; 1 file(s): `c/form-fields/field-checkbox.hbs`
- Vendor: abc; states: after, before, checked; breakpoints: none

```css
.checkbox-primary input[type=checkbox]:checked + label::before, .checkbox-primary input[type=radio]:checked + label::before { background-color: #337ab7; border-color: #337ab7; }   /* abc */
.checkbox-primary input[type=checkbox]:checked + label::after, .checkbox-primary input[type=radio]:checked + label::after { color: #fff; }   /* abc */
.checkbox-primary input[type=checkbox]:indeterminate + label::before, .checkbox-primary input[type=radio]:indeterminate + label::before { background-color: #337ab7; border-color: #337ab7; }   /* abc */
.checkbox-primary input[type=checkbox]:indeterminate + label::after, .checkbox-primary input[type=radio]:indeterminate + label::after { background-color: #fff; }   /* abc */
```

#### `.fa`

- Key: `fc-third-party`
- Source: hbs/js/js-template; 8 file(s): `c/app-ui/icon.js`, `c/app-ui/loader.js`, `c/conversation/tags-box.hbs`, `c/form-fields/field-text-area.hbs`, `c/form-fields/field-text.hbs`, `c/form-fields/label.hbs`, `c/idea/plan-box.hbs`, `c/issue/assignee-select.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.main-header .navbar .nav>li.user>a>.fa { margin-right:5px }   /* adminlte */
.content-header>.breadcrumb>li>a>.fa { margin-right:5px }   /* adminlte */
.sidebar-menu>li>a>.fa { width:20px }   /* adminlte */
.sidebar-menu .treeview-menu>li>a>.fa { width:20px }   /* adminlte */
.dropdown-menu>li>a>.fa { margin-right:10px }   /* adminlte */
.form-control-feedback.fa { line-height:34px }   /* adminlte */
.input-sm+.form-control-feedback.fa { line-height:30px }   /* adminlte */
.box .overlay>.fa { position:absolute;top:50%;left:50%;margin-left:-15px;margin-top:-15px;color:#000;font-size:30px }   /* adminlte */
.box-header>.fa { display:inline-block;font-size:18px;margin:0;line-height:1 }   /* adminlte */
.box-header>.fa { margin-right:5px }   /* adminlte */
.timeline>li>.fa { width:30px;height:30px;font-size:15px;line-height:30px;position:absolute;color:#666;background:#d2d6de;border-radius:50%;text-align:center;left:18px;top:0 }   /* adminlte */
.nav-pills>li>a>.fa { margin-right:5px }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li.header>.fa { margin-right:5px }   /* adminlte */
```

#### `.glyphicon`

- Key: `fc-third-party`
- Source: hbs; 1 file(s): `t/signin.hbs`
- Vendor: adminlte, bootstrap; states: none; breakpoints: none

```css
.glyphicon { position: relative; top: 1px; display: inline-block; font-family: "Glyphicons Halflings"; font-style: normal; font-weight: 400; line-height: 1; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }   /* bootstrap */
.main-header .navbar .nav>li.user>a>.glyphicon { margin-right:5px }   /* adminlte */
.content-header>.breadcrumb>li>a>.glyphicon { margin-right:5px }   /* adminlte */
.sidebar-menu>li>a>.glyphicon { width:20px }   /* adminlte */
.sidebar-menu .treeview-menu>li>a>.glyphicon { width:20px }   /* adminlte */
.dropdown-menu>li>a>.glyphicon { margin-right:10px }   /* adminlte */
.box-header>.glyphicon { display:inline-block;font-size:18px;margin:0;line-height:1 }   /* adminlte */
.box-header>.glyphicon { margin-right:5px }   /* adminlte */
.timeline>li>.glyphicon { width:30px;height:30px;font-size:15px;line-height:30px;position:absolute;color:#666;background:#d2d6de;border-radius:50%;text-align:center;left:18px;top:0 }   /* adminlte */
.nav-pills>li>a>.glyphicon { margin-right:5px }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li.header>.glyphicon { margin-right:5px }   /* adminlte */
```

#### `.glyphicon-envelope`

- Key: `fc-third-party`
- Source: hbs; 1 file(s): `t/signin.hbs`
- Vendor: bootstrap; states: before; breakpoints: none

```css
.glyphicon-envelope:before { content: "✉"; }   /* bootstrap */
```

#### `.glyphicon-lock`

- Key: `fc-third-party`
- Source: hbs; 1 file(s): `t/signin.hbs`
- Vendor: bootstrap; states: before; breakpoints: none

```css
.glyphicon-lock:before { content: "\e033"; }   /* bootstrap */
```

#### `.icheck`

- Key: `fc-third-party`
- Source: hbs; 1 file(s): `t/signin.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.icheck>label { padding-left:0 }   /* adminlte */
```

#### `.ion`

- Key: `fc-third-party`
- Source: hbs; 1 file(s): `t/app/project/index.hbs`
- Vendor: adminlte; states: none; breakpoints: none

```css
.main-header .navbar .nav>li.user>a>.ion { margin-right:5px }   /* adminlte */
.content-header>.breadcrumb>li>a>.ion { margin-right:5px }   /* adminlte */
.sidebar-menu>li>a>.ion { width:20px }   /* adminlte */
.sidebar-menu .treeview-menu>li>a>.ion { width:20px }   /* adminlte */
.dropdown-menu>li>a>.ion { margin-right:10px }   /* adminlte */
.box-header>.ion { display:inline-block;font-size:18px;margin:0;line-height:1 }   /* adminlte */
.box-header>.ion { margin-right:5px }   /* adminlte */
.timeline>li>.ion { width:30px;height:30px;font-size:15px;line-height:30px;position:absolute;color:#666;background:#d2d6de;border-radius:50%;text-align:center;left:18px;top:0 }   /* adminlte */
.nav-pills>li>a>.ion { margin-right:5px }   /* adminlte */
.nav-tabs-custom>.nav-tabs>li.header>.ion { margin-right:5px }   /* adminlte */
```
