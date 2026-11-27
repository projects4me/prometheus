/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerKeyEvent, triggerEvent, focus } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { htmlSafe } from '@ember/template';
import Service from '@ember/service';
import CurrentUserStub from '../../../stub-services/current-user-stub';

module('Integration | Component | app-ui/gantt-chart/gantt-bar', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:current-user', CurrentUserStub);
        this.calls = { open: [], move: [], resize: [], dragStart: 0 };
        this.issue = { id: '7', issueNumber: 42, subject: 'Fix login', projectShortcode: 'aprom' };
        this.onOpen = (issue) => this.calls.open.push(issue);
        this.onDragEnd = (days) => {
            this.calls.move.push(days);
            return Promise.resolve();
        };
        this.onResizeEnd = (start, end) => {
            this.calls.resize.push([start, end]);
            return Promise.resolve();
        };
        this.onDragStart = () => this.calls.dragStart++;
        this.noop = () => {};
        // the chart root sets the day width the bar's SCSS reads
        this.rootStyle = htmlSafe('--gantt-day-width: 30px');
    });

    const renderTaskBar = (context) =>
        render(hbs`<div class="gantt-chart" style={{this.rootStyle}}><AppUi::GanttChart::GanttBar
            @type="task"
            @issue={{this.issue}}
            @label="#42 - Fix login"
            @startDate="2026-11-10"
            @endDate="2026-11-12"
            @timelineStart="2026-11-01"
            @dayWidth={{30}}
            @onOpen={{this.onOpen}}
            @onDragStart={{this.onDragStart}}
            @onDragEnd={{this.onDragEnd}}
            @onResizeEnd={{this.onResizeEnd}}
            @updateDependencyPositions={{this.noop}}
        /></div>`, context);

    test('a task bar carries "#number subject" inside the bar, on one line with an ellipsis', async function (assert) {
        await renderTaskBar(this);
        const label = this.element.querySelector('[data-test-gantt-bar-label]');
        assert.dom(label).hasText('#42 Fix login');
        assert.notStrictEqual(label.closest('[data-test-gantt-bar]'), null, 'the label is inside the bar');
        const style = getComputedStyle(label);
        assert.strictEqual(style.textOverflow, 'ellipsis');
        assert.strictEqual(style.whiteSpace, 'nowrap');
        assert.strictEqual(style.position, 'sticky', 'pinned to the visible part of the bar');
        const bar = this.element.querySelector('[data-test-gantt-bar]').getBoundingClientRect();
        const box = label.getBoundingClientRect();
        assert.true(box.left >= bar.left - 1, 'starts inside the bar');
        assert.true(box.right <= bar.right + 1, 'ends inside the bar');
    });

    test('a task bar narrower than 28px shows no label', async function (assert) {
        this.rootStyle = htmlSafe('--gantt-day-width: 8px');
        await render(hbs`<div class="gantt-chart" style={{this.rootStyle}}><AppUi::GanttChart::GanttBar
            @type="task"
            @issue={{this.issue}}
            @label="#42"
            @startDate="2026-11-10"
            @endDate="2026-11-12"
            @timelineStart="2026-11-01"
            @dayWidth={{8}}
            @updateDependencyPositions={{this.noop}}
        /></div>`);
        assert.dom('[data-test-gantt-bar]').exists();
        assert.dom('[data-test-gantt-bar-label]').doesNotExist();
    });

    test('a task bar is a focusable group named after its issue', async function (assert) {
        await renderTaskBar(this);
        assert.dom('[data-test-gantt-bar]').hasAttribute('role', 'group');
        assert.dom('[data-test-gantt-bar]').hasAttribute('tabindex', '0');
        assert.dom('[data-test-gantt-bar]').hasAttribute('aria-label', '#42 - Fix login');
        assert.dom('[data-test-gantt-bar]').hasAttribute('aria-describedby', 'gantt-bar-hint-7');
        assert.dom('#gantt-bar-hint-7').exists();

        await focus('[data-test-gantt-bar]');
        assert.dom('[data-test-gantt-bar]').isFocused();
    });

    test('Enter and Space open the issue', async function (assert) {
        await renderTaskBar(this);
        await triggerKeyEvent('[data-test-gantt-bar]', 'keydown', 'Enter');
        await triggerKeyEvent('[data-test-gantt-bar]', 'keydown', ' ');
        assert.deepEqual(this.calls.open, [this.issue, this.issue]);
        assert.deepEqual(this.calls.move, [], 'opening does not move the bar');
    });

    test('the arrow keys move the bar by a day', async function (assert) {
        await renderTaskBar(this);
        await triggerKeyEvent('[data-test-gantt-bar]', 'keydown', 'ArrowRight');
        await triggerKeyEvent('[data-test-gantt-bar]', 'keydown', 'ArrowLeft');
        assert.deepEqual(this.calls.move, [1, -1]);
        assert.deepEqual(this.calls.resize, []);
    });

    test('Shift and the arrow keys move the end date by a day', async function (assert) {
        await renderTaskBar(this);
        await triggerKeyEvent('[data-test-gantt-bar]', 'keydown', 'ArrowRight', { shiftKey: true });
        await triggerKeyEvent('[data-test-gantt-bar]', 'keydown', 'ArrowLeft', { shiftKey: true });
        assert.deepEqual(this.calls.resize, [
            ['2026-11-10', '2026-11-13'],
            ['2026-11-10', '2026-11-11']
        ]);
        assert.deepEqual(this.calls.move, []);
    });

    test('Shift and the left arrow never put the end date before the start date', async function (assert) {
        await render(hbs`<AppUi::GanttChart::GanttBar
            @type="task"
            @issue={{this.issue}}
            @label="#42 - Fix login"
            @startDate="2026-11-10"
            @endDate="2026-11-10"
            @timelineStart="2026-11-01"
            @dayWidth={{30}}
            @onResizeEnd={{this.onResizeEnd}}
            @updateDependencyPositions={{this.noop}}
        />`);
        await triggerKeyEvent('[data-test-gantt-bar]', 'keydown', 'ArrowLeft', { shiftKey: true });
        assert.deepEqual(this.calls.resize, []);
    });

    test('other keys do nothing', async function (assert) {
        await renderTaskBar(this);
        await triggerKeyEvent('[data-test-gantt-bar]', 'keydown', 'ArrowUp');
        await triggerKeyEvent('[data-test-gantt-bar]', 'keydown', 'Tab');
        assert.deepEqual(this.calls, { open: [], move: [], resize: [], dragStart: 0 });
    });

    test('mouse drag still moves the bar', async function (assert) {
        await renderTaskBar(this);
        const bar = this.element.querySelector('[data-test-gantt-bar]');
        const rect = bar.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        await triggerEvent(bar, 'mousedown', { button: 0, clientX: startX, clientY: rect.top + 2 });
        await triggerEvent(document, 'mousemove', { clientX: startX + 30, clientY: rect.top + 2 });
        await triggerEvent(document, 'mouseup', { button: 0, clientX: startX + 30, clientY: rect.top + 2 });
        assert.strictEqual(this.calls.dragStart, 1);
        assert.deepEqual(this.calls.move, [1]);
    });

    test('the bar is positioned in days, with the live drag offset in the same custom properties', async function (assert) {
        await renderTaskBar(this);
        const bar = this.element.querySelector('[data-test-gantt-bar]');
        assert.dom(bar).hasAttribute('style', '--bar-start: 9; --bar-days: 3; --bar-shift: 0px; --bar-stretch: 0px');
        assert.strictEqual(getComputedStyle(bar).left, '270px');
        assert.strictEqual(getComputedStyle(bar).width, '90px');

        const rect = bar.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        await triggerEvent(bar, 'mousedown', { button: 0, clientX: startX, clientY: rect.top + 2 });
        await triggerEvent(document, 'mousemove', { clientX: startX + 45, clientY: rect.top + 2 });
        assert.dom(bar).hasClass('dragging');
        assert.dom(bar).hasAttribute('style', /--bar-shift: 45px;/);
        await triggerEvent(document, 'mouseup', { button: 0, clientX: startX + 45, clientY: rect.top + 2 });
        assert.dom(bar).hasAttribute('style', /--bar-shift: 0px;/);
    });

    test('a milestone bar is not keyboard-operable', async function (assert) {
        await render(hbs`<AppUi::GanttChart::GanttBar
            @type="milestone"
            @label="Release 1"
            @startDate="2026-11-10"
            @endDate="2026-11-20"
            @timelineStart="2026-11-01"
            @dayWidth={{30}}
            @onOpen={{this.onOpen}}
        />`);
        assert.dom('[data-test-gantt-bar]').hasAttribute('tabindex', '-1');
        assert.dom('[data-test-gantt-bar]').doesNotHaveAttribute('aria-describedby');
        await triggerKeyEvent('[data-test-gantt-bar]', 'keydown', 'Enter');
        assert.deepEqual(this.calls.open, []);
    });

    test('a selected task bar shows its ring, both resize handles and the link dot until deselected', async function (assert) {
        this.selected = true;
        await render(hbs`<div class="gantt-chart" style={{this.rootStyle}}><AppUi::GanttChart::GanttBar
            @type="task"
            @issue={{this.issue}}
            @label="#42 - Fix login"
            @startDate="2026-11-10"
            @endDate="2026-11-12"
            @timelineStart="2026-11-01"
            @dayWidth={{30}}
            @isSelected={{this.selected}}
            @showConnectors={{true}}
            @updateDependencyPositions={{this.noop}}
        /></div>`);
        assert.dom('[data-test-gantt-bar]').hasClass('selected');
        assert.dom('[data-test-gantt-resize-handle]').exists({ count: 2 });
        assert.dom('.connector-dot-end').exists();

        this.set('selected', false);
        assert.dom('[data-test-gantt-bar]').doesNotHaveClass('selected');
        assert.dom('[data-test-gantt-resize-handle]').doesNotExist();
        assert.dom('.connector-dot-end').doesNotExist();
    });

    const renderAssigneeBar = (context, endDate = '2026-11-12') => {
        context.set('endDate', endDate);
        return render(hbs`<div class="gantt-chart" style={{this.rootStyle}}><AppUi::GanttChart::GanttBar
            @type="task"
            @issue={{this.issue}}
            @label="#42 - Fix login"
            @startDate="2026-11-10"
            @endDate={{this.endDate}}
            @timelineStart="2026-11-01"
            @dayWidth={{30}}
            @whoHidden={{this.whoHidden}}
            @updateDependencyPositions={{this.noop}}
        /></div>`, context);
    };

    test('the assignee photo sits at the bar end while the Who column is hidden, and leaves when it returns', async function (assert) {
        this.issue = { ...this.issue, assignedTo: { id: '3', name: 'Ada Lovelace' } };
        this.whoHidden = true;
        await renderAssigneeBar(this);
        assert.dom('[data-test-gantt-bar-assignee] [data-test-avatar]').hasAttribute('data-size', 'xs');
        assert.dom('[data-test-gantt-bar]').hasClass('has-assignee-photo');

        this.set('whoHidden', false);
        assert.dom('[data-test-gantt-bar-assignee]').doesNotExist();
        assert.dom('[data-test-gantt-bar]').doesNotHaveClass('has-assignee-photo');
    });

    test('a phone shows the assignee photo on the bar', async function (assert) {
        this.owner.register('service:viewport', class extends Service { isPhone = true; });
        this.issue = { ...this.issue, assignedTo: { id: '3', name: 'Ada Lovelace' } };
        this.whoHidden = false;
        await renderAssigneeBar(this);
        assert.dom('[data-test-gantt-bar-assignee]').exists();
    });

    test('a bar too short for the photo, or without an assignee, shows none', async function (assert) {
        this.issue = { ...this.issue, assignedTo: { id: '3', name: 'Ada Lovelace' } };
        this.whoHidden = true;
        await renderAssigneeBar(this, '2026-11-10');
        // one day is 30px wide here; a bar under 28px is simulated by a narrower day width below
        assert.dom('[data-test-gantt-bar-assignee]').exists('a 30px bar is wide enough');

        this.set('issue', { ...this.issue, assignedTo: null });
        assert.dom('[data-test-gantt-bar-assignee]').doesNotExist('no assignee: no photo');
    });

    test('a bar narrower than 28px shows no photo', async function (assert) {
        this.issue = { ...this.issue, assignedTo: { id: '3', name: 'Ada Lovelace' } };
        this.whoHidden = true;
        await render(hbs`<div class="gantt-chart" style={{this.rootStyle}}><AppUi::GanttChart::GanttBar
            @type="task"
            @issue={{this.issue}}
            @label="#42 - Fix login"
            @startDate="2026-11-10"
            @endDate="2026-11-10"
            @timelineStart="2026-11-01"
            @dayWidth={{20}}
            @whoHidden={{this.whoHidden}}
            @updateDependencyPositions={{this.noop}}
        /></div>`);
        assert.dom('[data-test-gantt-bar]').exists();
        assert.dom('[data-test-gantt-bar-assignee]').doesNotExist();
    });
});
