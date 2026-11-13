## Overview

The `FormFields::*` components are the only way to build form inputs in Prometheus. Pick a field in Controls to see it, try the disabled, read-only and validation states, and watch its callbacks in the event log. The legacy root-level `field-*` components are out of scope.

## Arguments

Shared by the fields that extend the base field: `@data-field` (the field's test and error anchor), `@aclContext` (field-level ACL: without access the field is not rendered), `@label`, `@required`, `@info` and `@showFieldInfo` (info-icon tooltip), `@validate` (called on blur), `@message` (error text shown after the field was touched, see `FormFields::ValidationMessages`).

| Argument | Type | Default | Meaning |
|---|---|---|---|
| FieldText: `@value`, `@placeholder`, `@type`, `@mask`, `@length`, `@readonly`, `@onInput` | mixed | none | Single line text; `@onInput` gets the input event |
| FieldTextArea: `@value`, `@placeholder`, `@onInput` | mixed | none | Multi line text |
| FieldRelate: `@options`, `@selected`, `@relateType`, `@searchField`, `@searchEnabled`, `@disabled`, `@onchange` | mixed | none | One related record; `@relateType="relate-simple"` renders the option label |
| FieldRelate, FieldRelateMulti, FieldMultiSelect: `@renderInPlace` | Boolean | false | Renders the options list next to the field instead of in the body; pass `true` inside `AppUi::Modal` |
| FieldRelateMulti: same as FieldRelate | mixed | none | Several related records; `@onchange` gets the selected list |
| FieldMultiSelect: `@options`, `@selected`, `@searchEnabled`, `@closeOnSelect`, `@onchange` | mixed | none | Several plain values |
| FieldDate: `@value`, `@format`, `@singleDatePicker`, `@update` | mixed | none | Date picker; `@update` gets the formatted date |
| FieldCheckbox: `@checked`, `@select` | mixed | none | Checkbox; `@select` gets the input event |
| FieldSwitch: `@checkedValue`, `@callBack`, `@size` | mixed | `md` | Switch; size is `sm`, `md` or `lg` |
| FieldUpload: `@label`, `@uploadFile` | mixed | none | Drop zone; `@uploadFile` gets each added file |
| FieldSearch: `@value`, `@placeholder`, `@onInput` | mixed | none | Debounced search box; `@onInput` gets the text |

## Blocks

The fields yield no blocks. Relate fields render each option with the component named by `@relateType`.

## Events

| Callback | Payload |
|---|---|
| `@onInput` (text, text area, search) | The input event, or the text for search |
| `@onchange` (relate, multi select) | The selected option or list |
| `@update` (date) | The formatted date |
| `@select` (checkbox), `@callBack` (switch) | The change event |
| `@uploadFile` (upload) | The added file; the demo logs it and does not upload |
| `@validate` | none |

## Do and Avoid

### Do

- Build every form from `FormFields::*`.
- Set `@data-field` on every field, and `@aclContext` where the field is permission controlled.
- Explain a field with an info-icon tooltip (`@info`, `@showFieldInfo`).
- In product screens take labels from translations.

### Avoid

- A bare `<select>` or `<PowerSelect>`: use FieldRelate or FieldMultiSelect.
- Helper text under a field.
- The legacy root-level `field-*` components in new code.
