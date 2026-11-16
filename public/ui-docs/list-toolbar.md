# AppUi::ListToolbar

## Overview

AppUi::ListToolbar is the top of a list page box. The search and the page actions sit in the box header; under it, the controls row has the selection bar on the left and the pager on the right. With the list's `Selection` it draws the selection bar itself; the page supplies the search, the actions, the bulk buttons and the pager.

Used in the Agents and Workflows lists, inside the `box box-primary list-view` and above the box body with AppUi::DataTable.

## Arguments

- position: `top` (default) draws the header and the controls row; `bottom` draws only the controls row, with a top border, to close the list. A page can show a toolbar above the list, below it or both.
- selection: the `Selection` from `utils/state/selection.js`, the same instance given to AppUi::DataTable. With it, and `@rows`, the controls row shows the page select-all (none, some, all) and a muted hint while nothing is selected; while rows are selected it shows "N selected", "X on this page, Y on other pages", the bulk actions and a clear button. The selection is kept across pages.
- rows: the rows of the current page.

## Blocks

- search (`as |narrow|`): the search in the box header. EzSearch goes here, with `@narrow={{narrow}}`.
- actions (`as |narrow|`): page actions after the search, such as the create button, each inside AccessControl; show icon-only buttons when `narrow` is true.
- bulkActions (`as |ids clear|`): the bulk buttons inside the selection bar, with the selected ids and a function that clears the selection.
- selection: the left of the controls row when `@selection` is not given: the select-all checkbox and the bulk action buttons.
- pager: the right of the controls row: AppUi::Pager.

## Narrow mode

The toolbar measures its own width; below 600px `narrow` is true and is yielded to the search and actions blocks. The search flexes first and keeps a minimum width; the actions never push it below that and wrap under it when there is no room.

The header is drawn only with a search or actions block and never at the bottom, the pager slot only with a pager block.

## Events

- onSelectionChange: called with the selected ids after the select-all or the clear button changed the selection. The other controls report their own events.

## Do and Avoid

### Do

- Pass the same Selection to the toolbar and to AppUi::DataTable.
- Keep the bulk buttons as small default buttons in a btn-group, each with its ACL context.
- Put AppUi::Pager in the pager block.

### Avoid

- Do not put the pager in the box header.
- Do not put row actions here; they go in the rowActions block of AppUi::DataTable.
- Do not hand-roll a select-all or a selected count when you have a Selection.
