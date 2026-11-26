/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { render, click, settled, triggerEvent, waitUntil, getRootElement } from '@ember/test-helpers';
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

    hooks.afterEach(function () {
        window.localStorage.removeItem('gantt-toolbar');
    });

    hooks.beforeEach(function () {
        // the older tests measure Days; the toolbar tests below set their own state
        window.localStorage.setItem('gantt-toolbar', JSON.stringify({ scale: 'days' }));
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
        @timeTotals={{this.timeTotals}}
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

    test('parent and child issues read as a tree in the grid; collapsing hides the children on both sides', async function (assert) {
        this.milestones[0].issues[0].parentId = '2';
        this.collapsed = new Set();
        this.toggleIssue = (id) => {
            const next = new Set(this.collapsed);
            next.has(id) ? next.delete(id) : next.add(id);
            this.set('collapsed', next);
        };
        await render(hbs`<AppUi::GanttChart
            @milestones={{this.milestones}} @timelineStart={{this.timelineStart}} @timelineEnd={{this.timelineEnd}}
            @timeTotals={{this.timeTotals}}
            @expandedMilestones={{this.state.ids}} @isMilestoneExpanded={{this.isExpanded}}
            @onToggleMilestone={{this.onToggle}} @onIssueClick={{this.onIssueClick}}
            @collapsedIssues={{this.collapsed}} @onToggleIssue={{this.toggleIssue}}
            @onOpenIssuePanel={{this.onOpenPanel}} @selectedIssue={{this.selected}}
            @onCloseIssuePanel={{this.noop}} />`);
        const order = [...document.querySelectorAll(`${GRID} .gantt-grid-row.task-row`)].map((r) => r.dataset.issueId);
        assert.deepEqual(order, ['2', '1'], 'the child follows its parent');
        assert.dom(`${gridRow('1')} .gantt-grid-name`).hasAttribute('data-depth', '1');
        assert.dom(`${gridRow('2')} [data-test-gantt-issue-toggle]`).exists();
        assert.dom(barRow('1')).exists();

        await click(`${gridRow('2')} [data-test-gantt-issue-toggle]`);
        assert.dom(gridRow('1')).doesNotExist('hidden in the grid');
        assert.dom(barRow('1')).doesNotExist('hidden on the timeline');
        assert.dom(gridRow('2')).exists();

        await click(`${gridRow('2')} [data-test-gantt-issue-toggle]`);
        assert.dom(gridRow('1')).exists();
        assert.dom(barRow('1')).exists();
    });

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

    test('an undated issue is listed after the dated ones, with dashes and a No dates row, and counts', async function (assert) {
        const undated = { id: '20', issueNumber: 20, subject: 'Undated', status: 'new', startDate: null, endDate: null };
        const dated = { id: '21', issueNumber: 21, subject: 'Dated', status: 'done', startDate: '2026-11-10', endDate: '2026-11-12' };
        this.milestones = [{ id: 'm1', name: 'Alpha', startDate: '2026-11-01', endDate: '2026-11-30', issues: [undated, dated] }];
        this.state.ids = new Set(['m1']);
        await renderChart();
        const ids = [...document.querySelectorAll(`${GRID} .gantt-grid-row.task-row`)].map((row) => row.dataset.issueId);
        assert.deepEqual(ids, ['21', '20'], 'dated issues order first');
        assert.dom(`${gridRow('20')} [data-test-gantt-grid-start]`).hasText('—');
        assert.dom(`${gridRow('20')} [data-test-gantt-grid-end]`).hasText('—');
        assert.dom(`${barRow('20')} [data-test-gantt-no-dates]`).hasText('No dates');
        assert.dom(`${barRow('20')} [data-test-gantt-bar]`).doesNotExist();
        assert.dom(`${barRow('21')} [data-test-gantt-no-dates]`).doesNotExist();
        assert.dom(`${GRID} [data-milestone-id="m1"] [data-test-gantt-milestone-count]`).hasText('1 / 2');
        await click(`${gridRow('20')} [data-test-gantt-grid-select]`);
        assert.strictEqual(this.selected.id, '20', 'selectable');
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

        await click('[data-test-gantt-scale-button="weeks"]');
        assert.dom('.gantt-chart').hasAttribute('style', /--gantt-day-width: 35px/);
        assert.dom('.gantt-bar-task[data-issue-id="1"]').hasAttribute('style', /--bar-start: 9; --bar-days: 3;/);
        assert.deepEqual(barBox('1'), { left: '315px', width: '105px' }, 'Weeks: same days at 35px');
        assert.strictEqual(getComputedStyle(document.querySelector('.day-cell')).width, '35px');
        assert.strictEqual(getComputedStyle(document.querySelector('.month-cell')).width, `${30 * 35}px`, 'November spans 30 days');
        assert.dom('.gantt-timeline-container .loader').doesNotExist('no scale-conversion overlay');
    });

    test('the Weeks scale labels each week by its first day', async function (assert) {
        this.timelineStart = '2026-11-02';
        this.timelineEnd = '2026-11-29';
        await renderChart();
        await click('[data-test-gantt-scale-button="weeks"]');
        const labels = [...document.querySelectorAll('.week-cell')].map((cell) => cell.textContent.trim());
        assert.deepEqual(labels, ['2 Nov', '9 Nov', '16 Nov', '23 Nov']);
    });

    test('the today line sits at today offset, in Days and Weeks', async function (assert) {
        const day = (offset) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
        this.timelineStart = day(-10);
        this.timelineEnd = day(30);
        await renderChart();
        const centreOffsets = () => {
            const line = document.querySelector('[data-test-gantt-today-line]').getBoundingClientRect();
            const cell = document.querySelector('.day-cell.current-day').getBoundingClientRect();
            return { line: line.left + line.width / 2, cell: cell.left + cell.width / 2, width: getComputedStyle(document.querySelector('[data-test-gantt-today-line]')).width };
        };
        assert.dom('[data-test-gantt-today-line]').exists({ count: 1 }).hasAttribute('style', /--today-start: 1\d/);
        for (const scale of ['days', 'weeks']) {
            if (scale === 'weeks') {
                await click('[data-test-gantt-scale-button="weeks"]');
            }
            const { line, cell, width } = centreOffsets();
            assert.strictEqual(width, '2px', `${scale}: 2px wide`);
            assert.ok(Math.abs(line - cell) < 1, `${scale}: centred on today's day cell (${line} vs ${cell})`);
        }
    });

    test('there is no today line when today is outside the timeline', async function (assert) {
        this.timelineStart = '2020-01-01';
        this.timelineEnd = '2020-02-29';
        await renderChart();
        assert.dom('[data-test-gantt-today-line]').doesNotExist();
    });

    test('weekends are shaded in the one-week grid pattern, not one element per weekend', async function (assert) {
        await renderChart();
        assert.dom('.weekend-block').doesNotExist();
        assert.dom('[data-test-gantt-grid-weekend]').exists({ count: 1 });
        // 2026-11-01 is a Sunday: the tile starts on the Monday six days earlier, Saturday and Sunday are columns 5 and 6
        assert.dom('[data-test-gantt-grid-pattern]').hasAttribute('width', '560').hasAttribute('x', '-480');
        assert.dom('[data-test-gantt-grid-weekend]').hasAttribute('x', '400').hasAttribute('width', '160');
        assert.strictEqual(getComputedStyle(document.querySelector('[data-test-gantt-grid-weekend]')).fill, 'rgba(204, 204, 204, 0.3)');

        await click('[data-test-gantt-scale-button="weeks"]');
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
        assert.dom('[data-test-gantt-toolbar]').exists();
        assert.dom('.gantt-container').doesNotHaveClass('gantt-phone');
        assert.dom(GRID).exists();
    });

    test('tapping a bar selects the issue on phones and shows the bar with the link counts', async function (assert) {
        const edited = [], linked = [];
        this.onEditIssue = (i) => edited.push(i.id);
        this.onLinkIssue = (i) => linked.push(i.id);
        const link = (type, source, target) => ({
            id: `${type}-${source}-${target}`, type,
            belongsTo: (rel) => ({ id: () => (rel === 'sourceIssue' ? source : target), value: () => null })
        });
        const all = [link('blocks', '2', '1'), link('blocks', '1', '3'), link('relates', '1', '3')];
        const of = (type, side, id) => all.filter((l) => l.type === type && l.belongsTo(`${side}Issue`).id() === id);
        this.links = {
            links: all, projectId: 'p', isOpen: () => true, externalIssues: [],
            blockedBy: (id) => of('blocks', 'target', id), blocks: (id) => of('blocks', 'source', id),
            splitFrom: () => [], splitInto: () => [],
            relates: (id) => [...of('relates', 'source', id), ...of('relates', 'target', id)]
        };
        const tap = async () => {
            await render(hbs`<AppUi::GanttChart
                @milestones={{this.milestones}} @timelineStart={{this.timelineStart}} @timelineEnd={{this.timelineEnd}}
                @timeTotals={{this.timeTotals}} @links={{this.links}}
                @expandedMilestones={{this.state.ids}} @isMilestoneExpanded={{this.isExpanded}}
                @onToggleMilestone={{this.onToggle}} @onIssueClick={{this.onIssueClick}} @onEditIssue={{this.onEditIssue}}
                @onLinkIssue={{this.onLinkIssue}}
                @onOpenIssuePanel={{this.onOpenPanel}} @selectedIssue={{this.selected}}
                @onCloseIssuePanel={{this.noop}} />`);
            await click(`${barRow('1')} [data-test-gantt-bar]`);
        };
        await tap();
        assert.dom('[data-test-gantt-selection-bar]').doesNotExist('desktop: no bar');
        this.set('selected', null);
        this.viewport.isPhone = true;
        await tap();
        assert.deepEqual(edited, [], 'the tap does not open the sheet');
        assert.dom('[data-test-gantt-selection-subject]').hasText('#1 Subject 1');
        assert.dom('[data-test-gantt-selection-summary]').hasText(/Blocked by 1.*Blocks 1.*Relates 1/);
        assert.dom('[data-test-gantt-selection-conflict]').doesNotExist('no conflict: the dates do not overlap a blocker');

        await click('[data-test-gantt-selection-edit]');
        await click('[data-test-gantt-selection-link]');
        assert.deepEqual(edited, ['1'], 'Edit dates opens the sheet');
        assert.deepEqual(linked, ['1'], 'Link opens Link issue');
        await click('[data-test-gantt-selection-details]');
        assert.deepEqual(this.panel, ['1'], 'Details opens the quick view');

        await click('[data-test-gantt-selection-close]');
        assert.dom('[data-test-gantt-selection-bar]').doesNotExist('closing hides the bar');
    });

    test('phones get Timeline | List tabs under the search, opening on Timeline', async function (assert) {
        this.viewport.isPhone = true;
        await renderChart();
        assert.dom('[data-test-gantt-phone-tabs]').exists();
        assert.dom('[data-test-gantt-phone-tabs] li:first-child [data-test-gantt-tab="timeline"]').hasText('Timeline');
        assert.dom('[data-test-gantt-tab="list"]').hasText('List');
        assert.dom('.gantt-container').hasClass('gantt-phone-timeline');
        assert.dom('[data-test-gantt-toolbar]').exists();
        await click('[data-test-gantt-tab="list"]');
        assert.dom('.gantt-container').hasClass('gantt-phone-list');
        assert.dom('[data-test-gantt-toolbar]').doesNotExist('the toolbar is on the Timeline tab only');
        assert.dom('[data-test-gantt-issue-list] [data-issue-id]').exists({ count: 3 });
    });

    test('the phone Timeline tab has the frozen issue column and the swipe hint', async function (assert) {
        this.viewport.isPhone = true;
        await renderChart();
        assert.dom(GRID).exists('the frozen issue column');
        assert.dom(gridRow('2')).exists();
        assert.dom(`${gridRow('2')} .gantt-grid-number`).hasText('#2');
        assert.dom(`${gridRow('2')} .gantt-grid-text`).exists();
        assert.dom('.gantt-container').hasClass('gantt-phone');
        assert.dom('[data-test-gantt-swipe-hint]').hasText('Swipe to scroll in time');
        await click('[data-test-gantt-tab="list"]');
        assert.dom('[data-test-gantt-swipe-hint]').doesNotExist();
    });

    test('on phones the Timeline tab shows the scale group and Today only', async function (assert) {
        this.viewport.isPhone = true;
        await renderChart();
        assert.dom('.gantt-container').hasClass('gantt-phone-timeline');
        assert.dom('[data-test-gantt-scale]').exists();
        assert.dom('[data-test-gantt-today]').exists();
        assert.dom('[data-test-gantt-toolbar] input[type="checkbox"]').doesNotExist();
        assert.dom('[data-test-gantt-legend]').doesNotExist();
    });

    test('the toolbar defaults to Weeks with both toggles on', async function (assert) {
        window.localStorage.removeItem('gantt-toolbar');
        const store = this.owner.lookup('service:store');
        store.createRecord('issuestatus', { name: 'new', color: '#3c8dbc' });
        store.createRecord('issuestatus', { name: 'done', color: '#00a65a' });
        await renderChart();
        assert.dom('[data-test-gantt-scale-button="weeks"]').hasClass('btn-primary');
        assert.dom('[data-test-gantt-scale-button="days"]').doesNotHaveClass('btn-primary');
        assert.dom('[data-test-gantt-links-label]').hasText('Links: Blocks, Splits');
        assert.dom('[data-select="gantt-links-blocks"]').isChecked();
        assert.dom('[data-select="gantt-links-splits"]').isChecked();
        assert.dom('[data-select="gantt-links-relates"]').isNotChecked();
        assert.dom('[data-select="gantt-other-projects"]').isChecked();
        assert.dom('[data-select="gantt-weekends"]').isChecked();
        assert.dom('.gantt-chart').hasAttribute('style', /--gantt-day-width: 35px/);
        assert.dom('.nav-tabs-custom.gantt-time-scale-selector').doesNotExist('the old tab strip is gone');
    });

    test('Months renders one column per month at the narrow day width', async function (assert) {
        await renderChart();
        await click('[data-test-gantt-scale-button="months"]');
        assert.dom('.gantt-chart').hasAttribute('style', /--gantt-day-width: 4px/);
        assert.dom('.month-cell').exists({ count: 2 });
        assert.strictEqual(getComputedStyle(document.querySelector('.month-cell')).width, `${30 * 4}px`, 'November is 30 days');
        assert.dom('.day-cell').doesNotExist();
        assert.deepEqual(barBox('1'), { left: '36px', width: '20px' }, 'positioned by days at 4px; the bar keeps its minimum width');
    });

    test('Today scrolls the timeline so today is in view', async function (assert) {
        const today = new Date();
        const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        this.timelineStart = iso(new Date(today.getFullYear(), today.getMonth() - 6, 1));
        this.timelineEnd = iso(new Date(today.getFullYear(), today.getMonth() + 6, 28));
        await renderChart();
        const container = document.querySelector('.gantt-timeline-container');
        assert.strictEqual(container.scrollLeft, 0);
        await click('[data-test-gantt-today]');
        assert.ok(container.scrollLeft > 0, 'scrolled towards today');
    });

    test('the toggles hide and show the dependency layer and weekend shading, and persist', async function (assert) {
        await renderChart();
        assert.dom('.gantt-dependency-layer').exists();
        assert.dom('[data-test-gantt-grid-weekend]').exists();
        await click('[data-select="gantt-links-blocks"]');
        assert.dom('.gantt-dependency-layer').exists('Splits is still on');
        await click('[data-select="gantt-links-splits"]');
        await click('[data-select="gantt-weekends"]');
        await click('[data-select="gantt-other-projects"]');
        assert.dom('.gantt-dependency-layer').doesNotExist('no link type hides the layer');
        assert.dom('[data-test-gantt-links-label]').hasText('Links: None');
        assert.dom('[data-test-gantt-grid-weekend]').doesNotExist();
        assert.deepEqual(JSON.parse(window.localStorage.getItem('gantt-toolbar')), { scale: 'days', links: [], otherProjects: false, weekends: false });
        await click('[data-test-gantt-scale-button="months"]');
        assert.strictEqual(JSON.parse(window.localStorage.getItem('gantt-toolbar')).scale, 'months');
        await click('[data-select="gantt-links-relates"]');
        assert.dom('.gantt-dependency-layer').exists();
        assert.dom('[data-test-gantt-links-label]').hasText('Links: Relates');
    });

    test('each link type toggles its own lines', async function (assert) {
        const end = (id) => ({ id: () => id, value: () => null });
        const link = (type, from, to) => ({ type, belongsTo: (name) => end(name === 'sourceIssue' ? from : to) });
        this.links = {
            links: [link('blocks', '1', '2'), link('splits', '2', '1'), link('relates', '1', '2')],
            isOpen: () => true,
            blockedBy: () => [], blocks: () => [], relates: () => []
        };
        this.selected = { id: '1' };
        await render(hbs`<AppUi::GanttChart
            @milestones={{this.milestones}} @timelineStart={{this.timelineStart}} @timelineEnd={{this.timelineEnd}}
            @expandedMilestones={{this.state.ids}} @isMilestoneExpanded={{this.isExpanded}}
            @onToggleMilestone={{this.onToggle}} @onIssueClick={{this.onIssueClick}}
            @onOpenIssuePanel={{this.onOpenPanel}} @selectedIssue={{this.selected}} @links={{this.links}}
            @onCloseIssuePanel={{this.noop}} />`);
        assert.dom('.dependency-line-blocks').exists();
        assert.dom('.dependency-line-splits').exists();
        assert.dom('.dependency-line-relates').doesNotExist('relates is off by default');
        await click('[data-select="gantt-links-blocks"]');
        assert.dom('.dependency-line-blocks').doesNotExist();
        assert.dom('.dependency-line-splits').exists();
        await click('[data-select="gantt-links-relates"]');
        assert.dom('.dependency-line-relates').exists('shown for the selected issue');
        await click('[data-select="gantt-links-splits"]');
        assert.dom('.dependency-line-splits').doesNotExist();
    });

    module('ghost rows', function (hooks) {
        hooks.beforeEach(function () {
            const end = (id, value) => ({ id: () => id, value: () => value });
            this.ghost = {
                id: '90', issueNumber: 4836, subject: 'Other blocker', status: 'new', projectId: '9', projectShortcode: 'agaia',
                startDate: '2026-11-05', endDate: '2026-11-08'
            };
            this.links = {
                projectId: '1',
                isOpen: () => true,
                blockedBy: () => [], blocks: () => [], relates: () => [],
                links: [{
                    type: 'blocks',
                    belongsTo: (name) => (name === 'sourceIssue' ? end('90', this.ghost) : end('1', null))
                }]
            };
        });

        const renderWithLinks = (otherProjects) => {
            window.localStorage.setItem('gantt-toolbar', JSON.stringify({ scale: 'days', otherProjects }));
            return render(hbs`<AppUi::GanttChart
                @milestones={{this.milestones}} @timelineStart={{this.timelineStart}} @timelineEnd={{this.timelineEnd}}
                @expandedMilestones={{this.state.ids}} @isMilestoneExpanded={{this.isExpanded}}
                @onToggleMilestone={{this.onToggle}} @onIssueClick={{this.onIssueClick}}
                @onOpenIssuePanel={{this.onOpenPanel}} @selectedIssue={{this.selected}} @links={{this.links}}
                @onCloseIssuePanel={{this.noop}} />`);
        };

        test('a cross-project blocker is a read-only ghost row with its code, and its line connects', async function (assert) {
            await renderWithLinks(true);
            assert.dom('[data-test-gantt-ghost-heading]').hasText('Other projects in this workspace');
            assert.dom('[data-test-gantt-ghost-row]').exists({ count: 1 });
            assert.dom('[data-test-gantt-ghost-code]').hasText('AGAIA-4836');
            assert.dom('[data-test-gantt-ghost-row] .gantt-grid-name').includesText('Other blocker');
            assert.dom('[data-test-gantt-ghost-row] .gantt-grid-date').exists({ count: 2 });
            assert.dom('[data-test-gantt-ghost-bar]').exists({ count: 1 });
            assert.dom('[data-test-gantt-ghost-row] [data-test-gantt-grid-open]').doesNotExist('no eye');
            assert.dom('[data-test-gantt-ghost-bar] .connector-dot').doesNotExist('no link dot');
            assert.dom('[data-test-gantt-ghost-bar] .gantt-bar-resize-handle').doesNotExist('no resize');
            assert.dom('.dependency-line-blocks').exists('the blocks line reaches the ghost bar');
        });

        test('ghost rows are hidden while Other projects is off', async function (assert) {
            await renderWithLinks(false);
            assert.dom('[data-test-gantt-ghost-row]').doesNotExist();
            assert.dom('[data-test-gantt-ghost-heading]').doesNotExist();
        });

        test('a ghost bar is not draggable', async function (assert) {
            await renderWithLinks(true);
            const bar = document.querySelector('[data-test-gantt-ghost-bar]');
            const before = bar.getBoundingClientRect().left;
            await triggerEvent(bar, 'mousedown', { clientX: 10, clientY: 10 });
            await triggerEvent(document, 'mousemove', { clientX: 200, clientY: 10 });
            await triggerEvent(document, 'mouseup', { clientX: 200, clientY: 10 });
            assert.strictEqual(bar.getBoundingClientRect().left, before);
            assert.notOk(bar.classList.contains('draggable'));
        });
    });

    test('the legend explains every line style', async function (assert) {
        await renderChart();
        assert.dom('[data-test-gantt-line-legend] .gantt-line-legend-item').exists({ count: 5 });
        assert.dom('[data-test-gantt-line-legend]').includesText('Splits into');
        assert.dom('[data-test-gantt-line-legend]').includesText('Issue in another project');
    });

    test('the saved scale and toggles are restored on the next render', async function (assert) {
        window.localStorage.setItem('gantt-toolbar', JSON.stringify({ scale: 'months', links: ['relates'], otherProjects: false, weekends: false }));
        await renderChart();
        assert.dom('[data-test-gantt-scale-button="months"]').hasClass('btn-primary');
        assert.dom('[data-select="gantt-links-blocks"]').isNotChecked();
        assert.dom('[data-select="gantt-links-relates"]').isChecked();
        assert.dom('[data-select="gantt-other-projects"]').isNotChecked();
    });

    test('a saved old Dependencies-off preference hides every link type', async function (assert) {
        window.localStorage.setItem('gantt-toolbar', JSON.stringify({ scale: 'days', dependencies: false }));
        await renderChart();
        assert.dom('[data-test-gantt-links-label]').hasText('Links: None');
        assert.dom('.gantt-dependency-layer').doesNotExist();
    });

    test('a list tap on a phone switches to the Timeline tab and selects the issue', async function (assert) {
        this.viewport.isPhone = true;
        await renderChart();
        await click('[data-test-gantt-tab="list"]');
        await click('[data-test-gantt-issue-list] [data-issue-id="2"]');
        assert.strictEqual(this.selected.id, '2');
        assert.dom('.gantt-container').hasClass('gantt-phone-timeline');
        assert.dom('.gantt-timeline-row.task-row[data-issue-id="2"]').hasClass('selected');
        await click('[data-test-gantt-tab="list"]');
        assert.dom('[data-test-gantt-issue-list] [data-issue-id="2"]').hasClass('quick-list-item--active');
    });

    module('on phones: opening range and edge chips', function (nested) {
        const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const around = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset); return iso(d); };

        nested.beforeEach(function () {
            this.viewport.isPhone = true;
            const issue = (id, number, from, to) => ({
                id, issueNumber: number, subject: `Subject ${number}`, status: 'new', priority: 'high',
                startDate: around(from), endDate: around(to), projectShortcode: 'APROM',
                modifiedBy: { name: `Modifier ${number}` }
            });
            this.timelineStart = around(-120);
            this.timelineEnd = around(120);
            this.milestones = [{
                id: 'm1', name: 'Alpha', startDate: around(-100), endDate: around(100),
                issues: [issue('1', 1, 0, 1), issue('2', 2, -90, -85), issue('3', 3, 80, 85)]
            }];
            this.state.ids = new Set(['m1']);
            // the desktop remembers Weeks; a phone must still open on Days
            window.localStorage.setItem('gantt-toolbar', JSON.stringify({ scale: 'weeks' }));
        });

        const settleFrames = async () => {
            await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            await settled();
        };

        test('opens on Days with today in view, and a scale change does not replace the desktop preference', async function (assert) {
            await renderChart();
            await settleFrames();
            assert.dom('[data-test-gantt-scale-button="days"]').hasClass('btn-primary');
            assert.dom('.gantt-chart').hasAttribute('style', /--gantt-day-width: 80px/);
            const container = document.querySelector('.gantt-timeline-container').getBoundingClientRect();
            const line = document.querySelector('[data-test-gantt-today-line]').getBoundingClientRect();
            assert.ok(line.left >= container.left, 'the today line is right of the visible left edge');
            assert.ok(line.left <= container.right, 'the today line is left of the visible right edge');

            await click('[data-test-gantt-scale-button="months"]');
            assert.strictEqual(JSON.parse(window.localStorage.getItem('gantt-toolbar')).scale, 'weeks', 'the desktop scale is kept');
        });

        test('the toolbar shows the visible date range and updates it while scrolling', async function (assert) {
            await renderChart();
            await settleFrames();
            const range = /^\d{1,2}( [A-Z][a-z]{2})? . \d{1,2} [A-Z][a-z]{2}$/;
            assert.dom('[data-test-gantt-visible-range]').hasText(range);
            const before = document.querySelector('[data-test-gantt-visible-range]').textContent.trim();
            document.querySelector('.gantt-timeline-container').scrollLeft += 80 * 10;
            await settleFrames();
            const after = document.querySelector('[data-test-gantt-visible-range]').textContent.trim();
            assert.notEqual(after, before, 'the range follows the scroll');
            assert.ok(range.test(after));
        });

        test('a bar off screen gets an edge chip that scrolls to it and selects the issue', async function (assert) {
            await renderChart();
            await settleFrames();
            assert.dom(`${barRow('1')} [data-test-gantt-edge-chip]`).doesNotExist('today\'s bar is in view');
            assert.dom(`${barRow('2')} [data-test-gantt-edge-chip="left"]`).exists();
            assert.dom(`${barRow('2')} [data-test-gantt-edge-chip="left"] .fa-angle-left`).exists();
            assert.dom(`${barRow('3')} [data-test-gantt-edge-chip="right"] .fa-angle-right`).exists();

            const container = document.querySelector('.gantt-timeline-container');
            const before = container.scrollLeft;
            await click(`${barRow('3')} [data-test-gantt-edge-chip="right"]`);
            assert.strictEqual(this.selected.id, '3', 'the issue is selected');
            await waitUntil(() => !document.querySelector(`${barRow('3')} [data-test-gantt-edge-chip]`), { timeout: 4000 }).catch(() => {});
            await settled();
            assert.ok(container.scrollLeft > before, 'scrolled towards the bar');
            assert.dom(`${barRow('3')} [data-test-gantt-edge-chip]`).doesNotExist('the bar is in view, so no chip');
        });
    });

    test('the layout follows the viewport live and keeps the selection', async function (assert) {
        this.viewport.isPhone = true;
        await renderChart();
        await click('[data-test-gantt-tab="list"]');
        await click('[data-test-gantt-issue-list] [data-issue-id="2"]');
        this.viewport.isPhone = false;
        await settled();
        assert.dom('[data-test-gantt-phone-tabs]').doesNotExist();
        assert.dom('[data-test-gantt-toolbar]').exists();
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

        hooks.afterEach(function () {
            getRootElement().style.width = '';
        });

        // The quick view mode follows the Gantt container's measured width, so the tests size the test root
        const sizeRoot = (width) => { getRootElement().style.width = `${width}px`; };
        const measured = () => waitUntil(() => document.querySelector('[data-test-gantt-container]')?.getBoundingClientRect().width > 0)
            .then(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
            .then(() => settled());

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
            await click('[data-test-gantt-tab="list"]');
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

        test('a wide container opens the quick view as a side panel next to the chart, which stays visible', async function (assert) {
            sizeRoot(1400);
            await renderWithPanel();
            await measured();
            const container = document.querySelector('.gantt-timeline-container');
            container.scrollLeft = 120;
            const scrolled = container.scrollLeft;
            await click(`${gridRow('1')} [data-test-gantt-grid-open]`);
            await measured();
            assert.dom('[data-test-gantt-quick-view]').exists();
            assert.dom('.gantt-issue-panel').exists();
            assert.dom('.gantt-quick-view-modal').doesNotExist();
            assert.dom(GRID).isVisible();
            assert.dom('.gantt-timeline-body').isVisible('the timeline stays next to the panel');
            assert.strictEqual(document.querySelector('.gantt-timeline-container'), container, 'the timeline is not re-rendered');
            assert.strictEqual(container.scrollLeft, scrolled, 'the timeline keeps its scroll position');
            const panel = document.querySelector('[data-test-gantt-quick-view]').getBoundingClientRect();
            const timeline = document.querySelector('.gantt-timeline-wrapper').getBoundingClientRect();
            assert.ok(panel.left >= timeline.right - 1, 'the panel sits to the right of the chart');
        });

        test('a narrow container on a wide viewport opens the quick view as the bottom sheet', async function (assert) {
            sizeRoot(700);
            await renderWithPanel();
            await measured();
            await click(`${gridRow('1')} [data-test-gantt-grid-open]`);
            assert.dom('.gantt-quick-view-modal').exists();
            assert.dom('[data-test-gantt-quick-view]').doesNotExist();
            assert.dom('.gantt-timeline-body').isVisible();
        });

        test('the divider collapses the side panel and expands it again', async function (assert) {
            sizeRoot(1400);
            await renderWithPanel();
            await measured();
            await click(`${gridRow('1')} [data-test-gantt-grid-open]`);
            const chartWidth = document.querySelector('.gantt-timeline-wrapper').getBoundingClientRect().width;
            await click('[data-test-gantt-quick-view-divider]');
            assert.dom('[data-test-gantt-quick-view]').hasClass('gantt-quick-view-collapsed');
            assert.dom('.gantt-issue-panel').doesNotExist();
            assert.dom('[data-test-gantt-quick-view-divider]').hasAttribute('aria-expanded', 'false');
            assert.ok(document.querySelector('.gantt-timeline-wrapper').getBoundingClientRect().width > chartWidth, 'the chart takes the width');
            await click('[data-test-gantt-quick-view-divider]');
            assert.dom('[data-test-gantt-quick-view]').doesNotHaveClass('gantt-quick-view-collapsed');
            assert.dom('.gantt-issue-panel').exists();
        });
    });

    test('one shared tooltip shows the hovered bar issue, with no hidden block or id per bar', async function (assert) {
        await renderChart();
        assert.dom('[id^="tooltip-"]').doesNotExist();
        assert.dom('[data-test-gantt-tooltip]').exists({ count: 1 }, 'host before hover');

        const bars = this.element.querySelectorAll('.task-row [data-test-gantt-bar]');
        await triggerEvent(bars[1], 'mouseenter');
        assert.dom('[data-test-gantt-tooltip]', document.body).exists({ count: 1 }, 'host after hover');
        assert.dom('[data-test-gantt-tooltip] [data-test-gantt-tooltip-number]', document.body).hasText('#2');
        assert.dom('[data-test-gantt-tooltip] [data-test-gantt-tooltip-subject]', document.body).hasText('Subject 2');
        assert.dom('[data-test-gantt-tooltip]', document.body).includesText('Modifier 2');

        await triggerEvent(bars[0], 'mouseenter');
        assert.dom('[data-test-gantt-tooltip] [data-test-gantt-tooltip-number]', document.body).hasText('#1');
    });

    test('a bar shown again after another bar took the shared tooltip is not empty', async function (assert) {
        await renderChart();
        const bars = this.element.querySelectorAll('.task-row [data-test-gantt-bar]');
        const hover = (bar) => triggerEvent(bar, 'mouseenter');

        await hover(bars[1]);
        bars[1]._tippy.hide();
        await hover(bars[0]);
        bars[0]._tippy.hide();
        await hover(bars[1]);

        const popper = bars[1]._tippy.popper;
        assert.true(bars[1]._tippy.state.isVisible, 'the tooltip of the bar shows');
        assert.dom('[data-test-gantt-tooltip]', popper).exists('the shared content moved back into it');
        assert.dom('[data-test-gantt-tooltip-number]', popper).hasText('#2');
    });

    test('a task bar shows its % done fill and its label inside the bar', async function (assert) {
        this.milestones[0].issues[0].issuestatus = { done: '0' };
        this.milestones[0].issues[1].issuestatus = { done: '1' };
        this.milestones[0].issues[1].status = 'done';
        // issue 1: 1h of 4h spent; issue 2 has no time but its status counts as done
        this.timeTotals = new Map([['1', { spent: 60, estimated: 240 }]]);
        await renderChart();
        assert.dom(`${barRow('1')} [data-test-gantt-bar-label]`).hasText('#1 Subject 1');
        assert.dom(`${barRow('1')} [data-test-gantt-bar-fill]`).hasAttribute('style', '--bar-progress: 25');
        assert.dom(`${barRow('2')} [data-test-gantt-bar-fill]`).hasAttribute('style', '--bar-progress: 100');
        assert.dom(`${barRow('2')} [data-test-gantt-bar-label]`).hasClass('completed');
        assert.dom(`${barRow('1')} [data-test-gantt-bar]`).hasAttribute('aria-label', '#1 - Subject 1', 'the subject stays in the accessible name');
        const label = document.querySelector(`${barRow('1')} [data-test-gantt-bar-label]`).getBoundingClientRect();
        const bar = document.querySelector(`${barRow('1')} [data-test-gantt-bar]`).getBoundingClientRect();
        assert.true(label.left >= bar.left - 1, 'the label starts inside the bar');
        assert.true(label.right <= bar.right + 1, 'the label ends inside the bar');
        assert.dom(`${barRow('1')} [data-test-gantt-bar-label]`).hasText('#1 Subject 1');
        assert.dom(`${barRow('1')} [data-test-gantt-bar] ~ [data-test-gantt-bar-label]`).doesNotExist('no label after the bar');
    });

    test('a task bar without an estimate has no fill', async function (assert) {
        this.timeTotals = new Map([['1', { spent: 60, estimated: 0 }]]);
        await renderChart();
        assert.dom(`${barRow('1')} [data-test-gantt-bar-fill]`).doesNotExist();
        assert.dom(`${barRow('2')} [data-test-gantt-bar-fill]`).doesNotExist();
    });

    test('a milestone bar fills by its done issues and is labelled "name · %"', async function (assert) {
        this.milestones[0].issues[0].status = 'done';
        await renderChart();
        const milestoneBar = '.gantt-timeline-row.milestone-row[data-milestone-id="m1"] [data-test-gantt-bar]';
        assert.dom(`${milestoneBar} [data-test-gantt-bar-label]`).hasText('Alpha · 50%');
        assert.dom(`${milestoneBar} [data-test-gantt-bar-fill]`).hasAttribute('style', '--bar-progress: 50');
    });

    test('the tooltip shows the summed estimated and spent time', async function (assert) {
        this.timeTotals = new Map([['1', { spent: 90, estimated: 240 }]]);
        await renderChart();
        await triggerEvent(this.element.querySelectorAll('.task-row [data-test-gantt-bar]')[0], 'mouseenter');
        assert.dom('[data-test-gantt-tooltip] [data-test-gantt-tooltip-time]', document.body).hasText('1h 30m spent of 4h · 38%');
    });

    module('linking by dragging a dot', function (linkHooks) {
        const BAR = (id) => `${barRow(id)} [data-test-gantt-bar]`;
        const DOT = (id, end) => `${BAR(id)} [data-test-gantt-link-dot="${end}"]`;
        const middleOf = (selector) => {
            const rect = document.querySelector(selector).getBoundingClientRect();
            return { button: 0, clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
        };

        linkHooks.beforeEach(async function () {
            this.created = [];
            this.onCreateDependency = (predecessor, successor) => this.created.push([predecessor.id, successor.id]);
            await render(hbs`<AppUi::GanttChart
                @milestones={{this.milestones}} @timelineStart={{this.timelineStart}} @timelineEnd={{this.timelineEnd}}
                @expandedMilestones={{this.state.ids}} @isMilestoneExpanded={{this.isExpanded}}
                @onToggleMilestone={{this.onToggle}} @onIssueClick={{this.onIssueClick}}
                @onOpenIssuePanel={{this.onOpenPanel}} @selectedIssue={{this.selected}}
                @onCloseIssuePanel={{this.noop}} @onCreateDependency={{this.onCreateDependency}} />`);
        });

        const dragFrom = async (end) => {
            await triggerEvent(BAR('1'), 'mouseenter');
            await triggerEvent(DOT('1', end), 'mousedown', middleOf(DOT('1', end)));
            await triggerEvent(document.body, 'mousemove', middleOf(BAR('2')));
            await triggerEvent(BAR('1'), 'mouseleave');
            await triggerEvent(BAR('2'), 'mouseenter');
        };

        test('from the end dot onto the middle of another bar opens the picker with this issue first', async function (assert) {
            await dragFrom('end');
            assert.dom(BAR('2')).hasClass('link-target', 'the bar under the pointer is the target');
            assert.dom(BAR('2')).hasAttribute('data-test-gantt-link-target');
            assert.dom(BAR('1')).doesNotHaveClass('link-target', 'the source is never the target');

            await triggerEvent(BAR('2'), 'mouseup', middleOf(BAR('2')));
            assert.deepEqual(this.created, [['1', '2']], 'issue 1 comes before issue 2');
            assert.dom('.link-target').doesNotExist('the highlight goes with the link');
        });

        test('from the start dot the other issue comes first', async function (assert) {
            await dragFrom('start');
            await triggerEvent(BAR('2'), 'mouseup', middleOf(BAR('2')));
            assert.deepEqual(this.created, [['2', '1']]);
        });

        test('Escape cancels the link', async function (assert) {
            await dragFrom('end');
            await triggerEvent(document.body, 'keydown', { key: 'Escape' });
            assert.dom('.link-target').doesNotExist();

            await triggerEvent(BAR('2'), 'mouseup', middleOf(BAR('2')));
            assert.deepEqual(this.created, [], 'nothing is linked after the cancel');
        });

        test('a mouse-up away from a bar, or on the bar it started from, cancels the link', async function (assert) {
            await dragFrom('end');
            await triggerEvent(document.body, 'mouseup', { button: 0 });
            await triggerEvent(BAR('2'), 'mouseup', middleOf(BAR('2')));

            await triggerEvent(BAR('1'), 'mouseenter');
            await triggerEvent(DOT('1', 'end'), 'mousedown', middleOf(DOT('1', 'end')));
            await triggerEvent(BAR('1'), 'mouseup', middleOf(BAR('1')));
            await triggerEvent(BAR('2'), 'mouseup', middleOf(BAR('2')));
            assert.deepEqual(this.created, [], 'no link was made');
        });

        test('Enter on a dot, then on another bar\'s dot, links them from the keyboard', async function (assert) {
            await triggerEvent(BAR('1'), 'mouseenter');
            await triggerEvent(DOT('1', 'end'), 'click', { detail: 0 });
            await triggerEvent(BAR('1'), 'mouseleave');
            assert.dom(DOT('2', 'start')).exists('every bar shows its dots while a link is pending');

            await triggerEvent(DOT('2', 'start'), 'click', { detail: 0 });
            assert.deepEqual(this.created, [['1', '2']]);
        });

        test('a mouse click on a dot does not start a link', async function (assert) {
            await triggerEvent(BAR('1'), 'mouseenter');
            await triggerEvent(DOT('1', 'end'), 'click', { detail: 1 });
            await triggerEvent(BAR('2'), 'mouseup', middleOf(BAR('2')));
            assert.deepEqual(this.created, []);
        });
    });

    test('the footer shows the hints, the range and the counts, and updates with the milestones', async function (assert) {
        await renderChart();
        assert.dom('[data-test-gantt-footer-hints]').includesText('Drag a bar to move it');
        assert.dom('[data-test-gantt-footer-hints]').includesText('Drag either end to change dates');
        assert.dom('[data-test-gantt-footer-hints]').includesText('Drag the dot onto another bar to link them');
        assert.dom('[data-test-gantt-footer-summary]').hasText('1 Nov – 31 Dec · 2 milestones · 3 issues shown');
        // a search leaves one milestone with one dated and one undated issue
        this.set('milestones', [{ ...this.milestones[0], issues: [this.milestones[0].issues[0], { id: '9', issueNumber: 9, subject: 'No dates' }] }]);
        await settled();
        assert.dom('[data-test-gantt-footer-summary]').hasText('1 Nov – 31 Dec · 1 milestone · 1 issue shown · 1 without dates');
    });

    test('the footer is hidden on phones', async function (assert) {
        this.viewport.isPhone = true;
        await renderChart();
        assert.dom('[data-test-gantt-footer]').doesNotExist();
    });

    module('phone options menu', function (hooks) {
        hooks.afterEach(function () {
            window.localStorage.removeItem('gantt-toolbar-phone');
        });

        const LABEL = '[data-test-gantt-bar-label]';
        const openMenu = () => click('[data-test-gantt-options] .app-dropdown-btn');

        test('phones hide dependency lines and bar labels by default', async function (assert) {
            this.viewport.isPhone = true;
            await renderChart();
            assert.dom('.gantt-dependency-layer').doesNotExist();
            assert.dom(LABEL).doesNotExist();
            await openMenu();
            assert.dom('[data-select="gantt-options-dependencies"]').isNotChecked();
            assert.dom('[data-select="gantt-options-labels"]').isNotChecked();
            assert.dom('[data-select="gantt-options-weekends"]').isChecked();
        });

        test('each checkbox shows its layer and is remembered apart from desktop', async function (assert) {
            this.viewport.isPhone = true;
            await renderChart();
            await openMenu();
            await click('[data-select="gantt-options-labels"]');
            assert.dom(LABEL).exists();
            await click('[data-select="gantt-options-dependencies"]');
            assert.dom('.gantt-dependency-layer').exists();
            await click('[data-select="gantt-options-weekends"]');
            assert.dom('[data-test-gantt-grid-weekend]').doesNotExist();
            const saved = JSON.parse(window.localStorage.getItem('gantt-toolbar-phone'));
            assert.deepEqual(saved, { dependencies: true, labels: true, weekends: false });
            assert.strictEqual(JSON.parse(window.localStorage.getItem('gantt-toolbar')).dependencies, undefined, 'desktop key untouched');
        });

        const renderWithLinks = function () {
            this.state.ids = new Set(['m1', 'm2']);
            const end = (id) => ({ id: () => id, value: () => null });
            const link = (type, from, to) => ({ type, belongsTo: (name) => end(name === 'sourceIssue' ? from : to) });
            this.links = {
                links: [link('blocks', '1', '2'), link('blocks', '2', '3'), link('relates', '1', '2')],
                isOpen: () => true,
                blockedBy: () => [], blocks: () => [], relates: () => []
            };
            return render(hbs`<AppUi::GanttChart
                @milestones={{this.milestones}} @timelineStart={{this.timelineStart}} @timelineEnd={{this.timelineEnd}}
                @expandedMilestones={{this.state.ids}} @isMilestoneExpanded={{this.isExpanded}}
                @onToggleMilestone={{this.onToggle}} @onIssueClick={{this.onIssueClick}}
                @onOpenIssuePanel={{this.onOpenPanel}} @selectedIssue={{this.selected}} @links={{this.links}}
                @onCloseIssuePanel={{this.noop}} />`);
        };

        test('phones draw only the links of the selected issue; none selected draws no lines', async function (assert) {
            this.viewport.isPhone = true;
            await renderWithLinks.call(this);
            assert.dom('.gantt-dependency-layer').doesNotExist('nothing selected');

            this.set('selected', { id: '3' });
            await settled();
            assert.dom('.dependency-line-blocks').exists({ count: 1 }, 'only 2 -> 3');
            assert.dom('.dependency-line-relates').doesNotExist();

            this.set('selected', { id: '1' });
            await settled();
            assert.dom('.dependency-line-blocks').exists({ count: 1 }, 'only 1 -> 2');
            assert.dom('.dependency-line-relates').exists({ count: 1 }, 'its relates link too');

            this.set('selected', null);
            await settled();
            assert.dom('.gantt-dependency-layer').doesNotExist();
        });

        test('the Dependency lines option shows all lines on phones', async function (assert) {
            this.viewport.isPhone = true;
            this.selected = { id: '3' };
            await renderWithLinks.call(this);
            assert.dom('.dependency-line-blocks').exists({ count: 1 });
            await openMenu();
            await click('[data-select="gantt-options-dependencies"]');
            assert.dom('.dependency-line-blocks').exists({ count: 2 }, 'both blocks links');
        });

        test('desktop is unaffected: labels show and there is no options menu', async function (assert) {
            await renderChart();
            assert.dom('[data-test-gantt-options]').doesNotExist();
            assert.dom(LABEL).exists();
            assert.dom('.gantt-dependency-layer').exists();
        });
    });
});
