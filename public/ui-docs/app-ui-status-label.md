## Overview

`AppUi::StatusLabel` renders an issue status as a badge: the translated status name, painted with the colour of the status. It wraps the `status-label` and `status-style` helpers and the status class, so a page never renders a raw status value.

Pass the status name (`issue.status`). Extra attributes, such as a `data-test-*` selector or a `data-toggle`, go on the badge.

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| @status | String | none | The name of the issue status |

## Blocks

None.

## Events

| Callback | Payload |
|---|---|
| none | none |

## Do and Avoid

- Use it wherever an issue status is shown as a badge.
- Do not print the status value directly, and do not repeat the helper markup in a page.
- The colour comes from the issue statuses in the store; load them before rendering, or the badge shows the class colour.
