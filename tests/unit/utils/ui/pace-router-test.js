import { module, test } from "qunit";
import Evented from "@ember/object/evented";
import EmberObject from "@ember/object";
import { restartPaceOnTransition } from "prometheus/utils/ui/pace-router";

module("Unit | Utility | ui/pace-router", function () {
    test("a page change restarts Pace", function (assert) {
        const router = EmberObject.extend(Evented).create();
        const original = window.Pace.restart;
        let calls = 0;
        window.Pace.restart = () => calls++;

        try {
            restartPaceOnTransition(router);
            router.trigger("routeWillChange", {});
            assert.strictEqual(calls, 1);
        } finally {
            window.Pace.restart = original;
        }
    });
});
