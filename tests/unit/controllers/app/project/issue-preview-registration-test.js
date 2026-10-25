import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import EmberObject from "@ember/object";
import { A } from "@ember/array";
import { installFakeHermes } from "../../../../helpers/hermes-fake";

module("Unit | Controller | issue preview registration", function (hooks) {
  setupTest(hooks);
  installFakeHermes(hooks);

  module("issue list", function () {
    function setup(owner) {
      let controller = owner.lookup("controller:app/project/issue/index");
      let issue = EmberObject.create({ id: "7" });
      controller.set("model", A([issue]));
      let opened = [];
      controller.loadIssueDetails = async (i) => opened.push(i);
      window.scrollTo = () => {};
      controller.registerIssuePreview();
      return { controller, issue, opened };
    }

    test("opens a loaded issue in the quick view", function (assert) {
      let { controller, issue, opened } = setup(this.owner);
      let service = this.owner.lookup("service:issue-preview");

      assert.true(service.open("7"));
      assert.deepEqual(opened, [issue]);
      assert.strictEqual(controller.selectedIssue, issue);
    });

    test("falls back when the issue is not loaded", function (assert) {
      let { opened } = setup(this.owner);
      let service = this.owner.lookup("service:issue-preview");

      assert.false(service.open("99"));
      assert.deepEqual(opened, []);
    });

    test("disposes the registration", function (assert) {
      let { controller } = setup(this.owner);
      let service = this.owner.lookup("service:issue-preview");

      controller.unregisterIssuePreview();

      assert.false(service.open("7"));
    });
  });

  module("gantt", function () {
    function setup(owner) {
      let controller = owner.lookup("controller:app/project/gantt");
      let issue = EmberObject.create({ id: "7" });
      controller.set(
        "milestones",
        A([EmberObject.create({ id: "m1", issues: A([issue]) })])
      );
      controller.registerIssuePreview();
      return { controller, issue };
    }

    test("opens a loaded issue in the panel", function (assert) {
      let { controller, issue } = setup(this.owner);
      let service = this.owner.lookup("service:issue-preview");

      assert.true(service.open("7"));
      assert.true(controller.isIssuePanelOpen);
      assert.strictEqual(controller.panelIssue, issue);
    });

    test("falls back when the issue is not on the gantt", function (assert) {
      let { controller } = setup(this.owner);
      let service = this.owner.lookup("service:issue-preview");

      assert.false(service.open("99"));
      assert.false(controller.isIssuePanelOpen);
    });

    test("disposes the registration", function (assert) {
      let { controller } = setup(this.owner);
      let service = this.owner.lookup("service:issue-preview");

      controller.unregisterIssuePreview();

      assert.false(service.open("7"));
    });
  });
});
