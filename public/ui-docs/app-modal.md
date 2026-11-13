## Overview

`AppUi::Modal` is the modal dialog on the native `<dialog>` element, opened with `showModal()`. It replaces `bootstrap-modal` (the Bootstrap 3 jQuery plugin) with the same arguments and markup; screens move to it one at a time, so both exist side by side for now.

It opens as soon as it is rendered. Keep the `{{#if this.showX}}` around it and clear the flag in `@onClose`; removing it from the page closes it. Never reach into the DOM to open or close it.

```hbs
{{#if this.showEdit}}
  <AppUi::Modal
    @title="views.app.issue.edit"
    @closeLabel="global.form.cancel"
    @confirmLabel="global.form.save"
    @confirm={{this.save}}
    @onClose={{this.closeEdit}}>
    ...
  </AppUi::Modal>
{{/if}}
```

`showModal()` puts the dialog in the browser's top layer, above every z-index, `overflow` and `transform` on the page. It can be rendered anywhere, including inside a clipped or transformed box; no `in-element` is needed (the demo renders it inside such a box).

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| @title | String | none | Translation key of the title, shown through `t`; also the dialog's accessible name |
| @closeLabel | String | none | Translation key of the Cancel button |
| @confirmLabel | String | none | Translation key of the Confirm button; without it there is no Confirm button |
| @confirm | Function | none | Called when Confirm is clicked, see the confirm contract below |
| @onClose | Function | none | Called once the modal closed through Cancel, the close icon, Esc, a backdrop click, the left button or a successful confirm. Not called when the caller removes it. Replaces `close` |
| @containerClass | String | empty | Extra class on the `<dialog>`, so rules such as `.idea-screen-modal .modal-dialog` keep working |
| @removeConfirmBtn | Boolean | false | Hides the Confirm button |
| @disableSaveBtn | Boolean | false | Disables the Confirm button |
| @dataSaveBtn | String | save | Value of `data-btn` on the Confirm button |
| @leftLabel | String | none | Translation key of an optional left footer button |
| @leftAction | Function | none | Called when the left button is clicked; the modal then closes |

### The confirm contract

- `@confirm` returning `true` closes the modal; any other non-Promise value leaves it open.
- `@confirm` returning a Promise makes the modal busy: all buttons are disabled, Confirm shows a spinner, Esc and backdrop clicks are ignored and repeated clicks do nothing.
- A Promise resolving truthy closes the modal. A Promise resolving falsy or rejecting leaves it open with the buttons enabled again.

### Markup

The dialog keeps Bootstrap's inner markup: `dialog.app-modal > .modal-dialog > .modal-content.box.box-primary > .modal-header / .modal-body / .modal-footer`, the header close icon and the `data-btn` hooks (`cancel`, `save` or `@dataSaveBtn`, `left`). The dialog does not carry Bootstrap's `.modal` class, which Bootstrap 3 hides. In acceptance steps use `MODAL`, `OPEN_MODAL` and `inModal()` from `tests/acceptance/steps/common-steps/modal-steps.js`, which match both modals.

### Closing

- Esc goes through the dialog's `cancel` event and the same close path as Cancel; it is ignored while busy.
- A backdrop click is a click that starts and ends on the dialog itself, outside the `.modal-dialog` box.
- Nested modals stack natively: a modal rendered inside another opens above it, and Esc closes only the top one.

## Blocks

The default block is the modal body.

## Events

| Callback | Payload |
|---|---|
| @confirm | none; the return value decides whether the modal closes |
| @onClose | none; called after the modal closed |
| @leftAction | none |

## Things that render into body

Everything outside an open modal dialog is inert: it shows under the dialog and cannot be clicked. Two things render into `body` and are handled differently:

- **Messenger.** The modal moves Messenger's message list into the topmost open dialog when it opens and back to `body` when the last one closes, so an error posted while a confirm fails shows above the modal and its buttons work. Nothing is needed at the call site. The dialog's own subtree is the only part of the page a modal dialog leaves interactive, so this is used instead of showing the list as a `popover` outside the dialog.
- **PowerSelect / ember-basic-dropdown.** Their options list renders into the body wormhole by default, which is inert under the modal. Inside `AppUi::Modal` pass `@renderInPlace={{true}}`: to `FormFields::FieldRelate`, `FormFields::FieldRelateMulti` and `FormFields::FieldMultiSelect` (they forward it), or to a `PowerSelect` directly. The list then renders next to its field inside the dialog, which scrolls when the list is taller than the window. Moving the wormhole into the dialog is not an option: ember-basic-dropdown positions wormholed content against `body`, which is wrong inside the fixed, scrolling dialog.

## Do and Avoid

### Do

- Keep `{{#if}}` around the modal and clear the flag in `@onClose`.
- Pass a translation key as `@title`, it is translated with `t`.
- Return a Promise from `@confirm` for saves that take time, so the buttons are locked while it runs.
- Pass `@renderInPlace={{true}}` to every select inside the modal.

### Avoid

- Calling `close()` on the dialog or toggling classes to hide it; remove it from the page instead.
- Wrapping it in `in-element`; it is not needed.
- Passing already translated text as `@title`.
- Relying on a truthy value other than `true` to close the modal; only `true` or a Promise resolving truthy does.
