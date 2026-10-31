/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const PIXEL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

module('Integration | Component | idea/message-screen', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.set('screen', { uploadId: '11', title: 'Home', version: 2 });
    });

    test('a click opens the screen in a modal, not a new tab, and Close removes it', async function (assert) {
        let calls = 0;
        let preview = this.owner.lookup('service:upload-preview');
        preview.previewUrl = async () => PIXEL + '#' + (++calls);
        let opened = [];
        let original = window.open;
        window.open = (...args) => { opened.push(args); return null; };

        try {
            await render(hbs`<ul><Idea::MessageScreen @screen={{this.screen}} /></ul>`);
            assert.dom('.idea-screen-modal').doesNotExist('closed at first');

            await click('[data-idea-screen-open]');
            await waitUntil(() => document.querySelector('[data-idea-screen-preview-image]'), { timeout: 3000 });

            assert.dom('.idea-screen-modal [data-idea-screen-preview-image]').hasAttribute('src', PIXEL + '#2', 'a fresh address for the modal');
            assert.dom('[data-idea-screen-preview-title]').includesText('Home');
            assert.dom('[data-idea-screen-preview-title]').includesText('v2');
            assert.dom('.idea-screen-modal [data-btn="save"]').doesNotExist('only Close');
            assert.strictEqual(opened.length, 0, 'no new tab');

            await click('.idea-screen-modal [data-btn="cancel"]');
            await waitUntil(() => !document.querySelector('.idea-screen-modal'), { timeout: 3000 });
            assert.dom('.idea-screen-modal').doesNotExist();
        } finally {
            window.open = original;
        }
    });

    test('a failed token shows the placeholder and a message in the modal', async function (assert) {
        let calls = 0;
        let preview = this.owner.lookup('service:upload-preview');
        preview.previewUrl = async () => {
            if (++calls === 1) {
                return PIXEL;
            }
            throw new Error('no token');
        };

        await render(hbs`<ul><Idea::MessageScreen @screen={{this.screen}} /></ul>`);
        await click('[data-idea-screen-open]');
        await waitUntil(() => document.querySelector('[data-idea-screen-preview-failed]'), { timeout: 3000 });

        assert.dom('.idea-screen-modal .fa-picture-o').exists();
        assert.dom('[data-idea-screen-preview-image]').doesNotExist();
        assert.dom('[data-idea-screen-preview-failed]').includesText('could not be loaded');
    });
});
