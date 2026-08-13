# Live-updates decisions (Prometheus)

Agreed client decisions for consuming Hermes domain events. Gaia publishing
and Hermes room keys are out of scope here.

| Field | Value |
|-------|-------|
| Status | Accepted |
| Scope | Ember session socket, intents, and screen handlers |
| Primary code | `app/services/hermes.js`, project board/gantt/conversation controllers, `app/services/notifications.js` |

---

## How to use this file

- Add a new decision whenever client live-update behavior is agreed or changed.
- Record Prometheus-owned choices only (when to connect, who registers, who
  applies). Envelope allowlists belong in Gaia / Hermes.
- Mark open questions separately so they are not treated as settled policy.

---

## Architecture decisions

### D-001 — One socket per signed-in session

| | |
|---|---|
| Status | Accepted |
| Decision | The `hermes` service holds a single Socket.IO connection for the tab. Screens do not open their own sockets. |
| Rationale | Auth, reconnect, and intent snapshots are session concerns. Per-route sockets would duplicate handshake and leak connections on navigation. |
| Implications | `hermes.connect()` is idempotent for the same access token. Route enter/exit only changes registrations. |

### D-002 — Connect after login; disconnect on logout

| | |
|---|---|
| Status | Accepted |
| Decision | `loading-assets` (and `app` when assets are already loaded) connects and starts notification live sync. Logout stops notification live sync, clears registrations, and disconnects. |
| Rationale | The socket is authenticated with the OAuth access token. It must not outlive the ember-simple-auth session. |
| Implications | Do not connect from individual project routes. Do not leave the socket open after `invalidateSession`. |

### D-003 — `hermes` is a relay client, not a domain layer

| | |
|---|---|
| Status | Accepted |
| Decision | The service connects, aggregates intents, deduplicates `eventId`s, drops local echoes, and calls matching handlers. It does not know issues, boards, gantt bars, or comments. |
| Rationale | Applying a status change on a kanban card is board knowledge. Putting it in the service would make every screen depend on every other screen’s model. |
| Implications | New live UI is a controller (or service) `register()` map plus handlers, not a change to `hermes.js` beyond the existing client contract. |

### D-004 — The mounted controller owns its intent map

| | |
|---|---|
| Status | Accepted |
| Decision | Board, gantt, and conversation each implement `registerHermesIntents` / `unregisterHermesIntents` and inject `hermes` themselves. There is no `HermesIntents` mixin. |
| Rationale | Ember mixins hide ownership. Each screen’s events and handlers are different; a shared mixin implied they were the same. |
| Implications | Do not reintroduce a mixin (or a base “live controller”) just to share `register`/`unregister` boilerplate. Routes call the controller methods on enter/exit. |

### D-005 — Event names are literals at the register site

| | |
|---|---|
| Status | Accepted |
| Decision | Handler maps use string keys (`'issue.status.changed'`). There is no `utils/live/events.js` catalog or shared `HERMES_EVENTS` object. |
| Rationale | A catalog invited unused imports and made it look like every screen should know every event. A screen should name only what it can apply. |
| Implications | Gaia / Hermes remain the allowlist. Prometheus does not need a parallel list. Adding a handler means typing the name next to the function that applies it. |

### D-006 — Notifications own the user-scoped intent

| | |
|---|---|
| Status | Accepted |
| Decision | `notifications.startLiveSync()` registers `notification.created` with projectId `user:<currentUser.id>`. Project screens do not register that event. |
| Rationale | The bell is session-wide, not project-route-wide. The `user:` prefix is the Gaia/Hermes routing convention for recipient fan-out. |
| Implications | `startLiveSync` is idempotent. `stopLiveSync` runs on logout. Do not register `notification.created` on board/gantt/conversation. |

### D-007 — This tab drops its own write echo

| | |
|---|---|
| Status | Accepted |
| Decision | The application adapter calls `hermes.noteLocalWrite(type, id)` on create/update/delete. Matching `domain:event` envelopes are not dispatched for a short TTL (5s). |
| Rationale | The saving tab already updated Ember Data. Re-applying the echo races the in-flight save and can clobber local state. |
| Implications | Other tabs still apply the event. Echo suppression is per resource type+id, not per event name. |

### D-008 — Intents are a full snapshot with a rising revision

| | |
|---|---|
| Status | Accepted |
| Decision | Every `register` / dispose rebuilds the desired set and emits `intents:set` with `protocolVersion: 2` and an incremented `revision`. Reconnect forces a resend. |
| Rationale | Hermes replaces the socket’s rooms from the snapshot. Deltas would desync on dropped acks. Hermes stores intents per connection, so a new socket starts empty. |
| Implications | Unregistering a screen must dispose, not “leave” individual events by name. Stale acks for older revisions are ignored. |

### D-009 — Dispatch is exact `projectId` + `eventName`

| | |
|---|---|
| Status | Accepted |
| Decision | A handler runs only if its owner registered that event name for that `projectId` (or `user:<id>`). Unknown envelopes are ignored. |
| Rationale | Two projects or two screens must not see each other’s patches. Hermes may still deliver only subscribed rooms; the client still filters. |
| Implications | Switching projects unregisters the old id before registering the new one. Do not apply an event “because the issue is in the store.” |

### D-010 — Loopback Hermes URLs follow the page hostname

| | |
|---|---|
| Status | Accepted |
| Decision | `resolveHermesUrl` rewrites `localhost` / `127.0.0.1` / `::1` in `ENV.hermes.url` to `window.location.hostname`. |
| Rationale | Firefox often opens the Ember app on `127.0.0.1` while config says `localhost`. Those are different origins; the handshake then fails CORS. |
| Implications | Production non-loopback URLs are left unchanged. URL parsing lives in `app/utils/live/url.js`, not in the service class. |

### D-011 — Unsubscribed screens stay silent

| | |
|---|---|
| Status | Accepted |
| Decision | Issue list, issue detail, wiki, and non-conversation comments do not register Hermes intents. Live events for those surfaces are not applied. |
| Rationale | No handler means no intent, which means Hermes does not put the socket in that composite room. |
| Implications | Shipping live updates for a new screen is an explicit register map on that screen, plus Gaia already publishing the name. |

### D-012 — Live-update tests use Mirage + Fake Hermes (no Gaia)

| | |
|---|---|
| Status | Accepted |
| Decision | Prometheus live-update tests run inside `ember test` only: Mirage for REST, a FakeSocket for Hermes (`tests/helpers/hermes-fake.js`, `@setupHermesFake`). QUnit covers service/handler rules; Yadda covers thin per-screen smokes. Remote updates are injected as V2 envelopes (no second browser). |
| Rationale | Gaia already covers publish rules and real REST→Hermes wiring via PHPUnit and api-tester `--mode live`. Duplicating that stack in Prometheus would couple CI to Gaia/Hermes compose and slow acceptance. Mirage already owns REST in Yadda; Socket.IO is a different channel Mirage cannot answer. |
| Implications | Do not point acceptance tests at `hermes-test` or Gaia for live coverage. Do not replace the whole `hermes` service in acceptance (keep real register/dispatch/echo). True dual-session A→B E2E (Playwright/Cypress + Gaia) is a separate track if needed later. Operator detail: `architecture.md` § Testing. |

---

## Open questions

- Replace `user:<userId>` in the `projectId` field with a dedicated `scope` (requires Gaia + Hermes).
- Live handlers for issue comments, wiki, activity, or issue list/detail.
- Whether board and gantt should keep sharing `utils/live/assignee.js` or keep assignee patching local to each controller.
