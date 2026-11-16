# Component documentation

Each component has one markdown file in this folder, named after the component (`app-ui-loader.md`). The
files are static assets: they stay out of the app bundle and are downloaded only when `Developer::Docs` opens
an entry (`<Developer::Docs @doc="app-ui-loader.md" />`).

A file is split on `## ` headings into tabs, in this order:

| Section | Content |
|---|---|
| `## Overview` | What the component is for and where it is used |
| `## Arguments` | A table with the columns Argument, Type, Default, Meaning |
| `## Blocks` | The named blocks and what they yield |
| `## Events` | A table with the columns Callback, Payload |
| `## Do and Avoid` | Usage guidance |

Rules:

- No copy-ready code snippets inside the doc entries (the invocation example above is for this README only).
- Text before the first `## ` heading is not shown.
- Use `##` only for these sections; use `###` inside them.

# Contract manifests

A shared component also has a contract manifest beside its page: `<name>.json` next to `<name>.md`. The page is
for people; the manifest says the same in a form a program can read (a metadata renderer, a generator, an AI
assistant). It is plain JSON with the fields below, not JSON Schema: it describes a component's interface, not a
document to validate. Like the pages, manifests are static assets and stay out of the app bundle.

| Field | Content |
|---|---|
| `name` | The component name as invoked (`QuickList`) |
| `component` | Its path under `app/components` (`quick-list`, for `quick-list.hbs` or `quick-list/index.hbs`) |
| `doc` | The page beside it (`quick-list.md`) |
| `description` | One or two sentences: what it is for |
| `arguments` | Data arguments, keyed by name without `@`: `type`, `required`, `default` (optional, never with `required: true`), `description` |
| `events` | Callback arguments, keyed by name (`on<Something>`): `payload` (the values it is called with, in order: `name`, `type`, `description`) and `description` |
| `blocks` | Named blocks, keyed by name (`default` for the unnamed one): `description` and `yields`, the block parameters in order |
| `data` | Optional: the shape of array or object arguments, keyed by argument name: `type`, `of`, `fields` (each `type`, `required`, `description`) |
| `variants` | Optional: the usual configurations: `name`, `description`, the `arguments` and `blocks` they use |

Types are `string`, `number`, `boolean`, `array`, `object`, `function`, `component` or `any`; join alternatives with `|`
(`string|number`). An argument and an event never share a name; every callback is an event.

A yielded contextual component (`{{yield record (component "quick-list/item" isActive=…) to="item"}}`) is a
`yields` entry with `type: "component"` and:

- `component`: the path of the yielded component;
- `curried`: the arguments the parent already sets;
- `arguments`: the ones the caller may still pass (same format as above);
- `blocks`: the names of its blocks.

Example (shortened from `quick-list.json`):

```json
{
  "name": "QuickList",
  "component": "quick-list",
  "doc": "quick-list.md",
  "description": "A narrow list of records inside a box.",
  "arguments": {
    "items": { "type": "array", "required": false, "default": [], "description": "The records, one row each" }
  },
  "events": {
    "onPage": { "payload": [{ "name": "page", "type": "number" }], "description": "A page change" }
  },
  "blocks": {
    "item": {
      "description": "One row per record",
      "yields": [
        { "name": "record", "type": "object" },
        { "name": "Item", "type": "component", "component": "quick-list/item", "curried": ["isActive"],
          "arguments": { "route": { "type": "string", "required": false, "description": "The row link" } },
          "blocks": ["leading", "primary", "secondary"] }
      ]
    }
  },
  "data": { "items": { "type": "array", "of": "object", "fields": { "id": { "type": "string|number", "required": true } } } },
  "variants": [{ "name": "paged", "description": "Adds the pagination", "arguments": ["onPage"] }]
}
```

## The contract test

`tests/unit/component-contracts-test.js` checks every manifest in this folder against its component's template
and class, and fails when they disagree:

- every `@arg` the template reads and every `this.args.arg` the class reads is declared in `arguments` or
  `events`, and every declared one is used;
- the declared blocks are exactly the ones the template yields to (`{{yield to="…"}}`) or tests
  (`(has-block "…")`), and each `{{yield}}` passes as many values as `yields` lists;
- a yielded component is the one named, with the same curried arguments, and its own arguments and blocks
  match its entry;
- `data` and `variants` name only declared arguments and blocks, and `doc` exists.

The build bundles the manifests and the sources of the components they name into the test module
`prometheus/tests/helpers/component-contract-sources` (`lib/component-contract-sources.js`, tests tree only). The
sources are read with a small tokenizer (`tests/helpers/component-contract.js`), not the Glimmer parser, so keep
argument reads plain: `{{@arg}}` or `this.args.arg`. Destructuring `this.args` hides the names from the test.

Existing components get a manifest when they are next changed (design system R4, R6); a new shared component
ships with one.
