import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | agent/avatar', function (hooks) {
    setupRenderingTest(hooks);

    test('it shows the picture of the user when there is one', async function (assert) {
        this.set('user', { name: 'Bot', profilePicture: 'data:image/png;base64,AAAA' });

        await render(hbs`<Agent::Avatar @user={{this.user}} />`);

        assert.dom('[data-agent-avatar-picture]').hasAttribute('src', 'data:image/png;base64,AAAA');
        assert.dom('.fa-android').doesNotExist();
    });

    test('it shows the robot when the user has no picture', async function (assert) {
        this.set('user', { name: 'Bot', profilePicture: '/img/default.png' });

        await render(hbs`<Agent::Avatar @user={{this.user}} />`);

        assert.dom('.fa-android').exists();
        assert.dom('[data-agent-avatar-picture]').doesNotExist();
    });

    test('it shows the robot without a user', async function (assert) {
        await render(hbs`<Agent::Avatar />`);

        assert.dom('.fa-android').exists();
    });
});
