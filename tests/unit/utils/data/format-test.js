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
});
