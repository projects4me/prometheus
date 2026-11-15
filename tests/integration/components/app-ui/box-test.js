/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/box', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders all blocks with the default variant', async function (assert) {
        await render(hbs`
            <AppUi::Box>
                <:header><h3 class="box-title">Title</h3></:header>
                <:tools><button type="button">x</button></:tools>
                <:body>Body</:body>
                <:footer>Foot</:footer>
            </AppUi::Box>`);

        assert.dom('[data-test-box]').hasClass('box-primary');
        assert.dom('[data-test-box-header]').hasClass('with-border');
        assert.dom('[data-test-box-header] .box-title').hasText('Title');
        assert.dom('[data-test-box-tools]').hasClass('pull-right');
        assert.dom('[data-test-box-body]').hasText('Body');
        assert.dom('[data-test-box-footer]').hasText('Foot');
    });

    test('it uses the variant and skips missing blocks', async function (assert) {
        await render(hbs`<AppUi::Box @variant="warning"><:body>Only</:body></AppUi::Box>`);

        assert.dom('[data-test-box]').hasClass('box-warning');
        assert.dom('[data-test-box-header]').doesNotExist();
        assert.dom('[data-test-box-footer]').doesNotExist();
        assert.dom('[data-test-box-body]').hasText('Only');
    });

    test('an unknown variant falls back to primary', async function (assert) {
        await render(hbs`<AppUi::Box @variant="nope"><:body>x</:body></AppUi::Box>`);

        assert.dom('[data-test-box]').hasClass('box-primary');
    });

    test('it supports the existing box modifiers', async function (assert) {
        await render(hbs`<AppUi::Box @listView={{true}} @noPadding={{true}} @collapsed={{true}}><:body>x</:body></AppUi::Box>`);

        assert.dom('[data-test-box]').hasClass('list-view');
        assert.dom('[data-test-box]').hasClass('collapsed-box');
        assert.dom('[data-test-box-body]').hasClass('no-padding');
    });

    test('it yields top and bottom between the parts', async function (assert) {
        await render(hbs`<AppUi::Box><:top><i data-t="top"></i></:top><:body>x</:body><:bottom><i data-t="bottom"></i></:bottom></AppUi::Box>`);

        assert.dom('[data-t="top"]').exists();
        assert.dom('[data-t="bottom"]').exists();
    });
});
