import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import EmberObject from "@ember/object";
import ThreadComments from "prometheus/utils/state/thread-comments";
import { recordArray } from '../../../../../helpers/record-array';

module("Unit | Controller | app/project/conversation/page", function (hooks) {
  setupTest(hooks);

  function comment(id, dateCreated = `2026-01-01 00:00:0${id.slice(1)}`) {
    return EmberObject.create({ id, comment: `comment ${id}`, dateCreated });
  }

  // Answers each comments query with the next of the given responses; the last one has no next link
  function fakeStore(responses, requests = []) {
    let records = Object.create(null);
    return {
      requests,
      query(modelName, params) {
        requests.push({ modelName, params });
        let response = responses[requests.length - 1] || [];
        let result = recordArray(response, { links: requests.length < responses.length ? { next: {} } : {} });
        return Promise.resolve(result);
      },
      peekRecord(modelName, id) {
        return records[`${modelName}:${id}`] || null;
      },
      push(doc) {
        let record = EmberObject.create({ id: doc.data.id, ...doc.data.attributes });
        records[`${doc.data.type}:${doc.data.id}`] = record;
        return record;
      },
    };
  }

  function setup(owner, responses, requests) {
    let controller = owner.lookup("controller:app.project.conversation.page");
    let store = fakeStore(responses, requests);
    Object.defineProperty(controller, "store", { configurable: true, get: () => store });
    controller.threadComments = new ThreadComments({ store, pageSize: 2, owner: controller });
    Object.defineProperty(controller, "hermes", { configurable: true, get: () => ({ register: () => () => {} }) });
    return controller;
  }

  function discussion(id = "room-1") {
    return EmberObject.create({ id, roomType: "discussion" });
  }

  test("opening a discussion loads the newest comments with their own query, oldest first", async function (assert) {
    let requests = [];
    let c3 = comment("c3");
    let controller = setup(this.owner, [[comment("c4"), c3], [c3, comment("c2"), comment("c1")]], requests);

    await controller.openThread(discussion(), "project-1");

    assert.strictEqual(requests.length, 1);
    assert.strictEqual(requests[0].modelName, "comment");
    assert.strictEqual(requests[0].params.sort, "Comment.dateCreated,Comment.id");
    assert.strictEqual(requests[0].params.order, "DESC");
    assert.strictEqual(requests[0].params.limit, 2);
    assert.notOk(requests[0].params.rels, "no rels on the comments query");
    assert.notOk(requests[0].params.query.includes("dateCreated"), "the newest page has no date cursor");
    assert.deepEqual(controller.threadComments.items.map((c) => c.id), ["c3", "c4"]);
    assert.true(controller.threadComments.hasOlder);

    await controller.loadOlderComments();
    assert.ok(
      requests[1].params.query.includes("(Comment.dateCreated <: 2026-01-01 00:00:03)"),
      "the older page starts at the oldest loaded comment"
    );
    assert.strictEqual(requests[1].params.page, 1, "older pages are paged by date, not by page number");
    assert.strictEqual(requests[1].params.limit, 3, "the limit makes room for the comment at the cursor");
    assert.deepEqual(controller.threadComments.items.map((c) => c.id), ["c1", "c2", "c3", "c4"]);
    assert.false(controller.threadComments.hasOlder, "the last page has no next link");
  });

  test("a comment deleted while the thread is open does not make the next page skip one", async function (assert) {
    let c3 = comment("c3");
    let controller = setup(this.owner, [[comment("c4"), c3], [c3, comment("c2"), comment("c1")]]);
    await controller.openThread(discussion(), "project-1");

    controller.handleCommentDeleted({ resource: { id: "c4" }, meta: { conversationId: "room-1" } });
    await controller.loadOlderComments();

    assert.deepEqual(controller.threadComments.items.map((c) => c.id), ["c1", "c2", "c3"]);
  });

  test("a vote room loads no comments", async function (assert) {
    let requests = [];
    let controller = setup(this.owner, [[comment("c1")]], requests);

    await controller.openThread(EmberObject.create({ id: "room-1", roomType: "vote" }), "project-1");

    assert.strictEqual(requests.length, 0);
    assert.deepEqual(controller.threadComments.items, []);
  });

  test("a posted reply is added as the newest comment", async function (assert) {
    let controller = setup(this.owner, [[]]);
    let saved = comment("c9");
    controller.layout = { saveComment: () => Promise.resolve(saved) };
    await controller.openThread(discussion(), "project-1");

    await controller.postComment("room-1", "hello", []);

    assert.deepEqual(controller.threadComments.items.map((c) => c.id), ["c9"]);
  });

  test("live comment events update the open thread only", async function (assert) {
    let controller = setup(this.owner, [[]]);
    await controller.openThread(discussion(), "project-1");

    controller.handleCommentCreated({ resource: { id: "c1" }, changes: { relatedId: "room-1", comment: "hi" } });
    controller.handleCommentCreated({ resource: { id: "c1" }, changes: { relatedId: "room-1", comment: "hi" } });
    controller.handleCommentCreated({ resource: { id: "c2" }, changes: { relatedId: "room-2", comment: "other" } });
    assert.deepEqual(controller.threadComments.items.map((c) => c.id), ["c1"], "idempotent and scoped to the open thread");

    controller.handleCommentDeleted({ resource: { id: "c1" }, meta: { conversationId: "room-1" } });
    assert.deepEqual(controller.threadComments.items, []);
  });

  test("an updated comment keeps its place and one that is not loaded is not added", async function (assert) {
    let controller = setup(this.owner, [[comment("c2"), comment("c1")]]);
    await controller.openThread(discussion(), "project-1");

    controller.handleCommentUpdated({ resource: { id: "c0" }, changes: { relatedId: "room-1", comment: "edited" } });

    assert.deepEqual(controller.threadComments.items.map((c) => c.id), ["c1", "c2"]);
  });
});
