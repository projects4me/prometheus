# QuickList

## Overview

QuickList is a narrow list of records inside a box: a header with the title and count, an optional search block, one row per record, grouping, selection and paging, plus the loading, empty and error states. It only displays what it is given; the caller owns the queries, paging and search.

Used in the Roles, Ideas and Threads browsers. The page layout around it is in the design system ("List + detail page (QuickList)").

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| @title | String | none | The box title, already translated; with @embedded, the noun after the count ("11 Issues") |
| @embedded | Boolean | false | Renders the list flat inside a larger panel: no box frame and no header; the count moves to the start of the toolbar |
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
| @onSelect | Function | none | Called with the selected ids when the selection changes |
| @onRetry | Function | none | Shows the Try again button of the error state |
| @onClearSearch | Function | none | Shows the Clear the search button of the empty state |

## Blocks

- actions: header tools, in the box tools of the header; the create button goes here (`btn btn-primary btn-sm`, with ACL). Not rendered with @embedded (there is no header): put the tools in the surrounding panel.
- search: a slot under the header (at the top when embedded), for EzSearchCompact; rendered as is.
- item: one row per record; yields the record and the Item component, whose primary and secondary blocks hold the first and second line. An optional leading block on the Item puts a visual (an initials square, an icon, an avatar) in a column on the left, as wide as its content and top-aligned, with the two lines lined up beside it; with selection the row reads checkbox, leading, text. An optional trailing block on the Item puts row actions (an icon button such as a quick view) at the right of the row, vertically centred. The block sits beside the row element in a wrapper, never inside it: a route row has no button inside its link, and a click in the block runs only its own action; it never follows the link or reaches a click handler put on the Item.
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
| onSelect | The selected ids, whenever the selection changes |
| onRetry | None |
| onClearSearch | None |
| onApply (search block) | The query string |
| selection actions | The selected ids |

## Do and Avoid

### Do

- Ask Gaia for limit + 1 records and pass hasNext: the list has a next page when the extra record came back. Gaia sends no totals.
- Keep the query, sort and page in the caller and pass them in.
- Use EzSearchCompact in the search block.
- Let the list draw the pagination: it sits in the box footer, never in the header.
- Use @embedded when the list is one part of a larger panel (a list beside a timeline in one box): the page stays one panel, not a box per section. The panel draws the frame and the borders between its parts.

### Avoid

- Do not put a box around an embedded list; the surrounding panel draws the frame.
- Do not load data inside the list or ask for a total count.
- Do not build your own rows or empty states; use the item and empty blocks.
- Do not put buttons in the primary or secondary lines of a route row (a button inside a link); use the trailing block.
- Do not use it for wide, multi-column data; use a table.
