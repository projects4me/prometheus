import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { addIssueStatusLabels } from 'prometheus/utils/issue-status/label';

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

    test('it shows a label as soon as it is added', async function (assert) {
        await render(hbs`<span>{{status-label "on_hold_upstream"}}</span>`);

        addIssueStatusLabels(this.owner.lookup('service:intl'), 'on_hold_upstream', { 'en-us': 'On Hold Upstream' });
        await settled();

        assert.dom('span').hasText('On Hold Upstream');
    });
});
