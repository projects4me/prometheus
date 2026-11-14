# Lint in CI/CD

CI runs two linters before the tests. A PR fails when either reports a violation that is not in the recorded baseline.

| CI step | Tool | Config | Baseline |
|---|---|---|---|
| `npm run lint:js` | ESLint 9 (flat config) | `eslint.config.mjs` | `eslint-suppressions.json` |
| `npm run lint:hbs` | ember-template-lint 7 | `.template-lintrc.js` | `.lint-todo/` |

Formatting is Prettier's (`npx prettier --write <files>`), not a lint gate.

## Run it locally

The checkouts have no `node_modules`. Lint runs in the `prometheus-dev` container (the same place the tests run), so
prefix every command with `docker exec prometheus-dev`. The container may hold a stale copy of the source: copy your
changed files in first, or check that it mounts your checkout (see the `p4m-stack` skill).

| What | PowerShell | bash |
|---|---|---|
| JS lint (what CI runs) | `docker exec prometheus-dev npm run lint:js` | `docker exec prometheus-dev npm run lint:js` |
| Template lint (what CI runs) | `docker exec prometheus-dev npm run lint:hbs` | `docker exec prometheus-dev npm run lint:hbs` |
| One template | `docker exec prometheus-dev npx ember-template-lint app/templates/x.hbs` | same |
| Prune fixed JS violations | `docker exec prometheus-dev npm run lint:js:prune` | same |
| Remove a fixed template todo | `docker exec prometheus-dev npx ember-template-lint app/templates/x.hbs --clean-todo` | same |

In Git Bash on Windows prefix `docker exec` calls with `MSYS_NO_PATHCONV=1` when an argument looks like a path
(`MSYS_NO_PATHCONV=1 docker exec prometheus-dev npx ember-template-lint app/templates/x.hbs`). PowerShell needs no prefix.

## The strict baseline

Existing violations are recorded so only new ones fail. The baseline only shrinks.

- **Remove what you fix.** A fixed JS violation fails `lint:js` until you run `npm run lint:js:prune`. A fixed template
  violation is dropped from `.lint-todo` by `npx ember-template-lint <file> --clean-todo`. Commit the shrunken file,
  otherwise CI fails.
- **Editing a line that has a recorded template violation makes it count as new** (the todo hashes the source), so
  fix the violation instead of working around it.
- **Never add entries to the baseline to get a PR through.** Do not run `--update-todo` or `--suppress-all`. Fix it.
- **Inline disables** only when the rule cannot apply, scoped to one line, with a reason:

  ```js
  // eslint-disable-next-line ember/no-jquery -- AdminLTE binds this handler with jQuery; only jQuery can unbind it
  ```

  Another valid case is Ember Data's `init()` on the issue model (#790). "It was quicker" is not a reason. Never
  disable a rule for a whole file.

## Windows line endings

Todos hash the template source, line endings included. `.gitattributes` forces LF for `*.hbs` and `.lint-todo`. A
checkout created before that rule has CRLF templates, so every todo mismatches. Check the templates out again:

PowerShell:

```powershell
git rm --cached -r -q . ; git reset --hard
```

bash:

```bash
git rm --cached -r -q . && git reset --hard
```

Commit or set aside your work first: `reset --hard` discards uncommitted changes.

## Common rules

| Rule | Satisfy it by |
|---|---|
| `require-button-type` | Give every `<button>` a `type` (`type="button"`, or `type="submit"` in a form). |
| `no-invalid-interactive` | Put `{{on "click"}}` on a `<button>` (or `<a href>`), not on a `div`/`span`. |
| `no-builtin-form-components` | Use `FormFields::*` (see `docs/ui/design-system.md`), not `<Input>`/`<Textarea>`. |
| `require-input-label` | Every input has a label (`FormFields::*` does this) or an `aria-label`. |
| `no-mut-helper` | Use a tracked property and an `@action` instead of `{{mut}}`. |
| `ember/no-classic-classes` | Native classes (`class X extends Component`), not `.extend()`. |
| `ember/no-jquery` | Use DOM APIs (`querySelector`, `addEventListener`). |
| `ember/no-get` | Read properties directly (`this.foo`), not `this.get('foo')`; `set` becomes plain assignment on `@tracked`. |
