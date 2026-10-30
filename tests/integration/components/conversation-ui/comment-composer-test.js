/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, settled, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import CurrentUserStub from '../../stub-services/current-user-stub';

const EDITABLE = '.message-box .tui-editor-contents[contenteditable="true"]';
const POST = '.message-box button.btn-primary';

async function write(text) {
    let editable = document.querySelector(EDITABLE);
    editable.focus();
    document.execCommand('insertText', false, text);
    // toast ui reports changes after a short debounce
    await new Promise(resolve => setTimeout(resolve, 400));
    await settled();
}

/**
 * A save that the test resolves or rejects, recording what it was called with
 */
function deferredSave(calls) {
    return (entity, content) => new Promise((resolve, reject) => {
        calls.push({ entity, content, resolve, reject });
    });
}

module('Integration | Component | conversation-ui/comment-composer', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:currentUser', CurrentUserStub);
    });

    test('posting clears the editor and shows the comment as pending until it is saved', async function (assert) {
        let calls = [];
        this.set('save', deferredSave(calls));
        await render(hbs`<ConversationUi::CommentComposer @entity="room-1" @save={{this.save}} />`);

        await write('Hello there');
        await click(POST);

        assert.strictEqual(calls.length, 1, 'the comment is saved');
        assert.strictEqual(calls[0].entity, 'room-1');
        assert.ok(calls[0].content.includes('Hello there'));
        await waitUntil(() => document.querySelector(EDITABLE).textContent.trim() === '');
        assert.dom(EDITABLE).hasText('', 'the editor is cleared before the save ends');
        assert.dom('[data-pending-comment="posting"]').exists({ count: 1 });
        assert.dom('[data-pending-comment="posting"] .comment-text').includesText('Hello there');
        assert.dom('[data-pending-comment="posting"] .comment-posting-dots').exists();

        calls[0].resolve();
        await settled();
        await waitUntil(() => !document.querySelector('[data-pending-comment]'));
        assert.dom('[data-pending-comment]').doesNotExist('the pending comment goes once it is saved');
    });

    test('a comment that was not saved stays, and can be retried', async function (assert) {
        let calls = [];
        this.set('save', deferredSave(calls));
        await render(hbs`<ConversationUi::CommentComposer @entity="room-1" @save={{this.save}} />`);

        await write('Try again');
        await click(POST);
        calls[0].reject(new Error('offline'));
        await waitUntil(() => document.querySelector('[data-pending-comment="failed"]'));

        assert.dom('[data-pending-comment="failed"] .comment-text').includesText('Try again', 'the text is kept');
        assert.dom('[data-pending-comment="failed"] [data-btn="retry"]').exists();

        await click('[data-btn="retry"]');
        await waitUntil(() => calls.length === 2);
        assert.dom('[data-pending-comment="posting"]').exists('it is posting again');
        assert.ok(calls[1].content.includes('Try again'));

        calls[1].resolve();
        await waitUntil(() => !document.querySelector('[data-pending-comment]'));
        assert.dom('[data-pending-comment]').doesNotExist();
    });

    test('a comment that was not saved can be discarded', async function (assert) {
        let calls = [];
        this.set('save', deferredSave(calls));
        await render(hbs`<ConversationUi::CommentComposer @entity="room-1" @save={{this.save}} />`);

        await write('Drop me');
        await click(POST);
        calls[0].reject(new Error('offline'));
        await waitUntil(() => document.querySelector('[data-pending-comment="failed"]'));

        await click('[data-btn="discard"]');
        assert.dom('[data-pending-comment]').doesNotExist();
        assert.strictEqual(calls.length, 1, 'it is not saved again');
    });

    test('comments posted one after the other are saved in order', async function (assert) {
        let calls = [];
        this.set('save', deferredSave(calls));
        await render(hbs`<ConversationUi::CommentComposer @entity="room-1" @save={{this.save}} />`);

        await write('First');
        await click(POST);
        await waitUntil(() => document.querySelector(EDITABLE).textContent.trim() === '');
        await write('Second');
        await click(POST);

        assert.dom('[data-pending-comment="posting"]').exists({ count: 2 });
        assert.strictEqual(calls.length, 1, 'the second waits for the first');

        calls[0].resolve();
        await waitUntil(() => calls.length === 2);
        assert.ok(calls[1].content.includes('Second'));
        assert.dom('[data-pending-comment="posting"]').exists({ count: 1 });
    });
});
