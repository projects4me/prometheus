# AppUi::DataTable

## Overview

AppUi::DataTable is the slim table of a list page: one header per column descriptor, one row per record, an optional check button per row and a row actions cell. It only displays what it is given; sorting and selection are reported out, and the caller keeps the sort, the order and the selection.

A column is a descriptor: key, label, and optionally sortable, sortKey, cell and class. A cell is drawn by the column's cell component when it names one, else by the cell block when the caller gives it, else it shows the record's value under the key.

Used in the Agents and Workflows lists. AppUi::Table (the older table with loading modes) stays for its current users; new list pages use this one.

## Look

- Selection: each row has the QuickList check button (fa-square-o, fa-check-square in the primary colour, aria-pressed) and a selected row gets the QuickList selected background (class data-table-row--selected). The header select-all is QuickList::SelectAll and shows none, some or all of the rows shown.
- Tree rows: the first cell is indented 16px per level below the top and starts with a caret button (fa-caret-right closed, fa-caret-down open, aria-expanded); a row that is loading its next level shows fa-spinner fa-spin in its place. Rows without children keep a blank space of the caret's width so names line up.
- Current row: the pinned row (class data-table-row--current) has the light #f9fafc background, bold text and a top and bottom border, with no caret and no row actions.
- Row actions: icon-only btn-box-tool look as in the Issue and Project lists (grey, icon 1.2rem set on the icon itself so global i rules cannot override it, square, primary colour on hover), right-aligned with the same gap. The more-actions button is fa-ellipsis-v in the same style.

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| @columns | Array | none | Column descriptors: key, label, sortable, sortKey, cell, class |
| @rows | Array | none | The records, one row each; each needs an id |
| @sort | String | none | The active sort key; its column shows asc or desc |
| @order | String | none | asc or desc |
| @selectable | Boolean | false | Adds a check button per row and the select-all button in the header |
| @selection | Selection | | The shared selection model (`utils/state/selection`); rows and the select-all box (rows shown) toggle through it, kept across pages. Replaces @selectedIds, @onSelect and @onSelectAll |
| @onSelectionChange | Function | | With @selection: called with the selected ids after a change |
| @selectedIds | Array | | Ids of the selected rows, kept by the owner; makes the check buttons controlled (when @selection is not given) |
| @onSelectAll | Function | | Select-all box toggled; called with (rows, checked) |
| @groupKey | Function | | (record) => group key; groups rows under collapsible headings |
| @groupLabel | Function | | (key) => translated group label |
| @depthKey | String | | Tree rows: the record field holding the row's level (1 = top); indents the first column |
| @isExpandable | Function | | Tree rows: (record) => whether the row has a caret |
| @expandedIds | Array | [] | Tree rows: ids of the open rows, kept by the owner |
| @loadingIds | Array | [] | Tree rows: ids of the rows loading their next level, kept by the owner; they show a spinner |
| @currentId | String | | Tree rows: the id of the pinned current row |
| @hideHeader | Boolean | false | Leaves out the header row |
| @hasMoreActions | Function | | (record) => whether the row shows the moreActions menu |
| @onToggle | Function | | Tree rows: a caret was clicked; called with the record |
| @onSort | Function | none | Called with the sort key of the column clicked |
| @onSelect | Function | none | Called with the row's id and whether it is now checked |

### Column descriptor

| Field | Meaning |
|---|---|
| key | The column's name, used by the test selectors; the record field shown when nothing else draws the cell |
| label | The translated header |
| sortable | Adds the sort button to the header |
| sortKey | The key reported by onSort and matched against @sort; defaults to key |
| cell | A component name that draws the cell, called with @record and @column |
| class | The class of the column's cells, for module styles |

### Tree rows

With @depthKey or @isExpandable the rows form a tree. The owner passes them already flattened and ordered: each open row followed by its children. A caret click calls @onToggle with the record; the owner marks the id in @loadingIds, loads the next level, inserts the rows and moves the id to @expandedIds (or removes the children and the id to close it). The table holds no data and does no loading.

With @groupKey in a tree, groups sit where their first row appears, and a row whose group key is null renders ungrouped at its position (for example the current row between two relation groups). Without the tree arguments null keys still form the None group.

## Blocks

- cell: draws the cells of the columns without a cell component; yields the record and the column. Branch on the column key.
- moreActions: extra row actions in an AppUi::Dropdown (aligned to the end) behind a fa-ellipsis-v button; yields the record. Put plain buttons or links in it.
- groupHeading: replaces a group heading label; yields the group.
- rowActions: the last cell of every row; yields the record. Use icon-only `btn btn-box-tool` buttons with a title and aria-label, and put AccessControl around each, as on the other list pages.
- empty: shown across the table when there are no rows; use Exceptions::NothingFound.

## Events

| Callback | Payload |
|---|---|
| onSort | The sort key of the column clicked |
| onSelect | The row's id and whether it is now checked (without @selection) |
| onSelectAll | The rows shown and whether they should all be selected (without @selection) |
| onSelectionChange | The selected ids, across pages (with @selection) |
| onToggle | The record of the tree row whose caret was clicked |

## Do and Avoid

### Do

- Share one `Selection` owned by the controller between the table and the toolbar; new list pages use @selection rather than @selectedIds.
- Build the descriptors in the controller with translated labels.
- Hand the select-all box to the selection block of AppUi::ListToolbar; the row check buttons carry `data-select` with the record id.
- Find the row check buttons by `data-test-data-table-select` and read `aria-pressed`.
- Find rows and cells in tests by `data-test-data-table-row` (the record id) and `data-test-data-table-cell` (the column key).
- Show per-row loading on tree rows through @loadingIds: it belongs to the row whose level is loading, not to a table loading mode.
- Find a tree row's caret by `data-test-data-table-toggle` and read `aria-expanded`.

### Avoid

- Do not load data, keep the selection or keep the tree's open rows inside the table.
- Do not extend it with loading modes; show loading around it.
- Do not use it for narrow record lists; use QuickList.
