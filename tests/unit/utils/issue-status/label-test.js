import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
    addLabels,
    issueStatusLabel,
    issueTypeLabel,
    issueTypeRecordLabel,
    ISSUE_STATUS_LABEL_PATH,
    ISSUE_TYPE_LABEL_PATH,
    valueLabel
} from 'prometheus/utils/issue-status/label';

module('Unit | Utility | issue-status/label', function (hooks) {
    setupTest(hooks);

    test('statuses and types keep their labels under their own path', function (assert) {
        let intl = this.owner.lookup('service:intl');

        addLabels(intl, ISSUE_TYPE_LABEL_PATH, 'review', { 'en-us': 'Type Review' });
        addLabels(intl, ISSUE_STATUS_LABEL_PATH, 'review', { 'en-us': 'Status Review' });

        assert.strictEqual(issueTypeLabel(intl, 'review'), 'Type Review');
        assert.strictEqual(issueStatusLabel(intl, 'review'), 'Status Review');
    });

    test('a value without a label shows the value', function (assert) {
        let intl = this.owner.lookup('service:intl');

        assert.strictEqual(valueLabel(intl, ISSUE_TYPE_LABEL_PATH, 'no_such_type'), 'no_such_type');
        assert.strictEqual(valueLabel(intl, ISSUE_TYPE_LABEL_PATH, undefined), '');
    });

    test('a type record shows its saved label, then the translated name, then the value', function (assert) {
        let intl = this.owner.lookup('service:intl');
        addLabels(intl, ISSUE_TYPE_LABEL_PATH, 'story', { 'en-us': 'Story' });

        assert.strictEqual(issueTypeRecordLabel(intl, { name: 'story', translations: { 'en-us': 'User Story' } }), 'User Story');
        assert.strictEqual(issueTypeRecordLabel(intl, { name: 'story' }), 'Story');
        assert.strictEqual(issueTypeRecordLabel(intl, { name: 'other' }), 'other');
    });
});
