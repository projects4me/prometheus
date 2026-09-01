import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import EmberObject from "@ember/object";
import { A } from "@ember/array";
import { installFakeHermes } from "../../../../helpers/hermes-fake";

module("Unit | Controller | app/project/board live events", function (hooks) {
  setupTest(hooks);
  installFakeHermes(hooks);

  hooks.beforeEach(function () {
    this.originalMessenger = window.Messenger;
    this.messages = [];
    let messages = this.messages;
    window.Messenger = class {
      post(options) {
        let message = { options, update() {}, cancel() {} };
        messages.push(message);
        return message;
      }
    };
  });

  hooks.afterEach(function () {
    window.Messenger = this.originalMessenger;
  });

  function setupBoardLanes(controller) {
    let issue = EmberObject.create({
      id: "issue-1",
      status: "new",
      milestoneId: "m1",
      assignee: "user-1",
      issueNumber: 12,
    });
    let source = EmberObject.create({
      id: "m1",
      issues: A([issue]),
    });
    let target = EmberObject.create({
      id: "m2",
      issues: A([]),
    });
    controller.set("milestones", A([source, target]));
    controller.set("currentUser", { user: { id: "user-b" } });
    return { issue, source, target };
  }

  test("status changes move an issue between lanes", function (assert) {
    let controller = this.owner.lookup("controller:app.project.board");
    let { issue, source, target } = setupBoardLanes(controller);

    controller.handleIssueStatusChanged({
      resource: { id: "issue-1" },
      actorId: "user-a",
      changes: { status: "in_progress", milestoneId: "m2" },
      meta: { issueNumber: 12 },
    });

    assert.strictEqual(issue.get("status"), "in_progress");
    assert.false(source.issues.includes(issue));
    assert.true(target.issues.includes(issue));
  });

  test("assignee changes patch the issue", function (assert) {
    let controller = this.owner.lookup("controller:app.project.board");
    let { issue } = setupBoardLanes(controller);
    let store = this.owner.lookup("service:store");
    Object.defineProperty(controller, "store", {
      configurable: true,
      get() {
        return store;
      },
    });

    controller.handleIssueAssigneeChanged({
      resource: { id: "issue-1" },
      changes: { assignee: "user-9", assigneeId: "user-9" },
      meta: { assignedTo: { id: "user-9", name: "Remote User" } },
    });

    assert.strictEqual(issue.get("assignee"), "user-9");
  });

  test("milestone created inserts ahead of backlog", function (assert) {
    let controller = this.owner.lookup("controller:app.project.board");
    let backlog = EmberObject.create({
      id: "backlog",
      milestoneType: "backlog",
      issues: A([]),
    });
    controller.set("milestones", A([backlog]));

    let store = {
      peekRecord() {
        return null;
      },
      createRecord(type, attrs) {
        return EmberObject.create({ id: attrs.id, ...attrs });
      },
      push() {
        return EmberObject.create({
          id: "m-new",
          name: "Sprint 2",
          issues: A([]),
        });
      },
    };
    Object.defineProperty(controller, "store", {
      configurable: true,
      get() {
        return store;
      },
    });

    // peekOrPush will use store — stub via a simple push path
    let pushed = EmberObject.create({
      id: "m-new",
      name: "Sprint 2",
      issues: A([]),
    });
    store.peekRecord = (modelName, id) =>
      modelName === "milestone" && id === "m-new" ? pushed : null;

    controller.handleMilestoneCreated({
      resource: { id: "m-new" },
      changes: { name: "Sprint 2" },
    });

    assert.strictEqual(controller.milestones.objectAt(0).id, "m-new");
    assert.strictEqual(controller.milestones.objectAt(1).id, "backlog");
  });

  test("milestone completed removes from board", function (assert) {
    let controller = this.owner.lookup("controller:app.project.board");
    let milestone = EmberObject.create({ id: "m1", issues: A([]) });
    controller.set("milestones", A([milestone]));

    controller.handleMilestoneCompleted({
      resource: { id: "m1" },
    });

    assert.strictEqual(controller.milestones.length, 0);
  });

  test("issue created shows live reload prompt", function (assert) {
    let controller = this.owner.lookup("controller:app.project.board");
    let shown = [];
    controller.liveReloadPrompt = {
      show(owner, cb) {
        shown.push({ owner, cb });
      },
      clear() {},
    };
    controller.router = { refresh() {} };

    controller.handleIssueCreated();

    assert.strictEqual(shown.length, 1);
  });

  test("unknown issue status change is a safe no-op", function (assert) {
    let controller = this.owner.lookup("controller:app.project.board");
    controller.set("milestones", A([]));
    Object.defineProperty(controller, "store", {
      configurable: true,
      get() {
        return { peekRecord() { return null; } };
      },
    });

    controller.handleIssueStatusChanged({
      resource: { id: "missing" },
      changes: { status: "done" },
    });

    assert.ok(true, "missing issue does not throw");
  });

  test("unregister clears board hermes registration", function (assert) {
    let controller = this.owner.lookup("controller:app.project.board");
    let hermes = this.owner.lookup("service:hermes");
    hermes.connect();
    controller.hermes = hermes;

    controller.registerHermesIntents("project-1");
    assert.ok(
      hermes.desiredIntents.some(
        (i) => i.eventName === "issue.status.changed"
      )
    );

    controller.unregisterHermesIntents();
    assert.strictEqual(
      hermes.desiredIntents.filter((i) => i.projectId === "project-1").length,
      0
    );
  });
});
