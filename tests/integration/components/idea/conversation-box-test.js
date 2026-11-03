/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, settled, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import jQuery from 'jquery';
import AclStub from '../../stub-services/acl-stub';
import CurrentUserStub from '../../stub-services/current-user-stub';

module('Integration | Component | idea/conversation-box', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:acl', AclStub);
        this.owner.register('service:currentUser', CurrentUserStub);
        this.set('idea', { title: 'An idea', status: 'new' });
        this.set('messages', []);
        this.set('noop', () => {});
    });

    hooks.afterEach(function () {
        jQuery('.modal-backdrop').remove();
        jQuery('body').removeClass('modal-open');
    });

    test('the archive modal closes after confirming', async function (assert) {
        let toggled = 0;
        this.set('onToggleArchive', () => { toggled++; });
        await render(hbs`<Idea::ConversationBox @idea={{this.idea}} @messages={{this.messages}}
            @onToggleArchive={{this.onToggleArchive}} @onRefresh={{this.noop}} @onSend={{this.noop}} @onRename={{this.noop}} />`);

        await click('[data-idea-archive]');
        assert.dom('[data-idea-archive-confirm]').exists();

        await click('.modal .btn-primary');
        await waitUntil(() => !document.querySelector('[data-idea-archive-confirm]'), { timeout: 2000 });

        assert.strictEqual(toggled, 1);
        assert.dom('.modal').doesNotExist('closed through hidden.bs.modal, so the modal is removed');
    });

    test('a working message only shows while it is the last message', async function (assert) {
        this.set('messages', [
            { id: '0', kind: 'system', body: 'Agent Nestor is working on it.', createdUserName: 'Agent Nestor', dateCreated: '2026-01-01 09:00:00' },
            { id: '1', kind: 'working', body: 'Agent Nestor is working on it.', createdUserName: 'Agent Nestor', dateCreated: '2026-01-01 10:00:00' },
            { id: '2', kind: 'assistant', body: 'Done', createdUserName: 'Agent Nestor', dateCreated: '2026-01-01 10:01:00' },
            { id: '3', kind: 'working', body: 'Agent Nestor is working on it.', createdUserName: 'Agent Nestor', dateCreated: '2026-01-01 10:02:00' }
        ]);
        await render(hbs`<Idea::ConversationBox @idea={{this.idea}} @messages={{this.messages}}
            @onToggleArchive={{this.noop}} @onRefresh={{this.noop}} @onSend={{this.noop}} @onRename={{this.noop}} />`);

        assert.dom('[data-idea-working]').exists({ count: 1 });
        assert.dom('[data-idea-message="3"]').exists();
        assert.dom('[data-idea-message="1"]').doesNotExist();
        assert.dom('[data-idea-message="0"]').doesNotExist('a legacy working message is hidden too');

        this.set('messages', [...this.messages, { id: '4', kind: 'assistant', body: 'Reply', createdUserName: 'Agent Nestor', dateCreated: '2026-01-01 10:03:00' }]);
        await settled();
        assert.dom('[data-idea-working]').doesNotExist();
    });
});
