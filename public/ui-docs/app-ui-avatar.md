## Overview

`AppUi::Avatar` is the round picture of a user. It works for people and agents, which share one record shape.

- **Person**: the user's image. With no id, or when the image fails to load, it shows the user's initials (first letter of the first and last name; one letter at `xs` or for a one-word name) on a round background generated from the user, never a broken image. With no name it shows a user icon on the same background.
- **Generated background**: a base colour, plus a pattern in an accent colour, derived from a hash of the user id (the name when there is no id). It is always the same for the same user and nothing is stored. The lists in `app/utils/ui/avatar-identity.js` and `app-ui-avatar.scss` must never be reordered, because that changes every user's avatar.
- **Agent**: the agent's own picture with a small round robot marker at the bottom right (from size `s` up), or, without a picture, the robot icon on plum. The title and alternative text name the agent.

Extra attributes (a class, a title) go on the wrapping element.

## Sizes

| @size | Pixels |
|---|---|
| xs | 20 |
| s | 30 (`sm` is an alias of `s`) |
| m | 40 (default) |
| ml | 64 (stacked member grids with the name below) |
| l | 96 |

An unknown value falls back to `m`.

## Stepping down to the space available

A large avatar in a column whose width depends on where the view is shown (a full page or a narrow quick-view panel) can take `@minSize`. The avatar then watches the content width of its parent element and renders the largest standard size from `@size` down to `@minSize` that fits, or `@minSize` when none fits. `data-size` and the size class show the size rendered, and it follows the parent as it resizes.

It decides from the parent's width only, never from its own, so a parent whose width follows its content settles on one size. Without `@minSize`, or with one that is unknown or not smaller than `@size`, the size is fixed and nothing is measured.

```hbs
<AppUi::Avatar @user={{this.user}} @size="l" @minSize="m" />
```

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| @user | Object | none | The user record: `id`, `name`, and optionally `type` and `profilePicture` |
| @size | String | m | `xs`, `s` (or `sm`), `m`, `ml` or `l` |
| @minSize | String | none | The smallest size to step down to when the parent is too narrow for `@size`; same values as `@size` |

## Blocks

None.

## Events

| Callback | Payload |
|---|---|
| none | none |

## Do and Avoid

- Pass the record, not its parts.
- Use `AppUi::UserChip` when the name is shown next to the picture.
- Use `@minSize` for large avatars in containers of varying width, instead of picking a fixed size per page.
- Avoid drawing avatar markup by hand in a page.
