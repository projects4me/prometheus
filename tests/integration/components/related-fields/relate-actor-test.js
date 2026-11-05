/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | related-fields/relate-actor', function (hooks) {
    setupRenderingTest(hooks);

    test('an agent option carries the relate-agent class so its avatar is sized like the user picker', async function (assert) {
        this.set('data', { kind: 'agent', value: '1', label: 'Helper' });
        await render(hbs`<RelatedFields::RelateActor @data={{this.data}} />`);

        assert.dom('span.relate-user.relate-agent').exists();
        assert.dom('[data-agent-avatar]').exists();
        assert.dom('span.username').hasText('Helper');
    });

    test('a user option does not get the relate-agent class', async function (assert) {
        this.set('data', { kind: 'user', value: '2', label: 'Hammad' });
        await render(hbs`<RelatedFields::RelateActor @data={{this.data}} />`);

        assert.dom('span.relate-user').exists();
        assert.dom('span.relate-agent').doesNotExist();
        assert.dom('img.user-relate-icon').exists();
    });

    test('an agent with a picture shows it', async function (assert) {
        this.set('data', {
            kind: 'agent', label: 'Bot', value: '1',
            user: { name: 'Bot', profilePicture: 'data:image/png;base64,AAAA' }
        });

        await render(hbs`<RelatedFields::RelateActor @data={{this.data}} />`);

        assert.dom('[data-agent-avatar-picture]').hasAttribute('src', 'data:image/png;base64,AAAA');
        assert.dom('.fa-android').doesNotExist();
    });

    test('an agent without a picture shows the robot', async function (assert) {
        this.set('data', { kind: 'agent', label: 'Bot', value: '1', user: { name: 'Bot', profilePicture: '/img/default.png' } });

        await render(hbs`<RelatedFields::RelateActor @data={{this.data}} />`);

        assert.dom('.fa-android').exists();
        assert.dom('[data-agent-avatar-picture]').doesNotExist();
    });
});
