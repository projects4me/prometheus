/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { tracked } from '@glimmer/tracking';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import CurrentUserStub from '../../stub-services/current-user-stub';

class Expanded {
    @tracked ids = new Set(['m1']);
}

module('Integration | Component | app-ui/gantt-chart', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:current-user', CurrentUserStub);
        const issue = (id, number) => ({
            id, issueNumber: number, subject: `Subject ${number}`, status: 'new', priority: 'high',
            startDate: '2026-11-10', endDate: '2026-11-12'
        });
        this.milestones = [
            { id: 'm1', name: 'Alpha', startDate: '2026-11-01', endDate: '2026-11-30', issues: [issue('1', 1), issue('2', 2)] },
            { id: 'm2', name: 'Beta', startDate: '2026-12-01', endDate: '2026-12-31', issues: [issue('3', 3)] }
        ];
        this.timelineStart = '2026-11-01';
        this.timelineEnd = '2026-12-31';
        this.state = new Expanded();
        this.selected = null;
        this.panel = [];
        this.onIssueClick = (i) => this.set('selected', i);
        this.onToggle = (id) => {
            const next = new Set(this.state.ids);
            next.has(id) ? next.delete(id) : next.add(id);
            this.state.ids = next;
        };
        this.isExpanded = (id) => this.state.ids.has(id);
        this.onOpenPanel = (i) => this.panel.push(i.id);
        this.noop = () => {};
    });

    const renderChart = () => render(hbs`<AppUi::GanttChart
        @milestones={{this.milestones}} @timelineStart={{this.timelineStart}} @timelineEnd={{this.timelineEnd}}
        @expandedMilestones={{this.state.ids}} @isMilestoneExpanded={{this.isExpanded}}
        @onToggleMilestone={{this.onToggle}} @onIssueClick={{this.onIssueClick}}
        @onOpenIssuePanel={{this.onOpenPanel}} @selectedIssue={{this.selected}}
        @onCloseIssuePanel={{this.noop}}>
        <:search><span data-test-search>search</span></:search>
    </AppUi::GanttChart>`);

    test('is one panel with the search on top, the list beside a bars-only timeline', async function (assert) {
        await renderChart();
        assert.dom('.gantt-chart.box.box-primary').exists({ count: 1 });
        assert.dom('.gantt-chart > .gantt-search [data-test-search]').exists();
        assert.dom('.gantt-task-list').doesNotExist();
        assert.dom('.gantt-task-row').doesNotExist();
        assert.dom('[data-test-gantt-issue-list]').exists();
        assert.dom('[data-test-gantt-issue-list] [data-issue-id]').exists({ count: 3 });
        assert.dom('.gantt-timeline-row.task-row').exists({ count: 2 });
        assert.dom('[data-test-gantt-milestone-label]').exists({ count: 2 });
    });

    test('a list click selects the issue and expands its collapsed milestone', async function (assert) {
        await renderChart();
        assert.dom('.gantt-timeline-row.task-row[data-issue-id="3"]').doesNotExist();
        await click('[data-test-gantt-issue-list] [data-issue-id="3"]');
        assert.strictEqual(this.selected.id, '3');
        assert.dom('.gantt-timeline-row.task-row[data-issue-id="3"]').exists();
        assert.dom('.gantt-timeline-row.task-row[data-issue-id="3"]').hasClass('selected');
        await click('[data-test-gantt-issue-list] [data-issue-id="3"]');
        assert.strictEqual(this.selected.id, '3', 'a second click does not deselect');
    });

    test('a bar click selects the issue and marks it in the list', async function (assert) {
        await renderChart();
        await click('.gantt-timeline-row.task-row[data-issue-id="2"] [data-test-gantt-bar]');
        assert.strictEqual(this.selected.id, '2');
        assert.dom('[data-test-gantt-issue-list] [data-issue-id="2"]').hasClass('quick-list-item--active');
    });

    test('the eye opens the issue panel', async function (assert) {
        await renderChart();
        await click('[data-test-gantt-issue-list] [data-issue-id="1"] + [data-test-quick-list-item-trailing] [data-test-gantt-issue-list-open]');
        assert.deepEqual(this.panel, ['1']);
    });

    test('collapsing a milestone in the timeline keeps the list group', async function (assert) {
        await renderChart();
        await click('[data-test-gantt-milestone-toggle]');
        assert.dom('.gantt-timeline-row.task-row').doesNotExist();
        assert.dom('[data-test-gantt-issue-list] [data-issue-id="1"]').exists();
    });
});
