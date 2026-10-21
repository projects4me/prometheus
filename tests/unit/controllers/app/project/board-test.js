import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import EmberObject from "@ember/object";
import { A } from "@ember/array";

module("Unit | Controller | app/project/board", function (hooks) {
  setupTest(hooks);

  function milestoneWith(...statuses) {
    return EmberObject.create({
      id: "m1",
      issues: A(
        statuses.map((status, i) =>
          EmberObject.create({ id: `issue-${i}`, status, priority: "low" })
        )
      ),
    });
  }

  test("milestoneList keeps the issues when no statuses are loaded", function (assert) {
    let controller = this.owner.lookup("controller:app/project/board");
    let milestone = milestoneWith("new", "done");
    controller.setProperties({ milestones: A([milestone]), issueStatuses: [] });

    let [result] = controller.milestoneList;

    assert.strictEqual(result.issues.length, 2);
  });

  test("milestoneList orders issues by the statuses' sortOrder", function (assert) {
    let controller = this.owner.lookup("controller:app/project/board");
    let milestone = milestoneWith("new", "done");
    controller.setProperties({
      milestones: A([milestone]),
      issueStatuses: [
        { name: "new", sortOrder: 2 },
        { name: "done", sortOrder: 1 },
      ],
    });

    let [result] = controller.milestoneList;

    assert.deepEqual(
      result.issues.map((issue) => issue.status),
      ["done", "new"]
    );
  });
});
