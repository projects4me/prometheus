import { module, test } from "qunit";
import { setupTest } from "ember-qunit";

module("Unit | Controller | app/project/idea/page plan milestone", function (hooks) {
  setupTest(hooks);

  test("setPlanMilestone changes only the milestone of the issues and saves the plan", async function (assert) {
    let controller = this.owner.lookup("controller:app.project.idea.page");
    let original = { summary: "S", extra: { a: 1 }, issues: [{ key: "a", subject: "A", milestone: "M1", dependsOn: ["b"] }, { key: "b", subject: "B" }, "stray"] };
    let plan = { body: JSON.stringify(original), save: async () => assert.step("save") };
    await controller.setPlanMilestone(plan, "M2");
    assert.verifySteps(["save"]);
    assert.deepEqual(JSON.parse(plan.body), {
      ...original,
      issues: [{ ...original.issues[0], milestone: "M2" }, { ...original.issues[1], milestone: "M2" }, "stray"]
    });
  });

  test("setPlanMilestone rolls back and reports when the save fails", async function (assert) {
    let controller = this.owner.lookup("controller:app.project.idea.page");
    controller.errorManager = { handleError: () => assert.step("report") };
    let plan = { body: "{}", save: async () => { throw new Error("no"); }, rollbackAttributes: () => assert.step("rollback") };
    await assert.rejects(controller.setPlanMilestone(plan, "M2"));
    assert.verifySteps(["rollback", "report"]);
  });
});
