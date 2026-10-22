/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
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
        await click('[data-idea-plan-issue="a"]');
        assert.dom('[data-idea-plan-issue-detail="a"]').includesText('simple');
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

        this.set('plans', [{ id: '2', version: 2, status: 'created', body: body('S', 'X') }]);
        assert.dom('[data-idea-plan-approve]').doesNotExist();
        this.set('plans', [{ id: '2', version: 2, status: 'failed', error: 'Boom', body: body('S', 'X') }]);
        assert.dom('[data-idea-plan-approve]').exists();
        assert.dom('[data-idea-plan-error]').hasText('Boom');
    });

    test('the empty state shows when there is no plan', async function (assert) {
        this.set('plans', []);
        await render(hbs`<Idea::PlanBox @plans={{this.plans}} @onApprove={{this.onApprove}} />`);

        assert.dom('[data-idea-plan-empty]').exists();
        assert.dom('[data-idea-plan-approve]').doesNotExist();
    });
});
