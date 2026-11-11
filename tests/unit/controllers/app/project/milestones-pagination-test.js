import { module, test } from "qunit";
import { setupTest } from "ember-qunit";

module("Unit | Controller | app/project/index milestones pagination", function (hooks) {
  setupTest(hooks);

  function controllerWith(owner, count) {
    let controller = owner.lookup("controller:app.project.index");
    controller.set("milestones", Array.from({ length: count }, (_, i) => ({ id: `m${i + 1}` })));
    controller.set("milestonesPage", 1);
    return controller;
  }

  test("5 or fewer milestones show no pager and all milestones", function (assert) {
    let controller = controllerWith(this.owner, 5);
    assert.false(controller.showMilestonesPager);
    assert.strictEqual(controller.visibleMilestones.length, 5);
  });

  test("no milestones gives an empty range", function (assert) {
    let controller = controllerWith(this.owner, 0);
    assert.false(controller.showMilestonesPager);
    assert.strictEqual(controller.milestonesRangeFrom, 0);
    assert.strictEqual(controller.milestonesRangeTo, 0);
  });

  test("11 milestones page through 5, 5 and 1 with correct ranges and buttons", function (assert) {
    let controller = controllerWith(this.owner, 11);
    assert.true(controller.showMilestonesPager);
    assert.deepEqual(controller.visibleMilestones.map((m) => m.id), ["m1", "m2", "m3", "m4", "m5"]);
    assert.true(controller.isMilestonesPreviousDisabled);
    assert.false(controller.isMilestonesNextDisabled);

    controller.nextMilestonesPage();
    assert.strictEqual(controller.milestonesRangeFrom, 6);
    assert.strictEqual(controller.milestonesRangeTo, 10);

    controller.nextMilestonesPage();
    assert.deepEqual(controller.visibleMilestones.map((m) => m.id), ["m11"]);
    assert.strictEqual(controller.milestonesRangeFrom, 11);
    assert.strictEqual(controller.milestonesRangeTo, 11);
    assert.true(controller.isMilestonesNextDisabled);

    controller.nextMilestonesPage();
    assert.strictEqual(controller.currentMilestonesPage, 3, "cannot go past the last page");

    controller.previousMilestonesPage();
    assert.strictEqual(controller.currentMilestonesPage, 2);
  });

  test("the page is clamped when the list shrinks while on a later page", function (assert) {
    let controller = controllerWith(this.owner, 11);
    controller.set("milestonesPage", 3);
    controller.set("milestones", controller.milestones.slice(0, 5));
    assert.strictEqual(controller.currentMilestonesPage, 1);
    assert.strictEqual(controller.visibleMilestones.length, 5);
    assert.false(controller.showMilestonesPager);
  });
});
