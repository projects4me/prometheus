# Live updates — Prometheus

Prometheus consumes live updates. After login it holds one Socket.IO
connection. Each mounted screen (and the notifications service) registers only
the events it can apply. Prometheus does not publish domain events and does
not name Hermes rooms.

Hermes relay contract: sibling repo `hermes/ARCHITECTURE.md`.
Gaia publishing: sibling repo `gaia/docs/architecture/live-updates/`.

```
loading-assets / app
        │  hermes.connect()  auth.token
        │  notifications.startLiveSync()
        ▼
   hermes service  (one socket)
        │
        │  intents:set  { projectId, eventName }[]
        ▼
     Hermes
        │  domain:event
        ▼
  matching register() handlers
  (board / gantt / conversation / notifications)
```

## Ownership in this repo

| Piece | Job |
|---|---|
| `hermes` service | Connect, send the aggregated intent snapshot, drop echoes and duplicates, fan events to owners. |
| Session routes | Connect after assets load; start notification live sync. |
| Logout (`app` controller) | Stop notification live sync, clear registrations, disconnect. |
| Board / gantt / conversation controllers | Own the event-name → handler map for that screen. |
| Those routes | Call `registerHermesIntents` / `unregisterHermesIntents` on enter/exit. |
| `notifications` service | Own `notification.created` for `user:<me>`. |
| REST adapter | `noteLocalWrite` so this tab ignores its own echo. |

The hermes service does not know kanban columns, gantt bars, or comment
threads. Those live in the controller handlers.

## Session lifecycle

1. Signed-in `loading-assets` (and `app` if assets are already loaded) calls
   `hermes.connect()` with `auth.token` from ember-simple-auth, then
   `notifications.startLiveSync()`.
2. A mounted project route calls `controller.registerHermesIntents(projectId)`.
   That controller’s disposer is cleared in the route’s exit hook.
3. Logout calls `notifications.stopLiveSync()`, `hermes.clearRegistrations()`,
   `hermes.disconnect()`.

Reconnect creates a new socket with no intents. The service resends the
current snapshot (`intents:set`) with a new revision.

## Which screens register which events

Event names are string keys on each `hermes.register(...)` map. There is no
shared event catalog.

| Owner | Scope | Events |
|---|---|---|
| Board controller | tracked project id | `issue.status.changed`, `issue.assignee.changed`, `milestone.created`, `milestone.completed`, `issue.created` |
| Gantt controller | tracked project id | `issue.dates.changed`, `issue.dependency.created`, `issue.dependency.deleted`, `issue.assignee.changed`, `issue.created` |
| Conversation controller | tracked project id | `conversation.comment.created/updated/deleted`, `conversation.vote.added/removed`, `conversation.created` |
| Notifications service | `user:<currentUser.id>` | `notification.created` |

Issue list, issue detail, wiki, and issue comments are not live.

## Client contract (what this app sends)

Handshake: Socket.IO `auth.token` (OAuth access token).

```json
{
  "protocolVersion": 2,
  "revision": 7,
  "intents": [
    { "projectId": "project-uuid", "eventName": "issue.status.changed" }
  ]
}
```

`register()` merges every owner into one snapshot. Duplicate
`(projectId, eventName)` pairs from two screens are sent once. Hermes
acknowledges `{ revision, accepted, rejected }`.

Inbound `domain:event` is dispatched only to owners whose `projectId` and
handler key match. `eventId` is remembered so retries are dropped. The
saving tab’s echo is dropped when the adapter called `noteLocalWrite`.

## Config

`config/environment.js` → `ENV.hermes.url` (`HERMES_URL_DEV` /
`HERMES_URL_PRODUCTION`). `resolveHermesUrl` rewrites loopback hosts to
`window.location.hostname` so Firefox `127.0.0.1` vs `localhost` does not
fail CORS.

## Key files

| Area | Path |
|---|---|
| Socket client | `app/services/hermes.js` |
| URL rewrite | `app/utils/live/url.js` |
| List helpers | `app/utils/live/collection.js` |
| Assignee patch | `app/utils/live/assignee.js` |
| Session start | `app/routes/app/loading-assets.js`, `app/routes/app.js` |
| Logout | `app/controllers/app.js` |
| Notifications live | `app/services/notifications.js` |
| Board | `app/controllers/app/project/board.js`, `app/routes/app/project/board.js` |
| Gantt | `app/controllers/app/project/gantt.js`, `app/routes/app/project/gantt.js` |
| Conversations | `app/controllers/app/project/conversation.js`, `app/routes/app/project/conversation.js` |
| Echo suppression | `app/adapters/application.js` |
| Fake Hermes helper | `tests/helpers/hermes-fake.js` |
| Yadda live steps | `tests/acceptance/steps/live/hermes-live-steps.js` |
| Live features | `tests/acceptance/live/*.feature` |

