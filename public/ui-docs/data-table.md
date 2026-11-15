# AppUi::DataTable

## Overview

AppUi::DataTable is the slim table of a list page: one header per column descriptor, one row per record, an optional checkbox per row and a row actions cell. It only displays what it is given; sorting and selection are reported out, and the caller keeps the sort, the order and the selection.

A column is a descriptor: key, label, and optionally sortable, sortKey, cell and class. A cell is drawn by the column's cell component when it names one, else by the cell block when the caller gives it, else it shows the record's value under the key.

Used in the Agents and Workflows lists. AppUi::Table (the older table with loading modes) stays for its current users; new list pages use this one.

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| @columns | Array | none | Column descriptors: key, label, sortable, sortKey, cell, class |
| @rows | Array | none | The records, one row each; each needs an id |
| @sort | String | none | The active sort key; its column shows asc or desc |
| @order | String | none | asc or desc |
| @selectable | Boolean | false | Adds a checkbox per row |
| @selectedIds | Array | | Ids of the selected rows, kept by the owner; makes the checkboxes controlled |
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
- moreActions: extra row actions in a dropdown; yields the record.
- groupHeading: replaces a group heading label; yields the group.
- rowActions: the last cell of every row; yields the record. Put AccessControl around each button, as on the other list pages.
- empty: shown across the table when there are no rows; use Exceptions::NothingFound.

## Events

| Callback | Payload |
|---|---|
| onSort | The sort key of the column clicked |
| onSelect | The row's id and whether it is now checked |

## Do and Avoid

### Do

- Build the descriptors in the controller with translated labels.
- Hand the select-all checkbox to the selection block of AppUi::ListToolbar; the row checkboxes carry `data-select`, which the list controller's select-all reads.
- Find rows and cells in tests by `data-test-data-table-row` (the record id) and `data-test-data-table-cell` (the column key).

### Avoid

- Do not load data or keep the selection inside the table.
- Do not extend it with loading modes; show loading around it.
- Do not use it for narrow record lists; use QuickList.
