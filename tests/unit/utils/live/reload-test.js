import { module, test } from "qunit";
import { isTransitionAborted, refreshView } from "prometheus/utils/live/reload";

module("Unit | Utility | live/reload", function () {
  test("isTransitionAborted detects TransitionAborted errors", function (assert) {
    assert.true(isTransitionAborted({ name: "TransitionAborted" }));
    assert.true(isTransitionAborted({ message: "TransitionAborted" }));
    assert.true(
      isTransitionAborted({ message: "Live reload failed TransitionAborted: TransitionAborted" })
    );
    assert.false(isTransitionAborted({ message: "Network request failed" }));
    assert.false(isTransitionAborted(null));
  });

  test("refreshView resolves when refresh rejects with TransitionAborted", async function (assert) {
    let router = {
      refresh() {
        return Promise.reject({ name: "TransitionAborted", message: "TransitionAborted" });
      },
    };

    await refreshView(router);
    assert.ok(true, "TransitionAborted is treated as success");
  });

  test("refreshView rethrows genuine refresh failures", async function (assert) {
    let router = {
      refresh() {
        return Promise.reject(new Error("Network request failed"));
      },
    };

    try {
      await refreshView(router);
      assert.ok(false, "expected refresh to reject");
    } catch (error) {
      assert.strictEqual(error.message, "Network request failed");
    }
  });
});
