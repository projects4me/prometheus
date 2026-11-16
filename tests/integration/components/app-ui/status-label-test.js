/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/status-label', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders the label and the status class', async function (assert) {
        this.set('status', 'inprogress');

        await render(hbs`<AppUi::StatusLabel @status={{this.status}} data-test-status />`);

        assert.dom('[data-test-status]').hasClass('badge');
        assert.dom('[data-test-status]').hasClass('inprogress');
        assert.dom('[data-test-status]').hasText(/\S/);
    });

    test('it paints the status colour from the store', async function (assert) {
        this.owner.lookup('service:store').push({
            data: { id: '1', type: 'issuestatus', attributes: { name: 'done', color: '#00a65a' } }
        });

        await render(hbs`<AppUi::StatusLabel @status="done" data-test-status />`);

        assert.dom('[data-test-status]').hasAttribute('style', /background-color/);
    });

    test('it follows a changed status', async function (assert) {
        this.set('status', 'new');
        await render(hbs`<AppUi::StatusLabel @status={{this.status}} data-test-status />`);
        assert.dom('[data-test-status]').hasClass('new');

        this.set('status', 'done');
        assert.dom('[data-test-status]').hasClass('done').doesNotHaveClass('new');
    });
});
