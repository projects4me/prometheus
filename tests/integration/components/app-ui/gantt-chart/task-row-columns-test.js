/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { schedule } from 'prometheus/utils/gantt/schedule';
import CurrentUserStub from '../../../stub-services/current-user-stub';

module('Integration | Component | app-ui/gantt-chart/task-row estimate and planned start', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:current-user', CurrentUserStub);
        this.issue = { id: '1', issueNumber: 7, subject: 'Work', projectId: '5', startDate: '2026-11-30', endDate: '2026-12-04' };
    });

    test('shows the summed estimate and the planned start in italics', async function (assert) {
        this.totals = new Map([['1', { spent: 0, estimated: 180 }]]);
        this.plan = schedule([{ ...this.issue, estimateHours: 3 }], []);
        await render(hbs`<AppUi::GanttChart::TaskRow @part="grid" @issue={{this.issue}} @timeTotals={{this.totals}} @schedule={{this.plan}} />`);
        assert.dom('[data-test-gantt-grid-est]').hasText('3h');
        assert.dom('[data-test-gantt-grid-planned]').hasText('30 Nov 09:00');
        assert.dom('[data-test-gantt-grid-planned] em').exists();
    });

    test('shows a dash without an estimate or a schedule', async function (assert) {
        this.totals = new Map();
        this.plan = new Map();
        await render(hbs`<AppUi::GanttChart::TaskRow @part="grid" @issue={{this.issue}} @timeTotals={{this.totals}} @schedule={{this.plan}} />`);
        assert.dom('[data-test-gantt-grid-est]').hasText('—');
        assert.dom('[data-test-gantt-grid-planned]').hasText('—');
    });
});
