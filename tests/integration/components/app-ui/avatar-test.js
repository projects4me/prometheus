/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, waitUntil } from '@ember/test-helpers';
import { htmlSafe } from '@ember/template';
import { hbs } from 'ember-cli-htmlbars';
import ENV from 'prometheus/config/environment';

// A data URL as the API host, so the user image address (host + /userimage/get/id) loads without a network.
const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==#';

module('Integration | Component | app-ui/avatar', function (hooks) {
    setupRenderingTest(hooks);

    let host;
    hooks.beforeEach(function () {
        host = ENV.api.host;
        ENV.api.host = PIXEL;
    });
    hooks.afterEach(function () {
        ENV.api.host = host;
    });

    test('it shows the user image with the component image class at size m by default', async function (assert) {
        this.set('user', { id: 7, name: 'Ada Lovelace' });
        await render(hbs`<AppUi::Avatar @user={{this.user}} />`);

        assert.dom('[data-test-avatar]').hasAttribute('data-size', 'm');
        assert.dom('[data-test-avatar-image]').hasClass('app-ui-avatar-image');
        assert.dom('[data-test-avatar-image]').hasAttribute('data-image-url', /\/userimage\/get\/7$/);
        assert.dom('[data-test-avatar-image]').hasAttribute('alt', 'Ada Lovelace');
    });

    test('it has the standard sizes, sm as an alias of s and m for unknown values', async function (assert) {
        this.set('user', { id: 1, name: 'Ada' });
        this.set('size', 'xs');
        await render(hbs`<AppUi::Avatar @user={{this.user}} @size={{this.size}} />`);

        let expected = { xs: ['xs', 20], s: ['s', 30], sm: ['s', 30], m: ['m', 40], ml: ['ml', 64], l: ['l', 96], huge: ['m', 40] };
        for (let [size, [name, pixels]] of Object.entries(expected)) {
            this.set('size', size);
            await settled();
            assert.dom('[data-test-avatar]').hasAttribute('data-size', name, `${size} is ${name}`);
            assert.strictEqual(this.element.querySelector('[data-test-avatar]').offsetWidth, pixels, `${size} is ${pixels}px`);
        }
    });

    test('it shows the initials when there is no id', async function (assert) {
        this.set('user', { name: 'Ada Lovelace' });
        await render(hbs`<AppUi::Avatar @user={{this.user}} @size="l" />`);

        assert.dom('[data-test-avatar-image]').doesNotExist();
        assert.dom('[data-test-avatar-text]').hasText('AL');
        assert.dom('[data-test-avatar]').hasAttribute('title', 'Ada Lovelace');
        assert.dom('[data-test-avatar-initials]').hasClass(/app-ui-avatar--c\d/);
        assert.dom('[data-test-avatar-pattern]').hasClass(/app-ui-avatar--a\d/);
    });

    test('it shows the initials when the image fails, the same look for the same user', async function (assert) {
        this.set('user', { id: 7, name: 'Ada Lovelace' });
        await render(hbs`<AppUi::Avatar @user={{this.user}} /><AppUi::Avatar @user={{this.user}} @size="s" />`);
        this.element.querySelector('[data-test-avatar-image]').dispatchEvent(new Event('error'));
        await settled();

        assert.dom('[data-test-avatar-text]').hasText('AL');
        assert.dom('[data-test-avatar-image]').exists({ count: 1 }, 'the other avatar still has its own image');
    });

    test('it shows a user icon when the name is missing', async function (assert) {
        this.set('user', { id: 0 });
        await render(hbs`<AppUi::Avatar @user={{this.user}} />`);

        assert.dom('[data-test-avatar-icon]').exists();
        assert.dom('[data-test-avatar-text]').doesNotExist();
        assert.dom('[data-test-avatar-initials]').hasClass(/app-ui-avatar--c\d/);
    });

    test('an agent with a picture shows it with the robot marker from size s up', async function (assert) {
        this.set('user', { id: 2, name: 'Odysseus', type: 'agent', profilePicture: '/img/pm.png' });
        await render(hbs`<AppUi::Avatar @user={{this.user}} @size="s" /><AppUi::Avatar @user={{this.user}} @size="xs" />`);

        assert.dom('[data-agent-avatar-picture]').exists({ count: 2 });
        assert.dom('[data-test-avatar-marker]').exists({ count: 2 });
        let [small, tiny] = this.element.querySelectorAll('[data-test-avatar-marker]');
        assert.notStrictEqual(getComputedStyle(small).display, 'none', 'visible at s');
        assert.strictEqual(getComputedStyle(tiny).display, 'none', 'hidden at xs');
        assert.dom('[data-test-avatar]').hasAttribute('title', 'Odysseus (agent)');
    });

    test('size ml is 64px for a person, a person without an image and an agent', async function (assert) {
        this.set('person', { id: 1, name: 'Ada' });
        this.set('noImage', { name: 'Grace Hopper' });
        this.set('agent', { id: 2, name: 'Odysseus', type: 'agent', profilePicture: '/img/pm.png' });
        await render(hbs`<AppUi::Avatar @user={{this.person}} @size="ml" /><AppUi::Avatar @user={{this.noImage}} @size="ml" /><AppUi::Avatar @user={{this.agent}} @size="ml" />`);

        for (let avatar of this.element.querySelectorAll('[data-test-avatar]')) {
            assert.strictEqual(avatar.offsetWidth, 64);
            assert.strictEqual(avatar.offsetHeight, 64);
        }
        assert.dom('[data-test-avatar-initials]').exists({ count: 1 });
        assert.notStrictEqual(getComputedStyle(this.element.querySelector('[data-test-avatar-marker]')).display, 'none', 'marker visible');
    });

    test('an agent without a picture shows the robot icon and no marker', async function (assert) {
        this.set('user', { id: 3, name: 'Achilles', type: 'agent' });
        await render(hbs`<AppUi::Avatar @user={{this.user}} @size="l" />`);

        assert.dom('[data-user-agent-avatar] .fa-android').exists();
        assert.dom('[data-test-avatar-initials]').doesNotExist();
        assert.dom('[data-agent-avatar-picture]').doesNotExist();
        assert.dom('[data-test-avatar-marker]').doesNotExist();
    });

    module('@minSize', function (hooks) {
        // Two animation frames, so a pending width report (sent in the next frame) has been applied.
        const frames = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const avatar = () => document.querySelector('[data-test-avatar]');
        const sizedAs = (size) => waitUntil(() => avatar().getAttribute('data-size') === size, { timeout: 2000 });

        hooks.beforeEach(function () {
            this.set('user', { name: 'Ada Lovelace' });
        });

        test('it stays at l when the parent has room for it', async function (assert) {
            this.set('box', htmlSafe('width: 300px'));
            await render(hbs`<div style={{this.box}}><AppUi::Avatar @user={{this.user}} @size="l" @minSize="m" /></div>`);
            await frames();
            await settled();

            assert.dom('[data-test-avatar]').hasAttribute('data-size', 'l');
            assert.dom('[data-test-avatar]').hasClass('app-ui-avatar-l');
            assert.strictEqual(avatar().offsetWidth, 96);
        });

        test('it steps down to ml, then m, and back up as the parent resizes', async function (assert) {
            this.set('box', htmlSafe('width: 80px'));
            await render(hbs`<div style={{this.box}}><AppUi::Avatar @user={{this.user}} @size="l" @minSize="m" /></div>`);
            await sizedAs('ml');
            assert.dom('[data-test-avatar]').hasClass('app-ui-avatar-ml');
            assert.strictEqual(avatar().offsetWidth, 64);

            this.set('box', htmlSafe('width: 50px'));
            await sizedAs('m');
            assert.dom('[data-test-avatar]').hasClass('app-ui-avatar-m');
            assert.strictEqual(avatar().offsetWidth, 40);

            this.set('box', htmlSafe('width: 200px'));
            await sizedAs('l');
            assert.strictEqual(avatar().offsetWidth, 96);
        });

        test('it stays at @minSize when no size fits', async function (assert) {
            this.set('box', htmlSafe('width: 10px'));
            await render(hbs`<div style={{this.box}}><AppUi::Avatar @user={{this.user}} @size="l" @minSize="m" /></div>`);
            await sizedAs('m');
            await frames();
            await settled();

            assert.dom('[data-test-avatar]').hasAttribute('data-size', 'm');
        });

        test('it settles in a parent whose width follows its content', async function (assert) {
            this.set('box', htmlSafe('display: inline-block; max-width: 80px'));
            await render(hbs`<div style={{this.box}} data-test-parent><AppUi::Avatar @user={{this.user}} @size="l" @minSize="m" /></div>`);
            await sizedAs('ml');

            let sizes = [];
            for (let i = 0; i < 5; i++) {
                await frames();
                await settled();
                sizes.push(avatar().getAttribute('data-size'));
            }
            assert.deepEqual(sizes, ['ml', 'ml', 'ml', 'ml', 'ml'], 'the size does not change once settled');
            assert.strictEqual(document.querySelector('[data-test-parent]').offsetWidth, 64);
        });

        test('it does not observe anything without a valid @minSize smaller than @size', async function (assert) {
            let original = window.ResizeObserver;
            let observed = 0;
            window.ResizeObserver = class extends original {
                observe(...args) {
                    observed++;
                    return super.observe(...args);
                }
            };
            try {
                this.set('box', htmlSafe('width: 10px'));
                this.set('minSize', undefined);
                await render(hbs`<div style={{this.box}}><AppUi::Avatar @user={{this.user}} @size="l" @minSize={{this.minSize}} /></div>`);
                for (let minSize of [undefined, 'huge', 'l']) {
                    this.set('minSize', minSize);
                    await frames();
                    await settled();
                    assert.dom('[data-test-avatar]').hasAttribute('data-size', 'l', `@minSize ${minSize} keeps l`);
                }
                assert.strictEqual(observed, 0, 'no ResizeObserver was attached');

                this.set('minSize', 'sm');
                await sizedAs('s');
                assert.strictEqual(observed, 1, 'a valid @minSize (alias sm) attaches one observer');
            } finally {
                window.ResizeObserver = original;
            }
        });
    });
});
