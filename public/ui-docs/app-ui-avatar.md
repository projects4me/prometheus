## Overview

`AppUi::Avatar` is the round picture of a user. It works for people and agents, which share one record shape.

- **Person**: the user's image. With no id, or when the image fails to load, it shows `/img/default.png` at the same size, never a broken image.
- **Agent**: the agent's own picture with a small round robot marker at the bottom right (from size `s` up), or, without a picture, the robot icon on plum. The title and alternative text name the agent.

Extra attributes (a class, a title) go on the wrapping element.

## Sizes

| @size | Pixels |
|---|---|
| xs | 20 |
| s | 30 (`sm` is an alias of `s`) |
| m | 40 (default) |
| l | 96 |

An unknown value falls back to `m`.

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| @user | Object | none | The user record: `id`, `name`, and optionally `type` and `profilePicture` |
| @size | String | m | `xs`, `s` (or `sm`), `m` or `l` |

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
