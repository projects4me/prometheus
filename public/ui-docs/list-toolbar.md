# AppUi::ListToolbar

## Overview

AppUi::ListToolbar is the top of a list page box. The search and the page actions sit in the box header; under it, the controls row has the select-all checkbox and the bulk actions on the left and the selected count with the pager on the right. It only lays out its blocks; the page supplies every control.

Used in the Agents and Workflows lists, inside the `box box-primary list-view` and above the box body with AppUi::DataTable.

## Arguments

- position: `top` (default) draws the header and the controls row; `bottom` draws only the controls row, with a top border, to close the list. A page can show a toolbar above the list, below it or both.

## Blocks

- search: the search in the box header, EzSearch or a saved-search picker.
- actions: page actions after the search, such as the create button, each inside AccessControl.
- selection: the left of the controls row: the select-all checkbox and the bulk action buttons.
- pager: the right of the controls row: the selected count and AppUi::Pager.

The search takes all the width the actions leave. The header is drawn only with a search or actions block and never at the bottom, the pager slot only with a pager block.

## Events

None; the controls in the blocks report their own events.

## Do and Avoid

### Do

- Keep the bulk buttons as small default buttons in a btn-group, each with its ACL context.
- Put AppUi::Pager in the pager block.

### Avoid

- Do not put the pager in the box header.
- Do not put row actions here; they go in the rowActions block of AppUi::DataTable.
