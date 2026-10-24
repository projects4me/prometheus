/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import jQuery from 'jquery';
import AclStub from '../../stub-services/acl-stub';

module('Integration | Component | idea/conversation-box', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:acl', AclStub);
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
});
