## Overview

`Tags::EditModal` edits the tags of one record in a modal on `AppUi::Modal`. Views show only the tag chips and a + button; adding and removing happens here, so every view that tags records (issue detail, quick view, thread page) uses the same modal. The cursor is in the input as soon as the modal opens. Typing offers "Add text" first (when no project tag matches exactly, ignoring letter case), then the project's matching tags that the record does not have yet. Enter or a click adds the tag as a chip and keeps the cursor in the input.

Changes are staged. Save applies them through the tags service and shows the modal's busy spinner; Cancel, the close button and Esc discard them. When some changes fail the modal stays open, shows the error and reloads the record's actual tags. Chips are removable only with the `tagged.delete` permission.

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| @projectId | String or Number | required | The project whose tags are suggested and created |
| @relatedTo | String | required | `issue` or `conversationroom` |
| @relatedId | String or Number | required | The id of the record |
| @title | String | Tags | Translation key of the title |
| @titleParams | Object | none | Values for the title, such as the issue number |

## Blocks

None.

## Events

| Callback | Payload |
|---|---|
| @onClose | none |
| @onSaved | none |

## Do and Avoid

- Render it inside `{{#if this.showTags}}` and clear the flag in `@onClose`.
- Open it only for users with `tagged.create`.
- Do not add or remove tags inline in a page; use this modal.
