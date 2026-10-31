/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { click, fillIn, settled, visit } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import steps from '../steps';

const SECTION = '.user-identities-section';
const PROVIDER_INDEX = { git: 0, github: 1, gitlab: 2, slack: 3, ssh: 4 };

export default function (assert) {
	return steps(assert)
		.given('User has identity "$handle" on "$provider"', async function (handle, provider) {
			server.create('useridentity', { userId: '1', handle, provider });
			await visit('/app/user/1');
			await settled();
			assert.ok(true, `User has identity ${handle} on ${provider}`);
		})
		.when('User opens identity add form', async function () {
			await click('[data-add="user.identities"]');
			assert.ok(true, 'User opened identity add form');
		})
		.when('User selects "$provider" as identity provider', async function (provider) {
			const selectEl = document.querySelector(
				'[data-field="user-identity.provider"] > div.input-group'
			);
			await selectChoose(
				selectEl.querySelector('div'),
				'.ember-power-select-option',
				PROVIDER_INDEX[provider]
			);
			assert.ok(true, `User selected ${provider} as identity provider`);
		})
		.when('User enters "$handle" in identity handle field', async function (handle) {
			await fillIn('[data-field="user-identity.handle"] input', handle);
			assert.ok(true, `User entered ${handle} in identity handle field`);
		})
		.when('User saves identity form', async function () {
			await click(`${SECTION} [data-btn="save"]`);
			await settled();
			assert.ok(true, 'User saved identity form');
		})
		.when('User cancels identity form', async function () {
			await click(`${SECTION} [data-btn="close"]`);
			await settled();
			assert.ok(true, 'User cancelled identity form');
		})
		.then('User identity "$handle" is displayed', function (handle) {
			const el = Array.from(
				document.querySelectorAll(`${SECTION} .user-identity-handle`)
			).find((e) => e.textContent.trim() === handle);
			assert.ok(el, `User identity ${handle} is displayed`);
		})
		.then('User has $count identities', function (count) {
			assert.equal(
				document.querySelectorAll(`${SECTION} .user-identity-item`).length,
				Number(count),
				`User has ${count} identities`
			);
		})
		.then('Identity add form is not visible', function () {
			assert.notOk(
				document.querySelector('[data-user-identities-form]'),
				'Identity add form is not visible'
			);
		});
}
