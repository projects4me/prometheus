import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { render, triggerEvent } from "@ember/test-helpers";
import { hbs } from "ember-cli-htmlbars";
import $ from "jquery";
import initializer from "prometheus/initializers/javascript-behaviors";

module("Integration | Initializer | tooltips", function (hooks) {
    setupRenderingTest(hooks);

    test("a tooltip shows for an element rendered after boot", async function (assert) {
        initializer.initialize();
        await render(
            hbs`<span id="tip" data-toggle="tooltip" title="Hello tip">x</span>`
        );
        $("#tip").trigger("mouseover");
        await triggerEvent("#tip", "mouseover");
        assert.dom(".tooltip", document.body).exists();
        $("#tip").tooltip("destroy");
    });
});
