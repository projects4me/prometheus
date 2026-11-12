import { module, test } from "qunit";
import { peekOrPush, pushIfMissing, removeById, insertAtIfMissing } from "prometheus/utils/live/collection";

module("Unit | Utility | live/collection", function () {
  test("insertAtIfMissing is idempotent by record id", function (assert) {
    let list = [{ id: "m0" }];
    let record = { id: "m1" };

    assert.true(insertAtIfMissing(list, record, 0));
    assert.false(insertAtIfMissing(list, record, 0));
    assert.strictEqual(list.length, 2);
    assert.strictEqual(list[0].id, "m1");
  });

  test("the helpers change the loaded ManyArray of an async hasMany", function (assert) {
    let content = [];
    let relation = { content, isFulfilled: true, then() {} };
    let record = { id: "c1" };

    pushIfMissing(relation, record);
    assert.deepEqual(content, [record]);
    assert.false(insertAtIfMissing(relation, { id: "c1" }, 0));

    removeById(relation, "c1");
    assert.strictEqual(content.length, 0);
  });

  test("pushIfMissing is idempotent and removeById removes the record", function (assert) {
    let list = [];
    let record = { id: "c1" };

    pushIfMissing(list, record);
    pushIfMissing(list, record);
    assert.strictEqual(list.length, 1);

    removeById(list, "c1");
    assert.strictEqual(list.length, 0);
  });

  test("peekOrPush patches an existing record", function (assert) {
    let existing = { id: "i1", status: "new" };
    existing.setProperties = (attrs) => Object.assign(existing, attrs);
    let store = {
      peekRecord() {
        return existing;
      },
    };

    let record = peekOrPush(store, "issue", "i1", { status: "done" });
    assert.strictEqual(record.status, "done");
  });

  test("peekOrPush creates a stub when the record is missing", function (assert) {
    let pushed = null;
    let store = {
      peekRecord() {
        return null;
      },
      push(payload) {
        pushed = payload;
        return { id: payload.data.id };
      },
    };

    let record = peekOrPush(store, "user", "u1", {});
    assert.strictEqual(record.id, "u1");
    assert.strictEqual(pushed.data.type, "user");
  });
});
