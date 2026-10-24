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

function pasteImage() {
    let data = new DataTransfer();
    data.items.add(new File([new Uint8Array(10)], 'shot.png', { type: 'image/png' }));
    document.querySelector(EDITABLE).dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
}

async function paste() {
    pasteImage();
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

    test('a pasted image is uploaded to the idea, shown in the editor and sent as its upload reference', async function (assert) {
        let uploads = [];
        let imageUpload = this.owner.lookup('service:image-upload');
        imageUpload.upload = async (blob, relatedTo, relatedId) => {
            uploads.push([blob.name, relatedTo, relatedId]);
            return { reference: 'upload:42', name: 'shot.png' };
        };
        let sent = [];
        this.set('onSend', body => sent.push(body));
        await render(hbs`<Idea::Composer @ideaId="7" @onSend={{this.onSend}} />`);

        await write('Look ');
        await paste();

        assert.deepEqual(uploads, [['shot.png', 'idea', '7']]);
        assert.dom(`${EDITABLE} img`).exists();
        await click('[data-idea-send]');
        assert.strictEqual(sent.length, 1);
        assert.ok(sent[0].includes('![shot.png](upload:42)'), sent[0]);
        assert.notOk(/data:|blob:/.test(sent[0]), 'no data or local address in the body');
    });

    test('the upload is shown in progress and sending waits for it', async function (assert) {
        let finish;
        let imageUpload = this.owner.lookup('service:image-upload');
        imageUpload.upload = () => new Promise(resolve => { finish = resolve; });
        this.set('onSend', () => {});
        await render(hbs`<Idea::Composer @ideaId="7" @onSend={{this.onSend}} />`);

        await write('Look ');
        pasteImage();
        await waitUntil(() => document.querySelector('[data-idea-image-uploading]'));

        assert.dom('[data-idea-send]').isDisabled();
        finish({ reference: 'upload:42', name: 'shot.png' });
        await waitUntil(() => !document.querySelector('[data-idea-image-uploading]'));
        assert.dom('[data-idea-send]').isNotDisabled();
    });

    test('an upload that ends after the composer is gone is ignored', async function (assert) {
        let finish;
        let imageUpload = this.owner.lookup('service:image-upload');
        imageUpload.upload = () => new Promise(resolve => { finish = resolve; });
        let createObjectURL = URL.createObjectURL;
        let created = 0;
        URL.createObjectURL = (blob) => {
            created++;
            return createObjectURL(blob);
        };
        this.set('onSend', () => {});
        this.set('show', true);
        try {
            await render(hbs`{{#if this.show}}<Idea::Composer @ideaId="7" @onSend={{this.onSend}} />{{/if}}`);

            pasteImage();
            await waitUntil(() => document.querySelector('[data-idea-image-uploading]'));
            this.set('show', false);
            await settled();
            finish({ reference: 'upload:42', name: 'shot.png' });
            await new Promise(resolve => setTimeout(resolve, 50));
            await settled();

            assert.strictEqual(created, 0, 'no local file is kept for the destroyed composer');
        } finally {
            URL.createObjectURL = createObjectURL;
        }
    });

    test('a failed upload is reported and the text is kept', async function (assert) {
        let imageUpload = this.owner.lookup('service:image-upload');
        imageUpload.upload = async () => {
            let error = new Error('failed');
            error.reason = 'upload';
            throw error;
        };
        this.set('onSend', () => {});
        await render(hbs`<Idea::Composer @ideaId="7" @onSend={{this.onSend}} />`);

        await write('Keep me');
        await paste();

        assert.dom('[data-idea-composer] .error').hasText('The image could not be uploaded, please try again');
        assert.dom(EDITABLE).hasText('Keep me');
        assert.dom(`${EDITABLE} img`).doesNotExist();
    });
});
