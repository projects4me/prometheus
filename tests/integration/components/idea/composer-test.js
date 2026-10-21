/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render, triggerKeyEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | idea/composer', function (hooks) {
    setupRenderingTest(hooks);

    test('the send button sends the text and clears it', async function (assert) {
        let sent = [];
        this.set('onSend', body => sent.push(body));
        await render(hbs`<Idea::Composer @onSend={{this.onSend}} />`);

        await fillIn('[data-idea-composer] textarea', 'First thought');
        await click('[data-idea-send]');

        assert.deepEqual(sent, ['First thought']);
        assert.dom('[data-idea-composer] textarea').hasValue('');
    });

    test('Enter sends and Shift+Enter does not', async function (assert) {
        let sent = [];
        this.set('onSend', body => sent.push(body));
        await render(hbs`<Idea::Composer @onSend={{this.onSend}} />`);

        await fillIn('[data-idea-composer] textarea', 'Line');
        await triggerKeyEvent('[data-idea-composer] textarea', 'keydown', 'Enter', { shiftKey: true });
        assert.deepEqual(sent, []);
        await triggerKeyEvent('[data-idea-composer] textarea', 'keydown', 'Enter');
        assert.deepEqual(sent, ['Line']);
    });

    test('an empty text is not sent', async function (assert) {
        let sent = [];
        this.set('onSend', body => sent.push(body));
        await render(hbs`<Idea::Composer @onSend={{this.onSend}} />`);

        await click('[data-idea-send]');
        assert.deepEqual(sent, []);
    });

    test('it is disabled when the idea is archived', async function (assert) {
        this.set('onSend', () => {});
        await render(hbs`<Idea::Composer @onSend={{this.onSend}} @disabled={{true}} />`);

        assert.dom('[data-idea-composer] textarea').isDisabled();
        assert.dom('[data-idea-send]').isDisabled();
    });
});
