/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import steps from '../steps';
import { click } from '@ember/test-helpers';

const CREATE_USER_BUTTON = '.user-management [data-btn="create-user"]';

/**
 * Step definitions specific to navigating to user create from user management.
 *
 * @module tests/acceptance/steps/user-management/navigate-to-create-user-from-management-steps
 */
export default function (assert) {
	return steps(assert)
		.then('User should see create user button on management page', function () {
			assert.dom(CREATE_USER_BUTTON).exists('Create user button should be visible on management page');
		})
		.when('User clicks on create user button from management', async function () {
			await click(CREATE_USER_BUTTON);
			assert.ok(true, 'User clicks on create user button from management');
		})
		.then('User should see user create form on create page', function () {
			assert.dom('.user-create').exists('User create page should be rendered');
			assert.dom('.user-create [data-btn="save"]').exists('User create save button should be visible');
		});
}
