import { module, test } from "qunit";
import { setupTest } from "ember-qunit";

module("Unit | Controller | app/project/idea/page", function (hooks) {
  setupTest(hooks);

  test("readableProjectIds reads the ids of the async user.projects without the proxy", function (assert) {
    let controller = this.owner.lookup("controller:app/project/idea/page");
    // user.projects is a PromiseManyArray in ember-data: it has no map
    let user = {
      projects: {},
      hasMany(name) {
        assert.strictEqual(name, "projects");
        return { ids: () => ["2", 3] };
      },
    };
    controller.currentUser = { user };
    controller.model = { projectId: "1" };

    assert.deepEqual(controller.readableProjectIds, ["1", "2", "3"]);
  });

  test("readableProjectIds works without a user", function (assert) {
    let controller = this.owner.lookup("controller:app/project/idea/page");
    controller.currentUser = { user: null };
    controller.model = { projectId: 1 };

    assert.deepEqual(controller.readableProjectIds, ["1"]);
  });
});
