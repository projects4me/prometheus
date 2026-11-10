import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Service | intl', function (hooks) {
	setupRenderingTest(hooks);

	hooks.beforeEach(function () {
		this.intl = this.owner.lookup('service:intl');
		this.intl.setLocale('en-us');
		this.intl.addTranslations('en-us', { test: { hello: 'Hello' } });
		this.intl.addTranslations('de-de', { test: { hello: 'Hallo' } });
	});

	hooks.afterEach(function () {
		this.intl.setLocale('en-us');
	});

	test('a rendered {{t}} updates after setLocale', async function (assert) {
		await render(hbs`<span>{{t "test.hello"}}</span>`);
		assert.dom('span').hasText('Hello');

		this.intl.setLocale('de-de');
		await settled();

		assert.dom('span').hasText('Hallo');
	});

	test('a rendered {{t}} updates after addTranslations', async function (assert) {
		await render(hbs`<span>{{t "test.hello"}}</span>`);

		this.intl.addTranslations('en-us', { test: { hello: 'Howdy' } });
		await settled();

		assert.dom('span').hasText('Howdy');
	});

	test('<html lang> follows the locale', async function (assert) {
		this.intl.setLocale('de-de');
		await settled();
		assert.strictEqual(document.documentElement.lang, 'de-de');

		this.intl.setLocale('en-us');
		await settled();
		assert.strictEqual(document.documentElement.lang, 'en-us');
	});
});
