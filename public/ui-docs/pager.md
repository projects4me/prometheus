# AppUi::Pager

## Overview

AppUi::Pager is the range text and the previous and next buttons of a paged list. It only shows where the list is and reports the offset of the page asked for; the caller owns the query and the page.

Gaia sends no totals, so the pager works from the offset, the page size, the rows shown and whether more rows exist: the range reads `1-20 / 20+` while more rows exist and `21-25 / 25` on the last page. When the caller does have a total, the range reads it.

Used in the list toolbar of the Agents and Workflows lists and in the QuickList footer (compact).

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| @offset | Number | 0 | The offset of the first row shown |
| @limit | Number | none | The page size |
| @count | Number | 0 | The rows shown on this page |
| @hasMore | Boolean | false | Whether rows exist after this page |
| @total | Number | none | The record count, when the caller has one |
| @disabled | Boolean | false | Disables both buttons, e.g. while a page loads |
| @compact | Boolean | false | Extra-small buttons with angle icons, for narrow lists |
| @onPageChange | Function | none | Called with the offset of the page asked for |

## Blocks

None.

## Events

| Callback | Payload |
|---|---|
| onPageChange | The offset of the first row of the page asked for |

## Do and Avoid

### Do

- Pass the offset and convert it to a page number in the caller when the route pages by number (`offset / limit + 1`).
- Pass hasMore from Gaia's next link, or from asking for limit + 1 rows.
- Put it in the pager block of AppUi::ListToolbar on list pages.

### Avoid

- Do not ask Gaia for a total count just to fill the range.
- Do not hide the pager on list pages; QuickList hides it on a single page itself.
