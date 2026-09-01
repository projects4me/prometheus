import { module, test } from "qunit";
import { peekOrPush, pushIfMissing, removeById } from "prometheus/utils/live/collection";

module("Unit | Utility | live/collection", function () {
  test("pushIfMissing is idempotent and removeById removes the record", function (assert) {
    let list = {
      items: [],
      includes(record) {
        return this.items.includes(record);
      },
      findBy(key, value) {
        return this.items.find((item) => item[key] === value);
      },
      pushObject(record) {
        this.items.push(record);
      },
      removeObject(record) {
        this.items = this.items.filter((item) => item !== record);
      },
    };
    let record = { id: "c1" };

    pushIfMissing(list, record);
    pushIfMissing(list, record);
    assert.strictEqual(list.items.length, 1);

    removeById(list, "c1");
    assert.strictEqual(list.items.length, 0);
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
