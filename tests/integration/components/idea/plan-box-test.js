/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, settled, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AclStub from '../../stub-services/acl-stub';

const body = (summary, subject, description = '<p>Do it</p>') => JSON.stringify({
    summary,
    issues: [{ key: 'a', project: 'APROM', subject, priority: 'high', type: 'task', complexity: 'simple', dependsOn: ['b'], description }]
});

module('Integration | Component | idea/plan-box', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:acl', AclStub);
        this.set('plans', [
            { id: '1', version: 1, status: 'superseded', body: body('First plan', 'Old issue') },
            { id: '2', version: 2, status: 'proposed', body: body('Second plan', 'New issue') }
        ]);
        this.set('onApprove', () => {});
    });

    test('the latest version is shown and switching versions shows the right plan', async function (assert) {
        await render(hbs`<Idea::PlanBox @plans={{this.plans}} @onApprove={{this.onApprove}} />`);

        assert.dom('[data-idea-plan-summary]').hasText('Second plan');
        assert.dom('[data-idea-plan-status]').hasClass('new');
        await click('[data-idea-plan-version="1"]');
        assert.dom('[data-idea-plan-summary]').hasText('First plan');
        assert.dom('[data-idea-plan-issue="a"]').includesText('Old issue');
        assert.dom('[data-idea-plan-status]').hasClass('deferred');
        assert.dom('[data-idea-plan-approve]').doesNotExist('an earlier version cannot be approved');

        this.set('plans', [
            ...this.plans,
            { id: '3', version: 3, status: 'proposed', body: body('Third plan', 'Newest issue') }
        ]);
        assert.dom('[data-idea-plan-summary]').hasText('Third plan', 'a newer plan replaces the picked version');
    });

    test('a row expands to the details and the description is sanitized', async function (assert) {
        window.ideaPlanXss = false;
        this.set('plans', [{ id: '1', version: 1, status: 'approved', body: body('S', 'Subject', '<p>Safe</p><img src=x onerror="window.ideaPlanXss = true"><script>window.ideaPlanXss = true</script>') }]);
        await render(hbs`<Idea::PlanBox @plans={{this.plans}} @onApprove={{this.onApprove}} />`);

        assert.dom('[data-idea-plan-issue="a"] .fa-arrow-up').exists('the priority icon');
        assert.dom('[data-idea-plan-issue-priority]').hasText('High', 'and its translated name');
        assert.dom('[data-idea-plan-issue-meta]').includesText('APROM');
        assert.dom('[data-idea-plan-issue-meta]').includesText('task');
        assert.dom('[data-idea-plan-issue-complexity]').hasText('simple');
        assert.dom('[data-idea-plan-issue-depends]').hasText('after b');
        assert.dom('[data-idea-plan-issue-detail="a"]').doesNotExist('collapsed at first');
        await click('[data-idea-plan-issue="a"]');
        assert.dom('[data-idea-plan-description]').includesText('Safe');
        await click('[data-idea-plan-description]');
        assert.dom('[data-idea-plan-issue-detail="a"]').exists('a click in the details keeps them open');
        assert.dom('[data-idea-plan-description] script').doesNotExist();
        assert.dom('[data-idea-plan-description] [onerror]').doesNotExist();
        assert.false(window.ideaPlanXss);
    });

    test('approve shows for proposed and failed latest plans only and asks for confirmation', async function (assert) {
        let approved = [];
        this.set('onApprove', plan => approved.push(plan.id));
        await render(hbs`<Idea::PlanBox @plans={{this.plans}} @onApprove={{this.onApprove}} />`);

        assert.dom('[data-idea-plan-approve]').includesText('Approve v2');
        await click('[data-idea-plan-approve]');
        assert.dom('[data-idea-plan-approve-confirm]').exists();
        await click('.modal .btn-primary');
        assert.deepEqual(approved, ['2']);
        await waitUntil(() => !document.querySelector('[data-idea-plan-approve-confirm]'), { timeout: 2000 });
        assert.dom('.modal').doesNotExist('the approve modal closes after confirming');

        this.set('plans', [{ id: '2', version: 2, status: 'created', body: body('S', 'X') }]);
        assert.dom('[data-idea-plan-approve]').doesNotExist();
        this.set('plans', [{ id: '2', version: 2, status: 'failed', error: 'Boom', body: body('S', 'X') }]);
        assert.dom('[data-idea-plan-approve]').exists();
        assert.dom('[data-idea-plan-error]').hasText('Boom');
    });

    test('approve disables the button while saving, stays open and enabled on failure, spins while creating', async function (assert) {
        let reject;
        this.set('onApprove', () => new Promise((_, r) => { reject = r; }));
        await render(hbs`<Idea::PlanBox @plans={{this.plans}} @onApprove={{this.onApprove}} />`);
        await click('[data-idea-plan-approve]');
        await click('.modal .btn-primary');
        assert.dom('[data-idea-plan-approve]').isDisabled('Approve is disabled while saving');
        reject(new Error('no'));
        await settled();
        assert.dom('.modal').exists('the modal stays open when the approval fails');
        assert.dom('[data-idea-plan-approve]').isNotDisabled('Approve is enabled again after a failure');

        assert.dom('[data-idea-plan-creating]').doesNotExist();
        this.set('plans', [{ id: '2', version: 2, status: 'approved', body: body('S', 'X') }]);
        assert.dom('[data-idea-plan-creating]').exists('the status label spins while issues are created');
    });

    test('an issue created from the plan links to it, the others show their key', async function (assert) {
        this.set('plans', [{ id: '2', version: 2, status: 'created', body: JSON.stringify({ summary: 'S', issues: [
            { key: 'a', project: 'A Prometheus', projectCode: 'aprom', subject: 'One', priority: 'high', type: 'Task', complexity: 'simple', milestone: 'Claude-v1' },
            { key: 'b', project: 'A Gaia', projectCode: 'agaia', subject: 'Two', priority: 'low', type: 'Task', complexity: 'complex', milestone: 'Ideas', newMilestone: true }
        ] }) }]);
        this.set('planIssues', [
            { ideaplanId: '2', key: 'a', loadedIssue: { issueNumber: 4102, projectShortcode: 'APROM', projectId: '1' } },
            { ideaplanId: '1', key: 'b', loadedIssue: { issueNumber: 9, projectShortcode: 'agaia', projectId: '2' } },
            { ideaplanId: '2', key: 'c', loadedIssue: { issueNumber: 7, projectShortcode: '', projectId: '1' } }
        ]);
        await render(hbs`<Idea::PlanBox @plans={{this.plans}} @planIssues={{this.planIssues}} @readableProjectIds={{array "1"}} @onApprove={{this.onApprove}} />`);

        assert.dom('[data-idea-plan-issue="a"] [data-idea-plan-issue-link]').hasText('aprom-4102');
        assert.dom('[data-idea-plan-issue="a"] [data-idea-plan-issue-project]').hasText('aprom');
        assert.dom('[data-idea-plan-issue="b"] [data-idea-plan-issue-link]').doesNotExist('a link of another version');
        assert.dom('[data-idea-plan-issue="b"] [data-idea-plan-issue-meta]').includesText('b');
        assert.dom('[data-idea-plan-issue="b"] [data-idea-plan-issue-milestone]').hasText('Ideas (new)');
        assert.dom('[data-idea-plan-issue="b"] [data-idea-plan-issue-complexity] .fa-cogs').exists();
    });

    test('a created issue of an unreadable project or without an issue is not a link', async function (assert) {
        this.set('plans', [{ id: '2', version: 2, status: 'created', body: JSON.stringify({ summary: 'S', issues: [
            { key: 'a', subject: 'One', priority: 'high', type: 'Task', complexity: 'simple', milestone: 'M' },
            { key: 'b', subject: 'Two', priority: 'low', type: 'Task', complexity: 'simple', milestone: 'M' }
        ] }) }]);
        this.set('planIssues', [
            { ideaplanId: '2', key: 'a', loadedIssue: { issueNumber: 4, projectShortcode: 'agaia', projectId: '2' } },
            { ideaplanId: '2', key: 'b' }
        ]);
        await render(hbs`<Idea::PlanBox @plans={{this.plans}} @planIssues={{this.planIssues}} @readableProjectIds={{array "1"}} @onApprove={{this.onApprove}} />`);

        assert.dom('[data-idea-plan-issue="a"] a').doesNotExist();
        assert.dom('[data-idea-plan-issue="a"] [data-idea-plan-issue-unreadable]').hasText('agaia-4');
        assert.dom('[data-idea-plan-issue="b"] a').doesNotExist();
        assert.dom('[data-idea-plan-issue="b"] [data-idea-plan-issue-meta]').includesText('b');
    });

    test('the empty state shows when there is no plan', async function (assert) {
        this.set('plans', []);
        await render(hbs`<Idea::PlanBox @plans={{this.plans}} @onApprove={{this.onApprove}} />`);

        assert.dom('[data-idea-plan-empty]').exists();
        assert.dom('[data-idea-plan-approve]').doesNotExist();
    });

    test('a requested plan is shown until the user picks a tab', async function (assert) {
        this.set('shownPlan', { id: '1' });
        await render(hbs`<Idea::PlanBox @plans={{this.plans}} @shownPlan={{this.shownPlan}} @onApprove={{this.onApprove}} />`);

        assert.dom('[data-idea-plan-summary]').hasText('First plan');
        await click('[data-idea-plan-version="2"]');
        assert.dom('[data-idea-plan-summary]').hasText('Second plan');
        this.set('shownPlan', { id: '1' });
        await settled();
        assert.dom('[data-idea-plan-summary]').hasText('First plan');
    });

    test('the plan lists each screen once, at its latest version, and plain text when missing', async function (assert) {
        this.owner.lookup('service:upload-preview').previewUrl = async () => '/full.png';
        this.set('plans', [{
            id: '1', version: 1, status: 'proposed',
            body: JSON.stringify({ summary: 'S', issues: [
                { key: 'a', subject: 'A', screens: ['home', 'ghost'] },
                { key: 'b', subject: 'B', screens: ['home'] }
            ] })
        }]);
        this.set('messages', [
            { id: '1', screens: [{ uploadId: '10', key: 'home', title: 'Home', version: 1 }] },
            { id: '2', screens: [{ uploadId: '11', key: 'home', title: 'Home', version: 2 }] }
        ]);
        await render(hbs`<Idea::PlanBox @plans={{this.plans}} @messages={{this.messages}} @onApprove={{this.onApprove}} />`);

        assert.dom('[data-idea-plan-screens] [data-idea-screen]').exists({ count: 1 });
        assert.dom('[data-idea-plan-screens] [data-idea-screen="11"]').exists();
        assert.dom('[data-idea-plan-screen-missing="ghost"]').exists();
    });

    test('the status label sits in the box tools', async function (assert) {
        await render(hbs`<Idea::PlanBox @plans={{this.plans}} @onApprove={{this.onApprove}} />`);

        assert.dom('.box-tools.pull-right [data-idea-plan-status]').exists();
    });
});
