# QuickList

## Overview

QuickList is a narrow list of records inside a box: a header with the title and count, an optional search block, one row per record, grouping, selection and paging, plus the loading, empty and error states. It only displays what it is given; the caller owns the queries, paging and search.

Used in the Ideas browser.

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| @title | String | none | The box title, already translated |
| @items | Array | none | The records to show, one row each |
| @total | Number | none | Optional record count; the header reads "shown of total" when it differs from the items shown |
| @hasNext | Boolean | false | Whether a next page exists; used when there is no total |
| @page | Number | 1 | The current page |
| @limit | Number | none | The page size |
| @activeId | String or Number | none | The open record; its row gets the active bar |
| @isLoading | Boolean | false | Shows skeleton rows instead of the items |
| @error | Any | none | A truthy value shows the error state |
| @selectable | Boolean | false | Adds a checkbox per row and the selection bar |
| @groupBy | String | empty | The key of the active group option |
| @groupOptions | Array | none | Group choices: key, label, groupKey, groupLabel |
| @sortOptions | Array | none | Sort choices: key, label |
| @sort | String | none | The active sort key |
| @order | String | none | asc or desc |
| @onPage | Function | none | Shows the pagination and handles a page change |
| @onSort | Function | none | Handles a sort change |
| @onGroup | Function | none | Handles a group change |
| @onRetry | Function | none | Shows the Try again button of the error state |
| @onClearSearch | Function | none | Shows the Clear the search button of the empty state |

## Blocks

- actions: header tools, in the box tools of the header.
- search: a slot under the header, for EzSearchCompact; rendered as is.
- item: one row per record; yields the record and the Item component, whose primary and secondary blocks hold the first and second line.
- group: replaces the label of a group heading; yields the group with key, label, items and count.
- selectionActions: the actions of the selection bar; yields the selected ids and a function that clears the selection.
- empty: replaces the default empty state.
- footer: rendered under the pagination, inside the box.

## Events

| Callback | Payload |
|---|---|
| onPage | The new page number |
| onSort | The sort key and the order |
| onGroup | The group key |
| onRetry | None |
| onClearSearch | None |
| onApply (search block) | The query string |
| selection actions | The selected ids |

## Do and Avoid

### Do

- Ask Gaia for limit + 1 records and pass hasNext: the list has a next page when the extra record came back. Gaia sends no totals.
- Keep the query, sort and page in the caller and pass them in.
- Use EzSearchCompact in the search block.

### Avoid

- Do not load data inside the list or ask for a total count.
- Do not build your own rows or empty states; use the item and empty blocks.
- Do not use it for wide, multi-column data; use a table.
