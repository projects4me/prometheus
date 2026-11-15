## Overview

`AppUi::UserChip` is an avatar followed by the user's name in bold. The name is truncated with an ellipsis when the space is short, and the full name is the tooltip. It works for people and agents.

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| @user | Object | none | The user record: `id`, `name` and optionally `profilePicture` |
| @size | String | md | The avatar size: `sm`, `md` or `lg` |

## Blocks

None.

## Events

| Callback | Payload |
|---|---|
| none | none |

## Do and Avoid

- Give the chip a parent with a width so the name can truncate.
- Avoid putting a second name label beside it.
