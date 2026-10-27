/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { labelCaption, LABEL_CAPTION_KEY } from 'prometheus/utils/issue-status/caption';

module('Unit | Utility | issue-status/caption', function (hooks) {
    setupTest(hooks);

    hooks.beforeEach(function () {
        this.intl = this.owner.lookup('service:intl');
        this.intl.addTranslations('en-us', { views: { app: { settings: { issueStatuses: { label: 'Label' } } } } });
    });

    test('a caption is built for a locale that was never warmed up', function (assert) {
        this.intl.addTranslations('de-de', { views: { app: { settings: { issueStatuses: { label: 'Bezeichnung' } } } } });

        assert.true(this.intl.exists(LABEL_CAPTION_KEY, 'de-de'));
        assert.strictEqual(labelCaption(this.intl, 'de-de', 'en-us'), 'Bezeichnung');
        assert.strictEqual(labelCaption(this.intl, 'en-us', 'en-us'), 'Label');
    });

    test('a missing translation falls back to the default caption with the locale code', function (assert) {
        assert.strictEqual(labelCaption(this.intl, 'fr-fr', 'en-us'), 'Label (fr-fr)');
    });
});
