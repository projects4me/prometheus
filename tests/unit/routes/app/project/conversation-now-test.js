import { module, test } from "qunit";
import { setupTest } from "ember-qunit";

module("Unit | Route | app/project/conversation first page", function (hooks) {
  setupTest(hooks);

  test("loadFirstPage queries the threads with the list request of the controller", async function (assert) {
    let route = this.owner.lookup("route:app.project.conversation");
    let controller = { conversationList: { request: (values) => ({ query: "q", page: values.page, limit: 20 }) } };
    let asked = null;
    Object.defineProperty(route, "store", {
      configurable: true,
      get() {
        return { query: async (model, options) => { asked = { model, options }; return ["room"]; } };
      },
    });

    let firstPage = await route.loadFirstPage(controller, { page: 2 });

    assert.deepEqual(firstPage, { records: ["room"] });
    assert.strictEqual(asked.model, "conversationroom");
    assert.deepEqual(asked.options, { query: "q", page: 2, limit: 20 });
  });

  test("loadFirstPage hands a failed load to the list as an error", async function (assert) {
    let route = this.owner.lookup("route:app.project.conversation");
    let controller = { conversationList: { request: () => ({}) } };
    Object.defineProperty(route, "store", {
      configurable: true,
      get() {
        return { query: async () => { throw new Error("boom"); } };
      },
    });

    let firstPage = await route.loadFirstPage(controller, {});

    assert.strictEqual(firstPage.error.message, "boom");
  });
});
