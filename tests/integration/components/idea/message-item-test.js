/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import CurrentUserStub from '../../stub-services/current-user-stub';

module('Integration | Component | idea/message-item', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:currentUser', CurrentUserStub);
    });

    test('a user message is a comment with markdown', async function (assert) {
        this.set('message', { id: '1', kind: 'user', body: '**bold** text', createdUser: '1', createdUserName: 'User 1', dateCreated: '2026-01-01 10:00:00' });
        await render(hbs`<Idea::MessageItem @message={{this.message}} />`);

        assert.dom('.box-comment[data-idea-message="1"]').exists();
        assert.dom('[data-idea-message-body] strong').hasText('bold');
    });

    test('script content is not executed', async function (assert) {
        window.ideaXss = false;
        this.set('message', { id: '1', kind: 'user', body: '<script>window.ideaXss = true;</script><img src=x onerror="window.ideaXss = true">' });
        await render(hbs`<Idea::MessageItem @message={{this.message}} />`);

        assert.false(window.ideaXss, 'nothing ran');
        assert.dom('[data-idea-message-body] script').doesNotExist();
        assert.dom('[data-idea-message-body] [onerror]').doesNotExist();
    });

    test('system and error messages are compact notices', async function (assert) {
        this.set('message', { id: '2', kind: 'error', body: 'It failed' });
        await render(hbs`<Idea::MessageItem @message={{this.message}} />`);

        assert.dom('.idea-message-notice[data-kind="error"]').exists();
        assert.dom('.box-comment').doesNotExist();
    });

    test('steps are collapsed until toggled', async function (assert) {
        this.set('message', { id: '3', kind: 'assistant', body: 'Done', steps: ['Read', 'Wrote'] });
        await render(hbs`<Idea::MessageItem @message={{this.message}} />`);

        assert.dom('[data-idea-steps]').doesNotExist();
        await click('[data-idea-steps-toggle]');
        assert.dom('[data-idea-steps] li').exists({ count: 2 });
    });

    test('a message with a plan links to it', async function (assert) {
        this.set('message', { id: '4', kind: 'assistant', body: 'Plan', ideaplanId: '7' });
        await render(hbs`<Idea::MessageItem @message={{this.message}} />`);

        assert.dom('[data-idea-plan-link]').hasAttribute('href', '#ideaplan-7');
    });
});
