/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, clearRender } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | chart-issueratio', function (hooks) {
    setupRenderingTest(hooks);

    test('it draws one slice per status in the status colours', async function (assert) {
        this.set('issues', [
            { status: 'new' },
            { status: 'in_progress' },
            { status: 'new' },
            { status: 'done' },
        ]);

        await render(hbs`<ChartIssueratio @issues={{this.issues}} />`);

        assert.dom('canvas.chart-issueratio').exists();
        let chart = Chart.getChart(this.element.querySelector('canvas'));
        assert.strictEqual(chart.config.type, 'polarArea');
        assert.deepEqual(chart.data.labels, ['New', 'In Progress', 'Done']);
        assert.deepEqual(chart.data.datasets[0].data, [2, 1, 1]);
        assert.strictEqual(chart.data.datasets[0].backgroundColor[0], 'rgba(128, 181, 211, 0.8)');
        assert.strictEqual(chart.data.datasets[0].backgroundColor[1], 'rgba(179, 36, 79, 0.8)');
        assert.true(chart.getDataVisibility(0), 'new is shown');
        assert.false(chart.getDataVisibility(2), 'done is hidden by default');
    });

    test('it redraws when the issues change and destroys the chart on teardown', async function (assert) {
        this.set('issues', [{ status: 'new' }]);
        await render(hbs`<ChartIssueratio @issues={{this.issues}} />`);
        let canvas = this.element.querySelector('canvas');

        this.set('issues', [{ status: 'pending' }, { status: 'pending' }]);
        let chart = Chart.getChart(canvas);
        assert.deepEqual(chart.data.datasets[0].data, [2]);

        await clearRender();
        assert.strictEqual(Chart.getChart(canvas), undefined, 'chart destroyed');
    });
});
