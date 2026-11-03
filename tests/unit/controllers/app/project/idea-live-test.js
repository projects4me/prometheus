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

  test("browser skips an idea.created for an idea it lists already, and reloads for one it does not", async function (assert) {
    let controller = this.owner.lookup("controller:app.project.idea");
    controller.ideas = [EmberObject.create({ id: "i1" })];
    let loads = 0;
    controller.registerHermesIntents("p1", async () => {
      loads++;
      return { toArray: () => [] };
    });

    emitDomainEvent(this.owner, event("idea.created", "i1", { resourceType: "idea", resourceId: "i1", actorId: "u1" }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(loads, 0, "listed already");

    emitDomainEvent(this.owner, event("idea.created", "i2", { resourceType: "idea", resourceId: "i2", actorId: "u1",
                                                              eventId: "e2" }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(loads, 1, "created in another tab by the same user");
  });

  test("a saved idea is listed once, also when a reload brought it in first", function (assert) {
    let browser = this.owner.lookup("controller:app.project.idea");
    let create = this.owner.lookup("controller:app.project.idea.create");
    create.transitionToRoute = () => {};
    let idea = EmberObject.create({ id: "i1" });
    browser.ideas = [EmberObject.create({ id: "i0" }), EmberObject.create({ id: "i1" })];

    create.navigateToSuccess(idea);
    assert.deepEqual(browser.ideas.map((i) => i.id), ["i0", "i1"]);

    browser.ideas = [EmberObject.create({ id: "i0" })];
    create.navigateToSuccess(idea);
    assert.deepEqual(browser.ideas.map((i) => i.id), ["i0", "i1"]);
  });

  test("approving a plan locally refreshes the browser badge", async function (assert) {
    let page = this.owner.lookup("controller:app.project.idea.page");
    let browser = this.owner.lookup("controller:app.project.idea");
    browser.ideas = [EmberObject.create({ id: "i1", status: "open" })];
    browser.planStatuses = { i1: "proposed" };
    page.errorManager = { handleError() {} };
    await page.approvePlan(
      EmberObject.create({ ideaId: "i1", status: "proposed", save: async () => {} }),
    );
    assert.equal(browser.planStatuses.i1, "approved");
  });

  test("a plan query started before a local status change does not overwrite it", async function (assert) {
    let browser = this.owner.lookup("controller:app.project.idea");
    let release;
    let pending = browser.loadPlanStatuses(
      [EmberObject.create({ id: "i1" })],
      () => new Promise((resolve) => (release = resolve)),
    );
    browser.setPlanStatus("i1", "approved");
    release([{ ideaId: "i1", version: 1, status: "proposed" }]);
    await pending;
    assert.equal(browser.planStatuses.i1, "approved");
  });

  test("ideas show a loading entry until the plan statuses have loaded, archived ones stay archived", async function (assert) {
    let browser = this.owner.lookup("controller:app.project.idea");
    browser.ideas = [
      EmberObject.create({ id: "i1", status: "open" }),
      EmberObject.create({ id: "i2", status: "archived" }),
    ];
    assert.true(browser.progressByIdea.i1.loading);
    assert.notOk(browser.progressByIdea.i2.loading);
    await browser.loadPlanStatuses(browser.ideas, async () => []);
    assert.deepEqual([...browser.loadedIdeaIds], ["i1", "i2"]);
    assert.notOk(browser.progressByIdea.i1.loading);
    assert.equal(browser.progressByIdea.i1.label, "views.app.idea.progress.brainstorming");
  });

  test("a local status change keeps the other ideas loading until the plan query finishes", async function (assert) {
    let browser = this.owner.lookup("controller:app.project.idea");
    let release;
    browser.ideas = [
      EmberObject.create({ id: "i1", status: "open" }),
      EmberObject.create({ id: "i2", status: "open" }),
    ];
    let pending = browser.loadPlanStatuses(browser.ideas, () => new Promise((resolve) => (release = resolve)));
    browser.setPlanStatus("i1", "approved");
    assert.true(browser.progressByIdea.i2.loading);
    release([{ ideaId: "i2", version: 1, status: "proposed" }]);
    await pending;
    assert.notOk(browser.progressByIdea.i2.loading);
    assert.equal(browser.planStatuses.i1, "approved");
    assert.equal(browser.planStatuses.i2, "proposed");
  });

  test("an idea added by a later reload shows loading, a saved status shows at once", async function (assert) {
    let browser = this.owner.lookup("controller:app.project.idea");
    browser.ideas = [EmberObject.create({ id: "i1", status: "open" })];
    await browser.loadPlanStatuses(browser.ideas, async () => []);
    browser.ideas = [...browser.ideas, EmberObject.create({ id: "i2", status: "open" })];
    let release;
    let pending = browser.loadPlanStatuses(browser.ideas, () => new Promise((resolve) => (release = resolve)));
    assert.true(browser.progressByIdea.i2.loading);
    browser.setPlanStatus("i2", "approved");
    assert.notOk(browser.progressByIdea.i2.loading);
    release([]);
    await pending;
    assert.equal(browser.progressByIdea.i2.label, "views.app.idea.progress.approved");
  });

  test("a locally created idea is not left loading", function (assert) {
    let browser = this.owner.lookup("controller:app.project.idea");
    browser.addIdea(EmberObject.create({ id: "i9", status: "open" }));
    assert.notOk(browser.progressByIdea.i9.loading);
    assert.equal(browser.progressByIdea.i9.label, "views.app.idea.progress.brainstorming");
  });

  test("an idea created while a plan query is pending stays loaded when it settles", async function (assert) {
    let browser = this.owner.lookup("controller:app.project.idea");
    let release;
    browser.ideas = [EmberObject.create({ id: "i1", status: "open" })];
    let pending = browser.loadPlanStatuses(browser.ideas, () => new Promise((resolve) => (release = resolve)));
    browser.addIdea(EmberObject.create({ id: "i2", status: "open" }));
    release([]);
    await pending;
    assert.notOk(browser.progressByIdea.i2.loading);
  });

  test("the loading entry ends when the plan query rejects", async function (assert) {
    let browser = this.owner.lookup("controller:app.project.idea");
    browser.ideas = [EmberObject.create({ id: "i1", status: "open" })];
    await browser.loadPlanStatuses(browser.ideas, async () => {
      throw new Error("down");
    });
    assert.deepEqual([...browser.loadedIdeaIds], ["i1"]);
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
