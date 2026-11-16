/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const PALETTE = ['primary', 'info', 'success', 'warning', 'danger'];

module('Integration | Component | app-ui/tag', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders the block as a default tag', async function (assert) {
        await render(hbs`<AppUi::Tag data-test-tag>ui</AppUi::Tag>`);

        assert.dom('[data-test-tag]').hasClass('app-ui-tag').hasClass('app-ui-tag-default').hasText('ui');
    });

    test('it takes a variant', async function (assert) {
        await render(hbs`<AppUi::Tag @variant="success" data-test-tag>ok</AppUi::Tag>`);

        assert.dom('[data-test-tag]').hasClass('app-ui-tag-success').doesNotHaveClass('app-ui-tag-default');
    });

    test('colorKey picks a stable palette variant, and a variant wins', async function (assert) {
        await render(hbs`
            <AppUi::Tag @colorKey="backend" data-test-a>backend</AppUi::Tag>
            <AppUi::Tag @colorKey="backend" data-test-b>backend</AppUi::Tag>
            <AppUi::Tag @colorKey="backend" @variant="danger" data-test-c>backend</AppUi::Tag>
        `);

        const classOf = (selector) => this.element.querySelector(selector).className;
        assert.strictEqual(classOf('[data-test-a]'), classOf('[data-test-b]'));
        const variant = classOf('[data-test-a]')
            .split(' ')
            .find((name) => name.startsWith('app-ui-tag-'));
        assert.true(PALETTE.includes(variant.replace('app-ui-tag-', '')));
        assert.dom('[data-test-c]').hasClass('app-ui-tag-danger');
    });

    test('onRemove shows a labelled button and is called on click', async function (assert) {
        let removed = 0;
        this.remove = () => removed++;
        await render(hbs`<AppUi::Tag @onRemove={{this.remove}}>x</AppUi::Tag>`);

        assert.dom('[data-app-ui-tag-remove]').hasAttribute('aria-label');
        await click('[data-app-ui-tag-remove]');
        assert.strictEqual(removed, 1);
    });

    test('without onRemove there is no button', async function (assert) {
        await render(hbs`<AppUi::Tag>x</AppUi::Tag>`);

        assert.dom('[data-app-ui-tag-remove]').doesNotExist();
    });

    test('the full text is the title', async function (assert) {
        await render(hbs`<AppUi::Tag>a very long tag text</AppUi::Tag>`);

        assert.dom('[data-app-ui-tag-text]').hasAttribute('title', 'a very long tag text');
    });
});
