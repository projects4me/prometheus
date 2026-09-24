/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import steps from '../steps';
import { currentSession } from 'ember-simple-auth/test-support';
import { click, fillIn, settled } from '@ember/test-helpers';

const INACTIVE_SIGN_IN_EMAIL = 'inactive-user@test.local';
const INACTIVE_SIGN_IN_PASSWORD = 'valid-password';

/**
 * #UNCOMMON steps for inactive-user-sign-in.feature only.
 * Do not add these to tests/acceptance/steps/steps.js — they load via
 * tests/acceptance/steps/app/inactive-user-sign-in-steps.js (ember-cli-yadda).
 *
 * @module tests/acceptance/steps/app/inactive-user-sign-in-steps
 */
export default function (assert) {
	return steps(assert)
		.given('User $userId has inactive account with sign-in credentials', async function (userId) {
			let user = server.schema.users.find(parseInt(userId, 10));
			user.update({
				email: INACTIVE_SIGN_IN_EMAIL,
				accountStatus: 'inactive',
			});
			assert.equal(user.accountStatus, 'inactive', `User ${userId} is inactive`);
		})
		.when('User submits sign-in with inactive account credentials', async function () {
			await fillIn('input#email', INACTIVE_SIGN_IN_EMAIL);
			await fillIn('input#password', INACTIVE_SIGN_IN_PASSWORD);
			await click('[data-signin-submit]');
			await settled();
			assert.ok(true, 'User submitted sign-in with inactive account credentials');
		})
		.then('User should not be authenticated', async function () {
			assert.notOk(
				currentSession().isAuthenticated,
				'User should not be authenticated'
			);
		})
		.then('User should see inactive account sign-in error', async function () {
			let errorMessage = document.querySelector(
				'.messenger-message.message-error .messenger-message-inner'
			);
			assert.ok(errorMessage, 'Inactive account error toast should be displayed');
			assert.ok(
				errorMessage.textContent.includes('This account is inactive')
					|| errorMessage.textContent.toLowerCase().includes('inactive'),
				'Error message should describe inactive account'
			);

			if (typeof Messenger !== 'undefined') {
				Messenger().hideAll();
			}
		});
}
