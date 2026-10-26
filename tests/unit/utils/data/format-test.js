import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { setOwner } from "@ember/application";
import Format from "prometheus/utils/data/format";
import { A } from "@ember/array";

module("Unit | Utility | data/format", function (hooks) {
  setupTest(hooks);

  function createFormat(owner) {
    let context = {};
    setOwner(context, owner);
    return new Format(context);
  }

  test("getSelectList returns backlog placeholder when milestones are empty and isRequired", function (assert) {
    let formatUtil = createFormat(this.owner);
    let list = formatUtil.getSelectList(A([]), false, {
      isRequired: true,
      placeholder: "Backlog",
    });

    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].value, "");
  });

  test("getSelectList returns empty array when milestones are empty and isRequired is false", function (assert) {
    let formatUtil = createFormat(this.owner);
    let list = formatUtil.getSelectList(A([]));

    assert.strictEqual(list.length, 0);
  });

  test("getTranslation reads the list from the merged translations, so backend values win", function (assert) {
    let intl = this.owner.lookup("service:intl");
    intl.setLocale("en-us");
    intl.addTranslations("en-us", { views: { app: { issue: { lists: { priority: { high: "Very High" } } } } } });

    let list = createFormat(this.owner).getTranslation("views.app.issue.lists.priority");

    assert.strictEqual(list.high, "Very High");
    assert.strictEqual(list.low, "Low");
  });

  test("getTranslation reads a backend-only locale such as de-de", function (assert) {
    let intl = this.owner.lookup("service:intl");
    intl.addTranslations("de-de", { views: { app: { issue: { lists: { priority: { high: "Hoch" } } } } } });
    intl.setLocale("de-de");

    let list = createFormat(this.owner).getTranslation("views.app.issue.lists.priority");

    assert.deepEqual(list, { high: "Hoch" });
  });

  test("getTranslation falls back to the default locale when the active locale lacks the list", function (assert) {
    let intl = this.owner.lookup("service:intl");
    intl.addTranslations("de-de", { global: { blank: "Leer" } });
    intl.setLocale("de-de");

    let list = createFormat(this.owner).getTranslation("views.app.issue.lists.priority");

    assert.strictEqual(list.high, "High");
  });
});
