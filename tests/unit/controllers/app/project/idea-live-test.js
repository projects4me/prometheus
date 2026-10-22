import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import EmberObject from "@ember/object";
import { installFakeHermes, emitDomainEvent } from "../../../../helpers/hermes-fake";

module("Unit | Controller | app/project/idea live events", function (hooks) {
  setupTest(hooks);
  installFakeHermes(hooks);

  function event(name, ideaId, extra = {}) {
    return {
      eventName: name,
      projectId: "p1",
      resourceType: "ideamessage",
      resourceId: "m2",
      meta: { ideaId },
      ...extra,
    };
  }

  function stubStore(controller, calls) {
    controller.store = {
      findRecord(type, id) {
        calls.push(["findRecord", type, id]);
        return Promise.resolve(EmberObject.create({ id }));
      },
      query(type) {
        calls.push(["query", type]);
        return Promise.resolve({ toArray: () => [] });
      },
    };
  }

  test("page appends a remote message of the open idea once", async function (assert) {
    let controller = this.owner.lookup("controller:app.project.idea.page");
    let calls = [];
    stubStore(controller, calls);
    controller.model = EmberObject.create({ id: "i1" });
    controller.messages = [EmberObject.create({ id: "m1" })];
    controller.registerHermesIntents("p1");

    emitDomainEvent(this.owner, event("idea.message.created", "i1"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.deepEqual(controller.messages.map((m) => m.id), ["m1", "m2"]);

    emitDomainEvent(this.owner, event("idea.message.created", "i1"));
    emitDomainEvent(this.owner, event("idea.message.created", "i1", { eventId: "other" }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(controller.messages.length, 2, "no duplicate");
  });

  test("page ignores events of another idea", async function (assert) {
    let controller = this.owner.lookup("controller:app.project.idea.page");
    let calls = [];
    stubStore(controller, calls);
    controller.model = EmberObject.create({ id: "i1" });
    controller.registerHermesIntents("p1");

    emitDomainEvent(this.owner, event("idea.message.created", "i2"));
    emitDomainEvent(this.owner, event("idea.plan.created", "i2"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.deepEqual(calls, []);
  });

  test("page reloads plans and created issues on plan events", async function (assert) {
    let controller = this.owner.lookup("controller:app.project.idea.page");
    let calls = [];
    stubStore(controller, calls);
    controller.model = EmberObject.create({ id: "i1" });
    controller.registerHermesIntents("p1");

    emitDomainEvent(this.owner, event("idea.plan.created", "i1", { resourceType: "ideaplan" }));
    emitDomainEvent(this.owner, event("idea.plan.status.changed", "i1", { resourceType: "ideaplan" }));
    emitDomainEvent(this.owner, event("idea.planissue.created", "i1", { resourceType: "ideaplanissue" }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(calls.filter((c) => c[1] === "ideaplan").length, 3);
    assert.equal(calls.filter(([kind, type]) => kind === "query" && type === "ideaplanissue").length, 3);
  });

  test("page reloads the idea header on idea.updated", async function (assert) {
    let controller = this.owner.lookup("controller:app.project.idea.page");
    let reloads = 0;
    controller.model = EmberObject.create({ id: "i1", reload: () => { reloads++; return Promise.resolve(); } });
    controller.registerHermesIntents("p1");

    emitDomainEvent(this.owner, event("idea.updated", "i1", { resourceType: "idea", resourceId: "i1" }));
    assert.equal(reloads, 1);
  });

  test("browser reloads the list on idea.created and idea.updated", async function (assert) {
    let controller = this.owner.lookup("controller:app.project.idea");
    let loads = 0;
    controller.registerHermesIntents("p1", async () => {
      loads++;
      return { toArray: () => [] };
    });

    emitDomainEvent(this.owner, event("idea.created", "i1", { resourceType: "idea", resourceId: "i1" }));
    emitDomainEvent(this.owner, event("idea.updated", "i1", { resourceType: "idea", resourceId: "i1" }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(loads, 2);
  });

  test("no subscriptions are left after unregistering", function (assert) {
    let hermes = this.owner.lookup("service:hermes");
    let page = this.owner.lookup("controller:app.project.idea.page");
    let browser = this.owner.lookup("controller:app.project.idea");
    page.registerHermesIntents("p1");
    browser.registerHermesIntents("p1", async () => null);
    assert.equal(hermes.registrations.size, 2);

    page.unregisterHermesIntents();
    browser.unregisterHermesIntents();
    assert.equal(hermes.registrations.size, 0);
  });
});
