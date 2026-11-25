/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { render, click, settled, triggerEvent } from '@ember/test-helpers';
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
            startDate: '2026-11-10', endDate: '2026-11-12', projectShortcode: 'APROM',
            modifiedBy: { name: `Modifier ${number}` }
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

    const GRID = '[data-test-gantt-grid]';
    const gridRow = (id) => `${GRID} .gantt-grid-row[data-issue-id="${id}"]`;
    const barRow = (id) => `.gantt-timeline-row.task-row[data-issue-id="${id}"]`;
    const topOf = (selector) => document.querySelector(selector).getBoundingClientRect().top;

    test('is one panel with the search on top, the grid beside the timeline in one scroll container', async function (assert) {
        await renderChart();
        assert.dom('.gantt-chart.box.box-primary').exists({ count: 1 });
        assert.dom('.gantt-chart > .gantt-search [data-test-search]').exists();
        assert.dom('[data-test-gantt-issue-list]').doesNotExist('the issue list is the phone List tab only');
        assert.dom(`.gantt-timeline-container ${GRID}`).exists({ count: 1 });
        assert.dom('[data-test-gantt-grid-header]').hasText(/Milestone \/ Issue\s+Who\s+Start\s+End/);
        assert.dom(`${GRID} .gantt-grid-row.milestone-row`).exists({ count: 2 });
        assert.dom(`${GRID} .gantt-grid-row.task-row`).exists({ count: 2 });
        assert.dom('.gantt-timeline-row.task-row').exists({ count: 2 });
        assert.dom('[data-test-gantt-milestone-label]').doesNotExist('the milestone name is in the grid');
        assert.dom(`${gridRow('1')} .gantt-grid-name`).hasText('#1 Subject 1');
        assert.dom(`${gridRow('1')} .gantt-grid-date`).exists({ count: 2 });
        assert.dom(`${gridRow('1')} [data-test-gantt-grid-start]`).hasText('10 Nov');
        assert.dom(`${gridRow('1')} [data-test-gantt-grid-end]`).hasText('12 Nov');
        assert.dom('.gantt-bar .assignee-avatar').doesNotExist('the Who column replaces the bar avatar');
        assert.dom('[data-test-gantt-milestone-count]').exists({ count: 2 });
        assert.dom(`${GRID} [data-milestone-id="m1"] [data-test-gantt-milestone-count]`).hasText('0 / 2');
    });

    test('every grid row sits level with its timeline row, expanded, collapsed and scrolled', async function (assert) {
        this.state.ids = new Set(['m1', 'm2']);
        await renderChart();
        const level = (label) => {
            ['m1', 'm2'].forEach((id) => {
                const selector = `[data-milestone-id="${id}"]`;
                assert.strictEqual(topOf(`${GRID} ${selector}`), topOf(`.gantt-timeline-row${selector}`), `${label}: milestone ${id}`);
            });
            [...document.querySelectorAll(`${GRID} .gantt-grid-row.task-row`)].forEach((row) => {
                const id = row.dataset.issueId;
                assert.strictEqual(row.getBoundingClientRect().top, topOf(barRow(id)), `${label}: issue ${id}`);
            });
        };
        level('expanded');
        await click(`${GRID} [data-milestone-id="m1"] [data-test-gantt-milestone-toggle]`);
        assert.dom(`${GRID} .gantt-grid-row.task-row`).exists({ count: 1 });
        level('m1 collapsed');
        const container = document.querySelector('.gantt-timeline-container');
        container.style.height = '80px';
        container.style.flex = 'none';
        container.scrollTop = 40;
        await settled();
        assert.ok(container.scrollTop > 0, 'the one container scrolled');
        level('scrolled');
    });

    test('the milestone state reads Overdue past its end and Done when all its issues are', async function (assert) {
        const late = { id: '7', issueNumber: 7, subject: 'Late', status: 'new', startDate: '2020-01-02', endDate: '2020-01-03' };
        const shipped = { ...late, id: '8', issueNumber: 8, status: 'done' };
        this.timelineStart = '2020-01-01';
        this.milestones = [
            { id: 'm3', name: 'Past', startDate: '2020-01-01', endDate: '2020-01-31', issues: [late, shipped] },
            { id: 'm4', name: 'Shipped', startDate: '2020-01-01', endDate: '2020-01-31', issues: [{ ...shipped, id: '9' }] },
            { id: 'm5', name: 'Later', startDate: '2099-01-01', endDate: '2099-01-31', issues: [{ ...late, id: '10', startDate: '2099-01-02', endDate: '2099-01-03' }] }
        ];
        await renderChart();
        assert.dom(`${GRID} [data-milestone-id="m3"] .label.label-danger`).hasText('Overdue');
        assert.dom(`${GRID} [data-milestone-id="m3"] [data-test-gantt-milestone-count]`).hasText('1 / 2');
        assert.dom(`${GRID} [data-milestone-id="m4"] .label.label-success`).hasText('Done');
        assert.dom(`${GRID} [data-milestone-id="m4"] .label-danger`).doesNotExist();
        assert.dom(`${GRID} [data-milestone-id="m5"] [data-test-gantt-milestone-state]`).doesNotExist();
    });

    test('milestone and issue rows share the one row height, grid and links read it too', async function (assert) {
        this.state.ids = new Set(['m1']);
        await renderChart();
        assert.dom('.gantt-chart').hasAttribute('style', new RegExp(`--gantt-row-height: ${GANTT_ROW_HEIGHT}px`));
        assert.strictEqual(GANTT_ROW_HEIGHT, 36);
        const heights = [...document.querySelectorAll('.gantt-timeline-row, .gantt-grid-row')].map((r) => r.offsetHeight);
        assert.ok(heights.length >= 3, 'milestone and issue rows rendered');
        assert.true(heights.every((h) => h === GANTT_ROW_HEIGHT), `all rows are ${GANTT_ROW_HEIGHT}px: ${heights}`);
        assert.dom('.gantt-grid-overlay pattern').hasAttribute('height', String(GANTT_ROW_HEIGHT));
        assert.dom('.grid-line-horizontal').hasAttribute('d', new RegExp(`^M 0 ${GANTT_ROW_HEIGHT} H`));
    });

    const barBox = (id) => {
        const bar = document.querySelector(`.gantt-bar-task[data-issue-id="${id}"]`);
        // jump the bar's size transition to its end state
        bar.getAnimations().forEach((animation) => animation.finish());
        const style = getComputedStyle(bar);
        return { left: style.left, width: style.width };
    };

    test('bars take their position from days and the root day width, at Days and Weeks', async function (assert) {
        await renderChart();
        assert.dom('.gantt-bar-task[data-issue-id="1"]').hasAttribute('style', /--bar-start: 9; --bar-days: 3;/);
        assert.dom('.gantt-chart').hasAttribute('style', /--gantt-day-width: 80px/);
        assert.deepEqual(barBox('1'), { left: '720px', width: '240px' }, 'Days: 9 days in, 3 days wide at 80px');
        assert.strictEqual(getComputedStyle(document.querySelector('.day-cell')).width, '80px');

        await click('a[href="#gantt-scale-weeks"]');
        assert.dom('.gantt-chart').hasAttribute('style', /--gantt-day-width: 35px/);
        assert.dom('.gantt-bar-task[data-issue-id="1"]').hasAttribute('style', /--bar-start: 9; --bar-days: 3;/);
        assert.deepEqual(barBox('1'), { left: '315px', width: '105px' }, 'Weeks: same days at 35px');
        assert.strictEqual(getComputedStyle(document.querySelector('.day-cell')).width, '35px');
        assert.strictEqual(getComputedStyle(document.querySelector('.month-cell')).width, `${30 * 35}px`, 'November spans 30 days');
        assert.dom('.gantt-timeline-container .loader').doesNotExist('no scale-conversion overlay');
    });

    test('weekends are shaded in the one-week grid pattern, not one element per weekend', async function (assert) {
        await renderChart();
        assert.dom('.weekend-block').doesNotExist();
        assert.dom('[data-test-gantt-grid-weekend]').exists({ count: 1 });
        // 2026-11-01 is a Sunday: the tile starts on the Monday six days earlier, Saturday and Sunday are columns 5 and 6
        assert.dom('[data-test-gantt-grid-pattern]').hasAttribute('width', '560').hasAttribute('x', '-480');
        assert.dom('[data-test-gantt-grid-weekend]').hasAttribute('x', '400').hasAttribute('width', '160');
        assert.strictEqual(getComputedStyle(document.querySelector('[data-test-gantt-grid-weekend]')).fill, 'rgba(204, 204, 204, 0.3)');

        await click('a[href="#gantt-scale-weeks"]');
        assert.dom('[data-test-gantt-grid-pattern]').hasAttribute('width', '245').hasAttribute('x', '-210');
        assert.dom('[data-test-gantt-grid-weekend]').hasAttribute('x', '175').hasAttribute('width', '70');
    });

    test('a timeline starting on a Monday needs no pattern offset', async function (assert) {
        this.timelineStart = '2026-11-02';
        await renderChart();
        assert.dom('[data-test-gantt-grid-pattern]').hasAttribute('x', '0');
    });

    test('a grid row click selects the issue, highlighted on both sides', async function (assert) {
        await renderChart();
        await click(`${gridRow('2')} [data-test-gantt-grid-select]`);
        assert.strictEqual(this.selected.id, '2');
        assert.dom(gridRow('2')).hasClass('selected');
        assert.dom(barRow('2')).hasClass('selected');
        assert.dom(gridRow('1')).doesNotHaveClass('selected');
        await click(`${gridRow('2')} [data-test-gantt-grid-select]`);
        assert.strictEqual(this.selected.id, '2', 'a second click does not deselect');
    });

    test('a bar click selects its grid row', async function (assert) {
        await renderChart();
        await click(`${barRow('2')} [data-test-gantt-bar]`);
        assert.strictEqual(this.selected.id, '2');
        assert.dom(gridRow('2')).hasClass('selected');
    });

    test('the eye opens the issue panel without selecting the row', async function (assert) {
        await renderChart();
        await click(`${gridRow('1')} [data-test-gantt-grid-open]`);
        assert.deepEqual(this.panel, ['1']);
        assert.strictEqual(this.selected, null);
    });

    test('collapsing a milestone collapses both sides', async function (assert) {
        await renderChart();
        await click(`${GRID} [data-milestone-id="m1"] [data-test-gantt-milestone-toggle]`);
        assert.dom('.gantt-timeline-row.task-row').doesNotExist();
        assert.dom(`${GRID} .gantt-grid-row.task-row`).doesNotExist();
        assert.dom(`${GRID} [data-milestone-id="m1"] [data-test-gantt-milestone-toggle]`).hasAttribute('aria-expanded', 'false');
        await click(`${GRID} [data-milestone-id="m2"] [data-test-gantt-milestone-toggle]`);
        assert.dom(barRow('3')).exists();
        assert.dom(gridRow('3')).exists();
    });

    test('desktop has no phone tabs and shows both columns', async function (assert) {
        await renderChart();
        assert.dom('[data-test-gantt-phone-tabs]').doesNotExist();
        assert.dom('.gantt-time-scale-selector').exists();
        assert.dom('.gantt-container').doesNotHaveClass('gantt-phone');
        assert.dom(GRID).exists();
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
        assert.dom(GRID).doesNotExist('the phone timeline has no grid yet');
        assert.dom('[data-test-gantt-issue-list] [data-issue-id]').exists({ count: 3 });
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
        assert.dom(gridRow('2')).hasClass('selected');
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

        test('on desktop the eye opens the side panel beside the grid, not the modal', async function (assert) {
            await renderWithPanel();
            await click(`${gridRow('1')} [data-test-gantt-grid-open]`);
            assert.dom('.gantt-issue-panel-visible').exists();
            assert.dom('.gantt-quick-view-modal').doesNotExist();
            assert.dom('.gantt-timeline-wrapper').hasClass('gantt-panel-open');
            assert.dom(GRID).isVisible();
            assert.dom('.gantt-timeline-body').isNotVisible();
        });
    });

    test('one shared tooltip shows the hovered bar issue, with no hidden block or id per bar', async function (assert) {
        await renderChart();
        assert.dom('[id^="tooltip-"]').doesNotExist();
        assert.dom('[data-test-gantt-tooltip]').exists({ count: 1 }, 'host before hover');

        const bars = this.element.querySelectorAll('.task-row [data-test-gantt-bar]');
        await triggerEvent(bars[1], 'mouseenter');
        assert.dom('[data-test-gantt-tooltip]', document.body).exists({ count: 1 }, 'host after hover');
        assert.dom('[data-test-gantt-tooltip] .issue-title', document.body).includesText('#2 - Subject 2');
        assert.dom('[data-test-gantt-tooltip]', document.body).includesText('Modifier 2');

        await triggerEvent(bars[0], 'mouseenter');
        assert.dom('[data-test-gantt-tooltip] .issue-title', document.body).includesText('#1 - Subject 1');
    });
});
