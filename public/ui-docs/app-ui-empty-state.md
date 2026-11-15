## Overview

`AppUi::EmptyState` is the message a box or list shows when there is nothing to show. It matches the QuickList empty state: grey text, an info icon and an action inline after the message. QuickList and AppUi::DataTable use it for their default empty state. Extra attributes go on the outer element.

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| @icon | String | fa-info-circle | A Font Awesome class |
| @message | String | none | The text, already translated |

## Blocks

- action: a link or button, such as `btn btn-link quick-list__state-action`, shown after the message.

## Events

| Callback | Payload |
|---|---|
| none | none |

## Do and Avoid

- Use it inside a box body for new empty states.
- Pass a translated message.
- Avoid drawing an empty state by hand in a page.
