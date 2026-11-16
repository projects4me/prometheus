# AppUi::DataTable

## Overview

AppUi::DataTable is the slim table of a list page: one header per column descriptor, one row per record, an optional check button per row and a row actions cell. It only displays what it is given; sorting and selection are reported out, and the caller keeps the sort, the order and the selection.

A column is a descriptor: key, label, and optionally sortable, sortKey, cell and class. A cell is drawn by the column's cell component when it names one, else by the cell block when the caller gives it, else it shows the record's value under the key.

Used in the Agents and Workflows lists. AppUi::Table (the older table with loading modes) stays for its current users; new list pages use this one.

## Look

- Selection: each row has the QuickList check button (fa-square-o, fa-check-square in the primary colour, aria-pressed) and a selected row gets the QuickList selected background (class data-table-row--selected). The header select-all is QuickList::SelectAll and shows none, some or all of the rows shown.
- Row actions: icon-only, grey, 14px and square, darker on hover, right-aligned with the same gap. The more-actions button is fa-ellipsis-v in the same style.

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

## Do and Avoid

### Do

- Share one `Selection` owned by the controller between the table and the toolbar; new list pages use @selection rather than @selectedIds.
- Build the descriptors in the controller with translated labels.
- Hand the select-all box to the selection block of AppUi::ListToolbar; the row check buttons carry `data-select` with the record id.
- Find the row check buttons by `data-test-data-table-select` and read `aria-pressed`.
- Find rows and cells in tests by `data-test-data-table-row` (the record id) and `data-test-data-table-cell` (the column key).

### Avoid

- Do not load data or keep the selection inside the table.
- Do not extend it with loading modes; show loading around it.
- Do not use it for narrow record lists; use QuickList.
