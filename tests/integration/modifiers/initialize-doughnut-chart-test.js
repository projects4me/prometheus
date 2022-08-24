import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | initialize-doughnut-chart', function (hooks) {
    setupRenderingTest(hooks);

    // Replace this with your real tests.
    test('it attach doughnut chart with canvas', async function (assert) {
        await render(hbs`
            <canvas {{initialize-doughnut-chart}}></canvas>
        `);

        let modifierAttachedOrNot = (this.element.querySelector('canvas').$chartjs);
        assert.equal("object", (typeof modifierAttachedOrNot));
    });
});
