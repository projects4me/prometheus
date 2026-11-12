import { module, test } from "qunit";
import { toArray, isPromiseManyArray } from "prometheus/utils/array/to-array";
import { objectAt } from "prometheus/utils/array/object-at";

// The shape of an unawaited async hasMany: a thenable with the loaded ManyArray as its content.
const promiseManyArray = (content) => ({ content, isFulfilled: !!content, then() {} });

module("Unit | Utility | array/to-array", function () {
  test("toArray copies a plain array or a record array", function (assert) {
    let records = [{ id: "1" }, { id: "2" }];
    let copy = toArray(records);
    assert.deepEqual(copy, records);
    assert.notStrictEqual(copy, records, "a new array");
  });

  test("toArray of a PromiseManyArray is its loaded records, or none while loading", function (assert) {
    assert.deepEqual(toArray(promiseManyArray([{ id: "1" }])), [{ id: "1" }]);
    assert.deepEqual(toArray(promiseManyArray(null)), []);
  });

  test("toArray of nothing is an empty array", function (assert) {
    assert.deepEqual(toArray(undefined), []);
    assert.deepEqual(toArray(null), []);
  });

  test("isPromiseManyArray tells a PromiseManyArray from an array", function (assert) {
    assert.true(isPromiseManyArray(promiseManyArray([])));
    assert.false(isPromiseManyArray([]));
    assert.false(isPromiseManyArray(Promise.resolve([])));
  });

  test("objectAt reads a plain array, a PromiseManyArray and nothing", function (assert) {
    assert.strictEqual(objectAt(["a", "b"], 1), "b");
    assert.strictEqual(objectAt(["a", "b"], -1), "b");
    assert.strictEqual(objectAt(promiseManyArray(["a"]), 0), "a");
    assert.strictEqual(objectAt(promiseManyArray(null), 0), undefined);
    assert.strictEqual(objectAt(undefined, 0), undefined);
  });
});
