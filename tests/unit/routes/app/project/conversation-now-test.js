import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import EmberObject from "@ember/object";
import { A } from "@ember/array";

module("Unit | Route | app/project/conversation now", function (hooks) {
  setupTest(hooks);

  test("model refreshes now before fetching conversations", async function (assert) {
    let route = this.owner.lookup("route:app.project.conversation");
    route.set("now", "2000-01-01 00:00:00");
    Object.defineProperty(route, "trackedProject", {
      configurable: true,
      get() {
        return { getProjectId: () => "project-1" };
      },
    });

    let capturedNow = null;
    route.fetchAllConversations = async function () {
      capturedNow = this.now;
      return EmberObject.create({ toArray: () => A([]) });
    };

    await route.model({});

    assert.notStrictEqual(
      capturedNow,
      "2000-01-01 00:00:00",
      "now is refreshed before the list query"
    );
    assert.ok(capturedNow, "now is set for the fetch");
  });
});
