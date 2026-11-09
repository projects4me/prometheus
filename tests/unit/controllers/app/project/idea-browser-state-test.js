import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import EmberObject from "@ember/object";

module("Unit | Controller | app/project/idea browser state", function (hooks) {
  setupTest(hooks);

  function setup(owner) {
    let browser = owner.lookup("controller:app.project.idea");
    let requests = [];
    let store = {
      query(type, options) {
        requests.push([type, options]);
        return Promise.resolve({ toArray: () => [EmberObject.create({ id: `i${requests.length}` })], meta: {} });
      },
    };
    browser.store = store;
    browser.ideaList.store = store;
    browser.loadPlans = async () => [];
    browser.ideaList.seed([EmberObject.create({ id: "i0" })], browser.urlState.values);
    let listRequests = () => requests.filter(([type, options]) => type === "idea" && options.rels !== "none");
    return { browser, listRequests };
  }

  test("a new sort reloads only the list, from the first page", async function (assert) {
    let { browser, listRequests } = setup(this.owner);
    browser.changePage(3);
    browser.sortList("Idea.title", "desc");
    await new Promise((resolve) => setTimeout(resolve, 0));

    assert.equal(browser.page, 1);
    assert.equal(browser.sort, "Idea.title");
    assert.equal(browser.order, "ASC", "a title sorts from A to Z first");
    let last = listRequests().pop()[1];
    assert.equal(last.page, 1);
    assert.equal(last.sort, "Idea.title");
    assert.equal(last.limit, 20);
  });

  test("grouping by plan status regroups the loaded page without a request, grouping by creator reloads",
    async function (assert) {
      let { browser, listRequests } = setup(this.owner);
      browser.changePage(2);
      await new Promise((resolve) => setTimeout(resolve, 0));
      let before = listRequests().length;

      browser.groupList("planStatus");
      await new Promise((resolve) => setTimeout(resolve, 0));
      assert.equal(listRequests().length, before, "no request for plan status");
      assert.equal(browser.page, 2, "the page stays");

      browser.groupList("createdBy");
      await new Promise((resolve) => setTimeout(resolve, 0));
      assert.equal(listRequests().length, before + 1);
      let last = listRequests().pop()[1];
      assert.equal(last.sort, "Idea.createdUser,Idea.dateModified");
      assert.equal(last.page, 1);
    });

  test("a search and the archived toggle reload the list; a saved search mark alone does not", async function (assert) {
    let { browser, listRequests } = setup(this.owner);
    browser.selectSavedSearch({ id: 7 });
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(listRequests().length, 0);
    assert.equal(browser.searchId, "7");

    browser.applyQuery("(Idea.title : x)");
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.ok(listRequests().pop()[1].query.includes("(Idea.title : x)"));

    browser.toggleArchived();
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.notOk(listRequests().pop()[1].query.includes("Idea.status"));
    assert.true(browser.archived);
  });

  test("params that send the request already loaded do not load it again", async function (assert) {
    let { browser, listRequests } = setup(this.owner);
    browser.ideaList.seed([], { ...browser.urlState.values, page: 2 });
    browser.changePage(2);
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(listRequests().length, 0);
  });

  test("a failed first page is loaded again so the list shows its error and retry", async function (assert) {
    let { browser, listRequests } = setup(this.owner);
    let failing = {
      query() {
        return Promise.reject(new Error("down"));
      },
    };
    browser.ideaList.store = failing;
    browser.resetBrowser();
    await browser.showFirstPage(browser.urlState.values, { error: new Error("down") }, null);
    assert.ok(browser.listError, "the list error is set");
    assert.deepEqual(browser.listedIdeas, []);

    browser.ideaList.store = browser.store;
    await browser.reloadList();
    assert.notOk(browser.listError);
    assert.equal(browser.listedIdeas.length, 1);
    assert.equal(listRequests().length, 1);
  });

  test("resetting the browser drops the page and puts the params back to their defaults", async function (assert) {
    let { browser } = setup(this.owner);
    browser.changePage(2);
    browser.selectSavedSearch({ id: 3 });
    await new Promise((resolve) => setTimeout(resolve, 0));

    browser.resetBrowser();
    assert.deepEqual(browser.listedIdeas, []);
    assert.equal(browser.page, 1);
    assert.equal(browser.searchId, null);
    assert.equal(browser.ideaList.params, undefined);
  });
});
