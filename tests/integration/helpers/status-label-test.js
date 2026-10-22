import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | status-label', function (hooks) {
    setupRenderingTest(hooks);

    test('it shows the translated name of the status', async function (assert) {
        await render(hbs`<span>{{status-label "in_progress"}}</span>`);

        assert.dom('span').hasText('In Progress');
    });

    test('it shows the name of a status that has no translation', async function (assert) {
        await render(hbs`<span>{{status-label "on_hold_upstream"}}</span>`);

        assert.dom('span').hasText('on_hold_upstream');
    });
});
