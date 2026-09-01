import { module, test } from "qunit";
import EmberObject from "@ember/object";
import { applyIssueAssigneeChange } from "prometheus/utils/live/assignee";

module("Unit | Utility | live/assignee", function () {
  test("applies assignee id and peeked user onto the issue", function (assert) {
    let issue = EmberObject.create({
      assignee: "old",
      assignedTo: null,
    });
    let user = { id: "user-2", name: "Pat" };
    let store = {
      peekRecord(type, id) {
        return type === "user" && id === "user-2" ? user : null;
      },
      push() {
        return user;
      },
    };

    applyIssueAssigneeChange(store, issue, {
      changes: { assignee: "user-2" },
    });

    assert.strictEqual(issue.get("assignee"), "user-2");
    assert.strictEqual(issue.get("assignedTo"), user);
  });

  test("is a no-op when the issue is missing", function (assert) {
    assert.strictEqual(
      applyIssueAssigneeChange({}, null, { changes: { assignee: "u1" } }),
      null
    );
  });
});
