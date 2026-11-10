/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import steps from '../steps';
import { click, currentURL, getContext, visit } from '@ember/test-helpers';

/**
 * #UNCOMMON steps for auth-status.feature only.
 *
 * @module tests/acceptance/steps/app/auth-status-steps
 */
export default function (assert) {
	return steps(assert)
		.when('User visits the auth status page', async function () {
			await visit('/auth-status');
			assert.ok(true, 'User visited the auth status page');
		})
		.when('User clicks clear session on the auth status page', async function () {
			// Seed the keys the button must remove, and stop the real page reload.
			localStorage.setItem('ember_simple_auth-session', '{"authenticated":{}}');
			localStorage.setItem('prometheus_oauth_token_refresh_lock', '1');
			getContext().owner.lookup('controller:auth-status')._goToSignin = () => {};
			await click('[data-auth-status-action="clear-session"]');
			assert.ok(true, 'User clicked clear session');
		})
		.then('User should be on the auth status page', async function () {
			assert.equal(currentURL(), '/auth-status', 'URL is /auth-status');
		})
		.then('Auth status should show authenticated "$value"', async function (value) {
			assert.equal(
				document.querySelector('[data-auth-status="authenticated"]').textContent.trim(),
				value,
				`Authenticated shows ${value}`
			);
		})
		.then('The stored session should be empty', async function () {
			assert.strictEqual(localStorage.getItem('ember_simple_auth-session'), null, 'Session key removed');
			assert.strictEqual(localStorage.getItem('prometheus_oauth_token_refresh_lock'), null, 'Lock key removed');
		});
}
