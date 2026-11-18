/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/skeleton/page-loading', function (hooks) {
    setupRenderingTest(hooks);

    test('renders the header and body skeleton for loading-assets', async function (assert) {
        await render(hbs`<AppUi::Skeleton::PageLoading @showHeader={{true}} />`);

        assert.dom('[data-test-page-loading]').exists();
        assert.dom('.page-skeleton-header').exists();
    });
});
