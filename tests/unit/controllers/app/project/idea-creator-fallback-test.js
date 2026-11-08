import { module, test } from "qunit";
import { setupTest } from "ember-qunit";

module("Unit | Controller | app/project/idea creator fallback", function (hooks) {
  setupTest(hooks);

  test("the Created by group shows Unknown user, never the id, when the creator isn't loaded", function (assert) {
    let controller = this.owner.lookup("controller:app.project.idea");
    controller.ideas = [{ id: "i1", createdUser: "u-123", belongsTo: () => ({ value: () => null }) }];
    let option = controller.groupOptions.find((o) => o.key === "createdBy");
    let label = option.groupLabel("u-123");
    assert.strictEqual(label, "Unknown user");
    assert.notOk(label.includes("u-123"));
  });

  test("the Created by group shows the creator name when loaded", function (assert) {
    let controller = this.owner.lookup("controller:app.project.idea");
    controller.ideas = [{ id: "i1", createdUser: "u-1", belongsTo: () => ({ value: () => ({ name: "Ann" }) }) }];
    let option = controller.groupOptions.find((o) => o.key === "createdBy");
    assert.strictEqual(option.groupLabel("u-1"), "Ann");
  });
});
