## Overview

`AppUi::Box` is the AdminLTE box of the design system, with square edges and the gradient bar of its variant. Use it for new boxes; the existing boxes are not migrated. Each part renders only when its block is given. Extra attributes go on the outer element.

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| @variant | String | primary | `primary`, `default`, `info`, `success`, `warning` or `danger` |
| @listView | Boolean | false | adds the `list-view` modifier of list page boxes |
| @noPadding | Boolean | false | adds `no-padding` to the body, for tables |
| @collapsed | Boolean | false | adds the `collapsed-box` modifier |

## Blocks

- header: the header content, usually `<h3 class="box-title">`.
- tools: icon buttons (`btn btn-box-tool`), placed on the right of the header.
- top: content between the header and the body, such as `AppUi::ListToolbar`.
- body: the box body.
- bottom: content between the body and the footer, such as a bottom `AppUi::ListToolbar`.
- footer: the box footer.

## Events

| Callback | Payload |
|---|---|
| none | none |

## Do and Avoid

- Use it for every new box.
- Put the empty state in the body with `AppUi::EmptyState`.
- Avoid adding border-radius or custom containers.
