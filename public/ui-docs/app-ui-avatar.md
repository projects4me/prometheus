## Overview

`AppUi::Avatar` is the round picture of a user. It works for people and agents, which share one record shape. It builds on `Agent::UserAvatar`: the user's image, or the agent avatar for an agent. It uses the AdminLTE `img-circle` classes. Extra attributes (a class, a title) go on the image.

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| @user | Object | none | The user record: `id`, `name` and optionally `type` |
| @size | String | none | `sm` (img-sm), `xs` (img-xs); none gives the plain img-circle, for a caller that sizes it itself |

## Blocks

None.

## Events

| Callback | Payload |
|---|---|
| none | none |

## Do and Avoid

- Pass the record, not its parts.
- Use `AppUi::UserChip` when the name is shown next to the picture.
- Avoid drawing avatar markup by hand in a page.
