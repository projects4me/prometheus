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

export const given = function () {
	return [
		{
			'Gaia supports the locales "$locales"': (assert) =>
				async function (locales) {
					server.get(translationsUrl(), () => locales.split(','));
					assert.ok(true, this.step);
				}
		},
		{
			'Gaia translates "$key" as "$value" in "$locale"': (assert) =>
				async function (key, value, locale) {
					server.get(translationsUrl(locale), () => nestedDocument(key, value));
					assert.ok(true, this.step);
				}
		},
		{
			'The translations endpoint fails': (assert) =>
				async function () {
					server.get(translationsUrl(), () => new Response(500));
					server.get(translationsUrl(':locale'), () => new Response(500));
					assert.ok(true, this.step);
				}
		},
		{
			'The language of $userName is "$language"': (assert) =>
				async function (userName, language) {
					server.schema.users.find(userName.slice(-1)).update({ language });
					assert.ok(true, this.step);
				}
		}
	];
};

export const then = function () {
	return [
		{
			'The remember me label should read "$label"': (assert) =>
				async function (label) {
					assert.dom(find('[data-signin-form] .checkbox label')).hasText(label);
				}
		},
		{
			'The app locale should be "$locale"': (assert) =>
				async function (locale) {
					assert.strictEqual(this.owner.lookup('service:intl').primaryLocale, locale, this.step);
				}
		}
	];
};

export default function (assert) {
	return steps(assert);
}
