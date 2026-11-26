/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import IssueLinkLookup from 'prometheus/utils/gantt/issue-link-lookup';
import CurrentUserStub from '../../../stub-services/current-user-stub';

module('Integration | Component | app-ui/gantt-chart/bar-tooltip', function (hooks) {
    setupRenderingTest(hooks);

    const issue = (id, number, extra = {}) => ({
        id, issueNumber: number, subject: `Subject ${number}`, status: 'new', priority: 'medium', projectId: '5',
        projectShortcode: 'aprom', startDate: '2026-12-02', endDate: '2026-12-04', ...extra
    });
    const link = (type, source, target) => ({
        id: `${type}-${source.id}-${target.id}`,
        type,
        belongsTo: (name) => {
            const other = name === 'sourceIssue' ? source : target;
            return { id: () => other.id, value: () => other };
        }
    });

    hooks.beforeEach(function () {
        this.owner.register('service:current-user', CurrentUserStub);
        this.issue = issue('1', 4955, {
            issuetype: { name: 'Task' },
            assignedTo: { name: 'Agent Achilles' },
            issuemilestone: { name: 'aga-GanttMobile' },
            modifiedBy: { name: 'Hammad Hassan' },
            dateModified: '2026-11-26 10:42:00'
        });
        this.timeTotals = new Map([['1', { spent: 120, estimated: 360 }]]);
        this.issues = [this.issue];
        this.links = new IssueLinkLookup([], { projectId: '5' });
    });

    const renderTooltip = () => render(hbs`<AppUi::GanttChart::BarTooltip @issue={{this.issue}} @timeTotals={{this.timeTotals}}
        @links={{this.links}} @issues={{this.issues}} />`);

    test('shows the header, the facts and who modified it', async function (assert) {
        await renderTooltip();
        assert.dom('[data-test-gantt-tooltip-number]').hasText('#4955');
        assert.dom('[data-test-gantt-tooltip-number]').hasAttribute('href', /\/aprom\/issue\/4955$/);
        assert.dom('[data-test-gantt-tooltip-status]').hasText('New');
        assert.dom('[data-test-gantt-tooltip-priority]').hasText('Medium');
        assert.dom('[data-test-gantt-tooltip-type]').hasText('Task');
        assert.dom('[data-test-gantt-tooltip-subject]').hasText('Subject 4955');
        assert.dom('[data-test-gantt-tooltip-assignee]').includesText('Agent Achilles');
        assert.dom('[data-test-gantt-tooltip-assignee] [data-test-avatar]').hasAttribute('data-size', 'xs');
        assert.dom('[data-test-gantt-tooltip-dates]').hasText('2 Dec – 4 Dec · 3 days');
        assert.dom('[data-test-gantt-tooltip-milestone]').hasText('aga-GanttMobile');
        assert.dom('[data-test-gantt-tooltip-time]').hasText('2h spent of 6h · 33%');
        assert.dom('[data-test-gantt-tooltip-footer]').includesText('Modified by Hammad Hassan ·');
        assert.dom('[data-test-gantt-tooltip-links]').doesNotExist('no Links section without links');
    });

    test('an issue without dates, time or optional fields still renders', async function (assert) {
        this.issue = { id: '7', issueNumber: 7, subject: 'Bare', projectShortcode: 'aprom' };
        this.timeTotals = null;
        await renderTooltip();
        assert.dom('[data-test-gantt-tooltip-content]').exists();
        assert.dom('[data-test-gantt-tooltip-subject]').hasText('Bare');
        assert.dom('[data-test-gantt-tooltip-dates]').hasText('No dates');
        assert.dom('[data-test-gantt-tooltip-time]').hasText('No time logged');
        assert.dom('[data-test-gantt-tooltip-assignee]').hasText('Unassigned');
        assert.dom('[data-test-gantt-tooltip-milestone]').doesNotExist();
        assert.dom('[data-test-gantt-tooltip-footer]').doesNotExist();
    });

    test('spent time without an estimate, in hours and minutes', async function (assert) {
        this.timeTotals = new Map([['1', { spent: 90, estimated: 0 }]]);
        await renderTooltip();
        assert.dom('[data-test-gantt-tooltip-time]').hasText('1h 30m spent');
    });

    test('lists each link group, naming issues of other projects by their code', async function (assert) {
        const blocker = issue('2', 4954, { status: 'in_progress', endDate: '2026-11-30' });
        const blocked = issue('3', 4956);
        const splitSource = issue('4', 4900);
        const splitTarget = issue('5', 4901);
        const related = issue('6', 12, { projectId: '9', projectShortcode: 'agaia' });
        const parent = issue('7', 4913);
        const child = issue('8', 4970, { parentId: '1' });
        this.issue.parentId = '7';
        this.issues = [this.issue, parent, child];
        this.links = new IssueLinkLookup([
            link('blocks', blocker, this.issue),
            link('blocks', this.issue, blocked),
            link('splits', splitSource, this.issue),
            link('splits', this.issue, splitTarget),
            link('relates', related, this.issue)
        ], { projectId: '5' });
        await renderTooltip();

        assert.dom('[data-test-gantt-tooltip-link="blockedBy"]').hasText('Blocked by #4954 Subject 4954 In Progress');
        assert.dom('[data-test-gantt-tooltip-link="blocks"]').hasText('Blocks #4956 Subject 4956');
        assert.dom('[data-test-gantt-tooltip-link="splitFrom"]').hasText('Split from #4900 Subject 4900');
        assert.dom('[data-test-gantt-tooltip-link="splitInto"]').hasText('Splits into #4901 Subject 4901');
        assert.dom('[data-test-gantt-tooltip-link="relates"]').hasText('Relates to AGAIA Subject 12');
        assert.dom('[data-test-gantt-tooltip-link="relates"] a').hasAttribute('href', /\/agaia\/issue\/12$/);
        assert.dom('[data-test-gantt-tooltip-link="parent"]').hasText('Child of #4913 Subject 4913');
        assert.dom('[data-test-gantt-tooltip-link="children"]').hasText('Parent of #4970 Subject 4970');
        assert.dom('[data-test-gantt-tooltip-conflict]').doesNotExist('the blocker ends before the start');
    });

    test('shows the conflict line in red for an open blocker ending after the start', async function (assert) {
        const blocker = issue('2', 4954, { endDate: '2026-12-05' });
        this.links = new IssueLinkLookup([link('blocks', blocker, this.issue)], { projectId: '5' });
        await renderTooltip();
        assert.dom('[data-test-gantt-tooltip-conflict]').hasText('Starts before #4954 ends (5 Dec)');
        assert.dom('[data-test-gantt-tooltip-conflict]').hasClass('text-red');
        assert.dom('[data-test-gantt-tooltip-conflict] .fa-ban').exists();
    });

    test('shows at most 3 rows per group, then "and N more"', async function (assert) {
        const blocked = [1, 2, 3, 4, 5].map((n) => issue(`b${n}`, 100 + n));
        this.links = new IssueLinkLookup(blocked.map((other) => link('blocks', this.issue, other)), { projectId: '5' });
        await renderTooltip();
        assert.dom('[data-test-gantt-tooltip-link="blocks"]').exists({ count: 3 });
        assert.dom('[data-test-gantt-tooltip-more="blocks"]').hasText('and 2 more');
    });
});
