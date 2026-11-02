import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import EmberObject from "@ember/object";
import { A } from "@ember/array";
import { installFakeHermes, emitDomainEvent } from "../../../../helpers/hermes-fake";

module("Unit | Controller | app/project/issue/page live events", function (hooks) {
  setupTest(hooks);
  installFakeHermes(hooks);

  let toasts;
  let originalMessenger;

  hooks.beforeEach(function () {
    toasts = [];
    originalMessenger = window.Messenger;
    window.Messenger = function () {
      return { post: (options) => toasts.push(options) };
    };
  });

  hooks.afterEach(function () {
    window.Messenger = originalMessenger;
  });

  const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

  function setup(owner, { failFind = false } = {}) {
    let controller = owner.lookup("controller:app.project.issue.page");
    let users = {
      u1: EmberObject.create({ id: "u1", name: "Me" }),
      u2: EmberObject.create({ id: "u2", name: "Other" }),
      u3: EmberObject.create({ id: "u3", name: "Third" }),
    };
    let comments = A([EmberObject.create({ id: "c1", reload: () => Promise.resolve(), unloadRecord() {} })]);
    let issue = EmberObject.create({ id: "i1", conversationRoomId: "room1", comments, status: "new", statusId: "s1" });
    let store = {
      peekRecord: (type, id) => (type === "user" ? users[id] : null),
      findRecord(type, id) {
        if (failFind) {
          return Promise.reject(new Error("boom"));
        }
        return Promise.resolve(EmberObject.create({ id }));
      },
    };
    Object.defineProperty(controller, "store", { value: store, configurable: true });
    Object.defineProperty(controller, "currentUser", { value: { user: users.u1 }, configurable: true });
    controller.issue = issue;
    controller.issueStatuses = [{ id: "s1", name: "new" }, { id: "s2", name: "in_progress" }];
    controller.registerHermesIntents("p1");
    return { controller, issue, comments };
  }

  function status(id, changes, actorId = "u2") {
    return { eventName: "issue.status.changed", projectId: "p1", resourceType: "issue", resourceId: id, actorId, changes };
  }

  function comment(name, id, room, actorId = "u2") {
    return {
      eventName: name,
      projectId: "p1",
      resourceType: "comment",
      resourceId: id,
      actorId,
      meta: { conversationId: room },
      changes: { relatedId: room },
    };
  }

  test("status is applied for the open issue and ignored for another", async function (assert) {
    let { issue } = setup(this.owner);
    emitDomainEvent(this.owner, status("i2", { status: "done", statusId: "s2" }));
    await tick();
    assert.equal(issue.status, "new");
    emitDomainEvent(this.owner, status("i1", { status: "in_progress", statusId: "s2" }));
    await tick();
    assert.equal(issue.status, "in_progress");
    assert.equal(issue.statusId, "s2");
    assert.equal(toasts.length, 1);
  });

  test("a statusId-only change resolves the status name", async function (assert) {
    let { issue } = setup(this.owner);
    emitDomainEvent(this.owner, status("i1", { statusId: "s2" }));
    await tick();
    assert.equal(issue.status, "in_progress");
    assert.equal(issue.statusId, "s2");
  });

  test("assignee is applied, cleared and ignored for another issue", async function (assert) {
    let { issue } = setup(this.owner);
    let event = (id, assignee) => ({
      eventName: "issue.assignee.changed", projectId: "p1", resourceType: "issue", resourceId: id, actorId: "u2", changes: { assignee },
    });
    emitDomainEvent(this.owner, event("i2", "u3"));
    await tick();
    assert.notOk(issue.assignedTo);
    emitDomainEvent(this.owner, event("i1", "u3"));
    await tick();
    assert.equal(issue.assignedTo.id, "u3");
    emitDomainEvent(this.owner, event("i1", null));
    await tick();
    assert.strictEqual(issue.assignedTo, null);
  });

  test("a comment is added once and ignored for another room", async function (assert) {
    let { comments } = setup(this.owner);
    emitDomainEvent(this.owner, comment("conversation.comment.created", "c2", "other-room"));
    await tick();
    assert.equal(comments.length, 1);
    emitDomainEvent(this.owner, comment("conversation.comment.created", "c2", "room1"));
    await tick();
    emitDomainEvent(this.owner, comment("conversation.comment.created", "c2", "room1"));
    emitDomainEvent(this.owner, comment("conversation.comment.created", "c2", "room1"));
    await tick();
    assert.deepEqual(comments.map((c) => c.id), ["c1", "c2"]);
  });

  test("a comment update reloads it and a delete removes it without a toast", async function (assert) {
    let { comments } = setup(this.owner);
    let reloads = 0;
    let unloaded = 0;
    let existing = comments.objectAt(0);
    existing.reload = () => { reloads++; return Promise.resolve(); };
    existing.unloadRecord = () => { unloaded++; };
    emitDomainEvent(this.owner, comment("conversation.comment.updated", "c1", "room1"));
    await tick();
    assert.equal(reloads, 1);
    assert.equal(toasts.length, 1);
    emitDomainEvent(this.owner, comment("conversation.comment.deleted", "c1", "room1"));
    await tick();
    assert.equal(comments.length, 0);
    assert.equal(unloaded, 1);
    assert.equal(toasts.length, 1, "no toast for a delete");
  });

  test("a toast shows only for another actor", async function (assert) {
    let { issue } = setup(this.owner);
    emitDomainEvent(this.owner, status("i1", { status: "in_progress" }, "u1"));
    await tick();
    assert.equal(issue.status, "in_progress", "own change is applied");
    assert.equal(toasts.length, 0);
    emitDomainEvent(this.owner, status("i1", { status: "done" }, "u2"));
    await tick();
    assert.equal(toasts.length, 1);
    assert.equal(toasts[0].type, "info");
  });

  test("a failed findRecord leaves the page unchanged", async function (assert) {
    let { comments } = setup(this.owner, { failFind: true });
    let warn = console.warn; // eslint-disable-line no-console
    console.warn = () => {}; // eslint-disable-line no-console
    try {
      emitDomainEvent(this.owner, comment("conversation.comment.created", "c2", "room1"));
      await tick();
    } finally {
      console.warn = warn; // eslint-disable-line no-console
    }
    assert.equal(comments.length, 1);
    assert.equal(toasts.length, 0);
  });

  test("unregistering removes the intents", async function (assert) {
    let { controller, issue } = setup(this.owner);
    controller.unregisterHermesIntents();
    emitDomainEvent(this.owner, status("i1", { status: "done" }));
    await tick();
    assert.equal(issue.status, "new");
  });
});
