import { module, test } from "qunit";
import { postToast } from "prometheus/utils/ui/post-toast";

module("Unit | Utility | ui/post-toast", function (hooks) {
    let original;
    let posted;

    hooks.beforeEach(function () {
        original = window.Messenger;
        posted = null;
        window.Messenger = function () {
            return { post: (options) => (posted = options) };
        };
    });

    hooks.afterEach(function () {
        window.Messenger = original;
    });

    test("posts the translated message with interpolation values and type", function (assert) {
        let intl = { t: (key, values) => `${key}:${values.user}` };

        postToast(intl, "some.key", "info", { user: "Ann" });

        assert.strictEqual(posted.message, "some.key:Ann");
        assert.strictEqual(posted.type, "info");
    });

    test("asks Messenger to escape the text so user names are not rendered as markup", function (assert) {
        let intl = { t: () => "<b>x</b>" };

        postToast(intl, "some.key");

        assert.true(posted.escapeText);
    });
});
