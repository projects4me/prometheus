/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/tag', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders the block as a default label', async function (assert) {
        await render(hbs`<AppUi::Tag data-test-tag>ui</AppUi::Tag>`);

        assert.dom('[data-test-tag]').hasClass('label').hasClass('label-default').hasText('ui');
    });

    test('it takes a variant', async function (assert) {
        await render(hbs`<AppUi::Tag @variant="success" data-test-tag>ok</AppUi::Tag>`);

        assert.dom('[data-test-tag]').hasClass('label-success').doesNotHaveClass('label-default');
    });
});
