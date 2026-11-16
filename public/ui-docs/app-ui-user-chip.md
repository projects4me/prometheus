## Overview

`AppUi::UserChip` is an avatar followed by the user's name, as the issue list shows the assignee. The name links to the user page with `@linked`. It works for people and agents.

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| @user | Object | none | The user record: `id`, `name` and optionally `type` |
| @size | String | none |
| @linked | Boolean | false | Link the name to the user page | The avatar size: `sm`, `xs` or none |

## Blocks

None.

## Events

| Callback | Payload |
|---|---|
| none | none |

## Do and Avoid

- Avoid putting a second name label beside it.
