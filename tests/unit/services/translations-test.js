/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'miragejs';
import { translationsUrl } from 'prometheus/mirage/route-handlers/translation';

const STATUS_KEY = 'views.app.issue.lists.status.in_progress';

module('Unit | Service | translations', function (hooks) {
	setupTest(hooks);
	setupMirage(hooks);

	hooks.beforeEach(function () {
		this.service = this.owner.lookup('service:translations');
		this.intl = this.owner.lookup('service:intl');
	});

	test('a backend translation overrides the static one', async function (assert) {
		this.server.get(translationsUrl('en-us'), () => ({
			views: { app: { issue: { lists: { status: { in_progress: 'Doing' } } } } }
		}));

		await this.service.load();

		assert.strictEqual(this.intl.primaryLocale, 'en-us');
		assert.strictEqual(this.intl.t(STATUS_KEY), 'Doing');
		assert.strictEqual(this.intl.t('views.signin.remember'), 'Remember Me', 'keys the backend leaves out keep the static value');
	});

	test('the supported locales come from the backend', async function (assert) {
		this.server.get(translationsUrl(), () => ['en-us', 'de-de']);

		await this.service.load();

		assert.deepEqual(this.service.locales, ['en-us', 'de-de']);
	});

	test('a failing endpoint keeps the static en-us translations', async function (assert) {
		this.server.get(translationsUrl(), () => new Response(500));
		this.server.get(translationsUrl(':locale'), () => new Response(500));

		await this.service.load();

		assert.strictEqual(this.intl.primaryLocale, 'en-us');
		assert.strictEqual(this.intl.t(STATUS_KEY), 'In Progress');
		assert.deepEqual(this.service.locales, ['en-us']);
	});

	test('a user with a supported language gets that locale', async function (assert) {
		this.server.get(translationsUrl(), () => ['en-us', 'de-de']);
		this.server.get(translationsUrl('de-de'), () => ({
			views: { app: { issue: { lists: { status: { in_progress: 'In Bearbeitung' } } } } }
		}));
		await this.service.load();

		await this.service.useLanguageOf({ language: 'de' });

		assert.strictEqual(this.intl.primaryLocale, 'de-de');
		assert.strictEqual(this.intl.t(STATUS_KEY), 'In Bearbeitung');
	});

	test('a user with an unsupported or empty language gets en-us', async function (assert) {
		await this.service.load();

		await this.service.useLanguageOf({ language: 'fr' });
		assert.strictEqual(this.intl.primaryLocale, 'en-us', 'unsupported language');

		await this.service.useLanguageOf({ language: '' });
		assert.strictEqual(this.intl.primaryLocale, 'en-us', 'empty language');

		await this.service.useLanguageOf(null);
		assert.strictEqual(this.intl.primaryLocale, 'en-us', 'no user');
	});

	test('a supported locale whose translations fail to load falls back to en-us', async function (assert) {
		this.server.get(translationsUrl(), () => ['en-us', 'de-de']);
		this.server.get(translationsUrl('de-de'), () => new Response(500));
		await this.service.load();

		await this.service.useLanguageOf({ language: 'de-de' });

		assert.strictEqual(this.intl.primaryLocale, 'en-us');
	});

	test('a language matches the exact locale first, then its language', function (assert) {
		this.service.locales = ['en-us', 'en-gb', 'de-de'];

		assert.strictEqual(this.service.localeFor('en-gb'), 'en-gb');
		assert.strictEqual(this.service.localeFor('EN'), 'en-us');
		assert.strictEqual(this.service.localeFor('de-at'), 'de-de');
		assert.strictEqual(this.service.localeFor('ur'), 'en-us');
	});

	test('Mirage serves the locales and 404s an unsupported locale', async function (assert) {
		let locales = await (await fetch(translationsUrl())).json();
		let unsupported = await fetch(translationsUrl('xx-xx'));

		assert.deepEqual(locales, ['en-us']);
		assert.strictEqual(unsupported.status, 404);
	});
});
