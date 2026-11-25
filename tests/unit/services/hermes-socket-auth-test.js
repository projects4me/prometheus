import { module, test } from "qunit";
import { setupTest } from "ember-qunit";

module("Unit | Service | hermes socket auth", function (hooks) {
  setupTest(hooks);

  function setup(owner) {
    let service = owner.lookup("service:hermes");
    let created = [];
    let session = {
      isAuthenticated: true,
      data: { authenticated: { access_token: "old" } },
      refreshes: 0,
      async ensureFreshToken() {
        this.refreshes += 1;
        this.data = { authenticated: { access_token: "new" } };
      },
    };
    service.session = session;
    service.authRetryDelayMs = 0;
    service.socketFactory = (url, options) => {
      let handlers = {};
      let socket = {
        options,
        handlers,
        connectCalls: 0,
        on(name, fn) {
          handlers[name] = fn;
        },
        off() {},
        emit() {},
        connect() {
          this.connectCalls += 1;
        },
        disconnect() {},
      };
      created.push(socket);
      return socket;
    };
    return { service, session, created };
  }

  const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

  test("handshake auth callback reads the token current at call time", function (assert) {
    let { service, session, created } = setup(this.owner);
    service.connect();
    session.data = { authenticated: { access_token: "rotated" } };
    let sent;
    created[0].options.auth((payload) => (sent = payload));
    assert.deepEqual(sent, { token: "rotated" });
    assert.strictEqual(service.connect(), created[0], "open socket reused");
    assert.strictEqual(created.length, 1);
    service.socket = null;
  });

  test("server disconnect refreshes the token then reconnects", async function (assert) {
    let { service, session, created } = setup(this.owner);
    service.connect();
    created[0].handlers.disconnect("io server disconnect");
    await settle();
    assert.strictEqual(session.refreshes, 1);
    assert.strictEqual(created[0].connectCalls, 1);
    service.socket = null;
  });

  test("client disconnect and sign-out do not reconnect", async function (assert) {
    let { service, session, created } = setup(this.owner);
    service.connect();
    created[0].handlers.disconnect("io client disconnect");
    await settle();
    assert.strictEqual(created[0].connectCalls, 0, "client disconnect");

    created[0].handlers.disconnect("io server disconnect");
    session.isAuthenticated = false;
    await settle();
    assert.strictEqual(created[0].connectCalls, 0, "signed out");
    service.socket = null;
  });

  test("auth connect_error retries a limited number of times", async function (assert) {
    let { service, created } = setup(this.owner);
    let errors = console.error;
    console.error = () => {};
    try {
      service.connect();
      for (let i = 0; i < 6; i++) {
        created[0].handlers.connect_error(new Error("unauthorized"));
        await settle();
      }
    } finally {
      console.error = errors;
    }
    assert.strictEqual(created[0].connectCalls, service.maxAuthRetries);
    service.socket = null;
  });
});
