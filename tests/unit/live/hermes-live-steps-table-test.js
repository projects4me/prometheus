import { module, test } from "qunit";
import { rowFromDomainEventTable } from "../../helpers/hermes-fake";

module("Unit | Helper | hermes domain-event table", function () {
  test("maps key/value yadda rows into one event payload object", function (assert) {
    let row = rowFromDomainEventTable([
      { key: "actorId", value: "user_a" },
      { key: "projectId", value: "1" },
      { key: "resourceId", value: "remote-comment-1" },
      { key: "relatedId", value: "1" },
      { key: "comment", value: "remote live comment" },
    ]);

    assert.deepEqual(row, {
      actorId: "user_a",
      projectId: "1",
      resourceId: "remote-comment-1",
      relatedId: "1",
      comment: "remote live comment",
    });
  });

  test("keeps a horizontal single-row table as-is", function (assert) {
    let horizontal = {
      actorId: "user_a",
      projectId: "1",
      resourceId: "1",
      status: "in_progress",
    };
    assert.deepEqual(rowFromDomainEventTable([horizontal]), horizontal);
  });
});
