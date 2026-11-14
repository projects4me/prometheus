/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, clearRender } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';

/**
 * Builds an issue with the given estimated and spent hours.
 */
function issue(issueNumber, estimatedHours, spentHours) {
    return EmberObject.create({
        issueNumber,
        estimated: estimatedHours === null ? [] : [{ days: 0, hours: estimatedHours, minutes: 0 }],
        spent: [{ days: 0, hours: spentHours, minutes: 0 }],
    });
}

module('Integration | Component | chart-estimatedspent', function (hooks) {
    setupRenderingTest(hooks);

    test('it draws one bar per issue with the spent share of the estimate', async function (assert) {
        this.set('issues', [issue(1, 10, 5), issue(2, 4, 8), issue(3, null, 2)]);

        await render(hbs`<ChartEstimatedspent @issues={{this.issues}} />`);

        assert.dom('canvas.chart-estimatedspent').exists();
        let chart = Chart.getChart(this.element.querySelector('canvas'));
        assert.strictEqual(chart.config.type, 'bar');
        assert.deepEqual(chart.data.labels, ['#1', '#2', '#3']);
        assert.deepEqual(chart.data.datasets[0].data, [50, 100, 0], 'spent share, clamped to 100');
        assert.deepEqual(chart.data.datasets[1].data, [50, 0, 0], 'efficiency line');
        assert.deepEqual(chart.data.datasets[0].backgroundColor, ['#00a65a', '#dd4b39', '#dd4b39']);
    });

    test('it redraws the chart when the issues change', async function (assert) {
        this.set('issues', [issue(1, 10, 5)]);
        await render(hbs`<ChartEstimatedspent @issues={{this.issues}} />`);
        let canvas = this.element.querySelector('canvas');
        let firstChart = Chart.getChart(canvas);

        this.set('issues', [issue(7, 10, 2), issue(8, 10, 10)]);

        let chart = Chart.getChart(canvas);
        assert.notStrictEqual(chart, firstChart, 'a new chart is drawn');
        assert.deepEqual(chart.data.labels, ['#7', '#8']);
        assert.deepEqual(chart.data.datasets[0].data, [20, 100]);
    });

    test('it draws nothing without issues and destroys the chart on teardown', async function (assert) {
        this.set('issues', undefined);
        await render(hbs`<ChartEstimatedspent @issues={{this.issues}} />`);
        let canvas = this.element.querySelector('canvas');
        assert.strictEqual(Chart.getChart(canvas), undefined, 'no chart without issues');

        this.set('issues', [issue(1, 10, 5)]);
        let chart = Chart.getChart(canvas);
        assert.ok(chart, 'chart drawn once issues arrive');

        await clearRender();
        assert.strictEqual(Chart.getChart(canvas), undefined, 'chart destroyed');
    });
});
