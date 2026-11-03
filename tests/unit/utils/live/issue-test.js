import { module, test } from "qunit";
import { isOpenIssueEvent, isIssueRoomEvent, resolveStatusName, findOrLoad } from "prometheus/utils/live/issue";

module("Unit | Utility | live/issue", function () {
  test("isOpenIssueEvent matches the open issue id only", function (assert) {
    assert.true(isOpenIssueEvent({ id: "1" }, { resource: { id: 1 } }));
    assert.false(isOpenIssueEvent({ id: "1" }, { resource: { id: "2" } }));
    assert.false(isOpenIssueEvent(null, { resource: { id: "1" } }));
    assert.false(isOpenIssueEvent({ id: "1" }, {}));
  });

  test("isIssueRoomEvent matches the room from meta or changes", function (assert) {
    let issue = { conversationRoomId: "r1" };
    assert.true(isIssueRoomEvent(issue, { resource: { id: "c" }, meta: { conversationId: "r1" } }));
    assert.true(isIssueRoomEvent(issue, { resource: { id: "c" }, changes: { relatedId: "r1" } }));
    assert.false(isIssueRoomEvent(issue, { resource: { id: "c" }, meta: { conversationId: "r2" } }));
    assert.false(isIssueRoomEvent(issue, { meta: { conversationId: "r1" } }));
  });

  test("resolveStatusName prefers the name and falls back to the id lookup", function (assert) {
    let statuses = [{ id: "s1", name: "new" }];
    assert.strictEqual(resolveStatusName({ status: "done" }, statuses), "done");
    assert.strictEqual(resolveStatusName({ statusId: "s1" }, statuses), "new");
    assert.strictEqual(resolveStatusName({ statusId: "x" }, statuses), undefined);
    assert.strictEqual(resolveStatusName({}, [{ id: "undefined", name: "odd" }]), undefined);
  });

  test("findOrLoad peeks first and loads otherwise", function (assert) {
    let store = { peekRecord: (t, id) => (id === "a" ? "peeked" : null), findRecord: () => "loaded" };
    assert.strictEqual(findOrLoad(store, "user", "a"), "peeked");
    assert.strictEqual(findOrLoad(store, "user", "b"), "loaded");
  });
});
