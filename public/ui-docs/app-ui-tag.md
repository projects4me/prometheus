## Overview

`AppUi::Tag` renders a tag in the Task Board look: a 1px border and the text in the variant colour on a 16% tint of it, 11px semibold, square edges. It is the one way to show a tag, so pages do not repeat the label markup. Tags next to each other have a 4px gap and wrap in a row. An issue status is not a tag: use `AppUi::StatusLabel`.

The content is the block. Extra attributes, such as a `data-test-*` selector, go on the tag. Text longer than the maximum width is cut with an ellipsis and its full text is the `title`.

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| @variant | String | default | The colour: default, primary, info, success, warning or danger |
| @fill | String | tint | `tint` is the default look. `solid` fills the tag with the colour; the text is white or dark, whichever has the higher contrast. Other values are `tint` |
| @colorKey | String | none | Without a `@variant`, the palette colour (primary, info, success, warning, danger) is picked from a hash of this text, so the same text always has the same colour |
| @onRemove | Function | none | Shows a small remove button inside the tag and calls this when it is clicked |

## Blocks

The default block is the text of the tag.

## Events

| Callback | Payload |
|---|---|
| @onRemove | none |

## Do and Avoid

- Use it for tags, counts and small state labels; use `@colorKey` for free text such as issue tags.
- Do not write `<span class="label label-default">` in a page.
- Do not use it for an issue status.
