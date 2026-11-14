import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { render, triggerEvent, waitUntil } from "@ember/test-helpers";
import { hbs } from "ember-cli-htmlbars";
import initializer from "prometheus/initializers/javascript-behaviors";

module("Integration | Initializer | tooltips", function (hooks) {
    setupRenderingTest(hooks);

    test("a tooltip shows for an element rendered after boot", async function (assert) {
        initializer.initialize();
        await render(
            hbs`<span id="tip" data-toggle="tooltip" title="Hello tip">x</span>`
        );
        await triggerEvent("#tip", "mouseover");
        await waitUntil(() => document.querySelector("[data-tippy-root]"));
        assert.dom("[data-tippy-root]", document.body).includesText("Hello tip");
    });
});
