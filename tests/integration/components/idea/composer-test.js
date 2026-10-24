/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, settled, triggerKeyEvent, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const EDITABLE = '[data-idea-composer] .tui-editor-contents[contenteditable="true"]';

async function write(text) {
    let editable = document.querySelector(EDITABLE);
    editable.focus();
    document.execCommand('insertText', false, text);
    // toast ui reports changes after a short debounce
    await new Promise(resolve => setTimeout(resolve, 400));
    await settled();
}

module('Integration | Component | idea/composer', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders the editor with a toolbar and no mode switch', async function (assert) {
        this.set('onSend', () => {});
        await render(hbs`<Idea::Composer @onSend={{this.onSend}} />`);

            assert.dom(EDITABLE).exists();
        assert.dom('[data-idea-composer] .te-toolbar-section').exists();
    });

    test('the send button sends the markdown and clears the editor', async function (assert) {
        let sent = [];
        this.set('onSend', body => sent.push(body));
        await render(hbs`<Idea::Composer @onSend={{this.onSend}} />`);

        await write('First thought');
        await click('[data-idea-send]');

        assert.deepEqual(sent, ['First thought']);
        await waitUntil(() => document.querySelector(EDITABLE).textContent.trim() === '');
        assert.dom(EDITABLE).hasText('');
    });

    test('Ctrl+Enter sends and a plain Enter does not', async function (assert) {
        let sent = [];
        this.set('onSend', body => sent.push(body));
        await render(hbs`<Idea::Composer @onSend={{this.onSend}} />`);

        await write('Line');
        await triggerKeyEvent(EDITABLE, 'keydown', 'Enter');
        assert.deepEqual(sent, []);
        await triggerKeyEvent(EDITABLE, 'keydown', 'Enter', { ctrlKey: true });
        assert.deepEqual(sent, ['Line']);
    });

    test('the text is kept when sending fails', async function (assert) {
        this.set('onSend', () => Promise.reject(new Error('failed')));
        await render(hbs`<Idea::Composer @onSend={{this.onSend}} />`);

        await write('Keep me');
        await click('[data-idea-send]');

        assert.dom(EDITABLE).hasText('Keep me');
    });

    test('an empty text is not sent', async function (assert) {
        let sent = [];
        this.set('onSend', body => sent.push(body));
        await render(hbs`<Idea::Composer @onSend={{this.onSend}} />`);

        await click('[data-idea-send]');
        assert.deepEqual(sent, []);
    });

    test('it is disabled when the idea is archived', async function (assert) {
        let sent = [];
        this.set('onSend', body => sent.push(body));
        await render(hbs`<Idea::Composer @onSend={{this.onSend}} @disabled={{true}} />`);

        assert.dom('[data-idea-composer]').hasClass('idea-composer-disabled');
        assert.dom('[data-idea-send]').isDisabled();
        await write('Nope');
        await triggerKeyEvent(EDITABLE, 'keydown', 'Enter', { ctrlKey: true });
        assert.deepEqual(sent, []);
    });
});
