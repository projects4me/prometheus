import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { resolveHermesUrl } from "prometheus/utils/live/url";
import { installFakeHermes } from "../../helpers/hermes-fake";

module("Integration | Service | hermes", function (hooks) {
  setupTest(hooks);

  function attachConnectedSocket(service, options = {}) {
    let emissions = options.emissions || [];
    let rejected = options.rejected || [];
    let socket = {
      connected: options.connected !== false,
      emissions,
      emit(name, payload, ack) {
        emissions.push({ name, payload });
        if (typeof ack === "function") {
          ack({
            revision: payload.revision,
            accepted: payload.intents,
            rejected,
          });
        }
      },
      off() {},
      disconnect() {},
    };
    service.socket = socket;
    service.authToken = null;
    return socket;
  }

  test("aggregates owner intents and disposes them idempotently", function (assert) {
    let service = this.owner.lookup("service:hermes");
    let socket = attachConnectedSocket(service);
    let calls = [];
    let firstOwner = {};
    let secondOwner = {};
    let disposeFirst = service.register(firstOwner, "project-1", {
      "issue.created": (event) => calls.push(event.eventId),
    });
    let disposeSecond = service.register(secondOwner, "project-1", {
      "issue.created": () => calls.push("second"),
    });

    assert.deepEqual(
      service.desiredIntents,
      [{ projectId: "project-1", eventName: "issue.created" }],
      "duplicate owner interests produce one desired intent"
    );
    assert.strictEqual(
      socket.emissions.filter((item) => item.name === "intents:set").length,
      1,
      "an unchanged aggregate is not resent"
    );

    service.dispatchDomainEvent({
      schemaVersion: 2,
      eventId: "event-1",
      eventName: "issue.created",
      projectId: "project-1",
    });
    assert.deepEqual(calls, ["event-1", "second"]);

    disposeFirst();
    disposeFirst();
    assert.strictEqual(service.desiredIntents.length, 1);

    disposeSecond();
    assert.strictEqual(service.desiredIntents.length, 0);
    assert.deepEqual(
      socket.emissions
        .filter((item) => item.name === "intents:set")
        .map((item) => item.payload.revision),
      [0, 1],
      "full snapshots use increasing revisions"
    );
  });

  test("dispatches only by matching project and event name", function (assert) {
    let service = this.owner.lookup("service:hermes");
    attachConnectedSocket(service, { connected: false });
    let calls = 0;
    service.register({}, "project-1", {
      "issue.status.changed": () => calls++,
    });

    service.dispatchDomainEvent({
      schemaVersion: 2,
      eventName: "issue.status.changed",
      projectId: "project-2",
    });
    service.dispatchDomainEvent({
      schemaVersion: 2,
      eventName: "issue.created",
      projectId: "project-1",
    });
    service.dispatchDomainEvent({
      schemaVersion: 2,
      eventName: "issue.status.changed",
      projectId: "project-1",
    });

    assert.strictEqual(calls, 1);
  });

  test("deduplicates domain events by eventId", function (assert) {
    let service = this.owner.lookup("service:hermes");
    attachConnectedSocket(service, { connected: false });
    let calls = 0;
    service.register({}, "project-1", {
      "issue.created": () => calls++,
    });

    let envelope = {
      schemaVersion: 2,
      eventId: "evt-dup",
      eventName: "issue.created",
      projectId: "project-1",
    };
    service.dispatchDomainEvent(envelope);
    service.dispatchDomainEvent(envelope);

    assert.strictEqual(calls, 1);
  });

  test("reconnect forces a new intent snapshot", function (assert) {
    let service = this.owner.lookup("service:hermes");
    let socket = attachConnectedSocket(service);
    service.register({}, "project-1", {
      "issue.created": () => {},
    });
    service.reconcileIntents(true);

    assert.deepEqual(
      socket.emissions.map((item) => item.payload.revision),
      [0, 1]
    );
  });

  test("resolves the Hermes URL to the page hostname", function (assert) {
    assert.strictEqual(
      resolveHermesUrl("http://localhost:9000", { hostname: "127.0.0.1" }),
      "http://127.0.0.1:9000"
    );
    assert.strictEqual(
      resolveHermesUrl("http://127.0.0.1:9000", { hostname: "localhost" }),
      "http://localhost:9000"
    );
    assert.strictEqual(
      resolveHermesUrl("http://hermes.internal:9000", { hostname: "127.0.0.1" }),
      "http://hermes.internal:9000"
    );
  });

  test("drops matching domain events after noteLocalWrite", function (assert) {
    let service = this.owner.lookup("service:hermes");
    attachConnectedSocket(service, { connected: false });
    let calls = [];
    service.register({}, "project-1", {
      "issue.status.changed": (event) => calls.push(event.eventId),
    });

    service.noteLocalWrite("issue", "issue-1");
    service.dispatchDomainEvent({
      schemaVersion: 2,
      eventId: "echo-1",
      eventName: "issue.status.changed",
      projectId: "project-1",
      resource: { type: "issue", id: "issue-1" },
    });
    service.dispatchDomainEvent({
      schemaVersion: 2,
      eventId: "echo-2",
      eventName: "issue.status.changed",
      projectId: "project-1",
      resource: { type: "issue", id: "issue-1" },
    });
    service.dispatchDomainEvent({
      schemaVersion: 2,
      eventId: "peer-1",
      eventName: "issue.status.changed",
      projectId: "project-1",
      resource: { type: "issue", id: "issue-2" },
    });

    assert.deepEqual(calls, ["peer-1"]);
  });

  test("dispatches a local write after its echo window expires", function (assert) {
    let service = this.owner.lookup("service:hermes");
    attachConnectedSocket(service, { connected: false });
    let calls = 0;
    service.register({}, "project-1", {
      "issue.status.changed": () => calls++,
    });

    service.noteLocalWrite("issue", "issue-1", -1);
    service.dispatchDomainEvent({
      schemaVersion: 2,
      eventId: "after-ttl",
      eventName: "issue.status.changed",
      projectId: "project-1",
      resource: { type: "issue", id: "issue-1" },
    });

    assert.strictEqual(calls, 1);
  });

  test("ignores invalid envelopes", function (assert) {
    let service = this.owner.lookup("service:hermes");
    attachConnectedSocket(service, { connected: false });
    let calls = 0;
    service.register({}, "project-1", {
      "issue.created": () => calls++,
    });

    service.dispatchDomainEvent(null);
    service.dispatchDomainEvent({
      schemaVersion: 1,
      eventName: "issue.created",
      projectId: "project-1",
    });
    service.dispatchDomainEvent({
      schemaVersion: 2,
      eventName: "issue.created",
    });
    service.dispatchDomainEvent({
      schemaVersion: 2,
      projectId: "project-1",
    });

    assert.strictEqual(calls, 0);
  });

  test("unknown event names do not throw", function (assert) {
    let service = this.owner.lookup("service:hermes");
    attachConnectedSocket(service, { connected: false });
    service.register({}, "project-1", {
      "issue.created": () => {},
    });

    service.dispatchDomainEvent({
      schemaVersion: 2,
      eventId: "unknown-1",
      eventName: "issue.deleted",
      projectId: "project-1",
    });

    assert.ok(true, "unknown event names are ignored");
  });

  test("handler throw is isolated per owner", function (assert) {
    let service = this.owner.lookup("service:hermes");
    attachConnectedSocket(service, { connected: false });
    let secondCalls = 0;
    service.register({}, "project-1", {
      "issue.created": () => {
        throw new Error("boom");
      },
    });
    service.register({}, "project-1", {
      "issue.created": () => secondCalls++,
    });

    service.dispatchDomainEvent({
      schemaVersion: 2,
      eventId: "throw-1",
      eventName: "issue.created",
      projectId: "project-1",
    });

    assert.strictEqual(secondCalls, 1);
  });

  test("clearRegistrations empties intents", function (assert) {
    let service = this.owner.lookup("service:hermes");
    let socket = attachConnectedSocket(service);
    service.register({}, "project-1", {
      "issue.created": () => {},
    });
    assert.strictEqual(service.desiredIntents.length, 1);

    service.clearRegistrations();
    assert.strictEqual(service.desiredIntents.length, 0);
    assert.ok(
      socket.emissions.some(
        (item) =>
          item.name === "intents:set" && item.payload.intents.length === 0
      )
    );
  });

  test("stale and rejected intent acks are handled safely", function (assert) {
    let service = this.owner.lookup("service:hermes");
    attachConnectedSocket(service);
    service.lastSentRevision = 5;

    service.handleIntentAck(3, {
      revision: 3,
      accepted: [],
      rejected: [],
    });
    assert.strictEqual(service.lastAck, null, "stale revision ignored");

    service.handleIntentAck(5, { revision: 99, accepted: [], rejected: [] });
    assert.ok(service.lastError, "mismatched ack sets lastError");

    service.handleIntentAck(5, {
      revision: 5,
      accepted: [],
      rejected: [{ projectId: "p", eventName: "x" }],
    });
    assert.ok(
      service.lastError.message.includes("rejected"),
      "rejected intents set lastError"
    );

    service.handleIntentAck(5, {
      revision: 5,
      accepted: [],
      rejected: [],
    });
    assert.strictEqual(service.lastError, null, "good ack clears lastError");
  });
});

