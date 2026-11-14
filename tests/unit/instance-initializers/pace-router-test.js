import { module, test } from "qunit";
import { setupTest } from "ember-qunit";

module("Unit | Instance Initializer | pace-router", function (hooks) {
    setupTest(hooks);

    test("a page change restarts Pace", function (assert) {
        const original = window.Pace.restart;
        let calls = 0;
        window.Pace.restart = () => calls++;

        try {
            this.owner.lookup("service:router").trigger("routeWillChange", {});
            assert.strictEqual(calls, 1);
        } finally {
            window.Pace.restart = original;
        }
    });

    test("socket.io and Hermes URLs stay in Pace's ignore list", function (assert) {
        const urls = window.Pace.options.ajax.ignoreURLs;
        assert.true(urls.includes("/socket.io/"));
    });
});
