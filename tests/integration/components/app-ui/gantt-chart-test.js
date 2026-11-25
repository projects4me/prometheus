/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { render, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { GANTT_ROW_HEIGHT } from 'prometheus/utils/gantt-helpers';
import EmberObject from '@ember/object';
import AclStub from '../../stub-services/acl-stub';
import CurrentUserStub from '../../stub-services/current-user-stub';

class ViewportStub extends Service {
    @tracked isPhone = false;
}

class PanelState {
    @tracked open = false;
    @tracked issue = null;
}

class Expanded {
    @tracked ids = new Set(['m1']);
}

module('Integration | Component | app-ui/gantt-chart', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:current-user', CurrentUserStub);
        this.owner.register('service:viewport', ViewportStub);
        this.viewport = this.owner.lookup('service:viewport');
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

    test('milestone and issue rows share the one row height, grid and links read it too', async function (assert) {
        this.state.ids = new Set(['m1']);
        await renderChart();
        assert.dom('.gantt-chart').hasAttribute('style', `--gantt-row-height: ${GANTT_ROW_HEIGHT}px`);
        const heights = [...document.querySelectorAll('.gantt-timeline-row')].map((r) => r.offsetHeight);
        assert.ok(heights.length >= 3, 'milestone and issue rows rendered');
        assert.true(heights.every((h) => h === GANTT_ROW_HEIGHT), `all rows are ${GANTT_ROW_HEIGHT}px: ${heights}`);
        assert.dom('.gantt-grid-overlay pattern').hasAttribute('height', String(GANTT_ROW_HEIGHT));
        assert.dom('.grid-line-horizontal').hasAttribute('d', new RegExp(`^M 0 ${GANTT_ROW_HEIGHT} H`));
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

    test('desktop has no phone tabs and shows both columns', async function (assert) {
        await renderChart();
        assert.dom('[data-test-gantt-phone-tabs]').doesNotExist();
        assert.dom('.gantt-time-scale-selector').exists();
        assert.dom('.gantt-container').doesNotHaveClass('gantt-phone');
    });

    test('phones get List | Timeline tabs under the search, opening on List', async function (assert) {
        this.viewport.isPhone = true;
        await renderChart();
        assert.dom('[data-test-gantt-phone-tabs]').exists();
        assert.dom('[data-test-gantt-tab="list"]').exists();
        assert.dom('[data-test-gantt-tab="list"]').hasText('List');
        assert.dom('[data-test-gantt-tab="timeline"]').hasText('Timeline');
        assert.dom('.gantt-container').hasClass('gantt-phone-list');
        assert.dom('[data-test-gantt-phone-scale]').doesNotExist('Days/Weeks only on the Timeline tab');
        assert.dom('.gantt-time-scale-selector').doesNotExist();
    });

    test('on phones the Timeline tab shows Days/Weeks', async function (assert) {
        this.viewport.isPhone = true;
        await renderChart();
        await click('[data-test-gantt-tab="timeline"]');
        assert.dom('.gantt-container').hasClass('gantt-phone-timeline');
        assert.dom('[data-test-gantt-phone-scale]').exists();
    });

    test('a list tap on a phone switches to the Timeline tab and selects the issue', async function (assert) {
        this.viewport.isPhone = true;
        await renderChart();
        await click('[data-test-gantt-issue-list] [data-issue-id="2"]');
        assert.strictEqual(this.selected.id, '2');
        assert.dom('.gantt-container').hasClass('gantt-phone-timeline');
        assert.dom('.gantt-timeline-row.task-row[data-issue-id="2"]').hasClass('selected');
        await click('[data-test-gantt-tab="list"]');
        assert.dom('[data-test-gantt-issue-list] [data-issue-id="2"]').hasClass('quick-list-item--active');
    });

    test('the layout follows the viewport live and keeps the selection', async function (assert) {
        this.viewport.isPhone = true;
        await renderChart();
        await click('[data-test-gantt-issue-list] [data-issue-id="2"]');
        this.viewport.isPhone = false;
        await settled();
        assert.dom('[data-test-gantt-phone-tabs]').doesNotExist();
        assert.dom('.gantt-time-scale-selector').exists();
        assert.strictEqual(this.selected.id, '2');
        assert.dom('[data-test-gantt-issue-list] [data-issue-id="2"]').hasClass('quick-list-item--active');
    });
    module('issue quick view', function (hooks) {
        hooks.beforeEach(function () {
            this.owner.register('service:acl', AclStub);
            this.projectController = EmberObject.create({ members: [], membersList: [], issuesList: [], projectId: '1' });
            this.panelState = new PanelState();
            this.openPanel = (i) => { this.panelState.issue = EmberObject.create({ ...i, timelogs: [], comments: [], files: [] }); this.panelState.open = true; };
            this.closePanel = () => { this.panelState.issue = null; this.panelState.open = false; };
        });

        const renderWithPanel = () => render(hbs`<AppUi::GanttChart
            @milestones={{this.milestones}} @timelineStart={{this.timelineStart}} @timelineEnd={{this.timelineEnd}}
            @expandedMilestones={{this.state.ids}} @isMilestoneExpanded={{this.isExpanded}}
            @onToggleMilestone={{this.onToggle}} @onIssueClick={{this.onIssueClick}}
            @onOpenIssuePanel={{this.openPanel}} @selectedIssue={{this.selected}}
            @isIssuePanelOpen={{this.panelState.open}} @panelIssue={{this.panelState.issue}}
            @projectController={{this.projectController}} @onCloseIssuePanel={{this.closePanel}} />`);

        test('on phones the eye opens the bottom sheet, keeps the tab and closing clears the panel', async function (assert) {
            this.viewport.isPhone = true;
            await renderWithPanel();
            await click('[data-test-gantt-issue-list-open]');
            assert.dom('dialog.gantt-quick-view-modal, .gantt-quick-view-modal').exists();
            assert.dom('.gantt-issue-panel').doesNotExist();
            assert.dom('.gantt-container').hasClass('gantt-phone-list');
            assert.strictEqual(this.selected, null);
            assert.dom('.gantt-timeline-wrapper').doesNotHaveClass('gantt-timeline-hidden');
            this.closePanel();
            await settled();
            assert.dom('.gantt-quick-view-modal').doesNotExist();
        });

        test('on desktop the eye opens the side panel, not the modal', async function (assert) {
            await renderWithPanel();
            await click('[data-test-gantt-issue-list-open]');
            assert.dom('.gantt-issue-panel-visible').exists();
            assert.dom('.gantt-quick-view-modal').doesNotExist();
        });
    });
});
