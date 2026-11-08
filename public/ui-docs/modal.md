## Overview

`bootstrap-modal` is the application's only modal. It shows a Bootstrap modal with a title, a body, a Cancel button and an optional Confirm button, and calls `close` once it is hidden. It is used for the board filters, the idea screen preview and most create and edit dialogs.

Render it outside scroll and stacking containers. Inside an element with `overflow`, `transform` or its own stacking context the modal is clipped or sits under other layers; render it through `in-element` into the app root instead, as the idea screen preview does.

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| title | String | none | Translation key of the title, shown through `t` |
| closeLabel | String | none | Translation key of the Cancel button |
| confirmLabel | String | none | Translation key of the Confirm button; without it there is no Confirm button |
| confirm | Function | none | Called when Confirm is clicked, see the confirm contract below |
| close | Function | none | Called once the modal is hidden, whatever the reason |
| containerClass | String | empty | Extra class on the modal element |
| removeConfirmBtn | Boolean | false | Hides the Confirm button |
| disableSaveBtn | Boolean | false | Disables the Confirm button |
| dataSaveBtn | String | save | Value of `data-btn` on the Confirm button |
| leftLabel | String | none | Translation key of an optional left footer button |
| leftAction | Function | none | Called when the left button is clicked; the modal then hides |

### The confirm contract

- `confirm` returning `true` hides the modal; any other non-Promise value leaves it open.
- `confirm` returning a Promise makes the modal busy: Confirm and Cancel are disabled, Confirm shows a spinner, Esc and backdrop clicks are ignored and repeated clicks do nothing.
- A Promise resolving truthy hides the modal. A Promise resolving falsy or rejecting leaves it open with the buttons enabled again.

## Blocks

The default block is the modal body.

## Events

| Callback | Payload |
|---|---|
| confirm | none; the return value decides whether the modal hides |
| close | none; called after the modal is hidden |
| leftAction | none |

## Do and Avoid

### Do

- Render the modal outside scroll and stacking containers, with `in-element` into the app root when the parent has `overflow`, `transform` or a z-index.
- Pass a translation key as `title`, it is translated with `t`.
- Return a Promise from `confirm` for saves that take time, so the buttons are locked while it runs.

### Avoid

- Rendering the modal inside a clipped or transformed parent.
- Passing already translated text as `title`.
- Relying on a truthy value other than `true` to hide the modal; only `true` or a Promise resolving truthy does.
