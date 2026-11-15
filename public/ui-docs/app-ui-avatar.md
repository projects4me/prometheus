## Overview

`AppUi::Avatar` is the round picture of a user. It works for people and agents, which share one record shape. It shows the user's picture, and the initials of the name when there is no picture or it fails to load. Extra attributes (a class, a title) go on the outer element.

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| @user | Object | none | The user record: `id`, `name` and optionally `profilePicture` |
| @size | String | md | `sm` (24px), `md` (36px) or `lg` (64px) |

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
