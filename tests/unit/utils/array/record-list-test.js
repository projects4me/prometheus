import { module, test } from "qunit";
import { pushRecords, addRecord, removeRecord, insertRecordAt, replaceRecords } from "prometheus/utils/array/record-list";

const promiseManyArray = (content) => ({ content, isFulfilled: !!content, then() {} });

module("Unit | Utility | array/record-list", function () {
  test("pushRecords, addRecord and insertRecordAt add records", function (assert) {
    let a = { id: "a" };
    let b = { id: "b" };
    let c = { id: "c" };
    let list = [];

    pushRecords(list, [a]);
    addRecord(list, a);
    addRecord(list, b);
    insertRecordAt(list, 0, c);
    assert.deepEqual(list, [c, a, b]);
  });

  test("adding is idempotent: records already held or given twice are added once", function (assert) {
    let a = { id: "a" };
    let b = { id: "b" };
    let c = { id: "c" };
    let list = [a];

    pushRecords(list, [a, b, b]);
    assert.deepEqual(list, [a, b], "pushRecords skips held and repeated records");

    pushRecords(list, [a, b]);
    assert.deepEqual(list, [a, b], "pushing the same records again changes nothing");

    insertRecordAt(list, 0, b);
    assert.deepEqual(list, [a, b], "insertRecordAt skips a held record");

    replaceRecords(list, [c, a, c]);
    assert.deepEqual(list, [c, a], "replaceRecords keeps a repeated record once");
  });

  test("removeRecord and replaceRecords change the list in place", function (assert) {
    let a = { id: "a" };
    let b = { id: "b" };
    let list = [a, b];

    removeRecord(list, a);
    removeRecord(list, { id: "x" });
    assert.deepEqual(list, [b]);

    replaceRecords(list, [a, b]);
    assert.deepEqual(list, [a, b]);
  });

  test("a PromiseManyArray changes through its loaded ManyArray, and not while loading", function (assert) {
    let a = { id: "a" };
    let content = [];

    pushRecords(promiseManyArray(content), [a]);
    assert.deepEqual(content, [a]);

    pushRecords(promiseManyArray(null), [a]);
    removeRecord(promiseManyArray(null), a);
    assert.deepEqual(content, [a], "nothing to change while loading");
  });
});
