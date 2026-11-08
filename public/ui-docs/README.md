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
