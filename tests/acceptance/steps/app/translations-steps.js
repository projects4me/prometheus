/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { find } from '@ember/test-helpers';
import { Response } from 'miragejs';
import { translationsUrl } from 'prometheus/mirage/route-handlers/translation';
import steps from '../steps';

/**
 * Builds the nested translation document that holds one dotted key.
 *
 * @param {String} key e.g. `views.signin.remember`
 * @param {String} value
 * @return {Object}
 */
function nestedDocument(key, value) {
	return key.split('.').reduceRight((document, part) => ({ [part]: document }), value);
}

/**
 * #UNCOMMON steps for translations.feature only.
 * Do not add these to tests/acceptance/steps/steps.js — they load via
 * tests/acceptance/steps/app/translations-steps.js (ember-cli-yadda).
 *
 * @module tests/acceptance/steps/app/translations-steps
 */
export default function (assert) {
	return steps(assert)
		.given('Gaia supports the locales "$locales"', async function (locales) {
			server.get(translationsUrl(), () => locales.split(','));
			assert.ok(true, `Gaia supports ${locales}`);
		})
		.given('Gaia translates "$key" as "$value" in "$locale"', async function (key, value, locale) {
			server.get(translationsUrl(locale), () => nestedDocument(key, value));
			assert.ok(true, `Gaia translates ${key} in ${locale}`);
		})
		.given('The translations endpoint fails', async function () {
			server.get(translationsUrl(), () => new Response(500));
			server.get(translationsUrl(':locale'), () => new Response(500));
			assert.ok(true, 'The translations endpoint fails');
		})
		.given('The language of $userName is "$language"', async function (userName, language) {
			server.schema.users.find(userName.slice(-1)).update({ language });
			assert.ok(true, `The language of ${userName} is ${language}`);
		})
		.then('The remember me label should read "$label"', async function (label) {
			assert.dom(find('[data-signin-form] .checkbox label')).hasText(label);
		})
		.then('The app locale should be "$locale"', async function (locale) {
			assert.strictEqual(this.owner.lookup('service:intl').primaryLocale, locale, `The app locale is ${locale}`);
		});
}
