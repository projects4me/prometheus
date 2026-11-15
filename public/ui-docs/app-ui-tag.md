## Overview

`AppUi::Tag` renders a tag or small label: the AdminLTE `label label-default` look with square edges. It is the one way to show a tag, so pages do not repeat the label markup. An issue status is not a tag: use `AppUi::StatusLabel`.

The content is the block. Extra attributes, such as a `data-test-*` selector or a `title`, go on the label.

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| @variant | String | default | The colour: default, primary, success, info, warning or danger |

## Blocks

The default block is the text of the tag.

## Events

| Callback | Payload |
|---|---|
| none | none |

## Do and Avoid

- Use it for tags, counts and small state labels.
- Do not write `<span class="label label-default">` in a page.
