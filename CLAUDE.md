# Prometheus — Projects4Me web UI (Ember 4.1 Octane, ember-data JSON:API)

## Branching
- Work off `dev`. Commit/PR title: `aprom-NNNN | type(scope): subject (#PR)`.

## Run
- Run, lint and test commands: workspace skills `p4m-stack` and `run-tests` (acceptance tests are Gherkin `.feature` files via ember-cli-yadda on Mirage).

## Architecture
- API: `app/adapters/application.js` (host `ENV.api.host`, namespace `api/v1`, singular paths, Bearer token, refresh via `services/session.js`).
- Queries use Gaia's query string: `store.query('issue', { query: '((Issue.projectId : X))', rels, limit })`.
- Realtime: `services/hermes.js` (Socket.IO). Screens call `hermes.register(owner, projectId, handlers)` on route enter and dispose on exit. Contract: `docs/architecture/live-updates/`.
- Permissions: `services/acl.js` maps routes to `module.action`; add every new route to `routeMaps`.
- Base classes: `routes/app.js`, `controllers/prometheus.js`, `controllers/prometheus/list.js`, `components/app.js`.

## UI and design system (read before any UI change)
- Read `docs/ui/design-system.md` first. Extend the existing UI; never build a new or "modern" one.
- AdminLTE 2 + Bootstrap 3, skin `skin-black-light`. Group content in `.box` with `.box-header with-border` + `.box-title`; pick the box variant by section type (design-system.md §4).
- **Square edges only.** No `border-radius` anywhere except `50%` on avatars and status dots. Existing rounded corners are legacy; don't copy them.
- **Use the existing component, always.** If a component for the job exists (`components/form-fields`, `components/app-ui`, `components/widgets`, or one listed in `docs/ui/design-system.md`), use it. Never build your own markup, styling or component for the same purpose. Forms use `FormFields::*` only: a select is `FormFields::FieldRelate` (`@relateType="relate-simple"`), never a bare `<PowerSelect>`, `<select>` or hand-written `<label>`. Search `app/components` and the design system before writing UI.
- **If it's unclear which component fits, or none quite does, ask before building** (headless: finish with `needs_input` and propose the options). Don't invent a new component or a variant of an existing one.
- Reuse Bootstrap/AdminLTE classes. Add a new class only when nothing existing works, scoped under the module class in `app/styles/modules/<module>.scss`.
- Colours only from `app/styles/variables.scss` (crimson `$primaryColor`, plum `$highlightColor`, link blue `$secondaryColor`). No new colours, fonts (Source Sans Pro only), shadows, gradients or UI/icon libraries (Font Awesome 4 only).
- Follow the page patterns: list = one full-width `box-primary` with search toolbar, table and pagination; detail = `col-md-8` record box + `col-md-4` side boxes; create/edit = `col-md-8` form box + `col-md-4` side boxes, Save/Cancel below the boxes.
- Before calling a UI change done, open it in the running app (`https://app.local-projects4.me`) next to an existing screen of the same type and compare.

## Rules
- New code: native classes, `@tracked`, `@action`, Glimmer components co-located in `app/components/<group>/`. No new `.extend()`, mixins or jQuery.
- Use the store/adapter, not raw `fetch()` (raw fetch skips token refresh).
- Don't load a hasMany relation (comments, time logs, activities, messages, files…) through `rels` in the parent's request. Gaia applies `limit` to the joined rows, not to the parent records. With a limit, the children are cut short silently; without one, the request is unbounded. Load the parent with its hasOne/belongsTo `rels` only, then query the children separately with their own query, sort and limit (e.g. `store.query('comment', { query: '(Comment.relatedId : <roomId>)', sort: 'Comment.dateCreated', order: 'DESC', limit: 10 })`), and page or "load more" from there. Existing screens that still pass hasMany `rels` aren't a pattern to copy.
- Every user-facing string goes in `translations/en-us.json`.
- YUIDoc on classes, properties and methods; keep the license header.
- Every new route or component gets a Mirage handler plus an integration or acceptance test.

