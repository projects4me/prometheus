/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/task-board/move-issue', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.set('issue', { issueNumber: 12, subject: 'Fix it', statusId: '1', status: 'new', assignee: 'u1', milestoneId: 'm1' });
        this.set('statuses', [{ id: '1', name: 'new' }, { id: '2', name: 'in_progress' }]);
        this.set('members', [{ id: 'u1', name: 'Ann' }, { id: 'u2', name: 'Bob' }]);
        this.set('milestones', [{ id: 'm1', name: 'Sprint 1' }, { id: 'm2', name: 'Sprint 2' }, { name: 'Backlog' }]);
        this.set('saved', null);
        this.set('onSave', (changes) => this.set('saved', changes));
        this.set('onClose', () => {});
    });

    const template = hbs`<AppUi::TaskBoard::MoveIssue @issue={{this.issue}} @statuses={{this.statuses}} @members={{this.members}} @milestones={{this.milestones}} @onSave={{this.onSave}} @onClose={{this.onClose}} />`;

    test('the current status is highlighted and Save is disabled until something changes', async function (assert) {
        await render(template);

        assert.dom('[data-test-move-status="new"]').hasClass('is-current');
        assert.dom('[data-test-move-status="new"] [data-test-move-current]').exists();
        assert.dom('[data-test-move-status="in_progress"]').doesNotHaveClass('is-current');
        assert.dom('[data-btn="save"]').isDisabled();
    });

    test('picking a status, member and milestone saves only those changes', async function (assert) {
        await render(template);

        await click('[data-test-move-status="in_progress"]');
        await click('[data-test-move-open="assignee"]');
        assert.dom('[data-test-move-picker="assignee"]').exists();
        await click('[data-test-move-pick="u2"]');
        assert.dom('[data-test-move-picker]').doesNotExist();
        assert.dom('[data-test-move-value="assignee"]').hasText('Bob');

        await click('[data-test-move-open="milestone"]');
        assert.dom('[data-test-move-picker="milestone"]').exists();
        await click('[data-test-move-pick="m2"]');
        assert.dom('[data-test-move-value="milestone"]').hasText('Sprint 2');

        await click('[data-btn="save"]');
        assert.deepEqual(this.saved, { statusId: '2', status: 'in_progress', assignee: 'u2', milestoneId: 'm2' });
    });

    test('only the changed field is sent', async function (assert) {
        await render(template);

        await click('[data-test-move-open="milestone"]');
        await click('[data-test-move-pick="m2"]');
        await click('[data-btn="save"]');

        assert.deepEqual(this.saved, { milestoneId: 'm2' });
    });
});
