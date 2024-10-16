/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | initialize-doughnut-chart', function (hooks) {
    setupRenderingTest(hooks);

    // Replace this with your real tests.
    test('it attach doughnut chart with canvas', async function (assert) {
        let data = {
            labels: ['closed', 'open'],
            datasets: [{
                data: [1, 1],
                backgroundColor: ['#508874', '#A2EDD2']
            }],
        }

        this.set('data', data);

        await render(hbs`
            <canvas {{initialize-doughnut-chart data=this.data}}></canvas>
        `);

        let modifierAttachedOrNot = (this.element.querySelector('canvas').$chartjs);
        assert.equal("object", (typeof modifierAttachedOrNot));
    });
});
