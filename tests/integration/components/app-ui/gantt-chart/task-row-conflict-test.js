/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { schedule } from 'prometheus/utils/gantt/schedule';
import CurrentUserStub from '../../../stub-services/current-user-stub';

module('Integration | Component | app-ui/gantt-chart/task-row conflict flag', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:current-user', CurrentUserStub);
        this.issue = { id: '1', issueNumber: 7, subject: 'Late', projectId: '5', startDate: '2026-11-05', endDate: '2026-11-08', estimateHours: null };
        this.blocker = (extra) => ({ id: '2', issueNumber: 3, projectId: '5', startDate: '2026-11-02', endDate: '2026-11-10', estimateHours: null, ...extra });
        this.lookup = (blockers, isOpen = () => true) => ({
            projectId: '5',
            isOpen,
            links: blockers.map((source) => ({ type: 'blocks', belongsTo: () => ({ id: () => '1', value: () => source }) }))
        });
        this.planFor = (blockers) => schedule(
            [this.issue, ...blockers],
            blockers.map((source) => ({ sourceId: source.id, targetId: '1' }))
        );
        this.noop = () => {};
    });

    const renderRows = async (context) => {
        await render(hbs`<AppUi::GanttChart::TaskRow @part="grid" @issue={{this.issue}} @links={{this.links}} @schedule={{this.plan}} />
            <AppUi::GanttChart::TaskRow @issue={{this.issue}} @links={{this.links}} @schedule={{this.plan}} @timelineStart="2026-11-01" @dayWidth={{30}} />`, context);
    };

    test('flags the row in the grid and on the timeline for an open late blocker', async function (assert) {
        this.links = this.lookup([this.blocker()]);
        this.plan = this.planFor([this.blocker()]);
        await renderRows(this);
        assert.dom('[data-test-gantt-conflict-icon]').exists();
        assert.dom('[data-test-gantt-conflict-icon]').hasClass('fa-ban');
        assert.dom('[data-test-gantt-conflict-flag]').hasText('Runs past its end date (blocked by #3)');
    });

    test('no flag for a done blocker or one ending before the start', async function (assert) {
        this.links = this.lookup([this.blocker()], () => false);
        this.plan = this.planFor([this.blocker()]);
        await renderRows(this);
        assert.dom('[data-test-gantt-conflict-icon]').doesNotExist();
        assert.dom('[data-test-gantt-conflict-flag]').doesNotExist();

        this.set('links', this.lookup([this.blocker({ endDate: '2026-11-04' })]));
        this.set('plan', this.planFor([this.blocker({ endDate: '2026-11-04' })]));
        assert.dom('[data-test-gantt-conflict-flag]').doesNotExist();
    });

    test('names a blocker of another project by its code and counts the others', async function (assert) {
        let others = [
            this.blocker({ id: '9', projectId: '6', projectShortcode: 'abc', endDate: '2026-11-12' }),
            this.blocker()
        ];
        this.links = this.lookup(others);
        this.plan = this.planFor(others);
        await renderRows(this);
        assert.dom('[data-test-gantt-conflict-flag]').hasText('Runs past its end date (blocked by ABC) and 1 more');
    });
});