## Testing

Two layers cover Prometheus → Hermes *consumption*: QUnit for service and
handler *rules*, and Yadda acceptance (Mirage REST + FakeSocket) for screen
wiring. Gaia publish / api-tester live mode stays in the Gaia repo. Decision
D-012 in `decisions.md` records why tests stay Mirage-only.

Constraints: **no Gaia**, **no running Hermes process**, Mirage for HTTP as
usual. Remote updates are injected at the Hermes client boundary.

```
ember test (Chrome / Testem)
  ├─ QUnit  → real hermes service + FakeSocket / stubs
  └─ Yadda  → Mirage REST + @setupHermesFake → inject domain:event
```

### QUnit vs Yadda

| Put it in **QUnit** when… | Put it in **Yadda** when… |
|---|---|
| Logic in `hermes` service, handlers, echo, reconnect, acks | User journey: sign-in → open screen → see live change |
| Many combinations / negatives | One happy-path smoke per live screen |
| No need for full route + Mirage seed | Needs Mirage data + `@setupApplicationTest` |

**Bias: QUnit-first.** Gherkin is a thin smoke layer, not a second copy of
every handler test.

### Fake Hermes

Live features annotate:

```gherkin
@setupApplicationTest
@setupHermesFake
Feature: Live | …
```

`@setupHermesFake` (see `tests/helpers/yadda-annotations.js`) calls
`installFakeHermes` from `tests/helpers/hermes-fake.js`. That overrides
`hermes.connect()` so it never calls real `io()`. The production
`register` / `dispatchDomainEvent` / echo / dedupe path still runs.

Shared steps: `tests/acceptance/steps/live/hermes-live-steps.js`
(registered from `tests/acceptance/steps/steps.js`).

**Remote update** = inject a V2 envelope via `hermes.dispatchDomainEvent`
with `actorId` ≠ the signed-in user and **without** `noteLocalWrite`. That
is the consumer path for “User A produced, User B sees.” There is no second
browser session in these tests.

### Reconnect (Hermes down → up)

| Piece | Behavior |
|---|---|
| Transport retry | Socket.IO client defaults (`reconnection: true`); Prometheus does not disable them |
| Intent resubscribe | On `connect`, `reconcileIntents(true)` resends the full snapshot |
| User-visible error | `connect_error` only sets `lastError` + `console.error` — no Messenger toast |

### Unit / integration (QUnit)

| File | Covers |
|---|---|
| `tests/integration/services/hermes-test.js` | Intent aggregation, dispatch filters, echo TTL, invalid envelopes, handler isolation, acks, reconnect R1–R5 |
| `tests/unit/controllers/app/project/board-live-test.js` | Status / assignee / milestone / created → reload prompt; unregister |
| `tests/unit/controllers/app/project/gantt-live-test.js` | Dates, dependencies, assignee, created → prompt; unregister |
| `tests/unit/controllers/app/project/conversation-live-test.js` | Comment / vote CRUD, other-room ignore, created → prompt; unregister |
| `tests/integration/services/notifications-test.js` | `startLiveSync` / `stopLiveSync`, prepend, wrong-user scope |
| `tests/unit/live/session-lifecycle-test.js` | Logout clears hermes; issue list has no register |

Example filter:

```bash
TRAVIS=true COVERAGE=false ember test --filter="hermes"
TRAVIS=true COVERAGE=false ember test --filter="live events"
```

### Acceptance (Yadda + Mirage)

| Feature | Smoke |
|---|---|
| `tests/acceptance/live/board-live-updates.feature` | S1: after sign-in, fake Hermes connected + notification intent; B6: remote `issue.status.changed` updates board DOM |
| `tests/acceptance/live/conversation-live-updates.feature` | C6: remote comment appears on open room |
| `tests/acceptance/live/notifications-live-updates.feature` | N4: remote `notification.created` bumps unread |
| `tests/acceptance/live/gantt-live-updates.feature` | G6: remote `issue.dates.changed` updates gantt model |

```bash
TRAVIS=true COVERAGE=false ember test --filter="Feature: Live"
```

### Out of scope (this repo)

- Two real browser sessions (A PATCH → B UI)
- Real Hermes / Gaia compose for Prometheus CI
- Gaia fail-open REST (covered on the Gaia side)
- Live sync for screens that intentionally do not register (beyond “does not register”)
