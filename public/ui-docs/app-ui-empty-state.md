## Overview

`AppUi::EmptyState` is the centred grey text a box or list shows when there is nothing to show. It replaces the hand-written copies in the QuickList, the role and idea browsers and the workflow boxes. Extra attributes go on the outer element.

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| @icon | String | none | A Font Awesome class, such as `fa-info-circle` |
| @message | String | none | The text, already translated |

## Blocks

- action: a link or button centred under the message.

## Events

| Callback | Payload |
|---|---|
| none | none |

## Do and Avoid

- Use it inside a box body for new empty states.
- Pass a translated message.
- Avoid drawing an empty state by hand in a page.
