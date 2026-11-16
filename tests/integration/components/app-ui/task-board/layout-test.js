/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/task-board layout', function (hooks) {
    setupRenderingTest(hooks);

    test('milestone tabs wrap and the search stays at the top right of the first row', async function (assert) {
        this.set('milestones', Array.from({ length: 8 }, (_, i) => ({
            id: i + 1,
            name: `Milestone number ${i + 1}`,
            milestoneType: 'sprint',
            issues: []
        })));
        this.set('querySchema', { fields: [] });
        this.set("statuses", []);
        this.set("statusClass", {});
        this.set("noop", () => 0);

        await render(hbs`
            <div class="board" style="width: 900px">
                <AppUi::TaskBoard @milestones={{this.milestones}} @querySchema={{this.querySchema}} @statuses={{this.statuses}} @statusClass={{this.statusClass}} @selectIssue={{this.noop}} @getMilestoneProgress={{this.noop}} @getCompletedIssuesCount={{this.noop}} />
            </div>
        `);

        let container = this.element.querySelector('.nav-tabs-custom');
        let tabs = [...this.element.querySelectorAll('[data-milestone-tab]')];
        let search = this.element.querySelector('[data-milestones-taskboard-search]');
        assert.strictEqual(tabs.length, 8, 'all tabs are rendered');
        assert.ok(search, 'the search is rendered');

        let tops = new Set(tabs.map((tab) => Math.round(tab.getBoundingClientRect().top)));
        assert.ok(tops.size > 1, 'tabs wrap onto a second row');

        let first = tabs[0].getBoundingClientRect();
        let box = search.getBoundingClientRect();
        let bounds = container.getBoundingClientRect();
        assert.ok(Math.abs(box.top - first.top) <= 12, 'search sits on the first tab row');
        assert.ok(Math.abs(bounds.right - box.right) <= 1, 'search is at the right edge');
        assert.ok(Math.abs(box.width / bounds.width - 0.3) < 0.02, 'search is 30% wide');

        let tabList = this.element.querySelector('.milestone-tabs');
        assert.notStrictEqual(window.getComputedStyle(tabList).overflowX, 'auto', 'tab strip does not scroll sideways');
        tabs.forEach((tab) => {
            let rect = tab.getBoundingClientRect();
            assert.ok(rect.right <= tabList.getBoundingClientRect().right + 1, 'tab is not clipped');
        });
    });
    test('every milestone tab shows its issue count, 0 when empty', async function (assert) {
        this.set('milestones', [
            { id: null, name: 'Backlog', milestoneType: 'backlog', issues: [{ id: 1 }, { id: 2 }] },
            { id: 5, name: 'Sprint', milestoneType: 'sprint', issues: [] }
        ]);
        this.set('statuses', []);
        this.set('statusClass', {});
        this.set('noop', () => 0);

        await render(hbs`<AppUi::TaskBoard @milestones={{this.milestones}} @statuses={{this.statuses}} @statusClass={{this.statusClass}} @selectIssue={{this.noop}} @getMilestoneProgress={{this.noop}} @getCompletedIssuesCount={{this.noop}} />`);

        let counts = [...this.element.querySelectorAll('[data-milestone-tab] [data-milestone-issue-count]')];
        assert.deepEqual(counts.map((el) => el.textContent.trim()), ['2', '0'], 'counts are shown');
        assert.ok(counts[0].getAttribute('title').includes('2'), 'tooltip carries the count');
    });
});
