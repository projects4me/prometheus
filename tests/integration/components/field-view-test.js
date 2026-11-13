/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | field-view', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders the field value as plain text', async function (assert) {
        this.set('definition', { type: 'text', size: 'col-md-4' });
        this.set('entity', { name: 'Apollo' });

        await render(hbs`<FieldView @definition={{this.definition}} @model={{this.entity}} @field="name" />`);

        assert.dom('div.col-md-4 span').hasText('Apollo');
        assert.dom('a').doesNotExist();
    });

    test('it renders a link that navigates when the field is a link', async function (assert) {
        this.set('definition', { type: 'text', link: true });
        this.set('entity', { name: 'Apollo' });
        this.set('navigate', () => assert.step('navigate'));

        await render(hbs`<FieldView @definition={{this.definition}} @model={{this.entity}} @field="name" @navigate={{this.navigate}} />`);
        await click('a');

        assert.dom('a').hasText('Apollo');
        assert.verifySteps(['navigate']);
    });

    test('it formats datetime fields', async function (assert) {
        this.set('definition', { type: 'datetime' });
        this.set('entity', { dateCreated: '2026-11-13 10:00:00' });

        await render(hbs`<FieldView @definition={{this.definition}} @model={{this.entity}} @field="dateCreated" />`);

        assert.dom('span').doesNotHaveTextContaining('2026-11-13');
        assert.dom('span').hasTextContaining('Nov');
    });
});
