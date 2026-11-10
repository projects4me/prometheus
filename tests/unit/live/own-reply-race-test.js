import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import EmberObject from "@ember/object";
import { A } from "@ember/array";
import JSONAPIAdapter from "@ember-data/adapter/json-api";
import JSONAPISerializer from "@ember-data/serializer/json-api";
import { installFakeHermes } from "../../helpers/hermes-fake";
import ThreadComments from "prometheus/utils/state/thread-comments";
import IssueDetails from "prometheus/components/issue/issue-details";

/**
 * aprom-4449: Gaia publishes conversation.comment.created to Hermes before it answers the POST, and Hermes sends it to
 * every socket in the room, the sender's too. The sender's browser can therefore get the event (and push the comment
 * with its server id) while its own comment.save() is still pending. These tests use the real Ember Data store and hold
 * the save open until the event has been handled.
 *
 * Finding: Ember Data 4.1 neither asserts nor merges. The pushed record and the saved createRecord record both end up
 * with the id, so the store holds two `comment` records for one comment and the open thread and the issue page list the
 * reply twice. The tests are `test.todo` until the fix (aprom-4463) lands (QUnit fails a todo once all its assertions
 * pass); turn them into plain tests with the fix.
 */
module("Unit | Live | own reply race", function (hooks) {
  setupTest(hooks);
  installFakeHermes(hooks);

  const ROOM = "room-1";
  const ID = "c1";

  function savedDocument() {
    return {
      data: {
        id: ID,
        type: "comment",
        attributes: { comment: "hello", relatedId: ROOM, relatedTo: "conversationrooms" },
      },
    };
  }

  function createdEnvelope() {
    return {
      eventName: "conversation.comment.created",
      resource: { type: "comment", id: ID },
      changes: { relatedId: ROOM, relatedTo: "conversationrooms", comment: "hello" },
      meta: { conversationId: ROOM },
    };
  }

  // Holds the comment POST open: `posted` resolves once the adapter is called, `respond()` answers it
  function holdCommentSave(owner) {
    let gate = {};
    gate.posted = new Promise((resolve) => (gate.onPost = resolve));
    let response = new Promise((resolve) => (gate.respond = () => resolve(savedDocument())));
    owner.register(
      "adapter:comment",
      class extends JSONAPIAdapter {
        createRecord() {
          gate.onPost();
          return response;
        }

        // The issue page loads a live-created comment by id
        findRecord() {
          return Promise.resolve(savedDocument());
        }
      }
    );
    owner.register(
      "serializer:comment",
      class extends JSONAPISerializer {
        keyForAttribute(key) {
          return key;
        }
      }
    );
    return gate;
  }

  async function settle(promise) {
    try {
      return { value: await promise };
    } catch (error) {
      return { error };
    }
  }

  test.todo("open thread: the created event arrives before the save resolves", async function (assert) {
    let gate = holdCommentSave(this.owner);
    let store = this.owner.lookup("service:store");
    let layout = this.owner.lookup("controller:app.project.conversation");
    let room = EmberObject.create({ id: ROOM, roomType: "discussion", comments: A([]), votes: A([]) });
    layout.set("selectedConversation", room);
    Object.defineProperty(layout, "listedConversations", { configurable: true, get: () => A([room]) });

    let page = this.owner.lookup("controller:app.project.conversation.page");
    page.layout = layout;
    page.threadComments = new ThreadComments({ store, owner: page });
    page.threadComments.roomId = ROOM;

    let posting = page.postComment(ROOM, "hello", []);
    await gate.posted;
    layout.handleCommentCreated(createdEnvelope());
    page.handleCommentCreated(createdEnvelope());
    gate.respond();
    let result = await settle(posting);

    assert.notOk(result.error, `the save resolves without an error${result.error ? `: ${result.error.message}` : ""}`);
    assert.deepEqual(
      page.threadComments.items.map((comment) => comment.id),
      [ID],
      "the reply is shown once"
    );
    assert.strictEqual(store.peekAll("comment").length, 1, "the store holds one comment record");
  });

  test.todo("other room: the created event arrives before the save resolves", async function (assert) {
    let gate = holdCommentSave(this.owner);
    let store = this.owner.lookup("service:store");
    let layout = this.owner.lookup("controller:app.project.conversation");
    let room = EmberObject.create({ id: ROOM, roomType: "discussion", comments: A([]), votes: A([]) });
    layout.set("selectedConversation", null);
    Object.defineProperty(layout, "listedConversations", { configurable: true, get: () => A([room]) });

    let posting = layout.saveComment(ROOM, "hello", []);
    await gate.posted;
    layout.handleCommentCreated(createdEnvelope());
    gate.respond();
    let result = await settle(posting);

    assert.notOk(result.error, `the save resolves without an error${result.error ? `: ${result.error.message}` : ""}`);
    assert.deepEqual(
      room.comments.map((comment) => comment.id),
      [ID],
      "the reply is listed once"
    );
    assert.strictEqual(store.peekAll("comment").length, 1, "the store holds one comment record");
  });

  test.todo("issue page: the created event arrives before the save resolves", async function (assert) {
    let gate = holdCommentSave(this.owner);
    let store = this.owner.lookup("service:store");
    let issue = EmberObject.create({ id: "i1", conversationRoomId: ROOM, comments: A([]) });

    let page = this.owner.lookup("controller:app.project.issue.page");
    Object.defineProperty(page, "currentUser", { configurable: true, value: { user: { id: "u1" } } });
    page.issue = issue;

    // The issue details component saves the reply with its own store; only `store` is read by _createComment
    let posting = IssueDetails.prototype._createComment.call({ store }, issue, "hello", []);
    await gate.posted;
    let live = page.applyCommentCreated({ ...createdEnvelope(), actorId: "u1" });
    await live;
    gate.respond();
    let result = await settle(posting);

    assert.notOk(result.error, `the save resolves without an error${result.error ? `: ${result.error.message}` : ""}`);
    assert.deepEqual(
      issue.comments.map((comment) => comment.id),
      [ID],
      "the reply is listed once"
    );
    assert.strictEqual(store.peekAll("comment").length, 1, "the store holds one comment record");
  });
});
