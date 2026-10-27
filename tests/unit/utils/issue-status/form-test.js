/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import IssueStatusForm from 'prometheus/utils/issue-status/form';

const LOCALES = ['de-de', 'en-us'];

module('Unit | Utility | issue-status/form', function () {
    test('it has a label per locale, the default locale first and required', function (assert) {
        let form = new IssueStatusForm({ locales: LOCALES, defaultLocale: 'en-us' });

        assert.deepEqual(form.labels.map((field) => field.locale), ['en-us', 'de-de']);
        assert.deepEqual(form.labels.map((field) => field.required), [true, false]);
    });

    test('a new status suggests its value from the default label until the value is typed', function (assert) {
        let form = new IssueStatusForm({ locales: LOCALES, defaultLocale: 'en-us' });

        form.labels[0].text = 'In Review 2!';
        assert.strictEqual(form.name, 'in_review_2');

        form.name = 'QA Ready';
        form.labels[0].text = 'Something else';
        assert.strictEqual(form.name, 'qa_ready');
    });

    test('a saved status keeps its value', function (assert) {
        let form = new IssueStatusForm({
            locales: LOCALES,
            defaultLocale: 'en-us',
            translations: { 'en-us': 'In Progress' },
            value: 'in_progress',
            isNew: false
        });

        form.name = 'changed';
        form.labels[0].text = 'Working';

        assert.false(form.isValueEditable);
        assert.strictEqual(form.name, 'in_progress');
    });

    test('it saves the labels that are filled in', function (assert) {
        let form = new IssueStatusForm({
            locales: LOCALES,
            defaultLocale: 'en-us',
            translations: { 'en-us': ' In Progress ', 'de-de': '  ' }
        });

        assert.strictEqual(form.defaultLabel, 'In Progress');
        assert.deepEqual(form.translations, { 'en-us': 'In Progress' });
    });

    test('it tells whether a label changed since the form was opened', function (assert) {
        let form = new IssueStatusForm({
            locales: LOCALES,
            defaultLocale: 'en-us',
            translations: { 'en-us': 'In Progress' },
            value: 'in_progress',
            isNew: false
        });

        assert.false(form.labelsChanged, 'nothing typed');

        form.labels[0].text = ' In Progress ';
        assert.false(form.labelsChanged, 'the same label');

        form.labels[1].text = 'In Bearbeitung';
        assert.true(form.labelsChanged, 'a label added');

        form.labels[1].text = '';
        form.labels[0].text = 'Working';
        assert.true(form.labelsChanged, 'a label changed');
    });
});