module("Integration | Service | hermes reconnect", function (hooks) {
  setupTest(hooks);
  installFakeHermes(hooks);

  hooks.beforeEach(function () {
    this.originalMessenger = window.Messenger;
    this.messengerPosts = 0;
    let posts = { count: 0 };
    this._posts = posts;
    window.Messenger = class {
      post() {
        posts.count++;
        return { update() {}, cancel() {} };
      }
    };
  });

  hooks.afterEach(function () {
    window.Messenger = this.originalMessenger;
  });

  test("R1: connect handler forces intents:set after reconnect", function (assert) {
    let hermes = this.owner.lookup("service:hermes");
    hermes.connect();
    hermes.register({}, "project-1", {
      "issue.status.changed": () => {},
    });

    let socket = hermes.socket;
    let before = socket.emissions.filter((e) => e.name === "intents:set").length;

    socket.connected = false;
    socket.simulateConnect();

    let after = socket.emissions.filter((e) => e.name === "intents:set").length;
    assert.ok(after > before, "reconnect forces a new intents:set");
    assert.strictEqual(hermes.registrations.size, 1, "registrations retained");
  });

  test("R2: domain events dispatch after reconnect", function (assert) {
    let hermes = this.owner.lookup("service:hermes");
    hermes.connect();
    let calls = 0;
    hermes.register({}, "project-1", {
      "issue.status.changed": () => calls++,
    });

    hermes.socket.connected = false;
    hermes.socket.simulateConnect();

    hermes.dispatchDomainEvent({
      schemaVersion: 2,
      eventId: "after-up",
      eventName: "issue.status.changed",
      projectId: "project-1",
    });

    assert.strictEqual(calls, 1);
  });

  test("R3: reconcile is a no-op while disconnected", function (assert) {
    let hermes = this.owner.lookup("service:hermes");
    hermes.connect();
    hermes.register({}, "project-1", {
      "issue.created": () => {},
    });
    let socket = hermes.socket;
    let count = socket.emissions.length;

    socket.connected = false;
    hermes.reconcileIntents(true);

    assert.strictEqual(socket.emissions.length, count);
    assert.strictEqual(hermes.registrations.size, 1);
  });

  test("R4: connect_error sets lastError without Messenger UI", function (assert) {
    let hermes = this.owner.lookup("service:hermes");
    hermes.connect();
    hermes.socket.simulateConnectError(new Error("Hermes down"));

    assert.ok(hermes.lastError);
    assert.strictEqual(
      this._posts.count,
      0,
      "no Messenger toast on connect_error"
    );
  });

  test("R5: good intents ack after reconnect clears lastError", function (assert) {
    let hermes = this.owner.lookup("service:hermes");
    hermes.connect();
    hermes.register({}, "project-1", {
      "issue.created": () => {},
    });
    hermes.socket.simulateConnectError(new Error("down"));
    assert.ok(hermes.lastError);

    hermes.socket.simulateConnect();
    assert.strictEqual(
      hermes.lastError,
      null,
      "successful intents:set ack clears lastError"
    );
  });
});