## House rules

These house rules assume the repo is checked out inside the **Pr4M** workspace (https://github.com/projects4me/Pr4M), which provides `dev-tools/` (the `gaia` MCP server, the shared Agent Odysseus identity, the `ai` workflow CLI, Talos, the `installer`) and the workspace skills and agents in `.claude/`.

### Workflow
- **Issue first.** Before starting any work, find or create its issue in Projects4Me: search with `gaia_list_issues`, create with `gaia_create_issue` (the `gaia` MCP server in `dev-tools/gaia-mcp`), or use the Projects4Me UI. Prometheus work goes in project **"A Prometheus"** (short code `aprom`). Use its issue number in the commit title (`aprom-NNNN | ...`). Move the issue's status as work progresses (`in_progress` → `in_review` → `done`).
- **Milestone, time and notes.** Every issue goes in the project's **Claude-v1** milestone (the `gaia` MCP server does this by default). While working, log the time spent on the issue (`gaia_log_time`, with a short description of what it was spent on) and record the details in its thread (`gaia_add_comment`): what was done, findings, decisions, files changed and what's left. Do both before marking the issue `in_review`.
- **Branch, PR, merge.** Move the issue to `in_progress`, then branch `claude-issue-NNNN` off an up-to-date `dev`. Run the full test suite before opening the PR. Push the branch to the `odysseus` remote and open a PR to `dev` with `odysseus gh pr create`. **Never merge**: the user merges. After the user merges, rebase local `dev` onto `origin/dev` before starting the next issue. Leave uncommitted files you didn't create for this issue alone.
- **Identity: Agent Odysseus.** Commit, push and open PRs only as Agent Odysseus, through `dev-tools/odysseus/odysseus git …` / `odysseus gh …` (see `dev-tools/odysseus/README.md`). Push only to the `odysseus` remote, never to `origin`. Never change git or gh configuration (global or repo) and never use your personal git/GitHub credentials for agent work; if the agent identity isn't available, stop and ask.
- One issue per PR; log anything else you find in the Projects4Me tracker instead of fixing it in the same PR.
- MVP first: items in the Engineering Guide's pre-production table are out of scope unless the issue asks for them.
- Never commit, push, merge, force-push, tag or deploy without explicit approval. Never commit to `master` or `qa`.
- When docs and code disagree, the code wins; flag the doc in your summary.
- Acceptance criteria unclear? Ask instead of guessing, and write down assumptions in the PR.

### Boundaries
- Talk only to Gaia (through the store and adapter) and Hermes. Never call Ares or other services directly.
- New live events need matching changes in Gaia `EventNames.php` and Hermes `names.js`; ship them as linked PRs.

### Security
- Treat user content as untrusted: don't render it as raw HTML (`{{{ }}}`, `htmlSafe`) unless it has been sanitized.
- Never weaken token refresh, auth checks or route ACL (`services/acl.js`) to make something work.
- Never add secrets to `config/environment.js` or other committed files.

### Design (Fowler's layering + SOLID)
- Follow the layering and separation of concerns from Martin Fowler's *Patterns of Enterprise Application Architecture*: presentation (templates and components: display and user input only) → application logic (routes, controllers, services such as `acl`, `hermes`, `session`) → data source (Ember Data models, adapters, serializers). Dependencies point down only; components never call the API directly or hold business rules.
- Gaia owns data and authorization; the UI never re-implements a server rule beyond what's needed to hide or disable controls.
- SOLID, especially **Single Responsibility**: one reason to change per component, service or helper. Prefer composing small components and extending the base classes over growing one component; inject services rather than reaching into globals.
- Before adding a component, service or method, name its single responsibility; if it needs "and", split it.

### Quality
- "Done" means tests and lint were run and passed. Report failures as they are, and say what wasn't run.
- A bug fix starts with a test that fails.
- No new dependencies and no framework or runtime upgrades without approval.

### PR description
What · Why (issue link) · How tested · Contract impact (events, envelope, Ares format) · Migration impact · Out of scope / follow-ups.
