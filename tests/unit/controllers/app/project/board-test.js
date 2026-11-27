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

  test("moveIssue moves the issue between milestone lists and saves once", async function (assert) {
    let controller = this.owner.lookup("controller:app/project/board");
    let from = EmberObject.create({ id: "m1", issues: A([]) });
    let backlog = EmberObject.create({ id: null, milestoneType: "backlog", issues: A([]) });
    let saves = 0;
    let issue = EmberObject.create({
      id: "i1", milestoneId: "m1", status: "new", statusId: "1",
      save() { saves++; return Promise.resolve(); },
    });
    from.issues.pushObject(issue);
    controller.setProperties({ milestones: A([from, backlog]) });
    controller.notify = () => {};

    let result = await controller.moveIssue(issue, { milestoneId: "", statusId: "2", status: "done", assignee: "u2" });

    assert.true(result);
    assert.strictEqual(saves, 1);
    assert.strictEqual(from.issues.length, 0);
    assert.strictEqual(backlog.issues.length, 1);
    assert.strictEqual(issue.milestoneId, null);
    assert.strictEqual(issue.status, "done");
    assert.strictEqual(issue.assignee, "u2");
  });

  test("moveIssue puts the issue back and returns false when the save fails", async function (assert) {
    let controller = this.owner.lookup("controller:app/project/board");
    let from = EmberObject.create({ id: "m1", issues: A([]) });
    let backlog = EmberObject.create({ id: null, milestoneType: "backlog", issues: A([]) });
    let issue = EmberObject.create({
      id: "i1", milestoneId: "m1", status: "new",
      save() { return Promise.reject(new Error("x")); },
      rollbackAttributes() {},
    });
    from.issues.pushObject(issue);
    controller.setProperties({ milestones: A([from, backlog]) });
    let notified = [];
    controller.notify = (type) => notified.push(type);

    let result = await controller.moveIssue(issue, { milestoneId: "" });

    assert.false(result);
    assert.strictEqual(from.issues.length, 1);
    assert.strictEqual(backlog.issues.length, 0);
    assert.deepEqual(notified, ["error"]);
  });

  test("the quick view opens as a modal on phones and resets on close", async function (assert) {
    let controller = this.owner.lookup("controller:app/project/board");
    controller.isPhoneViewport = () => true;
    controller.loadIssueDetails = async () => {};

    await controller.selectIssue({ id: "1" });
    assert.true(controller.quickViewAsModal);
    assert.strictEqual(controller.boardColumnClass, "board-column col-md-12");

    controller.closeIssueDetails();
    assert.false(controller.quickViewAsModal);
  });

  test("the quick view stays a side panel on desktop", async function (assert) {
    let controller = this.owner.lookup("controller:app/project/board");
    controller.isPhoneViewport = () => false;
    controller.loadIssueDetails = async () => {};

    await controller.selectIssue({ id: "1" });
    assert.false(controller.quickViewAsModal);
    assert.strictEqual(controller.boardColumnClass, "board-column col-md-8");
  });

  test("changeMilestone puts the open tab in the milestone query param", function (assert) {
    let controller = this.owner.lookup("controller:app/project/board");
    assert.true(controller.queryParams.includes("milestone"));
    controller.changeMilestone("backlog");
    assert.strictEqual(controller.milestone, "backlog");
    controller.changeMilestone("m2");
    assert.strictEqual(controller.milestone, "m2");
  });

  test("syncActiveMilestone keeps a milestone on the board and drops one that isn't", function (assert) {
    let controller = this.owner.lookup("controller:app/project/board");
    controller.setProperties({
      milestones: A([EmberObject.create({ id: null, issues: A() }), EmberObject.create({ id: "m1", issues: A() })]),
    });

    controller.milestone = "m1";
    controller.syncActiveMilestone();
    assert.strictEqual(controller.milestone, "m1", "a milestone on the board stays");

    controller.milestone = "backlog";
    controller.syncActiveMilestone();
    assert.strictEqual(controller.milestone, "backlog", "the backlog stays");

    controller.milestone = "gone";
    controller.syncActiveMilestone();
    assert.strictEqual(controller.milestone, null, "a milestone not on the board is dropped");
  });

  test("the milestone query param replaces the history entry and doesn't reload the board", function (assert) {
    let route = this.owner.lookup("route:app/project/board");
    assert.deepEqual(route.queryParams.milestone, { refreshModel: false, replace: true });
  });

  test("the issue query param is registered and doesn't reload the board", function (assert) {
    let controller = this.owner.lookup("controller:app/project/board");
    let route = this.owner.lookup("route:app/project/board");
    assert.true(controller.queryParams.includes("issue"));
    assert.deepEqual(route.queryParams.issue, { refreshModel: false });
  });

  test("closeIssueDetails clears the issue param", function (assert) {
    let controller = this.owner.lookup("controller:app/project/board");
    controller._issue = "12";
    controller.selectedIssue = EmberObject.create({ issueNumber: 12 });
    controller.closeIssueDetails();
    assert.strictEqual(controller.issue, null);
    assert.strictEqual(controller.selectedIssue, null);
  });

  test("syncIssueFromUrl opens the board card, closes on an empty param and drops an unknown number", async function (assert) {
    let controller = this.owner.lookup("controller:app/project/board");
    let card = EmberObject.create({ issueNumber: 7 });
    controller.milestones = A([EmberObject.create({ id: "m1", issues: A([card]) })]);
    let selected = [];
    Object.defineProperty(controller, "selectIssue", {
      value: async (issue) => { selected.push(issue); controller.selectedIssue = issue; },
    });
    controller.findIssueByNumber = (number) => Promise.resolve(number === "7" ? card : null);

    let tick = () => new Promise((resolve) => setTimeout(resolve, 0));
    controller.issue = "7";
    await tick();
    assert.deepEqual(selected, [card], "setting the param (Back/Forward) opens the card");

    await controller.syncIssueFromUrl("7");
    assert.strictEqual(selected.length, 1, "an already open issue isn't reopened");

    await controller.syncIssueFromUrl(null);
    assert.strictEqual(controller.selectedIssue, null, "an empty param closes the quick view");

    controller.issue = "999";
    await tick();
    assert.strictEqual(controller.issue, null, "an unknown number drops the param");

    controller.issue = "abc";
    await tick();
    assert.strictEqual(controller.issue, null, "a non-numeric value drops the param");
  });
});
