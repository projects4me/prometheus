/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import CurrentUserStub from '../../../stub-services/current-user-stub';

module('Integration | Component | app-ui/gantt-chart/issue-list', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:current-user', CurrentUserStub);
        const issue = (id, number, status) => ({
            id, issueNumber: number, subject: `Subject ${number}`, status, priority: 'high',
            startDate: '2026-11-10', endDate: '2026-11-12'
        });
        this.milestones = [
            { id: 'm1', name: 'Alpha', startDate: '2026-11-01', endDate: '2026-11-30',
              issues: [issue('1', 1, 'done'), issue('2', 2, 'inprogress'), { id: '9', issueNumber: 9, subject: 'No dates', status: 'new' }] },
            { id: 'm2', name: 'Beta', startDate: '2026-12-01', endDate: '2026-12-31', issues: [issue('3', 3, 'new')] }
        ];
        this.selected = [];
        this.opened = [];
        this.onSelect = (i) => this.selected.push(i.id);
        this.onOpen = (i) => this.opened.push(i.id);
    });

    const renderList = () => render(hbs`<AppUi::GanttChart::IssueList @milestones={{this.milestones}}
        @activeId={{this.activeId}} @onSelect={{this.onSelect}} @onOpen={{this.onOpen}} />`);

    test('groups the issues with dates by milestone, with a heading', async function (assert) {
        await renderList();
        const headings = this.element.querySelectorAll('[data-test-gantt-issue-list-milestone]');
        assert.strictEqual(headings.length, 2);
        assert.ok(headings[0].textContent.includes('Alpha'));
        assert.ok(headings[0].textContent.includes('(1/3)'));
        assert.ok(headings[1].textContent.includes('Beta'));
        assert.dom('[data-test-quick-list-item]').exists({ count: 3 });
        assert.dom(this.element).doesNotContainText('No dates');
    });

    test('clicking an item calls onSelect', async function (assert) {
        await renderList();
        await click('[data-issue-id="2"]');
        assert.deepEqual(this.selected, ['2']);
    });

    test('the eye button calls onOpen and not onSelect', async function (assert) {
        await renderList();
        await click('[data-issue-id="2"] + [data-test-quick-list-item-trailing] [data-test-gantt-issue-list-open]');
        assert.deepEqual(this.opened, ['2']);
        assert.deepEqual(this.selected, []);
    });

    test('activeId marks the item and expands a collapsed group', async function (assert) {
        this.set('activeId', '1');
        await renderList();
        assert.dom('[data-issue-id="1"]').hasClass('quick-list-item--active');
        await click('[data-test-quick-list-group="m2"] [data-test-quick-list-group-toggle]');
        assert.dom('[data-issue-id="3"]').doesNotExist();
        this.set('activeId', '3');
        await settled();
        assert.dom('[data-issue-id="3"]').hasClass('quick-list-item--active');
        assert.dom('[data-issue-id="1"]').doesNotHaveClass('quick-list-item--active');
    });
});
