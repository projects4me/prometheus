import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import EmberObject from "@ember/object";
import { A } from "@ember/array";
import { installFakeHermes } from "../../../../helpers/hermes-fake";
import { pushIfMissing } from "prometheus/utils/live/collection";

module("Unit | Controller | app/project/conversation live events", function (hooks) {
  setupTest(hooks);
  installFakeHermes(hooks);

  function setupRoom(controller) {
    let comments = A([]);
    let votes = A([]);
    let room = EmberObject.create({
      id: "room-1",
      comments,
      votes,
    });
    controller.set("conversations", A([room]));
    controller.set("selectedConversation", room);

    let records = Object.create(null);
    let store = {
      peekRecord(modelName, id) {
        return records[`${modelName}:${id}`] || null;
      },
      push(doc) {
        let record = EmberObject.create({
          id: doc.data.id,
          ...doc.data.attributes,
          setProperties(attrs) {
            Object.keys(attrs || {}).forEach((key) => this.set(key, attrs[key]));
          },
        });
        records[`${doc.data.type}:${doc.data.id}`] = record;
        return record;
      },
    };
    Object.defineProperty(controller, "store", {
      configurable: true,
      get() {
        return store;
      },
    });

    return { room, comments, votes, store, records };
  }

  test("comment and vote handlers update the matching conversation collections", function (assert) {
    let controller = this.owner.lookup("controller:app.project.conversation");
    let { comments, votes } = setupRoom(controller);

    controller.handleCommentCreated({
      resource: { id: "c1" },
      changes: { relatedId: "room-1", comment: "hello" },
      meta: { conversationId: "room-1" },
    });
    controller.handleCommentCreated({
      resource: { id: "c1" },
      changes: { relatedId: "room-1", comment: "hello" },
      meta: { conversationId: "room-1" },
    });
    assert.strictEqual(comments.length, 1, "duplicate create is idempotent");

    controller.handleVoteAdded({
      resource: { id: "v1" },
      changes: { relatedId: "room-1", vote: true },
      meta: { conversationId: "room-1" },
    });
    assert.strictEqual(votes.length, 1);

    controller.handleVoteRemoved({
      resource: { id: "v1" },
      meta: { conversationId: "room-1" },
    });
    assert.strictEqual(votes.length, 0);

    controller.handleCommentDeleted({
      resource: { id: "c1" },
      meta: { conversationId: "room-1" },
    });
    assert.strictEqual(comments.length, 0);
  });

  test("comment created applies dateModified from changes", function (assert) {
    let controller = this.owner.lookup("controller:app.project.conversation");
    let { comments, records } = setupRoom(controller);

    controller.handleCommentCreated({
      resource: { id: "c1" },
      changes: {
        relatedId: "room-1",
        comment: "hello",
        dateCreated: "2026-08-28 12:34:56",
        dateModified: "2026-08-28 12:34:56",
      },
      meta: { conversationId: "room-1" },
    });

    assert.strictEqual(comments.length, 1);
    assert.strictEqual(
      records["comment:c1"].get("dateModified"),
      "2026-08-28 12:34:56"
    );
  });

  test("save after live create does not duplicate the comment", function (assert) {
    let controller = this.owner.lookup("controller:app.project.conversation");
    let { comments, records } = setupRoom(controller);

    controller.handleCommentCreated({
      resource: { id: "c1" },
      changes: { relatedId: "room-1", comment: "hello" },
      meta: { conversationId: "room-1" },
    });

    pushIfMissing(comments, records["comment:c1"]);
    assert.strictEqual(comments.length, 1, "save-after-live stays idempotent");
  });

  test("comment updated patches body", function (assert) {
    let controller = this.owner.lookup("controller:app.project.conversation");
    let { comments, records } = setupRoom(controller);

    controller.handleCommentCreated({
      resource: { id: "c1" },
      changes: { relatedId: "room-1", comment: "hello" },
      meta: { conversationId: "room-1" },
    });

    controller.handleCommentUpdated({
      resource: { id: "c1" },
      changes: { relatedId: "room-1", comment: "updated" },
      meta: { conversationId: "room-1" },
    });

    assert.strictEqual(comments.length, 1);
    assert.strictEqual(records["comment:c1"].get("comment"), "updated");
  });

  test("conversation created shows reload prompt", function (assert) {
    let controller = this.owner.lookup("controller:app.project.conversation");
    let shown = 0;
    controller.liveReloadPrompt = {
      show() {
        shown++;
      },
      clear() {},
    };
    controller.router = { refresh() {} };
    Object.defineProperty(controller, "currentUser", {
      configurable: true,
      get() {
        return { user: { id: "user-1" } };
      },
    });

    controller.handleConversationCreated({ actorId: "user-2" });
    assert.strictEqual(shown, 1);
  });

  test("conversation created skips reload prompt for creating user", function (assert) {
    let controller = this.owner.lookup("controller:app.project.conversation");
    let shown = 0;
    controller.liveReloadPrompt = {
      show() {
        shown++;
      },
      clear() {},
    };
    controller.router = { refresh() {} };
    Object.defineProperty(controller, "currentUser", {
      configurable: true,
      get() {
        return { user: { id: "user-1" } };
      },
    });

    controller.handleConversationCreated({ actorId: "user-1" });
    assert.strictEqual(shown, 0);
  });

  test("comment for other room is ignored", function (assert) {
    let controller = this.owner.lookup("controller:app.project.conversation");
    let { comments } = setupRoom(controller);

    controller.handleCommentCreated({
      resource: { id: "c2" },
      changes: { relatedId: "other-room", comment: "nope" },
      meta: { conversationId: "other-room" },
    });

    assert.strictEqual(comments.length, 0);
  });

  test("unregister clears conversation hermes registration", function (assert) {
    let controller = this.owner.lookup("controller:app.project.conversation");
    let hermes = this.owner.lookup("service:hermes");
    hermes.connect();
    controller.hermes = hermes;

    controller.registerHermesIntents("project-1");
    assert.ok(
      hermes.desiredIntents.some(
        (i) => i.eventName === "conversation.comment.created"
      )
    );

    controller.unregisterHermesIntents();
    assert.strictEqual(
      hermes.desiredIntents.filter((i) => i.projectId === "project-1").length,
      0
    );
  });
});
