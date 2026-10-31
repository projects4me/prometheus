/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, waitUntil } from '@ember/test-helpers';
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
        let shown = [];
        this.set('onShowPlan', id => shown.push(id));
        await render(hbs`<Idea::MessageItem @message={{this.message}} @onShowPlan={{this.onShowPlan}} />`);

        await click('[data-idea-plan-link]');
        assert.deepEqual(shown, ['7']);
    });

    test('a message with screens shows the full image, title and version for each', async function (assert) {
        let preview = this.owner.lookup('service:upload-preview');
        preview.previewUrl = async () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        this.set('message', { id: '5', kind: 'assistant', body: 'Screens', screens: [
            { uploadId: '11', key: 'home', title: 'Home', version: 2, width: 800, height: 600 },
            { uploadId: '12', key: 'board', title: 'Board', version: 1, width: 800, height: 600 }
        ] });
        await render(hbs`<Idea::MessageItem @message={{this.message}} />`);

        assert.dom('[data-idea-screen]').exists({ count: 2 });
        assert.dom('[data-idea-screen="11"] img').hasAttribute('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
        assert.dom('[data-idea-screen="11"] [data-idea-screen-title]').includesText('Home');
        assert.dom('[data-idea-screen="11"] [data-idea-screen-title]').includesText('v2');
    });

    test('a screen whose image cannot load shows the placeholder', async function (assert) {
        let preview = this.owner.lookup('service:upload-preview');
        preview.previewUrl = async () => { throw new Error('no token'); };
        this.set('message', { id: '5', kind: 'assistant', body: 'Screens', screens: [{ uploadId: '11', title: 'Home', version: 1 }] });
        await render(hbs`<Idea::MessageItem @message={{this.message}} />`);

        assert.dom('[data-idea-screen="11"] img').doesNotExist();
        assert.dom('[data-idea-screen="11"] .fa-picture-o').exists();
        assert.dom('[data-idea-screen="11"] [data-idea-screen-title]').includesText('Home');
    });

    test('a screen whose image fails to load falls back to the placeholder', async function (assert) {
        let preview = this.owner.lookup('service:upload-preview');
        preview.previewUrl = async () => '/missing.png';
        this.set('message', { id: '5', kind: 'assistant', body: 'Screens', screens: [{ uploadId: '11', title: 'Home', version: 1 }] });
        await render(hbs`<Idea::MessageItem @message={{this.message}} />`);

        await waitUntil(() => !document.querySelector('[data-idea-screen="11"] img'), { timeout: 3000 });

        assert.dom('[data-idea-screen="11"] img').doesNotExist();
        assert.dom('[data-idea-screen="11"] .fa-picture-o').exists();
    });

    test('clicking a screen opens the full image in a new tab', async function (assert) {
        let preview = this.owner.lookup('service:upload-preview');
        preview.previewUrl = async () => 'http://api/preview/get/tok';
        let tab = { location: {}, close() {} };
        let opened = [];
        let original = window.open;
        window.open = (...args) => { opened.push(args); return tab; };
        try {
            this.set('message', { id: '5', kind: 'assistant', body: 'Screens', screens: [{ uploadId: '11', title: 'Home', version: 1 }] });
            await render(hbs`<Idea::MessageItem @message={{this.message}} />`);
            await click('[data-idea-screen-open]');
        } finally {
            window.open = original;
        }

        assert.deepEqual(opened, [['', '_blank']]);
        assert.strictEqual(tab.location.href, 'http://api/preview/get/tok');
    });

    test('a message without screens shows none', async function (assert) {
        this.set('message', { id: '6', kind: 'assistant', body: 'Plain', screens: [] });
        await render(hbs`<Idea::MessageItem @message={{this.message}} />`);

        assert.dom('[data-idea-screens]').doesNotExist();
    });

    test('an image kept as an upload reference is shown from its address', async function (assert) {
        let preview = this.owner.lookup('service:upload-preview');
        let requested = [];
        preview.previewUrl = async (id) => {
            requested.push(id);
            return `http://api/preview/get/tok-${id}`;
        };
        this.set('message', { id: '7', kind: 'user', body: 'Broken here ![shot.png](upload:42)' });
        await render(hbs`<Idea::MessageItem @message={{this.message}} />`);

        await waitUntil(() => document.querySelector('[data-idea-message-body] img'));
        assert.deepEqual(requested, ['42']);
        assert.dom('[data-idea-message-body] img').hasAttribute('src', 'http://api/preview/get/tok-42', 'the address survives the sanitizer');
        assert.dom('[data-idea-message-body] img').hasAttribute('alt', 'shot.png');
    });

    test('an upload that cannot be read shows its name', async function (assert) {
        let preview = this.owner.lookup('service:upload-preview');
        preview.previewUrl = async () => {
            throw new Error('not found');
        };
        this.set('message', { id: '8', kind: 'user', body: 'Broken here ![shot.png](upload:42)' });
        await render(hbs`<Idea::MessageItem @message={{this.message}} />`);

        assert.dom('[data-idea-message-body]').includesText('Broken here shot.png');
        assert.dom('[data-idea-message-body] img').doesNotExist();
    });

    test('clicking an upload image opens the full size in a new tab', async function (assert) {
        let preview = this.owner.lookup('service:upload-preview');
        let tokens = 0;
        preview.previewUrl = async () => `http://api/preview/get/tok-${++tokens}`;
        let tab = { location: {}, close() {} };
        let opened = [];
        let original = window.open;
        window.open = (...args) => { opened.push(args); return tab; };
        try {
            this.set('message', { id: '9', kind: 'user', body: '![shot.png](upload:42)' });
            await render(hbs`<Idea::MessageItem @message={{this.message}} />`);
            await waitUntil(() => document.querySelector('[data-idea-message-body] img'));
            await click('[data-idea-message-body] img');
        } finally {
            window.open = original;
        }

        assert.deepEqual(opened, [['', '_blank']]);
        assert.strictEqual(tab.location.href, 'http://api/preview/get/tok-2', 'a fresh download address');
    });
});
