## Overview

`AppUi::Editor` is the one way to show a rich-text box. It wraps `AppUi::ToastUi` and is controlled: the value comes in through `@value` and goes out through `@onChange(value)`, the value and not an event. It is not a `FormFields` subclass; the form chrome is added by composition and is optional. Without a label it is a bare box, such as a comment composer.

A square 1px bordered editor, as in the design system. `@label`, `@required` and `@info` show a `FormFields::Label`, `@aclContext` wraps it in `AccessControl`, and `@message` is shown below once the editor has been left. `@validate` is called with the content on blur.

With `@readonly` the content is shown in the Toast UI viewer, which sanitizes it. The emptiness of a value (`<p><br></p>` is empty) is checked by `isEditorEmpty` in `utils/ui/editor-empty`, for required validation.

## Arguments

| Argument | Type | Default | Meaning |
|---|---|---|---|
| @value | String | none | The content |
| @label, @required, @info, @data-field | String, Boolean | none | The label above the editor and its info bubble |
| @aclContext | String | none | Shows the editor only to users with this access |
| @message | String | none | Validation message, shown after the first blur |
| @validate | Function | none | Called with the content on blur |
| @usersList | Array | none | Users for @ mentions |
| @issueSearch | Function | none | Issue search for # links |
| @placeholder | String | none | Placeholder |
| @output | String | html | html or markdown |
| @editType | String | wysiwyg | wysiwyg or markdown. Text that must stay exactly as typed, such as an agent prompt, takes markdown with `@output="markdown"` |
| @clearEvent | String | none | pubSub event that clears this editor |
| @readonly | Boolean | false | Shows the viewer |
| @disabled | Boolean | false | Inert and dimmed |

## Blocks

None.

## Events

| Callback | Payload |
|---|---|
| @onChange | value, mentioned issue numbers |
| @onBlur | none |
| @onSubmit | value (Ctrl/⌘+Enter, not empty) |
| @onImage | image blob; resolves to { url, alt } |

## Do and Avoid

- Use it for every rich-text box; do not use `AppUi::ToastUi` directly in a page.
- Keep the value in the parent and update it from `@onChange`.
- Do not render the viewer's content with `htmlSafe`; use `@readonly`.
