import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { addIssueTypeLabels } from 'prometheus/utils/issue-status/label';

module('Integration | Helper | type-label', function (hooks) {
    setupRenderingTest(hooks);

    test('it shows the value of a type that has no translation', async function (assert) {
        await render(hbs`<span>{{type-label "change_request"}}</span>`);

        assert.dom('span').hasText('change_request');
    });

    test('it shows a label as soon as it is added', async function (assert) {
        await render(hbs`<span>{{type-label "change_request"}}</span>`);

        addIssueTypeLabels(this.owner.lookup('service:intl'), 'change_request', { 'en-us': 'Change Request' });
        await settled();

        assert.dom('span').hasText('Change Request');
    });
});
