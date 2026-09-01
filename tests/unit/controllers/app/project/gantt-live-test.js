import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import EmberObject from "@ember/object";
import { A } from "@ember/array";
import { installFakeHermes } from "../../../../helpers/hermes-fake";

module("Unit | Controller | app/project/gantt live events", function (hooks) {
  setupTest(hooks);
  installFakeHermes(hooks);

  hooks.beforeEach(function () {
    this.originalMessenger = window.Messenger;
    window.Messenger = class {
      post() {
        return { update() {}, cancel() {} };
      }
    };
  });

  hooks.afterEach(function () {
    window.Messenger = this.originalMessenger;
  });

  function setupGantt(controller) {
    let issue = EmberObject.create({
      id: "issue-1",
      startDate: "2026-01-01",
      endDate: "2026-01-10",
      parentId: null,
      parentissue: null,
      assignee: "user-1",
    });
    let other = EmberObject.create({
      id: "issue-2",
      startDate: "2026-01-01",
      endDate: "2026-01-05",
      parentId: null,
      parentissue: null,
    });
    let milestone = EmberObject.create({
      id: "m1",
      startDate: "2026-01-01",
      endDate: "2026-02-01",
      issues: A([issue, other]),
    });
    controller.set("milestones", A([milestone]));
    controller.refreshGantt = function () {
      this._refreshed = true;
    };
    Object.defineProperty(controller, "store", {
      configurable: true,
      get() {
        return {
          peekRecord(type, id) {
            if (type === "issue" && id === "issue-1") {
              return issue;
            }
            if (type === "issue" && id === "issue-2") {
              return other;
            }
            return null;
          },
          push() {
            return null;
          },
        };
      },
    });
    return { issue, other, milestone };
  }

  test("dates changed updates start and end", function (assert) {
    let controller = this.owner.lookup("controller:app.project.gantt");
    let { issue } = setupGantt(controller);

    controller.handleIssueDatesChanged({
      resource: { id: "issue-1" },
      changes: { startDate: "2026-02-01", endDate: "2026-02-15" },
    });

    assert.strictEqual(issue.get("startDate"), "2026-02-01");
    assert.strictEqual(issue.get("endDate"), "2026-02-15");
    assert.true(controller._refreshed);
  });

  test("dependency created sets parent", function (assert) {
    let controller = this.owner.lookup("controller:app.project.gantt");
    let { issue, other } = setupGantt(controller);

    controller.handleIssueDependencyCreated({
      resource: { id: "dep-1" },
      changes: { issueId: "issue-1", parentId: "issue-2" },
      meta: {},
    });

    assert.strictEqual(issue.get("parentId"), "issue-2");
    assert.strictEqual(issue.get("parentissue"), other);
  });

  test("dependency deleted clears parent", function (assert) {
    let controller = this.owner.lookup("controller:app.project.gantt");
    let { issue, other } = setupGantt(controller);
    issue.set("parentId", "issue-2");
    issue.set("parentissue", other);

    controller.handleIssueDependencyDeleted({
      resource: { id: "dep-1" },
      changes: { issueId: "issue-1", parentId: "issue-2" },
    });

    assert.strictEqual(issue.get("parentId"), null);
    assert.strictEqual(issue.get("parentissue"), null);
  });

  test("assignee changed patches issue", function (assert) {
    let controller = this.owner.lookup("controller:app.project.gantt");
    let { issue } = setupGantt(controller);

    controller.handleIssueAssigneeChanged({
      resource: { id: "issue-1" },
      changes: { assignee: "user-9" },
    });

    assert.strictEqual(issue.get("assignee"), "user-9");
  });

  test("issue created shows reload prompt", function (assert) {
    let controller = this.owner.lookup("controller:app.project.gantt");
    let shown = 0;
    controller.liveReloadPrompt = {
      show() {
        shown++;
      },
      clear() {},
    };
    controller.router = { refresh() {} };

    controller.handleIssueCreated();
    assert.strictEqual(shown, 1);
  });

  test("unknown issue dates change is a safe no-op", function (assert) {
    let controller = this.owner.lookup("controller:app.project.gantt");
    setupGantt(controller);

    controller.handleIssueDatesChanged({
      resource: { id: "missing" },
      changes: { startDate: "2026-03-01" },
    });

    assert.ok(true, "missing issue does not throw");
  });

  test("unregister clears gantt hermes registration", function (assert) {
    let controller = this.owner.lookup("controller:app.project.gantt");
    let hermes = this.owner.lookup("service:hermes");
    hermes.connect();
    controller.hermes = hermes;

    controller.registerHermesIntents("project-1");
    assert.ok(
      hermes.desiredIntents.some((i) => i.eventName === "issue.dates.changed")
    );

    controller.unregisterHermesIntents();
    assert.strictEqual(
      hermes.desiredIntents.filter((i) => i.projectId === "project-1").length,
      0
    );
  });
});
